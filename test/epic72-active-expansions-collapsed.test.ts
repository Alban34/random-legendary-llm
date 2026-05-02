import { test, beforeAll } from 'vitest';
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

test('Active Expansions section no longer uses a <details> element', () => {
  assert.doesNotMatch(
    newGameTabSource,
    /<details[^>]*data-active-filter-panel/,
    'data-active-filter-panel must no longer be a <details> element'
  );
});

test('Active Expansions header contains a toggle button with data-action="toggle-active-filter-panel"', () => {
  assert.match(
    newGameTabSource,
    /data-action="toggle-active-filter-panel"/,
    'toggle button must carry data-action="toggle-active-filter-panel"'
  );
});

test('Toggle button carries aria-expanded bound to activeExpansionsPanelOpen', () => {
  assert.match(
    newGameTabSource,
    /aria-expanded=\{activeExpansionsPanelOpen\}/,
    'toggle button must carry aria-expanded={activeExpansionsPanelOpen}'
  );
});

test('Toggle button carries an aria-label using the newGame.activeFilter.title locale key', () => {
  assert.match(
    newGameTabSource,
    /aria-label=\{locale\.t\('newGame\.activeFilter\.title'\)\}/,
    "toggle button must carry aria-label={locale.t('newGame.activeFilter.title')}"
  );
});

test('Toggle button onclick flips activeExpansionsPanelOpen', () => {
  assert.match(
    newGameTabSource,
    /activeExpansionsPanelOpen\s*=\s*!activeExpansionsPanelOpen/,
    'toggle button onclick must flip activeExpansionsPanelOpen'
  );
});

test('Toggle button is a native <button> element (keyboard-operable by default)', () => {
  // Check button element appears with the toggle action — no tabindex suppression
  assert.match(
    newGameTabSource,
    /type="button"[^>]*data-action="toggle-active-filter-panel"|data-action="toggle-active-filter-panel"[^>]*type="button"/,
    'toggle button must be a native <button type="button"> element'
  );
  assert.doesNotMatch(
    newGameTabSource,
    /data-action="toggle-active-filter-panel"[^>]*tabindex="-1"/,
    'toggle button must not suppress keyboard focus with tabindex="-1"'
  );
});

// ── Story 72.2 — Default collapsed on page load ─────────────────────────────

test('activeExpansionsPanelOpen is declared as a let variable initialised to false', () => {
  assert.match(
    newGameTabSource,
    /let\s+activeExpansionsPanelOpen\s*=\s*\$state\(false\)/,
    'activeExpansionsPanelOpen must be a plain let binding initialised to $state(false)'
  );
});

test('{#if activeExpansionsPanelOpen} guard block exists in template', () => {
  assert.match(
    newGameTabSource,
    /\{#if activeExpansionsPanelOpen\}/,
    '{#if activeExpansionsPanelOpen} block must exist in the template'
  );
});

test('Expansion checkboxes are inside the {#if activeExpansionsPanelOpen} guard', () => {
  const ifBlockIdx = newGameTabSource.indexOf('{#if activeExpansionsPanelOpen}');
  assert.ok(ifBlockIdx !== -1, '{#if activeExpansionsPanelOpen} must exist');

  // Find the matching {/if}: because there are no nested {#if} blocks inside
  // the activeExpansionsPanelOpen guard (only {#each}), the first {/if} after
  // the guard opening is the matching close.
  const endIfIdx = newGameTabSource.indexOf('{/if}', ifBlockIdx);
  assert.ok(endIfIdx !== -1, '{/if} closing the activeExpansionsPanelOpen block must exist');

  const ifBlock = newGameTabSource.slice(ifBlockIdx, endIfIdx);
  assert.match(
    ifBlock,
    /data-active-filter-checkbox/,
    'expansion checkboxes must be inside the {#if activeExpansionsPanelOpen} block'
  );
});

test('"Use all" button is inside the {#if activeExpansionsPanelOpen} guard', () => {
  const ifBlockIdx = newGameTabSource.indexOf('{#if activeExpansionsPanelOpen}');
  const endIfIdx = newGameTabSource.indexOf('{/if}', ifBlockIdx);
  const ifBlock = newGameTabSource.slice(ifBlockIdx, endIfIdx);
  assert.match(
    ifBlock,
    /data-action="active-filter-select-all"/,
    '"Use all" button must be inside the {#if activeExpansionsPanelOpen} block'
  );
});

test('"Clear selection" button is inside the {#if activeExpansionsPanelOpen} guard', () => {
  const ifBlockIdx = newGameTabSource.indexOf('{#if activeExpansionsPanelOpen}');
  const endIfIdx = newGameTabSource.indexOf('{/if}', ifBlockIdx);
  const ifBlock = newGameTabSource.slice(ifBlockIdx, endIfIdx);
  assert.match(
    ifBlock,
    /data-action="active-filter-clear-all"/,
    '"Clear selection" button must be inside the {#if activeExpansionsPanelOpen} block'
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

test('activeExpansionsPanelOpen is a plain let (not $derived), so it survives tab switches', () => {
  assert.doesNotMatch(
    newGameTabSource,
    /\$derived[^;]*activeExpansionsPanelOpen/,
    'activeExpansionsPanelOpen must not be a $derived expression'
  );
  assert.match(
    newGameTabSource,
    /let\s+activeExpansionsPanelOpen\s*=\s*\$state/,
    'activeExpansionsPanelOpen must be a plain let $state variable'
  );
});
