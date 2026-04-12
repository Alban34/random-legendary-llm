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
let postV1TaskList;

before(async () => {
  [browseUtilsSource, gameDataSource, rendererSource, postV1TaskList] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'browse-utils.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'data', 'canonical-game-data.json'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'task-list.md'), 'utf8')
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

test('Epic 22 stories 22.1–22.4 are checked in task-list.md', () => {
  // Story 22.1 tasks
  assert.match(postV1TaskList, /- \[x\] Audit the current set ordering rules across Browse/);
  assert.match(postV1TaskList, /- \[x\] Define the authoritative alphabetical ordering behavior/);
  assert.match(postV1TaskList, /- \[x\] Confirm the corrected taxonomy, including treating Core and Villains as base games/);
  assert.match(postV1TaskList, /- \[x\] Capture unresolved classification corrections/);

  // Story 22.2 tasks
  assert.match(postV1TaskList, /- \[x\] Identify every user-facing set list that should follow the shared alphabetical ordering contract/);
  assert.match(postV1TaskList, /- \[x\] Apply the chosen ordering consistently to Browse set grids/);

  // Story 22.3 tasks
  assert.match(postV1TaskList, /- \[x\] Reclassify Core and Villains into the shared base-game grouping/);

  // Story 22.4 tasks
  assert.match(postV1TaskList, /- \[x\] Review Browse filters, grouping labels, and helper copy after the taxonomy and ordering changes/);
});

test('Epic 22 full regression gate is checked in task-list.md', () => {
  assert.match(postV1TaskList, /- \[x\] \*\*Full regression gate:\*\* run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 22 work complete/);
});
