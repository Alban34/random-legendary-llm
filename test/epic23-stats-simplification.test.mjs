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
let postV1TaskList;

before(async () => {
  [rendererSource, historyTabSource, collectionTabSource, cssSource, postV1TaskList] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'HistoryTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'CollectionTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'task-list.md'), 'utf8')
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

test('Epic 23.1–23.4 — task list shows stories 23.1–23.4 checked', () => {
  // All task boxes in stories 23.1–23.4 should be checked
  const story231Block = postV1TaskList.match(/### Story 23\.1[\s\S]*?(?=### Story 23\.2)/)?.[0] ?? '';
  const story232Block = postV1TaskList.match(/### Story 23\.2[\s\S]*?(?=### Story 23\.3)/)?.[0] ?? '';
  const story233Block = postV1TaskList.match(/### Story 23\.3[\s\S]*?(?=### Story 23\.4)/)?.[0] ?? '';
  const story234Block = postV1TaskList.match(/### Story 23\.4[\s\S]*?(?=### Story 23\.5)/)?.[0] ?? '';

  assert.doesNotMatch(story231Block, /- \[ \]/);
  assert.doesNotMatch(story232Block, /- \[ \]/);
  assert.doesNotMatch(story233Block, /- \[ \]/);
  assert.doesNotMatch(story234Block, /- \[ \]/);

  assert.match(story231Block, /- \[x\]/);
  assert.match(story232Block, /- \[x\]/);
  assert.match(story233Block, /- \[x\]/);
  assert.match(story234Block, /- \[x\]/);
});

test('Epic 23 — full regression gate is marked checked in task list', () => {
  assert.match(postV1TaskList, /- \[x\] \*\*Full regression gate:\*\*[\s\S]*?Epic 23/);
});
