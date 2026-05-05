import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Bundle summary remains internally green', () => {

  assert.deepEqual(bundle.counts, {
    sets: 39,
    heroes: 296,
    masterminds: 106,
    villainGroups: 126,
    henchmanGroups: 44,
    schemes: 186
  });
  assert.equal(bundle.tests.length, 7);
  assert.equal(bundle.tests.filter((entry) => entry.status === 'fail').length, 0);
});

