import { formatGameResultStatus, isCompletedGameResult, sanitizeStoredGameResult } from './result-utils.mjs';
import { USAGE_CATEGORIES, createDefaultState } from './state-store.mjs';
import { getPlayModeLabel, resolvePlayMode } from './setup-rules.mjs';

export const HISTORY_USAGE_LABELS = {
  heroes: 'Heroes',
  masterminds: 'Masterminds',
  villainGroups: 'Villain Groups',
  henchmanGroups: 'Henchman Groups',
  schemes: 'Schemes'
};

export const HISTORY_GROUPING_MODES = [
  { id: 'mastermind', label: 'Mastermind' },
  { id: 'player-count', label: 'Players' },
  { id: 'play-mode', label: 'Play Mode' },
  { id: 'none', label: 'Ungrouped' }
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
    schemeName: scheme.name,
    heroNames: record.setupSnapshot.heroIds.map((id) => indexes.heroesById[id].name),
    villainGroupNames: record.setupSnapshot.villainGroupIds.map((id) => indexes.villainGroupsById[id].name),
    henchmanGroupNames: record.setupSnapshot.henchmanGroupIds.map((id) => indexes.henchmanGroupsById[id].name),
    playerCount: record.playerCount,
    playMode,
    result,
    resultLabel: formatGameResultStatus(result),
    scoreLabel: isCompletedGameResult(result) && result.score !== null ? `Score ${result.score}` : null,
    resultNotes: result.notes,
    resultUpdatedAt: result.updatedAt
  };
}

function normalizeHistoryGroupingMode(mode) {
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
  if (normalizedMode === 'player-count') {
    return {
      id: `player-count:${summary.playerCount}`,
      label: summary.playerLabel
    };
  }
  let playModeLabel;
  if (summary.playMode === 'standard') {
    playModeLabel = 'Standard';
  } else if (summary.playMode === 'advanced-solo') {
    playModeLabel = 'Advanced Solo';
  } else if (summary.playMode === 'two-handed-solo') {
    playModeLabel = 'Two-Handed Solo';
  } else {
    playModeLabel = summary.modeLabel;
  }
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

  if (normalizedMode === 'none') {
    return [{
      id: 'none:all-games',
      label: 'All games',
      mode: 'none',
      count: summaries.length,
      latestCreatedAt: summaries[0]?.createdAt || null,
      records: summaries
    }];
  }

  const mastermindNameCounts = summaries.reduce((counts, summary) => {
    counts.set(summary.mastermindName, (counts.get(summary.mastermindName) || 0) + 1);
    return counts;
  }, new Map());

  const groupsById = new Map();

  summaries.forEach((summary) => {
    const duplicateMastermindNameCount = mastermindNameCounts.get(summary.mastermindName) || 0;
    const groupConfig = buildGroupConfig(normalizedMode, summary, duplicateMastermindNameCount);

    if (!groupsById.has(groupConfig.id)) {
      groupsById.set(groupConfig.id, {
        ...groupConfig,
        mode: normalizedMode,
        count: 0,
        latestCreatedAt: summary.createdAt,
        records: []
      });
    }

    const group = groupsById.get(groupConfig.id);
    group.records.push(summary);
    group.count += 1;
    if (String(summary.createdAt).localeCompare(String(group.latestCreatedAt)) > 0) {
      group.latestCreatedAt = summary.createdAt;
    }
  });

  return [...groupsById.values()].sort((left, right) => {
    const createdAtOrder = String(right.latestCreatedAt).localeCompare(String(left.latestCreatedAt));
    if (createdAtOrder !== 0) {
      return createdAtOrder;
    }
    return left.label.localeCompare(right.label);
  });
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

