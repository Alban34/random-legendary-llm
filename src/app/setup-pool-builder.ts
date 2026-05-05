import type {
  GameSet,
  HeroRuntime,
  MastermindRuntime,
  VillainGroupRuntime,
  HenchmanGroupRuntime,
  SchemeRuntime
} from './types.ts';

// ---------------------------------------------------------------------------
// Runtime index types
// ---------------------------------------------------------------------------

export interface GameRuntimeIndexes {
  villainGroupsById: Record<string, VillainGroupRuntime>;
  henchmanGroupsById: Record<string, HenchmanGroupRuntime>;
}

export interface GameRuntime {
  sets: GameSet[];
  indexes: GameRuntimeIndexes;
}

export interface GamePool {
  sets: GameSet[];
  heroes: HeroRuntime[];
  masterminds: MastermindRuntime[];
  villainGroups: VillainGroupRuntime[];
  henchmanGroups: HenchmanGroupRuntime[];
  schemes: SchemeRuntime[];
}

// ---------------------------------------------------------------------------
// Pool building
// ---------------------------------------------------------------------------

function buildPoolFromSets(sets: GameSet[]): GamePool {
  return sets.reduce<GamePool>((accumulator, set) => {
    accumulator.sets.push(set);
    accumulator.heroes.push(...(set.heroes as unknown as HeroRuntime[]));
    accumulator.masterminds.push(...(set.masterminds as unknown as MastermindRuntime[]));
    accumulator.villainGroups.push(...(set.villainGroups as unknown as VillainGroupRuntime[]));
    accumulator.henchmanGroups.push(...(set.henchmanGroups as unknown as HenchmanGroupRuntime[]));
    accumulator.schemes.push(...(set.schemes as unknown as SchemeRuntime[]));
    return accumulator;
  }, {
    sets: [],
    heroes: [],
    masterminds: [],
    villainGroups: [],
    henchmanGroups: [],
    schemes: []
  });
}

export function buildOwnedPools(runtime: GameRuntime, ownedSetIds: string[]): GamePool {
  const ownedIdSet = new Set(ownedSetIds);
  const ownedSets = runtime.sets.filter((set) => ownedIdSet.has(set.id));
  return buildPoolFromSets(ownedSets);
}
