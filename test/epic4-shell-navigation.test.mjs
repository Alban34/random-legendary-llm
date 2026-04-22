import test from 'node:test';
import assert from 'node:assert/strict';

import { APP_TABS, DEFAULT_TAB_ID, getAdjacentTabId, normalizeSelectedTab } from '../src/app/app-tabs.ts';
import { STORAGE_KEY, createDefaultState, createStorageAdapter, loadState, saveState } from '../src/app/state-store.ts';

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

const minimalIndexes = {
  setsById: {},
  heroesById: {},
  mastermindsById: {},
  villainGroupsById: {},
  henchmanGroupsById: {},
  schemesById: {}
};

test('Epic 4 defines the expected application tabs with a stable default tab', () => {
  assert.deepEqual(APP_TABS.map((tab) => tab.id), ['browse', 'collection', 'new-game', 'history', 'backup']);
  assert.equal(DEFAULT_TAB_ID, 'browse');
});

test('Epic 4 normalizes unsupported selected tabs back to the default tab', () => {
  assert.equal(normalizeSelectedTab('browse'), 'browse');
  assert.equal(normalizeSelectedTab('history'), 'history');
  assert.equal(normalizeSelectedTab('backup'), 'backup');
  assert.equal(normalizeSelectedTab(null), DEFAULT_TAB_ID);
  assert.equal(normalizeSelectedTab('definitely-missing-tab'), DEFAULT_TAB_ID);
});

test('Epic 4 keyboard navigation order wraps correctly between tabs', () => {
  assert.equal(getAdjacentTabId('browse', 'previous'), 'backup');
  assert.equal(getAdjacentTabId('browse', 'next'), 'collection');
  assert.equal(getAdjacentTabId('history', 'next'), 'backup');
  assert.equal(getAdjacentTabId('backup', 'next'), 'browse');
  assert.equal(getAdjacentTabId('new-game', 'previous'), 'collection');
  assert.equal(getAdjacentTabId('collection', 'first'), 'browse');
  assert.equal(getAdjacentTabId('collection', 'last'), 'backup');
});

test('Epic 4 selected-tab preferences persist and invalid stored tabs recover safely', () => {
  const state = createDefaultState();
  state.preferences.selectedTab = 'history';

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  const save = saveState({ storageAdapter, state });
  assert.equal(save.ok, true);

  const loaded = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(loaded.state.preferences.selectedTab, 'history');

  storage.setItem(STORAGE_KEY, JSON.stringify({
    ...state,
    preferences: {
      ...state.preferences,
      selectedTab: 'definitely-invalid-tab'
    }
  }));

  const recovered = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(recovered.state.preferences.selectedTab, DEFAULT_TAB_ID);
});

