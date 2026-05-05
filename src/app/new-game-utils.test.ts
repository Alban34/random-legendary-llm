import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import { acceptGameSetup, createDefaultState, createStorageAdapter, loadState, saveState } from './state-store.ts';
import { buildHistoryReadySetupSnapshot, generateSetup, validateSetupLegality } from './setup-generator.ts';
import { getCollectionFeasibility } from './collection-utils.ts';
import {
  formatHeroTeamLabel,
  formatMastermindLeadLabel,
  formatPersistedPlayMode,
  getAvailablePlayModes,
  getDisplayedSetupRequirements,
  getPlayModeHelpText,
  isAdvancedSoloAvailable
} from './new-game-utils.ts';
import { formatHistorySummary } from './history-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

function markAllUsedExcept(bucket, entities, keepIds) {
  const keep = new Set(keepIds);
  entities.forEach((entity, index) => {
    if (!keep.has(entity.id)) {
      bucket[entity.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Control helpers expose visible requirements and Advanced Solo availability correctly', () => {

  assert.equal(isAdvancedSoloAvailable(1), true);
  assert.equal(isAdvancedSoloAvailable(2), false);

  const templateRequirements = getDisplayedSetupRequirements({
    playerCount: 2,
    advancedSolo: false,
    currentSetup: null
  });
  assert.deepEqual(templateRequirements, {
    heroCount: 5,
    villainGroupCount: 2,
    henchmanGroupCount: 1,
    wounds: 30,
    bystanders: 30
  });

  const currentSetup = {
    template: { playerCount: 2, advancedSolo: false, playMode: 'standard' },
    requirements: {
      heroCount: 6,
      villainGroupCount: 2,
      henchmanGroupCount: 1,
      wounds: 30,
      bystanders: 12
    }
  };
  assert.deepEqual(getDisplayedSetupRequirements({ playerCount: 2, advancedSolo: false, playMode: 'standard', currentSetup }), currentSetup.requirements);
});

test('Exposes UI-facing lead, team, and forced-group details for representative setups', () => {

  const state = createAllOwnedState();
  const scheme = bundle.runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters');
  const mastermind = bundle.runtime.indexes.allMasterminds.find((entity) => entity.name === 'Red Skull' && entity.setId === 'core-set');
  markAllUsedExcept(state.usage.schemes, bundle.runtime.indexes.allSchemes, [scheme.id]);
  markAllUsedExcept(state.usage.masterminds, bundle.runtime.indexes.allMasterminds, [mastermind.id]);

  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, advancedSolo: false, random: () => 0 });

  assert.equal(setup.scheme.name, 'Secret Invasion of the Skrull Shapeshifters');
  assert.equal(setup.mastermind.name, 'Red Skull');
  assert.equal(formatMastermindLeadLabel(setup.mastermind), 'Always leads: HYDRA');
  assert.ok(setup.villainGroups.some((group) => group.forced && group.forcedBy === 'mastermind'));
  assert.ok(setup.villainGroups.some((group) => group.forced && group.forcedBy === 'scheme'));
  assert.ok(setup.scheme.notes.length > 0);
  assert.notEqual(formatHeroTeamLabel(setup.heroes[0]), '');
});

test('Accept & Log mutates history and usage exactly once from the current generated setup snapshot', () => {

  const initialState = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state: initialState, playerCount: 3, advancedSolo: false, random: () => 0 });
  const snapshot = buildHistoryReadySetupSnapshot(setup);

  const acceptedState = acceptGameSetup(initialState, {
    playerCount: 3,
    advancedSolo: false,
    setupSnapshot: snapshot,
    createdAt: '2026-04-10T12:00:00.000Z',
    id: 'epic7-accept-test'
  });

  assert.equal(initialState.history.length, 0);
  assert.equal(acceptedState.history.length, 1);
  assert.equal(acceptedState.history[0].id, 'epic7-accept-test');
  assert.equal(acceptedState.history[0].setupSnapshot.mastermindId, snapshot.mastermindId);
  assert.ok(Object.keys(acceptedState.usage.heroes).length > 0);
  assert.ok(acceptedState.usage.masterminds[snapshot.mastermindId]);
  assert.ok(acceptedState.usage.schemes[snapshot.schemeId]);
});

// ── From epic11-play-modes (new-game-utils portions) ─────────────────────────

