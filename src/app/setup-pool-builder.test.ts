import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEpic1Bundle } from './game-data-pipeline.ts';
import { createDefaultState } from './state-store.ts';
import { buildOwnedPools } from './setup-pool-builder.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;
beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

function computeActiveHeroTeamNames(state, bundle) {
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set<string>();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  return [...teamSet].sort((a, b) => a.localeCompare(b));
}

test('activeHeroTeamNames contains only team names present on at least one hero in the owned pool', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const activeHeroTeamNames = computeActiveHeroTeamNames(state, bundle);

  assert.ok(activeHeroTeamNames.length > 0, 'Expected at least one team name');
  for (const team of activeHeroTeamNames) {
    const found = pools.heroes.some((hero) => hero.teams.includes(team));
    assert.ok(found, `Team '${team}' should be present on at least one hero`);
  }
});

test('activeHeroTeamNames is sorted alphabetically', () => {
  const state = createAllOwnedState();
  const activeHeroTeamNames = computeActiveHeroTeamNames(state, bundle);

  for (let i = 1; i < activeHeroTeamNames.length; i++) {
    assert.ok(
      activeHeroTeamNames[i - 1].localeCompare(activeHeroTeamNames[i]) <= 0,
      `Expected sorted order but '${activeHeroTeamNames[i - 1]}' comes before '${activeHeroTeamNames[i]}'`
    );
  }
});

test('activeHeroTeamNames is deduplicated', () => {
  const state = createAllOwnedState();
  const activeHeroTeamNames = computeActiveHeroTeamNames(state, bundle);

  const uniqueNames = new Set(activeHeroTeamNames);
  assert.equal(activeHeroTeamNames.length, uniqueNames.size, 'Expected no duplicate team names');
});

test('activeHeroTeamNames contains no empty strings', () => {
  const state = createAllOwnedState();
  const activeHeroTeamNames = computeActiveHeroTeamNames(state, bundle);

  assert.ok(
    activeHeroTeamNames.every((name) => typeof name === 'string' && name.length > 0),
    'Expected no empty strings in activeHeroTeamNames'
  );
});
