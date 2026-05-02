import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateSetup, validateSetupLegality } from '../src/app/setup-generator.ts';
import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { createDefaultState } from '../src/app/state-store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

const INELIGIBLE_STANDARD_SOLO_IDS = [
  'core-set-super-hero-civil-war',
  'marvel-studios-phase-1-super-hero-civil-war',
  'core-set-negative-zone-prison-breakout'
];

let bundle;

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Standard solo eligibleSchemes excludes all three ineligible scheme ids', () => {

  const state = createAllOwnedState();
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'standard'
  });
  for (const id of INELIGIBLE_STANDARD_SOLO_IDS) {
    assert.ok(
      !legality.eligibleSchemes.some((s) => s.id === id),
      `Expected ${id} to be excluded from standard-solo eligibleSchemes`
    );
  }
});

test('Advanced-solo eligibleSchemes includes core-set-negative-zone-prison-breakout', () => {

  const state = createAllOwnedState();
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'advanced-solo'
  });
  assert.ok(
    legality.eligibleSchemes.some((s) => s.id === 'core-set-negative-zone-prison-breakout'),
    'Expected core-set-negative-zone-prison-breakout to be eligible in advanced-solo'
  );
});

test('Two-handed-solo eligibleSchemes includes core-set-negative-zone-prison-breakout', () => {

  const state = createAllOwnedState();
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'two-handed-solo'
  });
  assert.ok(
    legality.eligibleSchemes.some((s) => s.id === 'core-set-negative-zone-prison-breakout'),
    'Expected core-set-negative-zone-prison-breakout to be eligible in two-handed-solo'
  );
});

test('Standard 2-player eligibleSchemes includes core-set-negative-zone-prison-breakout', () => {

  const state = createAllOwnedState();
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard'
  });
  assert.ok(
    legality.eligibleSchemes.some((s) => s.id === 'core-set-negative-zone-prison-breakout'),
    'Expected core-set-negative-zone-prison-breakout to be eligible for 2-player standard'
  );
});

test('generateSetup standard solo never returns an ineligible scheme over 50 calls', () => {

  const state = createAllOwnedState();
  for (let i = 0; i < 50; i++) {
    const setup = generateSetup({
      runtime: bundle.runtime,
      state,
      playerCount: 1,
      playMode: 'standard'
    });
    assert.ok(
      !INELIGIBLE_STANDARD_SOLO_IDS.includes(setup.scheme.id),
      `Call ${i + 1}: generateSetup returned ineligible scheme ${setup.scheme.id}`
    );
  }
});

test('Standard solo with forced ineligible scheme returns ok false and correct reason', () => {

  const state = createAllOwnedState();
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'standard',
    forcedPicks: {
      schemeId: 'core-set-negative-zone-prison-breakout'
    }
  });
  assert.equal(legality.ok, false);
  assert.ok(
    legality.reasons.some((r) => r.includes('not legal for the selected play mode')),
    `Expected reason about play mode, got: ${JSON.stringify(legality.reasons)}`
  );
});

test('Advanced-solo with forced core-set-negative-zone-prison-breakout returns ok true', () => {

  const state = createAllOwnedState();
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'advanced-solo',
    forcedPicks: {
      schemeId: 'core-set-negative-zone-prison-breakout'
    }
  });
  assert.equal(legality.ok, true);
});

test('Mastermind villain lead + 1 forced villain group exceeds 1 slot in standard solo (ok true)', () => {

  const state = createAllOwnedState();
  const mastermind = bundle.runtime.indexes.allMasterminds.find((m) => m.lead?.category === 'villains');
  assert.ok(mastermind, 'Expected at least one mastermind with a villain lead');
  const otherVillainGroup = bundle.runtime.indexes.allVillainGroups.find((vg) => vg.id !== mastermind.lead.id);
  assert.ok(otherVillainGroup, 'Expected at least one villain group other than the mastermind lead');
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'standard',
    forcedPicks: {
      mastermindId: mastermind.id,
      villainGroupIds: [otherVillainGroup.id]
    }
  });
  assert.equal(legality.ok, true);
});

test('Mastermind villain lead + 1 forced villain group fits in 2-player standard (ok true)', () => {

  const state = createAllOwnedState();
  const mastermind = bundle.runtime.indexes.allMasterminds.find((m) => m.lead?.category === 'villains');
  assert.ok(mastermind, 'Expected at least one mastermind with a villain lead');
  const otherVillainGroup = bundle.runtime.indexes.allVillainGroups.find((vg) => vg.id !== mastermind.lead.id);
  assert.ok(otherVillainGroup, 'Expected at least one villain group other than the mastermind lead');
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      mastermindId: mastermind.id,
      villainGroupIds: [otherVillainGroup.id]
    }
  });
  assert.equal(legality.ok, true);
});

test('Mastermind villain lead alone is valid in standard solo (ok true)', () => {

  const state = createAllOwnedState();
  const mastermind = bundle.runtime.indexes.allMasterminds.find((m) => m.lead?.category === 'villains');
  assert.ok(mastermind, 'Expected at least one mastermind with a villain lead');
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'standard',
    forcedPicks: {
      mastermindId: mastermind.id
    }
  });
  assert.equal(legality.ok, true);
});

test('Mastermind henchman lead + 1 forced henchman group exceeds 1 slot in standard solo (ok true)', () => {

  const state = createAllOwnedState();
  const mastermind = bundle.runtime.indexes.allMasterminds.find((m) => m.lead?.category === 'henchmen');
  assert.ok(mastermind, 'Expected at least one mastermind with a henchman lead');
  const otherHenchmanGroup = bundle.runtime.indexes.allHenchmanGroups.find((hg) => hg.id !== mastermind.lead.id);
  assert.ok(otherHenchmanGroup, 'Expected at least one henchman group other than the mastermind lead');
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'standard',
    forcedPicks: {
      mastermindId: mastermind.id,
      henchmanGroupIds: [otherHenchmanGroup.id]
    }
  });
  assert.equal(legality.ok, true);
});

test('Mastermind henchman lead + 1 forced henchman group fits in 4-player standard (ok true)', () => {

  const state = createAllOwnedState();
  const mastermind = bundle.runtime.indexes.allMasterminds.find((m) => m.lead?.category === 'henchmen');
  assert.ok(mastermind, 'Expected at least one mastermind with a henchman lead');
  const otherHenchmanGroup = bundle.runtime.indexes.allHenchmanGroups.find((hg) => hg.id !== mastermind.lead.id);
  assert.ok(otherHenchmanGroup, 'Expected at least one henchman group other than the mastermind lead');
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 4,
    playMode: 'standard',
    forcedPicks: {
      mastermindId: mastermind.id,
      henchmanGroupIds: [otherHenchmanGroup.id]
    }
  });
  assert.equal(legality.ok, true);
});
