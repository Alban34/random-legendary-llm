import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import {
  BROWSE_SORT_OPTIONS,
  filterBrowseSets,
  getBrowseTypeLabel,
  matchesBrowseSearch,
  summarizeBrowseSet
} from './browse-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Browse filtering keeps every included set available with stable type metadata', () => {

  const sets = bundle.runtime.sets;
  const allVisible = filterBrowseSets(sets, { searchTerm: '', typeFilter: 'all' });
  const standalone = filterBrowseSets(sets, { searchTerm: '', typeFilter: 'standalone' });
  const base = filterBrowseSets(sets, { searchTerm: '', typeFilter: 'base' });

  assert.equal(allVisible.length, sets.length);
  assert.equal(new Set(allVisible.map((set) => set.id)).size, sets.length);
  assert.equal(base.length, 3);
  assert.deepEqual(base.map((set) => set.name), ['Core Set', "Marvel Studios' What If...?", 'Villains']);
  assert.deepEqual(standalone.map((set) => set.name), []);
  assert.equal(getBrowseTypeLabel('large-expansion'), 'Large Expansion');
  assert.equal(getBrowseTypeLabel('small-expansion'), 'Small Expansion');
});

test('Search filtering supports canonical names, aliases, and no-match cases', () => {

  const sets = bundle.runtime.sets;
  const shield = sets.find((set) => set.name === 'S.H.I.E.L.D.');
  const coreSet = sets.find((set) => set.name === 'Core Set');

  assert.equal(matchesBrowseSearch(shield, 'shield'), true);
  assert.equal(matchesBrowseSearch(coreSet, 'legendary a marvel deck building game'), true);
  assert.equal(matchesBrowseSearch(coreSet, 'definitely missing search term'), false);

  assert.deepEqual(
    filterBrowseSets(sets, { searchTerm: 'shield', typeFilter: 'all' }).map((set) => set.name),
    ['S.H.I.E.L.D.']
  );
  assert.deepEqual(
    filterBrowseSets(sets, { searchTerm: 'MCU Phase 1', typeFilter: 'small-expansion' }).map((set) => set.name),
    ['Marvel Studios, Phase 1']
  );
  assert.equal(filterBrowseSets(sets, { searchTerm: 'no match', typeFilter: 'all' }).length, 0);
});

test('Browse metadata summaries preserve representative edge-case counts', () => {

  const coreSet = bundle.runtime.sets.find((set) => set.name === 'Core Set');
  const dimensions = bundle.runtime.sets.find((set) => set.name === 'Dimensions');
  const shield = bundle.runtime.sets.find((set) => set.name === 'S.H.I.E.L.D.');

  assert.deepEqual(summarizeBrowseSet(coreSet), {
    heroCount: 15,
    mastermindCount: 4,
    villainGroupCount: 7,
    henchmanGroupCount: 4,
    schemeCount: 8
  });
  assert.deepEqual(summarizeBrowseSet(dimensions), {
    heroCount: 5,
    mastermindCount: 1,
    villainGroupCount: 0,
    henchmanGroupCount: 2,
    schemeCount: 0
  });
  assert.deepEqual(summarizeBrowseSet(shield), {
    heroCount: 4,
    mastermindCount: 2,
    villainGroupCount: 2,
    henchmanGroupCount: 0,
    schemeCount: 4
  });
});

// ── From epic60-sets-browser-sort ──────────────────────────────────────────────

const SORT_TEST_SETS = [
  { id: 'set-c', name: 'Civil War', type: 'large-expansion', year: 2016 },
  { id: 'set-a', name: 'Annihilation', type: 'large-expansion', year: 2018 },
  { id: 'set-b', name: 'Breakout', type: 'small-expansion', year: 2016 },
  { id: 'set-d', name: 'Dark City', type: 'large-expansion', year: 2014 }
];

