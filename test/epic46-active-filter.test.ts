import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import {
  SCHEMA_VERSION,
  clearActiveSetIds,
  createDefaultState,
  sanitizePersistedState,
  setActiveSetIds,
  toggleOwnedSet
} from '../src/app/state-store.ts';
import { generateSetup, validateSetupLegality } from '../src/app/setup-generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

// ── Story 46.1 ───────────────────────────────────────────────────────────────

test('createDefaultState produces activeSetIds: null', () => {

  const state = createDefaultState();
  assert.equal(state.collection.activeSetIds, null);
});

test('setActiveSetIds replaces the field', () => {

  const state = createDefaultState();
  const next = setActiveSetIds(state, ['core-set']);
  assert.deepEqual(next.collection.activeSetIds, ['core-set']);
  // original is unchanged
  assert.equal(state.collection.activeSetIds, null);
});

test('clearActiveSetIds resets activeSetIds to null', () => {

  const state = createDefaultState();
  const withFilter = setActiveSetIds(state, ['core-set']);
  const cleared = clearActiveSetIds(withFilter);
  assert.equal(cleared.collection.activeSetIds, null);
});

test('Sanitization keeps only IDs present in ownedSetIds', () => {

  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: {
      ownedSetIds: ['core-set'],
      activeSetIds: ['core-set', 'invalid-id']
    },
    usage: {},
    history: [],
    preferences: {}
  };

  const { state, notices } = sanitizePersistedState({ candidate, indexes: bundle.runtime.indexes });

  assert.deepEqual(state.collection.activeSetIds, ['core-set']);
  assert.ok(
    notices.some((n) => n.includes('Removed invalid active set IDs')),
    `Expected a notice about removed active set IDs, got: ${JSON.stringify(notices)}`
  );
});

test('Sanitization emits no notice when activeSetIds is absent (old data)', () => {

  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: {
      ownedSetIds: ['core-set']
      // activeSetIds intentionally absent
    },
    usage: {},
    history: [],
    preferences: {}
  };

  const { state, notices } = sanitizePersistedState({ candidate, indexes: bundle.runtime.indexes });

  assert.equal(state.collection.activeSetIds, null);
  assert.ok(
    !notices.some((n) => n.includes('Removed invalid active set IDs')),
    `Unexpected notice about active set IDs: ${JSON.stringify(notices)}`
  );
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

  let state = createDefaultState(); // activeSetIds: null (no filter)
  state = toggleOwnedSet(state, 'core-set');

  assert.equal(state.collection.activeSetIds, null);
});

// ── Story 46.2 ───────────────────────────────────────────────────────────────

test('validateSetupLegality uses activeSetIds pool when non-empty', () => {

  const { runtime } = bundle;
  let state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = ['core-set'];

  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });

  const setIds = result.pools.sets.map((s) => s.id);
  assert.ok(setIds.includes('core-set'), 'core-set should be in pools');
  assert.ok(!setIds.includes('dark-city'), 'dark-city should NOT be in pools when filtered out');
});

test('validateSetupLegality uses ownedSetIds pool when activeSetIds is null (no filter)', () => {

  const { runtime } = bundle;
  let state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = null; // null = no filter

  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });

  const setIds = result.pools.sets.map((s) => s.id);
  assert.ok(setIds.includes('core-set'), 'core-set should be in pools');
  assert.ok(setIds.includes('dark-city'), 'dark-city should be in pools when no filter active');
});

test('generateSetup with activeSetIds filter runs without error', () => {

  const { runtime } = bundle;
  // Use core-set alone — it must have enough heroes/villains/schemes for a 2-player game
  let state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.collection.activeSetIds = ['core-set'];

  // First confirm the active pool is legal
  const legality = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });
  if (!legality.ok) {
    // If core-set alone is insufficient, verify the filter was at least applied correctly
    assert.deepEqual(
      legality.pools.sets.map((s) => s.id),
      ['core-set'],
      'Pool should only contain core-set even if not enough content'
    );
    return;
  }

  // generateSetup throws on failure; success returns a setup object
  let setup;
  assert.doesNotThrow(() => {
    setup = generateSetup({ runtime, state, playerCount: 2, playMode: 'standard' });
  }, 'generateSetup should not throw when a valid setup exists');
  assert.ok(setup, 'generateSetup should return a setup object');
});

test('validateSetupLegality works when activeSetIds field is missing (legacy state)', () => {

  const { runtime } = bundle;
  const state = createDefaultState();
  // Simulate legacy state without activeSetIds
  delete state.collection.activeSetIds;
  state.collection.ownedSetIds = ['core-set'];

  // Should not throw, should fall back to ownedSetIds
  const result = validateSetupLegality({ runtime, state, playerCount: 2, playMode: 'standard' });
  const setIds = result.pools.sets.map((s) => s.id);
  assert.ok(setIds.includes('core-set'));
});
