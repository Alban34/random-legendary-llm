import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEpic1Bundle } from './game-data-pipeline.ts';
import { createStorageAdapter } from './storage-adapter.ts';
import { createDefaultState } from './state-defaults.ts';
import { loadState } from './state-io.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;
beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Handles unavailable browser storage gracefully', () => {

  const storageAdapter = createStorageAdapter(undefined);
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.equal(loaded.storageAvailable, false);
  assert.deepEqual(loaded.state, createDefaultState());
  assert.ok(loaded.notices[0].includes('Browser storage is unavailable'));
});

test('Storage degradation keeps a default in-memory state and exposes a readable compatibility message', () => {

  const brokenStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('Storage blocked for test');
    },
    removeItem() {
      throw new Error('Storage blocked for test');
    }
  };

  const storageAdapter = createStorageAdapter(brokenStorage);
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.equal(storageAdapter.available, false);
  assert.equal(storageAdapter.setItem('x', 'y').ok, false);
  assert.equal(storageAdapter.removeItem('x').storageAvailable, false);
  assert.deepEqual(loaded.state, createDefaultState());
  assert.equal(loaded.storageAvailable, false);
  assert.equal(loaded.recovered, true);
  assert.ok(loaded.notices[0].includes('Browser storage is unavailable'));
});
