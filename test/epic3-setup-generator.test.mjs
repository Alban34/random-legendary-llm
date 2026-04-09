import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { createDefaultState } from '../src/app/state-store.mjs';
import { resolveSetupTemplate } from '../src/app/setup-rules.mjs';
import {
  applySchemeModifiersToTemplate,
  generateSetup,
  rankItemsByFreshness,
  validateSetupLegality
} from '../src/app/setup-generator.mjs';

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

function markAllUsedExcept(bucket, entities, freshIds) {
  const freshIdSet = new Set(freshIds);
  entities.forEach((entity, index) => {
    if (!freshIdSet.has(entity.id)) {
      bucket[entity.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
}

function makeTargetedState({ schemeName, mastermindName, heroUsageOverride } = {}) {
  const state = createAllOwnedState();

  if (schemeName) {
    const scheme = bundle.runtime.indexes.allSchemes.find((entity) => entity.name === schemeName);
    markAllUsedExcept(state.usage.schemes, bundle.runtime.indexes.allSchemes, [scheme.id]);
  }

  if (mastermindName) {
    const mastermind = bundle.runtime.indexes.allMasterminds.find((entity) => entity.name === mastermindName);
    markAllUsedExcept(state.usage.masterminds, bundle.runtime.indexes.allMasterminds, [mastermind.id]);
  }

  if (typeof heroUsageOverride === 'function') {
    heroUsageOverride(state.usage.heroes, bundle.runtime.indexes.allHeroes);
  }

  return state;
}

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Epic 3 resolves setup templates for all supported player modes including Advanced Solo', () => {
  assert.deepEqual(resolveSetupTemplate(1, false), {
    key: '1',
    playerCount: 1,
    advancedSolo: false,
    modeLabel: 'Standard Solo',
    heroCount: 3,
    villainGroupCount: 1,
    henchmanGroupCount: 1,
    wounds: 25
  });
  assert.equal(resolveSetupTemplate(1, true).heroCount, 4);
  assert.equal(resolveSetupTemplate(5, false).villainGroupCount, 4);
  assert.throws(() => resolveSetupTemplate(2, true), /Advanced Solo is only available/);
});

test('Epic 3 legality validation rejects empty or unsupported collections with clear reasons', () => {
  const emptyState = createDefaultState();
  const emptyValidation = validateSetupLegality({ runtime: bundle.runtime, state: emptyState, playerCount: 1, advancedSolo: false });

  assert.equal(emptyValidation.ok, false);
  assert.ok(emptyValidation.reasons.some((reason) => reason.includes('No owned sets')));
  assert.ok(emptyValidation.reasons.some((reason) => reason.includes('heroes')));

  const invalidAdvancedSolo = validateSetupLegality({ runtime: bundle.runtime, state: createAllOwnedState(), playerCount: 2, advancedSolo: true });
  assert.equal(invalidAdvancedSolo.ok, false);
  assert.ok(invalidAdvancedSolo.reasons[0].includes('Advanced Solo'));
});

test('Epic 3 applies scheme constraints, forced groups, and modifiers to generated setups', () => {
  const state = makeTargetedState({ schemeName: 'Secret Invasion of the Skrull Shapeshifters' });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, advancedSolo: false, random: () => 0 });

  assert.equal(setup.scheme.name, 'Secret Invasion of the Skrull Shapeshifters');
  assert.equal(setup.requirements.heroCount, 6);
  assert.ok(setup.villainGroups.some((group) => group.name === 'Skrulls' && group.forced));

  const restrictedScheme = bundle.runtime.indexes.allSchemes.find((entity) => entity.name === 'Super Hero Civil War');
  const template = resolveSetupTemplate(1, false);
  const requirements = applySchemeModifiersToTemplate(template, restrictedScheme);
  assert.equal(requirements.heroCount, template.heroCount);
  assert.equal(restrictedScheme.constraints.minimumPlayerCount, 2);
});

