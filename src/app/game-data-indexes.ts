import type {
  GameSet,
  HeroRuntime,
  MastermindRuntime,
  VillainGroupRuntime,
  HenchmanGroupRuntime,
  SchemeRuntime
} from './types.ts';

// ---------------------------------------------------------------------------
// Pipeline indexes type
// ---------------------------------------------------------------------------

export interface PipelineIndexes {
  setsById: Record<string, GameSet>;
  heroesById: Record<string, HeroRuntime>;
  mastermindsById: Record<string, MastermindRuntime>;
  villainGroupsById: Record<string, VillainGroupRuntime>;
  henchmanGroupsById: Record<string, HenchmanGroupRuntime>;
  schemesById: Record<string, SchemeRuntime>;
  setsList: GameSet[];
  allHeroes: HeroRuntime[];
  allMasterminds: MastermindRuntime[];
  allVillainGroups: VillainGroupRuntime[];
  allHenchmanGroups: HenchmanGroupRuntime[];
  allSchemes: SchemeRuntime[];
}

// ---------------------------------------------------------------------------
// Build indexes
// ---------------------------------------------------------------------------

export function buildIndexes(sets: GameSet[]): PipelineIndexes {
  const indexes: PipelineIndexes = {
    setsById: {},
    heroesById: {},
    mastermindsById: {},
    villainGroupsById: {},
    henchmanGroupsById: {},
    schemesById: {},
    setsList: sets,
    allHeroes: [],
    allMasterminds: [],
    allVillainGroups: [],
    allHenchmanGroups: [],
    allSchemes: []
  };

  sets.forEach((set) => {
    indexes.setsById[set.id] = set;
    set.heroes.forEach((hero) => {
      indexes.heroesById[hero.id] = hero;
      indexes.allHeroes.push(hero);
    });
    // @ts-expect-error — masterminds array contains MastermindRuntime objects after normalization
    set.masterminds.forEach((mastermind: MastermindRuntime) => {
      indexes.mastermindsById[mastermind.id] = mastermind;
      indexes.allMasterminds.push(mastermind);
    });
    set.villainGroups.forEach((group) => {
      indexes.villainGroupsById[group.id] = group;
      indexes.allVillainGroups.push(group);
    });
    set.henchmanGroups.forEach((group) => {
      indexes.henchmanGroupsById[group.id] = group;
      indexes.allHenchmanGroups.push(group);
    });
    // @ts-expect-error — schemes array contains SchemeRuntime objects after normalization
    set.schemes.forEach((scheme: SchemeRuntime) => {
      indexes.schemesById[scheme.id] = scheme;
      indexes.allSchemes.push(scheme);
    });
  });

  return indexes;
}

// ---------------------------------------------------------------------------
// Validate normalized data
// ---------------------------------------------------------------------------

export function validateNormalizedData(sets: GameSet[], indexes: PipelineIndexes): void {
  const uniqueBuckets: Array<[string, string[]]> = [
    ['set', sets.map((set) => set.id)],
    ['hero', indexes.allHeroes.map((entity) => entity.id)],
    ['mastermind', indexes.allMasterminds.map((entity) => entity.id)],
    ['villain-group', indexes.allVillainGroups.map((entity) => entity.id)],
    ['henchman-group', indexes.allHenchmanGroups.map((entity) => entity.id)],
    ['scheme', indexes.allSchemes.map((entity) => entity.id)]
  ];

  uniqueBuckets.forEach(([label, ids]) => {
    const seen = new Set<string>();
    ids.forEach((id) => {
      if (seen.has(id)) {
        throw new Error(`Duplicate ${label} id detected: ${id}`);
      }
      seen.add(id);
    });
  });

  indexes.allMasterminds.forEach((mastermind) => {
    if (!mastermind.lead) {
      return;
    }
    const collection = mastermind.lead.category === 'villains'
      ? indexes.villainGroupsById
      : indexes.henchmanGroupsById;
    if (!collection[mastermind.lead.id]) {
      throw new Error(`Unresolved mastermind lead for ${mastermind.name}`);
    }
  });

  indexes.allSchemes.forEach((scheme) => {
    scheme.forcedGroups.forEach((group) => {
      const collection = group.category === 'villains'
        ? indexes.villainGroupsById
        : indexes.henchmanGroupsById;
      if (!collection[group.id]) {
        throw new Error(`Unresolved forced group for ${scheme.name}`);
      }
    });
  });
}
