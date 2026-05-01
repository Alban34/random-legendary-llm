import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateSetup } from '../src/app/setup-generator.ts';
import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { createDefaultState } from '../src/app/state-store.ts';
import { createEmptyForcedPicks, normalizeForcedPicks, hasForcedPicks } from '../src/app/forced-picks-utils.ts';

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
// Story 70.1 — ForcedPicks utilities
// ---------------------------------------------------------------------------

test('createEmptyForcedPicks returns preferredExpansionId: null', () => {
  const empty = createEmptyForcedPicks();
  assert.strictEqual(empty.preferredExpansionId, null);
});

test('normalizeForcedPicks preserves a valid preferredExpansionId string', () => {
  const result = normalizeForcedPicks({ preferredExpansionId: 'some-expansion' });
  assert.strictEqual(result.preferredExpansionId, 'some-expansion');
});

test('normalizeForcedPicks coerces invalid preferredExpansionId values to null', () => {
  assert.strictEqual(normalizeForcedPicks({ preferredExpansionId: null }).preferredExpansionId, null);
  assert.strictEqual(normalizeForcedPicks({ preferredExpansionId: undefined }).preferredExpansionId, null);
  assert.strictEqual(normalizeForcedPicks({}).preferredExpansionId, null);
  assert.strictEqual(normalizeForcedPicks({ preferredExpansionId: '' }).preferredExpansionId, null);
  assert.strictEqual(normalizeForcedPicks({ preferredExpansionId: 42 }).preferredExpansionId, null);
  assert.strictEqual(normalizeForcedPicks({ preferredExpansionId: [] }).preferredExpansionId, null);
});

test('hasForcedPicks returns false when preferredExpansionId is null and other fields are empty', () => {
  assert.strictEqual(hasForcedPicks({ ...createEmptyForcedPicks(), preferredExpansionId: null }), false);
});

test('hasForcedPicks returns true when preferredExpansionId is set and other fields are empty', () => {
  assert.strictEqual(hasForcedPicks({ ...createEmptyForcedPicks(), preferredExpansionId: 'some-expansion' }), true);
});

// ---------------------------------------------------------------------------
// Story 70.2 — Generator preferred-expansion tiebreaker
// ---------------------------------------------------------------------------

test('Generator draws from preferred expansion first when play counts are tied', () => {
  const state = createAllOwnedState();

  // Find a non-core set that has heroes
  const preferredSetId = bundle.runtime.indexes.allHeroes
    .find((hero) => hero.setId !== 'core-set')?.setId;
  assert.ok(preferredSetId, 'Expected a non-core set with heroes');

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: { preferredExpansionId: preferredSetId },
    random: () => 0
  });

  // With random: () => 0 and preferred expansion placed first in each tier,
  // at least one hero should come from the preferred expansion.
  assert.ok(
    setup.heroes.some((hero) => hero.setId === preferredSetId),
    `Expected at least one hero from preferred expansion ${preferredSetId}`
  );
});

test('Generator skips preferred expansion heroes when they all have higher play counts', () => {
  const state = createAllOwnedState();

  // Find a non-core expansion that has at least one hero
  const preferredSetId = bundle.runtime.indexes.allHeroes
    .find((hero) => hero.setId !== 'core-set')?.setId;
  assert.ok(preferredSetId, 'Expected a non-core set with heroes');

  // Give all heroes from that expansion a higher play count (1 play)
  // so core-set heroes (0 plays) are in a lower tier and selected first
  const preferredSetHeroes = bundle.runtime.indexes.allHeroes.filter((h) => h.setId === preferredSetId);
  for (const hero of preferredSetHeroes) {
    state.usage.heroes[hero.id] = { plays: 1, lastPlayedAt: '2026-01-01T00:00:00.000Z' };
  }

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: { preferredExpansionId: preferredSetId },
    random: () => 0
  });

  // All selected heroes should have 0 plays (i.e. come from other sets)
  // because the preferred set's heroes all have play count 1 — higher tier
  const allFromPreferred = setup.heroes.every((h) => h.setId === preferredSetId);
  assert.ok(
    !allFromPreferred,
    'Expected generator to draw from lower-play-count heroes (not exclusively from preferred expansion)'
  );
});

test('Generator falls back silently when preferred expansion has no owned cards of a type', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set']; // Only core set owned

  // preferredExpansionId points to an expansion that is NOT owned
  const nonOwnedSetId = bundle.runtime.indexes.allHeroes
    .find((hero) => hero.setId !== 'core-set')?.setId;
  assert.ok(nonOwnedSetId, 'Expected a non-core set with heroes');

  assert.doesNotThrow(() => {
    const setup = generateSetup({
      runtime: bundle.runtime,
      state,
      playerCount: 2,
      playMode: 'standard',
      forcedPicks: { preferredExpansionId: nonOwnedSetId },
      random: () => 0
    });
    assert.ok(setup.heroes.length > 0);
  });
});

