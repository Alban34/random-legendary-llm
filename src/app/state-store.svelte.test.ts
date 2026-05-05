// src/app/state-store.svelte.test.ts
// Source-assertion tests for state-store.svelte.ts.
// This file uses Svelte 5 $state runes and cannot be imported in Node.js.
// We read the source as a string and assert on its structure.

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
  source = await fs.readFile(path.join(rootDir, 'src', 'app', 'state-store.svelte.ts'), 'utf8');
});

test('state-store.svelte.ts re-exports everything from state-store.ts', () => {
  assert.match(source, /export \* from ['"]\.\/state-store\.ts['"]/);
});

test('state-store.svelte.ts exports getAppState and setAppState functions', () => {
  assert.match(source, /export function getAppState\(\)/);
  assert.match(source, /export function setAppState\(/);
});

test('reactive _appState is initialised with $state rune', () => {
  assert.match(source, /\$state<AppState>\(createDefaultState\(\)\)/);
});

test('setAppState uses Object.assign to update state in-place', () => {
  assert.match(source, /Object\.assign\(_appState,\s*newState\)/);
});
