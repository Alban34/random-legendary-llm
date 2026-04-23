import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const browserEntryPath = path.join(rootDir, 'src', 'app', 'browser-entry.ts');
const rendererPath = path.join(rootDir, 'src', 'app', 'app-renderer.ts');
const appSveltePath = path.join(rootDir, 'src', 'components', 'App.svelte');
const localizationPath = path.join(rootDir, 'src', 'app', 'locales', 'en.ts');

let browserEntrySource;
let rendererSource;
let appSvelteSource;
let localizationSource;

beforeAll(async () => {
  [browserEntrySource, rendererSource, appSvelteSource, localizationSource] = await Promise.all([
    fs.readFile(browserEntryPath, 'utf8'),
    fs.readFile(rendererPath, 'utf8'),
    fs.readFile(appSveltePath, 'utf8'),
    fs.readFile(localizationPath, 'utf8')
  ]);
});

test('Suppresses redundant generator toasts and keeps critical alerts persistent in source behavior', () => {

  assert.doesNotMatch(appSvelteSource, /setup\.notices\.forEach\(\(notice\) => enqueueToast/);
  assert.doesNotMatch(appSvelteSource, /Generated a fully fresh setup\./);
  assert.match(appSvelteSource, /toast\.error\(error\.message,\s*\{\s*duration:\s*Infinity/);
});