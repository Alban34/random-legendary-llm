import { USAGE_CATEGORIES, createDefaultState } from './state-store.mjs';
import { getPlayModeLabel, resolvePlayMode } from './setup-rules.mjs';

export const HISTORY_USAGE_LABELS = {
  heroes: 'Heroes',
  masterminds: 'Masterminds',
  villainGroups: 'Villain Groups',
  henchmanGroups: 'Henchman Groups',
  schemes: 'Schemes'
};

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

  return {
    id: record.id,
    createdAt: record.createdAt,
    playerLabel: `${record.playerCount} Player${record.playerCount === 1 ? '' : 's'}`,
    modeLabel: getPlayModeLabel(playMode, record.playerCount),
    mastermindName: indexes.mastermindsById[record.setupSnapshot.mastermindId].name,
    schemeName: indexes.schemesById[record.setupSnapshot.schemeId].name,
    heroNames: record.setupSnapshot.heroIds.map((id) => indexes.heroesById[id].name),
    villainGroupNames: record.setupSnapshot.villainGroupIds.map((id) => indexes.villainGroupsById[id].name),
    henchmanGroupNames: record.setupSnapshot.henchmanGroupIds.map((id) => indexes.henchmanGroupsById[id].name)
  };
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

