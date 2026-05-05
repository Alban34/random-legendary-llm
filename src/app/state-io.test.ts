import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEpic1Bundle } from './game-data-pipeline.ts';
import { loadState, saveState, updateState } from './state-io.ts';
import { createDefaultState, STORAGE_KEY, SCHEMA_VERSION } from './state-defaults.ts';
import { createStorageAdapter } from './storage-adapter.ts';
import { toggleOwnedSet, acceptGameSetup } from './state-store.ts';
import { createMemoryStorage } from './test-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;
beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

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

test('loadState recovers when ownedSetIds is not an array', () => {
  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: { ownedSetIds: 'not-an-array', activeSetIds: null },
    usage: { heroes: {}, masterminds: {}, villainGroups: {}, henchmanGroups: {}, schemes: {} },
    history: [],
    preferences: {}
  };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify(candidate) });
  const { notices, state: loaded } = loadState({
    storageAdapter: createStorageAdapter(storage),
    indexes: bundle.runtime.indexes
  });
  assert.deepEqual(loaded.collection.ownedSetIds, []);
  assert.ok(notices.some((n) => /collection ownership/i.test(n)));
});

test('loadState sanitizes non-plain usage buckets and invalid stat values', () => {
  const indexes = bundle.runtime.indexes;
  const mmId = indexes.allMasterminds[0].id;
  const vgId = indexes.allVillainGroups[0].id;
  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: { ownedSetIds: [], activeSetIds: null },
    usage: {
      heroes: 42,
      masterminds: { [mmId]: 'not-an-object' },
      villainGroups: { [vgId]: { plays: -1, lastPlayedAt: null } },
      henchmanGroups: {},
      schemes: {}
    },
    history: [],
    preferences: {}
  };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify(candidate) });
  const { notices, state: loaded } = loadState({
    storageAdapter: createStorageAdapter(storage),
    indexes
  });
  assert.deepEqual(loaded.usage.heroes, {});
  assert.deepEqual(loaded.usage.masterminds, {});
  assert.deepEqual(loaded.usage.villainGroups, {});
  assert.ok(notices.some((n) => /heroes usage/i.test(n)));
});
