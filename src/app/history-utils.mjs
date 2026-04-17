import { formatGameResultStatus, isCompletedGameResult, sanitizeStoredGameResult } from './result-utils.mjs';
import { USAGE_CATEGORIES, createDefaultState } from './state-store.mjs';
import { PLAY_MODE_OPTIONS, getPlayModeLabel, resolvePlayMode } from './setup-rules.mjs';

export const HISTORY_USAGE_LABELS = {
  heroes: 'common.heroes',
  masterminds: 'common.masterminds',
  villainGroups: 'common.villainGroups',
  henchmanGroups: 'common.henchmanGroups',
  schemes: 'common.schemes'
};

/**
 * History Grouping Contract — Epic 34
 *
 * Five supported grouping dimensions. Group key derivation rules:
 *
 *   mastermind  — key: "mastermind:{mastermindId}"
 *                 label: mastermind display name (set-disambiguated when duplicate names exist)
 *                 Default grouping mode; mastermind replaces the removed 'none' default.
 *
 *   scheme      — key: "scheme:{schemeId}"
 *                 label: scheme display name resolved from schemesById index
 *
 *   heroes      — key: "hero:{heroId}" — ONE group entry per heroId in setupSnapshot.heroIds
 *                 label: hero display name resolved from heroesById index
 *                 Multi-group membership: a record with N heroes appears in N groups.
 *
 *   villains    — key: "villain:{villainGroupId}" — ONE group entry per id in setupSnapshot.villainGroupIds
 *                 label: villain group display name resolved from villainGroupsById index
 *                 Multi-group membership: a record with N villain groups appears in N groups.
 *
 *   play-mode   — key: "play-mode:{playMode}"
 *                 label: human-readable play mode label (Standard, Advanced Solo, Two-Handed Solo)
 *
 * Removed modes 'player-count' and 'none' are no longer valid; normalizeHistoryGroupingMode
 * falls back to the default ('mastermind') when it encounters either.
 */
export const HISTORY_GROUPING_MODES = [
  { id: 'mastermind', label: 'Mastermind' },
  { id: 'scheme', label: 'Scheme' },
  { id: 'heroes', label: 'Heroes' },
  { id: 'villains', label: 'Villains' },
  { id: 'play-mode', label: 'Player Mode' }
];

export const DEFAULT_HISTORY_GROUPING_MODE = 'mastermind';

const INDEX_KEYS = {
  heroes: 'allHeroes',
  masterminds: 'allMasterminds',
  villainGroups: 'allVillainGroups',
  henchmanGroups: 'allHenchmanGroups',
  schemes: 'allSchemes'
};

export function summarizeUsageIndicators(runtime, state) {
  return USAGE_CATEGORIES.map((category) => {
    const total = runtime.indexes[INDEX_KEYS[category]].length;
    const used = Object.keys(state.usage[category]).length;
    return {
      category,
      label: HISTORY_USAGE_LABELS[category],
      total,
      used,
      neverPlayed: total - used
    };
  });
}

export function formatHistorySummary(record, indexes) {
  const playMode = resolvePlayMode(record.playerCount, {
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
    modeLabel: getPlayModeLabel(playMode, record.playerCount),
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
    scoreLabel: isCompletedGameResult(result) && result.score !== null ? `Score ${result.score}` : null,
    resultNotes: result.notes,
    resultUpdatedAt: result.updatedAt
  };
}

export function normalizeHistoryGroupingMode(mode) {
  return HISTORY_GROUPING_MODES.some((entry) => entry.id === mode)
    ? mode
    : DEFAULT_HISTORY_GROUPING_MODE;
}

function buildGroupConfig(normalizedMode, summary, duplicateMastermindNameCount) {
  if (normalizedMode === 'mastermind') {
    return {
      id: `mastermind:${summary.mastermindId}`,
      label: duplicateMastermindNameCount > 1
        ? `${summary.mastermindName} · ${summary.mastermindSetName}`
        : summary.mastermindName
    };
  }
  if (normalizedMode === 'scheme') {
    return {
      id: `scheme:${summary.schemeId}`,
      label: summary.schemeName
    };
  }
  const playModeLabel = PLAY_MODE_OPTIONS[summary.playMode]?.label ?? summary.modeLabel;
  return {
    id: `play-mode:${summary.playMode}`,
    label: playModeLabel
  };
}

export function buildHistoryGroups(records, indexes, { mode = DEFAULT_HISTORY_GROUPING_MODE } = {}) {
  const normalizedMode = normalizeHistoryGroupingMode(mode);
  const summaries = records
    .map((record) => formatHistorySummary(record, indexes))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));

  const mastermindNameCounts = summaries.reduce((counts, summary) => {
    counts.set(summary.mastermindName, (counts.get(summary.mastermindName) || 0) + 1);
    return counts;
  }, new Map());

  const groupsById = new Map();

  function pushToGroup(config, summary) {
    if (!groupsById.has(config.id)) {
      groupsById.set(config.id, {
        ...config,
        mode: normalizedMode,
        count: 0,
        latestCreatedAt: summary.createdAt,
        records: []
      });
    }
    const group = groupsById.get(config.id);
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
    } else {
      const duplicateMastermindNameCount = mastermindNameCounts.get(summary.mastermindName) || 0;
      pushToGroup(buildGroupConfig(normalizedMode, summary, duplicateMastermindNameCount), summary);
    }
  });

  return [...groupsById.values()].sort((left, right) => left.label.localeCompare(right.label));
}

export function filterHistoryByOutcome(records, filter) {
  if (!records || records.length === 0) return [];
  if (filter === 'all') return records;
  if (filter === 'win') return records.filter((r) => r.result?.outcome === 'win');
  if (filter === 'loss') return records.filter((r) => r.result?.outcome === 'loss');
  if (filter === 'pending') return records.filter((r) => r.result?.status === 'pending' || r.result == null);
  return records;
}

export function buildFullResetPreview() {
  const defaultState = createDefaultState();
  return {
    collection: defaultState.collection,
    usage: defaultState.usage,
    history: defaultState.history,
    preferences: defaultState.preferences
  };
}

