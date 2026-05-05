import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let focusUtilsSource;
let preferencesActionsSource;
let gameResultEditorSource;

beforeAll(async () => {
  [focusUtilsSource, preferencesActionsSource, gameResultEditorSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'focus-utils.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'preferences-actions.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'GameResultEditor.svelte'), 'utf8')
  ]);
});

test('Adds reduced-motion and focus-restoration guardrails', () => {

  assert.match(focusUtilsSource, /function focusSelector\(selector/);
  assert.match(preferencesActionsSource, /focusSelector\(`\[data-action="set-theme"\]\[data-theme-id="\$\{normalizedThemeId\}"\]`\);/);
  assert.match(preferencesActionsSource, /focusSelector\('#header-locale-select'\);/);
  assert.match(preferencesActionsSource, /focusSelector[\s\S]*?\[data-action="select-tab"\]\[data-tab-id="\$\{normalizeSelectedTab\(tabId\)\}"\]\[aria-selected="true"\]/);
  assert.match(gameResultEditorSource, /role="alert"[\s\S]*data-result-form-error/);
});
