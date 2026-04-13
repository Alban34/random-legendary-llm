import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { buildHistoryGroups, DEFAULT_HISTORY_GROUPING_MODE, formatHistorySummary } from '../src/app/history-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

function createRecord({
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

test('Epic 20 defaults to mastermind grouping and preserves newest-first group ordering', () => {
  const records = [
    createRecord({ id: 'one', createdAt: '2026-04-10T10:00:00.000Z', mastermindId: 'core-set-red-skull' }),
    createRecord({ id: 'two', createdAt: '2026-04-10T12:00:00.000Z', mastermindId: 'core-set-magneto' }),
    createRecord({ id: 'three', createdAt: '2026-04-10T11:00:00.000Z', mastermindId: 'core-set-red-skull' })
  ];

  const groups = buildHistoryGroups(records, bundle.runtime.indexes, { mode: DEFAULT_HISTORY_GROUPING_MODE });
  assert.equal(groups.length, 2);
  assert.equal(groups[0].label, 'Magneto');
  assert.deepEqual(groups[1].records.map((record) => record.id), ['three', 'one']);
});

test('Epic 20 supports play-mode grouping without mutating history summaries', () => {
  const records = [
    createRecord({ id: 'solo-standard', createdAt: '2026-04-10T09:00:00.000Z', mastermindId: 'core-set-red-skull', playerCount: 1, playMode: 'standard' }),
    createRecord({ id: 'solo-two-handed', createdAt: '2026-04-10T10:00:00.000Z', mastermindId: 'core-set-magneto', playerCount: 1, playMode: 'two-handed-solo' }),
    createRecord({ id: 'multi', createdAt: '2026-04-10T11:00:00.000Z', mastermindId: 'core-set-red-skull', playerCount: 3, playMode: 'standard' })
  ];

  const byMode = buildHistoryGroups(records, bundle.runtime.indexes, { mode: 'play-mode' });
  assert.deepEqual(byMode.map((group) => group.label), ['Standard', 'Two-Handed Solo']);

  const summary = formatHistorySummary(records[1], bundle.runtime.indexes);
  assert.equal(summary.modeLabel, 'Two-Handed Solo');
});

test('Epic 20 keeps duplicate mastermind groups distinguishable', () => {
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
    createRecord({ id: 'loki-one', createdAt: '2026-04-10T09:00:00.000Z', mastermindId: 'alpha' }),
    createRecord({ id: 'loki-two', createdAt: '2026-04-10T10:00:00.000Z', mastermindId: 'beta' })
  ];

  const grouped = buildHistoryGroups(records, indexes, { mode: 'mastermind' });
  assert.match(grouped[0].label, /^Loki · /);
  assert.match(grouped[1].label, /^Loki · /);
});