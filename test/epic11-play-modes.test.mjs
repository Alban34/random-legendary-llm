import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { getCollectionFeasibility } from '../src/app/collection-utils.ts';
import { buildHistoryReadySetupSnapshot, generateSetup, validateSetupLegality } from '../src/app/setup-generator.ts';
import { formatHistorySummary } from '../src/app/history-utils.ts';
import { acceptGameSetup, createDefaultState, createStorageAdapter, loadState, saveState } from '../src/app/state-store.ts';
import { getAvailablePlayModes, getDisplayedSetupRequirements, getPlayModeHelpText } from '../src/app/new-game-utils.ts';
import { resolveSetupTemplate } from '../src/app/setup-rules.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

function createMemoryStorage(initialEntries = {}) {
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

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Epic 11 resolves two-handed solo as a solo mode that uses the 2-player setup counts', () => {
  const template = resolveSetupTemplate(1, { playMode: 'two-handed-solo' });

  assert.deepEqual(template, {
    key: '1-two-handed',
    playerCount: 1,
    effectivePlayerCount: 2,
    advancedSolo: false,
    playMode: 'two-handed-solo',
    modeLabel: 'Two-Handed Solo',
    modeDescription: 'Track the game as solo, but use the standard 2-player setup counts.',
    heroCount: 5,
    villainGroupCount: 2,
    henchmanGroupCount: 1,
    wounds: 30
  });
});

test('Epic 11 keeps legality, collection feasibility, and generated setup output aligned for two-handed solo', () => {
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

test('Epic 11 New Game helpers expose mode options, help text, and mode-aware requirement rendering', () => {
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

test('Epic 11 persists normalized play-mode metadata while keeping legacy history records readable', () => {
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

  const storage = createMemoryStorage();
  const storageAdapter = createStorageAdapter(storage);
  saveState({ storageAdapter, state: legacyState });
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.equal(loaded.state.history[0].playMode, 'advanced-solo');
  assert.equal(formatHistorySummary(loaded.state.history[0], bundle.runtime.indexes).modeLabel, 'Advanced Solo');
});