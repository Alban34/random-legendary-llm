import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { formatHistorySummary } from '../src/app/history-utils.ts';
import {
  GAME_OUTCOME_OPTIONS,
  createCompletedGameResult,
  createPerPlayerScoreArray,
  createPlayerScoreEntry,
  formatGameResultStatus,
  normalizeGameResultDraft,
  sanitizeStoredGameResult,
  validateGameResultDraft
} from '../src/app/result-utils.ts';
import {
  STORAGE_KEY,
  acceptGameSetup,
  createDefaultState,
  createStorageAdapter,
  loadState,
  saveState,
  updateGameResult
} from '../src/app/state-store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function createMemoryStorage(initialEntries = {}) {
  const store = new Map(Object.entries(initialEntries));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

function createSampleSetup(offset = 0) {
  const runtime = bundle.runtime.indexes;
  return {
    id: `epic12-game-${offset}`,
    createdAt: `2026-04-10T12:00:0${offset}.000Z`,
    playerCount: offset % 2 === 0 ? 1 : 2,
    advancedSolo: false,
    setupSnapshot: {
      mastermindId: runtime.allMasterminds[offset].id,
      schemeId: runtime.allSchemes[offset].id,
      heroIds: runtime.allHeroes.slice(offset, offset + 3).map((entity) => entity.id),
      villainGroupIds: [runtime.allVillainGroups[offset].id],
      henchmanGroupIds: [runtime.allHenchmanGroups[offset].id]
    }
  };
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Accepted setups start as pending results and legacy records hydrate safely', () => {

  const acceptedState = acceptGameSetup(createDefaultState(), createSampleSetup(0));
  assert.equal(acceptedState.history[0].result.status, 'pending');
  assert.equal(formatHistorySummary(acceptedState.history[0], bundle.runtime.indexes).resultLabel, 'Pending result');

  const legacyState = createDefaultState();
  legacyState.history = [{
    id: 'legacy-no-result',
    createdAt: '2026-04-10T10:00:00.000Z',
    playerCount: 1,
    advancedSolo: false,
    setupSnapshot: createSampleSetup(1).setupSnapshot
  }];

  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify(legacyState)
  });
  const loaded = loadState({
    storageAdapter: createStorageAdapter(storage),
    indexes: bundle.runtime.indexes
  });

  assert.equal(loaded.state.history[0].result.status, 'pending');
  assert.equal(formatHistorySummary(loaded.state.history[0], bundle.runtime.indexes).resultLabel, 'Pending result');
});

test('Rejects invalid result combinations and recovers malformed stored results to pending', () => {

  const acceptedState = acceptGameSetup(createDefaultState(), createSampleSetup(0));

  assert.throws(() => updateGameResult(acceptedState, {
    recordId: acceptedState.history[0].id,
    outcome: 'win',
    score: -5,
    notes: 'bad score'
  }), /whole-number score/i);

  const malformedState = createDefaultState();
  malformedState.history = [{
    ...createSampleSetup(1),
    result: {
      status: 'completed',
      outcome: 'win',
      score: -12,
      notes: 'invalid'
    }
  }];

  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify(malformedState)
  });
  const loaded = loadState({
    storageAdapter: createStorageAdapter(storage),
    indexes: bundle.runtime.indexes
  });

  assert.equal(loaded.state.history[0].result.status, 'pending');
  assert.ok(loaded.notices.some((notice) => notice.includes('Recovered invalid stored game result')));
});

test('Allows losses without a score while keeping wins score-required', () => {

  const acceptedState = acceptGameSetup(createDefaultState(), createSampleSetup(0));

  const lossState = updateGameResult(acceptedState, {
    recordId: acceptedState.history[0].id,
    outcome: 'loss',
    score: null,
    notes: 'Conceded after the final city slot filled.',
    updatedAt: '2026-04-10T13:30:00.000Z'
  });

  assert.deepEqual(lossState.history[0].result, {
    status: 'completed',
    outcome: 'loss',
    score: null,
    notes: 'Conceded after the final city slot filled.',
    updatedAt: '2026-04-10T13:30:00.000Z'
  });
  assert.equal(formatHistorySummary(lossState.history[0], bundle.runtime.indexes).resultLabel, 'Loss');

  assert.throws(() => updateGameResult(acceptedState, {
    recordId: acceptedState.history[0].id,
    outcome: 'win',
    score: null,
    notes: 'Missing score'
  }), /whole-number score/i);
});

