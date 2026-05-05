// src/app/app-init.test.ts
// Source-assertion tests for app-init.ts.
// app-init.ts uses import.meta.url and fetch (browser globals), so it cannot be
// imported in Node.js. We read the source as a string and assert on its structure.

import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let source: string;

beforeAll(async () => {
  source = await fs.readFile(path.join(rootDir, 'src', 'app', 'app-init.ts'), 'utf8');
});

test('app-init exports initApp function', () => {
  assert.match(source, /export async function initApp\(\)/);
});

test('AppInitResult interface declares all expected fields', () => {
  assert.match(source, /bundle:\s*Epic1Bundle/);
  assert.match(source, /storageAdapter:\s*StorageAdapter/);
  assert.match(source, /hydratedState:\s*AppState/);
  assert.match(source, /storageAvailable:\s*boolean/);
  assert.match(source, /hydratedFromStorage:\s*boolean/);
  assert.match(source, /recovered:\s*boolean/);
  assert.match(source, /hydrateNotices:\s*string\[\]/);
});

test('loadSeed uses fetch and throws on non-ok responses', () => {
  assert.match(source, /await fetch\(/);
  assert.match(source, /response\.ok/);
  assert.match(source, /throw new Error\(/);
  assert.match(source, /response\.status/);
});

test('initApp calls createStorageAdapter and hydrateState', () => {
  assert.match(source, /createStorageAdapter\(/);
  assert.match(source, /hydrateState\(/);
});

test('initApp spreads hydration result fields into return value', () => {
  assert.match(source, /hydration\.storageAvailable/);
  assert.match(source, /hydration\.hydratedFromStorage/);
  assert.match(source, /hydration\.recovered/);
  assert.match(source, /hydration\.notices/);
});
