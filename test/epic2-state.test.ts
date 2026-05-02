import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import {
  STORAGE_KEY,
  USAGE_CATEGORIES,
  acceptGameSetup,
  createDefaultState,
  createStorageAdapter,
  loadState,
  resetAllState,
  resetUsageCategory,
  saveState,
  toggleOwnedSet,
  updateState
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

