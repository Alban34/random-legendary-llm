import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let gameDataSource;
let browseUtilsSource;
let collectionUtilsSource;
beforeAll(async () => {
  [gameDataSource, browseUtilsSource, collectionUtilsSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'data', 'canonical-game-data.json'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'browse-utils.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'collection-utils.ts'), 'utf8')
  ]);
});

test('Core Set is classified as base in canonical-game-data.json', () => {

  assert.match(gameDataSource, /"Core Set"[\s\S]{0,60}"type": "base"/);
});

test('Villains is classified as base in canonical-game-data.json', () => {

  assert.match(gameDataSource, /"Villains"[\s\S]{0,60}"type": "base"/);
});

test('S.H.I.E.L.D. is reclassified as small-expansion', () => {

  assert.match(gameDataSource, /"S\.H\.I\.E\.L\.D\."[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"S\.H\.I\.E\.L\.D\."[\s\S]{0,60}"type": "large-expansion"/);
});

test('Venom is reclassified as small-expansion', () => {

  assert.match(gameDataSource, /"Venom"[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"Venom"[\s\S]{0,60}"type": "large-expansion"/);
});

test('Revelations is classified as small-expansion (not standalone)', () => {

  assert.match(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "standalone"/);
});

test('No set remains classified as standalone', () => {

  assert.doesNotMatch(gameDataSource, /"type": "standalone"/);
});

test('Standalone filter is removed from browse-utils', () => {

  assert.doesNotMatch(browseUtilsSource, /id:\s*['"]standalone['"]/);
  assert.doesNotMatch(browseUtilsSource, /standalone.*Standalone/);
});

test('Standalone group is removed from collection-utils', () => {

  assert.doesNotMatch(collectionUtilsSource, /id:\s*['"]standalone['"]/);
});

test('Alphabetical order in filterBrowseSets is preserved', () => {

  assert.match(browseUtilsSource, /localeCompare/);
});
