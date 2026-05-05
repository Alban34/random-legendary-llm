import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from './game-data-pipeline.ts';
import { buildInsightsDashboard, buildOutcomeInsights, buildUsageInsights, buildExpansionUsageInsights, computeExpansionUsagePercent } from './stats-utils.ts';
import { acceptGameSetup, createDefaultState, updateGameResult } from './state-store.ts';
import type { HistoryRecord } from './types.ts';
import { createAllOwnedState, createSampleSnapshot } from './test-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function acceptLoggedGame(state, { id, createdAt, offset, outcome = null, score = null, notes = '' }) {
  let nextState = acceptGameSetup(state, {
    id,
    createdAt,
    playerCount: 2,
    advancedSolo: false,
    setupSnapshot: createSampleSnapshot(bundle, offset)
  });

  if (outcome) {
    nextState = updateGameResult(nextState, {
      recordId: id,
      outcome,
      score,
      notes,
      updatedAt: createdAt
    });
  }

  return nextState;
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Derives stable outcome and score metrics for mixed completed and pending histories', () => {

  let state = createAllOwnedState(bundle);
  state = acceptLoggedGame(state, {
    id: 'game-win-1',
    createdAt: '2026-04-10T10:00:00.000Z',
    offset: 0,
    outcome: 'win',
    score: 55
  });
  state = acceptLoggedGame(state, {
    id: 'game-loss-1',
    createdAt: '2026-04-10T11:00:00.000Z',
    offset: 1,
    outcome: 'loss',
    score: null
  });
  state = acceptLoggedGame(state, {
    id: 'game-win-2',
    createdAt: '2026-04-10T12:00:00.000Z',
    offset: 2,
    outcome: 'win',
    score: 70
  });
  state = acceptLoggedGame(state, {
    id: 'game-pending',
    createdAt: '2026-04-10T13:00:00.000Z',
    offset: 3
  });

  const outcome = buildOutcomeInsights(state.history);
  assert.deepEqual(outcome, {
    totalGames: 4,
    completedResults: 3,
    pendingResults: 1,
    wins: 2,
    losses: 1,
    scoredGames: 2,
    winRate: 66.7,
    averageScore: 62.5,
    recentAverageScore: 62.5,
    bestScore: 70
  });
});

test('Rankings stay deterministic and preserve duplicate-name context with set labels', () => {

  const state = createAllOwnedState(bundle);
  const blackWidows = bundle.runtime.indexes.allHeroes.filter((entity) => entity.name === 'Black Widow');
  assert.equal(blackWidows.length >= 2, true);

  state.usage.heroes[blackWidows[0].id] = { plays: 4, lastPlayedAt: '2026-04-10T10:00:00.000Z' };
  state.usage.heroes[blackWidows[1].id] = { plays: 4, lastPlayedAt: '2026-04-10T09:00:00.000Z' };
  state.usage.heroes[bundle.runtime.indexes.allHeroes.find((entity) => entity.name === 'Wolverine').id] = {
    plays: 1,
    lastPlayedAt: '2026-04-01T10:00:00.000Z'
  };

  const heroInsights = buildUsageInsights(bundle.runtime, state, { limit: 3 }).find((category) => category.category === 'heroes');
  assert.equal(heroInsights.mostPlayed.length, 3);
  assert.match(heroInsights.mostPlayed[0].label, /Black Widow · /);
  assert.notEqual(heroInsights.mostPlayed[0].label, heroInsights.mostPlayed[1].label);
  assert.equal(heroInsights.leastPlayed[0].plays, 1);
});

test('Dashboard exposes sparse-data helpers without producing misleading score metrics', () => {

  const dashboard = buildInsightsDashboard(bundle.runtime, createDefaultState(), { limit: 2 });
  assert.equal(dashboard.outcome.totalGames, 0);
  assert.equal(dashboard.outcome.winRate, null);
  assert.equal(dashboard.outcome.averageScore, null);
  assert.equal(dashboard.freshness.usedEntities, 0);
  assert.equal(dashboard.freshness.totalNeverPlayed, dashboard.freshness.totalEntitiesTracked);
  assert.equal(dashboard.usage.every((category) => category.mostPlayed.length === 0), true);
});

