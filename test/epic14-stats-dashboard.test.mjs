import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { buildInsightsDashboard, buildOutcomeInsights, buildUsageInsights } from '../src/app/stats-utils.ts';
import { acceptGameSetup, createDefaultState, updateGameResult } from '../src/app/state-store.ts';

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

function createSampleSnapshot(offset = 0) {
  const indexes = bundle.runtime.indexes;
  return {
    mastermindId: indexes.allMasterminds[offset].id,
    schemeId: indexes.allSchemes[offset].id,
    heroIds: indexes.allHeroes.slice(offset, offset + 3).map((entity) => entity.id),
    villainGroupIds: [indexes.allVillainGroups[offset].id],
    henchmanGroupIds: [indexes.allHenchmanGroups[offset].id]
  };
}

function acceptLoggedGame(state, { id, createdAt, offset, outcome = null, score = null, notes = '' }) {
  let nextState = acceptGameSetup(state, {
    id,
    createdAt,
    playerCount: 2,
    advancedSolo: false,
    setupSnapshot: createSampleSnapshot(offset)
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

  let state = createAllOwnedState();
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

  const state = createAllOwnedState();
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