import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let browserEntry;
let preferencesActionsSource;

beforeAll(async () => {
  [browserEntry, preferencesActionsSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'preferences-actions.ts'), 'utf8')
  ]);
});

// Story 24.2 — theme action must not call toast.*
test('setTheme action does not trigger a toast', () => {
  const setThemeMatch = preferencesActionsSource.match(/setTheme\(themeId[^)]*\)[\s\S]*?focusSelector\(`\[data-action="set-theme"\]/);
  assert.ok(setThemeMatch, 'setTheme handler must be present in preferences-actions.ts');
  assert.doesNotMatch(setThemeMatch[0], /toast\./, 'setTheme must not call toast.* (Story 24.2)');
});

// Story 24.2 — locale action still triggers a toast
test('setLocale action still triggers a toast', () => {
  assert.match(preferencesActionsSource, /setLocale[\s\S]*?toast\./, 'setLocale must still emit a toast');
});

