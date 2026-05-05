import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import {
  CARD_CATEGORIES,
  COLLECTION_FEASIBILITY_MODES,
  COLLECTION_TYPE_GROUPS,
  getCardsByCategory,
  getCardsByExpansion,
  getCollectionFeasibility,
  groupSetsByType,
  mergeOwnedSets,
  summarizeOwnedCollection
} from './collection-utils.ts';
import { buildOwnedPools } from './setup-generator.ts';
import { createDefaultState, resetOwnedCollection, toggleOwnedSet } from './state-store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Groups sets by type in the approved Base / Large / Small order', () => {

  const groups = groupSetsByType(bundle.runtime.sets);

  assert.deepEqual(groups.map((group) => group.id), COLLECTION_TYPE_GROUPS.map((group) => group.id));
  assert.deepEqual(groups[0].sets.map((set) => set.name), ['Core Set', 'Villains', "Marvel Studios' What If...?"]);  
  assert.ok(groups[1].sets.some((set) => set.name === 'Dark City'));
  assert.ok(groups[2].sets.some((set) => set.name === 'Fantastic Four'));
});

test('Collection totals derive directly from the currently owned sets', () => {

  let state = createDefaultState();
  state = toggleOwnedSet(state, 'core-set');
  state = toggleOwnedSet(state, 'fantastic-four');

  const totals = summarizeOwnedCollection(bundle.runtime, state.collection.ownedSetIds);
  assert.equal(totals.setCount, 2);
  assert.deepEqual({
    heroCount: totals.heroCount,
    mastermindCount: totals.mastermindCount,
    villainGroupCount: totals.villainGroupCount,
    henchmanGroupCount: totals.henchmanGroupCount,
    schemeCount: totals.schemeCount
  }, {
    heroCount: 20,
    mastermindCount: 6,
    villainGroupCount: 9,
    henchmanGroupCount: 4,
    schemeCount: 12
  });
});

test('Feasibility indicators react to empty, thin, and healthy collections', () => {

  const emptyState = createDefaultState();
  const emptyFeasibility = getCollectionFeasibility(bundle.runtime, emptyState);
  assert.equal(emptyFeasibility.every((mode) => mode.ok === false), true);
  assert.ok(emptyFeasibility[0].reasons.some((reason) => reason.includes('No owned sets')));

  const thinState = createDefaultState();
  thinState.collection.ownedSetIds = ['dimensions'];
  const thinFeasibility = getCollectionFeasibility(bundle.runtime, thinState);
  assert.equal(thinFeasibility.every((mode) => mode.ok === false), true);
  assert.ok(thinFeasibility[0].reasons.some((reason) => reason.includes('villain groups')));
  assert.ok(thinFeasibility[0].reasons.some((reason) => reason.includes('No owned schemes')));

  const healthyState = createDefaultState();
  healthyState.collection.ownedSetIds = ['core-set'];
  const healthyFeasibility = getCollectionFeasibility(bundle.runtime, healthyState);
  assert.equal(healthyFeasibility.length, COLLECTION_FEASIBILITY_MODES.length);
  assert.equal(healthyFeasibility.every((mode) => mode.ok === true), true);
  assert.ok(healthyFeasibility.some((mode) => mode.id === 'two-handed-solo'));
});

test('Clearing the collection removes owned sets without disturbing history or usage', () => {

  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.history = [{ id: 'existing-history' }];
  state.usage.heroes = { 'core-set-black-widow': { plays: 1, lastPlayedAt: '2026-04-10T00:00:00.000Z' } };

  const cleared = resetOwnedCollection(state);
  assert.deepEqual(cleared.collection.ownedSetIds, []);
  assert.deepEqual(cleared.history, state.history);
  assert.deepEqual(cleared.usage.heroes, state.usage.heroes);
});

// ── From epic44-card-browser ───────────────────────────────────────────────

test('CARD_CATEGORIES has exactly 5 entries in canonical order', () => {

  assert.equal(CARD_CATEGORIES.length, 5);
  assert.deepEqual(
    CARD_CATEGORIES.map((c) => c.id),
    ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes']
  );
  for (const category of CARD_CATEGORIES) {
    assert.ok(category.labelKey, `Category ${category.id} must have a labelKey`);
  }
});

test('getCardsByCategory returns exactly 5 category buckets', () => {

  const pools = buildOwnedPools(bundle.runtime, ['core-set']);
  const categories = getCardsByCategory(pools);
  assert.equal(categories.length, 5);
  assert.deepEqual(
    categories.map((c) => c.categoryId),
    ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes']
  );
});

test('getCardsByCategory Heroes bucket contains known core-set hero names sorted A-Z', () => {

  const pools = buildOwnedPools(bundle.runtime, ['core-set']);
  const categories = getCardsByCategory(pools);
  const heroesBucket = categories.find((c) => c.categoryId === 'heroes');

  assert.ok(heroesBucket, 'Heroes bucket must exist');
  assert.ok(heroesBucket.cards.length > 0, 'Heroes bucket must be non-empty for core-set');

  const heroNames = heroesBucket.cards.map((c) => c.name);

  assert.ok(heroNames.includes('Black Widow'), 'Black Widow should be in heroes');
  assert.ok(heroNames.includes('Spider-Man'), 'Spider-Man should be in heroes');
  assert.ok(heroNames.includes('Wolverine'), 'Wolverine should be in heroes');

  const sorted = [...heroNames].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(heroNames, sorted, 'Heroes must be sorted A-Z by name');
});