test('Saves, edits, and roundtrips completed results without duplicating history records', () => {

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  let state = acceptGameSetup(createDefaultState(), createSampleSetup(0));

  state = updateGameResult(state, {
    recordId: state.history[0].id,
    outcome: 'win',
    score: 54,
    notes: ' Closed it out on the final turn. ',
    updatedAt: '2026-04-10T13:00:00.000Z'
  });

  assert.equal(state.history.length, 1);
  assert.deepEqual(state.history[0].result, {
    status: 'completed',
    outcome: 'win',
    score: 54,
    notes: 'Closed it out on the final turn.',
    updatedAt: '2026-04-10T13:00:00.000Z'
  });
  assert.equal(formatHistorySummary(state.history[0], bundle.runtime.indexes).resultLabel, 'Win · Score 54');

  const correctedState = updateGameResult(state, {
    recordId: state.history[0].id,
    outcome: 'loss',
    score: null,
    notes: 'Corrected after reviewing the final total.',
    updatedAt: '2026-04-10T14:00:00.000Z'
  });

  assert.equal(correctedState.history.length, 1);
  assert.equal(correctedState.history[0].result.outcome, 'loss');
  assert.equal(correctedState.history[0].result.score, null);

  const save = saveState({ storageAdapter, state: correctedState });
  assert.equal(save.ok, true);

  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });
  assert.deepEqual(loaded.state.history[0].result, correctedState.history[0].result);
});

test('formatGameResultStatus formats score label and number locale-aware', () => {

  const winResult = {
    status: 'completed',
    outcome: 'win',
    score: 1000,
    notes: '',
    updatedAt: '2026-04-16T12:00:00.000Z'
  };

  // en-US: 'Score' label with comma thousands separator
  assert.equal(formatGameResultStatus(winResult, 'en-US'), 'Win · Score 1,000');

  // de-DE: 'Punktzahl' label with period thousands separator
  assert.equal(formatGameResultStatus(winResult, 'de-DE'), 'Win · Punktzahl 1.000');

  // default (no locale arg) uses en-US
  assert.equal(formatGameResultStatus(winResult), 'Win · Score 1,000');

  // null score returns outcome only — no score label
  const lossResult = {
    status: 'completed',
    outcome: 'loss',
    score: null,
    notes: '',
    updatedAt: '2026-04-16T12:00:00.000Z'
  };
  assert.equal(formatGameResultStatus(lossResult, 'en-US'), 'Loss');
  assert.equal(formatGameResultStatus(lossResult, 'de-DE'), 'Loss');

  // pending result is unaffected by locale
  const pendingResult = { status: 'pending', outcome: null, score: null, notes: '', updatedAt: null };
  assert.equal(formatGameResultStatus(pendingResult, 'de-DE'), 'Pending result');
});

// ── Epic 58 Story 1 tests ────────────────────────────────────────────────────

test('createPlayerScoreEntry normalises playerName and score', () => {

  const entry = createPlayerScoreEntry({ playerName: '  Alice  ', score: 42 });
  assert.deepEqual(entry, { playerName: 'Alice', score: 42 });

  const defaultEntry = createPlayerScoreEntry();
  assert.deepEqual(defaultEntry, { playerName: '', score: null });

  const nullScore = createPlayerScoreEntry({ playerName: 'Bob', score: -1 });
  assert.deepEqual(nullScore, { playerName: 'Bob', score: null });
});

test('createPerPlayerScoreArray returns correct length array of blank entries', () => {

  const arr = createPerPlayerScoreArray(3);
  assert.equal(arr.length, 3);
  assert.deepEqual(arr[0], { playerName: '', score: null });
  assert.deepEqual(arr[2], { playerName: '', score: null });
});

test('createCompletedGameResult with playerCount 2 and valid score array produces array', () => {

  const result = createCompletedGameResult({
    outcome: 'win',
    score: [{ playerName: 'Alice', score: 42 }, { playerName: 'Bob', score: 35 }],
    notes: '',
    updatedAt: '2026-04-18T10:00:00.000Z',
    playerCount: 2
  });
  assert.equal(result.status, 'completed');
  assert.equal(result.outcome, 'win');
  assert.ok(Array.isArray(result.score));
  assert.equal(result.score.length, 2);
  assert.deepEqual(result.score[0], { playerName: 'Alice', score: 42 });
  assert.deepEqual(result.score[1], { playerName: 'Bob', score: 35 });
});

