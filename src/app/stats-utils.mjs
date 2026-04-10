import { sanitizeStoredGameResult } from './result-utils.mjs';
import { USAGE_CATEGORIES } from './state-store.mjs';
import { summarizeOwnedCollection } from './collection-utils.mjs';

const INDEX_KEYS = {
  heroes: 'allHeroes',
  masterminds: 'allMasterminds',
  villainGroups: 'allVillainGroups',
  henchmanGroups: 'allHenchmanGroups',
  schemes: 'allSchemes'
};

const BY_ID_KEYS = {
  heroes: 'heroesById',
  masterminds: 'mastermindsById',
  villainGroups: 'villainGroupsById',
  henchmanGroups: 'henchmanGroupsById',
  schemes: 'schemesById'
};

export const INSIGHT_CATEGORY_LABELS = {
  heroes: 'Heroes',
  masterminds: 'Masterminds',
  villainGroups: 'Villain Groups',
  henchmanGroups: 'Henchman Groups',
  schemes: 'Schemes'
};

function average(values) {
  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundMetric(value) {
  if (value === null) {
    return null;
  }

  return Number(value.toFixed(1));
}

function percentage(numerator, denominator) {
  if (!denominator) {
    return null;
  }

  return roundMetric((numerator / denominator) * 100);
}

function resolveEntityDisplayLabel(entity, indexes) {
  const setName = indexes.setsById[entity.setId]?.name || entity.setId;
  return `${entity.name} · ${setName}`;
}

function countPlayedOwnedEntities(category, ownedEntities, usageBucket) {
  const ownedIds = new Set(ownedEntities.map((entity) => entity.id));
  return Object.keys(usageBucket || {})
    .filter((id) => ownedIds.has(id) && (usageBucket[id]?.plays || 0) > 0)
    .length;
}

function sortMostPlayed(left, right) {
  if (right.plays !== left.plays) {
    return right.plays - left.plays;
  }

  const leftPlayedAt = left.lastPlayedAt || '';
  const rightPlayedAt = right.lastPlayedAt || '';
  if (rightPlayedAt !== leftPlayedAt) {
    return rightPlayedAt.localeCompare(leftPlayedAt);
  }

  return left.label.localeCompare(right.label);
}

function sortLeastPlayed(left, right) {
  if (left.plays !== right.plays) {
    return left.plays - right.plays;
  }

  const leftPlayedAt = left.lastPlayedAt || '';
  const rightPlayedAt = right.lastPlayedAt || '';
  if (leftPlayedAt !== rightPlayedAt) {
    return leftPlayedAt.localeCompare(rightPlayedAt);
  }

  return left.label.localeCompare(right.label);
}

export function buildUsageInsights(runtime, state, { limit = 3 } = {}) {
  return USAGE_CATEGORIES.map((category) => {
    const entities = runtime.indexes[INDEX_KEYS[category]];
    const byId = runtime.indexes[BY_ID_KEYS[category]];
    const usageBucket = state.usage[category] || {};

    const usedEntries = Object.entries(usageBucket)
      .filter(([id, stat]) => byId[id] && stat && Number.isInteger(stat.plays) && stat.plays > 0)
      .map(([id, stat]) => ({
        id,
        name: byId[id].name,
        setName: runtime.indexes.setsById[byId[id].setId]?.name || byId[id].setId,
        label: resolveEntityDisplayLabel(byId[id], runtime.indexes),
        plays: stat.plays,
        lastPlayedAt: stat.lastPlayedAt
      }));

    const mostPlayed = [...usedEntries].sort(sortMostPlayed).slice(0, limit);
    const leastPlayed = [...usedEntries].sort(sortLeastPlayed).slice(0, limit);

    return {
      category,
      label: INSIGHT_CATEGORY_LABELS[category],
      total: entities.length,
      used: usedEntries.length,
      neverPlayed: entities.length - usedEntries.length,
      mostPlayed,
      leastPlayed
    };
  });
}

export function buildOutcomeInsights(history) {
  const normalizedResults = history.map((record) => ({
    id: record.id,
    createdAt: record.createdAt,
    result: sanitizeStoredGameResult(record.result).result
  }));
  const completed = normalizedResults.filter((entry) => entry.result.status === 'completed');
  const wins = completed.filter((entry) => entry.result.outcome === 'win');
  const losses = completed.filter((entry) => entry.result.outcome === 'loss');
  const scored = completed.filter((entry) => entry.result.score !== null);
  const scoredValues = scored.map((entry) => entry.result.score);
  const recentScoredValues = scoredValues.slice(0, 5);

  return {
    totalGames: history.length,
    completedResults: completed.length,
    pendingResults: history.length - completed.length,
    wins: wins.length,
    losses: losses.length,
    scoredGames: scored.length,
    winRate: completed.length ? roundMetric((wins.length / completed.length) * 100) : null,
    averageScore: roundMetric(average(scoredValues)),
    recentAverageScore: roundMetric(average(recentScoredValues)),
    bestScore: scoredValues.length ? Math.max(...scoredValues) : null
  };
}

export function buildInsightsDashboard(runtime, state, options = {}) {
  const outcome = buildOutcomeInsights(state.history || []);
  const usage = buildUsageInsights(runtime, state, options);
  const totalEntitiesTracked = usage.reduce((sum, category) => sum + category.total, 0);
  const totalNeverPlayed = usage.reduce((sum, category) => sum + category.neverPlayed, 0);
  const ownedSummary = summarizeOwnedCollection(runtime, state.collection?.ownedSetIds || []);
  const overallByType = usage.map((category) => ({
    category: category.category,
    label: category.label,
    played: category.used,
    total: category.total,
    playedPercent: percentage(category.used, category.total)
  }));
  const ownedCountsByType = {
    heroes: ownedSummary.heroCount,
    masterminds: ownedSummary.mastermindCount,
    villainGroups: ownedSummary.villainGroupCount,
    henchmanGroups: ownedSummary.henchmanGroupCount,
    schemes: ownedSummary.schemeCount
  };
  const userCollectionByType = usage.map((category) => ({
    category: category.category,
    label: category.label,
    played: countPlayedOwnedEntities(category.category, ownedSummary.pools[category.category] || [], state.usage?.[category.category] || {}),
    total: ownedCountsByType[category.category],
    playedPercent: percentage(
      countPlayedOwnedEntities(category.category, ownedSummary.pools[category.category] || [], state.usage?.[category.category] || {}),
      ownedCountsByType[category.category]
    )
  }));
  const userCollectionPlayed = userCollectionByType.reduce((sum, category) => sum + category.played, 0);
  const userCollectionTotal = userCollectionByType.reduce((sum, category) => sum + category.total, 0);
  const nonBaseSets = runtime.sets.filter((set) => set.type !== 'base');
  const missingExtensions = nonBaseSets.filter((set) => !state.collection?.ownedSetIds?.includes(set.id));

  return {
    outcome,
    usage,
    freshness: {
      totalEntitiesTracked,
      totalNeverPlayed,
      usedEntities: totalEntitiesTracked - totalNeverPlayed
    },
    collectionCoverage: {
      userCollection: {
        played: userCollectionPlayed,
        total: userCollectionTotal,
        playedPercent: percentage(userCollectionPlayed, userCollectionTotal),
        byType: userCollectionByType
      },
      overallCollection: {
        played: totalEntitiesTracked - totalNeverPlayed,
        total: totalEntitiesTracked,
        playedPercent: percentage(totalEntitiesTracked - totalNeverPlayed, totalEntitiesTracked),
        byType: overallByType
      },
      missingExtensions: {
        missing: missingExtensions.length,
        total: nonBaseSets.length,
        missingPercent: percentage(missingExtensions.length, nonBaseSets.length)
      }
    }
  };
}