test('Dashboard reports played percentages for the owned collection, full catalog, and missing extensions', () => {

  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  state.usage.heroes['core-set-black-widow'] = { plays: 2, lastPlayedAt: '2026-04-10T10:00:00.000Z' };
  state.usage.heroes['dark-city-professor-x'] = { plays: 1, lastPlayedAt: '2026-04-10T09:00:00.000Z' };
  state.usage.masterminds['core-set-red-skull'] = { plays: 1, lastPlayedAt: '2026-04-10T10:00:00.000Z' };

  const dashboard = buildInsightsDashboard(bundle.runtime, state, { limit: 2 });
  const userHeroes = dashboard.collectionCoverage.userCollection.byType.find((entry) => entry.category === 'heroes');
  const overallHeroes = dashboard.collectionCoverage.overallCollection.byType.find((entry) => entry.category === 'heroes');

  assert.equal(userHeroes.played, 1);
  assert.equal(userHeroes.total > 1, true);
  assert.equal(userHeroes.playedPercent, Number(((1 / userHeroes.total) * 100).toFixed(1)));
  assert.equal(overallHeroes.played, 2);
  assert.equal(overallHeroes.playedPercent, Number(((2 / overallHeroes.total) * 100).toFixed(1)));

  const nonBaseSets = bundle.runtime.sets.filter((set) => set.type !== 'base');
  assert.equal(dashboard.collectionCoverage.missingExtensions.total, nonBaseSets.length);
  assert.equal(dashboard.collectionCoverage.missingExtensions.missing, nonBaseSets.length);
  assert.equal(dashboard.collectionCoverage.missingExtensions.missingPercent, 100);
});

// ── Epic 87 — computeExpansionUsagePercent unit tests ──

test('computeExpansionUsagePercent returns 60 for normal case (12/20)', () => {
  assert.equal(computeExpansionUsagePercent(12, 20), 60);
});

test('computeExpansionUsagePercent returns 0 for zero total (not NaN)', () => {
  assert.equal(computeExpansionUsagePercent(0, 0), 0);
});

test('computeExpansionUsagePercent returns 100 for full usage (5/5)', () => {
  assert.equal(computeExpansionUsagePercent(5, 5), 100);
});

test('computeExpansionUsagePercent rounds fractional results (1/3 → 33)', () => {
  assert.equal(computeExpansionUsagePercent(1, 3), 33);
});

// ── Epic 91 — buildExpansionUsageInsights unit tests ──

test('buildExpansionUsageInsights returns [] for empty history', () => {
  const result = buildExpansionUsageInsights(bundle.runtime, [], 0);
  assert.deepEqual(result, []);
});

test('buildExpansionUsageInsights returns entries at 100% for a single record', () => {
  const fakeRecord = {
    setupSnapshot: {
      mastermindId: bundle.runtime.indexes.allMasterminds[0].id,
      schemeId: bundle.runtime.indexes.allSchemes[0].id,
      heroIds: [bundle.runtime.indexes.allHeroes[0].id],
      villainGroupIds: [bundle.runtime.indexes.allVillainGroups[0].id],
      henchmanGroupIds: [bundle.runtime.indexes.allHenchmanGroups[0].id]
    }
  } as unknown as HistoryRecord;
  const result = buildExpansionUsageInsights(bundle.runtime, [fakeRecord], 1);
  assert.ok(result.length > 0, 'should have at least one expansion entry');
  result.forEach(entry => assert.equal(entry.percent, 100));
});

test('buildExpansionUsageInsights counts shared set as 100% and unique set as 50% across two records', () => {
  const mastermind = bundle.runtime.indexes.allMasterminds[0];
  const hero = bundle.runtime.indexes.allHeroes.find((h) => h.setId !== mastermind.setId) || bundle.runtime.indexes.allHeroes[0];
  const record1 = { setupSnapshot: { mastermindId: mastermind.id, schemeId: bundle.runtime.indexes.allSchemes[0].id, heroIds: [], villainGroupIds: [], henchmanGroupIds: [] } } as unknown as HistoryRecord;
  const record2 = { setupSnapshot: { mastermindId: mastermind.id, schemeId: bundle.runtime.indexes.allSchemes[0].id, heroIds: [hero.id], villainGroupIds: [], henchmanGroupIds: [] } } as unknown as HistoryRecord;
  const result = buildExpansionUsageInsights(bundle.runtime, [record1, record2], 2);
  const mastermindSetEntry = result.find(e => e.id === mastermind.setId);
  assert.ok(mastermindSetEntry, 'mastermind set should appear');
  assert.equal(mastermindSetEntry!.games, 2);
  assert.equal(mastermindSetEntry!.percent, 100);
});