test('createCompletedGameResult with playerCount 2 and non-array score throws', () => {

  assert.throws(() => createCompletedGameResult({
    outcome: 'win',
    score: 99,
    updatedAt: '2026-04-18T10:00:00.000Z',
    playerCount: 2
  }), /per-player score array is required/i);
});

test('createCompletedGameResult with playerCount 2, outcome win, all score null throws', () => {

  assert.throws(() => createCompletedGameResult({
    outcome: 'win',
    score: [{ playerName: 'Alice', score: null }, { playerName: 'Bob', score: null }],
    updatedAt: '2026-04-18T10:00:00.000Z',
    playerCount: 2
  }), /whole-number score/i);
});

test('createCompletedGameResult with playerCount 2, outcome loss, all score null succeeds', () => {

  const result = createCompletedGameResult({
    outcome: 'loss',
    score: [{ playerName: 'Alice', score: null }, { playerName: 'Bob', score: null }],
    updatedAt: '2026-04-18T10:00:00.000Z',
    playerCount: 2
  });
  assert.equal(result.status, 'completed');
  assert.equal(result.outcome, 'loss');
  assert.ok(result.score.every((e) => e.score === null));
});

test('sanitizeStoredGameResult with playerCount 2 and score as number returns pending with recovered', () => {

  const { result, recovered } = sanitizeStoredGameResult(
    { status: 'completed', outcome: 'win', score: 42, notes: '', updatedAt: '2026-04-18T10:00:00.000Z' },
    2
  );
  assert.ok(recovered);
  assert.equal(result.status, 'pending');
});

test('sanitizeStoredGameResult with valid per-player array round-trips correctly', () => {

  const original = {
    status: 'completed',
    outcome: 'win',
    score: [{ playerName: 'Alice', score: 42 }, { playerName: 'Bob', score: 35 }],
    notes: 'great game',
    updatedAt: '2026-04-18T10:00:00.000Z'
  };
  const { result, recovered } = sanitizeStoredGameResult(original, 2);
  assert.ok(!recovered);
  assert.equal(result.status, 'completed');
  assert.equal(result.outcome, 'win');
  assert.ok(Array.isArray(result.score));
  assert.deepEqual(result.score[0], { playerName: 'Alice', score: 42 });
  assert.deepEqual(result.score[1], { playerName: 'Bob', score: 35 });
});

test('normalizeGameResultDraft with playerCount 2 produces playerScores array', () => {

  const completedResult = {
    status: 'completed',
    outcome: 'win',
    score: [{ playerName: 'Alice', score: 42 }, { playerName: 'Bob', score: null }],
    notes: 'Notes here',
    updatedAt: '2026-04-18T10:00:00.000Z'
  };
  const draft = normalizeGameResultDraft(completedResult, 2);
  assert.equal(draft.outcome, 'win');
  assert.ok(Array.isArray(draft.playerScores));
  assert.equal(draft.playerScores.length, 2);
  assert.deepEqual(draft.playerScores[0], { playerName: 'Alice', score: '42' });
  assert.deepEqual(draft.playerScores[1], { playerName: 'Bob', score: '' });
  assert.equal(draft.notes, 'Notes here');
  assert.equal(draft.score, undefined);
});

test('normalizeGameResultDraft with playerCount 1 returns existing solo shape', () => {

  const completedSolo = {
    status: 'completed',
    outcome: 'win',
    score: 54,
    notes: 'Solo note',
    updatedAt: '2026-04-18T10:00:00.000Z'
  };
  const draft = normalizeGameResultDraft(completedSolo, 1);
  assert.equal(draft.score, '54');
  assert.equal(draft.playerScores, undefined);
});

test('validateGameResultDraft with playerCount 2 validates each player entry independently', () => {

  const validDraft = {
    outcome: 'win',
    playerScores: [
      { playerName: 'Alice', score: '42' },
      { playerName: 'Bob', score: '35' }
    ],
    notes: ''
  };
  const { ok, errors, result } = validateGameResultDraft(validDraft, 2);
  assert.ok(ok);
  assert.equal(errors.length, 0);
  assert.equal(result.outcome, 'win');
  assert.deepEqual(result.score[0], { playerName: 'Alice', score: 42 });
  assert.deepEqual(result.score[1], { playerName: 'Bob', score: 35 });

  // win with all empty scores fails
  const allEmptyWin = {
    outcome: 'win',
    playerScores: [{ playerName: 'Alice', score: '' }, { playerName: 'Bob', score: '' }],
    notes: ''
  };
  const failResult = validateGameResultDraft(allEmptyWin, 2);
  assert.ok(!failResult.ok);

  // loss with all empty scores succeeds
  const allEmptyLoss = {
    outcome: 'loss',
    playerScores: [{ playerName: 'Alice', score: '' }, { playerName: 'Bob', score: '' }],
    notes: ''
  };
  const lossResult = validateGameResultDraft(allEmptyLoss, 2);
  assert.ok(lossResult.ok);

  // invalid score string fails
  const badScore = {
    outcome: 'win',
    playerScores: [{ playerName: 'Alice', score: '-5' }, { playerName: 'Bob', score: '10' }],
    notes: ''
  };
  const badResult = validateGameResultDraft(badScore, 2);
  assert.ok(!badResult.ok);
  assert.ok(badResult.errors.some((e) => /whole number/i.test(e)));
});

