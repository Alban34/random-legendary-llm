import { hasForcedPicks, normalizeForcedPicks } from './forced-picks-utils.mjs';
import { deepClone } from './object-utils.mjs';
import { resolveSetupTemplate, summarizeSetupTemplate } from './setup-rules.mjs';

const DEFAULT_BYSTANDERS = 30;

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
    const key = getFreshnessKey(usageBucket, item);
    const keyStr = `${key[0]}|${key[1]}`;
    if (!grouped.has(keyStr)) {
      grouped.set(keyStr, { key, list: [] });
    }
    grouped.get(keyStr).list.push(item);
  }

  return [...grouped.values()]
    .sort((left, right) => {
      if (left.key[0] !== right.key[0]) return left.key[0] - right.key[0];
      return left.key[1] - right.key[1];
    })
    .flatMap(({ list }) => shuffle(list, random));
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

function appendForcedReason(map, id, reason) {
  const existing = map.get(id);
  if (!existing) {
    map.set(id, { id, reasons: [reason] });
    return;
  }

  if (!existing.reasons.includes(reason)) {
    existing.reasons.push(reason);
  }
}

function validateForcedPickAvailability(forcedPicks, pools, template, eligibleSchemes) {
  const reasons = [];
  const schemesById = Object.fromEntries(pools.schemes.map((entity) => [entity.id, entity]));
  const mastermindsById = Object.fromEntries(pools.masterminds.map((entity) => [entity.id, entity]));
  const heroesById = Object.fromEntries(pools.heroes.map((entity) => [entity.id, entity]));
  const villainGroupsById = Object.fromEntries(pools.villainGroups.map((entity) => [entity.id, entity]));
  const henchmanGroupsById = Object.fromEntries(pools.henchmanGroups.map((entity) => [entity.id, entity]));

  if (forcedPicks.schemeId && !schemesById[forcedPicks.schemeId]) {
    reasons.push(`Forced Scheme is not owned in the current collection: ${forcedPicks.schemeId}.`);
  }

  if (forcedPicks.mastermindId && !mastermindsById[forcedPicks.mastermindId]) {
    reasons.push(`Forced Mastermind is not owned in the current collection: ${forcedPicks.mastermindId}.`);
  }

  const missingHeroIds = forcedPicks.heroIds.filter((id) => !heroesById[id]);
  if (missingHeroIds.length) {
    reasons.push(`Forced Heroes are not owned in the current collection: ${missingHeroIds.join(', ')}.`);
  }

  const missingVillainIds = forcedPicks.villainGroupIds.filter((id) => !villainGroupsById[id]);
  if (missingVillainIds.length) {
    reasons.push(`Forced Villain Groups are not owned in the current collection: ${missingVillainIds.join(', ')}.`);
  }

  const missingHenchmanIds = forcedPicks.henchmanGroupIds.filter((id) => !henchmanGroupsById[id]);
  if (missingHenchmanIds.length) {
    reasons.push(`Forced Henchman Groups are not owned in the current collection: ${missingHenchmanIds.join(', ')}.`);
  }

  if (forcedPicks.schemeId && !eligibleSchemes.some((scheme) => scheme.id === forcedPicks.schemeId)) {
    reasons.push(`Forced Scheme is not legal for the selected play mode: ${schemesById[forcedPicks.schemeId]?.name || forcedPicks.schemeId}.`);
  }

  if (forcedPicks.heroIds.length > template.heroCount) {
    reasons.push(`Forced Heroes exceed the base Hero slots for this setup mode (${forcedPicks.heroIds.length}/${template.heroCount}).`);
  }

  // Count mastermind villain lead toward the villain group slot limit
  const forcedMastermind = forcedPicks.mastermindId ? mastermindsById[forcedPicks.mastermindId] : null;
  const mastermindLeadIsVillain = forcedMastermind?.lead?.category === 'villains';
  const mastermindLeadVillainAlreadyForced =
    mastermindLeadIsVillain && forcedPicks.villainGroupIds.includes(forcedMastermind.lead.id);
  const mastermindLeadVillainGroupCount = mastermindLeadIsVillain && !mastermindLeadVillainAlreadyForced ? 1 : 0;
  const effectiveForcedVillainCount = forcedPicks.villainGroupIds.length + mastermindLeadVillainGroupCount;

  if (effectiveForcedVillainCount > template.villainGroupCount) {
    reasons.push(`Forced Villain Groups (including mastermind lead) exceed the base Villain Group slots for this setup mode (${effectiveForcedVillainCount}/${template.villainGroupCount}).`);
  }

  const mastermindLeadIsHenchman = forcedMastermind?.lead?.category === 'henchmen';
  const mastermindLeadHenchmanAlreadyForced =
    mastermindLeadIsHenchman && forcedPicks.henchmanGroupIds.includes(forcedMastermind.lead.id);
  const mastermindLeadHenchmanGroupCount = mastermindLeadIsHenchman && !mastermindLeadHenchmanAlreadyForced ? 1 : 0;
  const effectiveForcedHenchmanCount = forcedPicks.henchmanGroupIds.length + mastermindLeadHenchmanGroupCount;

  if (effectiveForcedHenchmanCount > template.henchmanGroupCount) {
    reasons.push(`Forced Henchman Groups (including mastermind lead) exceed the base Henchman Group slots for this setup mode (${effectiveForcedHenchmanCount}/${template.henchmanGroupCount}).`);
  }

  return reasons;
}

