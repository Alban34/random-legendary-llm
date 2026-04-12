import test, { before } from 'node:test';
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
let correctionManifest;
let postV1TaskList;

before(async () => {
  [gameDataSource, browseUtilsSource, collectionUtilsSource, correctionManifest, postV1TaskList] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'data', 'canonical-game-data.json'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'browse-utils.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'collection-utils.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'correction-manifest-26.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'task-list.md'), 'utf8')
  ]);
});

test('Story 26.1 QC — correction manifest file exists and is non-empty', () => {
  assert.ok(correctionManifest.length > 0, 'correction manifest must be non-empty');
  assert.match(correctionManifest, /Revelations/, 'correction manifest must include Revelations');
});

test('Story 26.2 — Core Set is classified as base in canonical-game-data.json', () => {
  assert.match(gameDataSource, /"Core Set"[\s\S]{0,60}"type": "base"/);
});

test('Story 26.2 — Villains is classified as base in canonical-game-data.json', () => {
  assert.match(gameDataSource, /"Villains"[\s\S]{0,60}"type": "base"/);
});

test('Story 26.3 — S.H.I.E.L.D. is reclassified as small-expansion', () => {
  assert.match(gameDataSource, /"S\.H\.I\.E\.L\.D\."[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"S\.H\.I\.E\.L\.D\."[\s\S]{0,60}"type": "large-expansion"/);
});

test('Story 26.3 — Venom is reclassified as small-expansion', () => {
  assert.match(gameDataSource, /"Venom"[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"Venom"[\s\S]{0,60}"type": "large-expansion"/);
});

test('Story 26.4 — Revelations is classified as small-expansion (not standalone)', () => {
  assert.match(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "standalone"/);
});

test('Story 26.5 — no set remains classified as standalone', () => {
  assert.doesNotMatch(gameDataSource, /"type": "standalone"/);
});

test('Story 26.5 — standalone filter is removed from browse-utils', () => {
  assert.doesNotMatch(browseUtilsSource, /id:\s*['"]standalone['"]/);
  assert.doesNotMatch(browseUtilsSource, /standalone.*Standalone/);
});

test('Story 26.5 — standalone group is removed from collection-utils', () => {
  assert.doesNotMatch(collectionUtilsSource, /id:\s*['"]standalone['"]/);
});

test('Story 26.5 — alphabetical order in filterBrowseSets is preserved', () => {
  assert.match(browseUtilsSource, /localeCompare/);
});

test('Epic 26 stories are marked complete in task-list.md', () => {
  assert.match(postV1TaskList, /## Epic 26 — Remaining Set Classification Data Corrections/);
  assert.match(postV1TaskList, /- \[x\] Read all set entries in the catalog data source and list their current type assignments/);
  assert.match(postV1TaskList, /- \[x\] Cross-reference each assignment against the published Legendary ruleset/);
  assert.match(postV1TaskList, /- \[x\] Locate all catalog data entries for Core and Villains/);
  assert.match(postV1TaskList, /- \[x\] Locate the Revelations catalog entry and update its type to small expansion/);
  assert.match(postV1TaskList, /- \[x\] Run through all corrected sets in Browse and confirm each appears in the expected category group/);
});

test('Epic 26 full regression gate is marked in task-list.md', () => {
  assert.match(postV1TaskList, /- \[x\] \*\*Full regression gate:\*\* run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 26 work complete/);
});