test('BROWSE_SORT_OPTIONS is an array of exactly three objects with the correct ids in order', () => {

  assert.ok(Array.isArray(BROWSE_SORT_OPTIONS));
  assert.equal(BROWSE_SORT_OPTIONS.length, 3);
  assert.equal(BROWSE_SORT_OPTIONS[0].id, 'name');
  assert.equal(BROWSE_SORT_OPTIONS[1].id, 'releaseYear');
  assert.equal(BROWSE_SORT_OPTIONS[2].id, 'collection');
});

test('filterBrowseSets with sortKey "name" returns sets sorted A–Z by set.name', () => {

  const result = filterBrowseSets(SORT_TEST_SETS, { sortKey: 'name' });
  assert.deepEqual(
    result.map((s) => s.name),
    ['Annihilation', 'Breakout', 'Civil War', 'Dark City']
  );
});

test('filterBrowseSets with sortKey "releaseYear" sorts ascending by year, A–Z name as tiebreaker', () => {

  const result = filterBrowseSets(SORT_TEST_SETS, { sortKey: 'releaseYear' });
  assert.deepEqual(
    result.map((s) => s.name),
    ['Dark City', 'Breakout', 'Civil War', 'Annihilation']
  );
});

test('filterBrowseSets with sortKey "collection" puts owned set first; unowned sorted A–Z', () => {

  const ownedSetIds = new Set(['set-c']);
  const result = filterBrowseSets(SORT_TEST_SETS, { sortKey: 'collection', ownedSetIds });
  assert.deepEqual(
    result.map((s) => s.name),
    ['Civil War', 'Annihilation', 'Breakout', 'Dark City']
  );
});

test('filterBrowseSets with no options produces the same order as sortKey "name" (no regression)', () => {

  const defaultResult = filterBrowseSets(SORT_TEST_SETS);
  const namedResult = filterBrowseSets(SORT_TEST_SETS, { sortKey: 'name' });
  assert.deepEqual(
    defaultResult.map((s) => s.id),
    namedResult.map((s) => s.id)
  );
});

// ── From epic22-catalog-ordering (browse-utils parts) ────────────────────────

test('filterBrowseSets applies a locale-safe alphabetical sort', () => {

  const browseUtilsSource = readFileSync(join(process.cwd(), 'src/app/browse-utils.ts'), 'utf8');
  assert.match(browseUtilsSource, /localeCompare/);
});

test('BROWSE_TYPE_OPTIONS base entry uses the label "Base Game"', () => {

  const browseUtilsSource = readFileSync(join(process.cwd(), 'src/app/browse-utils.ts'), 'utf8');
  assert.match(browseUtilsSource, /id:\s*'base'[\s\S]{0,40}label:\s*'Base Game'/);
});

test('TYPE_LABELS base entry uses "Base Game"', () => {

  const browseUtilsSource = readFileSync(join(process.cwd(), 'src/app/browse-utils.ts'), 'utf8');
  assert.match(browseUtilsSource, /base:\s*'Base Game'/);
});

test('Browse-utils no longer has an outstanding small/large expansion TODO (resolved in Epic 26)', () => {

  const browseUtilsSource = readFileSync(join(process.cwd(), 'src/app/browse-utils.ts'), 'utf8');
  assert.doesNotMatch(browseUtilsSource, /TODO.*small\/large expansion reclassifications/i);
});

// ── From epic26-classification-corrections (browse-utils parts) ────────────

test('Standalone filter is removed from browse-utils', () => {

  const browseUtilsSource = readFileSync(join(process.cwd(), 'src/app/browse-utils.ts'), 'utf8');
  assert.doesNotMatch(browseUtilsSource, /id:\s*['"](standalone)['"]/);
  assert.doesNotMatch(browseUtilsSource, /standalone.*Standalone/);
});

test('Alphabetical order in filterBrowseSets is preserved', () => {

  const browseUtilsSource = readFileSync(join(process.cwd(), 'src/app/browse-utils.ts'), 'utf8');
  assert.match(browseUtilsSource, /localeCompare/);
});