test('formatGameResultStatus with per-player score array renders Name: Score format', () => {

  const multiResult = {
    status: 'completed',
    outcome: 'win',
    score: [{ playerName: 'Alice', score: 42 }, { playerName: 'Bob', score: 35 }],
    notes: '',
    updatedAt: '2026-04-18T10:00:00.000Z'
  };
  assert.equal(formatGameResultStatus(multiResult), 'Win · Alice: 42 · Bob: 35');

  // blank name falls back to "Player N"
  const blankNames = {
    status: 'completed',
    outcome: 'loss',
    score: [{ playerName: '', score: 10 }, { playerName: '  ', score: 20 }],
    notes: '',
    updatedAt: '2026-04-18T10:00:00.000Z'
  };
  assert.equal(formatGameResultStatus(blankNames), 'Loss · Player 1: 10 · Player 2: 20');

  // null score for a player shows em dash
  const withNull = {
    status: 'completed',
    outcome: 'loss',
    score: [{ playerName: 'Alice', score: null }, { playerName: 'Bob', score: 5 }],
    notes: '',
    updatedAt: '2026-04-18T10:00:00.000Z'
  };
  assert.equal(formatGameResultStatus(withNull), 'Loss · Alice: — · Bob: 5');
});

// ── Epic 58 Story 2 tests ────────────────────────────────────────────────────

test('updateGameResult on 2-player record with per-player score array stores array result', () => {

  const twoPlayerSetup = createSampleSetup(1); // playerCount: 2
  const state = acceptGameSetup(createDefaultState(), twoPlayerSetup);

  // pending result for 2-player game has score as array
  assert.ok(Array.isArray(state.history[0].result.score));
  assert.equal(state.history[0].result.score.length, 2);

  const updatedState = updateGameResult(state, {
    recordId: state.history[0].id,
    outcome: 'win',
    score: [{ playerName: 'Alice', score: 42 }, { playerName: 'Bob', score: 35 }],
    notes: '',
    updatedAt: '2026-04-18T11:00:00.000Z'
  });

  assert.equal(updatedState.history[0].result.status, 'completed');
  assert.ok(Array.isArray(updatedState.history[0].result.score));
  assert.equal(updatedState.history[0].result.score.length, 2);
  assert.deepEqual(updatedState.history[0].result.score[0], { playerName: 'Alice', score: 42 });
  assert.deepEqual(updatedState.history[0].result.score[1], { playerName: 'Bob', score: 35 });
});

test('updateGameResult on solo record with number score keeps score as number', () => {

  const soloSetup = createSampleSetup(0); // playerCount: 1
  const state = acceptGameSetup(createDefaultState(), soloSetup);

  const updatedState = updateGameResult(state, {
    recordId: state.history[0].id,
    outcome: 'win',
    score: 77,
    notes: '',
    updatedAt: '2026-04-18T11:00:00.000Z'
  });

  assert.equal(updatedState.history[0].result.status, 'completed');
  assert.equal(typeof updatedState.history[0].result.score, 'number');
  assert.equal(updatedState.history[0].result.score, 77);
});

test('loadState with 3-player record and valid per-player array emits no recovery notices', () => {

  const threePlayerRecord = {
    id: 'epic58-3p-game',
    createdAt: '2026-04-18T10:00:00.000Z',
    playerCount: 3,
    advancedSolo: false,
    playMode: 'standard',
    setupSnapshot: createSampleSetup(0).setupSnapshot,
    result: {
      status: 'completed',
      outcome: 'win',
      score: [
        { playerName: 'Alice', score: 42 },
        { playerName: 'Bob', score: 35 },
        { playerName: 'Carol', score: 50 }
      ],
      notes: '',
      updatedAt: '2026-04-18T10:00:00.000Z'
    }
  };

  const storedState = { ...createDefaultState(), history: [threePlayerRecord] };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify(storedState) });
  const { state, notices } = loadState({ storageAdapter: createStorageAdapter(storage), indexes: bundle.runtime.indexes });

  assert.ok(!notices.some((n) => /recovered/i.test(n)), `Unexpected recovery notices: ${notices.join(', ')}`);
  assert.ok(Array.isArray(state.history[0].result.score));
  assert.equal(state.history[0].result.score.length, 3);
});

