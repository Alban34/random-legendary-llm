import { buildOwnedPools } from './setup-pool-builder.ts';
import type { GamePool, GameRuntime } from './setup-pool-builder.ts';
import { validateSetupLegality } from './setup-validator.ts';
import type { AppState, GameSet, PlayMode } from './types.ts';

// Pool category keys shared by getCardsByCategory / getCardsByExpansion.
type PoolCategoryKey = 'heroes' | 'masterminds' | 'villainGroups' | 'henchmanGroups' | 'schemes';

interface CardEntry {
  id: string;
  setId: string;
  name: string;
}

interface CategoryEntry {
  categoryId: string;
  labelKey: string;
  cards: CardEntry[];
}

interface ExpansionEntry {
  setId: string;
  setName: string;
  cards: CardEntry[];
}

interface CollectionSummary {
  setCount: number;
  heroCount: number;
  mastermindCount: number;
  villainGroupCount: number;
  henchmanGroupCount: number;
  schemeCount: number;
  pools: GamePool;
}

interface CollectionTypeGroup {
  id: string;
  labelKey: string;
  sets: GameSet[];
}

interface FeasibilityResult {
  id: string;
  labelKey: string;
  playerCount: number;
  advancedSolo: boolean;
  playMode: PlayMode;
  ok: boolean;
  reasons: unknown[];
  template: unknown;
}

// Grouping key: pool property name (heroes | masterminds | villainGroups | henchmanGroups | schemes)
export const CARD_CATEGORIES: ReadonlyArray<{ id: PoolCategoryKey; labelKey: string }> = [
  { id: 'heroes', labelKey: 'common.heroes' },
  { id: 'masterminds', labelKey: 'common.masterminds' },
  { id: 'villainGroups', labelKey: 'common.villainGroups' },
  { id: 'henchmanGroups', labelKey: 'common.henchmanGroups' },
  { id: 'schemes', labelKey: 'common.schemes' },
];

export function getCardsByCategory(pools: GamePool): CategoryEntry[] {
  return CARD_CATEGORIES.map(({ id, labelKey }) => ({
    categoryId: id,
    labelKey,
    cards: [...(pools[id] ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export function getCardsByExpansion(pools: GamePool): ExpansionEntry[] {
  const expansionMap = new Map<string, ExpansionEntry>();
  for (const set of pools.sets) {
    expansionMap.set(set.id, { setId: set.id, setName: set.name, cards: [] });
  }
  const categoryKeys: PoolCategoryKey[] = ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes'];
  for (const categoryKey of categoryKeys) {
    for (const card of pools[categoryKey]) {
      if (expansionMap.has(card.setId)) {
        expansionMap.get(card.setId)!.cards.push(card);
      }
    }
  }
  return [...expansionMap.values()]
    .map((expansion) => ({
      ...expansion,
      cards: expansion.cards.toSorted((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.setName.localeCompare(b.setName));
}

export const COLLECTION_TYPE_GROUPS: ReadonlyArray<{ id: string; labelKey: string }> = [
  { id: 'base', labelKey: 'collection.typeGroup.base' },
  { id: 'large-expansion', labelKey: 'collection.typeGroup.largeExpansion' },
  { id: 'small-expansion', labelKey: 'collection.typeGroup.smallExpansion' }
];

export const COLLECTION_FEASIBILITY_MODES: ReadonlyArray<{
  id: string;
  labelKey: string;
  playerCount: number;
  advancedSolo: boolean;
  playMode: PlayMode;
}> = [
  { id: 'standard-solo', labelKey: 'collection.feasibilityMode.standardSolo', playerCount: 1, advancedSolo: false, playMode: 'standard' },
  { id: 'advanced-solo', labelKey: 'collection.feasibilityMode.advancedSolo', playerCount: 1, advancedSolo: true, playMode: 'advanced-solo' },
  { id: 'two-handed-solo', labelKey: 'collection.feasibilityMode.twoHandedSolo', playerCount: 1, advancedSolo: false, playMode: 'two-handed-solo' },
  { id: '2p', labelKey: 'collection.feasibilityMode.2p', playerCount: 2, advancedSolo: false, playMode: 'standard' },
  { id: '3p', labelKey: 'collection.feasibilityMode.3p', playerCount: 3, advancedSolo: false, playMode: 'standard' },
  { id: '4p', labelKey: 'collection.feasibilityMode.4p', playerCount: 4, advancedSolo: false, playMode: 'standard' },
  { id: '5p', labelKey: 'collection.feasibilityMode.5p', playerCount: 5, advancedSolo: false, playMode: 'standard' }
];

export function groupSetsByType(sets: GameSet[]): CollectionTypeGroup[] {
  return COLLECTION_TYPE_GROUPS.map((group) => ({
    ...group,
    sets: sets
      .filter((set) => set.type === group.id)
      .sort((left, right) => left.year - right.year || left.name.localeCompare(right.name))
  }));
}

export function summarizeOwnedCollection(runtime: GameRuntime, ownedSetIds: string[]): CollectionSummary {
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

export function mergeOwnedSets(state: AppState, newSetIds: string[]): AppState {
  const merged = structuredClone(state);
  const combined = new Set([...merged.collection.ownedSetIds, ...newSetIds]);
  merged.collection.ownedSetIds = [...combined].sort((a, b) => a.localeCompare(b));
  return merged;
}

export function getCollectionFeasibility(runtime: GameRuntime, state: AppState): FeasibilityResult[] {
  return COLLECTION_FEASIBILITY_MODES.map((mode) => {
    const result = validateSetupLegality({
      runtime,
      state,
      playerCount: mode.playerCount,
      advancedSolo: mode.advancedSolo,
      playMode: mode.playMode,
      forcedPicks: undefined
    });

    return {
      ...mode,
      ok: result.ok,
      reasons: result.reasons,
      template: result.template
    };
  });
}