test('Generator fills remaining slots from same tier when preferred expansion pool is exhausted', () => {
  const state = createAllOwnedState();

  // Find a set with fewer heroes than the 5 needed for 2-player standard so the preferred pool exhausts and requires fallback
  const setHeroCounts = {};
  for (const hero of bundle.runtime.indexes.allHeroes) {
    setHeroCounts[hero.setId] = (setHeroCounts[hero.setId] || 0) + 1;
  }
  const smallSetId = Object.keys(setHeroCounts).find(
    (id) => setHeroCounts[id] < 5 && id !== 'core-set'
  );
  assert.ok(smallSetId, 'Expected a non-core set with fewer than 5 heroes (to exhaust before filling 5 hero slots)');

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: { preferredExpansionId: smallSetId },
    random: () => 0
  });

  // Setup should succeed with the full hero count for 2-player standard (5 heroes)
  assert.ok(setup.heroes.length >= 5, `Expected at least 5 heroes, got ${setup.heroes.length}`);
  // At least one hero from the preferred (small) set
  assert.ok(
    setup.heroes.some((h) => h.setId === smallSetId),
    `Expected at least one hero from preferred expansion ${smallSetId}`
  );
});

// ---------------------------------------------------------------------------
// Story 70.3 — Individually forced cards take absolute priority
// ---------------------------------------------------------------------------

test('Individually forced mastermind takes absolute priority over preferred expansion', () => {
  const state = createAllOwnedState();

  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((m) => !m.lead);
  const preferredSetId = bundle.runtime.indexes.allHeroes
    .find((h) => h.setId !== simpleMastermind.setId)?.setId;

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      mastermindId: simpleMastermind.id,
      preferredExpansionId: preferredSetId
    },
    random: () => 0
  });

  assert.strictEqual(setup.mastermind.id, simpleMastermind.id);
});

test('Individually forced scheme takes absolute priority over preferred expansion', () => {
  const state = createAllOwnedState();

  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (s) => !s.modifiers.length && !s.forcedGroups.length && !s.constraints.minimumPlayerCount
  );
  const preferredSetId = bundle.runtime.indexes.allHeroes
    .find((h) => h.setId !== simpleScheme.setId)?.setId;

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      preferredExpansionId: preferredSetId
    },
    random: () => 0
  });

  assert.strictEqual(setup.scheme.id, simpleScheme.id);
});

test('All individually forced types + preferred expansion — forced cards resolve first, expansion fills only unclaimed slots', () => {
  const state = createAllOwnedState();

  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (s) => !s.modifiers.length && !s.forcedGroups.length && !s.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((m) => !m.lead);
  const forcedHero = bundle.runtime.indexes.allHeroes[0];
  const forcedVillainGroup = bundle.runtime.indexes.allVillainGroups[0];
  const forcedHenchmanGroup = bundle.runtime.indexes.allHenchmanGroups[0];
  const preferredSetId = bundle.runtime.sets.find(
    (s) => s.id !== simpleScheme.setId && s.id !== simpleMastermind.setId
  )?.id;

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      heroIds: [forcedHero.id],
      villainGroupIds: [forcedVillainGroup.id],
      henchmanGroupIds: [forcedHenchmanGroup.id],
      preferredExpansionId: preferredSetId
    },
    random: () => 0
  });

  assert.strictEqual(setup.scheme.id, simpleScheme.id);
  assert.strictEqual(setup.mastermind.id, simpleMastermind.id);
  assert.ok(setup.heroes.some((h) => h.id === forcedHero.id));
  assert.ok(setup.villainGroups.some((vg) => vg.id === forcedVillainGroup.id));
  assert.ok(setup.henchmanGroups.some((hg) => hg.id === forcedHenchmanGroup.id));
});

// ---------------------------------------------------------------------------
// Story 70.6 — Clearing and round-trip normalisation
// ---------------------------------------------------------------------------

test('Clearing preferredExpansionId (null) restores standard draw without bias', () => {
  const state = createAllOwnedState();

  assert.doesNotThrow(() => {
    const setup = generateSetup({
      runtime: bundle.runtime,
      state,
      playerCount: 2,
      playMode: 'standard',
      forcedPicks: { preferredExpansionId: null },
      random: () => 0
    });
    assert.ok(setup.heroes.length > 0);
  });
});

test('normalizeForcedPicks round-trip: valid id, null, missing, invalid each produce correct output', () => {
  // Valid id round-trips
  const withId = normalizeForcedPicks({ preferredExpansionId: 'expansion-abc' });
  assert.strictEqual(normalizeForcedPicks(withId).preferredExpansionId, 'expansion-abc');

  // null → null
  assert.strictEqual(
    normalizeForcedPicks(normalizeForcedPicks({ preferredExpansionId: null })).preferredExpansionId,
    null
  );

  // missing field → null
  assert.strictEqual(
    normalizeForcedPicks(normalizeForcedPicks({})).preferredExpansionId,
    null
  );

  // invalid (number) → null
  assert.strictEqual(
    normalizeForcedPicks(normalizeForcedPicks({ preferredExpansionId: 99 })).preferredExpansionId,
    null
  );
});