test('loadState with 2-player record and score as number emits recovery notice', () => {

  const invalidMultiRecord = {
    id: 'epic58-2p-invalid',
    createdAt: '2026-04-18T10:00:00.000Z',
    playerCount: 2,
    advancedSolo: false,
    playMode: 'standard',
    setupSnapshot: createSampleSetup(0).setupSnapshot,
    result: {
      status: 'completed',
      outcome: 'win',
      score: 42,
      notes: '',
      updatedAt: '2026-04-18T10:00:00.000Z'
    }
  };

  const storedState = { ...createDefaultState(), history: [invalidMultiRecord] };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify(storedState) });
  const { state, notices } = loadState({ storageAdapter: createStorageAdapter(storage), indexes: bundle.runtime.indexes });

  assert.ok(notices.some((n) => /recovered/i.test(n)));
  assert.equal(state.history[0].result.status, 'pending');
});

test('Solo round-trip through saveState and loadState is unchanged', () => {

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);

  let state = acceptGameSetup(createDefaultState(), createSampleSetup(0)); // solo
  state = updateGameResult(state, {
    recordId: state.history[0].id,
    outcome: 'win',
    score: 99,
    notes: 'Solo round-trip',
    updatedAt: '2026-04-18T12:00:00.000Z'
  });

  saveState({ storageAdapter, state });
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.deepEqual(loaded.state.history[0].result, state.history[0].result);
  assert.equal(typeof loaded.state.history[0].result.score, 'number');
  assert.equal(loaded.state.history[0].result.score, 99);
});

// ── Epic 59 Story 1 tests ────────────────────────────────────────────────────

test('GAME_OUTCOME_OPTIONS includes draw', () => {

  const ids = GAME_OUTCOME_OPTIONS.map((o) => o.id);
  assert.ok(ids.includes('draw'), `Expected 'draw' in GAME_OUTCOME_OPTIONS, got: ${ids.join(', ')}`);
});

test('createCompletedGameResult with outcome draw and score null produces valid result', () => {

  const result = createCompletedGameResult({
    outcome: 'draw',
    score: null,
    notes: '',
    updatedAt: '2026-04-18T10:00:00.000Z'
  });
  assert.equal(result.status, 'completed');
  assert.equal(result.outcome, 'draw');
  assert.equal(result.score, null);
});

test('createCompletedGameResult with outcome draw and positive score produces valid result', () => {

  const result = createCompletedGameResult({
    outcome: 'draw',
    score: 5,
    notes: '',
    updatedAt: '2026-04-18T10:00:00.000Z'
  });
  assert.equal(result.status, 'completed');
  assert.equal(result.outcome, 'draw');
  assert.equal(result.score, 5);
});

test('createCompletedGameResult with outcome draw and negative score throws validation error', () => {

  assert.throws(
    () => createCompletedGameResult({
      outcome: 'draw',
      score: -1,
      notes: '',
      updatedAt: '2026-04-18T10:00:00.000Z'
    }),
    /whole number/i
  );
});

test('Win validation is unaffected by draw addition', () => {

  assert.throws(
    () => createCompletedGameResult({ outcome: 'win', score: null, notes: '', updatedAt: '2026-04-18T10:00:00.000Z' }),
    /whole-number score/i
  );
  const winResult = createCompletedGameResult({ outcome: 'win', score: 10, notes: '', updatedAt: '2026-04-18T10:00:00.000Z' });
  assert.equal(winResult.outcome, 'win');
  assert.equal(winResult.score, 10);
});

test('Loss validation is unaffected by draw addition', () => {

  const lossNullScore = createCompletedGameResult({ outcome: 'loss', score: null, notes: '', updatedAt: '2026-04-18T10:00:00.000Z' });
  assert.equal(lossNullScore.outcome, 'loss');
  assert.equal(lossNullScore.score, null);

  assert.throws(
    () => createCompletedGameResult({ outcome: 'loss', score: -1, notes: '', updatedAt: '2026-04-18T10:00:00.000Z' }),
    /whole number/i
  );
});