import { test, beforeAll, vi } from 'vitest';
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
  createGameRecordId,
  createStorageAdapter,
  deactivateAllSets,
  resetAllState,
  resetOwnedCollection,
  resetUsageCategory,
  saveState,
  setActiveSetIds,
  toggleOwnedSet,
  updateGameResult
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

// ── Story 97.4 — collection ownership transitions and action reducer edge cases ──

test('deactivateAllSets sets activeSetIds to an empty array', () => {

  let state = createDefaultState();
  state = setActiveSetIds(state, ['core-set', 'dark-city']);
  assert.deepEqual(state.collection.activeSetIds, ['core-set', 'dark-city']);

  const deactivated = deactivateAllSets(state);
  assert.deepEqual(deactivated.collection.activeSetIds, []);
  // original state must not be mutated
  assert.deepEqual(state.collection.activeSetIds, ['core-set', 'dark-city']);
});

test('resetOwnedCollection clears ownedSetIds while leaving other state intact', () => {

  let state = createDefaultState();
  state = toggleOwnedSet(state, 'core-set');
  state = toggleOwnedSet(state, 'dark-city');
  state = acceptGameSetup(state, createSampleSetup(0));

  const reset = resetOwnedCollection(state);
  assert.deepEqual(reset.collection.ownedSetIds, []);
  assert.equal(reset.history.length, state.history.length, 'History should be preserved');
  assert.deepEqual(reset.usage.masterminds, state.usage.masterminds, 'Usage should be preserved');
});

test('toggleOwnedSet toggling OFF when activeSetIds is null leaves activeSetIds as null', () => {

  let state = createDefaultState();
  state = toggleOwnedSet(state, 'core-set');
  assert.equal(state.collection.activeSetIds, null);

  // Toggle it back off — activeSetIds is null so the inner filter branch must not execute
  state = toggleOwnedSet(state, 'core-set');

  assert.ok(!state.collection.ownedSetIds.includes('core-set'));
  assert.equal(state.collection.activeSetIds, null, 'activeSetIds should remain null when toggled off from a null baseline');
});

test('acceptGameSetup with epicMastermind:true records the flag in preferences', () => {

  let state = createDefaultState();
  state = acceptGameSetup(state, { ...createSampleSetup(0), epicMastermind: true });

  assert.equal(state.preferences.lastEpicMastermind, true);
  assert.equal(state.history[0].epicMastermind, true);
});

test('updateGameResult returns original state unchanged when recordId is not found', () => {

  const state = acceptGameSetup(createDefaultState(), createSampleSetup(0));
  const next = updateGameResult(state, { recordId: 'does-not-exist', outcome: 'win', score: 42 });

  assert.strictEqual(next, state, 'Should return the exact same state reference when record is not found');
});

test('updateGameResult updates a solo game result with a numeric score', () => {

  let state = createDefaultState();
  state = acceptGameSetup(state, createSampleSetup(0));
  const recordId = state.history[0].id;

  const updated = updateGameResult(state, { recordId, outcome: 'win', score: 120, notes: 'Great game', playerCount: 1 });

  const record = updated.history.find((r) => r.id === recordId)!;
  assert.equal(record.result.status, 'completed');
  assert.equal(record.result.outcome, 'win');
  assert.equal(record.result.score, 120);
  assert.equal(record.result.notes, 'Great game');
});

test('updateGameResult updates a multiplayer game result with a per-player score array', () => {

  let state = createDefaultState();
  state = acceptGameSetup(state, createSampleSetup(1)); // playerCount=2
  const recordId = state.history[0].id;

  const perPlayerScore = [
    { playerName: 'Alice', score: 15 },
    { playerName: 'Bob', score: 8 }
  ];
  const updated = updateGameResult(state, { recordId, outcome: 'win', score: perPlayerScore });

  const record = updated.history.find((r) => r.id === recordId)!;
  assert.equal(record.result.status, 'completed');
  assert.equal(record.result.outcome, 'win');
  assert.deepEqual(record.result.score, perPlayerScore);
});

// ── Story 97.6 — createGameRecordId fallback branch ──────────────────────────

test('createGameRecordId uses crypto.randomUUID when available', () => {
  const id = createGameRecordId();
  assert.equal(typeof id, 'string');
  assert.ok(id.length > 0);
});

test('createGameRecordId falls back to timestamp-based id when crypto.randomUUID is not available', () => {
  vi.stubGlobal('crypto', {});
  try {
    const id = createGameRecordId();
    assert.ok(id.startsWith('game-'), 'Fallback id must start with "game-"');
    assert.match(id, /^game-\d+-[0-9a-f]+$/);
  } finally {
    vi.unstubAllGlobals();
  }
});


