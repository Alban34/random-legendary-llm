import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let rendererSource;
let shellCssSource;
let localizationSource;
let appSvelteSource;
let newGameVmSource;

beforeAll(async () => {
  [rendererSource, shellCssSource, localizationSource, appSvelteSource, newGameVmSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'en.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'new-game-vm.svelte.ts'), 'utf8')
  ]);
});

test('Debug snapshot <details> element is absent from renderer', () => {

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

test('Ships visible focus styling in app-shell.css', () => {

  assert.match(shellCssSource, /button:focus-visible/);
  assert.match(shellCssSource, /\.tab-button:focus-visible/);
  assert.match(shellCssSource, /summary:focus-visible/);
});

// ── From epic16-notification-refinements (app-renderer parts) ────────────────

test('Suppresses redundant generator toasts and keeps critical alerts persistent in source behavior', () => {

  assert.doesNotMatch(appSvelteSource, /setup\.notices\.forEach\(\(notice\) => enqueueToast/);
  assert.doesNotMatch(appSvelteSource, /Generated a fully fresh setup\./);
  assert.match(newGameVmSource, /toast\.error\(error instanceof Error \? error\.message : String\(error\),\s*\{\s*duration:\s*Infinity/);
});

// ── From epic17-onboarding-information-architecture (renderer parts) ──────────

test('Renderer source includes replayable onboarding and an About entry point instead of default diagnostics', () => {

  assert.match(localizationSource, /First-run walkthrough/);
  assert.match(localizationSource, /Replay Walkthrough/);
  assert.match(localizationSource, /About this project/);
  assert.doesNotMatch(rendererSource, /Developer diagnostics<\/h2>/);
});

// ── From epic21-browse-polish (app-renderer parts) ───────────────────────────

test('Ready Tabs metric is removed from renderer', () => {

  assert.doesNotMatch(rendererSource, /Ready Tabs/);
});