const SOLO_PLAY_MODES = new Set(['advanced-solo', 'two-handed-solo', 'standard-solo-v2']);

function resolveForcedCollections(scheme, mastermind, pools, forcedPicks, template) {
  const poolVillainIds = createIdSet(pools.villainGroups);
  const poolHenchmanIds = createIdSet(pools.henchmanGroups);
  const villainMap = new Map();
  const henchmanMap = new Map();

  for (const groupId of forcedPicks.villainGroupIds) {
    appendForcedReason(villainMap, groupId, 'constraint');
  }

  for (const groupId of forcedPicks.henchmanGroupIds) {
    appendForcedReason(henchmanMap, groupId, 'constraint');
  }

  for (const group of scheme.forcedGroups || []) {
    const source = group.category === 'villains' ? villainMap : henchmanMap;
    appendForcedReason(source, group.id, 'scheme');
  }

  if (mastermind.lead && !SOLO_PLAY_MODES.has(template.playMode)) {
    const source = mastermind.lead.category === 'villains' ? villainMap : henchmanMap;
    appendForcedReason(source, mastermind.lead.id, 'mastermind');
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

function isSchemeEligibleForTemplate(scheme, template) {
  if (scheme.constraints?.minimumPlayerCount && scheme.constraints.minimumPlayerCount > template.playerCount) {
    return false;
  }
  const effectiveModeKey = template.playMode === 'standard' && template.playerCount === 1
    ? 'standard-solo'
    : template.playMode;
  if (scheme.constraints?.incompatiblePlayModes?.includes(effectiveModeKey)) {
    return false;
  }
  return true;
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

export function validateSetupLegality({ runtime, state, playerCount, advancedSolo = false, playMode, forcedPicks }) {
  const activeSetIds = state.collection.activeSetIds ?? null;
  const effectiveSetIds = Array.isArray(activeSetIds) ? activeSetIds : state.collection.ownedSetIds;

  let template;
  try {
    template = resolveSetupTemplate(playerCount, { advancedSolo, playMode });
  } catch (error) {
    return {
      ok: false,
      reasons: [error.message],
      template: null,
      pools: buildOwnedPools(runtime, effectiveSetIds),
      eligibleSchemes: []
    };
  }

  const pools = buildOwnedPools(runtime, effectiveSetIds);
  const reasons = [];
  const normalizedForcedPicks = normalizeForcedPicks(forcedPicks);

  if (pools.sets.length === 0) {
    reasons.push('No owned sets are currently selected.');
  }

  reasons.push(...validateBaseCounts(pools, template));

  const eligibleSchemes = pools.schemes.filter((scheme) => isSchemeEligibleForTemplate(scheme, template));
  if (eligibleSchemes.length === 0) {
    reasons.push('No owned schemes are legal for the selected player count.');
  }

  reasons.push(...validateForcedPickAvailability(normalizedForcedPicks, pools, template, eligibleSchemes));

  return {
    ok: reasons.length === 0,
    reasons,
    template,
    pools,
    eligibleSchemes,
    forcedPicks: normalizedForcedPicks
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

function selectHeroes(heroes, requirements, usageBucket, random, forcedHeroIds = []) {
  const heroMap = Object.fromEntries(heroes.map((hero) => [hero.id, hero]));
  const forcedHeroes = forcedHeroIds.map((id) => heroMap[id]).filter(Boolean);
  if (forcedHeroes.length !== forcedHeroIds.length) {
    return { selected: [], usedFallback: false, fallbackItems: [], reason: 'One or more forced Heroes are unavailable in the current owned collection.' };
  }

  if (forcedHeroes.length > requirements.heroCount) {
    return {
      selected: [],
      usedFallback: false,
      fallbackItems: [],
      reason: `Forced Heroes exceed the available Hero slots for this setup (${forcedHeroes.length}/${requirements.heroCount}).`
    };
  }

  let selected = [...forcedHeroes];
  const selectedIds = new Set(selected.map((hero) => hero.id));

  if (!requirements.heroNameRequirements.length) {
    const filler = selectFreshItems(heroes, requirements.heroCount - forcedHeroes.length, usageBucket, random, selectedIds);
    if (filler.selected.length !== requirements.heroCount - forcedHeroes.length) {
      return { selected: [], usedFallback: false, fallbackItems: [], reason: 'Not enough remaining Heroes are available after applying the forced picks.' };
    }

    return {
      selected: [...forcedHeroes, ...filler.selected],
      usedFallback: filler.usedFallback,
      fallbackItems: filler.fallbackItems,
      reason: null
    };
  }

  let usedFallback = false;
  let fallbackItems = [];
  const restrictedPatterns = new Set(requirements.heroNameRequirements.map((requirement) => requirement.pattern));

  for (const requirement of requirements.heroNameRequirements) {
    const matcher = new RegExp(requirement.pattern, 'i');
    const alreadyMatching = selected.filter((hero) => matcher.test(hero.name)).length;
    const requiredAdditionalMatches = Math.max(0, requirement.value - alreadyMatching);
    const remainingSlots = requirements.heroCount - selected.length;
    if (requiredAdditionalMatches > remainingSlots) {
      return {
        selected: [],
        usedFallback: false,
        fallbackItems: [],
        reason: 'Forced Hero selections leave no legal way to satisfy this scheme\'s Hero requirements.'
      };
    }

    const matchingPool = heroes.filter((hero) => matcher.test(hero.name) && !selectedIds.has(hero.id));
    const result = selectFreshItems(matchingPool, requiredAdditionalMatches, usageBucket, random);
    if (result.selected.length < requiredAdditionalMatches) {
      return {
        selected: [],
        usedFallback: false,
        fallbackItems: [],
        reason: 'Forced Hero selections leave no legal way to satisfy this scheme\'s Hero requirements.'
      };
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
    return { selected: [], usedFallback: false, fallbackItems: [], reason: 'Not enough remaining Heroes are available after applying the forced picks.' };
  }

  selected = [...selected, ...filler.selected];
  usedFallback = usedFallback || filler.usedFallback;
  fallbackItems = [...fallbackItems, ...filler.fallbackItems];

  return { selected, usedFallback, fallbackItems, reason: null };
}

function buildForcedDetails(entries, lookup) {
  return entries.map((entry) => ({
    ...lookup[entry.id],
    forced: true,
    forcedBy: entry.reasons.length === 1 ? entry.reasons[0] : entry.reasons,
    forcedReasons: [...entry.reasons]
  }));
}

function buildRandomDetails(entities) {
  return entities.map((entity) => ({
    ...entity,
    forced: false,
    forcedBy: null
  }));
}

function buildCategorySelection(pools, requirements, scheme, mastermind, usageBucket, random, forcedPicks, template) {
  const forced = resolveForcedCollections(scheme, mastermind, pools, forcedPicks, template);
  if (!forced.allAvailable) {
    return { selection: null, reason: 'One or more forced Villain Group or Henchman Group picks are unavailable in the current owned collection.' };
  }

  const forcedVillains = buildForcedDetails(forced.forcedVillainIds, Object.fromEntries(pools.villainGroups.map((entity) => [entity.id, entity])));
  const forcedHenchmen = buildForcedDetails(forced.forcedHenchmanIds, Object.fromEntries(pools.henchmanGroups.map((entity) => [entity.id, entity])));

  if (forcedVillains.length > requirements.villainGroupCount) {
    return {
      selection: null,
      reason: `Forced Villain Groups exceed the available slots once scheme and mastermind requirements are applied (${forcedVillains.length}/${requirements.villainGroupCount}).`
    };
  }

  if (forcedHenchmen.length > requirements.henchmanGroupCount) {
    return {
      selection: null,
      reason: `Forced Henchman Groups exceed the available slots once scheme and mastermind requirements are applied (${forcedHenchmen.length}/${requirements.henchmanGroupCount}).`
    };
  }

  const extraVillains = selectFreshItems(
    pools.villainGroups,
    requirements.villainGroupCount - forcedVillains.length,
    usageBucket.villainGroups,
    random,
    new Set(forcedVillains.map((entity) => entity.id))
  );
  if (extraVillains.selected.length !== requirements.villainGroupCount - forcedVillains.length) {
    return { selection: null, reason: 'Not enough remaining Villain Groups are available after applying the forced picks.' };
  }

  const extraHenchmen = selectFreshItems(
    pools.henchmanGroups,
    requirements.henchmanGroupCount - forcedHenchmen.length,
    usageBucket.henchmanGroups,
    random,
    new Set(forcedHenchmen.map((entity) => entity.id))
  );
  if (extraHenchmen.selected.length !== requirements.henchmanGroupCount - forcedHenchmen.length) {
    return { selection: null, reason: 'Not enough remaining Henchman Groups are available after applying the forced picks.' };
  }

  return {
    selection: {
      villainGroups: [...forcedVillains, ...buildRandomDetails(extraVillains.selected)],
      henchmanGroups: [...forcedHenchmen, ...buildRandomDetails(extraHenchmen.selected)],
      fallback: {
        villainGroups: extraVillains.fallbackItems,
        henchmanGroups: extraHenchmen.fallbackItems
      }
    }
  };
}

function createGeneratorNotices({ schemeFallback, mastermindFallback, heroFallback, categoryFallback, forcedConstraintSummary }) {
  const notices = [];
  if (forcedConstraintSummary.length) {
    notices.push(`Applied forced picks: ${forcedConstraintSummary.join('; ')}.`);
  }
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

function buildForcedConstraintSummary(forcedPicks, setup) {
  const parts = [];

  if (forcedPicks.schemeId) {
    parts.push(`Scheme ${setup.scheme.name}`);
  }

  if (forcedPicks.mastermindId) {
    parts.push(`Mastermind ${setup.mastermind.name}`);
  }

  if (forcedPicks.heroIds.length) {
    parts.push(`Heroes ${setup.heroes.filter((hero) => forcedPicks.heroIds.includes(hero.id)).map((hero) => hero.name).join(', ')}`);
  }

  if (forcedPicks.villainGroupIds.length) {
    parts.push(`Villain Groups ${setup.villainGroups.filter((group) => forcedPicks.villainGroupIds.includes(group.id)).map((group) => group.name).join(', ')}`);
  }

  if (forcedPicks.henchmanGroupIds.length) {
    parts.push(`Henchman Groups ${setup.henchmanGroups.filter((group) => forcedPicks.henchmanGroupIds.includes(group.id)).map((group) => group.name).join(', ')}`);
  }

  return parts.filter(Boolean);
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

function selectScheme(eligibleSchemes, normalizedForcedPicks, usageSchemes, random) {
  if (normalizedForcedPicks.schemeId) {
    return { selected: eligibleSchemes.filter((scheme) => scheme.id === normalizedForcedPicks.schemeId), fallbackItems: [] };
  }
  return selectFreshItems(eligibleSchemes, eligibleSchemes.length, usageSchemes, random);
}

function selectMastermind(pools, normalizedForcedPicks, usageMasterminds, random) {
  if (normalizedForcedPicks.mastermindId) {
    return { selected: pools.masterminds.filter((mastermind) => mastermind.id === normalizedForcedPicks.mastermindId), fallbackItems: [] };
  }
  return selectFreshItems(pools.masterminds, pools.masterminds.length, usageMasterminds, random);
}

function resolveLeadEntity(mastermind, runtime) {
  if (!mastermind.lead) {
    return null;
  }
  return mastermind.lead.category === 'villains'
    ? runtime.indexes.villainGroupsById[mastermind.lead.id]
    : runtime.indexes.henchmanGroupsById[mastermind.lead.id];
}

function tryMastermindForScheme(mastermind, { mastermindRanking, scheme, schemeSelection, pools, effectiveRequirements, normalizedForcedPicks, state, runtime, random, constraintFailureReasons, eligibleSchemes, template }) {
  const categorySelection = buildCategorySelection(pools, effectiveRequirements, scheme, mastermind, state.usage, random, normalizedForcedPicks, template);
  if (!categorySelection.selection) {
    if (categorySelection.reason) {
      constraintFailureReasons.add(categorySelection.reason);
    }
    return null;
  }

  const heroSelection = selectHeroes(pools.heroes, effectiveRequirements, state.usage.heroes, random, normalizedForcedPicks.heroIds);
  if (heroSelection.selected.length !== effectiveRequirements.heroCount) {
    if (heroSelection.reason) {
      constraintFailureReasons.add(heroSelection.reason);
    }
    return null;
  }

  const leadEntity = resolveLeadEntity(mastermind, runtime);
  const notices = createGeneratorNotices({
    forcedConstraintSummary: buildForcedConstraintSummary(normalizedForcedPicks, {
      scheme,
      mastermind,
      heroes: heroSelection.selected,
      villainGroups: categorySelection.selection.villainGroups,
      henchmanGroups: categorySelection.selection.henchmanGroups
    }),
    schemeFallback: !normalizedForcedPicks.schemeId && schemeSelection.fallbackItems.some((s) => s.id === scheme.id) ? [scheme] : [],
    mastermindFallback: !normalizedForcedPicks.mastermindId && mastermindRanking.fallbackItems.some((entity) => entity.id === mastermind.id) ? [mastermind] : [],
    heroFallback: heroSelection.fallbackItems,
    categoryFallback: categorySelection.selection.fallback
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
    villainGroups: categorySelection.selection.villainGroups,
    henchmanGroups: categorySelection.selection.henchmanGroups,
    setupSnapshot: {
      mastermindId: mastermind.id,
      schemeId: scheme.id,
      heroIds: heroSelection.selected.map((entity) => entity.id),
      villainGroupIds: categorySelection.selection.villainGroups.map((entity) => entity.id),
      henchmanGroupIds: categorySelection.selection.henchmanGroups.map((entity) => entity.id)
    },
    forcedPicks: normalizedForcedPicks,
    notices,
    fallbackUsed: notices.length > 0,
    legalSchemesCount: eligibleSchemes.length
  };
}

function trySchemeForSetup(scheme, { schemeSelection, pools, template, normalizedForcedPicks, state, runtime, random, hasConstraintSelections, constraintFailureReasons, eligibleSchemes }) {
  const effectiveRequirements = applySchemeModifiersToTemplate(template, scheme);
  if (!canSatisfyHeroRequirements(pools.heroes, effectiveRequirements)) {
    if (hasConstraintSelections && normalizedForcedPicks.heroIds.length) {
      constraintFailureReasons.add('Forced Hero selections cannot satisfy the Hero requirements created by the current scheme and play mode.');
    }
    return null;
  }

  const mastermindRanking = selectMastermind(pools, normalizedForcedPicks, state.usage.masterminds, random);
  for (const mastermind of mastermindRanking.selected) {
    const result = tryMastermindForScheme(mastermind, { mastermindRanking, scheme, schemeSelection, pools, effectiveRequirements, normalizedForcedPicks, state, runtime, random, constraintFailureReasons, eligibleSchemes, template });
    if (result) {
      return result;
    }
  }
  return null;
}

export function generateSetup({ runtime, state, playerCount, advancedSolo = false, playMode, forcedPicks, random = Math.random }) {
  const legality = validateSetupLegality({ runtime, state, playerCount, advancedSolo, playMode, forcedPicks });
  if (!legality.ok) {
    throw new Error(legality.reasons.join(' '));
  }

  const { template, pools, eligibleSchemes, forcedPicks: normalizedForcedPicks } = legality;
  const hasConstraintSelections = hasForcedPicks(normalizedForcedPicks);
  const constraintFailureReasons = new Set();
  const schemeSelection = selectScheme(eligibleSchemes, normalizedForcedPicks, state.usage.schemes, random);

  for (const scheme of schemeSelection.selected) {
    const result = trySchemeForSetup(scheme, { schemeSelection, pools, template, normalizedForcedPicks, state, runtime, random, hasConstraintSelections, constraintFailureReasons, eligibleSchemes });
    if (result) {
      return result;
    }
  }

  if (hasConstraintSelections && constraintFailureReasons.size) {
    throw new Error([...constraintFailureReasons].join(' ') || 'No legal setup could be generated due to constraint conflicts.');
  }

  throw new Error('No legal setup could be generated from the current owned collection for the selected play mode.');
}

export function buildHistoryReadySetupSnapshot(setup) {
  return deepClone(setup.setupSnapshot);
}

