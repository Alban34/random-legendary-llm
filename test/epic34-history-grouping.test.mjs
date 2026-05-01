import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import {
  buildHistoryGroups,
  DEFAULT_HISTORY_GROUPING_MODE,
  HISTORY_GROUPING_MODES,
  normalizeHistoryGroupingMode
} from '../src/app/history-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

function createRecord({
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
    createRecord({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', schemeId: schemeA }),
    createRecord({ id: 'r2', createdAt: '2026-04-10T11:00:00.000Z', schemeId: schemeA }),
    createRecord({ id: 'r3', createdAt: '2026-04-10T12:00:00.000Z', schemeId: schemeB })
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
    createRecord({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', heroIds })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'heroes' });
  assert.equal(groups.length, 3);

  for (const group of groups) {
    assert.ok(group.id.startsWith('hero:'), `group id "${group.id}" must start with "hero:"`);
    assert.equal(group.count, 1);
    assert.equal(group.records[0].id, 'r1');
  }
  const ids = groups.map((g) => g.id);
  assert.ok(ids.includes('hero:core-set-black-widow'));
  assert.ok(ids.includes('hero:core-set-cyclops'));
  assert.ok(ids.includes('hero:core-set-deadpool'));
});

test('Heroes grouping accumulates all records that share a hero into the same group', () => {

  const records = [
    createRecord({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', heroIds: ['core-set-black-widow', 'core-set-cyclops', 'core-set-deadpool'] }),
    createRecord({ id: 'r2', createdAt: '2026-04-10T11:00:00.000Z', heroIds: ['core-set-black-widow', 'core-set-cyclops'] })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'heroes' });
  // 3 distinct heroes total across both records
  assert.equal(groups.length, 3);

  const blackWidow = groups.find((g) => g.id === 'hero:core-set-black-widow');
  const deadpool = groups.find((g) => g.id === 'hero:core-set-deadpool');
  assert.equal(blackWidow.count, 2);
  assert.deepEqual(blackWidow.records.map((r) => r.id).sort(), ['r1', 'r2']);
  assert.equal(deadpool.count, 1);
  assert.equal(deadpool.records[0].id, 'r1');
});

test('Villains grouping places a record with 2 villain groups into exactly 2 groups', () => {

  const allVillainIds = Object.keys(bundle.runtime.indexes.villainGroupsById);
  assert.ok(allVillainIds.length >= 2, 'seed data must have at least 2 villain groups');
  const villainGroupIds = allVillainIds.slice(0, 2);

  const records = [
    createRecord({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', villainGroupIds })
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
    createRecord({ id: 'r1', createdAt: '2026-04-10T10:00:00.000Z', villainGroupIds: [v1, v2] }),
    createRecord({ id: 'r2', createdAt: '2026-04-10T11:00:00.000Z', villainGroupIds: [v1] })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'villains' });
  assert.equal(groups.length, 2);

  const groupV1 = groups.find((g) => g.id === `villain:${v1}`);
  const groupV2 = groups.find((g) => g.id === `villain:${v2}`);
  assert.equal(groupV1.count, 2);
  assert.equal(groupV2.count, 1);
});

test('buildHistoryGroups returns groups sorted alphabetically by label for mastermind mode', () => {

  // Use three distinct masterminds whose names are intentionally out of alphabetical order
  // relative to the createdAt timestamps, to confirm alphabetical wins over newest-first.
  const allMastermindIds = Object.keys(bundle.runtime.indexes.mastermindsById);
  // Collect three masterminds with distinct names by iterating the index
  const picked = [];
  for (const id of allMastermindIds) {
    if (picked.length === 3) break;
    picked.push(id);
  }
  assert.ok(picked.length === 3, 'seed data must contain at least 3 masterminds');

  const nameOf = (id) => bundle.runtime.indexes.mastermindsById[id].name;

  // Sort picked by name to know the expected alphabetical order
  const alphabeticalIds = [...picked].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));

  // Assign createdAt in reverse-alphabetical order so newest-first would yield the wrong order
  const records = [
    createRecord({ id: 'r1', createdAt: '2026-04-10T12:00:00.000Z', mastermindId: alphabeticalIds[2] }),
    createRecord({ id: 'r2', createdAt: '2026-04-10T11:00:00.000Z', mastermindId: alphabeticalIds[1] }),
    createRecord({ id: 'r3', createdAt: '2026-04-10T10:00:00.000Z', mastermindId: alphabeticalIds[0] })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'mastermind' });
  assert.equal(groups.length, 3);

  const returnedLabels = groups.map((g) => g.label);
  const expectedLabels = alphabeticalIds.map(nameOf);
  assert.deepEqual(returnedLabels, expectedLabels, 'groups must be in alphabetical label order, not newest-first');
});
