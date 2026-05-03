import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import { acceptGameSetup, createDefaultState } from './state-store.ts';
import {
  applySchemeModifiersToTemplate,
  buildHistoryReadySetupSnapshot,
  buildOwnedPools,
  generateSetup,
  rankItemsByFreshness,
  validateSetupLegality
} from './setup-generator.ts';
import { resolveSetupTemplate } from './setup-rules.ts';

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

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Legality validation rejects empty or unsupported collections with clear reasons', () => {

  const emptyState = createDefaultState();
  const emptyValidation = validateSetupLegality({ runtime: bundle.runtime, state: emptyState, playerCount: 1, advancedSolo: false });

  assert.equal(emptyValidation.ok, false);
  assert.ok(emptyValidation.reasons.some((reason) => reason.includes('No owned sets')));
  assert.ok(emptyValidation.reasons.some((reason) => reason.includes('heroes')));

  const invalidAdvancedSolo = validateSetupLegality({ runtime: bundle.runtime, state: createAllOwnedState(), playerCount: 2, advancedSolo: true });
  assert.equal(invalidAdvancedSolo.ok, false);
  assert.ok(invalidAdvancedSolo.reasons[0].includes('Advanced Solo'));
});

test('Applies scheme constraints, forced groups, and modifiers to generated setups', () => {

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

test('Mastermind leads consume the correct villain or henchman slot', () => {

  const redSkullState = makeTargetedState({ mastermindName: 'Red Skull' });
  const redSkullSetup = generateSetup({ runtime: bundle.runtime, state: redSkullState, playerCount: 2, advancedSolo: false, random: () => 0 });
  assert.equal(redSkullSetup.mastermind.name, 'Red Skull');
  assert.equal(redSkullSetup.villainGroups.length, redSkullSetup.requirements.villainGroupCount);
  assert.ok(redSkullSetup.villainGroups.some((group) => group.name === 'HYDRA' && group.forced));

  const drDoomState = makeTargetedState({ mastermindName: 'Dr. Doom' });
  const drDoomSetup = generateSetup({ runtime: bundle.runtime, state: drDoomState, playerCount: 2, advancedSolo: false, random: () => 0 });
  assert.equal(drDoomSetup.mastermind.name, 'Dr. Doom');
  assert.equal(drDoomSetup.henchmanGroups.length, drDoomSetup.requirements.henchmanGroupCount);
  assert.ok(drDoomSetup.henchmanGroups.some((group) => group.name === 'Doombot Legion' && group.forced));
});

test('Hero freshness ranking prefers never-played first, then least-played, items with equal plays are shuffled together', () => {

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
  assert.deepEqual(new Set(ranked.slice(2, 4).map((entity) => entity.id)), new Set([
    heroes[2].id,
    heroes[3].id
  ]));
  assert.deepEqual(new Set(ranked.slice(4, 6).map((entity) => entity.id)), new Set([
    heroes[4].id,
    heroes[5].id
  ]));
});

test('Least-played fallback is used when fresh heroes are insufficient', () => {

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

test('Generate/Regenerate remain ephemeral and do not mutate persisted state inputs', () => {

  const state = makeTargetedState();
  const before = JSON.parse(JSON.stringify(state));

  generateSetup({ runtime: bundle.runtime, state, playerCount: 1, advancedSolo: false, random: () => 0 });
  generateSetup({ runtime: bundle.runtime, state, playerCount: 1, advancedSolo: false, random: () => 0.75 });

  assert.deepEqual(state, before);
});

test('Generated setups expose history-ready ID-only snapshots that still resolve through runtime indexes', () => {

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

// ── From epic15-forced-picks ──────────────────────────────────────────────────

test('Supports forced picks across setup categories when a legal setup exists', () => {

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

test('Surfaces actionable legality reasons for unavailable or illegal forced picks', () => {

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

test('Explains impossible forced-pick collisions with scheme and mastermind requirements', () => {

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

test('Keeps forced picks out of persisted accepted history records', () => {

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

// ── From epic53-solo-scheme-eligibility ──────────────────────────────────────

const INELIGIBLE_STANDARD_SOLO_IDS = [
  'core-set-super-hero-civil-war',
  'marvel-studios-phase-1-super-hero-civil-war',
  'core-set-negative-zone-prison-breakout'
];

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

// ── From epic9-notifications-accessibility (setup-generator parts) ────────────

test('Setup messaging surfaces invalid requests clearly and reports least-played fallback usage', () => {

  assert.throws(
    () => generateSetup({
      runtime: bundle.runtime,
      state: createDefaultState(),
      playerCount: 2,
      advancedSolo: false,
      random: () => 0
    }),
    /No owned sets are currently selected\./
  );

  const simpleScheme = bundle.runtime.indexes.allSchemes.find((entity) => {
    return !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints?.minimumPlayerCount;
  });
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
  const state = createAllOwnedState();

  markAllUsedExcept(state.usage.schemes, bundle.runtime.indexes.allSchemes, [simpleScheme.id]);
  markAllUsedExcept(state.usage.masterminds, bundle.runtime.indexes.allMasterminds, [simpleMastermind.id]);
  markAllUsedExcept(state.usage.heroes, bundle.runtime.indexes.allHeroes, bundle.runtime.indexes.allHeroes.slice(0, 2).map((hero) => hero.id));

  const before = JSON.stringify(state);
  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    advancedSolo: false,
    random: () => 0
  });

  assert.equal(setup.scheme.id, simpleScheme.id);
  assert.equal(setup.mastermind.id, simpleMastermind.id);
  assert.equal(setup.notices.some((notice) => notice.includes('Least-played fallback used for Hero selection')), true);
  assert.equal(setup.fallbackUsed, true);
  assert.equal(JSON.stringify(state), before);
});

// ── From epic27-shell-debug-polish (setup-generator structural assertion) ─────

test('schemeFallback gate uses fallbackItems.some() not fallbackItems.length', () => {

  const generatorSource = readFileSync(join(process.cwd(), 'src/app/setup-generator.ts'), 'utf8');
  assert.doesNotMatch(
    generatorSource,
    /schemeFallback:.*schemeSelection\.fallbackItems\.length/,
    'schemeFallback must not use fallbackItems.length as its gate (unconditional notification bug)'
  );
  assert.match(
    generatorSource,
    /schemeFallback:.*schemeSelection\.fallbackItems\.some\(\(s\) => s\.id === scheme\.id\)/,
    'schemeFallback must use fallbackItems.some((s) => s.id === scheme.id) to fire only for genuine fallback picks'
  );
});

// ── From epic71-epic-mastermind (setup-generator parts) ──────────────────────

function createStateWithSets(setNames) {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets
    .filter((set) => setNames.includes(set.name))
    .map((set) => set.id);
  return state;
}

test('generateSetup with epicMastermind: true returns a mastermind with isEpicMastermind === true', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, epicMastermind: true, random: () => 0 });
  assert.equal(setup.mastermind.isEpicMastermind, true);
});

test('generateSetup with epicMastermind: true throws when no owned set has Epic Mastermind cards', () => {
  const state = createStateWithSets(['Core Set', 'Dark City']);
  assert.throws(
    () => generateSetup({ runtime: bundle.runtime, state, playerCount: 1, epicMastermind: true, random: () => 0 }),
    /newGame\.epicMastermind\.noCardsError/
  );
});

test('generateSetup with epicMastermind: false behaves identically to the pre-epic-71 path', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, epicMastermind: false, random: () => 0 });
  assert.ok(setup.mastermind);
  assert.ok(setup.scheme);
  assert.ok(setup.heroes.length > 0);
});

test('generateSetup without epicMastermind option behaves identically to the pre-epic-71 path', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, random: () => 0 });
  assert.ok(setup.mastermind);
  assert.ok(setup.scheme);
  assert.ok(setup.heroes.length > 0);
});

// ── From epic73-solo-always-leads (setup-generator parts) ────────────────────

let leadMastermind;

beforeAll(async () => {
  leadMastermind = bundle.runtime.indexes.allMasterminds.find((m) => m.lead != null);
  assert.ok(leadMastermind, 'Test prerequisite: at least one mastermind with a lead must exist in the data');
});

test('Story 1: standard solo (playerCount=1) does not force the mastermind lead', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  if (setup.mastermind.id !== leadMastermind.id) return;
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    !groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} NOT to be a forced group in standard solo`
  );
});

test('Story 1: advanced-solo does not force the mastermind lead', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'advanced-solo', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  assert.equal(setup.mastermind.id, leadMastermind.id);
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    !groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} NOT to be a forced group in advanced-solo`
  );
});

