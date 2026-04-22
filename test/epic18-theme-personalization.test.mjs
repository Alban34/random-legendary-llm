import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultState, createStorageAdapter, loadState, saveState } from '../src/app/state-store.ts';
import { DEFAULT_THEME_ID, THEME_OPTIONS, getThemeDefinition, normalizeThemeId } from '../src/app/theme-utils.ts';

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

test('Epic 18 theme utilities normalize supported IDs and expose stable theme metadata', () => {
  assert.equal(DEFAULT_THEME_ID, 'dark');
  assert.deepEqual(THEME_OPTIONS.map((theme) => theme.id), ['dark', 'light']);
  assert.equal(normalizeThemeId('light'), 'light');
  assert.equal(normalizeThemeId('newsprint'), 'light');
  assert.equal(normalizeThemeId('midnight'), 'dark');
  assert.equal(normalizeThemeId('not-a-theme'), DEFAULT_THEME_ID);
  assert.equal(getThemeDefinition('light').colorScheme, 'light');
  assert.equal(getThemeDefinition('unknown').id, DEFAULT_THEME_ID);
});

test('Epic 18 persists the selected theme and safely recovers invalid stored theme values', () => {
  const state = createDefaultState();
  assert.equal(state.preferences.themeId, DEFAULT_THEME_ID);

  state.preferences.themeId = 'light';
  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  const save = saveState({ storageAdapter, state });
  assert.equal(save.ok, true);

  const loaded = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(loaded.state.preferences.themeId, 'light');

  storage.setItem('legendary_state_v1', JSON.stringify({
    ...state,
    preferences: {
      ...state.preferences,
      themeId: 'gamma-burst'
    }
  }));

  const recovered = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(recovered.state.preferences.themeId, DEFAULT_THEME_ID);
  assert.equal(recovered.notices.some((notice) => notice.includes('Recovered invalid preference values during state hydration.')), true);
});