test('buildExpansionUsageInsights counts same expansion only once per game even if multiple card types belong to it', () => {
  const mastermind = bundle.runtime.indexes.allMasterminds[0];
  const heroSameSet = bundle.runtime.indexes.allHeroes.find((h) => h.setId === mastermind.setId) || bundle.runtime.indexes.allHeroes[0];
  const record = { setupSnapshot: { mastermindId: mastermind.id, schemeId: bundle.runtime.indexes.allSchemes[0].id, heroIds: [heroSameSet.id], villainGroupIds: [], henchmanGroupIds: [] } } as unknown as HistoryRecord;
  const result = buildExpansionUsageInsights(bundle.runtime, [record], 1);
  const mastermindSetEntry = result.find(e => e.id === mastermind.setId);
  assert.ok(mastermindSetEntry, 'mastermind set should appear');
  assert.equal(mastermindSetEntry!.games, 1, 'same set should only count once per game even if multiple entities belong to it');
});

// ── Branch coverage additions ─────────────────────────────────────────────────

test('buildUsageInsights handles null lastPlayedAt via empty-string fallback and uses label as tiebreaker when plays and date tie', () => {
  const heroA = bundle.runtime.indexes.allHeroes[0];
  const heroB = bundle.runtime.indexes.allHeroes[1];

  const state = createDefaultState();
  state.usage.heroes[heroA.id] = { plays: 3, lastPlayedAt: null };
  state.usage.heroes[heroB.id] = { plays: 3, lastPlayedAt: null };

  const heroInsights = buildUsageInsights(bundle.runtime, state, { limit: 2 })
    .find((c) => c.category === 'heroes');

  assert.equal(heroInsights.mostPlayed.length, 2);
  assert.equal(heroInsights.leastPlayed.length, 2);
  assert.ok(
    heroInsights.mostPlayed[0].label.localeCompare(heroInsights.mostPlayed[1].label) <= 0,
    'mostPlayed should be sorted by label when plays and lastPlayedAt tie'
  );
  assert.ok(
    heroInsights.leastPlayed[0].label.localeCompare(heroInsights.leastPlayed[1].label) <= 0,
    'leastPlayed should be sorted by label when plays and lastPlayedAt tie'
  );
});

test('buildExpansionUsageInsights returns empty array when snapshot entity IDs are not found in the runtime index', () => {
  const record = {
    setupSnapshot: {
      mastermindId: 'nonexistent-mm',
      schemeId: 'nonexistent-scheme',
      heroIds: ['nonexistent-hero'],
      villainGroupIds: ['nonexistent-vg'],
      henchmanGroupIds: ['nonexistent-hg']
    }
  } as unknown as HistoryRecord;

  const result = buildExpansionUsageInsights(bundle.runtime, [record], 1);
  assert.deepEqual(result, [], 'no set entries should appear when no entities are found in the index');
});

test('buildExpansionUsageInsights falls back to setId as name for unknown sets and breaks ties alphabetically', () => {
  const customRuntime = {
    ...bundle.runtime,
    indexes: {
      ...bundle.runtime.indexes,
      mastermindsById: {
        ...bundle.runtime.indexes.mastermindsById,
        'orphan-mm': { id: 'orphan-mm', name: 'Kang', setId: 'orphan-set' }
      }
    }
  };

  const record = {
    setupSnapshot: {
      mastermindId: 'orphan-mm',
      schemeId: bundle.runtime.indexes.allSchemes[0].id,
      heroIds: [],
      villainGroupIds: [],
      henchmanGroupIds: []
    }
  } as unknown as HistoryRecord;

  const result = buildExpansionUsageInsights(customRuntime, [record], 1);
  const orphanEntry = result.find((e) => e.id === 'orphan-set');
  assert.ok(orphanEntry, 'orphan set should appear in results');
  assert.equal(orphanEntry!.name, 'orphan-set', 'name should fall back to setId when not in setsById');
});

test('buildUsageInsights falls back to setId for setName and label when setsById entry is missing', () => {
  const heroA = bundle.runtime.indexes.allHeroes[0];
  const customRuntime = {
    ...bundle.runtime,
    indexes: {
      ...bundle.runtime.indexes,
      setsById: {}
    }
  };

  const state = createDefaultState();
  state.usage.heroes[heroA.id] = { plays: 2, lastPlayedAt: '2026-04-10T10:00:00.000Z' };

  const heroInsights = buildUsageInsights(customRuntime, state, { limit: 1 })
    .find((c) => c.category === 'heroes');

  assert.ok(heroInsights.mostPlayed.length > 0, 'should have mostPlayed entries');
  const entry = heroInsights.mostPlayed[0];
  assert.equal(entry.setName, heroA.setId, 'setName falls back to setId when set is missing from setsById');
  assert.ok(entry.label.includes(heroA.setId), 'label includes the setId fallback');
});