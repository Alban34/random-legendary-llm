import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import {
  buildFullResetPreview,
  buildHistoryGroups,
  DEFAULT_HISTORY_GROUPING_MODE,
  filterHistoryByOutcome,
  formatHistorySummary,
  HISTORY_GROUPING_MODES,
  normalizeHistoryGroupingMode,
  summarizeUsageIndicators
} from './history-utils.ts';
import { acceptGameSetup, createDefaultState, resetAllState, resetUsageCategory } from './state-store.ts';
import { createAllOwnedState, createMemoryStorage, createSampleSnapshot } from './test-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Usage indicators reflect persisted usage statistics and never-played totals', () => {

  let state = createAllOwnedState(bundle);
  state = acceptGameSetup(state, {
    id: 'epic8-usage',
    createdAt: '2026-04-10T12:00:00.000Z',
    playerCount: 2,
    advancedSolo: false,
    setupSnapshot: createSampleSnapshot(bundle, 0)
  });

  const indicators = summarizeUsageIndicators(bundle.runtime, state);
  const heroIndicator = indicators.find((indicator) => indicator.category === 'heroes');
  const mastermindIndicator = indicators.find((indicator) => indicator.category === 'masterminds');

  assert.equal(heroIndicator.used, 3);
  assert.equal(heroIndicator.neverPlayed, heroIndicator.total - 3);
  assert.equal(mastermindIndicator.used, 1);
  assert.equal(mastermindIndicator.label, 'common.masterminds');
});

test('History summaries resolve IDs back to readable newest-first metadata', () => {

  let state = createAllOwnedState(bundle);
  state = acceptGameSetup(state, {
    id: 'older-game',
    createdAt: '2026-04-09T12:00:00.000Z',
    playerCount: 1,
    advancedSolo: true,
    setupSnapshot: createSampleSnapshot(bundle, 0)
  });
  state = acceptGameSetup(state, {
    id: 'newer-game',
    createdAt: '2026-04-10T12:00:00.000Z',
    playerCount: 3,
    advancedSolo: false,
    setupSnapshot: createSampleSnapshot(bundle, 1)
  });

  assert.equal(state.history[0].id, 'newer-game');
  const summary = formatHistorySummary(state.history[0], bundle.runtime.indexes);
  assert.equal(summary.playerLabel, '3 Players');
  assert.equal(summary.modeLabel, 'Standard');
  assert.equal(typeof summary.mastermindName, 'string');
  assert.equal(summary.heroNames.length, 3);
  assert.equal(summary.villainGroupNames.length, 1);
});

test('Category resets and full reset preview/behavior stay scoped correctly', () => {

  let state = createAllOwnedState(bundle);
  state = acceptGameSetup(state, {
    id: 'reset-game',
    createdAt: '2026-04-10T12:00:00.000Z',
    playerCount: 2,
    advancedSolo: false,
    setupSnapshot: createSampleSnapshot(bundle, 0)
  });

  const heroesReset = resetUsageCategory(state, 'heroes');
  assert.deepEqual(heroesReset.usage.heroes, {});
  assert.notDeepEqual(heroesReset.usage.masterminds, {});

  const preview = buildFullResetPreview();
  assert.deepEqual(preview, {
    collection: { ownedSetIds: [], activeSetIds: null },
    usage: {
      heroes: {},
      masterminds: {},
      villainGroups: {},
      henchmanGroups: {},
      schemes: {}
    },
    history: [],
    preferences: {
      lastPlayerCount: 1,
      lastAdvancedSolo: false,
      lastPlayMode: 'standard',
      selectedTab: null,
      onboardingCompleted: false,
      themeId: 'dark',
      localeId: 'en-US'
    }
  });

  const storageAdapter = createMemoryStorage();
  const fullReset = resetAllState({ storageAdapter });
  assert.deepEqual(fullReset.state, createDefaultState());
});

// ── From epic20-history-grouping ──────────────────────────────────────────────

