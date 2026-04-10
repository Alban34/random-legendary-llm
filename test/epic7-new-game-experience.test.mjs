import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { acceptGameSetup, createDefaultState } from '../src/app/state-store.mjs';
import { buildHistoryReadySetupSnapshot, generateSetup } from '../src/app/setup-generator.mjs';
import {
  formatHeroTeamLabel,
  formatMastermindLeadLabel,
  getDisplayedSetupRequirements,
  isAdvancedSoloAvailable
} from '../src/app/new-game-utils.mjs';

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

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Epic 7 control helpers expose visible requirements and Advanced Solo availability correctly', () => {
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
    template: { playerCount: 2, advancedSolo: false },
    requirements: {
      heroCount: 6,
      villainGroupCount: 2,
      henchmanGroupCount: 1,
      wounds: 30,
      bystanders: 12
    }
  };
  assert.deepEqual(getDisplayedSetupRequirements({ playerCount: 2, advancedSolo: false, currentSetup }), currentSetup.requirements);
});

test('Epic 7 exposes UI-facing lead, team, and forced-group details for representative setups', () => {
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

test('Epic 7 Accept & Log mutates history and usage exactly once from the current generated setup snapshot', () => {
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

