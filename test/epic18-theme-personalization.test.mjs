import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createDefaultState, createStorageAdapter, loadState, saveState } from '../src/app/state-store.mjs';
import { DEFAULT_THEME_ID, THEME_OPTIONS, getThemeDefinition, normalizeThemeId } from '../src/app/theme-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let shellCss;
let stylingArchitectureDoc;
let readmeDoc;
let dataModelDoc;
let indexHtmlDoc;

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
  const [css, stylingArchitecture, readme, dataModel, indexHtml] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'styling-architecture.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'README.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'data-model.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'index.html'), 'utf8')
  ]);

  shellCss = css;
  stylingArchitectureDoc = stylingArchitecture;
  readmeDoc = readme;
  dataModelDoc = dataModel;
  indexHtmlDoc = indexHtml;
});

test('Epic 18 theme utilities normalize supported IDs and expose stable theme metadata', () => {
  assert.equal(DEFAULT_THEME_ID, 'midnight');
  assert.deepEqual(THEME_OPTIONS.map((theme) => theme.id), ['midnight', 'newsprint']);
  assert.equal(normalizeThemeId('newsprint'), 'newsprint');
  assert.equal(normalizeThemeId('not-a-theme'), DEFAULT_THEME_ID);
  assert.equal(getThemeDefinition('newsprint').colorScheme, 'light');
  assert.equal(getThemeDefinition('unknown').id, DEFAULT_THEME_ID);
});

test('Epic 18 persists the selected theme and safely recovers invalid stored theme values', () => {
  const state = createDefaultState();
  assert.equal(state.preferences.themeId, DEFAULT_THEME_ID);

  state.preferences.themeId = 'newsprint';
  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  const save = saveState({ storageAdapter, state });
  assert.equal(save.ok, true);

  const loaded = loadState({ storageAdapter, indexes: minimalIndexes });
  assert.equal(loaded.state.preferences.themeId, 'newsprint');

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

test('Epic 18 stylesheet and docs describe the supported themes and hand-authored CSS decision', () => {
  assert.match(shellCss, /:root\[data-theme='newsprint'\]/);
  assert.match(shellCss, /:root\[data-theme='midnight'\]/);
  assert.match(shellCss, /theme-switcher/);

  assert.match(stylingArchitectureDoc, /Midnight/);
  assert.match(stylingArchitectureDoc, /Newsprint/);
  assert.match(stylingArchitectureDoc, /hand-authored CSS custom properties/i);
  assert.match(stylingArchitectureDoc, /Open Props/);
  assert.match(stylingArchitectureDoc, /Pico CSS/);
  assert.match(stylingArchitectureDoc, /Tailwind CSS/);

  assert.match(readmeDoc, /theme switcher/i);
  assert.match(dataModelDoc, /themeId/);
  assert.match(indexHtmlDoc, /<link rel="stylesheet" href="\.\/src\/app\/app-shell\.css"/);
  assert.doesNotMatch(indexHtmlDoc, /https?:\/\/.*\.css/i);
});
