import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { sanitizePersistedState, SCHEMA_VERSION } from '../src/app/state-store.ts';
import { generateSetup } from '../src/app/setup-generator.ts';
import { createDefaultState } from '../src/app/state-store.ts';
import { normalizeHistoryGroupingMode } from '../src/app/history-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function buildValidRecord(indexes, overrides = {}) {
  return {
    id: 'epic71-test-game',
    createdAt: '2026-05-01T12:00:00.000Z',
    playerCount: 1,
    advancedSolo: false,
    playMode: 'standard',
    setupSnapshot: {
      mastermindId: indexes.allMasterminds[0].id,
      schemeId: indexes.allSchemes[0].id,
      heroIds: indexes.allHeroes.slice(0, 3).map((entity) => entity.id),
      villainGroupIds: [indexes.allVillainGroups[0].id],
      henchmanGroupIds: [indexes.allHenchmanGroups[0].id]
    },
    result: { status: 'pending', outcome: null, score: null, notes: '', updatedAt: null },
    ...overrides
  };
}

function buildCandidateState(indexes, historyRecord) {
  return {
    schemaVersion: SCHEMA_VERSION,
    collection: { ownedSetIds: [], activeSetIds: null },
    usage: { heroes: {}, masterminds: {}, villainGroups: {}, henchmanGroups: {}, schemes: {} },
    history: [historyRecord],
    preferences: {
      lastPlayerCount: 1,
      lastAdvancedSolo: false,
      lastPlayMode: 'standard',
      selectedTab: null,
      onboardingCompleted: false,
      themeId: 'dark',
      localeId: 'en-US'
    }
  };
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

// ---------------------------------------------------------------------------
// Story 71.1 — sanitizeGameRecord epicMastermind normalization
// ---------------------------------------------------------------------------

test('sanitizeGameRecord: epicMastermind: true is preserved as true', () => {
  const record = buildValidRecord(bundle.runtime.indexes, { epicMastermind: true });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].epicMastermind, true);
});

test('sanitizeGameRecord: epicMastermind: false is normalised to false', () => {
  const record = buildValidRecord(bundle.runtime.indexes, { epicMastermind: false });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].epicMastermind, false);
});

test('sanitizeGameRecord: absent epicMastermind is normalised to false', () => {
  const record = buildValidRecord(bundle.runtime.indexes);
  const { state } = sanitizePersistedState({ candidate: buildCandidateState(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].epicMastermind, false);
});

test('sanitizeGameRecord: epicMastermind: "yes" (string) is normalised to false', () => {
  const record = buildValidRecord(bundle.runtime.indexes, { epicMastermind: 'yes' });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].epicMastermind, false);
});

test('sanitizeGameRecord: all other fields are untouched after sanitization', () => {
  const indexes = bundle.runtime.indexes;
  const record = buildValidRecord(indexes, { epicMastermind: true });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState(indexes, record), indexes });
  const sanitized = state.history[0];
  assert.equal(sanitized.id, record.id);
  assert.equal(sanitized.createdAt, record.createdAt);
  assert.equal(sanitized.playerCount, record.playerCount);
  assert.equal(sanitized.advancedSolo, record.advancedSolo);
  assert.equal(sanitized.playMode, record.playMode);
  assert.equal(sanitized.setupSnapshot.mastermindId, record.setupSnapshot.mastermindId);
  assert.equal(sanitized.setupSnapshot.schemeId, record.setupSnapshot.schemeId);
  assert.deepEqual(sanitized.setupSnapshot.heroIds, record.setupSnapshot.heroIds);
  assert.deepEqual(sanitized.setupSnapshot.villainGroupIds, record.setupSnapshot.villainGroupIds);
  assert.deepEqual(sanitized.setupSnapshot.henchmanGroupIds, record.setupSnapshot.henchmanGroupIds);
  assert.deepEqual(sanitized.result, record.result);
});

// ---------------------------------------------------------------------------
// Story 71.2 — generateSetup Epic Mastermind pool filtering
// ---------------------------------------------------------------------------

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

function createStateWithSets(setNames) {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets
    .filter((set) => setNames.includes(set.name))
    .map((set) => set.id);
  return state;
}

test('generateSetup with epicMastermind: true returns a mastermind with isEpicMastermind === true', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, epicMastermind: true, random: () => 0 });
  assert.equal(setup.mastermind.isEpicMastermind, true);
});

test('generateSetup with epicMastermind: true throws when no owned set has Epic Mastermind cards', () => {
  const state = createStateWithSets(['Core Set', 'Dark City']);
  assert.throws(
    () => generateSetup({ runtime: bundle.runtime, state, playerCount: 1, epicMastermind: true, random: () => 0 }),
    /newGame\.epicMastermind\.noCardsError/
  );
});

test('generateSetup with epicMastermind: false behaves identically to the pre-epic-71 path', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, epicMastermind: false, random: () => 0 });
  assert.ok(setup.mastermind);
  assert.ok(setup.scheme);
  assert.ok(setup.heroes.length > 0);
});

test('generateSetup without epicMastermind option behaves identically to the pre-epic-71 path', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, random: () => 0 });
  assert.ok(setup.mastermind);
  assert.ok(setup.scheme);
  assert.ok(setup.heroes.length > 0);
});

// ---------------------------------------------------------------------------
// Story 71.4 — epicMastermind flag persisted in history records (T-17)
// ---------------------------------------------------------------------------

test('write a record with epicMastermind: true; round-trip gives epicMastermind: true', () => {
  const record = buildValidRecord(bundle.runtime.indexes, { epicMastermind: true });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history[0].epicMastermind, true);
});

test('legacy record without epicMastermind reads as false without throwing', () => {
  const record = buildValidRecord(bundle.runtime.indexes);
  delete record.epicMastermind;
  const { state } = sanitizePersistedState({ candidate: buildCandidateState(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history[0].epicMastermind, false);
});

test('all other fields are identical after round-trip (legacy record)', () => {
  const indexes = bundle.runtime.indexes;
  const record = buildValidRecord(indexes);
  const { state } = sanitizePersistedState({ candidate: buildCandidateState(indexes, record), indexes });
  const sanitized = state.history[0];
  assert.equal(sanitized.id, record.id);
  assert.equal(sanitized.createdAt, record.createdAt);
  assert.equal(sanitized.playerCount, record.playerCount);
  assert.equal(sanitized.playMode, record.playMode);
  assert.deepEqual(sanitized.setupSnapshot, record.setupSnapshot);
  assert.deepEqual(sanitized.result, record.result);
});

// ---------------------------------------------------------------------------
// T-22 — normalizeHistoryGroupingMode accepts epic-mastermind
// ---------------------------------------------------------------------------

test('normalizeHistoryGroupingMode returns epic-mastermind for epic-mastermind', () => {
  assert.equal(normalizeHistoryGroupingMode('epic-mastermind'), 'epic-mastermind');
});