function createHistoryRecord({
  id,
  createdAt,
  mastermindId,
  playerCount = 1,
  playMode = 'standard',
  result = { status: 'pending', outcome: null, score: null, notes: '', updatedAt: null }
}) {
  return {
    id,
    createdAt,
    playerCount,
    advancedSolo: playMode === 'advanced-solo',
    playMode,
    setupSnapshot: {
      mastermindId,
      schemeId: 'core-set-secret-invasion-of-the-skrull-shapeshifters',
      heroIds: ['core-set-black-widow', 'core-set-cyclops', 'core-set-deadpool'],
      villainGroupIds: ['core-set-brotherhood'],
      henchmanGroupIds: ['core-set-hand-ninjas']
    },
    result
  };
}

test('Defaults to mastermind grouping and sorts groups alphabetically by label', () => {

  const records = [
    createHistoryRecord({ id: 'one', createdAt: '2026-04-10T10:00:00.000Z', mastermindId: 'core-set-red-skull' }),
    createHistoryRecord({ id: 'two', createdAt: '2026-04-10T12:00:00.000Z', mastermindId: 'core-set-magneto' }),
    createHistoryRecord({ id: 'three', createdAt: '2026-04-10T11:00:00.000Z', mastermindId: 'core-set-red-skull' })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: DEFAULT_HISTORY_GROUPING_MODE });
  assert.equal(groups.length, 2);
  assert.equal(groups[0].label, 'Magneto');
  assert.deepEqual(groups[1].records.map((record) => record.id), ['three', 'one']);
});

test('Supports play-mode grouping without mutating history summaries', () => {

  const records = [
    createHistoryRecord({ id: 'solo-standard', createdAt: '2026-04-10T09:00:00.000Z', mastermindId: 'core-set-red-skull', playerCount: 1, playMode: 'standard' }),
    createHistoryRecord({ id: 'solo-two-handed', createdAt: '2026-04-10T10:00:00.000Z', mastermindId: 'core-set-magneto', playerCount: 1, playMode: 'two-handed-solo' }),
    createHistoryRecord({ id: 'multi', createdAt: '2026-04-10T11:00:00.000Z', mastermindId: 'core-set-red-skull', playerCount: 3, playMode: 'standard' })
  ];

  const byMode = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'play-mode' });
  assert.deepEqual(byMode.map((group) => group.label), ['Standard', 'Two-Handed Solo']);

  const summary = formatHistorySummary(records[1], bundle.runtime.indexes);
  assert.equal(summary.modeLabel, 'Two-Handed Solo');
});

test('Keeps duplicate mastermind groups distinguishable', () => {

  const indexes = {
    ...bundle.runtime.indexes,
    mastermindsById: {
      alpha: { id: 'alpha', name: 'Loki', setId: 'core-set' },
      beta: { id: 'beta', name: 'Loki', setId: 'dark-city' }
    },
    setsById: {
      ...bundle.runtime.indexes.setsById,
      'core-set': { id: 'core-set', name: 'Core Set' },
      'dark-city': { id: 'dark-city', name: 'Dark City' }
    },
    schemesById: {
      'core-set-secret-invasion-of-the-skrull-shapeshifters': bundle.runtime.indexes.schemesById['core-set-secret-invasion-of-the-skrull-shapeshifters']
    },
    heroesById: {
      'core-set-black-widow': bundle.runtime.indexes.heroesById['core-set-black-widow'],
      'core-set-cyclops': bundle.runtime.indexes.heroesById['core-set-cyclops'],
      'core-set-deadpool': bundle.runtime.indexes.heroesById['core-set-deadpool']
    },
    villainGroupsById: {
      'core-set-brotherhood': bundle.runtime.indexes.villainGroupsById['core-set-brotherhood']
    },
    henchmanGroupsById: {
      'core-set-hand-ninjas': bundle.runtime.indexes.henchmanGroupsById['core-set-hand-ninjas']
    }
  };

  const records = [
    createHistoryRecord({ id: 'loki-one', createdAt: '2026-04-10T09:00:00.000Z', mastermindId: 'alpha' }),
    createHistoryRecord({ id: 'loki-two', createdAt: '2026-04-10T10:00:00.000Z', mastermindId: 'beta' })
  ];

  const grouped = buildHistoryGroups(records, indexes, { mode: 'mastermind' });
  assert.match(grouped[0].label, /^Loki \u00b7 /);
  assert.match(grouped[1].label, /^Loki \u00b7 /);
});

// ── From epic34-history-grouping ──────────────────────────────────────────────

