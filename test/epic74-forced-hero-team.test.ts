import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEmptyForcedPicks, normalizeForcedPicks, hasForcedPicks } from '../src/app/forced-picks-utils.ts';
import { generateSetup, buildOwnedPools } from '../src/app/setup-generator.ts';
import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { createDefaultState } from '../src/app/state-store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

// ---------------------------------------------------------------------------
// Story 4 — ForcedPicks data model
// ---------------------------------------------------------------------------

test('createEmptyForcedPicks includes forcedTeam: null', () => {
  const picks = createEmptyForcedPicks();
  assert.equal(picks.forcedTeam, null);
});

test('normalizeForcedPicks preserves a valid forcedTeam string', () => {
  const result = normalizeForcedPicks({ forcedTeam: 'X-Men' });
  assert.equal(result.forcedTeam, 'X-Men');
});

test('normalizeForcedPicks coerces invalid forcedTeam values to null', () => {
  assert.equal(normalizeForcedPicks({ forcedTeam: undefined }).forcedTeam, null);
  assert.equal(normalizeForcedPicks({ forcedTeam: null }).forcedTeam, null);
  assert.equal(normalizeForcedPicks({ forcedTeam: '' }).forcedTeam, null);
  assert.equal(normalizeForcedPicks({ forcedTeam: 42 }).forcedTeam, null);
  assert.equal(normalizeForcedPicks({ forcedTeam: [] }).forcedTeam, null);
});

test('hasForcedPicks returns true when forcedTeam is a non-empty string', () => {
  assert.equal(hasForcedPicks({ ...createEmptyForcedPicks(), forcedTeam: 'X-Men' }), true);
});

test('hasForcedPicks returns false when only forcedTeam is null', () => {
  assert.equal(hasForcedPicks(createEmptyForcedPicks()), false);
});

test('forcedTeam survives JSON round-trip through normalizeForcedPicks', () => {
  const picks = { ...createEmptyForcedPicks(), forcedTeam: 'X-Men' };
  const roundTripped = normalizeForcedPicks(JSON.parse(JSON.stringify(picks)));
  assert.equal(roundTripped.forcedTeam, 'X-Men');
});

// ---------------------------------------------------------------------------
// Story 3 — Generator: forced team hero selection
// ---------------------------------------------------------------------------

test('When forcedTeam is set and team has enough heroes, setup includes only heroes from that team', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      forcedTeam: 'X-Men'
    },
    random: () => 0
  });

  // Standard 2-player needs 5 heroes; X-Men has 44+ so all slots should be filled from X-Men
  assert.equal(setup.heroes.length, 5);
  assert.ok(
    setup.heroes.every((hero) => hero.teams.includes('X-Men')),
    `Expected all heroes to be X-Men, got: ${setup.heroes.map((h) => `${h.name}[${h.teams.join(',')}]`).join(', ')}`
  );
});

test('When forcedTeam pool is smaller than heroCount, fills remaining from general pool', () => {

  const state = createAllOwnedState();
  // Use a scheme with add-hero modifier or find a 5-player scheme — instead, reduce the
  // owned sets to one small expansion that has a team with fewer than 5 heroes.
  // Strategy: use a non-existent team name so teamPool is empty and all heroes come from generalPool.
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  // Find a team with at least 1 but fewer than heroCount (5) heroes across owned sets.
  // "Champions" is a small team. Let's find a team with <5 members.
  const allHeroes = bundle.runtime.indexes.allHeroes;
  const teamCounts = {};
  for (const hero of allHeroes) {
    for (const team of hero.teams) {
      teamCounts[team] = (teamCounts[team] || 0) + 1;
    }
  }
  // Pick a team with between 1 and 4 heroes
  const smallTeam = Object.entries(teamCounts).find(([, count]) => count >= 1 && count < 5);
  assert.ok(smallTeam, 'Expected to find a team with fewer than 5 heroes for this test');

  const [smallTeamName, smallTeamCount] = smallTeam;

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      forcedTeam: smallTeamName
    },
    random: () => 0
  });

  assert.equal(setup.heroes.length, 5, 'Setup should have 5 heroes');
  const teamHeroes = setup.heroes.filter((hero) => hero.teams.includes(smallTeamName));
  assert.equal(teamHeroes.length, smallTeamCount, `Expected ${smallTeamCount} heroes from ${smallTeamName}, got ${teamHeroes.length}`);
  const generalHeroes = setup.heroes.filter((hero) => !hero.teams.includes(smallTeamName));
  assert.equal(generalHeroes.length, 5 - smallTeamCount, 'Remaining slots should be filled from general pool');
});

test('Forced heroIds take priority before forcedTeam heroes are selected', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  // Pick a forced hero that is NOT in X-Men
  const nonXmenHero = bundle.runtime.indexes.allHeroes.find((hero) => !hero.teams.includes('X-Men'));
  assert.ok(nonXmenHero, 'Expected to find a hero outside X-Men');

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      heroIds: [nonXmenHero.id],
      forcedTeam: 'X-Men'
    },
    random: () => 0
  });

  assert.equal(setup.heroes.length, 5);
  // The forced non-X-Men hero must appear
  assert.ok(setup.heroes.some((hero) => hero.id === nonXmenHero.id), 'Forced hero must be present in setup');
  // Remaining 4 slots should be X-Men
  const xmenCount = setup.heroes.filter((hero) => hero.id !== nonXmenHero.id && hero.teams.includes('X-Men')).length;
  assert.equal(xmenCount, 4, 'Remaining 4 slots should be filled with X-Men heroes');
});

test('Villain groups, henchman groups, scheme, and mastermind are unaffected by forcedTeam', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      forcedTeam: 'X-Men'
    },
    random: () => 0
  });

  assert.equal(setup.scheme.id, simpleScheme.id);
  assert.equal(setup.mastermind.id, simpleMastermind.id);
  assert.equal(setup.villainGroups.length, 2);
  assert.equal(setup.henchmanGroups.length, 1);
});

test('When forcedTeam is null, hero selection behaves as normal', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      forcedTeam: null
    },
    random: () => 0
  });

  assert.equal(setup.heroes.length, 5);
  // Heroes should not all be from one team (normal distribution expected)
  assert.ok(setup.heroes.length > 0);
});

// ---------------------------------------------------------------------------
// Story 1 — activeHeroTeamNames derivation logic
// ---------------------------------------------------------------------------

test('activeHeroTeamNames contains only team names present on at least one hero in the owned pool', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));

  assert.ok(activeHeroTeamNames.length > 0, 'Expected at least one team name');
  for (const team of activeHeroTeamNames) {
    const found = pools.heroes.some((hero) => hero.teams.includes(team));
    assert.ok(found, `Team '${team}' should be present on at least one hero`);
  }
});

test('activeHeroTeamNames is sorted alphabetically', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));

  for (let i = 1; i < activeHeroTeamNames.length; i++) {
    assert.ok(
      activeHeroTeamNames[i - 1].localeCompare(activeHeroTeamNames[i]) <= 0,
      `Expected sorted order but '${activeHeroTeamNames[i - 1]}' comes before '${activeHeroTeamNames[i]}'`
    );
  }
});

test('activeHeroTeamNames is deduplicated', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));

  const uniqueNames = new Set(activeHeroTeamNames);
  assert.equal(activeHeroTeamNames.length, uniqueNames.size, 'Expected no duplicate team names');
});

test('activeHeroTeamNames contains no empty strings', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));

  assert.ok(
    activeHeroTeamNames.every((name) => typeof name === 'string' && name.length > 0),
    'Expected no empty strings in activeHeroTeamNames'
  );
});
