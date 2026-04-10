import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { formatHistorySummary } from '../src/app/history-utils.mjs';
import {
  STORAGE_KEY,
  acceptGameSetup,
  createDefaultState,
  createStorageAdapter,
  loadState,
  saveState,
  updateGameResult
} from '../src/app/state-store.mjs';

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

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Epic 12 accepted setups start as pending results and legacy records hydrate safely', () => {
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

test('Epic 12 rejects invalid result combinations and recovers malformed stored results to pending', () => {
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

test('Epic 12 allows losses without a score while keeping wins score-required', () => {
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

test('Epic 12 saves, edits, and roundtrips completed results without duplicating history records', () => {
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