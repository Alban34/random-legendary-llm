import { EPIC_MASTERMIND_SUPPORTED_SETS, type SetType, type GameSet, type HeroCard, type MastermindCard, type VillainGroupCard, type HenchmanGroupCard, type SchemeCard, type MastermindRuntime, type SchemeRuntime, type RuntimeGameSet } from './types.ts';
import { buildIndexes, validateNormalizedData, type PipelineIndexes } from './game-data-indexes.ts';

// ---------------------------------------------------------------------------
// Local pipeline types
// ---------------------------------------------------------------------------

interface SeedCatalogEntry {
  name: string;
  year: number;
  type: SetType;
  aliases?: string[];
}
export interface SeedData {
  setCatalog: SeedCatalogEntry[];
  rawCardData: Record<string, Array<Record<string, unknown>>>;
}
export interface CanonicalSourceData {
  sets: GameSet[];
}
export interface PipelineRuntime {
  sets: GameSet[];
  indexes: PipelineIndexes;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

export function slugify(value: unknown): string {
  return String(value)
    .normalize('NFKD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll('&', ' and ')
    .replaceAll(/[^a-zA-Z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .replaceAll(/-{2,}/g, '-')
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Build canonical source data
// ---------------------------------------------------------------------------

type SeedEntityBuilders = {
  heroes: (item: Record<string, unknown>, set: GameSet) => HeroCard;
  masterminds: (item: Record<string, unknown>, set: GameSet) => MastermindCard;
  villainGroups: (item: Record<string, unknown>, set: GameSet) => VillainGroupCard;
  henchmanGroups: (item: Record<string, unknown>, set: GameSet) => HenchmanGroupCard;
  schemes: (item: Record<string, unknown>, set: GameSet) => SchemeCard;
};

function appendSeedEntity(
  builders: SeedEntityBuilders,
  set: GameSet,
  category: string,
  item: Record<string, unknown>
): void {
  switch (category) {
    case 'heroes':
      set.heroes.push(builders.heroes(item, set));
      break;
    case 'masterminds':
      set.masterminds.push(builders.masterminds(item, set));
      break;
    case 'villainGroups':
      set.villainGroups.push(builders.villainGroups(item, set));
      break;
    case 'henchmanGroups':
      set.henchmanGroups.push(builders.henchmanGroups(item, set));
      break;
    case 'schemes':
      set.schemes.push(builders.schemes(item, set));
      break;
    default:
      throw new Error(`Unknown card category in seed: ${category}`);
  }
}

export function buildCanonicalSourceData(seed: SeedData): CanonicalSourceData {
  const setsByName = new Map<string, GameSet>();
  const source: CanonicalSourceData = { sets: [] };

  seed.setCatalog.forEach((entry) => {
    const setId = slugify(entry.name);
    const set: GameSet = {
      id: setId,
      name: entry.name,
      year: entry.year,
      type: entry.type,
      aliases: entry.aliases || [],
      heroes: [],
      masterminds: [],
      villainGroups: [],
      henchmanGroups: [],
      schemes: []
    };
    source.sets.push(set);
    setsByName.set(entry.name, set);
  });

  const entityBuilders = {
    heroes: (item: Record<string, unknown>, set: GameSet): HeroCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      teams: (item['teams'] as string[]) || [],
      cardCount: (item['cardCount'] as number) ?? 14
    }),
    masterminds: (item: Record<string, unknown>, set: GameSet): MastermindCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      leadName: (item['leadName'] as string) ?? null,
      leadCategory: (item['leadCategory'] as string) ?? null,
      leadNameFilter: Array.isArray(item['leadNameFilter']) ? (item['leadNameFilter'] as string[]) : undefined,
      notes: (item['notes'] as string[]) || []
    }),
    villainGroups: (item: Record<string, unknown>, set: GameSet): VillainGroupCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      cardCount: (item['cardCount'] as number) ?? 8
    }),
    henchmanGroups: (item: Record<string, unknown>, set: GameSet): HenchmanGroupCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      cardCount: (item['cardCount'] as number) ?? 10
    }),
    schemes: (item: Record<string, unknown>, set: GameSet): SchemeCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      constraints: (item['constraints'] as { minimumPlayerCount: number | null }) || { minimumPlayerCount: null },
      forcedGroups: (item['forcedGroups'] as Array<{ name: string; category: string }>) || [],
      modifiers: (item['modifiers'] as unknown[]) || [],
      notes: (item['notes'] as string[]) || []
    })
  };

  Object.entries(seed.rawCardData).forEach(([category, items]) => {
    items.forEach((item) => {
      const set = setsByName.get(item['setName'] as string);
      if (!set) {
        throw new Error(`Unknown set name in seed: ${item['setName']}`);
      }
      appendSeedEntity(entityBuilders, set, category, item);
    });
  });

  source.sets.forEach((set) => {
    set.heroes.sort((a, b) => a.name.localeCompare(b.name));
    set.masterminds.sort((a, b) => a.name.localeCompare(b.name));
    set.villainGroups.sort((a, b) => a.name.localeCompare(b.name));
    set.henchmanGroups.sort((a, b) => a.name.localeCompare(b.name));
    set.schemes.sort((a, b) => a.name.localeCompare(b.name));
  });

  return source;
}