function createMemoryStorage11(initialEntries = {}) {
  const store = new Map(Object.entries(initialEntries));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

test('Keeps legality, collection feasibility, and generated setup output aligned for two-handed solo', () => {

  const emptyValidation = validateSetupLegality({
    runtime: bundle.runtime,
    state: createDefaultState(),
    playerCount: 1,
    playMode: 'two-handed-solo'
  });
  assert.equal(emptyValidation.ok, false);
  assert.ok(emptyValidation.reasons.some((reason) => reason.includes('No owned sets')));

  const healthyState = createAllOwnedState();
  const generated = generateSetup({
    runtime: bundle.runtime,
    state: healthyState,
    playerCount: 1,
    playMode: 'two-handed-solo',
    random: () => 0
  });
  assert.equal(generated.template.playMode, 'two-handed-solo');
  assert.equal(generated.template.playerCount, 1);
  assert.equal(generated.requirements.heroCount, 5);
  assert.equal(generated.requirements.villainGroupCount, 2);

  const feasibility = getCollectionFeasibility(bundle.runtime, healthyState);
  assert.equal(feasibility.find((mode) => mode.id === 'two-handed-solo')?.ok, true);
});

test('New Game helpers expose mode options, help text, and mode-aware requirement rendering', () => {

  assert.deepEqual(getAvailablePlayModes(1).map((mode) => mode.id), ['standard', 'advanced-solo', 'two-handed-solo', 'standard-solo-v2']);
  assert.equal(getAvailablePlayModes(2)[0].id, 'standard');
  assert.match(getPlayModeHelpText(1, 'two-handed-solo'), /2-player setup counts/);
  assert.match(getPlayModeHelpText(2, 'standard'), /disabled until you switch back to 1 player/);

  const currentSetup = {
    template: { playerCount: 1, playMode: 'two-handed-solo' },
    requirements: {
      heroCount: 6,
      villainGroupCount: 2,
      henchmanGroupCount: 1,
      wounds: 30,
      bystanders: 12
    }
  };

  assert.deepEqual(getDisplayedSetupRequirements({ playerCount: 1, playMode: 'two-handed-solo', currentSetup }), currentSetup.requirements);
  assert.deepEqual(getDisplayedSetupRequirements({ playerCount: 1, playMode: 'advanced-solo', currentSetup }), {
    heroCount: 3,
    villainGroupCount: 1,
    henchmanGroupCount: 1,
    wounds: 25,
    bystanders: 30
  });
});

test('Persists normalized play-mode metadata while keeping legacy history records readable', () => {

  const initialState = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state: initialState, playerCount: 1, playMode: 'two-handed-solo', random: () => 0 });
  const acceptedState = acceptGameSetup(initialState, {
    playerCount: 1,
    playMode: 'two-handed-solo',
    setupSnapshot: buildHistoryReadySetupSnapshot(setup),
    createdAt: '2026-04-10T12:00:00.000Z',
    id: 'epic11-two-handed'
  });

  assert.equal(acceptedState.history[0].playMode, 'two-handed-solo');
  assert.equal(acceptedState.preferences.lastPlayMode, 'two-handed-solo');
  assert.equal(acceptedState.preferences.lastAdvancedSolo, false);
  assert.equal(formatHistorySummary(acceptedState.history[0], bundle.runtime.indexes).modeLabel, 'Two-Handed Solo');

  const legacyState = createDefaultState();
  legacyState.collection.ownedSetIds = initialState.collection.ownedSetIds;
  legacyState.history = [{
    id: 'legacy-advanced-solo',
    createdAt: '2026-04-09T12:00:00.000Z',
    playerCount: 1,
    advancedSolo: true,
    setupSnapshot: buildHistoryReadySetupSnapshot(setup)
  }];

  const storage = createMemoryStorage11();
  const storageAdapter = createStorageAdapter(storage);
  saveState({ storageAdapter, state: legacyState });
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.equal(loaded.state.history[0].playMode, 'advanced-solo');
  assert.equal(formatHistorySummary(loaded.state.history[0], bundle.runtime.indexes).modeLabel, 'Advanced Solo');
});

test('Format helpers handle heroes without teams, masterminds without a mandatory lead, and non-two-handed-solo help text', () => {

  assert.equal(formatHeroTeamLabel({}), 'No team listed');
  assert.equal(formatHeroTeamLabel({ teams: [] }), 'No team listed');

  assert.equal(formatMastermindLeadLabel({ leadEntity: null }), 'No mandatory lead');
  assert.equal(formatMastermindLeadLabel({}), 'No mandatory lead');

  assert.match(getPlayModeHelpText(1, 'standard'), /Standard Solo v1/);
  assert.match(getPlayModeHelpText(1, 'advanced-solo'), /Standard Solo v1/);

  assert.match(formatPersistedPlayMode(2, 'standard'), /2P/);
  assert.match(formatPersistedPlayMode(1, 'two-handed-solo'), /Two-Handed Solo/);
});

