import { buildOwnedPools, validateSetupLegality } from './setup-generator.ts';
import type { GamePool } from './setup-generator.ts';
import type { AppState, GameSet } from './types.ts';

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
  label: string;
  sets: GameSet[];
}

interface FeasibilityResult {
  id: string;
  label: string;
  playerCount: number;
  advancedSolo: boolean;
  playMode: string;
  ok: boolean;
  reasons: unknown[];
  template: unknown;
}

export const CARD_CATEGORIES: ReadonlyArray<{ id: string; labelKey: string }> = [
  { id: 'heroes', labelKey: 'common.heroes' },
  { id: 'masterminds', labelKey: 'common.masterminds' },
  { id: 'villainGroups', labelKey: 'common.villainGroups' },
  { id: 'henchmanGroups', labelKey: 'common.henchmanGroups' },
  { id: 'schemes', labelKey: 'common.schemes' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCardsByCategory(pools: any): CategoryEntry[] {
  return CARD_CATEGORIES.map(({ id, labelKey }) => ({
    categoryId: id,
    labelKey,
    cards: [...(pools[id] ?? [])].sort((a: CardEntry, b: CardEntry) => a.name.localeCompare(b.name)),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCardsByExpansion(pools: any): ExpansionEntry[] {
  const expansionMap = new Map<string, ExpansionEntry>();
  for (const set of pools.sets as GameSet[]) {
    expansionMap.set(set.id, { setId: set.id, setName: set.name, cards: [] });
  }
  for (const categoryKey of ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes']) {
    for (const card of pools[categoryKey] as CardEntry[]) {
      if (expansionMap.has(card.setId)) {
        expansionMap.get(card.setId)!.cards.push(card);
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

export const COLLECTION_TYPE_GROUPS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'base', label: 'Base' },
  { id: 'large-expansion', label: 'Large Expansions' },
  { id: 'small-expansion', label: 'Small Expansions' }
];

export const COLLECTION_FEASIBILITY_MODES: ReadonlyArray<{
  id: string;
  label: string;
  playerCount: number;
  advancedSolo: boolean;
  playMode: string;
}> = [
  { id: 'standard-solo', label: 'Standard Solo (1P)', playerCount: 1, advancedSolo: false, playMode: 'standard' },
  { id: 'advanced-solo', label: 'Advanced Solo', playerCount: 1, advancedSolo: true, playMode: 'advanced-solo' },
  { id: 'two-handed-solo', label: 'Two-Handed Solo', playerCount: 1, advancedSolo: false, playMode: 'two-handed-solo' },
  { id: '2p', label: '2 Players', playerCount: 2, advancedSolo: false, playMode: 'standard' },
  { id: '3p', label: '3 Players', playerCount: 3, advancedSolo: false, playMode: 'standard' },
  { id: '4p', label: '4 Players', playerCount: 4, advancedSolo: false, playMode: 'standard' },
  { id: '5p', label: '5 Players', playerCount: 5, advancedSolo: false, playMode: 'standard' }
];

export function groupSetsByType(sets: GameSet[]): CollectionTypeGroup[] {
  return COLLECTION_TYPE_GROUPS.map((group) => ({
    ...group,
    sets: sets
      .filter((set) => set.type === group.id)
      .sort((left, right) => left.year - right.year || left.name.localeCompare(right.name))
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function summarizeOwnedCollection(runtime: any, ownedSetIds: string[]): CollectionSummary {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCollectionFeasibility(runtime: any, state: AppState): FeasibilityResult[] {
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
