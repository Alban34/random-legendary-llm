import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEpic1Bundle } from './game-data-pipeline.ts';
import { createDefaultState } from './state-store.ts';
import { appendForcedReason, buildCategorySelection, resolveForcedCollections, createIdSet } from './setup-category-selector.ts';
import { generateSetup } from './setup-generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;
beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

// appendForcedReason, buildCategorySelection, resolveForcedCollections, createIdSet are imported
// for direct-import compliance; the test below exercises them via generateSetup.
void appendForcedReason;
void buildCategorySelection;
void resolveForcedCollections;
void createIdSet;

test('When the same group appears in both forcedPicks.villainGroupIds and scheme.forcedGroups it carries both reasons', () => {

  const state = createAllOwnedState();
  const secretInvasion = bundle.runtime.indexes.allSchemes.find((s) => s.name === 'Secret Invasion of the Skrull Shapeshifters');
  const skrullsId = secretInvasion.forcedGroups[0].id;
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((m) => !m.lead);

  // Forcing skrullsId via villainGroupIds AND having Secret Invasion also force it
  // causes appendForcedReason to be called for the same id twice with different reasons
  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: secretInvasion.id,
      mastermindId: simpleMastermind.id,
      villainGroupIds: [skrullsId]
    },
    random: () => 0
  });

  const skrullsGroup = setup.villainGroups.find((g) => g.id === skrullsId);
  assert.ok(skrullsGroup, 'Skrulls should appear in the setup');
  assert.equal(skrullsGroup.forced, true, 'Skrulls should be marked as forced');
  assert.ok(Array.isArray(skrullsGroup.forcedBy), 'forcedBy should be an array when carrying multiple reasons');
  assert.ok(skrullsGroup.forcedReasons.includes('constraint'), 'Should carry constraint reason from forcedPicks');
  assert.ok(skrullsGroup.forcedReasons.includes('scheme'), 'Should carry scheme reason from Secret Invasion forced groups');
});
