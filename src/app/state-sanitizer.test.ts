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

// ── Story 97.5 — sanitizeGameRecord notice paths and ID-string logic ──────────

test('sanitizeGameRecord: invalid schemeId emits Removed notice with the record ID and drops the record', () => {
  const indexes = bundle.runtime.indexes;
  const baseRecord = buildValidRecord71(indexes);
  const record = {
    ...baseRecord,
    id: 'test-id',
    setupSnapshot: {
      ...baseRecord.setupSnapshot,
      schemeId: 'invalid-scheme-does-not-exist'
    }
  };
  const { state, notices } = sanitizePersistedState({
    candidate: buildCandidateState71(indexes, record),
    indexes
  });

  assert.equal(state.history.length, 0, 'record with invalid schemeId must be dropped');
  assert.ok(
    notices.some((n) => n.includes("Removed invalid stored game history record 'test-id'")),
    `Expected notice about removed record 'test-id', got: ${JSON.stringify(notices)}`
  );
});

test('sanitizeGameRecord: non-string id emits Removed notice with "unknown" and drops the record', () => {
  const indexes = bundle.runtime.indexes;
  const baseRecord = buildValidRecord71(indexes);
  const record = {
    ...baseRecord,
    id: 12345,
    setupSnapshot: {
      ...baseRecord.setupSnapshot,
      schemeId: 'invalid-scheme-does-not-exist'
    }
  };
  const { state, notices } = sanitizePersistedState({
    candidate: buildCandidateState71(indexes, record),
    indexes
  });

  assert.equal(state.history.length, 0, 'record with non-string id must be dropped');
  assert.ok(
    notices.some((n) => n.includes("Removed invalid stored game history record 'unknown'")),
    `Expected notice mentioning 'unknown', got: ${JSON.stringify(notices)}`
  );
});

test('sanitizeGameRecord: valid snapshot with corrupted result emits Recovered notice with the record ID', () => {
  const indexes = bundle.runtime.indexes;
  const record = {
    ...buildValidRecord71(indexes),
    id: 'test-id',
    result: {
      status: 'completed',
      outcome: 'invalid-outcome',
      score: 5,
      notes: '',
      updatedAt: '2026-05-01T12:00:00.000Z'
    }
  };
  const { state, notices } = sanitizePersistedState({
    candidate: buildCandidateState71(indexes, record),
    indexes
  });

  assert.equal(state.history.length, 1, 'record with recovered result must be retained');
  assert.equal(state.history[0].result.status, 'pending', 'corrupted result must be reset to pending');
  assert.ok(
    notices.some((n) => n.includes("Recovered invalid stored game result for 'test-id'")),
    `Expected Recovered notice for 'test-id', got: ${JSON.stringify(notices)}`
  );
});

test('sanitizeGameRecord: incompatible playMode/playerCount silently drops the record without a notice', () => {
  const indexes = bundle.runtime.indexes;
  const baseRecord = buildValidRecord71(indexes);
  const record = {
    ...baseRecord,
    id: 'test-id',
    playerCount: 2,
    advancedSolo: false,
    playMode: 'advanced-solo'
  };
  const { state, notices } = sanitizePersistedState({
    candidate: buildCandidateState71(indexes, record),
    indexes
  });

  assert.equal(state.history.length, 0, 'record must be silently dropped when resolvePlayMode throws');
  assert.ok(
    !notices.some((n) => n.includes('test-id')),
    `No notice should reference 'test-id' for a silent drop, got: ${JSON.stringify(notices)}`
  );
});

test('sanitizeGameRecord: non-plain-object history entry is dropped with generic hydration notice', () => {
  const indexes = bundle.runtime.indexes;
  const candidateState = {
    schemaVersion: SCHEMA_VERSION,
    collection: { ownedSetIds: [], activeSetIds: null },
    usage: { heroes: {}, masterminds: {}, villainGroups: {}, henchmanGroups: {}, schemes: {} },
    history: ['not-a-plain-object'],
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

  const { state, notices } = sanitizePersistedState({ candidate: candidateState, indexes });

  assert.equal(state.history.length, 0, 'non-plain-object history entry must be dropped');
  assert.ok(
    notices.some((n) => n.includes('Removed an invalid stored game history record during hydration')),
    `Expected generic hydration notice, got: ${JSON.stringify(notices)}`
  );
});

// ── Coverage gap tests: lines 162/163/165, 180, 228, 257 ────────────────────

test('sanitizePreferences pushes a notice when candidatePreferences is a non-plain non-undefined value', () => {
  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: { ownedSetIds: [], activeSetIds: null },
    usage: { heroes: {}, masterminds: {}, villainGroups: {}, henchmanGroups: {}, schemes: {} },
    history: [],
    preferences: 42
  };
  const { notices } = sanitizePersistedState({ candidate, indexes: bundle.runtime.indexes });
  assert.ok(
    notices.some((n) => n.includes('Recovered preferences because the stored value was invalid.')),
    `Expected preferences recovery notice, got: ${JSON.stringify(notices)}`
  );
});

test('sanitizePreferences falls back to default play mode when lastPlayMode triggers a resolvePlayMode throw', () => {
  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: { ownedSetIds: [], activeSetIds: null },
    usage: { heroes: {}, masterminds: {}, villainGroups: {}, henchmanGroups: {}, schemes: {} },
    history: [],
    preferences: {
      lastPlayerCount: 1,
      lastAdvancedSolo: false,
      lastPlayMode: 'completely-unsupported-mode',
      selectedTab: null,
      onboardingCompleted: false,
      themeId: 'dark',
      localeId: 'en-US'
    }
  };
  const { state, notices } = sanitizePersistedState({ candidate, indexes: bundle.runtime.indexes });
  assert.equal(typeof state.preferences.lastPlayMode, 'string');
  assert.ok(
    notices.some((n) => n.includes('Recovered invalid preference values during state hydration.')),
    `Expected preference recovery notice, got: ${JSON.stringify(notices)}`
  );
});

test('sanitizeStateCandidate preserves an explicitly empty activeSetIds array', () => {
  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: { ownedSetIds: [], activeSetIds: [] },
    usage: { heroes: {}, masterminds: {}, villainGroups: {}, henchmanGroups: {}, schemes: {} },
    history: [],
    preferences: {}
  };
  const { state } = sanitizePersistedState({ candidate, indexes: bundle.runtime.indexes });
  assert.deepEqual(state.collection.activeSetIds, []);
});

test('sanitizeStateCandidate pushes a notice when history is a non-array non-undefined value', () => {
  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: { ownedSetIds: [], activeSetIds: null },
    usage: { heroes: {}, masterminds: {}, villainGroups: {}, henchmanGroups: {}, schemes: {} },
    history: 'not-an-array',
    preferences: {}
  };
  const { state, notices } = sanitizePersistedState({ candidate, indexes: bundle.runtime.indexes });
  assert.deepEqual(state.history, []);
  assert.ok(
    notices.some((n) => n.includes('Recovered game history because the stored value was invalid.')),
    `Expected history recovery notice, got: ${JSON.stringify(notices)}`
  );
});
