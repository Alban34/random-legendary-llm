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
let generatorSource;
let appSvelteSource;

const appSveltePath = path.join(rootDir, 'src', 'components', 'App.svelte');

before(async () => {
  [rendererSource, cssSource, localeSource, generatorSource, appSvelteSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'localization-utils.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'setup-generator.ts'), 'utf8'),
    fs.readFile(appSveltePath, 'utf8')
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

test('Story 27.2 — header-top-row uses center alignment', () => {
  // align-items: center moved from .header-inner to .header-top-row in the column layout refactor
  assert.match(
    cssSource,
    /\.header-top-row\s*\{[^}]*align-items:\s*center/,
    'header-top-row must use align-items: center'
  );
});

test('Story 27.3 — app-version element is still present (compact version display)', () => {
  // Version display introduced in Epic 25 must remain
  assert.match(appSvelteSource, /app-version/, 'app-version reference must remain');
});

// Story 27.4 — schemeFallback condition uses .some() not .length
test('Story 27.4 — schemeFallback gate uses fallbackItems.some() not fallbackItems.length', () => {
  // The old bug: fallbackItems.length causes the notification to fire whenever ANY scheme
  // in the pool has been played, even when the selected scheme is the freshest/never-played.
  // The fix: gate on whether the selected scheme itself is in fallbackItems.
  assert.doesNotMatch(
    generatorSource,
    /schemeFallback:.*schemeSelection\.fallbackItems\.length/,
    'schemeFallback must not use fallbackItems.length as its gate (unconditional notification bug)'
  );
  assert.match(
    generatorSource,
    /schemeFallback:.*schemeSelection\.fallbackItems\.some\(\(s\) => s\.id === scheme\.id\)/,
    'schemeFallback must use fallbackItems.some((s) => s.id === scheme.id) to fire only for genuine fallback picks'
  );
});

