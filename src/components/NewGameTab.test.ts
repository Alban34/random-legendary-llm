import { test, it, describe, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let newGameTabSource;
let appSvelteSource;
let activeSetFilterPanelSource;
let forcedPicksPanelSource;

beforeAll(async () => {
  [newGameTabSource, appSvelteSource, activeSetFilterPanelSource, forcedPicksPanelSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'NewGameTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'ActiveSetFilterPanel.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'ForcedPicksPanel.svelte'), 'utf8'),
  ]);
});

// ── Story 72.1 — Toggle button present in Active Expansions header ──────────

test('Active Expansions panel retains data-active-filter-panel attribute', () => {
  assert.match(
    activeSetFilterPanelSource,
    /data-active-filter-panel/,
    'data-active-filter-panel attribute must exist in NewGameTab'
  );
});

test('Active Expansions section uses a <details data-active-filter-panel> element', () => {
  assert.match(
    activeSetFilterPanelSource,
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
    activeSetFilterPanelSource,
    /<details[^>]*data-active-filter-panel/,
    'Active Expansions must use a native <details> element; the browser preserves its open state across tab switches without a JS variable'
  );
  assert.doesNotMatch(
    newGameTabSource,
    /let\s+activeExpansionsPanelOpen\s*=\s*\$state/,
    'activeExpansionsPanelOpen $state variable must not exist; <details> handles state natively'
  );
});

// ── From epic80-active-expansions-layout-alignment ───────────────────────────

describe('Epic 80 — Active Expansions Layout Alignment', () => {
  describe('Story 80.1 — Apply the Forced Picks collapsible pattern to Active Expansions', () => {
    it('Active Expansions outer element is a <details data-active-filter-panel>', () => {
      assert.match(activeSetFilterPanelSource, /<details[^>]*data-active-filter-panel/);
    });

    it('activeExpansionsPanelOpen state variable is removed', () => {
      assert.doesNotMatch(
        newGameTabSource,
        /let\s+activeExpansionsPanelOpen\s*=\s*\$state\(false\)/
      );
    });

    it('Manual toggle button with data-action="toggle-active-filter-panel" is removed', () => {
      assert.doesNotMatch(
        newGameTabSource,
        /data-action="toggle-active-filter-panel"/
      );
    });

    it('{#if activeExpansionsPanelOpen} guard is removed', () => {
      assert.doesNotMatch(newGameTabSource, /\{#if activeExpansionsPanelOpen\}/);
    });
  });

  describe('Story 80.2 — Reorder Active Expansions below Forced Picks', () => {
    it('Active Expansions block appears after Forced Picks in source order', () => {
      assert.ok(
        newGameTabSource.indexOf('<ActiveSetFilterPanel') >
          newGameTabSource.indexOf('<ForcedPicksPanel'),
        'data-active-filter-panel must appear after data-forced-picks-panel in NewGameTab.svelte'
      );
    });
  });
});

// ── From epic25-header-new-game (NewGameTab button assertion) ────────────────

test('Renderer does NOT render Generate Setup and Regenerate as simultaneous separate buttons', () => {

  assert.doesNotMatch(
    newGameTabSource,
    /data-action="generate-setup"[^<]{0,200}data-action="regenerate-setup"/,
    'generate-setup and regenerate-setup must not appear as two separate sequential buttons'
  );
});

test('Renderer uses a single context-sensitive generate button', () => {

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

test('Generate button row appears before forced picks panel in render source', () => {

  const generateButtonIdx = newGameTabSource.indexOf('data-action="generate-setup"');
  const forcedPicksPanelIdx = newGameTabSource.indexOf('<ForcedPicksPanel');
  assert.ok(generateButtonIdx !== -1, 'generate-setup button must exist in NewGameTab');
  assert.ok(forcedPicksPanelIdx !== -1, 'data-forced-picks-panel must exist in NewGameTab');
  assert.ok(
    generateButtonIdx < forcedPicksPanelIdx,
    `generate button (at ${generateButtonIdx}) must appear before forced-picks-panel (at ${forcedPicksPanelIdx}) in source`
  );
});

// ── From epic78-ui-layout-polish (NewGameTab parts) ──────────────────────────

test('NewGameTab contains [data-new-game-status-summary]', () => {
  assert.match(newGameTabSource, /data-new-game-status-summary/, 'NewGameTab must contain data-new-game-status-summary');
});

test('NewGameTab does NOT contain old summary-grid with three separate status cards', () => {
  assert.doesNotMatch(
    newGameTabSource,
    /<div class="summary-grid">[\s\S]{0,600}newGame\.selectedMode[\s\S]{0,600}newGame\.ownedSets[\s\S]{0,600}newGame\.lastPersistedMode[\s\S]{0,200}<\/div>\s*<\/div>/,
    'Old summary-grid with three separate status cards must not exist'
  );
});

test('NewGameTab contains the two remaining data-status-field spans', () => {
  assert.doesNotMatch(newGameTabSource, /data-status-field="selected-mode"/, 'must NOT have data-status-field="selected-mode"');
  assert.match(newGameTabSource, /data-status-field="owned-sets"/, 'must have data-status-field="owned-sets"');
  assert.match(newGameTabSource, /data-status-field="last-persisted"/, 'must have data-status-field="last-persisted"');
});

// ── Epic 86 — Story 86.2 — Selected mode label removed ──

test('NewGameTab does NOT contain data-status-field="selected-mode"', () => {
  assert.doesNotMatch(
    newGameTabSource,
    /data-status-field="selected-mode"/,
    'selected-mode status field must be absent from the preview pane'
  );
});

// ── Epic 83 — Story 83.1 — Forced Picks layout ──

test('NewGameTab still contains data-forced-picks-panel attribute', () => {
  assert.match(
    forcedPicksPanelSource,
    /data-forced-picks-panel/,
    'data-forced-picks-panel attribute must exist in NewGameTab'
  );
});

test('Forced Picks <details> wraps a <section class="result-card" data-forced-picks-panel>', () => {
  assert.match(
    forcedPicksPanelSource,
    /<section[^>]*class="result-card"[^>]*data-forced-picks-panel/,
    'The Forced Picks panel must be a <section class="result-card" data-forced-picks-panel>'
  );
});

test('<select> elements inside Forced Picks panel carry data-forced-pick-select attributes', () => {
  assert.match(
    forcedPicksPanelSource,
    /data-forced-pick-select/,
    '<select> elements in Forced Picks panel must carry data-forced-pick-select attributes'
  );
});
