import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let rendererSource;
let cssSource;
let localeSource;
let postV1TaskList;

before(async () => {
  [rendererSource, cssSource, localeSource, postV1TaskList] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'localization-utils.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'task-list.md'), 'utf8')
  ]);
});

test('Story 27.1 — debug snapshot <details> element is absent from renderer', () => {
  assert.doesNotMatch(
    rendererSource,
    /newGame\.result\.snapshot/,
    'renderer must not reference the snapshot locale key'
  );
  assert.doesNotMatch(
    rendererSource,
    /setupSnapshot[\s\S]{0,20}JSON\.stringify/,
    'renderer must not JSON.stringify setupSnapshot for display'
  );
});

test('Story 27.1 — snapshot locale key is removed from localization-utils', () => {
  assert.doesNotMatch(
    localeSource,
    /newGame\.result\.snapshot/,
    'snapshot locale key must be removed from all locale objects'
  );
});

test('Story 27.2 — app-header h1 font size is larger than 1.1rem', () => {
  // The font-size must have been increased from the old 1.1rem
  assert.doesNotMatch(
    cssSource,
    /\.app-header h1[^}]*font-size:\s*1\.1rem/,
    'app-header h1 must no longer use the old 1.1rem font size'
  );
  assert.match(
    cssSource,
    /\.app-header h1/,
    'app-header h1 rule must still exist'
  );
});

test('Story 27.2 — header-inner uses center alignment', () => {
  // align-items: end was replaced with align-items: center for title/controls alignment
  assert.match(
    cssSource,
    /\.header-inner\s*\{[^}]*align-items:\s*center/,
    'header-inner must use align-items: center'
  );
});

test('Story 27.3 — app-version element is still present (compact version display)', () => {
  // Version display introduced in Epic 25 must remain
  assert.match(rendererSource, /app-version/, 'app-version reference must remain');
});

test('Epic 27 stories are marked complete in task-list.md', () => {
  assert.match(postV1TaskList, /## Epic 27 — Remaining Shell and Debug Polish/);
  assert.match(postV1TaskList, /- \[x\] Locate every render path that conditionally or unconditionally shows the "Show history-ready setup snapshot"/);
  assert.match(postV1TaskList, /- \[x\] Remove the control, trigger button, and panel output from all production-rendered surfaces/);
  assert.match(postV1TaskList, /- \[x\] Identify the current font-size and vertical-alignment rules applied to the app title element/);
  assert.match(postV1TaskList, /- \[x\] Increase the app title font size/);
  assert.match(postV1TaskList, /- \[x\] Apply vertical-alignment rules so the title sits at the same baseline or midpoint/);
});

test('Epic 27 full regression gate is marked in task-list.md', () => {
  assert.match(
    postV1TaskList,
    /- \[x\] \*\*Full regression gate:\*\* run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 27 work complete/
  );
});
