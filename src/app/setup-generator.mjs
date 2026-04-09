import { resolveSetupTemplate, summarizeSetupTemplate } from './setup-rules.mjs';

const DEFAULT_BYSTANDERS = 30;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function shuffle(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function getUsageStat(usageBucket, id) {
  return usageBucket?.[id] || { plays: 0, lastPlayedAt: null };
}

function getFreshnessKey(usageBucket, entity) {
  const usage = getUsageStat(usageBucket, entity.id);
  const neverPlayed = usage.plays === 0 && usage.lastPlayedAt === null;
  return [
    neverPlayed ? 0 : 1,
    usage.plays,
    usage.lastPlayedAt === null ? Number.NEGATIVE_INFINITY : Date.parse(usage.lastPlayedAt)
  ];
}

export function rankItemsByFreshness(items, usageBucket, random = Math.random) {
  const grouped = new Map();

  for (const item of items) {
    const key = JSON.stringify(getFreshnessKey(usageBucket, item));
    const list = grouped.get(key) || [];
    list.push(item);
    grouped.set(key, list);
  }

  return [...grouped.entries()]
    .sort((left, right) => {
      const leftKey = JSON.parse(left[0]);
      const rightKey = JSON.parse(right[0]);
      if (leftKey[0] !== rightKey[0]) return leftKey[0] - rightKey[0];
      if (leftKey[1] !== rightKey[1]) return leftKey[1] - rightKey[1];
      return leftKey[2] - rightKey[2];
    })
    .flatMap(([, list]) => shuffle(list, random));
}

function summarizeFallback(selected, usageBucket) {
  const fallbackItems = selected.filter((entity) => getUsageStat(usageBucket, entity.id).plays > 0);
  return {
    usedFallback: fallbackItems.length > 0,
    fallbackItems
  };
}

function selectFreshItems(items, count, usageBucket, random = Math.random, excludeIds = new Set()) {
  const ranked = rankItemsByFreshness(items.filter((entity) => !excludeIds.has(entity.id)), usageBucket, random);
  const selected = ranked.slice(0, count);
  return {
    selected,
    ...summarizeFallback(selected, usageBucket)
  };
}

function buildPoolFromSets(sets) {
  return sets.reduce((accumulator, set) => {
    accumulator.sets.push(set);
    accumulator.heroes.push(...set.heroes);
    accumulator.masterminds.push(...set.masterminds);
    accumulator.villainGroups.push(...set.villainGroups);
    accumulator.henchmanGroups.push(...set.henchmanGroups);
    accumulator.schemes.push(...set.schemes);
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

export function buildOwnedPools(runtime, ownedSetIds) {
  const ownedIdSet = new Set(ownedSetIds);
  const ownedSets = runtime.sets.filter((set) => ownedIdSet.has(set.id));
  return buildPoolFromSets(ownedSets);
}

function applyModifier(requirements, modifier, playerCount) {
  switch (modifier.type) {
    case 'add-hero':
      requirements.heroCount += modifier.amount || 0;
      break;
    case 'add-villain-group':
      requirements.villainGroupCount += modifier.amount || 0;
      break;
    case 'add-henchman-group':
      requirements.henchmanGroupCount += modifier.amount || 0;
      break;
    case 'conditional-add-villain-group':
      if ((modifier.playerCounts || []).includes(playerCount)) {
        requirements.villainGroupCount += modifier.amount || 0;
      }
      break;
    case 'set-min-heroes':
      requirements.heroCount = Math.max(requirements.heroCount, modifier.value || 0);
      break;
    case 'conditional-set-min-heroes':
      if ((modifier.playerCounts || []).includes(playerCount)) {
        requirements.heroCount = Math.max(requirements.heroCount, modifier.value || 0);
      }
      break;
    case 'set-bystanders':
      requirements.bystanders = modifier.value ?? requirements.bystanders;
      break;
    case 'replace-villain-group-with-specific-group':
      break;
    case 'require-hero-name-match-count':
      requirements.heroNameRequirements.push({
        pattern: modifier.pattern,
        value: modifier.value
      });
      break;
    default:
      break;
  }
}

export function applySchemeModifiersToTemplate(template, scheme) {
  const requirements = {
    heroCount: template.heroCount,
    villainGroupCount: template.villainGroupCount,
    henchmanGroupCount: template.henchmanGroupCount,
    wounds: template.wounds,
    bystanders: DEFAULT_BYSTANDERS,
    heroNameRequirements: []
  };

  for (const modifier of scheme.modifiers || []) {
    applyModifier(requirements, modifier, template.playerCount);
  }

  return requirements;
}

function createIdSet(entities) {
  return new Set(entities.map((entity) => entity.id));
}

function resolveForcedCollections(scheme, mastermind, pools) {
  const poolVillainIds = createIdSet(pools.villainGroups);
  const poolHenchmanIds = createIdSet(pools.henchmanGroups);
  const villainMap = new Map();
  const henchmanMap = new Map();

  for (const group of scheme.forcedGroups || []) {
    const source = group.category === 'villains' ? villainMap : henchmanMap;
    source.set(group.id, { id: group.id, forcedBy: 'scheme' });
  }

  if (mastermind.lead) {
    const source = mastermind.lead.category === 'villains' ? villainMap : henchmanMap;
    if (!source.has(mastermind.lead.id)) {
      source.set(mastermind.lead.id, { id: mastermind.lead.id, forcedBy: 'mastermind' });
    }
  }

  const forcedVillainIds = [...villainMap.values()];
  const forcedHenchmanIds = [...henchmanMap.values()];

  const allAvailable = forcedVillainIds.every((entry) => poolVillainIds.has(entry.id))
    && forcedHenchmanIds.every((entry) => poolHenchmanIds.has(entry.id));

  return {
    forcedVillainIds,
    forcedHenchmanIds,
    allAvailable
  };
}

function isSchemeEligibleForPlayerCount(scheme, playerCount) {
  return !scheme.constraints?.minimumPlayerCount || scheme.constraints.minimumPlayerCount <= playerCount;
}

function validateBaseCounts(pools, template) {
  const reasons = [];
  if (pools.heroes.length < template.heroCount) {
    reasons.push(`Need at least ${template.heroCount} heroes but only ${pools.heroes.length} are available.`);
  }
  if (pools.villainGroups.length < template.villainGroupCount) {
    reasons.push(`Need at least ${template.villainGroupCount} villain groups but only ${pools.villainGroups.length} are available.`);
  }
  if (pools.henchmanGroups.length < template.henchmanGroupCount) {
    reasons.push(`Need at least ${template.henchmanGroupCount} henchman groups but only ${pools.henchmanGroups.length} are available.`);
  }
  return reasons;
}

export function validateSetupLegality({ runtime, state, playerCount, advancedSolo = false }) {
  let template;
  try {
    template = resolveSetupTemplate(playerCount, advancedSolo);
  } catch (error) {
    return {
      ok: false,
      reasons: [error.message],
      template: null,
      pools: buildOwnedPools(runtime, state.collection.ownedSetIds),
      eligibleSchemes: []
    };
  }

  const pools = buildOwnedPools(runtime, state.collection.ownedSetIds);
  const reasons = [];

  if (pools.sets.length === 0) {
    reasons.push('No owned sets are currently selected.');
  }

  reasons.push(...validateBaseCounts(pools, template));

  const eligibleSchemes = pools.schemes.filter((scheme) => isSchemeEligibleForPlayerCount(scheme, template.playerCount));
  if (eligibleSchemes.length === 0) {
    reasons.push('No owned schemes are legal for the selected player count.');
  }

  return {
    ok: reasons.length === 0,
    reasons,
    template,
    pools,
    eligibleSchemes
  };
}

function canSatisfyHeroRequirements(heroes, requirements) {
  for (const requirement of requirements.heroNameRequirements) {
    const matcher = new RegExp(requirement.pattern, 'i');
    const matchingHeroes = heroes.filter((hero) => matcher.test(hero.name));
    const nonMatchingHeroes = heroes.filter((hero) => !matcher.test(hero.name));
    if (matchingHeroes.length < requirement.value) {
      return false;
    }
    if (nonMatchingHeroes.length < requirements.heroCount - requirement.value) {
      return false;
    }
  }
  return heroes.length >= requirements.heroCount;
}

function selectHeroes(heroes, requirements, usageBucket, random) {
  if (!requirements.heroNameRequirements.length) {
    return selectFreshItems(heroes, requirements.heroCount, usageBucket, random);
  }

  let selected = [];
  const selectedIds = new Set();
  let usedFallback = false;
  let fallbackItems = [];
  const restrictedPatterns = new Set(requirements.heroNameRequirements.map((requirement) => requirement.pattern));

  for (const requirement of requirements.heroNameRequirements) {
    const matcher = new RegExp(requirement.pattern, 'i');
    const matchingPool = heroes.filter((hero) => matcher.test(hero.name) && !selectedIds.has(hero.id));
    const result = selectFreshItems(matchingPool, requirement.value, usageBucket, random);
    if (result.selected.length < requirement.value) {
      return { selected: [], usedFallback: false, fallbackItems: [] };
    }
    selected.push(...result.selected);
    result.selected.forEach((hero) => selectedIds.add(hero.id));
    usedFallback = usedFallback || result.usedFallback;
    fallbackItems.push(...result.fallbackItems);
  }

  const remainingHeroCount = requirements.heroCount - selected.length;
  const generalPool = heroes.filter((hero) => {
    if (selectedIds.has(hero.id)) {
      return false;
    }
    return ![...restrictedPatterns].some((pattern) => new RegExp(pattern, 'i').test(hero.name));
  });
  const filler = selectFreshItems(generalPool, remainingHeroCount, usageBucket, random);
  if (filler.selected.length < remainingHeroCount) {
    return { selected: [], usedFallback: false, fallbackItems: [] };
  }

  selected = [...selected, ...filler.selected];
  usedFallback = usedFallback || filler.usedFallback;
  fallbackItems = [...fallbackItems, ...filler.fallbackItems];

  return { selected, usedFallback, fallbackItems };
}

function buildForcedDetails(entries, lookup) {
  return entries.map((entry) => ({
    ...lookup[entry.id],
    forced: true,
    forcedBy: entry.forcedBy
  }));
}

function buildRandomDetails(entities) {
  return entities.map((entity) => ({
    ...entity,
    forced: false,
    forcedBy: null
  }));
}

function buildCategorySelection(pools, requirements, scheme, mastermind, usageBucket, random) {
  const forced = resolveForcedCollections(scheme, mastermind, pools);
  if (!forced.allAvailable) {
    return null;
  }

  const forcedVillains = buildForcedDetails(forced.forcedVillainIds, Object.fromEntries(pools.villainGroups.map((entity) => [entity.id, entity])));
  const forcedHenchmen = buildForcedDetails(forced.forcedHenchmanIds, Object.fromEntries(pools.henchmanGroups.map((entity) => [entity.id, entity])));

  if (forcedVillains.length > requirements.villainGroupCount || forcedHenchmen.length > requirements.henchmanGroupCount) {
    return null;
  }

  const extraVillains = selectFreshItems(
    pools.villainGroups,
    requirements.villainGroupCount - forcedVillains.length,
    usageBucket.villainGroups,
    random,
    new Set(forcedVillains.map((entity) => entity.id))
  );
  if (extraVillains.selected.length !== requirements.villainGroupCount - forcedVillains.length) {
    return null;
  }

  const extraHenchmen = selectFreshItems(
    pools.henchmanGroups,
    requirements.henchmanGroupCount - forcedHenchmen.length,
    usageBucket.henchmanGroups,
    random,
    new Set(forcedHenchmen.map((entity) => entity.id))
  );
  if (extraHenchmen.selected.length !== requirements.henchmanGroupCount - forcedHenchmen.length) {
    return null;
  }

  return {
    villainGroups: [...forcedVillains, ...buildRandomDetails(extraVillains.selected)],
    henchmanGroups: [...forcedHenchmen, ...buildRandomDetails(extraHenchmen.selected)],
    fallback: {
      villainGroups: extraVillains.fallbackItems,
      henchmanGroups: extraHenchmen.fallbackItems
    }
  };
}

function createGeneratorNotices({ schemeFallback, mastermindFallback, heroFallback, categoryFallback }) {
  const notices = [];
  if (schemeFallback.length) {
    notices.push(`Least-played fallback used for Scheme selection: ${schemeFallback.map((entity) => entity.name).join(', ')}.`);
  }
  if (mastermindFallback.length) {
    notices.push(`Least-played fallback used for Mastermind selection: ${mastermindFallback.map((entity) => entity.name).join(', ')}.`);
  }
  if (heroFallback.length) {
    notices.push(`Least-played fallback used for Hero selection: ${heroFallback.map((entity) => entity.name).join(', ')}.`);
  }
  if (categoryFallback.villainGroups.length) {
    notices.push(`Least-played fallback used for Villain Groups: ${categoryFallback.villainGroups.map((entity) => entity.name).join(', ')}.`);
  }
  if (categoryFallback.henchmanGroups.length) {
    notices.push(`Least-played fallback used for Henchman Groups: ${categoryFallback.henchmanGroups.map((entity) => entity.name).join(', ')}.`);
  }
  return notices;
}

function summarizeRequirements(template, effectiveRequirements) {
  return {
    ...summarizeSetupTemplate(template),
    heroCount: effectiveRequirements.heroCount,
    villainGroupCount: effectiveRequirements.villainGroupCount,
    henchmanGroupCount: effectiveRequirements.henchmanGroupCount,
    wounds: effectiveRequirements.wounds,
    bystanders: effectiveRequirements.bystanders
  };
}

export function generateSetup({ runtime, state, playerCount, advancedSolo = false, random = Math.random }) {
  const legality = validateSetupLegality({ runtime, state, playerCount, advancedSolo });
  if (!legality.ok) {
    throw new Error(legality.reasons.join(' '));
  }

  const { template, pools, eligibleSchemes } = legality;
  const schemeSelection = selectFreshItems(eligibleSchemes, eligibleSchemes.length, state.usage.schemes, random);

  for (const scheme of schemeSelection.selected) {
    const effectiveRequirements = applySchemeModifiersToTemplate(template, scheme);
    if (!canSatisfyHeroRequirements(pools.heroes, effectiveRequirements)) {
      continue;
    }

    const mastermindRanking = selectFreshItems(pools.masterminds, pools.masterminds.length, state.usage.masterminds, random);
    for (const mastermind of mastermindRanking.selected) {
      const categorySelection = buildCategorySelection(pools, effectiveRequirements, scheme, mastermind, state.usage, random);
      if (!categorySelection) {
        continue;
      }

      const heroSelection = selectHeroes(pools.heroes, effectiveRequirements, state.usage.heroes, random);
      if (heroSelection.selected.length !== effectiveRequirements.heroCount) {
        continue;
      }

      const leadEntity = mastermind.lead
        ? (mastermind.lead.category === 'villains'
            ? runtime.indexes.villainGroupsById[mastermind.lead.id]
            : runtime.indexes.henchmanGroupsById[mastermind.lead.id])
        : null;

      const notices = createGeneratorNotices({
        schemeFallback: schemeSelection.selected[0]?.id === scheme.id && schemeSelection.fallbackItems.length ? [scheme] : [],
        mastermindFallback: mastermindRanking.fallbackItems.some((entity) => entity.id === mastermind.id) ? [mastermind] : [],
        heroFallback: heroSelection.fallbackItems,
        categoryFallback: categorySelection.fallback
      });

      return {
        template: summarizeSetupTemplate(template),
        requirements: summarizeRequirements(template, effectiveRequirements),
        scheme: {
          ...scheme,
          notes: [...scheme.notes]
        },
        mastermind: {
          ...mastermind,
          leadEntity
        },
        heroes: heroSelection.selected,
        villainGroups: categorySelection.villainGroups,
        henchmanGroups: categorySelection.henchmanGroups,
        setupSnapshot: {
          mastermindId: mastermind.id,
          schemeId: scheme.id,
          heroIds: heroSelection.selected.map((entity) => entity.id),
          villainGroupIds: categorySelection.villainGroups.map((entity) => entity.id),
          henchmanGroupIds: categorySelection.henchmanGroups.map((entity) => entity.id)
        },
        notices,
        fallbackUsed: notices.length > 0,
        legalSchemesCount: eligibleSchemes.length
      };
    }
  }

  throw new Error('No legal setup could be generated from the current owned collection for the selected player count.');
}

export function buildHistoryReadySetupSnapshot(setup) {
  return deepClone(setup.setupSnapshot);
}

