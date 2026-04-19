import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { generateSetup, validateSetupLegality } from '../src/app/setup-generator.mjs';
import { createDefaultState } from '../src/app/state-store.mjs';
import { getAvailablePlayModes } from '../src/app/new-game-utils.mjs';
import { resolvePlayMode, resolveSetupTemplate } from '../src/app/setup-rules.mjs';

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

test('Epic 56 resolveSetupTemplate returns correct shape for standard-solo-v2', () => {
  const template = resolveSetupTemplate(1, { playMode: 'standard-solo-v2' });

  assert.equal(template.heroCount, 3);
  assert.equal(template.villainGroupCount, 1);
  assert.equal(template.henchmanGroupCount, 1);
  assert.equal(template.wounds, 25);
  assert.equal(template.playMode, 'standard-solo-v2');
});

test('Epic 56 resolvePlayMode throws when standard-solo-v2 is used with more than 1 player', () => {
  assert.throws(
    () => resolvePlayMode(2, { playMode: 'standard-solo-v2' }),
    /only available for 1 player/
  );
});

test('Epic 56 getAvailablePlayModes includes standard-solo-v2 for 1 player but not for 2 players', () => {
  const soloModes = getAvailablePlayModes(1).map((m) => m.id);
  assert.ok(soloModes.includes('standard-solo-v2'), 'standard-solo-v2 should be in 1-player modes');

  const multiModes = getAvailablePlayModes(2).map((m) => m.id);
  assert.ok(!multiModes.includes('standard-solo-v2'), 'standard-solo-v2 should not be in 2-player modes');
});

test('Epic 56 standard-solo-v2 does not inherit the Epic 53 scheme eligibility restriction', () => {
  const state = createAllOwnedState();
  const legality = validateSetupLegality({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'standard-solo-v2'
  });

  // core-set-negative-zone-prison-breakout has no minimumPlayerCount constraint, so its
  // eligibility purely depends on the incompatiblePlayModes restriction from Epic 53 which
  // must NOT apply to standard-solo-v2.
  assert.ok(
    legality.eligibleSchemes.some((s) => s.id === 'core-set-negative-zone-prison-breakout'),
    'Expected core-set-negative-zone-prison-breakout to be eligible for standard-solo-v2 (not subject to standard-solo restriction)'
  );

  // core-set-super-hero-civil-war and marvel-studios-phase-1-super-hero-civil-war have a
  // pre-existing minimumPlayerCount: 2 constraint that makes them ineligible for any
  // 1-player mode independently of the Epic 53 restriction.
  const civilWarIds = [
    'core-set-super-hero-civil-war',
    'marvel-studios-phase-1-super-hero-civil-war'
  ];
  for (const id of civilWarIds) {
    assert.ok(
      !legality.eligibleSchemes.some((s) => s.id === id),
      `Expected ${id} to be ineligible for standard-solo-v2 due to minimumPlayerCount: 2`
    );
  }
});

test('Epic 56 generateSetup with standard-solo-v2 returns setup matching the v2 template', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 1,
    playMode: 'standard-solo-v2',
    random: () => 0
  });

  assert.equal(setup.template.heroCount, 3);
  assert.equal(setup.template.villainGroupCount, 1);
  assert.equal(setup.template.playMode, 'standard-solo-v2');
});
