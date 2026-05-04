import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let historyTabSource;
let collectionTabSource;
let cssSource;

beforeAll(async () => {
  [historyTabSource, collectionTabSource, cssSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'HistoryTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'CollectionTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8')
  ]);
});

test('Renderer uses <details> element for per-category stats panels', () => {

  assert.match(historyTabSource, /stats-category-panel/);
  assert.match(historyTabSource, /<details\s[^>]*class="stats-category-panel"/);
});

test('Renderer uses <summary> with stats-category-summary class', () => {

  assert.match(historyTabSource, /<summary\s[^>]*class="stats-category-summary"/);
});

test('Renderer emits data-stats-category attribute on each panel', () => {

  assert.match(historyTabSource, /data-stats-category=\{category\.category\}/);
});

test('Renderer wraps category body in stats-category-body div', () => {

  assert.match(historyTabSource, /class="stats-category-body"/);
});

test('CSS defines .stats-category-panel rule', () => {

  assert.match(cssSource, /\.stats-category-panel\s*\{/);
});

test('CSS defines .stats-category-summary rule', () => {

  assert.match(cssSource, /\.stats-category-summary\s*\{/);
});

test('CSS defines .stats-category-body rule', () => {

  assert.match(cssSource, /\.stats-category-body\s*\{/);
});

test('CSS defines global open-state indicator for details[open] summary::after', () => {

  assert.match(cssSource, /details\[open\]\s+summary::after/);
});

test('Renderer does NOT contain the groupingNotice technical disclaimer text', () => {

  assert.doesNotMatch(historyTabSource, /groupingNotice/);
  assert.doesNotMatch(historyTabSource, /Presentation only\. Grouping never changes/);
});

test('Renderer does NOT render the groupingNotice span in grouping controls', () => {

  assert.doesNotMatch(historyTabSource, /class="muted">\$\{locale\.t\('history\.groupingNotice'\)\}/);
});

test('Renderer renders storage status conditionally on !storageAvailable', () => {

  assert.match(collectionTabSource, /!\s*persistence\.storageAvailable/);
});

test('Renderer does NOT unconditionally display the storage available label', () => {

  assert.doesNotMatch(collectionTabSource, /persistence\.storageAvailable\s*\?\s*locale\.t\('collection\.storage\.available'\)/);
});

// ── From epic78-ui-layout-polish (HistoryTab parts) ─────────────────────

test('History grouping controls contains button-row-scroll class', () => {
  assert.match(
    historyTabSource,
    /data-history-grouping-controls[\s\S]{0,200}button-row-scroll/,
    '[data-history-grouping-controls] must contain an element with class button-row-scroll'
  );
});

test('History grouping pill row does NOT have the wrap class', () => {
  const groupingSection = historyTabSource.match(/data-history-grouping-controls[\s\S]*?data-outcome-filter-row/);
  assert.ok(groupingSection, 'data-history-grouping-controls section must exist');
  assert.doesNotMatch(
    groupingSection[0].split('data-outcome-filter-row')[0],
    /class="button-row wrap"/,
    'The grouping-mode button row must not have the wrap class'
  );
});

test('History grouping pill row has role="group"', () => {
  assert.match(
    historyTabSource,
    /class="button-row button-row-scroll"\s+role="group"/,
    'grouping pill row must have role="group"'
  );
});

// ── From epic78-ui-layout-polish (CSS assertions for button-row-scroll) ────────

test('CSS contains .button-row-scroll with flex-wrap: nowrap', () => {
  assert.match(cssSource, /\.button-row-scroll\s*\{/, 'CSS must have .button-row-scroll rule');
  assert.match(cssSource, /\.button-row-scroll[^}]*flex-wrap:\s*nowrap/, '.button-row-scroll must set flex-wrap: nowrap');
  assert.match(cssSource, /\.button-row-scroll[^}]*overflow-x:\s*auto/, '.button-row-scroll must set overflow-x: auto');
  assert.match(cssSource, /\.button-row-scroll[^}]*padding-top\s*:/, '.button-row-scroll must set padding-top for hover/focus clearance');
});

test('CSS contains .button-row-scroll > * with flex-shrink: 0', () => {
  assert.match(cssSource, /\.button-row-scroll\s*>\s*\*\s*\{[^}]*flex-shrink:\s*0/, '.button-row-scroll > * must set flex-shrink: 0');
});

// ── From design-system-rollout (HistoryTab design-system adoption assertions) ──

test('HistoryTab result form uses role="alert" on error element', () => {
  assert.match(historyTabSource, /role="alert"[\s\S]*data-result-form-error/);
});

// ── Epic 86 — Story 86.1 — .button-row margin-bottom token ──

test('CSS .button-row has token-based margin-bottom', () => {
  assert.match(
    cssSource,
    /\.button-row\s*\{[^}]*margin-bottom\s*:\s*var\(--space-/,
    '.button-row must have a margin-bottom using a design-system token'
  );
});

// ── Epic 86 — Story 86.3 — :has(:focus-visible) for history items ──

test('CSS uses :has(:focus-visible) for .history-item (not :focus-within)', () => {
  assert.match(
    cssSource,
    /\.history-item:has\(:focus-visible\)/,
    '.history-item must use :has(:focus-visible) for the focus ring'
  );
  assert.doesNotMatch(
    cssSource,
    /\.history-item:focus-within/,
    '.history-item must NOT use :focus-within for the focus ring'
  );
});

// ── Epic 87 — Story 87.4 — expansion usage percentage integration tests ──

test('HistoryTab.svelte references computeExpansionUsagePercent', () => {
  assert.match(
    historyTabSource,
    /computeExpansionUsagePercent/,
    'HistoryTab.svelte must reference computeExpansionUsagePercent'
  );
});

test('HistoryTab.svelte references locale key history.insights.playCountWithPercent', () => {
  assert.match(
    historyTabSource,
    /history\.insights\.playCountWithPercent/,
    'HistoryTab.svelte must reference the locale key history.insights.playCountWithPercent'
  );
});

// ── Epic 91 — Story 91.3 — expansion usage panel locale key references ──

test('HistoryTab.svelte references locale key history.insights.expansionUsage', () => {
  assert.match(
    historyTabSource,
    /history\.insights\.expansionUsage[^G]/,
    'HistoryTab.svelte must reference history.insights.expansionUsage'
  );
});

test('HistoryTab.svelte references locale key history.insights.expansionUsageSummary', () => {
  assert.match(
    historyTabSource,
    /history\.insights\.expansionUsageSummary/,
    'HistoryTab.svelte must reference history.insights.expansionUsageSummary'
  );
});

test('HistoryTab.svelte references locale key history.insights.expansionUsageGames', () => {
  assert.match(
    historyTabSource,
    /history\.insights\.expansionUsageGames/,
    'HistoryTab.svelte must reference history.insights.expansionUsageGames'
  );
});

test('HistoryTab.svelte references locale key history.insights.noExpansionData', () => {
  assert.match(
    historyTabSource,
    /history\.insights\.noExpansionData/,
    'HistoryTab.svelte must reference history.insights.noExpansionData'
  );
});