// ---------------------------------------------------------------------------
// Name index helpers
// ---------------------------------------------------------------------------

function createNameIndex<T extends { name: string }>(entities: T[]): Map<string, T[]> {
  const index = new Map<string, T[]>();
  entities.forEach((entity) => {
    const key = slugify(entity.name);
    const list = index.get(key) || [];
    list.push(entity);
    index.set(key, list);
  });
  return index;
}

interface ResolvedGroupRef {
  category: string;
  id: string;
}

function getCategoryMatches(
  reference: string,
  sourceSetId: string,
  category: string,
  villainGroupsBySet: Map<string, Map<string, VillainGroupCard[]>>,
  henchmanGroupsBySet: Map<string, Map<string, HenchmanGroupCard[]>>,
  globalVillainIndex: Map<string, VillainGroupCard[]>,
  globalHenchmanIndex: Map<string, HenchmanGroupCard[]>
): Array<VillainGroupCard | HenchmanGroupCard> {
  const normalizedName = slugify(reference);
  const sameSetIndex = category === 'villains' ? villainGroupsBySet : henchmanGroupsBySet;
  const globalIndex = category === 'villains' ? globalVillainIndex : globalHenchmanIndex;
  const sameSetMatches = sameSetIndex.get(sourceSetId)?.get(normalizedName) || [];
  if (sameSetMatches.length > 1) {
    throw new Error(`Ambiguous ${category} reference '${reference}' within set ${sourceSetId}`);
  }
  if (sameSetMatches.length === 1) {
    return sameSetMatches;
  }
  const globalMatches = globalIndex.get(normalizedName) || [];
  if (globalMatches.length > 1) {
    throw new Error(`Ambiguous global ${category} reference '${reference}'`);
  }
  return globalMatches;
}

function resolveGroupReference(
  reference: string,
  sourceSetId: string,
  preferredCategory: string,
  villainGroupsBySet: Map<string, Map<string, VillainGroupCard[]>>,
  henchmanGroupsBySet: Map<string, Map<string, HenchmanGroupCard[]>>,
  globalVillainIndex: Map<string, VillainGroupCard[]>,
  globalHenchmanIndex: Map<string, HenchmanGroupCard[]>
): ResolvedGroupRef {
  const searchOrder = preferredCategory === 'henchmen'
    ? ['henchmen', 'villains']
    : ['villains', 'henchmen'];

  for (const category of searchOrder) {
    const matches = getCategoryMatches(
      reference,
      sourceSetId,
      category,
      villainGroupsBySet,
      henchmanGroupsBySet,
      globalVillainIndex,
      globalHenchmanIndex
    );
    if (matches.length === 1) {
      return { category, id: matches[0].id };
    }
  }

  throw new Error(`Missing group reference '${reference}' for set ${sourceSetId}`);
}

// ---------------------------------------------------------------------------
// Normalize game data
// ---------------------------------------------------------------------------

interface GroupResolutionContext {
  villainGroupsBySet: Map<string, Map<string, VillainGroupCard[]>>;
  henchmanGroupsBySet: Map<string, Map<string, HenchmanGroupCard[]>>;
  globalVillainIndex: Map<string, VillainGroupCard[]>;
  globalHenchmanIndex: Map<string, HenchmanGroupCard[]>;
  allVillainGroups: VillainGroupCard[];
}

