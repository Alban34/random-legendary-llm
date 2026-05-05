import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BACKUP_SCHEMA_ID,
  BACKUP_SCHEMA_VERSION,
  buildBackupFilename,
  createBackupPayload,
  mergeImportedState,
  parseBackupPayload,
  parseBackupText,
  summarizeBackupState
} from './backup-utils.ts';
import { createEpic1Bundle } from './game-data-pipeline.ts';
import { acceptGameSetup, createDefaultState, updateGameResult } from './state-store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function createSampleSetup(offset = 0) {
  const runtime = bundle.runtime.indexes;
  return {
    id: `epic13-game-${offset}`,
    createdAt: `2026-04-10T12:00:0${offset}.000Z`,
    playerCount: offset % 2 === 0 ? 1 : 2,
    advancedSolo: false,
    playMode: offset % 2 === 0 ? 'standard' : 'two-handed-solo',
    setupSnapshot: {
      mastermindId: runtime.allMasterminds[offset].id,
      schemeId: runtime.allSchemes[offset].id,
      heroIds: runtime.allHeroes.slice(offset, offset + 3).map((entity) => entity.id),
      villainGroupIds: [runtime.allVillainGroups[offset].id],
      henchmanGroupIds: [runtime.allHenchmanGroups[offset].id]
    }
  };
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Creates a versioned portable backup payload with metadata and a useful filename', () => {

  let state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  state.preferences.themeId = 'light';
  state = acceptGameSetup(state, createSampleSetup(0));

  const payload = createBackupPayload(state, { exportedAt: '2026-04-10T12:45:30.000Z' });
  assert.equal(payload.schemaId, BACKUP_SCHEMA_ID);
  assert.equal(payload.version, BACKUP_SCHEMA_VERSION);
  assert.equal(payload.metadata.storageKey, 'legendary_state_v1');
  assert.equal(payload.data.collection.ownedSetIds[0], 'core-set');
  assert.equal(payload.data.history.length, 1);
  assert.equal(payload.data.preferences.themeId, 'light');
  assert.match(buildBackupFilename(payload.exportedAt), /^legendary-marvel-randomizer-backup-2026-04-10T12-45-30-000Z\.json$/);
});

test('Parses valid current and legacy-compatible backup payloads and summarizes them safely', () => {

  let state = createDefaultState();
  state.collection.ownedSetIds = ['core-set', 'dark-city'];
  state.preferences.themeId = 'light';
  state = acceptGameSetup(state, createSampleSetup(0));
  state = updateGameResult(state, {
    recordId: state.history[0].id,
    outcome: 'win',
    score: 55,
    notes: 'Portable record.',
    updatedAt: '2026-04-10T13:00:00.000Z'
  });
  const payload = createBackupPayload(state, { exportedAt: '2026-04-10T13:30:00.000Z' });

  const parsed = parseBackupPayload(payload, { indexes: bundle.runtime.indexes });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.importedState.history[0].result.outcome, 'win');

  const legacyPayload = createBackupPayload(state, { exportedAt: '2026-04-10T13:35:00.000Z' });
  delete legacyPayload.data.preferences.themeId;
  delete legacyPayload.data.history[0].playMode;
  delete legacyPayload.data.history[0].result;
  const parsedLegacy = parseBackupPayload(legacyPayload, { indexes: bundle.runtime.indexes });
  assert.equal(parsedLegacy.ok, true);
  assert.equal(parsedLegacy.importedState.preferences.themeId, 'dark');
  assert.equal(parsedLegacy.importedState.history[0].result.status, 'pending');

  assert.deepEqual(summarizeBackupState(parsed.importedState), {
    ownedSetCount: 2,
    historyCount: 1,
    usageCounts: {
      heroes: 3,
      masterminds: 1,
      villainGroups: 1,
      henchmanGroups: 1,
      schemes: 1
    },
    themeId: 'light',
    selectedTab: null,
    playMode: 'standard'
  });
});

test('Rejects malformed or unsupported backup payloads before mutating app state', () => {

  const malformed = parseBackupText('{ definitely not json', { indexes: bundle.runtime.indexes });
  assert.equal(malformed.ok, false);
  assert.match(malformed.error, /valid JSON/i);

  const unsupportedSchema = parseBackupPayload({
    schemaId: 'wrong-schema',
    version: 1,
    data: {}
  }, { indexes: bundle.runtime.indexes });
  assert.equal(unsupportedSchema.ok, false);
  assert.match(unsupportedSchema.error, /unsupported schema identifier/i);

  const partialPayload = parseBackupPayload({
    schemaId: BACKUP_SCHEMA_ID,
    version: BACKUP_SCHEMA_VERSION,
    exportedAt: '2026-04-10T14:00:00.000Z',
    data: {
      collection: { ownedSetIds: [] },
      history: [],
      preferences: {}
    }
  }, { indexes: bundle.runtime.indexes });
  assert.equal(partialPayload.ok, false);
  assert.match(partialPayload.error, /missing usage data/i);
});

