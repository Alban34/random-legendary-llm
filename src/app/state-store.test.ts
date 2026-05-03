import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import {
  SCHEMA_VERSION,
  STORAGE_KEY,
  USAGE_CATEGORIES,
  acceptGameSetup,
  clearActiveSetIds,
  createDefaultState,
  createStorageAdapter,
  loadState,
  resetAllState,
  resetUsageCategory,
  sanitizePersistedState,
  saveState,
  setActiveSetIds,
  toggleOwnedSet,
  updateState
} from './state-store.ts';
import { generateSetup, validateSetupLegality } from './setup-generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
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
    },
    dump() {
      return Object.fromEntries(store.entries());
    }
  };
}

function createSampleSetup(offset = 0) {
  const runtime = bundle.runtime.indexes;
  return {
    id: `game-${offset}`,
    createdAt: `2026-04-09T12:00:0${offset}.000Z`,
    playerCount: offset % 2 === 0 ? 1 : 2,
    advancedSolo: offset % 2 === 0,
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

test('Default root state matches the expected schema', () => {

  const state = createDefaultState();

  assert.equal(state.schemaVersion, 1);
  assert.deepEqual(state.collection, { ownedSetIds: [], activeSetIds: null });
  assert.deepEqual(state.usage, {
    heroes: {},
    masterminds: {},
    villainGroups: {},
    henchmanGroups: {},
    schemes: {}
  });
  assert.deepEqual(state.history, []);
  assert.deepEqual(state.preferences, {
    lastPlayerCount: 1,
    lastAdvancedSolo: false,
    lastPlayMode: 'standard',
    selectedTab: null,
    onboardingCompleted: false,
    themeId: 'dark',
    localeId: 'en-US'
  });
});

test('Save/load roundtrip preserves the root state shape', () => {

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  let state = createDefaultState();

  state = toggleOwnedSet(state, bundle.runtime.sets[0].id);
  state = acceptGameSetup(state, createSampleSetup(0));

  const save = saveState({ storageAdapter, state });
  assert.equal(save.ok, true);

  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });
  assert.equal(loaded.storageAvailable, true);
  assert.deepEqual(loaded.state, state);
});

test('Hydration removes invalid stored set IDs safely', () => {

  const invalidState = createDefaultState();
  invalidState.collection.ownedSetIds = [bundle.runtime.sets[0].id, 'missing-set-id'];

  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify(invalidState)
  });
  const storageAdapter = createStorageAdapter(storage);
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.deepEqual(loaded.state.collection.ownedSetIds, [bundle.runtime.sets[0].id]);
  assert.ok(loaded.recovered);
  assert.ok(loaded.notices.some((notice) => notice.includes('Removed invalid stored set IDs')));
});

test('Accepted setups update usage statistics and history newest-first', () => {

  let state = createDefaultState();

  state = acceptGameSetup(state, createSampleSetup(0));
  state = acceptGameSetup(state, createSampleSetup(1));

  assert.equal(state.history.length, 2);
  assert.equal(state.history[0].id, 'game-1');
  assert.equal(state.history[1].id, 'game-0');
  assert.equal(Object.keys(state.usage.heroes).length >= 3, true);
  assert.equal(state.usage.masterminds[bundle.runtime.indexes.allMasterminds[1].id].plays, 1);
  assert.equal(state.preferences.lastPlayerCount, 2);
  assert.equal(state.preferences.lastAdvancedSolo, false);
});

test('Per-category reset only clears the intended usage bucket', () => {

  let state = createDefaultState();
  state = acceptGameSetup(state, createSampleSetup(0));

  const resetState = resetUsageCategory(state, 'heroes');

  assert.deepEqual(resetState.usage.heroes, {});
  assert.notDeepEqual(resetState.usage.masterminds, {});
  assert.notDeepEqual(resetState.usage.villainGroups, {});
});

test('Full reset clears persisted state safely', () => {

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  const state = acceptGameSetup(createDefaultState(), createSampleSetup(0));

  saveState({ storageAdapter, state });
  assert.ok(storage.dump()[STORAGE_KEY]);

  const result = resetAllState({ storageAdapter });

  assert.equal(result.save.ok, true);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.deepEqual(result.state, createDefaultState());
});

test('Corrupted saved JSON recovers with default state and a visible notice', () => {

  const storage = createMemoryStorage({
    [STORAGE_KEY]: '{ not-valid-json'
  });
  const storageAdapter = createStorageAdapter(storage);
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.deepEqual(loaded.state, createDefaultState());
  assert.equal(loaded.recovered, true);
  assert.ok(loaded.notices.some((notice) => notice.includes('saved JSON was corrupted')));
});

test('Handles unavailable browser storage gracefully', () => {

  const storageAdapter = createStorageAdapter(undefined);
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.equal(loaded.storageAvailable, false);
  assert.deepEqual(loaded.state, createDefaultState());
  assert.ok(loaded.notices[0].includes('Browser storage is unavailable'));
});

test('updateState sanitizes invalid persisted references before saving', () => {

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);

  const result = updateState({
    storageAdapter,
    indexes: bundle.runtime.indexes,
    currentState: createDefaultState(),
    updater(currentState) {
      currentState.collection.ownedSetIds.push('bad-set-id');
      currentState.usage.heroes['bad-hero-id'] = { plays: 3, lastPlayedAt: '2026-04-09T12:00:00.000Z' };
      return currentState;
    }
  });

  assert.deepEqual(result.state.collection.ownedSetIds, []);
  assert.deepEqual(result.state.usage.heroes, {});
  assert.equal(result.save.ok, true);
  assert.ok(result.notices.length >= 2);
});

