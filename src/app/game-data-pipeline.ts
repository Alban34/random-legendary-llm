import type {
  SetType,
  GameSet,
  HeroCard,
  MastermindCard,
  VillainGroupCard,
  HenchmanGroupCard,
  SchemeCard,
  HeroRuntime,
  MastermindRuntime,
  VillainGroupRuntime,
  HenchmanGroupRuntime,
  SchemeRuntime
} from './types.ts';

// ---------------------------------------------------------------------------
// Local pipeline types
// ---------------------------------------------------------------------------

interface SeedCatalogEntry {
  name: string;
  year: number;
  type: SetType;
  aliases?: string[];
}

interface SeedData {
  setCatalog: SeedCatalogEntry[];
  rawCardData: Record<string, Array<Record<string, unknown>>>;
}

interface CanonicalSourceData {
  sets: GameSet[];
}

interface PipelineIndexes {
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

export interface PipelineRuntime {
  sets: GameSet[];
  indexes: PipelineIndexes;
}

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  error?: string;
}

interface EntityCounts {
  sets: number;
  heroes: number;
  masterminds: number;
  villainGroups: number;
  henchmanGroups: number;
  schemes: number;
}

export interface Epic1Bundle {
  seed: SeedData;
  source: CanonicalSourceData;
  runtime: PipelineRuntime;
  tests: TestResult[];
  counts: EntityCounts;
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

function clone<T>(value: T): T {
  return structuredClone(value);
}

function normalizeLookupName(value: unknown): string {
  return slugify(value);
}

// ---------------------------------------------------------------------------
// Build canonical source data
// ---------------------------------------------------------------------------

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

