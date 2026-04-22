import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import {
  CARD_CATEGORIES,
  getCardsByCategory,
  getCardsByExpansion,
} from '../src/app/collection-utils.ts';
import { buildOwnedPools } from '../src/app/setup-generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

// --- CARD_CATEGORIES ---

test('Epic 44 CARD_CATEGORIES has exactly 5 entries in canonical order', () => {
  assert.equal(CARD_CATEGORIES.length, 5);
  assert.deepEqual(
    CARD_CATEGORIES.map((c) => c.id),
    ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes']
  );
  for (const category of CARD_CATEGORIES) {
    assert.ok(category.labelKey, `Category ${category.id} must have a labelKey`);
  }
});

// --- getCardsByCategory ---

test('Epic 44 getCardsByCategory returns exactly 5 category buckets', () => {
  const pools = buildOwnedPools(bundle.runtime, ['core-set']);
  const categories = getCardsByCategory(pools);
  assert.equal(categories.length, 5);
  assert.deepEqual(
    categories.map((c) => c.categoryId),
    ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes']
  );
});

test('Epic 44 getCardsByCategory Heroes bucket contains known core-set hero names sorted A-Z', () => {
  const pools = buildOwnedPools(bundle.runtime, ['core-set']);
  const categories = getCardsByCategory(pools);
  const heroesBucket = categories.find((c) => c.categoryId === 'heroes');

  assert.ok(heroesBucket, 'Heroes bucket must exist');
  assert.ok(heroesBucket.cards.length > 0, 'Heroes bucket must be non-empty for core-set');

  const heroNames = heroesBucket.cards.map((c) => c.name);

  // Verify known core-set heroes are present
  assert.ok(heroNames.includes('Black Widow'), 'Black Widow should be in heroes');
  assert.ok(heroNames.includes('Spider-Man'), 'Spider-Man should be in heroes');
  assert.ok(heroNames.includes('Wolverine'), 'Wolverine should be in heroes');

  // Verify sorted A-Z
  const sorted = [...heroNames].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(heroNames, sorted, 'Heroes must be sorted A-Z by name');
});

test('Epic 44 getCardsByCategory Masterminds bucket contains known mastermind names sorted A-Z', () => {
  const pools = buildOwnedPools(bundle.runtime, ['core-set']);
  const categories = getCardsByCategory(pools);
  const mastermindsBucket = categories.find((c) => c.categoryId === 'masterminds');

  assert.ok(mastermindsBucket, 'Masterminds bucket must exist');
  assert.ok(mastermindsBucket.cards.length > 0, 'Masterminds bucket must be non-empty for core-set');

  const mastermindNames = mastermindsBucket.cards.map((c) => c.name);

  // Verify known core-set masterminds are present
  assert.ok(mastermindNames.includes('Dr. Doom'), 'Dr. Doom should be in masterminds');
  assert.ok(mastermindNames.includes('Magneto'), 'Magneto should be in masterminds');

  // Verify sorted A-Z
  const sorted = [...mastermindNames].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(mastermindNames, sorted, 'Masterminds must be sorted A-Z by name');
});

test('Epic 44 getCardsByCategory empty set list returns 5 empty-cards buckets', () => {
  const pools = buildOwnedPools(bundle.runtime, []);
  const categories = getCardsByCategory(pools);
  assert.equal(categories.length, 5);
  for (const category of categories) {
    assert.deepEqual(category.cards, [], `Category ${category.categoryId} must have empty cards for zero owned sets`);
  }
});

// --- getCardsByExpansion ---

test('Epic 44 getCardsByExpansion with 2 owned expansions returns 2 objects sorted A-Z by expansion name', () => {
  const pools = buildOwnedPools(bundle.runtime, ['core-set', 'fantastic-four']);
  const expansions = getCardsByExpansion(pools);

  assert.equal(expansions.length, 2, 'Must return exactly 2 expansion objects');

  const names = expansions.map((e) => e.setName);
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(names, sorted, 'Expansions must be sorted A-Z by setName');

  // Core Set comes before Fantastic Four alphabetically
  assert.equal(expansions[0].setName, 'Core Set');
  assert.equal(expansions[1].setName, 'Fantastic Four');
});

test('Epic 44 getCardsByExpansion each expansion cards array is sorted A-Z by name', () => {
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

test('Epic 44 getCardsByExpansion each expansion contains only cards from that expansion', () => {
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

test('Epic 44 getCardsByExpansion with zero owned sets returns empty array', () => {
  const pools = buildOwnedPools(bundle.runtime, []);
  const expansions = getCardsByExpansion(pools);
  assert.deepEqual(expansions, []);
});
