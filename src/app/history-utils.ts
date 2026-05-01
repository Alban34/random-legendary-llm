import { formatGameResultStatus, isCompletedGameResult, sanitizeStoredGameResult } from './result-utils.ts';
import { USAGE_CATEGORIES, createDefaultState } from './state-store.ts';
import { PLAY_MODE_OPTIONS, getPlayModeLabel, resolvePlayMode } from './setup-rules.ts';
import type { HistoryRecord, AppState, RuntimeIndexes, GameResult } from './types.ts';

export const HISTORY_USAGE_LABELS: Record<string, string> = {
  heroes: 'common.heroes',
  masterminds: 'common.masterminds',
  villainGroups: 'common.villainGroups',
  henchmanGroups: 'common.henchmanGroups',
  schemes: 'common.schemes'
};

export const HISTORY_GROUPING_MODES: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'mastermind', label: 'Mastermind' },
  { id: 'scheme', label: 'Scheme' },
  { id: 'heroes', label: 'Heroes' },
  { id: 'villains', label: 'Villains' },
  { id: 'play-mode', label: 'Player Mode' },
  { id: 'epic-mastermind', label: 'history.group.epic-mastermind' }
];

export const DEFAULT_HISTORY_GROUPING_MODE = 'mastermind';

const INDEX_KEYS: Record<string, string> = {
  heroes: 'allHeroes',
  masterminds: 'allMasterminds',
  villainGroups: 'allVillainGroups',
  henchmanGroups: 'allHenchmanGroups',
  schemes: 'allSchemes'
};

interface AppRuntime {
  indexes: Record<string, { length: number }>;
}

interface UsageIndicator {
  category: string;
  label: string;
  total: number;
  used: number;
  neverPlayed: number;
}

export interface HistorySummary {
  id: string;
  createdAt: string;
  playerLabel: string;
  modeLabel: string;
  mastermindId: string;
  mastermindName: string;
  mastermindSetName: string;
  schemeId: string;
  schemeName: string;
  schemeSetName: string;
  heroIds: string[];
  heroNames: string[];
  heroSetNames: string[];
  villainGroupIds: string[];
  villainGroupNames: string[];
  villainGroupSetNames: string[];
  henchmanGroupNames: string[];
  henchmanGroupSetNames: string[];
  playerCount: number;
  playMode: string;
  result: GameResult;
  resultLabel: string;
  scoreLabel: string | null;
  perPlayerScoreLabel: string | null;
  resultNotes: string;
  resultUpdatedAt: string | null;
  epicMastermind: boolean;
}

export interface HistoryGroup {
  id: string;
  label: string;
  mode: string;
  count: number;
  latestCreatedAt: string;
  records: HistorySummary[];
}

export function summarizeUsageIndicators(runtime: AppRuntime, state: AppState): UsageIndicator[] {
  return USAGE_CATEGORIES.map((category: string) => {
    const total = runtime.indexes[INDEX_KEYS[category]].length;
    const used = Object.keys(state.usage[category as keyof AppState['usage']]).length;
    return {
      category,
      label: HISTORY_USAGE_LABELS[category],
      total,
      used,
      neverPlayed: total - used
    };
  });
}

export function formatHistorySummary(record: HistoryRecord, indexes: RuntimeIndexes): HistorySummary {
  type ResolveFn = (playerCount: number, opts: { advancedSolo?: boolean; playMode?: string }) => string;
  const playMode = (resolvePlayMode as unknown as ResolveFn)(record.playerCount, {
    advancedSolo: record.advancedSolo,
    playMode: record.playMode
  });
  const mastermind = indexes.mastermindsById[record.setupSnapshot.mastermindId];
  const scheme = indexes.schemesById[record.setupSnapshot.schemeId];

  const result = sanitizeStoredGameResult(record.result).result;

  return {
    id: record.id,
    createdAt: record.createdAt,
    playerLabel: `${record.playerCount} Player${record.playerCount === 1 ? '' : 's'}`,
    modeLabel: getPlayModeLabel(playMode as import('./types.ts').PlayMode, record.playerCount),
    mastermindId: mastermind.id,
    mastermindName: mastermind.name,
    mastermindSetName: indexes.setsById[mastermind.setId]?.name || mastermind.setId,
    schemeId: record.setupSnapshot.schemeId,
    schemeName: scheme.name,
    schemeSetName: indexes.setsById[scheme.setId]?.name || scheme.setId,
    heroIds: record.setupSnapshot.heroIds,
    heroNames: record.setupSnapshot.heroIds.map((id) => indexes.heroesById[id].name),
    heroSetNames: record.setupSnapshot.heroIds.map((id) => indexes.setsById[indexes.heroesById[id].setId]?.name || indexes.heroesById[id].setId),
    villainGroupIds: record.setupSnapshot.villainGroupIds,
    villainGroupNames: record.setupSnapshot.villainGroupIds.map((id) => indexes.villainGroupsById[id].name),
    villainGroupSetNames: record.setupSnapshot.villainGroupIds.map((id) => indexes.setsById[indexes.villainGroupsById[id].setId]?.name || indexes.villainGroupsById[id].setId),
    henchmanGroupNames: record.setupSnapshot.henchmanGroupIds.map((id) => indexes.henchmanGroupsById[id].name),
    henchmanGroupSetNames: record.setupSnapshot.henchmanGroupIds.map((id) => indexes.setsById[indexes.henchmanGroupsById[id].setId]?.name || indexes.henchmanGroupsById[id].setId),
    playerCount: record.playerCount,
    playMode,
    result,
    resultLabel: formatGameResultStatus(result),
    scoreLabel: isCompletedGameResult(result) && result.score !== null && record.playerCount === 1 ? `Score ${result.score}` : null,
    perPlayerScoreLabel: (function() {
      if (record.playerCount < 2 || !isCompletedGameResult(result) || !Array.isArray(result.score)) return null;
      const hasAnyScore = result.score.some((entry) => entry.score !== null);
      if (!hasAnyScore) return null;
      return result.score.map((entry, i) => {
        const name = entry.playerName && entry.playerName.trim() !== '' ? entry.playerName : `Player ${i + 1}`;
        const score = entry.score !== null ? entry.score : '\u2014';
        return `${name}: ${score}`;
      }).join(' \u00b7 ');
    })(),
    resultNotes: result.notes,
    resultUpdatedAt: result.updatedAt,
    epicMastermind: record.epicMastermind ?? false
  };
}

