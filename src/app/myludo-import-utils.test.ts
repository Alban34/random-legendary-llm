import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import { parseMyludoFile, matchMyludoNamesToSets } from './myludo-import-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

// ---------------------------------------------------------------------------
// parseMyludoFile
// ---------------------------------------------------------------------------

test('parseMyludoFile returns ok and gameNames for a valid semicolon-delimited CSV with header', async () => {

  const csv = 'Nom;Type;Note\nCore Set;Jeu de base;8\nDark City;Extension;7\n';
  const file = new File([csv], 'export.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Core Set', 'Dark City']);
});

test('parseMyludoFile returns ok for a valid comma-delimited CSV with "name" header', async () => {

  const csv = 'name,type\nDark City,expansion\nFantastic Four,small expansion\n';
  const file = new File([csv], 'export.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Dark City', 'Fantastic Four']);
});

test('parseMyludoFile returns ok: false for an empty file', async () => {

  const file = new File([''], 'empty.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, false);
  assert.ok(result.error && result.error.length > 0, 'Should provide an error message');
});

test('parseMyludoFile returns ok: false for a whitespace-only file', async () => {

  const file = new File(['   \n  \n  '], 'blank.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, false);
});

test('parseMyludoFile returns ok: true and empty gameNames for a header-only CSV', async () => {

  const csv = 'Nom;Type;Note\n';
  const file = new File([csv], 'header-only.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, []);
});

test('parseMyludoFile returns ok: false for unrecognised content', async () => {

  const file = new File(['<html><body>Not a CSV</body></html>'], 'page.html', { type: 'text/html' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, false);
  assert.ok(result.error && result.error.length > 0, 'Should provide an error message');
});

test('parseMyludoFile strips UTF-8 BOM and parses correctly', async () => {

  const csv = '\uFEFFNom;Type\nCore Set;base\n';
  const file = new File([csv], 'bom.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Core Set']);
});

test('parseMyludoFile handles quoted fields containing a semicolon correctly', async () => {

  const csv = 'Nom;Note\n"Game; with; semicolons";8\nDark City;7\n';
  const file = new File([csv], 'quoted.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Game; with; semicolons', 'Dark City']);
});

test('parseMyludoFile filters out blank game name entries', async () => {

  const csv = 'Nom;Type\nCore Set;base\n;expansion\nDark City;expansion\n';
  const file = new File([csv], 'blanks.csv', { type: 'text/csv' });
  const result = await parseMyludoFile(file);
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Core Set', 'Dark City']);
});

// ---------------------------------------------------------------------------
// matchMyludoNamesToSets
// ---------------------------------------------------------------------------

test('matchMyludoNamesToSets resolves alias "Legendary: A Marvel Deck Building Game" → core-set', () => {

  const { matched, unmatched } = matchMyludoNamesToSets(
    ['Legendary: A Marvel Deck Building Game'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1, 'Should have one matched entry');
  assert.equal(matched[0].setId, 'core-set');
  assert.equal(unmatched.length, 0);
});

test('matchMyludoNamesToSets case-insensitively matches canonical name "dark city" → dark-city', () => {

  const { matched, unmatched } = matchMyludoNamesToSets(
    ['dark city'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1);
  assert.equal(matched[0].setId, 'dark-city');
  assert.equal(unmatched.length, 0);
});

test('matchMyludoNamesToSets sends unknown name to unmatched', () => {

  const { matched, unmatched } = matchMyludoNamesToSets(
    ['Unknown Expansion'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 0);
  assert.equal(unmatched.length, 1);
  assert.equal(unmatched[0], 'Unknown Expansion');
});

test('matchMyludoNamesToSets handles mixed matched and unmatched input', () => {

  const { matched, unmatched } = matchMyludoNamesToSets(
    ['Legendary: A Marvel Deck Building Game', 'Dark City', 'Unknown Title'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 2);
  const matchedIds = new Set(matched.map((m) => m.setId));
  assert.ok(matchedIds.has('core-set'), 'core-set should be matched');
  assert.ok(matchedIds.has('dark-city'), 'dark-city should be matched');
  assert.equal(unmatched.length, 1);
  assert.equal(unmatched[0], 'Unknown Title');
});

test('matchMyludoNamesToSets deduplicates when the same name appears twice', () => {

  const { matched } = matchMyludoNamesToSets(
    ['Dark City', 'Dark City'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1, 'Duplicate names should produce only one matched entry');
  assert.equal(matched[0].setId, 'dark-city');
});

test('matchMyludoNamesToSets deduplicates when alias and canonical resolve to the same set', () => {

  const { matched } = matchMyludoNamesToSets(
    ['Core Set', 'Legendary: A Marvel Deck Building Game'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1, 'Alias and canonical for same set should deduplicate');
  assert.equal(matched[0].setId, 'core-set');
});

test('matchMyludoNamesToSets returns empty arrays for empty input', () => {

  const { matched, unmatched } = matchMyludoNamesToSets([], bundle.runtime.sets);
  assert.equal(matched.length, 0);
  assert.equal(unmatched.length, 0);
});

test('matchMyludoNamesToSets preserves original casing in matched.myludoName', () => {

  const { matched } = matchMyludoNamesToSets(['DARK CITY'], bundle.runtime.sets);
  assert.equal(matched.length, 1);
  assert.equal(matched[0].myludoName, 'DARK CITY');
  assert.equal(matched[0].setId, 'dark-city');
});