  const entityBuilders: Record<string, (item: Record<string, unknown>, set: GameSet) => unknown> = {
    heroes: (item, set): HeroCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      teams: (item['teams'] as string[]) || [],
      cardCount: (item['cardCount'] as number) ?? 14
    }),
    masterminds: (item, set): MastermindCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      leadName: (item['leadName'] as string) ?? null,
      leadCategory: (item['leadCategory'] as string) ?? null,
      notes: (item['notes'] as string[]) || []
    }),
    villainGroups: (item, set): VillainGroupCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      cardCount: (item['cardCount'] as number) ?? 8
    }),
    henchmanGroups: (item, set): HenchmanGroupCard => ({
      id: `${set.id}-${slugify(item['name'])}`,
      setId: set.id,
      name: item['name'] as string,
      aliases: (item['aliases'] as string[]) || [],
      cardCount: (item['cardCount'] as number) ?? 10
    }),
    schemes: (item, set): SchemeCard => ({
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
      const key = category === 'villainGroups' ? 'villainGroups' : category;
      // @ts-expect-error — dynamic property push into typed GameSet arrays
      set[key].push(entityBuilders[key](item, set));
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
    const key = normalizeLookupName(entity.name);
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
  const normalizedName = normalizeLookupName(reference);
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

export function normalizeGameData(source: CanonicalSourceData): PipelineRuntime {
  const cloneSource = clone(source);
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

  const globalVillainIndex = createNameIndex(allVillainGroups);
  const globalHenchmanIndex = createNameIndex(allHenchmanGroups);

  cloneSource.sets.forEach((set) => {
    // @ts-expect-error — replacing MastermindCard[] with MastermindRuntime[] shaped objects
    set.masterminds = set.masterminds.map((mastermind): MastermindRuntime => {
      const lead = (mastermind as MastermindCard).leadName
        ? resolveGroupReference(
            (mastermind as MastermindCard).leadName!,
            set.id,
            (mastermind as MastermindCard).leadCategory!,
            villainGroupsBySet,
            henchmanGroupsBySet,
            globalVillainIndex,
            globalHenchmanIndex
          )
        : null;
      return {
        id: mastermind.id,
        setId: mastermind.setId,
        name: mastermind.name,
        aliases: mastermind.aliases || [],
        lead,
        notes: (mastermind as MastermindCard).notes || []
      };
    });

    // @ts-expect-error — replacing SchemeCard[] with SchemeRuntime[] shaped objects
    set.schemes = set.schemes.map((scheme): SchemeRuntime => {
      const forcedGroups = ((scheme as SchemeCard).forcedGroups || []).map((groupRef) => ({
        ...resolveGroupReference(
          groupRef.name,
          set.id,
          groupRef.category,
          villainGroupsBySet,
          henchmanGroupsBySet,
          globalVillainIndex,
          globalHenchmanIndex
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
  });

  const indexes = buildIndexes(cloneSource.sets);
  validateNormalizedData(cloneSource.sets, indexes);
  return { sets: cloneSource.sets, indexes };
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
      indexes.heroesById[hero.id] = hero as HeroRuntime;
      indexes.allHeroes.push(hero as HeroRuntime);
    });
    // @ts-expect-error — masterminds array contains MastermindRuntime objects after normalization
    set.masterminds.forEach((mastermind: MastermindRuntime) => {
      indexes.mastermindsById[mastermind.id] = mastermind;
      indexes.allMasterminds.push(mastermind);
    });
    set.villainGroups.forEach((group) => {
      indexes.villainGroupsById[group.id] = group as VillainGroupRuntime;
      indexes.allVillainGroups.push(group as VillainGroupRuntime);
    });
    set.henchmanGroups.forEach((group) => {
      indexes.henchmanGroupsById[group.id] = group as HenchmanGroupRuntime;
      indexes.allHenchmanGroups.push(group as HenchmanGroupRuntime);
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

// ---------------------------------------------------------------------------
// Epic 1 tests
// ---------------------------------------------------------------------------

function assert(condition: unknown, message: string, details?: string): void {
  if (!condition) {
    throw new Error(details ? `${message} — ${details}` : message);
  }
}

export function runEpic1Tests(seed: SeedData, source: CanonicalSourceData, runtime: PipelineRuntime): TestResult[] {
  const tests: TestResult[] = [];

  function run(name: string, fn: () => void): void {
    try {
      fn();
      tests.push({ name, status: 'pass' });
    } catch (error) {
      tests.push({ name, status: 'fail', error: (error as Error).message });
    }
  }

  run('Included set inventory is present and count-aligned', () => {
    assert(source.sets.length === seed.setCatalog.length, 'Set count mismatch', `${source.sets.length} !== ${seed.setCatalog.length}`);
    seed.setCatalog.forEach((setEntry) => {
      assert(source.sets.some((set) => set.name === setEntry.name), 'Missing set', setEntry.name);
    });
  });

  run('Stable IDs are unique across every entity category', () => {
    validateNormalizedData(runtime.sets, runtime.indexes);
  });

  run('Duplicate names remain distinct through set-scoped IDs', () => {
    const blackWidows = runtime.indexes.allHeroes.filter((hero) => hero.name === 'Black Widow');
    const lokis = runtime.indexes.allMasterminds.filter((mastermind) => mastermind.name === 'Loki');
    const thors = runtime.indexes.allHeroes.filter((hero) => hero.name === 'Thor');
    assert(blackWidows.length >= 2, 'Expected duplicate Black Widow heroes');
    assert(new Set(blackWidows.map((hero) => hero.id)).size === blackWidows.length, 'Black Widow IDs collided');
    assert(lokis.length >= 2, 'Expected duplicate Loki masterminds');
    assert(new Set(lokis.map((entity) => entity.id)).size === lokis.length, 'Loki IDs collided');
    assert(thors.length >= 2, 'Expected duplicate Thor heroes');
  });

  run('Mastermind lead references resolve correctly', () => {
    const redSkull = runtime.indexes.allMasterminds.find((entity) => entity.name === 'Red Skull' && entity.setId === 'core-set');
    const drDoom = runtime.indexes.allMasterminds.find((entity) => entity.name === 'Dr. Doom');
    assert(redSkull?.lead?.category === 'villains', 'Red Skull lead not resolved');
    assert(drDoom?.lead?.category === 'henchmen', 'Dr. Doom lead not resolved as henchmen');
  });

  run('Scheme forced groups and modifiers normalize correctly', () => {
    const secretInvasion = runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters');
    const negativeZone = runtime.indexes.allSchemes.find((entity) => entity.name === 'Negative Zone Prison Breakout');
    assert(secretInvasion && secretInvasion.forcedGroups.length > 0, 'Secret Invasion missing forced group');
    // @ts-expect-error — modifiers are typed as unknown[] but have runtime shape
    assert(secretInvasion.modifiers.some((modifier) => modifier.type === 'set-min-heroes' && modifier.value === 6), 'Secret Invasion modifier missing');
    // @ts-expect-error — modifiers are typed as unknown[] but have runtime shape
    assert(negativeZone?.modifiers.some((modifier) => modifier.type === 'add-henchman-group'), 'Negative Zone modifier missing');
  });

  run('Runtime indexes match canonical entity totals', () => {
    const canonicalHeroCount = source.sets.reduce((sum, set) => sum + set.heroes.length, 0);
    const canonicalMastermindCount = source.sets.reduce((sum, set) => sum + set.masterminds.length, 0);
    const canonicalVillainCount = source.sets.reduce((sum, set) => sum + set.villainGroups.length, 0);
    const canonicalHenchmanCount = source.sets.reduce((sum, set) => sum + set.henchmanGroups.length, 0);
    const canonicalSchemeCount = source.sets.reduce((sum, set) => sum + set.schemes.length, 0);
    assert(runtime.indexes.allHeroes.length === canonicalHeroCount, 'Hero index total mismatch');
    assert(runtime.indexes.allMasterminds.length === canonicalMastermindCount, 'Mastermind index total mismatch');
    assert(runtime.indexes.allVillainGroups.length === canonicalVillainCount, 'Villain index total mismatch');
    assert(runtime.indexes.allHenchmanGroups.length === canonicalHenchmanCount, 'Henchman index total mismatch');
    assert(runtime.indexes.allSchemes.length === canonicalSchemeCount, 'Scheme index total mismatch');
  });

  run('Validation rejects representative invalid lead references', () => {
    const brokenSource = clone(source);
    const drDoom = brokenSource.sets
      .find((set) => set.id === 'core-set')!
      .masterminds.find((entity) => entity.name === 'Dr. Doom') as MastermindCard;
    drDoom.leadName = 'Definitely Missing Lead';
    let threw = false;
    try {
      normalizeGameData(brokenSource);
    } catch (error) {
      threw = /Missing henchmen reference|Missing villains reference|Missing/.test((error as Error).message);
    }
    assert(threw, 'Invalid lead reference did not trigger a validation failure');
  });

  return tests;
}

// ---------------------------------------------------------------------------
// createEpic1Bundle
// ---------------------------------------------------------------------------

export function createEpic1Bundle(seed: SeedData): Epic1Bundle {
  const source = buildCanonicalSourceData(seed);
  const runtime = normalizeGameData(source);
  const tests = runEpic1Tests(seed, source, runtime);
  const counts: EntityCounts = {
    sets: source.sets.length,
    heroes: runtime.indexes.allHeroes.length,
    masterminds: runtime.indexes.allMasterminds.length,
    villainGroups: runtime.indexes.allVillainGroups.length,
    henchmanGroups: runtime.indexes.allHenchmanGroups.length,
    schemes: runtime.indexes.allSchemes.length
  };

  return { seed, source, runtime, tests, counts };
}
