import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import {
  filterBrowseSets,
  getBrowseTypeLabel,
  matchesBrowseSearch,
  summarizeBrowseSet
} from '../src/app/browse-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Epic 5 browse filtering keeps every included set available with stable type metadata', () => {
  const sets = bundle.runtime.sets;
  const allVisible = filterBrowseSets(sets, { searchTerm: '', typeFilter: 'all' });
  const standalone = filterBrowseSets(sets, { searchTerm: '', typeFilter: 'standalone' });
  const base = filterBrowseSets(sets, { searchTerm: '', typeFilter: 'base' });

  assert.equal(allVisible.length, sets.length);
  assert.equal(new Set(allVisible.map((set) => set.id)).size, sets.length);
  assert.equal(base.length, 2);
  assert.deepEqual(base.map((set) => set.name), ['Core Set', 'Villains']);
  assert.deepEqual(standalone.map((set) => set.name), ['Revelations']);
  assert.equal(getBrowseTypeLabel('large-expansion'), 'Large Expansion');
  assert.equal(getBrowseTypeLabel('small-expansion'), 'Small Expansion');
});

test('Epic 5 search filtering supports canonical names, aliases, and no-match cases', () => {
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

test('Epic 5 browse metadata summaries preserve representative edge-case counts', () => {
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

