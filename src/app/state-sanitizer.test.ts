import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEpic1Bundle } from './game-data-pipeline.ts';
import { sanitizePersistedState } from './state-sanitizer.ts';
import { SCHEMA_VERSION } from './state-defaults.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;
beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

function buildValidRecord71(indexes, overrides = {}) {
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

function buildCandidateState71(indexes, historyRecord) {
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

test('Sanitization keeps only IDs present in ownedSetIds', () => {

  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: {
      ownedSetIds: ['core-set'],
      activeSetIds: ['core-set', 'invalid-id']
    },
    usage: {},
    history: [],
    preferences: {}
  };

  const { state, notices } = sanitizePersistedState({ candidate, indexes: bundle.runtime.indexes });

  assert.deepEqual(state.collection.activeSetIds, ['core-set']);
  assert.ok(
    notices.some((n) => n.includes('Removed invalid active set IDs')),
    `Expected a notice about removed active set IDs, got: ${JSON.stringify(notices)}`
  );
});

test('Sanitization emits no notice when activeSetIds is absent (old data)', () => {

  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: {
      ownedSetIds: ['core-set']
    },
    usage: {},
    history: [],
    preferences: {}
  };

  const { state, notices } = sanitizePersistedState({ candidate, indexes: bundle.runtime.indexes });

  assert.equal(state.collection.activeSetIds, null);
  assert.ok(
    !notices.some((n) => n.includes('Removed invalid active set IDs')),
    `Unexpected notice about active set IDs: ${JSON.stringify(notices)}`
  );
});

test('sanitizeGameRecord: epicMastermind: true is preserved as true', () => {
  const record = buildValidRecord71(bundle.runtime.indexes, { epicMastermind: true });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState71(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].epicMastermind, true);
});

test('sanitizeGameRecord: epicMastermind: false is normalised to false', () => {
  const record = buildValidRecord71(bundle.runtime.indexes, { epicMastermind: false });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState71(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].epicMastermind, false);
});

test('sanitizeGameRecord: absent epicMastermind is normalised to false', () => {
  const record = buildValidRecord71(bundle.runtime.indexes);
  const { state } = sanitizePersistedState({ candidate: buildCandidateState71(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].epicMastermind, false);
});

test('sanitizeGameRecord: epicMastermind: "yes" (string) is normalised to false', () => {
  const record = buildValidRecord71(bundle.runtime.indexes, { epicMastermind: 'yes' });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState71(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].epicMastermind, false);
});

test('sanitizeGameRecord: all other fields are untouched after sanitization', () => {
  const indexes = bundle.runtime.indexes;
  const record = buildValidRecord71(indexes, { epicMastermind: true });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState71(indexes, record), indexes });
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

test('write a record with epicMastermind: true; round-trip gives epicMastermind: true', () => {
  const record = buildValidRecord71(bundle.runtime.indexes, { epicMastermind: true });
  const { state } = sanitizePersistedState({ candidate: buildCandidateState71(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history[0].epicMastermind, true);
});

test('legacy record without epicMastermind reads as false without throwing', () => {
  const record = buildValidRecord71(bundle.runtime.indexes);
  delete record.epicMastermind;
  const { state } = sanitizePersistedState({ candidate: buildCandidateState71(bundle.runtime.indexes, record), indexes: bundle.runtime.indexes });
  assert.equal(state.history[0].epicMastermind, false);
});

test('all other fields are identical after round-trip (legacy record)', () => {
  const indexes = bundle.runtime.indexes;
  const record = buildValidRecord71(indexes);
  const { state } = sanitizePersistedState({ candidate: buildCandidateState71(indexes, record), indexes });
  const sanitized = state.history[0];
  assert.equal(sanitized.id, record.id);
  assert.equal(sanitized.createdAt, record.createdAt);
  assert.equal(sanitized.playerCount, record.playerCount);
  assert.equal(sanitized.playMode, record.playMode);
  assert.deepEqual(sanitized.setupSnapshot, record.setupSnapshot);
  assert.deepEqual(sanitized.result, record.result);
});
