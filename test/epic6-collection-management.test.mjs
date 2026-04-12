import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import {
  COLLECTION_FEASIBILITY_MODES,
  COLLECTION_TYPE_GROUPS,
  getCollectionFeasibility,
  groupSetsByType,
  summarizeOwnedCollection
} from '../src/app/collection-utils.mjs';
import { createDefaultState, resetOwnedCollection, toggleOwnedSet } from '../src/app/state-store.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Epic 6 groups sets by type in the approved Base / Large / Small order', () => {
  const groups = groupSetsByType(bundle.runtime.sets);

  assert.deepEqual(groups.map((group) => group.id), COLLECTION_TYPE_GROUPS.map((group) => group.id));
  assert.deepEqual(groups[0].sets.map((set) => set.name), ['Core Set', 'Villains']);
  assert.ok(groups[1].sets.some((set) => set.name === 'Dark City'));
  assert.ok(groups[2].sets.some((set) => set.name === 'Fantastic Four'));
});

test('Epic 6 collection totals derive directly from the currently owned sets', () => {
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

test('Epic 6 feasibility indicators react to empty, thin, and healthy collections', () => {
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

test('Epic 6 clearing the collection removes owned sets without disturbing history or usage', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.history = [{ id: 'existing-history' }];
  state.usage.heroes = { 'core-set-black-widow': { plays: 1, lastPlayedAt: '2026-04-10T00:00:00.000Z' } };

  const cleared = resetOwnedCollection(state);
  assert.deepEqual(cleared.collection.ownedSetIds, []);
  assert.deepEqual(cleared.history, state.history);
  assert.deepEqual(cleared.usage.heroes, state.usage.heroes);
});