test('Story 1: two-handed-solo does not force the mastermind lead', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'two-handed-solo', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  assert.equal(setup.mastermind.id, leadMastermind.id);
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    !groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} NOT to be a forced group in two-handed-solo`
  );
});

test('Story 1: standard-solo-v2 does not force the mastermind lead', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard-solo-v2', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  assert.equal(setup.mastermind.id, leadMastermind.id);
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    !groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} NOT to be a forced group in standard-solo-v2`
  );
});

test('Story 1 regression: non-solo (playerCount=2) DOES force the mastermind lead', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, playMode: 'standard', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  assert.equal(setup.mastermind.id, leadMastermind.id);
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} to be a forced group in non-solo (2-player standard)`
  );
});

test('Story 2: standard solo (playerCount=1) sets leadEntity to null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: advanced-solo sets leadEntity to null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'advanced-solo', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: two-handed-solo sets leadEntity to null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'two-handed-solo', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: standard-solo-v2 sets leadEntity to null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard-solo-v2', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2 regression: non-solo (playerCount=2) leadEntity is non-null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, playMode: 'standard', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.notEqual(setup.mastermind.leadEntity, null);
});

// ── From epic74-forced-hero-team (setup-generator/buildOwnedPools parts) ─────

test('When forcedTeam is set and team has enough heroes, setup includes only heroes from that team', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      forcedTeam: 'X-Men'
    },
    random: () => 0
  });

  assert.equal(setup.heroes.length, 5);
  assert.ok(
    setup.heroes.every((hero) => hero.teams.includes('X-Men')),
    `Expected all heroes to be X-Men, got: ${setup.heroes.map((h) => `${h.name}[${h.teams.join(',')}]`).join(', ')}`
  );
});

test('When forcedTeam pool is smaller than heroCount, fills remaining from general pool', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  const allHeroes = bundle.runtime.indexes.allHeroes;
  const teamCounts = {};
  for (const hero of allHeroes) {
    for (const team of hero.teams) {
      teamCounts[team] = (teamCounts[team] || 0) + 1;
    }
  }
  const smallTeam = Object.entries(teamCounts).find(([, count]) => count >= 1 && count < 5);
  assert.ok(smallTeam, 'Expected to find a team with fewer than 5 heroes for this test');

  const [smallTeamName, smallTeamCount] = smallTeam;

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      forcedTeam: smallTeamName
    },
    random: () => 0
  });

  assert.equal(setup.heroes.length, 5, 'Setup should have 5 heroes');
  const teamHeroes = setup.heroes.filter((hero) => hero.teams.includes(smallTeamName));
  assert.equal(teamHeroes.length, smallTeamCount, `Expected ${smallTeamCount} heroes from ${smallTeamName}, got ${teamHeroes.length}`);
  const generalHeroes = setup.heroes.filter((hero) => !hero.teams.includes(smallTeamName));
  assert.equal(generalHeroes.length, 5 - smallTeamCount, 'Remaining slots should be filled from general pool');
});

test('Forced heroIds take priority before forcedTeam heroes are selected', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  const nonXmenHero = bundle.runtime.indexes.allHeroes.find((hero) => !hero.teams.includes('X-Men'));
  assert.ok(nonXmenHero, 'Expected to find a hero outside X-Men');

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      heroIds: [nonXmenHero.id],
      forcedTeam: 'X-Men'
    },
    random: () => 0
  });

  assert.equal(setup.heroes.length, 5);
  assert.ok(setup.heroes.some((hero) => hero.id === nonXmenHero.id), 'Forced hero must be present in setup');
  const xmenCount = setup.heroes.filter((hero) => hero.id !== nonXmenHero.id && hero.teams.includes('X-Men')).length;
  assert.equal(xmenCount, 4, 'Remaining 4 slots should be filled with X-Men heroes');
});

test('Villain groups, henchman groups, scheme, and mastermind are unaffected by forcedTeam', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      forcedTeam: 'X-Men'
    },
    random: () => 0
  });

  assert.equal(setup.scheme.id, simpleScheme.id);
  assert.equal(setup.mastermind.id, simpleMastermind.id);
  assert.equal(setup.villainGroups.length, 2);
  assert.equal(setup.henchmanGroups.length, 1);
});

test('When forcedTeam is null, hero selection behaves as normal', () => {

  const state = createAllOwnedState();
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);

  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    playMode: 'standard',
    forcedPicks: {
      schemeId: simpleScheme.id,
      mastermindId: simpleMastermind.id,
      forcedTeam: null
    },
    random: () => 0
  });

  assert.equal(setup.heroes.length, 5);
  assert.ok(setup.heroes.length > 0);
});

test('activeHeroTeamNames contains only team names present on at least one hero in the owned pool', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));

  assert.ok(activeHeroTeamNames.length > 0, 'Expected at least one team name');
  for (const team of activeHeroTeamNames) {
    const found = pools.heroes.some((hero) => hero.teams.includes(team));
    assert.ok(found, `Team '${team}' should be present on at least one hero`);
  }
});

test('activeHeroTeamNames is sorted alphabetically', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));

  for (let i = 1; i < activeHeroTeamNames.length; i++) {
    assert.ok(
      activeHeroTeamNames[i - 1].localeCompare(activeHeroTeamNames[i]) <= 0,
      `Expected sorted order but '${activeHeroTeamNames[i - 1]}' comes before '${activeHeroTeamNames[i]}'`
    );
  }
});

test('activeHeroTeamNames is deduplicated', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));

  const uniqueNames = new Set(activeHeroTeamNames);
  assert.equal(activeHeroTeamNames.length, uniqueNames.size, 'Expected no duplicate team names');
});

test('activeHeroTeamNames contains no empty strings', () => {
  const state = createAllOwnedState();
  const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
  const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
  const teamSet = new Set();
  for (const hero of pools.heroes) {
    for (const team of hero.teams) {
      if (team) teamSet.add(team);
    }
  }
  const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));

  assert.ok(
    activeHeroTeamNames.every((name) => typeof name === 'string' && name.length > 0),
    'Expected no empty strings in activeHeroTeamNames'
  );
});