function createHistoryRecord34({
  id,
  createdAt,
  mastermindId = 'core-set-red-skull',
  schemeId = 'core-set-secret-invasion-of-the-skrull-shapeshifters',
  heroIds = ['core-set-black-widow', 'core-set-cyclops', 'core-set-deadpool'],
  villainGroupIds = ['core-set-brotherhood'],
  henchmanGroupIds = ['core-set-hand-ninjas'],
  playerCount = 2,
  playMode = 'standard',
  result = { status: 'pending', outcome: null, score: null, notes: '', updatedAt: null }
}) {
  return {
    id,
    createdAt,
    playerCount,
    advancedSolo: playMode === 'advanced-solo',
    playMode,
    setupSnapshot: {
      mastermindId,
      schemeId,
      heroIds,
      villainGroupIds,
      henchmanGroupIds
    },
    result
  };
}

test('HISTORY_GROUPING_MODES contains exactly six modes: mastermind, scheme, heroes, villains, play-mode, epic-mastermind', () => {

  const ids = HISTORY_GROUPING_MODES.map((m) => m.id);
  assert.deepEqual(ids, ['mastermind', 'scheme', 'heroes', 'villains', 'play-mode', 'epic-mastermind']);
});

test('DEFAULT_HISTORY_GROUPING_MODE is mastermind', () => {

  assert.equal(DEFAULT_HISTORY_GROUPING_MODE, 'mastermind');
});

test('normalizeHistoryGroupingMode falls back to mastermind for removed modes player-count and none', () => {

  assert.equal(normalizeHistoryGroupingMode('player-count'), 'mastermind');
  assert.equal(normalizeHistoryGroupingMode('none'), 'mastermind');
});

test('normalizeHistoryGroupingMode accepts all five valid modes without fallback', () => {

  for (const mode of ['mastermind', 'scheme', 'heroes', 'villains', 'play-mode']) {
    assert.equal(normalizeHistoryGroupingMode(mode), mode);
  }
});

