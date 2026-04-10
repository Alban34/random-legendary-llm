import { buildOwnedPools, validateSetupLegality } from './setup-generator.mjs';

export const COLLECTION_TYPE_GROUPS = [
  { id: 'base', label: 'Base' },
  { id: 'large-expansion', label: 'Large Expansions' },
  { id: 'small-expansion', label: 'Small Expansions' },
  { id: 'standalone', label: 'Standalone' }
];

export const COLLECTION_FEASIBILITY_MODES = [
  { id: 'standard-solo', label: 'Standard Solo (1P)', playerCount: 1, advancedSolo: false },
  { id: 'advanced-solo', label: 'Advanced Solo', playerCount: 1, advancedSolo: true },
  { id: '2p', label: '2 Players', playerCount: 2, advancedSolo: false },
  { id: '3p', label: '3 Players', playerCount: 3, advancedSolo: false },
  { id: '4p', label: '4 Players', playerCount: 4, advancedSolo: false },
  { id: '5p', label: '5 Players', playerCount: 5, advancedSolo: false }
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

export function getCollectionFeasibility(runtime, state) {
  return COLLECTION_FEASIBILITY_MODES.map((mode) => {
    const result = validateSetupLegality({
      runtime,
      state,
      playerCount: mode.playerCount,
      advancedSolo: mode.advancedSolo
    });

    return {
      ...mode,
      ok: result.ok,
      reasons: result.reasons,
      template: result.template
    };
  });
}