test('Epic 3 mastermind leads consume the correct villain or henchman slot', () => {
  const redSkullState = makeTargetedState({ mastermindName: 'Red Skull' });
  const redSkullSetup = generateSetup({ runtime: bundle.runtime, state: redSkullState, playerCount: 1, advancedSolo: false, random: () => 0 });
  assert.equal(redSkullSetup.mastermind.name, 'Red Skull');
  assert.equal(redSkullSetup.villainGroups.length, redSkullSetup.requirements.villainGroupCount);
  assert.ok(redSkullSetup.villainGroups.some((group) => group.name === 'HYDRA' && group.forced));

  const drDoomState = makeTargetedState({ mastermindName: 'Dr. Doom' });
  const drDoomSetup = generateSetup({ runtime: bundle.runtime, state: drDoomState, playerCount: 1, advancedSolo: false, random: () => 0 });
  assert.equal(drDoomSetup.mastermind.name, 'Dr. Doom');
  assert.equal(drDoomSetup.henchmanGroups.length, drDoomSetup.requirements.henchmanGroupCount);
  assert.ok(drDoomSetup.henchmanGroups.some((group) => group.name === 'Doombot Legion' && group.forced));
});

test('Epic 3 hero freshness ranking prefers never-played first, then least-played, then oldest timestamps', () => {
  const heroes = bundle.runtime.indexes.allHeroes.slice(0, 6);
  const usage = {
    [heroes[2].id]: { plays: 1, lastPlayedAt: '2026-04-03T12:00:00.000Z' },
    [heroes[3].id]: { plays: 1, lastPlayedAt: '2026-04-05T12:00:00.000Z' },
    [heroes[4].id]: { plays: 2, lastPlayedAt: '2026-04-01T12:00:00.000Z' },
    [heroes[5].id]: { plays: 2, lastPlayedAt: '2026-04-02T12:00:00.000Z' }
  };

  const ranked = rankItemsByFreshness(heroes, usage, () => 0);
  assert.deepEqual(new Set(ranked.slice(0, 2).map((entity) => entity.id)), new Set([
    heroes[0].id,
    heroes[1].id
  ]));
  assert.deepEqual(ranked.slice(2, 4).map((entity) => entity.id), [
    heroes[2].id,
    heroes[3].id
  ]);
});

test('Epic 3 least-played fallback is used when fresh heroes are insufficient', () => {
  const simpleScheme = bundle.runtime.indexes.allSchemes.find((entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount);
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
  const state = makeTargetedState({
    schemeName: simpleScheme.name,
    mastermindName: simpleMastermind.name,
    heroUsageOverride(usage, heroes) {
      heroes.forEach((hero, index) => {
        if (index >= 2) {
          usage[hero.id] = {
            plays: index < 8 ? 1 : 2,
            lastPlayedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}T12:00:00.000Z`
          };
        }
      });
    }
  });

  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, advancedSolo: false, random: () => 0 });
  assert.equal(setup.scheme.name, simpleScheme.name);
  assert.equal(setup.mastermind.name, simpleMastermind.name);
  assert.equal(setup.heroes.length, 5);
  assert.equal(setup.notices.some((notice) => notice.includes('Hero selection')), true);
});

test('Epic 3 Generate/Regenerate remain ephemeral and do not mutate persisted state inputs', () => {
  const state = makeTargetedState();
  const before = JSON.parse(JSON.stringify(state));

  generateSetup({ runtime: bundle.runtime, state, playerCount: 1, advancedSolo: false, random: () => 0 });
  generateSetup({ runtime: bundle.runtime, state, playerCount: 1, advancedSolo: false, random: () => 0.75 });

  assert.deepEqual(state, before);
});

test('Epic 3 generated setups expose history-ready ID-only snapshots that still resolve through runtime indexes', () => {
  const setup = generateSetup({ runtime: bundle.runtime, state: createAllOwnedState(), playerCount: 3, advancedSolo: false, random: () => 0 });

  assert.equal(typeof setup.setupSnapshot.mastermindId, 'string');
  assert.equal(typeof setup.setupSnapshot.schemeId, 'string');
  assert.ok(setup.setupSnapshot.heroIds.every((id) => typeof id === 'string'));
  assert.ok(setup.setupSnapshot.villainGroupIds.every((id) => typeof id === 'string'));
  assert.ok(setup.setupSnapshot.henchmanGroupIds.every((id) => typeof id === 'string'));

  assert.ok(bundle.runtime.indexes.mastermindsById[setup.setupSnapshot.mastermindId]);
  assert.ok(bundle.runtime.indexes.schemesById[setup.setupSnapshot.schemeId]);
  assert.ok(bundle.runtime.indexes.heroesById[setup.setupSnapshot.heroIds[0]]);
});

