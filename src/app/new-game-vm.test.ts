import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let newGameVmSource;
let appSvelteSource;

beforeAll(async () => {
  [newGameVmSource, appSvelteSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'new-game-vm.svelte.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8')
  ]);
});

test('Suppresses redundant generator toasts and keeps critical alerts persistent in source behavior', () => {

  assert.doesNotMatch(appSvelteSource, /setup\.notices\.forEach\(\(notice\) => enqueueToast/);
  assert.doesNotMatch(appSvelteSource, /Generated a fully fresh setup\./);
  assert.match(newGameVmSource, /toast\.error\(error instanceof Error \? error\.message : String\(error\),\s*\{\s*duration:\s*Infinity/);
});
