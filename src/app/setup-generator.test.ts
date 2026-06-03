import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import { acceptGameSetup, createDefaultState } from './state-store.ts';
import {
  applySchemeModifiersToTemplate,
  buildHistoryReadySetupSnapshot,
  generateSetup
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

function markAllMastermindsExceptLead(state, bundle, leadMastermind) {
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
}

function findSimpleSchemeAndMastermind(bundle) {
  const simpleScheme = bundle.runtime.indexes.allSchemes.find(
    (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
  );
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
  return { simpleScheme, simpleMastermind };
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Applies scheme constraints, forced groups, and modifiers to generated setups', () => {

  const state = makeTargetedState({ schemeName: 'Secret Invasion of the Skrull Shapeshifters' });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, advancedSolo: false, random: () => 0 });

  assert.equal(setup.scheme.name, 'Secret Invasion of the Skrull Shapeshifters');
  assert.equal(setup.requirements.heroCount, 7);
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

// Regression for Epic 100 — Hank Pym, Yellowjacket had an erroneous
// leadName: 'Black Order Guards' in the data that forced this villain group
// into every setup. The fix removes the leadName/leadCategory fields so the
// mastermind has no forced lead, confirmed by: no 'Black Order Guards' entry
// with forced===true, and villainGroups.length matching requirements exactly.
test('Hank Pym, Yellowjacket does not force Black Order Guards as a villain group', () => {

  const hankPymState = makeTargetedState({ mastermindName: 'Hank Pym, Yellowjacket' });
  const hankPymSetup = generateSetup({ runtime: bundle.runtime, state: hankPymState, playerCount: 2, advancedSolo: false, random: () => 0 });
  assert.equal(hankPymSetup.mastermind.name, 'Hank Pym, Yellowjacket');
  assert.ok(!hankPymSetup.villainGroups.some((group) => group.forced === true && group.name === 'Black Order Guards'));
  assert.equal(hankPymSetup.villainGroups.length, hankPymSetup.requirements.villainGroupCount);
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
  const before = structuredClone(state);

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
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
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
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
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
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
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
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
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
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: advanced-solo sets leadEntity to null', () => {
  const state = createAllOwnedState();
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'advanced-solo', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: two-handed-solo sets leadEntity to null', () => {
  const state = createAllOwnedState();
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'two-handed-solo', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: standard-solo-v2 sets leadEntity to null', () => {
  const state = createAllOwnedState();
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard-solo-v2', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2 regression: non-solo (playerCount=2) leadEntity is non-null', () => {
  const state = createAllOwnedState();
  markAllMastermindsExceptLead(state, bundle, leadMastermind);
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, playMode: 'standard', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.notEqual(setup.mastermind.leadEntity, null);
});

// ── From epic74-forced-hero-team (setup-generator/buildOwnedPools parts) ─────

test('When forcedTeam is set and team has enough heroes, setup includes only heroes from that team', () => {

  const state = createAllOwnedState();
  const { simpleScheme, simpleMastermind } = findSimpleSchemeAndMastermind(bundle);

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
  const heroDesc = setup.heroes.map((h) => `${h.name}[${h.teams.join(',')}]`).join(', ');
  assert.ok(
    setup.heroes.every((hero) => hero.teams.includes('X-Men')),
    `Expected all heroes to be X-Men, got: ${heroDesc}`
  );
});

test('When forcedTeam pool is smaller than heroCount, fills remaining from general pool', () => {

  const state = createAllOwnedState();
  const { simpleScheme, simpleMastermind } = findSimpleSchemeAndMastermind(bundle);

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
  const { simpleScheme, simpleMastermind } = findSimpleSchemeAndMastermind(bundle);

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
  const { simpleScheme, simpleMastermind } = findSimpleSchemeAndMastermind(bundle);

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
  const { simpleScheme, simpleMastermind } = findSimpleSchemeAndMastermind(bundle);

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

// ── From epic97-test-coverage-uplift (setup-generator uncovered branches) ────

// Helper: build a minimal mock runtime whose only scheme requires more heroes
// than the pool contains (via set-min-heroes modifier) so that every scheme
// iteration fails canSatisfyHeroRequirements. The pool still satisfies the
// base validateBaseCounts check for 2-player standard (heroes >= 5,
// villainGroups >= 2, henchmanGroups >= 1).
function createMinimalOverflowRuntime() {
  const SET_ID = 'ep97-overflow-set';
  const heroes = [
    { id: 'ep97-h1', name: 'Alpha', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-h2', name: 'Beta', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-h3', name: 'Gamma', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-h4', name: 'Delta', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-h5', name: 'Epsilon', setId: SET_ID, aliases: [], teams: [], cardCount: 14 }
  ];
  const masterminds = [
    { id: 'ep97-mm1', name: 'Simple Villain', setId: SET_ID, aliases: [], lead: null, notes: [], isEpicMastermind: false }
  ];
  const villainGroups = [
    { id: 'ep97-vg1', name: 'Bad Guys 1', setId: SET_ID, aliases: [], cardCount: 10 },
    { id: 'ep97-vg2', name: 'Bad Guys 2', setId: SET_ID, aliases: [], cardCount: 10 }
  ];
  const henchmanGroups = [
    { id: 'ep97-hg1', name: 'Minions', setId: SET_ID, aliases: [], cardCount: 10 }
  ];
  // set-min-heroes: 7 forces heroCount to 7; pool only has 5 heroes, so
  // canSatisfyHeroRequirements always returns false for every scheme iteration.
  const schemes = [
    {
      id: 'ep97-sc1',
      name: 'Impossible Hero Scheme',
      setId: SET_ID,
      aliases: [],
      constraints: { minimumPlayerCount: null },
      forcedGroups: [],
      modifiers: [{ type: 'set-min-heroes', value: 7 }],
      notes: []
    }
  ];
  const set = { id: SET_ID, name: 'Minimal Overflow Set', heroes, masterminds, villainGroups, henchmanGroups, schemes };
  return {
    sets: [set],
    indexes: {
      villainGroupsById: Object.fromEntries(villainGroups.map((vg) => [vg.id, vg])),
      henchmanGroupsById: Object.fromEntries(henchmanGroups.map((hg) => [hg.id, hg]))
    },
    SET_ID
  };
}

// Helper: build a minimal mock runtime where the scheme uses a
// require-hero-name-match-count modifier. Pool has 6 heroes (4 non-Thor + 2
// named "Thor …") and heroCount stays at the template value (5). This allows
// canSatisfyHeroRequirements to pass while forcing 4 non-Thor heroes via
// forcedPicks leaves only 1 remaining slot — not enough for the 2 required
// Thor-matching heroes — so selectHeroes returns a reason.
function createHeroNameRuntime() {
  const SET_ID = 'ep97-heroname-set';
  const heroes = [
    { id: 'ep97-hn-h1', name: 'Alpha', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-hn-h2', name: 'Beta', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-hn-h3', name: 'Gamma', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-hn-h4', name: 'Delta', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-hn-thor1', name: 'Thor One', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep97-hn-thor2', name: 'Thor Two', setId: SET_ID, aliases: [], teams: [], cardCount: 14 }
  ];
  const masterminds = [
    { id: 'ep97-hn-mm1', name: 'Simple Villain', setId: SET_ID, aliases: [], lead: null, notes: [], isEpicMastermind: false }
  ];
  const villainGroups = [
    { id: 'ep97-hn-vg1', name: 'Bad Guys 1', setId: SET_ID, aliases: [], cardCount: 10 },
    { id: 'ep97-hn-vg2', name: 'Bad Guys 2', setId: SET_ID, aliases: [], cardCount: 10 }
  ];
  const henchmanGroups = [
    { id: 'ep97-hn-hg1', name: 'Minions', setId: SET_ID, aliases: [], cardCount: 10 }
  ];
  // require-hero-name-match-count: need 2 heroes matching /Thor/; no heroCount modifier
  // so effective heroCount = template value (5 for 2-player standard).
  const schemes = [
    {
      id: 'ep97-hn-sc1',
      name: 'Thor Name Scheme',
      setId: SET_ID,
      aliases: [],
      constraints: { minimumPlayerCount: null },
      forcedGroups: [],
      modifiers: [{ type: 'require-hero-name-match-count', pattern: 'Thor', value: 2 }],
      notes: []
    }
  ];
  const set = { id: SET_ID, name: 'Hero Name Test Set', heroes, masterminds, villainGroups, henchmanGroups, schemes };
  return {
    sets: [set],
    indexes: {
      villainGroupsById: Object.fromEntries(villainGroups.map((vg) => [vg.id, vg])),
      henchmanGroupsById: Object.fromEntries(henchmanGroups.map((hg) => [hg.id, hg]))
    },
    SET_ID
  };
}

test('Throws terminal error when all scheme iterations fail with no constraint picks active', () => {
  // Covers the terminal throw at the bottom of generateSetup.
  // Scheme requires 7 heroes (set-min-heroes: 7) but pool only has 5.
  // validateBaseCounts passes (5 >= template heroCount of 5 for 2-player standard).
  // canSatisfyHeroRequirements returns false for every scheme iteration.
  // hasConstraintSelections is false (no forced picks) so no constraintFailureReasons
  // are collected, bypassing the constraint-failure throw and reaching the terminal throw.
  const { sets, indexes, SET_ID } = createMinimalOverflowRuntime();
  const runtime = { sets, indexes };
  const state = createDefaultState();
  state.collection.ownedSetIds = [SET_ID];

  assert.throws(
    () => generateSetup({ runtime, state, playerCount: 2, random: () => 0 }),
    /No legal setup could be generated from the current owned collection for the selected play mode\./
  );
});

test('Throws with forced-hero failure reason when heroIds are forced but scheme demands more heroes than the pool can supply', () => {
  // Covers trySchemeForSetup branch: hasConstraintSelections && normalizedForcedPicks.heroIds.length.
  // Scheme requires 7 heroes; pool has 5; validateBaseCounts still passes.
  // canSatisfyHeroRequirements fails, but now hasConstraintSelections=true and heroIds.length>0,
  // so the specific forced-hero reason is added to constraintFailureReasons.
  // The hasConstraintSelections && constraintFailureReasons.size throw fires with that reason.
  const { sets, indexes, SET_ID } = createMinimalOverflowRuntime();
  const runtime = { sets, indexes };
  const state = createDefaultState();
  state.collection.ownedSetIds = [SET_ID];

  assert.throws(
    () => generateSetup({
      runtime,
      state,
      playerCount: 2,
      forcedPicks: { heroIds: ['ep97-h1'] },
      random: () => 0
    }),
    /Forced Hero selections cannot satisfy the Hero requirements created by the current scheme and play mode\./
  );
});

test('Collects hero selection failure reason when forced picks leave insufficient slots for scheme hero-name requirements', () => {
  // Covers tryMastermindForScheme branch: heroSelection.reason is set.
  // canSatisfyHeroRequirements PASSES (6 heroes satisfy the pool check: 2 Thors >= 2,
  // 4 non-Thors >= 3, 6 >= 5). buildCategorySelection succeeds.
  // Forcing 4 non-Thor heroes leaves only 1 remaining slot, but 2 Thor-matching
  // heroes are required, so selectHeroes returns a failure reason.
  // That reason is collected into constraintFailureReasons, and the
  // hasConstraintSelections && constraintFailureReasons.size throw fires.
  const { sets, indexes, SET_ID } = createHeroNameRuntime();
  const runtime = { sets, indexes };
  const state = createDefaultState();
  state.collection.ownedSetIds = [SET_ID];

  assert.throws(
    () => generateSetup({
      runtime,
      state,
      playerCount: 2,
      forcedPicks: { heroIds: ['ep97-hn-h1', 'ep97-hn-h2', 'ep97-hn-h3', 'ep97-hn-h4'] },
      random: () => 0
    }),
    /Forced Hero selections leave no legal way to satisfy this scheme/
  );
});

// ── From epic107-mastermind-lead-corrections (setup-generator parts) ──────────

// Helper: build a minimal mock runtime that has Sinister Six 2099 (with
// leadCandidates) but whose villain pool contains only unrelated groups.
// This forces availableCandidates to be empty so tryMastermindForScheme
// returns null and generateSetup reaches the terminal throw.
function createSinister6_2099NoLeadCandidateRuntime() {
  const SET_ID = 'ep107-s62099-set';
  const heroes = [
    { id: 'ep107-h1', name: 'Hero One', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep107-h2', name: 'Hero Two', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep107-h3', name: 'Hero Three', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep107-h4', name: 'Hero Four', setId: SET_ID, aliases: [], teams: [], cardCount: 14 },
    { id: 'ep107-h5', name: 'Hero Five', setId: SET_ID, aliases: [], teams: [], cardCount: 14 }
  ];
  const masterminds = [
    {
      id: 'ep107-mm1',
      name: 'Sinister Six 2099',
      setId: SET_ID,
      aliases: [],
      lead: null,
      leadCandidates: [
        { id: 'ep107-vg-alch', category: 'villains' },
        { id: 'ep107-vg-sin', category: 'villains' }
      ],
      notes: [],
      isEpicMastermind: false
    }
  ];
  // Villain pool IDs deliberately do NOT match any leadCandidate id.
  const villainGroups = [
    { id: 'ep107-vg1', name: 'Unrelated Group 1', setId: SET_ID, aliases: [], cardCount: 10 },
    { id: 'ep107-vg2', name: 'Unrelated Group 2', setId: SET_ID, aliases: [], cardCount: 10 }
  ];
  const henchmanGroups = [
    { id: 'ep107-hg1', name: 'Minions', setId: SET_ID, aliases: [], cardCount: 10 }
  ];
  const schemes = [
    {
      id: 'ep107-sc1',
      name: 'Simple 107 Scheme',
      setId: SET_ID,
      aliases: [],
      constraints: { minimumPlayerCount: null },
      forcedGroups: [],
      modifiers: [],
      notes: []
    }
  ];
  const set = { id: SET_ID, name: 'Sinister 2099 No-Lead Test Set', heroes, masterminds, villainGroups, henchmanGroups, schemes };
  return {
    sets: [set],
    indexes: {
      villainGroupsById: Object.fromEntries(villainGroups.map((vg) => [vg.id, vg])),
      henchmanGroupsById: Object.fromEntries(henchmanGroups.map((hg) => [hg.id, hg]))
    },
    SET_ID
  };
}

test('107.2f — generator with Sinister Six 2099 produces a setup whose villain groups contain "Alchemax" or "Sinister"', () => {
  const state = makeTargetedState({ mastermindName: 'Sinister Six 2099' });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, random: () => 0 });
  assert.equal(setup.mastermind.name, 'Sinister Six 2099');
  assert.ok(
    setup.villainGroups.some((vg) => /alchemax|sinister/i.test(vg.name)),
    `Expected a villain group containing "Alchemax" or "Sinister", got: ${setup.villainGroups.map((vg) => vg.name).join(', ')}`
  );
});

test('107.2g — generator with Sinister Six 2099 and no matching villain groups in owned pool throws (no valid lead candidate)', () => {
  // Covers the availableCandidates.length === 0 branch in tryMastermindForScheme.
  // The only mastermind in the pool (Sinister Six 2099) has leadCandidates whose
  // IDs are absent from the villain pool, so every scheme iteration returns null
  // and generateSetup reaches the terminal throw.
  const { sets, indexes, SET_ID } = createSinister6_2099NoLeadCandidateRuntime();
  const runtime = { sets, indexes };
  const state = createDefaultState();
  state.collection.ownedSetIds = [SET_ID];
  assert.throws(
    () => generateSetup({ runtime, state, playerCount: 2, random: () => 0 }),
    /No legal setup could be generated from the current owned collection for the selected play mode\./
  );
});
