import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { formatHistorySummary } from '../src/app/history-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function createSampleSetup(offset = 0) {
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

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('mastermindSetName is a non-empty string equal to the set name from the index', () => {
  const indexes = bundle.runtime.indexes;
  const record = createSampleSetup(0);
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
  const record = createSampleSetup(0);
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
  const record = createSampleSetup(0);
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
  const record = createSampleSetup(0);
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
  const record = createSampleSetup(0);
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

test('all five expansion name fields are populated and correct across multiple sample setups', () => {
  const indexes = bundle.runtime.indexes;

  for (const offset of [0, 1, 2]) {
    const record = createSampleSetup(offset);
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
