import { sanitizeStoredGameResult } from './result-utils.ts';
import { USAGE_CATEGORIES } from './state-store.ts';
import { summarizeOwnedCollection } from './collection-utils.ts';
import type { AppState, GameSet } from './types.ts';

const INDEX_KEYS: Record<string, string> = {
  heroes: 'allHeroes',
  masterminds: 'allMasterminds',
  villainGroups: 'allVillainGroups',
  henchmanGroups: 'allHenchmanGroups',
  schemes: 'allSchemes'
};

const BY_ID_KEYS: Record<string, string> = {
  heroes: 'heroesById',
  masterminds: 'mastermindsById',
  villainGroups: 'villainGroupsById',
  henchmanGroups: 'henchmanGroupsById',
  schemes: 'schemesById'
};

export const INSIGHT_CATEGORY_LABELS: Record<string, string> = {
  heroes: 'common.heroes',
  masterminds: 'common.masterminds',
  villainGroups: 'common.villainGroups',
  henchmanGroups: 'common.henchmanGroups',
  schemes: 'common.schemes'
};

export const RECENT_SCORE_WINDOW: number = 5;

interface AppRuntime {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  indexes: Record<string, any>;
  sets: GameSet[];
}

function average(values: number[]): number | null {
  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundMetric(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  return Number(value.toFixed(1));
}

function percentage(numerator: number, denominator: number): number | null {
  if (!denominator) {
    return null;
  }

  return roundMetric((numerator / denominator) * 100);
}

function resolveEntityDisplayLabel(entity: { name: string; setId: string }, indexes: AppRuntime['indexes']): string {
  const setName = indexes.setsById[entity.setId]?.name || entity.setId;
  return `${entity.name} · ${setName}`;
}

function countPlayedOwnedEntities(
  category: string,
  ownedEntities: { id: string }[],
  usageBucket: Record<string, { plays?: number } | null>
): number {
  const ownedIds = new Set(ownedEntities.map((entity) => entity.id));
  return Object.keys(usageBucket || {})
    .filter((id) => ownedIds.has(id) && (usageBucket[id]?.plays || 0) > 0)
    .length;
}

function sortMostPlayed(
  left: { plays: number; lastPlayedAt: string | null; label: string },
  right: { plays: number; lastPlayedAt: string | null; label: string }
): number {
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

function sortLeastPlayed(
  left: { plays: number; lastPlayedAt: string | null; label: string },
  right: { plays: number; lastPlayedAt: string | null; label: string }
): number {
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

export function buildUsageInsights(runtime: AppRuntime, state: AppState, { limit = 3 }: { limit?: number } = {}): unknown[] {
  return USAGE_CATEGORIES.map((category: string) => {
    const entities = runtime.indexes[INDEX_KEYS[category]];
    const byId = runtime.indexes[BY_ID_KEYS[category]];
    const usageBucket = state.usage[category as keyof AppState['usage']] || {};

    const usedEntries = Object.entries(usageBucket)
      .filter(([id, stat]) => byId[id] && stat && Number.isInteger((stat as { plays?: number }).plays) && (stat as { plays?: number }).plays! > 0)
      .map(([id, stat]) => ({
        id,
        name: byId[id].name,
        setName: runtime.indexes.setsById[byId[id].setId]?.name || byId[id].setId,
        label: resolveEntityDisplayLabel(byId[id], runtime.indexes),
        plays: (stat as { plays: number }).plays,
        lastPlayedAt: (stat as { lastPlayedAt: string | null }).lastPlayedAt
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

export function buildOutcomeInsights(history: AppState['history']): unknown {
  const normalizedResults = history.map((record) => ({
    id: record.id,
    createdAt: record.createdAt,
    result: sanitizeStoredGameResult(record.result).result
  }));
  const completed = normalizedResults.filter((entry) => entry.result.status === 'completed');
  const wins = completed.filter((entry) => entry.result.outcome === 'win');
  const losses = completed.filter((entry) => entry.result.outcome === 'loss');
  const scored = completed.filter((entry) => entry.result.score !== null);
  const scoredValues = scored.map((entry) => entry.result.score as number);
  const recentScoredValues = scoredValues.slice(0, RECENT_SCORE_WINDOW);

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

export function buildInsightsDashboard(runtime: AppRuntime, state: AppState, options: { limit?: number } = {}): unknown {
  const outcome = buildOutcomeInsights(state.history || []);
  const usage = buildUsageInsights(runtime, state, options) as Array<{
    category: string;
    label: string;
    total: number;
    used: number;
    neverPlayed: number;
  }>;
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
  const ownedCountsByType: Record<string, number> = {
    heroes: ownedSummary.heroCount,
    masterminds: ownedSummary.mastermindCount,
    villainGroups: ownedSummary.villainGroupCount,
    henchmanGroups: ownedSummary.henchmanGroupCount,
    schemes: ownedSummary.schemeCount
  };
  const userCollectionByType = usage.map((category) => ({
    category: category.category,
    label: category.label,
    played: countPlayedOwnedEntities(category.category, (ownedSummary.pools as unknown as Record<string, { id: string }[]>)[category.category] || [], state.usage?.[category.category as keyof AppState['usage']] || {}),
    total: ownedCountsByType[category.category],
    playedPercent: percentage(
      countPlayedOwnedEntities(category.category, (ownedSummary.pools as unknown as Record<string, { id: string }[]>)[category.category] || [], state.usage?.[category.category as keyof AppState['usage']] || {}),
      ownedCountsByType[category.category]
    )
  }));
  const userCollectionPlayed = userCollectionByType.reduce((sum, category) => sum + category.played, 0);
  const userCollectionTotal = userCollectionByType.reduce((sum, category) => sum + category.total, 0);
  const nonBaseSets = runtime.sets.filter((set: GameSet) => set.type !== 'base');
  const missingExtensions = nonBaseSets.filter((set: GameSet) => !state.collection?.ownedSetIds?.includes(set.id));

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
