export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase();
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeLookupName(value) {
  return slugify(value);
}

export function buildCanonicalSourceData(seed) {
  const setsByName = new Map();
  const source = { sets: [] };

  seed.setCatalog.forEach((entry) => {
    const setId = slugify(entry.name);
    const set = {
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
    heroes: (item, set) => ({
      id: `${set.id}-${slugify(item.name)}`,
      setId: set.id,
      name: item.name,
      aliases: item.aliases || [],
      teams: item.teams || [],
      cardCount: item.cardCount ?? 14
    }),
    masterminds: (item, set) => ({
      id: `${set.id}-${slugify(item.name)}`,
      setId: set.id,
      name: item.name,
      aliases: item.aliases || [],
      leadName: item.leadName ?? null,
      leadCategory: item.leadCategory ?? null,
      notes: item.notes || []
    }),
    villainGroups: (item, set) => ({
      id: `${set.id}-${slugify(item.name)}`,
      setId: set.id,
      name: item.name,
      aliases: item.aliases || [],
      cardCount: item.cardCount ?? 8
    }),
    henchmanGroups: (item, set) => ({
      id: `${set.id}-${slugify(item.name)}`,
      setId: set.id,
      name: item.name,
      aliases: item.aliases || [],
      cardCount: item.cardCount ?? 10
    }),
    schemes: (item, set) => ({
      id: `${set.id}-${slugify(item.name)}`,
      setId: set.id,
      name: item.name,
      aliases: item.aliases || [],
      constraints: item.constraints || { minimumPlayerCount: null },
      forcedGroups: item.forcedGroups || [],
      modifiers: item.modifiers || [],
      notes: item.notes || []
    })
  };

  Object.entries(seed.rawCardData).forEach(([category, items]) => {
    items.forEach((item) => {
      const set = setsByName.get(item.setName);
      if (!set) {
        throw new Error(`Unknown set name in seed: ${item.setName}`);
      }
      const key = category === 'villainGroups' ? 'villainGroups' : category;
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

function createNameIndex(entities) {
  const index = new Map();
  entities.forEach((entity) => {
    const key = normalizeLookupName(entity.name);
    const list = index.get(key) || [];
    list.push(entity);
    index.set(key, list);
  });
  return index;
}

function getCategoryMatches(reference, sourceSetId, category, villainGroupsBySet, henchmanGroupsBySet, globalVillainIndex, globalHenchmanIndex) {
  const normalizedName = normalizeLookupName(reference);
  const sameSetIndex = category === 'villains' ? villainGroupsBySet : henchmanGroupsBySet;
  const globalIndex = category === 'villains' ? globalVillainIndex : globalHenchmanIndex;
  const sameSetMatches = (sameSetIndex.get(sourceSetId) && sameSetIndex.get(sourceSetId).get(normalizedName)) || [];
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

function resolveGroupReference(reference, sourceSetId, preferredCategory, villainGroupsBySet, henchmanGroupsBySet, globalVillainIndex, globalHenchmanIndex) {
  const searchOrder = preferredCategory === 'henchmen'
    ? ['henchmen', 'villains']
    : preferredCategory === 'villains'
      ? ['villains', 'henchmen']
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

export function normalizeGameData(source) {
  const cloneSource = clone(source);
  const allVillainGroups = [];
  const allHenchmanGroups = [];
  const villainGroupsBySet = new Map();
  const henchmanGroupsBySet = new Map();

  cloneSource.sets.forEach((set) => {
    villainGroupsBySet.set(set.id, createNameIndex(set.villainGroups));
    henchmanGroupsBySet.set(set.id, createNameIndex(set.henchmanGroups));
    allVillainGroups.push(...set.villainGroups);
    allHenchmanGroups.push(...set.henchmanGroups);
  });

  const globalVillainIndex = createNameIndex(allVillainGroups);
  const globalHenchmanIndex = createNameIndex(allHenchmanGroups);

  cloneSource.sets.forEach((set) => {
    set.masterminds = set.masterminds.map((mastermind) => {
      const lead = mastermind.leadName
        ? resolveGroupReference(
            mastermind.leadName,
            set.id,
            mastermind.leadCategory,
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
        notes: mastermind.notes || []
      };
    });

    set.schemes = set.schemes.map((scheme) => {
      const forcedGroups = (scheme.forcedGroups || []).map((groupRef) => ({
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

export function buildIndexes(sets) {
  const indexes = {
    setsById: {},
    heroesById: {},
    mastermindsById: {},
    villainGroupsById: {},
    henchmanGroupsById: {},
    schemesById: {},
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
    set.masterminds.forEach((mastermind) => {
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
    set.schemes.forEach((scheme) => {
      indexes.schemesById[scheme.id] = scheme;
      indexes.allSchemes.push(scheme);
    });
  });

  return indexes;
}

export function validateNormalizedData(sets, indexes) {
  const uniqueBuckets = [
    ['set', sets.map((set) => set.id)],
    ['hero', indexes.allHeroes.map((entity) => entity.id)],
    ['mastermind', indexes.allMasterminds.map((entity) => entity.id)],
    ['villain-group', indexes.allVillainGroups.map((entity) => entity.id)],
    ['henchman-group', indexes.allHenchmanGroups.map((entity) => entity.id)],
    ['scheme', indexes.allSchemes.map((entity) => entity.id)]
  ];

  uniqueBuckets.forEach(([label, ids]) => {
    const seen = new Set();
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

function assert(condition, message, details) {
  if (!condition) {
    throw new Error(details ? `${message} — ${details}` : message);
  }
}

export function runEpic1Tests(seed, source, runtime) {
  const tests = [];

  function run(name, fn) {
    try {
      fn();
      tests.push({ name, status: 'pass' });
    } catch (error) {
      tests.push({ name, status: 'fail', error: error.message });
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
    assert(redSkull && redSkull.lead && redSkull.lead.category === 'villains', 'Red Skull lead not resolved');
    assert(drDoom && drDoom.lead && drDoom.lead.category === 'henchmen', 'Dr. Doom lead not resolved as henchmen');
  });

  run('Scheme forced groups and modifiers normalize correctly', () => {
    const secretInvasion = runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters');
    const negativeZone = runtime.indexes.allSchemes.find((entity) => entity.name === 'Negative Zone Prison Breakout');
    assert(secretInvasion && secretInvasion.forcedGroups.length > 0, 'Secret Invasion missing forced group');
    assert(secretInvasion.modifiers.some((modifier) => modifier.type === 'set-min-heroes' && modifier.value === 6), 'Secret Invasion modifier missing');
    assert(negativeZone && negativeZone.modifiers.some((modifier) => modifier.type === 'add-henchman-group'), 'Negative Zone modifier missing');
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
      .find((set) => set.id === 'core-set')
      .masterminds.find((entity) => entity.name === 'Dr. Doom');
    drDoom.leadName = 'Definitely Missing Lead';
    let threw = false;
    try {
      normalizeGameData(brokenSource);
    } catch (error) {
      threw = /Missing henchmen reference|Missing villains reference|Missing/.test(error.message);
    }
    assert(threw, 'Invalid lead reference did not trigger a validation failure');
  });

  return tests;
}

export function createEpic1Bundle(seed) {
  const source = buildCanonicalSourceData(seed);
  const runtime = normalizeGameData(source);
  const tests = runEpic1Tests(seed, source, runtime);
  const counts = {
    sets: source.sets.length,
    heroes: runtime.indexes.allHeroes.length,
    masterminds: runtime.indexes.allMasterminds.length,
    villainGroups: runtime.indexes.allVillainGroups.length,
    henchmanGroups: runtime.indexes.allHenchmanGroups.length,
    schemes: runtime.indexes.allSchemes.length
  };

  return { seed, source, runtime, tests, counts };
}

