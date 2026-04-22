import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let rendererSource;
let historyTabSource;
let collectionTabSource;
let cssSource;

before(async () => {
  [rendererSource, historyTabSource, collectionTabSource, cssSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'HistoryTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'CollectionTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8')
  ]);
});

test('Epic 23.2 — renderer uses <details> element for per-category stats panels', () => {
  assert.match(historyTabSource, /stats-category-panel/);
  assert.match(historyTabSource, /<details\s[^>]*class="stats-category-panel"/);
});

test('Epic 23.2 — renderer uses <summary> with stats-category-summary class', () => {
  assert.match(historyTabSource, /<summary\s[^>]*class="stats-category-summary"/);
});

test('Epic 23.2 — renderer emits data-stats-category attribute on each panel', () => {
  assert.match(historyTabSource, /data-stats-category=\{category\.category\}/);
});

test('Epic 23.2 — renderer wraps category body in stats-category-body div', () => {
  assert.match(historyTabSource, /class="stats-category-body"/);
});

test('Epic 23.2 — CSS defines .stats-category-panel rule', () => {
  assert.match(cssSource, /\.stats-category-panel\s*\{/);
});

test('Epic 23.2 — CSS defines .stats-category-summary rule', () => {
  assert.match(cssSource, /\.stats-category-summary\s*\{/);
});

test('Epic 23.2 — CSS defines .stats-category-body rule', () => {
  assert.match(cssSource, /\.stats-category-body\s*\{/);
});

test('Epic 23.2 — CSS defines open-state indicator for details[open] .stats-category-summary', () => {
  assert.match(cssSource, /details\[open\]\s+\.stats-category-summary/);
});

test('Epic 23.3 — renderer does NOT contain the groupingNotice technical disclaimer text', () => {
  assert.doesNotMatch(historyTabSource, /groupingNotice/);
  assert.doesNotMatch(historyTabSource, /Presentation only\. Grouping never changes/);
});

test('Epic 23.3 — renderer does NOT render the groupingNotice span in grouping controls', () => {
  assert.doesNotMatch(historyTabSource, /class="muted">\$\{locale\.t\('history\.groupingNotice'\)\}/);
});

test('Epic 23.4 — renderer renders storage status conditionally on !storageAvailable', () => {
  assert.match(collectionTabSource, /!\s*persistence\.storageAvailable/);
});

test('Epic 23.4 — renderer does NOT unconditionally display the storage available label', () => {
  assert.doesNotMatch(collectionTabSource, /persistence\.storageAvailable\s*\?\s*locale\.t\('collection\.storage\.available'\)/);
});


