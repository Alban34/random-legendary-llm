import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEpic1Bundle } from './game-data-pipeline.ts';
import { rankItemsByFreshness } from './setup-freshness.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;
beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Hero freshness ranking prefers never-played first, then least-played, items with equal plays are shuffled together', () => {

  const heroes = bundle.runtime.indexes.allHeroes.slice(0, 6);
  const usage = {
    [heroes[2].id]: { plays: 1, lastPlayedAt: '2026-04-03T12:00:00.000Z' },
    [heroes[3].id]: { plays: 1, lastPlayedAt: '2026-04-05T12:00:00.000Z' },
    [heroes[4].id]: { plays: 2, lastPlayedAt: '2026-04-01T12:00:00.000Z' },
    [heroes[5].id]: { plays: 2, lastPlayedAt: '2026-04-02T12:00:00.000Z' }
  };

  const ranked = rankItemsByFreshness(heroes, usage, () => 0);
  assert.deepEqual(new Set(ranked.slice(0, 2).map((entity) => entity.id)), new Set([
    heroes[0].id,
    heroes[1].id
  ]));
  assert.deepEqual(new Set(ranked.slice(2, 4).map((entity) => entity.id)), new Set([
    heroes[2].id,
    heroes[3].id
  ]));
  assert.deepEqual(new Set(ranked.slice(4, 6).map((entity) => entity.id)), new Set([
    heroes[4].id,
    heroes[5].id
  ]));
});
