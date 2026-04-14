import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let rendererSource;
let newGameTabSource;
let cssSource;
let entrySource;
let postV1TaskList;
let appSvelteSource;

const appSveltePath = path.join(rootDir, 'src', 'components', 'App.svelte');

before(async () => {
  [rendererSource, newGameTabSource, cssSource, entrySource, postV1TaskList, appSvelteSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'NewGameTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'browser-entry.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'task-list.md'), 'utf8'),
    fs.readFile(appSveltePath, 'utf8')
  ]);
});

test('Story 25.1/25.2: renderer exposes app-version element for version display in header', () => {
  assert.match(appSvelteSource, /app-version/, 'renderer must reference app-version (class or id)');
  assert.match(appSvelteSource, /APP_VERSION/, 'renderer must define or use APP_VERSION constant');
});

test('Story 25.2: CSS contains reduced header padding', () => {
  // Old padding was var(--space-5) var(--space-5) var(--space-4) — now must be smaller
  assert.doesNotMatch(
    cssSource,
    /\.app-header\s*\{[^}]*padding:\s*var\(--space-5\)\s*var\(--space-5\)\s*var\(--space-4\)/,
    'header must no longer use the old large padding'
  );
  assert.match(cssSource, /\.app-header\s*\{/, 'app-header rule must still exist');
});

test('Story 25.2: CSS contains reduced h1 font size in header', () => {
  // Old size was var(--type-display-md-size) = 1.75rem — must be reduced
  assert.doesNotMatch(
    cssSource,
    /\.app-header h1[^}]*font-size:\s*var\(--type-display-md-size\)/,
    'app-header h1 must not use the old display-md font size'
  );
});

test('Story 25.2: CSS contains .app-version style rule', () => {
  assert.match(cssSource, /\.app-version\s*\{/, 'CSS must include .app-version rule');
  assert.match(cssSource, /\.app-version[^}]*opacity/, '.app-version must set opacity for subdued presentation');
});

test('Story 25.3: renderer does NOT render Generate Setup and Regenerate as simultaneous separate buttons', () => {
  // Old pattern: generate-setup button followed immediately by regenerate-setup button in the same button-row
  assert.doesNotMatch(
    newGameTabSource,
    /data-action="generate-setup"[^<]{0,200}data-action="regenerate-setup"/,
    'generate-setup and regenerate-setup must not appear as two separate sequential buttons'
  );
});

test('Story 25.3: renderer uses a single context-sensitive generate button', () => {
  assert.match(
    newGameTabSource,
    /data-action="generate-setup"/,
    'generate-setup action must still exist'
  );
  assert.match(
    newGameTabSource,
    /newGame\.reroll/,
    'renderer must reference newGame.reroll for the setup-present label'
  );
});

test('Story 25.4: generate button row appears before forced picks panel in render source', () => {
  const generateButtonIdx = newGameTabSource.indexOf('data-action="generate-setup"');
  const forcedPicksPanelIdx = newGameTabSource.indexOf('data-forced-picks-panel');
  assert.ok(generateButtonIdx !== -1, 'generate-setup button must exist in NewGameTab');
  assert.ok(forcedPicksPanelIdx !== -1, 'data-forced-picks-panel must exist in NewGameTab');
  assert.ok(
    generateButtonIdx < forcedPicksPanelIdx,
    `generate button (at ${generateButtonIdx}) must appear before forced-picks-panel (at ${forcedPicksPanelIdx}) in source`
  );
});

test('Epic 25 stories 25.1–25.4 are marked complete in post-v1 task list', () => {
  assert.match(postV1TaskList, /## Epic 25 — Header and New Game Action Density Refinement/);

  // Story 25.1 tasks
  assert.match(postV1TaskList, /- \[x\] Audit the current header for permanently visible elements/);
  assert.match(postV1TaskList, /- \[x\] Define where the app version should appear/);

  // Story 25.2 tasks
  assert.match(postV1TaskList, /- \[x\] Reassess the placement and density of theme and locale controls/);
  assert.match(postV1TaskList, /- \[x\] Introduce a lighter header presentation/);

  // Story 25.3 tasks
  assert.match(postV1TaskList, /- \[x\] Define the single primary action contract for first generation/);
  assert.match(postV1TaskList, /- \[x\] Remove redundant button labeling/);

  // Story 25.4 tasks
  assert.match(postV1TaskList, /- \[x\] Audit which optional information blocks currently push the primary generate action/);
  assert.match(postV1TaskList, /- \[x\] Reorder or condense the New Game layout/);

  // Full regression gate
  assert.match(postV1TaskList, /- \[x\] \*\*Full regression gate:\*\*/);
});
