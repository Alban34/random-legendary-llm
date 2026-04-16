import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { parseMyludoFile, matchMyludoNamesToSets } from '../src/app/myludo-import-utils.mjs';
import { mergeOwnedSets } from '../src/app/collection-utils.mjs';
import { createDefaultState } from '../src/app/state-store.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

// ---------------------------------------------------------------------------
// parseMyludoFile
// ---------------------------------------------------------------------------

test('Epic 45 parseMyludoFile: valid semicolon-delimited CSV with header returns ok and gameNames', async () => {
  const csv = 'Nom;Type;Note\nCore Set;Jeu de base;8\nDark City;Extension;7\n';
  const file = new File([csv], 'export.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Core Set', 'Dark City']);
});

test('Epic 45 parseMyludoFile: valid comma-delimited CSV with "name" header returns ok', async () => {
  const csv = 'name,type\nDark City,expansion\nFantastic Four,small expansion\n';
  const file = new File([csv], 'export.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Dark City', 'Fantastic Four']);
});

test('Epic 45 parseMyludoFile: empty file returns ok: false', async () => {
  const file = new File([''], 'empty.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, false);
  assert.ok(result.error && result.error.length > 0, 'Should provide an error message');
});

test('Epic 45 parseMyludoFile: whitespace-only file returns ok: false', async () => {
  const file = new File(['   \n  \n  '], 'blank.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, false);
});

test('Epic 45 parseMyludoFile: header-only CSV returns ok: true and empty gameNames', async () => {
  const csv = 'Nom;Type;Note\n';
  const file = new File([csv], 'header-only.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, []);
});

test('Epic 45 parseMyludoFile: unrecognised content returns ok: false', async () => {
  const file = new File(['<html><body>Not a CSV</body></html>'], 'page.html', { type: 'text/html' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, false);
  assert.ok(result.error && result.error.length > 0, 'Should provide an error message');
});

test('Epic 45 parseMyludoFile: strips UTF-8 BOM and still parses correctly', async () => {
  const csv = '\uFEFFNom;Type\nCore Set;base\n';
  const file = new File([csv], 'bom.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Core Set']);
});

test('Epic 45 parseMyludoFile: quoted fields containing semicolon are handled correctly', async () => {
  const csv = 'Nom;Note\n"Game; with; semicolons";8\nDark City;7\n';
  const file = new File([csv], 'quoted.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Game; with; semicolons', 'Dark City']);
});

test('Epic 45 parseMyludoFile: blank game name entries are filtered out', async () => {
  const csv = 'Nom;Type\nCore Set;base\n;expansion\nDark City;expansion\n';
  const file = new File([csv], 'blanks.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Core Set', 'Dark City']);
});

// ---------------------------------------------------------------------------
// matchMyludoNamesToSets
// ---------------------------------------------------------------------------

test('Epic 45 matchMyludoNamesToSets: alias match — "Legendary: A Marvel Deck Building Game" → core-set', () => {
  const { matched, unmatched } = matchMyludoNamesToSets(
    ['Legendary: A Marvel Deck Building Game'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1, 'Should have one matched entry');
  assert.equal(matched[0].setId, 'core-set');
  assert.equal(unmatched.length, 0);
});

test('Epic 45 matchMyludoNamesToSets: case-insensitive canonical match — "dark city" → dark-city', () => {
  const { matched, unmatched } = matchMyludoNamesToSets(
    ['dark city'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1);
  assert.equal(matched[0].setId, 'dark-city');
  assert.equal(unmatched.length, 0);
});

test('Epic 45 matchMyludoNamesToSets: unknown name goes to unmatched', () => {
  const { matched, unmatched } = matchMyludoNamesToSets(
    ['Unknown Expansion'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 0);
  assert.equal(unmatched.length, 1);
  assert.equal(unmatched[0], 'Unknown Expansion');
});

test('Epic 45 matchMyludoNamesToSets: mixed input — matched and unmatched', () => {
  const { matched, unmatched } = matchMyludoNamesToSets(
    ['Legendary: A Marvel Deck Building Game', 'Dark City', 'Unknown Title'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 2);
  const matchedIds = matched.map((m) => m.setId);
  assert.ok(matchedIds.includes('core-set'), 'core-set should be matched');
  assert.ok(matchedIds.includes('dark-city'), 'dark-city should be matched');
  assert.equal(unmatched.length, 1);
  assert.equal(unmatched[0], 'Unknown Title');
});

test('Epic 45 matchMyludoNamesToSets: deduplication — same name twice produces one matched entry', () => {
  const { matched } = matchMyludoNamesToSets(
    ['Dark City', 'Dark City'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1, 'Duplicate names should produce only one matched entry');
  assert.equal(matched[0].setId, 'dark-city');
});

test('Epic 45 matchMyludoNamesToSets: deduplication — alias and canonical resolving same set', () => {
  const { matched } = matchMyludoNamesToSets(
    ['Core Set', 'Legendary: A Marvel Deck Building Game'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1, 'Alias and canonical for same set should deduplicate');
  assert.equal(matched[0].setId, 'core-set');
});

test('Epic 45 matchMyludoNamesToSets: empty input returns empty arrays', () => {
  const { matched, unmatched } = matchMyludoNamesToSets([], bundle.runtime.sets);
  assert.equal(matched.length, 0);
  assert.equal(unmatched.length, 0);
});

test('Epic 45 matchMyludoNamesToSets: original casing preserved in matched.myludoName', () => {
  const { matched } = matchMyludoNamesToSets(['DARK CITY'], bundle.runtime.sets);
  assert.equal(matched.length, 1);
  assert.equal(matched[0].myludoName, 'DARK CITY');
  assert.equal(matched[0].setId, 'dark-city');
});

// ---------------------------------------------------------------------------
// mergeOwnedSets
// ---------------------------------------------------------------------------

test('Epic 45 mergeOwnedSets: merges new IDs into existing owned set with sorting', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, ['dark-city']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set', 'dark-city']);
});

test('Epic 45 mergeOwnedSets: no duplicates when merging already-owned ID', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, ['core-set']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set']);
});

test('Epic 45 mergeOwnedSets: idempotent — calling twice with same input produces same result', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const once = mergeOwnedSets(state, ['dark-city']);
  const twice = mergeOwnedSets(once, ['dark-city']);
  assert.deepEqual(once.collection.ownedSetIds, twice.collection.ownedSetIds);
});

test('Epic 45 mergeOwnedSets: empty newSetIds leaves owned set unchanged', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, []);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set']);
});

test('Epic 45 mergeOwnedSets: result is sorted alphabetically', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['dark-city'];
  const result = mergeOwnedSets(state, ['core-set']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set', 'dark-city']);
});

test('Epic 45 mergeOwnedSets: does not mutate the original state', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  mergeOwnedSets(state, ['dark-city']);
  assert.deepEqual(state.collection.ownedSetIds, ['core-set']);
});
