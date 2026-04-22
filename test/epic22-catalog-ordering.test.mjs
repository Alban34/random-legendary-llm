import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let browseUtilsSource;
let gameDataSource;
let rendererSource;

before(async () => {
  [browseUtilsSource, gameDataSource, rendererSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'browse-utils.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'data', 'canonical-game-data.json'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.ts'), 'utf8')
  ]);
});

test('Epic 22.3 — Villains is classified as base in canonical-game-data.json', () => {
  // The Villains entry must have "type": "base", not "standalone"
  assert.match(gameDataSource, /"Villains"[\s\S]{0,60}"type": "base"/);
});

test('Epic 22.3 — Villains is NOT classified as standalone in canonical-game-data.json', () => {
  // The Villains entry must not retain its former standalone type
  assert.doesNotMatch(gameDataSource, /"Villains"[\s\S]{0,60}"type": "standalone"/);
});

test('Epic 22.2 — filterBrowseSets applies a locale-safe alphabetical sort', () => {
  // filterBrowseSets must call localeCompare so callers always get sorted results
  assert.match(browseUtilsSource, /localeCompare/);
});

test('Epic 22.1 — BROWSE_TYPE_OPTIONS base entry uses the label "Base Game"', () => {
  // The base filter option must be relabelled from "Base" to "Base Game"
  assert.match(browseUtilsSource, /id:\s*'base'[\s\S]{0,40}label:\s*'Base Game'/);
});

test('Epic 22.1 — TYPE_LABELS base entry uses "Base Game"', () => {
  // The TYPE_LABELS constant must reflect the updated base-game label
  assert.match(browseUtilsSource, /base:\s*'Base Game'/);
});

test('Epic 22.1 / 26.3 — browse-utils no longer has an outstanding small/large expansion TODO (resolved in Epic 26)', () => {
  // Epic 26.3 applied the S.H.I.E.L.D. and Venom reclassifications, so the TODO is removed
  assert.doesNotMatch(browseUtilsSource, /TODO.*small\/large expansion reclassifications/i);
});

test('Epic 22.4 / 26.4 — Revelations is now classified as small-expansion (standalone type retired)', () => {
  // Revelations was reclassified in Epic 26.4; standalone type is now removed from the catalog
  assert.match(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "standalone"/);
  // The standalone filter option must now be absent from browse-utils
  assert.doesNotMatch(browseUtilsSource, /id:\s*'standalone'/);
});