test('Exposes all documented usage categories', () => {

  assert.deepEqual(USAGE_CATEGORIES, ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes']);
});

// ── From epic46-active-filter ────────────────────────────────────────────────

test('createDefaultState produces activeSetIds: null', () => {

  const state = createDefaultState();
  assert.equal(state.collection.activeSetIds, null);
});

test('setActiveSetIds replaces the field', () => {

  const state = createDefaultState();
  const next = setActiveSetIds(state, ['core-set']);
  assert.deepEqual(next.collection.activeSetIds, ['core-set']);
  assert.equal(state.collection.activeSetIds, null);
});

test('clearActiveSetIds resets activeSetIds to null', () => {

  const state = createDefaultState();
  const withFilter = setActiveSetIds(state, ['core-set']);
  const cleared = clearActiveSetIds(withFilter);
  assert.equal(cleared.collection.activeSetIds, null);
});

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

test('toggleOwnedSet removes set from activeSetIds when ownership toggled OFF', () => {

  let state = createDefaultState();
  state = toggleOwnedSet(state, 'core-set');
  state = setActiveSetIds(state, ['core-set']);

  assert.ok(state.collection.ownedSetIds.includes('core-set'));
  assert.ok(state.collection.activeSetIds.includes('core-set'));

  state = toggleOwnedSet(state, 'core-set');

  assert.ok(!state.collection.ownedSetIds.includes('core-set'));
  assert.ok(!state.collection.activeSetIds.includes('core-set'));
});

test('toggleOwnedSet does not affect activeSetIds when toggling ON', () => {

  let state = createDefaultState();
  state = toggleOwnedSet(state, 'core-set');

  assert.equal(state.collection.activeSetIds, null);
});

test('validateSetupLegality uses activeSetIds pool when non-empty', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = ['core-set'];

  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });

  const setIds = result.pools.sets.map((s) => s.id);
  assert.ok(setIds.includes('core-set'), 'core-set should be in pools');
  assert.ok(!setIds.includes('dark-city'), 'dark-city should NOT be in pools when filtered out');
});

test('validateSetupLegality uses ownedSetIds pool when activeSetIds is null (no filter)', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = null;

  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });

  const setIds = result.pools.sets.map((s) => s.id);
  assert.ok(setIds.includes('core-set'), 'core-set should be in pools');
  assert.ok(setIds.includes('dark-city'), 'dark-city should be in pools when no filter active');
});

test('generateSetup with activeSetIds filter runs without error', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = ['core-set'];

  const legality = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });
  if (!legality.ok) {
    assert.deepEqual(
      legality.pools.sets.map((s) => s.id),
      ['core-set'],
      'Pool should only contain core-set even if not enough content'
    );
    return;
  }

  let setup;
  assert.doesNotThrow(() => {
    setup = generateSetup({ runtime, state, playerCount: 2, playMode: 'standard' });
  }, 'generateSetup should not throw when a valid setup exists');
  assert.ok(setup, 'generateSetup should return a setup object');
});

test('validateSetupLegality works when activeSetIds field is missing (legacy state)', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  delete state.collection.activeSetIds;
  state.collection.ownedSetIds = ['core-set'];

  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });
  const setIds = result.pools.sets.map((s) => s.id);
  assert.ok(setIds.includes('core-set'));
});

// ── From epic9-notifications-accessibility (state-store parts) ────────────────

test('Storage degradation keeps a default in-memory state and exposes a readable compatibility message', () => {

  const brokenStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('Storage blocked for test');
    },
    removeItem() {
      throw new Error('Storage blocked for test');
    }
  };

  const storageAdapter = createStorageAdapter(brokenStorage);
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.equal(storageAdapter.available, false);
  assert.equal(storageAdapter.setItem('x', 'y').ok, false);
  assert.equal(storageAdapter.removeItem('x').storageAvailable, false);
  assert.deepEqual(loaded.state, createDefaultState());
  assert.equal(loaded.storageAvailable, false);
  assert.equal(loaded.recovered, true);
  assert.ok(loaded.notices[0].includes('Browser storage is unavailable'));
});

// ── From epic17-onboarding-information-architecture (state-store parts) ───────

test('Stores onboarding completion in preferences and recovers invalid values safely', () => {

  const state = createDefaultState();
  assert.equal(state.preferences.onboardingCompleted, false);

  state.preferences.onboardingCompleted = true;

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  const save = saveState({ storageAdapter, state });
  assert.equal(save.ok, true);

  const minimalIndexes = {
    setsById: {},
    heroesById: {},
    mastermindsById: {},
    villainGroupsById: {},
    henchmanGroupsById: {},
    schemesById: {}
  };

  const loaded = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(loaded.state.preferences.onboardingCompleted, true);

  storage.setItem('legendary_state_v1', JSON.stringify({
    ...state,
    preferences: {
      ...state.preferences,
      onboardingCompleted: 'definitely-not-boolean'
    }
  }));

  const recovered = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(recovered.state.preferences.onboardingCompleted, false);
  assert.equal(recovered.notices.some((notice) => notice.includes('Recovered invalid preference values during state hydration.')), true);
});

// ── From epic71-epic-mastermind (state-store parts) ───────────────────────────

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