test('Scheme grouping produces one group per distinct schemeId with correct key format', () => {

  const schemeIds = Object.keys(bundle.runtime.indexes.schemesById);
  const schemeA = schemeIds[0];
  const schemeB = schemeIds[1];

  const records = [
    createHistoryRecord34({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', schemeId: schemeA }),
    createHistoryRecord34({ id: 'r2', createdAt: '2026-04-10T11:00:00.000Z', schemeId: schemeA }),
    createHistoryRecord34({ id: 'r3', createdAt: '2026-04-10T12:00:00.000Z', schemeId: schemeB })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'scheme' });
  assert.equal(groups.length, 2);

  const groupA = groups.find((g) => g.id === `scheme:${schemeA}`);
  const groupB = groups.find((g) => g.id === `scheme:${schemeB}`);
  assert.ok(groupA, 'group for schemeA must exist');
  assert.ok(groupB, 'group for schemeB must exist');
  assert.equal(groupA.count, 2);
  assert.equal(groupB.count, 1);
  assert.equal(groupA.label, bundle.runtime.indexes.schemesById[schemeA].name);
});

test('Heroes grouping places a record with 3 heroes into exactly 3 groups', () => {

  const heroIds = ['core-set-black-widow', 'core-set-cyclops', 'core-set-deadpool'];
  const records = [
    createHistoryRecord34({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', heroIds })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'heroes' });
  assert.equal(groups.length, 3);

  for (const group of groups) {
    assert.ok(group.id.startsWith('hero:'), `group id "${group.id}" must start with "hero:"`);
    assert.equal(group.count, 1);
    assert.equal(group.records[0].id, 'r1');
  }
  const ids = new Set(groups.map((g) => g.id));
  assert.ok(ids.has('hero:core-set-black-widow'));
  assert.ok(ids.has('hero:core-set-cyclops'));
  assert.ok(ids.has('hero:core-set-deadpool'));
});

test('Heroes grouping accumulates all records that share a hero into the same group', () => {

  const records = [
    createHistoryRecord34({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', heroIds: ['core-set-black-widow', 'core-set-cyclops', 'core-set-deadpool'] }),
    createHistoryRecord34({ id: 'r2', createdAt: '2026-04-10T11:00:00.000Z', heroIds: ['core-set-black-widow', 'core-set-cyclops'] })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'heroes' });
  assert.equal(groups.length, 3);

  const blackWidow = groups.find((g) => g.id === 'hero:core-set-black-widow');
  const deadpool = groups.find((g) => g.id === 'hero:core-set-deadpool');
  assert.equal(blackWidow.count, 2);
  assert.deepEqual(blackWidow.records.map((r) => r.id).sort((a, b) => a.localeCompare(b)), ['r1', 'r2']);
  assert.equal(deadpool.count, 1);
  assert.equal(deadpool.records[0].id, 'r1');
});

test('Villains grouping places a record with 2 villain groups into exactly 2 groups', () => {

  const allVillainIds = Object.keys(bundle.runtime.indexes.villainGroupsById);
  assert.ok(allVillainIds.length >= 2, 'seed data must have at least 2 villain groups');
  const villainGroupIds = allVillainIds.slice(0, 2);

  const records = [
    createHistoryRecord34({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', villainGroupIds })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'villains' });
  assert.equal(groups.length, 2);

  for (const group of groups) {
    assert.ok(group.id.startsWith('villain:'), `group id "${group.id}" must start with "villain:"`);
    assert.equal(group.count, 1);
    assert.equal(group.records[0].id, 'r1');
  }
  assert.ok(groups.find((g) => g.id === `villain:${villainGroupIds[0]}`));
  assert.ok(groups.find((g) => g.id === `villain:${villainGroupIds[1]}`));
});

test('Villains grouping accumulates all records that share a villain group', () => {

  const allVillainIds = Object.keys(bundle.runtime.indexes.villainGroupsById);
  const v1 = allVillainIds[0];
  const v2 = allVillainIds[1];

  const records = [
    createHistoryRecord34({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', villainGroupIds: [v1, v2] }),
    createHistoryRecord34({ id: 'r2', createdAt: '2026-04-10T11:00:00.000Z', villainGroupIds: [v1] })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'villains' });
  assert.equal(groups.length, 2);

  const groupV1 = groups.find((g) => g.id === `villain:${v1}`);
  const groupV2 = groups.find((g) => g.id === `villain:${v2}`);
  assert.equal(groupV1.count, 2);
  assert.equal(groupV2.count, 1);
});

test('buildHistoryGroups returns groups sorted alphabetically by label for mastermind mode', () => {

  const allMastermindIds = Object.keys(bundle.runtime.indexes.mastermindsById);
  const picked = [];
  for (const id of allMastermindIds) {
    if (picked.length === 3) break;
    picked.push(id);
  }
  assert.ok(picked.length === 3, 'seed data must contain at least 3 masterminds');

  const nameOf = (id) => bundle.runtime.indexes.mastermindsById[id].name;

  const alphabeticalIds = [...picked].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));

  const records = [
    createHistoryRecord34({ id: 'r1', createdAt: '2026-04-10T12:00:00.000Z', mastermindId: alphabeticalIds[2] }),
    createHistoryRecord34({ id: 'r2', createdAt: '2026-04-10T11:00:00.000Z', mastermindId: alphabeticalIds[1] }),
    createHistoryRecord34({ id: 'r3', createdAt: '2026-04-10T10:00:00.000Z', mastermindId: alphabeticalIds[0] })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'mastermind' });
  assert.equal(groups.length, 3);

  const returnedLabels = groups.map((g) => g.label);
  const expectedLabels = alphabeticalIds.map(nameOf);
  assert.deepEqual(returnedLabels, expectedLabels, 'groups must be in alphabetical label order, not newest-first');
});

// ── From epic43-expansion-attribution ────────────────────────────────────────

function createSampleSetup43(offset = 0) {
  const runtime = bundle.runtime.indexes;
  return {
    id: `epic43-game-${offset}`,
    createdAt: `2026-04-10T12:00:0${offset}.000Z`,
    playerCount: offset % 2 === 0 ? 1 : 2,
    advancedSolo: false,
    setupSnapshot: {
      mastermindId: runtime.allMasterminds[offset].id,
      schemeId: runtime.allSchemes[offset].id,
      heroIds: runtime.allHeroes.slice(offset, offset + 3).map((e) => e.id),
      villainGroupIds: [runtime.allVillainGroups[offset].id],
      henchmanGroupIds: [runtime.allHenchmanGroups[offset].id]
    }
  };
}

test('mastermindSetName is a non-empty string equal to the set name from the index', () => {
  const indexes = bundle.runtime.indexes;
  const record = createSampleSetup43(0);
  const summary = formatHistorySummary(record, indexes);
  const mastermind = indexes.mastermindsById[record.setupSnapshot.mastermindId];
  const expectedSetName = indexes.setsById[mastermind.setId].name;

  assert.ok(typeof summary.mastermindSetName === 'string' && summary.mastermindSetName.length > 0,
    'mastermindSetName should be a non-empty string');
  assert.equal(summary.mastermindSetName, expectedSetName,
    'mastermindSetName should equal the set name from the index');
});

test('schemeSetName is a non-empty string equal to the set name from the index', () => {
  const indexes = bundle.runtime.indexes;
  const record = createSampleSetup43(0);
  const summary = formatHistorySummary(record, indexes);
  const scheme = indexes.schemesById[record.setupSnapshot.schemeId];
  const expectedSetName = indexes.setsById[scheme.setId].name;

  assert.ok(typeof summary.schemeSetName === 'string' && summary.schemeSetName.length > 0,
    'schemeSetName should be a non-empty string');
  assert.equal(summary.schemeSetName, expectedSetName,
    'schemeSetName should equal the set name from the index');
});

test('heroSetNames is an array with same length as heroNames and every entry is a non-empty valid string', () => {
  const indexes = bundle.runtime.indexes;
  const record = createSampleSetup43(0);
  const summary = formatHistorySummary(record, indexes);

  assert.ok(Array.isArray(summary.heroSetNames), 'heroSetNames should be an array');
  assert.equal(summary.heroSetNames.length, summary.heroNames.length,
    'heroSetNames length should match heroNames length');
  for (const name of summary.heroSetNames) {
    assert.ok(typeof name === 'string' && name.length > 0, `heroSetName entry should be a non-empty string, got: ${name}`);
    assert.notEqual(name, 'unknown', 'heroSetName entry should not be "unknown"');
    assert.notEqual(name, undefined, 'heroSetName entry should not be undefined');
    assert.notEqual(name, null, 'heroSetName entry should not be null');
  }
});

test('villainGroupSetNames is an array with same length as villainGroupNames and every entry is valid', () => {
  const indexes = bundle.runtime.indexes;
  const record = createSampleSetup43(0);
  const summary = formatHistorySummary(record, indexes);

  assert.ok(Array.isArray(summary.villainGroupSetNames), 'villainGroupSetNames should be an array');
  assert.equal(summary.villainGroupSetNames.length, summary.villainGroupNames.length,
    'villainGroupSetNames length should match villainGroupNames length');
  for (const name of summary.villainGroupSetNames) {
    assert.ok(typeof name === 'string' && name.length > 0, `villainGroupSetName entry should be a non-empty string, got: ${name}`);
    assert.notEqual(name, 'unknown', 'villainGroupSetName entry should not be "unknown"');
    assert.notEqual(name, undefined, 'villainGroupSetName entry should not be undefined');
    assert.notEqual(name, null, 'villainGroupSetName entry should not be null');
  }
});

test('henchmanGroupSetNames is an array with same length as henchmanGroupNames and every entry is valid', () => {
  const indexes = bundle.runtime.indexes;
  const record = createSampleSetup43(0);
  const summary = formatHistorySummary(record, indexes);

  assert.ok(Array.isArray(summary.henchmanGroupSetNames), 'henchmanGroupSetNames should be an array');
  assert.equal(summary.henchmanGroupSetNames.length, summary.henchmanGroupNames.length,
    'henchmanGroupSetNames length should match henchmanGroupNames length');
  for (const name of summary.henchmanGroupSetNames) {
    assert.ok(typeof name === 'string' && name.length > 0, `henchmanGroupSetName entry should be a non-empty string, got: ${name}`);
    assert.notEqual(name, 'unknown', 'henchmanGroupSetName entry should not be "unknown"');
    assert.notEqual(name, undefined, 'henchmanGroupSetName entry should not be undefined');
    assert.notEqual(name, null, 'henchmanGroupSetName entry should not be null');
  }
});

test('All five expansion name fields are populated and correct across multiple sample setups', () => {

  const indexes = bundle.runtime.indexes;

  for (const offset of [0, 1, 2]) {
    const record = createSampleSetup43(offset);
    const summary = formatHistorySummary(record, indexes);

    const mastermind = indexes.mastermindsById[record.setupSnapshot.mastermindId];
    const scheme = indexes.schemesById[record.setupSnapshot.schemeId];

    assert.equal(summary.mastermindSetName, indexes.setsById[mastermind.setId].name,
      `offset ${offset}: mastermindSetName mismatch`);
    assert.equal(summary.schemeSetName, indexes.setsById[scheme.setId].name,
      `offset ${offset}: schemeSetName mismatch`);

    assert.equal(summary.heroSetNames.length, record.setupSnapshot.heroIds.length,
      `offset ${offset}: heroSetNames length mismatch`);
    for (let i = 0; i < record.setupSnapshot.heroIds.length; i++) {
      const hero = indexes.heroesById[record.setupSnapshot.heroIds[i]];
      assert.equal(summary.heroSetNames[i], indexes.setsById[hero.setId].name,
        `offset ${offset}: heroSetNames[${i}] mismatch`);
    }

    assert.equal(summary.villainGroupSetNames.length, record.setupSnapshot.villainGroupIds.length,
      `offset ${offset}: villainGroupSetNames length mismatch`);
    for (let i = 0; i < record.setupSnapshot.villainGroupIds.length; i++) {
      const vg = indexes.villainGroupsById[record.setupSnapshot.villainGroupIds[i]];
      assert.equal(summary.villainGroupSetNames[i], indexes.setsById[vg.setId].name,
        `offset ${offset}: villainGroupSetNames[${i}] mismatch`);
    }

    assert.equal(summary.henchmanGroupSetNames.length, record.setupSnapshot.henchmanGroupIds.length,
      `offset ${offset}: henchmanGroupSetNames length mismatch`);
    for (let i = 0; i < record.setupSnapshot.henchmanGroupIds.length; i++) {
      const hg = indexes.henchmanGroupsById[record.setupSnapshot.henchmanGroupIds[i]];
      assert.equal(summary.henchmanGroupSetNames[i], indexes.setsById[hg.setId].name,
        `offset ${offset}: henchmanGroupSetNames[${i}] mismatch`);
    }
  }
});

// ── From epic47-history-outcome-filter ───────────────────────────────────────

const winRecord = {
  id: 'r-win',
  result: { status: 'completed', outcome: 'win', score: null, notes: '', updatedAt: '2025-01-01T00:01:00.000Z' }
};

const lossRecord = {
  id: 'r-loss',
  result: { status: 'completed', outcome: 'loss', score: null, notes: '', updatedAt: '2025-01-02T00:01:00.000Z' }
};

const pendingRecord = {
  id: 'r-pending',
  result: { status: 'pending' }
};

const nullResultRecord = {
  id: 'r-null',
  result: null
};

const allOutcomeRecords = [winRecord, lossRecord, pendingRecord, nullResultRecord];

test('filterHistoryByOutcome "all" returns all records unchanged', () => {

  const result = filterHistoryByOutcome(allOutcomeRecords, 'all');
  assert.equal(result.length, allOutcomeRecords.length);
  assert.equal(result, allOutcomeRecords, 'should return the same array reference');
});

test('filterHistoryByOutcome "win" returns only won records', () => {

  const result = filterHistoryByOutcome(allOutcomeRecords, 'win');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'r-win');
  assert.ok(result.every((r) => r.result?.outcome === 'win'));
});

test('filterHistoryByOutcome "loss" returns only lost records', () => {

  const result = filterHistoryByOutcome(allOutcomeRecords, 'loss');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'r-loss');
  assert.ok(result.every((r) => r.result?.outcome === 'loss'));
});

test('filterHistoryByOutcome "pending" returns records with status pending or null result', () => {

  const result = filterHistoryByOutcome(allOutcomeRecords, 'pending');
  assert.equal(result.length, 2);
  const ids = new Set(result.map((r) => r.id));
  assert.ok(ids.has('r-pending'));
  assert.ok(ids.has('r-null'));
});

test('filterHistoryByOutcome does not mutate the input array', () => {

  const input = [...allOutcomeRecords];
  filterHistoryByOutcome(input, 'win');
  filterHistoryByOutcome(input, 'loss');
  filterHistoryByOutcome(input, 'pending');
  assert.equal(input.length, allOutcomeRecords.length);
});

test('filterHistoryByOutcome empty array always returns []', () => {

  assert.deepEqual(filterHistoryByOutcome([], 'all'), []);
  assert.deepEqual(filterHistoryByOutcome([], 'win'), []);
  assert.deepEqual(filterHistoryByOutcome([], 'loss'), []);
  assert.deepEqual(filterHistoryByOutcome([], 'pending'), []);
});

// ── From epic71-epic-mastermind (history-utils parts) ────────────────────────

test('normalizeHistoryGroupingMode returns epic-mastermind for epic-mastermind', () => {
  assert.equal(normalizeHistoryGroupingMode('epic-mastermind'), 'epic-mastermind');
});

// ── Branch coverage: set name fallbacks (lines 116, 119, 122, 125, 127) ──────

test('formatHistorySummary falls back to setId as set name when setsById entry is missing', () => {
  const customIndexes = {
    ...bundle.runtime.indexes,
    mastermindsById: { 'x-mm': { id: 'x-mm', name: 'Kang', setId: 'orphan-set' } },
    schemesById: { 'x-scheme': { id: 'x-scheme', name: 'Subjugation', setId: 'orphan-set' } },
    heroesById: { 'x-hero': { id: 'x-hero', name: 'Thor', setId: 'orphan-set' } },
    villainGroupsById: { 'x-vg': { id: 'x-vg', name: 'Wrecking Crew', setId: 'orphan-set' } },
    henchmanGroupsById: { 'x-hg': { id: 'x-hg', name: 'Doombot Legion', setId: 'orphan-set' } },
    setsById: {}
  };

  const record = {
    id: 'orphan-set-test',
    createdAt: '2026-04-10T12:00:00.000Z',
    playerCount: 1,
    advancedSolo: false,
    playMode: 'standard',
    setupSnapshot: {
      mastermindId: 'x-mm',
      schemeId: 'x-scheme',
      heroIds: ['x-hero'],
      villainGroupIds: ['x-vg'],
      henchmanGroupIds: ['x-hg']
    },
    result: { status: 'pending', outcome: null, score: null, notes: '', updatedAt: null }
  };

  const summary = formatHistorySummary(record, customIndexes);
  assert.equal(summary.mastermindSetName, 'orphan-set', 'mastermindSetName falls back to setId');
  assert.equal(summary.schemeSetName, 'orphan-set', 'schemeSetName falls back to setId');
  assert.equal(summary.heroSetNames[0], 'orphan-set', 'heroSetNames falls back to setId');
  assert.equal(summary.villainGroupSetNames[0], 'orphan-set', 'villainGroupSetNames falls back to setId');
  assert.equal(summary.henchmanGroupSetNames[0], 'orphan-set', 'henchmanGroupSetNames falls back to setId');
});

// ── Branch coverage: epic-mastermind grouping mode (lines 225, 226) ───────────

test('buildHistoryGroups with epic-mastermind mode creates separate groups for epic and non-epic records', () => {
  const records = [
    { ...createHistoryRecord34({ id: 'epic-r', createdAt: '2026-04-10T10:00:00.000Z' }), epicMastermind: true },
    { ...createHistoryRecord34({ id: 'std-r', createdAt: '2026-04-10T11:00:00.000Z' }), epicMastermind: false }
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'epic-mastermind' });
  assert.equal(groups.length, 2);

  const epicGroup = groups.find((g) => g.id === 'epic-mastermind:epic');
  const standardGroup = groups.find((g) => g.id === 'epic-mastermind:standard');
  assert.ok(epicGroup, 'epic group must exist');
  assert.ok(standardGroup, 'standard group must exist');
  assert.equal(epicGroup.count, 1);
  assert.equal(standardGroup.count, 1);
  assert.equal(epicGroup.records[0].id, 'epic-r');
  assert.equal(standardGroup.records[0].id, 'std-r');
});

// ── Branch coverage: filterHistoryByOutcome unknown filter (line 244) ─────────

test('filterHistoryByOutcome returns all records unchanged for an unrecognized filter string', () => {
  const result = filterHistoryByOutcome(allOutcomeRecords, 'not-a-known-filter');
  assert.equal(result, allOutcomeRecords);
});