export function normalizeHistoryGroupingMode(mode: string): string {
  return HISTORY_GROUPING_MODES.some((entry) => entry.id === mode)
    ? mode
    : DEFAULT_HISTORY_GROUPING_MODE;
}

function buildGroupConfig(
  normalizedMode: string,
  summary: HistorySummary,
  duplicateMastermindNameCount: number
): { id: string; label: string } {
  if (normalizedMode === 'mastermind') {
    return {
      id: `mastermind:${summary.mastermindId}`,
      label: duplicateMastermindNameCount > 1
        ? `${summary.mastermindName} \u00b7 ${summary.mastermindSetName}`
        : summary.mastermindName
    };
  }
  if (normalizedMode === 'scheme') {
    return {
      id: `scheme:${summary.schemeId}`,
      label: summary.schemeName
    };
  }
  const playModeLabel = (PLAY_MODE_OPTIONS as Record<string, { label?: string }>)[summary.playMode]?.label ?? summary.modeLabel;
  return {
    id: `play-mode:${summary.playMode}`,
    label: playModeLabel
  };
}

export function buildHistoryGroups(
  records: HistoryRecord[],
  indexes: RuntimeIndexes,
  { mode = DEFAULT_HISTORY_GROUPING_MODE }: { mode?: string } = {}
): HistoryGroup[] {
  const normalizedMode = normalizeHistoryGroupingMode(mode);
  const summaries = records
    .map((record) => formatHistorySummary(record, indexes))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));

  const mastermindNameCounts = summaries.reduce((counts, summary) => {
    counts.set(summary.mastermindName, (counts.get(summary.mastermindName) || 0) + 1);
    return counts;
  }, new Map<string, number>());

  const groupsById = new Map<string, HistoryGroup>();

  function pushToGroup(config: { id: string; label: string }, summary: HistorySummary): void {
    if (!groupsById.has(config.id)) {
      groupsById.set(config.id, {
        ...config,
        mode: normalizedMode,
        count: 0,
        latestCreatedAt: summary.createdAt,
        records: []
      });
    }
    const group = groupsById.get(config.id)!;
    group.records.push(summary);
    group.count += 1;
    if (String(summary.createdAt).localeCompare(String(group.latestCreatedAt)) > 0) {
      group.latestCreatedAt = summary.createdAt;
    }
  }

  summaries.forEach((summary) => {
    if (normalizedMode === 'heroes') {
      summary.heroIds.forEach((heroId, i) => {
        pushToGroup({ id: `hero:${heroId}`, label: summary.heroNames[i] }, summary);
      });
    } else if (normalizedMode === 'villains') {
      summary.villainGroupIds.forEach((villainGroupId, i) => {
        pushToGroup({ id: `villain:${villainGroupId}`, label: summary.villainGroupNames[i] }, summary);
      });
    } else if (normalizedMode === 'epic-mastermind') {
      const config = summary.epicMastermind
        ? { id: 'epic-mastermind:epic', label: 'history.group.epic-mastermind.epicGames' }
        : { id: 'epic-mastermind:standard', label: 'history.group.epic-mastermind.standardGames' };
      pushToGroup(config, summary);
    } else {
      const duplicateMastermindNameCount = mastermindNameCounts.get(summary.mastermindName) || 0;
      pushToGroup(buildGroupConfig(normalizedMode, summary, duplicateMastermindNameCount), summary);
    }
  });

  return [...groupsById.values()].sort((left, right) => left.label.localeCompare(right.label));
}

export function filterHistoryByOutcome(records: HistoryRecord[], filter: string | null): HistoryRecord[] {
  if (!records || records.length === 0) return [];
  if (filter === 'all') return records;
  if (filter === 'win') return records.filter((r) => r.result?.outcome === 'win');
  if (filter === 'loss') return records.filter((r) => r.result?.outcome === 'loss');
  if (filter === 'pending') return records.filter((r) => r.result?.status === 'pending' || r.result == null);
  return records;
}

export function buildFullResetPreview(): {
  collection: AppState['collection'];
  usage: AppState['usage'];
  history: AppState['history'];
  preferences: AppState['preferences'];
} {
  const defaultState = createDefaultState();
  return {
    collection: defaultState.collection,
    usage: defaultState.usage,
    history: defaultState.history,
    preferences: defaultState.preferences as AppState['preferences']
  };
}