test('Merge semantics union collection, dedupe history, keep stronger usage stats, and apply imported preferences', () => {

  let currentState = createDefaultState();
  currentState.collection.ownedSetIds = ['core-set'];
  currentState.preferences.themeId = 'dark';
  currentState = acceptGameSetup(currentState, createSampleSetup(0));

  const importedState = structuredClone(currentState);
  importedState.collection.ownedSetIds = ['core-set', 'dark-city'];
  importedState.preferences.themeId = 'light';
  importedState.preferences.selectedTab = 'history';
  importedState.usage.heroes[currentState.history[0].setupSnapshot.heroIds[0]].plays = 4;
  importedState.usage.heroes[currentState.history[0].setupSnapshot.heroIds[0]].lastPlayedAt = '2026-04-11T09:00:00.000Z';
  importedState.history.push({
    ...createSampleSetup(1),
    result: {
      status: 'completed',
      outcome: 'loss',
      score: null,
      notes: 'Imported second record.',
      updatedAt: '2026-04-10T14:15:00.000Z'
    }
  });

  const mergedState = mergeImportedState(currentState, importedState);
  assert.deepEqual(mergedState.collection.ownedSetIds, ['core-set', 'dark-city']);
  assert.equal(mergedState.history.length, 2);
  assert.equal(mergedState.preferences.themeId, 'light');
  assert.equal(mergedState.usage.heroes[currentState.history[0].setupSnapshot.heroIds[0]].plays, 4);
  assert.equal(mergedState.usage.heroes[currentState.history[0].setupSnapshot.heroIds[0]].lastPlayedAt, '2026-04-11T09:00:00.000Z');
});

test('Rejects payloads failing each envelope validation check independently', () => {

  const nonObject = parseBackupPayload(null, { indexes: bundle.runtime.indexes });
  assert.equal(nonObject.ok, false);
  assert.match(nonObject.error, /JSON object/i);

  const wrongVersion = parseBackupPayload({
    schemaId: BACKUP_SCHEMA_ID,
    version: 999,
    data: {}
  }, { indexes: bundle.runtime.indexes });
  assert.equal(wrongVersion.ok, false);
  assert.match(wrongVersion.error, /unsupported schema version/i);

  const nonObjectData = parseBackupPayload({
    schemaId: BACKUP_SCHEMA_ID,
    version: BACKUP_SCHEMA_VERSION,
    data: 'not-an-object'
  }, { indexes: bundle.runtime.indexes });
  assert.equal(nonObjectData.ok, false);
  assert.match(nonObjectData.error, /missing its data section/i);

  const nonObjectCollection = parseBackupPayload({
    schemaId: BACKUP_SCHEMA_ID,
    version: BACKUP_SCHEMA_VERSION,
    data: { collection: 'not-an-object', usage: {}, history: [], preferences: {} }
  }, { indexes: bundle.runtime.indexes });
  assert.equal(nonObjectCollection.ok, false);
  assert.match(nonObjectCollection.error, /missing collection data/i);

  const nonArrayHistory = parseBackupPayload({
    schemaId: BACKUP_SCHEMA_ID,
    version: BACKUP_SCHEMA_VERSION,
    data: { collection: {}, usage: {}, history: 'not-an-array', preferences: {} }
  }, { indexes: bundle.runtime.indexes });
  assert.equal(nonArrayHistory.ok, false);
  assert.match(nonArrayHistory.error, /missing history data/i);

  const nonObjectPreferences = parseBackupPayload({
    schemaId: BACKUP_SCHEMA_ID,
    version: BACKUP_SCHEMA_VERSION,
    data: { collection: {}, usage: {}, history: [], preferences: 'not-an-object' }
  }, { indexes: bundle.runtime.indexes });
  assert.equal(nonObjectPreferences.ok, false);
  assert.match(nonObjectPreferences.error, /missing preference data/i);
});

test('buildBackupFilename falls back to a timestamp when given a non-string exportedAt', () => {

  const filename = buildBackupFilename(null as unknown as string);
  assert.match(filename, /^legendary-marvel-randomizer-backup-\d{4}-/);
});

test('mergeUsageBucket handles new entries, null lastPlayedAt on either side, and current-wins ordering', () => {

  const currentState = createDefaultState();
  currentState.usage.heroes['hero-a'] = { plays: 3, lastPlayedAt: '2026-04-10T12:00:00.000Z' };
  currentState.usage.heroes['hero-b'] = { plays: 1, lastPlayedAt: null };
  currentState.usage.heroes['hero-c'] = { plays: 2, lastPlayedAt: '2026-04-10T12:00:00.000Z' };

  const importedState = createDefaultState();
  importedState.usage.heroes['hero-a'] = { plays: 2, lastPlayedAt: '2026-04-09T10:00:00.000Z' };
  importedState.usage.heroes['hero-b'] = { plays: 1, lastPlayedAt: '2026-04-10T13:00:00.000Z' };
  importedState.usage.heroes['hero-c'] = { plays: 5, lastPlayedAt: null };
  importedState.usage.heroes['hero-d'] = { plays: 4, lastPlayedAt: '2026-04-10T08:00:00.000Z' };

  const merged = mergeImportedState(currentState, importedState);

  assert.equal(merged.usage.heroes['hero-a'].lastPlayedAt, '2026-04-10T12:00:00.000Z');
  assert.equal(merged.usage.heroes['hero-a'].plays, 3);
  assert.equal(merged.usage.heroes['hero-b'].lastPlayedAt, '2026-04-10T13:00:00.000Z');
  assert.equal(merged.usage.heroes['hero-c'].lastPlayedAt, '2026-04-10T12:00:00.000Z');
  assert.equal(merged.usage.heroes['hero-c'].plays, 5);
  assert.equal(merged.usage.heroes['hero-d'].plays, 4);
});