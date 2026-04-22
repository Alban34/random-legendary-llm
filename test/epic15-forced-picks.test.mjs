import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildHistoryReadySetupSnapshot, generateSetup, validateSetupLegality } from '../src/app/setup-generator.ts';
import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { acceptGameSetup, createDefaultState } from '../src/app/state-store.ts';

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

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Epic 15 supports forced picks across setup categories when a legal setup exists', () => {
  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find((entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount);
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
  const forcedHero = bundle.runtime.indexes.allHeroes[0];
  const forcedVillainGroup = bundle.runtime.indexes.allVillainGroups[0];
  const forcedHenchmanGroup = bundle.runtime.indexes.allHenchmanGroups[0];

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      heroIds: [forcedHero.id],
      villainGroupIds: [forcedVillainGroup.id],
      henchmanGroupIds: [forcedHenchmanGroup.id]
    },
    random: () => 0
  });

  assert.equal(setup.scheme.id, simpleScheme.id);
  assert.equal(setup.mastermind.id, simpleMastermind.id);
  assert.ok(setup.heroes.some((hero) => hero.id === forcedHero.id));
  assert.ok(setup.villainGroups.some((group) => group.id === forcedVillainGroup.id));
  assert.ok(setup.henchmanGroups.some((group) => group.id === forcedHenchmanGroup.id));
  assert.ok(setup.notices.some((notice) => notice.includes('Applied forced picks')));
});

test('Epic 15 surfaces actionable legality reasons for unavailable or illegal forced picks', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const missingScheme = bundle.runtime.indexes.allSchemes.find((entity) => entity.setId !== 'core-set');
  const missingHero = bundle.runtime.indexes.allHeroes.find((entity) => entity.setId !== 'core-set');

  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'standard',
    forcedPicks: {
      schemeId: missingScheme.id,
      heroIds: [missingHero.id]
    }
  });

  assert.equal(legality.ok, false);
  assert.ok(legality.reasons.some((reason) => reason.includes('Forced Scheme is not owned')));
  assert.ok(legality.reasons.some((reason) => reason.includes('Forced Heroes are not owned')));
});

test('Epic 15 explains impossible forced-pick collisions with scheme and mastermind requirements', () => {
  const state = createAllOwnedState();
  const scheme = bundle.runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters');
  const mastermind = bundle.runtime.indexes.allMasterminds.find((entity) => entity.name === 'Red Skull' && entity.setId === 'core-set');
  const extraVillainGroup = bundle.runtime.indexes.allVillainGroups.find((entity) => ![scheme.forcedGroups[0].id, mastermind.lead.id].includes(entity.id));

  assert.throws(() => generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: scheme.id,
      mastermindId: mastermind.id,
      villainGroupIds: [extraVillainGroup.id]
    },
    random: () => 0
  }), /Forced Villain Groups exceed the available slots/);
});

test('Epic 15 keeps forced picks out of persisted accepted history records', () => {
  const initialState = createAllOwnedState();
  const setup = generateSetup({
    runtime: bundle.runtime,
    state: initialState,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      heroIds: [bundle.runtime.indexes.allHeroes[0].id]
    },
    random: () => 0
  });

  const snapshot = buildHistoryReadySetupSnapshot(setup);
  const acceptedState = acceptGameSetup(initialState, {
    playerCount: 2,
    playMode: 'standard',
    setupSnapshot: snapshot,
    id: 'epic15-accept-test',
    createdAt: '2026-04-10T12:00:00.000Z'
  });

  assert.equal('forcedPicks' in snapshot, false);
  assert.equal('forcedPicks' in acceptedState.history[0], false);
  assert.equal(acceptedState.history[0].id, 'epic15-accept-test');
});