import { test, it, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let newGameTabSource;
let appSvelteSource;

beforeAll(async () => {
  [newGameTabSource, appSvelteSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'NewGameTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
  ]);
});

// ── Story 72.1 — Toggle button present in Active Expansions header ──────────

test('Active Expansions panel retains data-active-filter-panel attribute', () => {
  assert.match(
    newGameTabSource,
    /data-active-filter-panel/,
    'data-active-filter-panel attribute must exist in NewGameTab'
  );
});

test('Active Expansions section uses a <details data-active-filter-panel> element', () => {
  assert.match(
    newGameTabSource,
    /<details[^>]*data-active-filter-panel/,
    'data-active-filter-panel must be a <details> element'
  );
});

// ── Story 72.3 — State preserved across tab navigation ──────────────────────

test('App.svelte tab panels are gated with hidden={activeTabId !== tab.id}', () => {
  assert.match(
    appSvelteSource,
    /hidden=\{activeTabId !== tab\.id\}/,
    'tab panels must use hidden={activeTabId !== tab.id} so components are never unmounted'
  );
});

test('NewGameTab appears inside the {#each APP_TABS} loop in App.svelte', () => {
  const eachIdx = appSvelteSource.indexOf('{#each APP_TABS as tab');
  const newGameTabIdx = appSvelteSource.indexOf('<NewGameTab', eachIdx);
  assert.ok(eachIdx !== -1, '{#each APP_TABS as tab} must exist in App.svelte');
  assert.ok(
    newGameTabIdx > eachIdx,
    '<NewGameTab must appear inside the {#each APP_TABS} loop so it is always mounted once loaded'
  );
});

it('Active Expansions uses <details> whose open state is preserved natively through tab switches (no JS variable needed)', () => {
  assert.match(
    newGameTabSource,
    /<details[^>]*data-active-filter-panel/,
    'Active Expansions must use a native <details> element; the browser preserves its open state across tab switches without a JS variable'
  );
  assert.doesNotMatch(
    newGameTabSource,
    /let\s+activeExpansionsPanelOpen\s*=\s*\$state/,
    'activeExpansionsPanelOpen $state variable must not exist; <details> handles state natively'
  );
});
