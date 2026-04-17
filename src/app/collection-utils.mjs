import { buildOwnedPools, validateSetupLegality } from './setup-generator.mjs';

export const CARD_CATEGORIES = [
  { id: 'heroes', labelKey: 'common.heroes' },
  { id: 'masterminds', labelKey: 'common.masterminds' },
  { id: 'villainGroups', labelKey: 'common.villainGroups' },
  { id: 'henchmanGroups', labelKey: 'common.henchmanGroups' },
  { id: 'schemes', labelKey: 'common.schemes' },
];

export function getCardsByCategory(pools) {
  return CARD_CATEGORIES.map(({ id, labelKey }) => ({
    categoryId: id,
    labelKey,
    cards: [...(pools[id] ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export function getCardsByExpansion(pools) {
  const expansionMap = new Map();
  for (const set of pools.sets) {
    expansionMap.set(set.id, { setId: set.id, setName: set.name, cards: [] });
  }
  for (const categoryKey of ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes']) {
    for (const card of pools[categoryKey]) {
      if (expansionMap.has(card.setId)) {
        expansionMap.get(card.setId).cards.push(card);
      }
    }
  }
  return [...expansionMap.values()]
    .map((expansion) => ({
      ...expansion,
      cards: expansion.cards.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.setName.localeCompare(b.setName));
}

export const COLLECTION_TYPE_GROUPS = [
  { id: 'base', label: 'Base' },
  { id: 'large-expansion', label: 'Large Expansions' },
  { id: 'small-expansion', label: 'Small Expansions' }
];

export const COLLECTION_FEASIBILITY_MODES = [
  { id: 'standard-solo', label: 'Standard Solo (1P)', playerCount: 1, advancedSolo: false, playMode: 'standard' },
  { id: 'advanced-solo', label: 'Advanced Solo', playerCount: 1, advancedSolo: true, playMode: 'advanced-solo' },
  { id: 'two-handed-solo', label: 'Two-Handed Solo', playerCount: 1, advancedSolo: false, playMode: 'two-handed-solo' },
  { id: '2p', label: '2 Players', playerCount: 2, advancedSolo: false, playMode: 'standard' },
  { id: '3p', label: '3 Players', playerCount: 3, advancedSolo: false, playMode: 'standard' },
  { id: '4p', label: '4 Players', playerCount: 4, advancedSolo: false, playMode: 'standard' },
  { id: '5p', label: '5 Players', playerCount: 5, advancedSolo: false, playMode: 'standard' }
];

export function groupSetsByType(sets) {
  return COLLECTION_TYPE_GROUPS.map((group) => ({
    ...group,
    sets: sets
      .filter((set) => set.type === group.id)
      .sort((left, right) => left.year - right.year || left.name.localeCompare(right.name))
  }));
}

export function summarizeOwnedCollection(runtime, ownedSetIds) {
  const pools = buildOwnedPools(runtime, ownedSetIds);
  return {
    setCount: pools.sets.length,
    heroCount: pools.heroes.length,
    mastermindCount: pools.masterminds.length,
    villainGroupCount: pools.villainGroups.length,
    henchmanGroupCount: pools.henchmanGroups.length,
    schemeCount: pools.schemes.length,
    pools
  };
}

export function mergeOwnedSets(state, newSetIds) {
  const merged = structuredClone(state);
  const combined = new Set([...merged.collection.ownedSetIds, ...newSetIds]);
  merged.collection.ownedSetIds = [...combined].sort();
  return merged;
}

export function getCollectionFeasibility(runtime, state) {
  return COLLECTION_FEASIBILITY_MODES.map((mode) => {
    const result = validateSetupLegality({
      runtime,
      state,
      playerCount: mode.playerCount,
      advancedSolo: mode.advancedSolo,
      playMode: mode.playMode
    });

    return {
      ...mode,
      ok: result.ok,
      reasons: result.reasons,
      template: result.template
    };
  });
}