test('getCardsByCategory Masterminds bucket contains known mastermind names sorted A-Z', () => {

  const pools = buildOwnedPools(bundle.runtime, ['core-set']);
  const categories = getCardsByCategory(pools);
  const mastermindsBucket = categories.find((c) => c.categoryId === 'masterminds');

  assert.ok(mastermindsBucket, 'Masterminds bucket must exist');
  assert.ok(mastermindsBucket.cards.length > 0, 'Masterminds bucket must be non-empty for core-set');

  const mastermindNames = mastermindsBucket.cards.map((c) => c.name);

  assert.ok(mastermindNames.includes('Dr. Doom'), 'Dr. Doom should be in masterminds');
  assert.ok(mastermindNames.includes('Magneto'), 'Magneto should be in masterminds');

  const sorted = [...mastermindNames].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(mastermindNames, sorted, 'Masterminds must be sorted A-Z by name');
});

test('getCardsByCategory empty set list returns 5 empty-cards buckets', () => {

  const pools = buildOwnedPools(bundle.runtime, []);
  const categories = getCardsByCategory(pools);
  assert.equal(categories.length, 5);
  for (const category of categories) {
    assert.deepEqual(category.cards, [], `Category ${category.categoryId} must have empty cards for zero owned sets`);
  }
});

test('getCardsByExpansion with 2 owned expansions returns 2 objects sorted A-Z by expansion name', () => {

  const pools = buildOwnedPools(bundle.runtime, ['core-set', 'fantastic-four']);
  const expansions = getCardsByExpansion(pools);

  assert.equal(expansions.length, 2, 'Must return exactly 2 expansion objects');

  const names = expansions.map((e) => e.setName);
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(names, sorted, 'Expansions must be sorted A-Z by setName');

  assert.equal(expansions[0].setName, 'Core Set');
  assert.equal(expansions[1].setName, 'Fantastic Four');
});

test('getCardsByExpansion each expansion cards array is sorted A-Z by name', () => {

  const pools = buildOwnedPools(bundle.runtime, ['core-set', 'fantastic-four']);
  const expansions = getCardsByExpansion(pools);

  for (const expansion of expansions) {
    assert.ok(expansion.cards.length > 0, `${expansion.setName} must have cards`);
    const cardNames = expansion.cards.map((c) => c.name);
    const sorted = [...cardNames].sort((a, b) => a.localeCompare(b));
    assert.deepEqual(
      cardNames,
      sorted,
      `Cards in ${expansion.setName} must be sorted A-Z by name`
    );
  }
});

test('getCardsByExpansion each expansion contains only cards from that expansion', () => {

  const pools = buildOwnedPools(bundle.runtime, ['core-set', 'fantastic-four']);
  const expansions = getCardsByExpansion(pools);

  for (const expansion of expansions) {
    for (const card of expansion.cards) {
      assert.equal(
        card.setId,
        expansion.setId,
        `Card "${card.name}" setId must match expansion setId "${expansion.setId}"`
      );
    }
  }
});

test('getCardsByExpansion with zero owned sets returns empty array', () => {

  const pools = buildOwnedPools(bundle.runtime, []);
  const expansions = getCardsByExpansion(pools);
  assert.deepEqual(expansions, []);
});

// ── From epic26-classification-corrections (collection-utils parts) ───────────

test('Standalone group is removed from collection-utils', () => {

  const collectionUtilsSource = readFileSync(join(process.cwd(), 'src/app/collection-utils.ts'), 'utf8');
  assert.doesNotMatch(collectionUtilsSource, /id:\s*['"](standalone)['"]/);
});

// ── mergeOwnedSets ──

test('mergeOwnedSets merges new IDs into existing owned set with sorting', () => {

  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, ['dark-city']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set', 'dark-city']);
});

test('mergeOwnedSets produces no duplicates when merging an already-owned ID', () => {

  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, ['core-set']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set']);
});

test('mergeOwnedSets is idempotent: calling twice with same input produces the same result', () => {

  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const once = mergeOwnedSets(state, ['dark-city']);
  const twice = mergeOwnedSets(once, ['dark-city']);
  assert.deepEqual(once.collection.ownedSetIds, twice.collection.ownedSetIds);
});

test('mergeOwnedSets leaves owned set unchanged when newSetIds is empty', () => {

  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, []);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set']);
});

test('mergeOwnedSets produces a result sorted alphabetically', () => {

  const state = createDefaultState();
  state.collection.ownedSetIds = ['dark-city'];
  const result = mergeOwnedSets(state, ['core-set']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set', 'dark-city']);
});

test('mergeOwnedSets does not mutate the original state', () => {

  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  mergeOwnedSets(state, ['dark-city']);
  assert.deepEqual(state.collection.ownedSetIds, ['core-set']);
});

test('getCardsByCategory falls back to an empty array when a pool category key is missing', () => {

  const partialPools = { heroes: [{ id: 'h1', setId: 'core-set', name: 'Hero One' }] };
  const categories = getCardsByCategory(partialPools);
  assert.equal(categories.length, 5);
  const masterminds = categories.find((c) => c.categoryId === 'masterminds');
  assert.deepEqual(masterminds!.cards, []);
  const schemes = categories.find((c) => c.categoryId === 'schemes');
  assert.deepEqual(schemes!.cards, []);
});

test('getCardsByExpansion silently skips cards whose setId is not in pools.sets', () => {

  const pools = {
    sets: [{ id: 'core-set', name: 'Core Set' }],
    heroes: [
      { id: 'h1', setId: 'core-set', name: 'Hero One' },
      { id: 'h2', setId: 'orphan-set', name: 'Orphan Hero' }
    ],
    masterminds: [],
    villainGroups: [],
    henchmanGroups: [],
    schemes: []
  };
  const expansions = getCardsByExpansion(pools);
  assert.equal(expansions.length, 1);
  assert.equal(expansions[0].setId, 'core-set');
  assert.equal(expansions[0].cards.length, 1);
  assert.equal(expansions[0].cards[0].name, 'Hero One');
});

