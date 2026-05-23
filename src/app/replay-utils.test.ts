import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import { reconstructSetupFromRecord } from './replay-utils.ts';
import { createAllOwnedState, createSampleSnapshot } from './test-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

function buildSampleRecord(overrides = {}) {
  const snapshot = createSampleSnapshot(bundle, 0);
  return {
    id: 'replay-test-record',
    createdAt: '2026-05-01T10:00:00.000Z',
    playerCount: 2,
    advancedSolo: false,
    playMode: 'standard',
    setupSnapshot: snapshot,
    result: { status: 'pending', outcome: null, score: null, notes: '', updatedAt: null },
    epicMastermind: false,
    ...overrides
  };
}

test('reconstructSetupFromRecord returns a GeneratedSetup whose setupSnapshot exactly matches the input record', () => {
  const record = buildSampleRecord();
  const result = reconstructSetupFromRecord(record, bundle.runtime);

  assert.deepEqual(result.setupSnapshot, record.setupSnapshot);
});

test('reconstructSetupFromRecord returns resolved entity names as non-empty strings', () => {
  const record = buildSampleRecord();
  const result = reconstructSetupFromRecord(record, bundle.runtime);

  assert.equal(typeof result.mastermind.name, 'string');
  assert.ok(result.mastermind.name.length > 0, 'mastermind name should be non-empty');

  assert.equal(typeof result.scheme.name, 'string');
  assert.ok(result.scheme.name.length > 0, 'scheme name should be non-empty');

  assert.ok(result.heroes.length > 0, 'heroes array should be non-empty');
  result.heroes.forEach((hero) => {
    assert.equal(typeof hero.name, 'string');
    assert.ok(hero.name.length > 0, 'hero name should be non-empty');
  });
});

test('reconstructSetupFromRecord sets forcedPicks.schemeId and forcedPicks.heroIds to match the snapshot', () => {
  const record = buildSampleRecord();
  const result = reconstructSetupFromRecord(record, bundle.runtime);

  assert.equal(result.forcedPicks.schemeId, record.setupSnapshot.schemeId);
  assert.deepEqual(result.forcedPicks.heroIds, record.setupSnapshot.heroIds);
});

test('reconstructSetupFromRecord throws an Error containing the unknown ID when given a non-existent mastermindId', () => {
  const record = buildSampleRecord({
    setupSnapshot: {
      ...createSampleSnapshot(bundle, 0),
      mastermindId: 'definitely-not-a-real-mastermind-id'
    }
  });

  assert.throws(
    () => reconstructSetupFromRecord(record, bundle.runtime),
    (error) => {
      assert.ok(error instanceof Error, 'should throw an Error instance');
      assert.ok(
        error.message.includes('definitely-not-a-real-mastermind-id'),
        `error message should include the unknown ID, got: ${error.message}`
      );
      return true;
    }
  );
});
