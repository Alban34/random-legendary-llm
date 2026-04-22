import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createDefaultState, createStorageAdapter, loadState, saveState } from '../src/app/state-store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const rendererPath = path.join(rootDir, 'src', 'app', 'app-renderer.ts');
const localizationPath = path.join(rootDir, 'src', 'app', 'locales', 'en.ts');

let rendererSource;
let localizationSource;

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

before(async () => {
  [rendererSource, localizationSource] = await Promise.all([
    fs.readFile(rendererPath, 'utf8'),
    fs.readFile(localizationPath, 'utf8')
  ]);
});

test('Epic 17 stores onboarding completion in preferences and recovers invalid values safely', () => {
  const state = createDefaultState();
  assert.equal(state.preferences.onboardingCompleted, false);

  state.preferences.onboardingCompleted = true;

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  const save = saveState({ storageAdapter, state });
  assert.equal(save.ok, true);

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

test('Epic 17 renderer source includes replayable onboarding and an About entry point instead of default diagnostics', () => {
  assert.match(localizationSource, /First-run walkthrough/);
  assert.match(localizationSource, /Replay Walkthrough/);
  assert.match(localizationSource, /About this project/);
  assert.doesNotMatch(rendererSource, /Developer diagnostics<\/h2>/);
});