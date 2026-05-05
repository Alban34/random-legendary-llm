import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import {
  STORAGE_KEY,
  acceptGameSetup,
  clearActiveSetIds,
  createDefaultState,
  createStorageAdapter,
  resetAllState,
  resetUsageCategory,
  saveState,
  setActiveSetIds,
  toggleOwnedSet
} from './state-store.ts';
import { generateSetup, validateSetupLegality } from './setup-generator.ts';
import { createMemoryStorage } from './test-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function createSampleSetup(offset = 0) {
  const runtime = bundle.runtime.indexes;
  return {
    id: `game-${offset}`,
    createdAt: `2026-04-09T12:00:0${offset}.000Z`,
    playerCount: offset % 2 === 0 ? 1 : 2,
    advancedSolo: offset % 2 === 0,
    setupSnapshot: {
      mastermindId: runtime.allMasterminds[offset].id,
      schemeId: runtime.allSchemes[offset].id,
      heroIds: runtime.allHeroes.slice(offset, offset + 3).map((entity) => entity.id),
      villainGroupIds: [runtime.allVillainGroups[offset].id],
      henchmanGroupIds: [runtime.allHenchmanGroups[offset].id]
    }
  };
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Accepted setups update usage statistics and history newest-first', () => {

  let state = createDefaultState();

  state = acceptGameSetup(state, createSampleSetup(0));
  state = acceptGameSetup(state, createSampleSetup(1));

  assert.equal(state.history.length, 2);
  assert.equal(state.history[0].id, 'game-1');
  assert.equal(state.history[1].id, 'game-0');
  assert.equal(Object.keys(state.usage.heroes).length >= 3, true);
  assert.equal(state.usage.masterminds[bundle.runtime.indexes.allMasterminds[1].id].plays, 1);
  assert.equal(state.preferences.lastPlayerCount, 2);
  assert.equal(state.preferences.lastAdvancedSolo, false);
});

test('Per-category reset only clears the intended usage bucket', () => {

  let state = createDefaultState();
  state = acceptGameSetup(state, createSampleSetup(0));

  const resetState = resetUsageCategory(state, 'heroes');

  assert.deepEqual(resetState.usage.heroes, {});
  assert.notDeepEqual(resetState.usage.masterminds, {});
  assert.notDeepEqual(resetState.usage.villainGroups, {});
});

test('Full reset clears persisted state safely', () => {

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  const state = acceptGameSetup(createDefaultState(), createSampleSetup(0));

  saveState({ storageAdapter, state });
  assert.ok(storage.dump()[STORAGE_KEY]);

  const result = resetAllState({ storageAdapter });

  assert.equal(result.save.ok, true);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.deepEqual(result.state, createDefaultState());
});

// ── From epic46-active-filter ────────────────────────────────────────────────

test('setActiveSetIds replaces the field', () => {

  const state = createDefaultState();
  const next = setActiveSetIds(state, ['core-set']);
  assert.deepEqual(next.collection.activeSetIds, ['core-set']);
  assert.equal(state.collection.activeSetIds, null);
});

test('clearActiveSetIds resets activeSetIds to null', () => {

  const state = createDefaultState();
  const withFilter = setActiveSetIds(state, ['core-set']);
  const cleared = clearActiveSetIds(withFilter);
  assert.equal(cleared.collection.activeSetIds, null);
});

test('toggleOwnedSet removes set from activeSetIds when ownership toggled OFF', () => {

  let state = createDefaultState();
  state = toggleOwnedSet(state, 'core-set');
  state = setActiveSetIds(state, ['core-set']);

  assert.ok(state.collection.ownedSetIds.includes('core-set'));
  assert.ok(state.collection.activeSetIds.includes('core-set'));

  state = toggleOwnedSet(state, 'core-set');

  assert.ok(!state.collection.ownedSetIds.includes('core-set'));
  assert.ok(!state.collection.activeSetIds.includes('core-set'));
});

test('toggleOwnedSet does not affect activeSetIds when toggling ON', () => {

  let state = createDefaultState();
  state = toggleOwnedSet(state, 'core-set');

  assert.equal(state.collection.activeSetIds, null);
});

test('validateSetupLegality uses activeSetIds pool when non-empty', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = ['core-set'];

  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });

  const setIds = new Set(result.pools.sets.map((s) => s.id));
  assert.ok(setIds.has('core-set'), 'core-set should be in pools');
  assert.ok(!setIds.has('dark-city'), 'dark-city should NOT be in pools when filtered out');
});

test('validateSetupLegality uses ownedSetIds pool when activeSetIds is null (no filter)', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = null;

  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });

  const setIds = new Set(result.pools.sets.map((s) => s.id));
  assert.ok(setIds.has('core-set'), 'core-set should be in pools');
  assert.ok(setIds.has('dark-city'), 'dark-city should be in pools when no filter active');
});

test('generateSetup with activeSetIds filter runs without error', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = ['core-set'];

  const legality = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });
  if (!legality.ok) {
    assert.deepEqual(
      legality.pools.sets.map((s) => s.id),
      ['core-set'],
      'Pool should only contain core-set even if not enough content'
    );
    return;
  }

  let setup;
  assert.doesNotThrow(() => {
    setup = generateSetup({ runtime, state, playerCount: 2, playMode: 'standard' });
  }, 'generateSetup should not throw when a valid setup exists');
  assert.ok(setup, 'generateSetup should return a setup object');
});

test('validateSetupLegality works when activeSetIds field is missing (legacy state)', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  delete state.collection.activeSetIds;
  state.collection.ownedSetIds = ['core-set'];

  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });
  const setIds = result.pools.sets.map((s) => s.id);
  assert.ok(setIds.includes('core-set'));
});