function normalizeMasterminds(
  masterminds: MastermindCard[],
  set: GameSet,
  context: GroupResolutionContext
): MastermindRuntime[] {
  return masterminds.map((mastermind): MastermindRuntime => {
    const lead = mastermind.leadName
      ? resolveGroupReference(
          mastermind.leadName,
          set.id,
          mastermind.leadCategory!,
          context.villainGroupsBySet,
          context.henchmanGroupsBySet,
          context.globalVillainIndex,
          context.globalHenchmanIndex
        )
      : null;
    const leadNameFilter = mastermind.leadNameFilter;
    const leadCandidates = leadNameFilter && leadNameFilter.length > 0
      ? context.allVillainGroups
          .filter((vg) => leadNameFilter.some((f) => vg.name.toLowerCase().includes(f.toLowerCase())))
          .map((vg) => ({ category: 'villains' as const, id: vg.id }))
      : undefined;
    return {
      id: mastermind.id,
      setId: mastermind.setId,
      name: mastermind.name,
      aliases: mastermind.aliases || [],
      lead,
      ...(leadCandidates && { leadCandidates }),
      notes: mastermind.notes || [],
      isEpicMastermind: EPIC_MASTERMIND_SUPPORTED_SETS.includes(set.name) || undefined
    };
  });
}

function normalizeSchemes(
  schemes: SchemeCard[],
  set: GameSet,
  context: GroupResolutionContext
): SchemeRuntime[] {
  return schemes.map((scheme): SchemeRuntime => {
    const forcedGroups = (scheme.forcedGroups || []).map((groupRef) => ({
      ...resolveGroupReference(
        groupRef.name,
        set.id,
        groupRef.category,
        context.villainGroupsBySet,
        context.henchmanGroupsBySet,
        context.globalVillainIndex,
        context.globalHenchmanIndex
      )
    }));

    return {
      id: scheme.id,
      setId: scheme.setId,
      name: scheme.name,
      aliases: scheme.aliases || [],
      constraints: scheme.constraints || { minimumPlayerCount: null },
      forcedGroups,
      modifiers: scheme.modifiers || [],
      notes: scheme.notes || []
    };
  });
}

export function normalizeGameData(source: CanonicalSourceData): PipelineRuntime {
  const cloneSource = structuredClone(source);
  const allVillainGroups: VillainGroupCard[] = [];
  const allHenchmanGroups: HenchmanGroupCard[] = [];
  const villainGroupsBySet = new Map<string, Map<string, VillainGroupCard[]>>();
  const henchmanGroupsBySet = new Map<string, Map<string, HenchmanGroupCard[]>>();

  cloneSource.sets.forEach((set) => {
    villainGroupsBySet.set(set.id, createNameIndex(set.villainGroups));
    henchmanGroupsBySet.set(set.id, createNameIndex(set.henchmanGroups));
    allVillainGroups.push(...set.villainGroups);
    allHenchmanGroups.push(...set.henchmanGroups);
  });

  const context: GroupResolutionContext = {
    villainGroupsBySet,
    henchmanGroupsBySet,
    globalVillainIndex: createNameIndex(allVillainGroups),
    globalHenchmanIndex: createNameIndex(allHenchmanGroups),
    allVillainGroups
  };

  // Build new runtime-shaped sets instead of mutating the source-typed arrays in
  // place. heroes / villainGroups / henchmanGroups are structurally compatible
  // with their runtime counterparts; masterminds and schemes are transformed.
  const runtimeSets: RuntimeGameSet[] = cloneSource.sets.map((set) => ({
    id: set.id,
    name: set.name,
    year: set.year,
    type: set.type,
    aliases: set.aliases,
    heroes: set.heroes,
    masterminds: normalizeMasterminds(set.masterminds, set, context),
    villainGroups: set.villainGroups,
    henchmanGroups: set.henchmanGroups,
    schemes: normalizeSchemes(set.schemes, set, context)
  }));

  const indexes = buildIndexes(runtimeSets);
  validateNormalizedData(runtimeSets, indexes);
  // PipelineRuntime.sets is exposed through the legacy GameSet[] contract that the
  // app-wide runtime consumers still rely on. The arrays now hold fully normalized
  // runtime entities, so a single boundary cast replaces the former per-field
  // ts-expect-error suppressions.
  return { sets: runtimeSets as unknown as GameSet[], indexes };
}
