import type { HeroRuntime, UsageCategoryMap } from './types.ts';
import type { SchemeRequirements } from './setup-scheme-modifiers.ts';
import { selectFreshItems } from './setup-freshness.ts';
import type { SelectionResult } from './setup-freshness.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeroSelectionResult extends SelectionResult<HeroRuntime> {
  reason: string | null;
}

// ---------------------------------------------------------------------------
// Hero requirements check
// ---------------------------------------------------------------------------

export function canSatisfyHeroRequirements(heroes: HeroRuntime[], requirements: SchemeRequirements): boolean {
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

// ---------------------------------------------------------------------------
// Hero selection
// ---------------------------------------------------------------------------

export function selectHeroes(
  heroes: HeroRuntime[],
  requirements: SchemeRequirements,
  usageBucket: UsageCategoryMap | undefined,
  random: () => number,
  forcedHeroIds: string[] = [],
  preferredExpansionId: string | null = null,
  forcedTeam: string | null = null
): HeroSelectionResult {
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

  if (forcedTeam) {
    const remainingSlots = requirements.heroCount - selected.length;
    const teamPool = heroes.filter((hero) => !selectedIds.has(hero.id) && hero.teams.includes(forcedTeam));
    const generalPool = heroes.filter((hero) => !selectedIds.has(hero.id) && !hero.teams.includes(forcedTeam));

    const teamFiller = selectFreshItems(teamPool, Math.min(teamPool.length, remainingSlots), usageBucket, random);
    teamFiller.selected.forEach((hero) => selectedIds.add(hero.id));
    selected.push(...teamFiller.selected);

    const leftoverSlots = requirements.heroCount - selected.length;
    const generalFiller = selectFreshItems(generalPool, leftoverSlots, usageBucket, random, selectedIds, preferredExpansionId);
    if (generalFiller.selected.length < leftoverSlots) {
      return { selected: [], usedFallback: false, fallbackItems: [], reason: 'Not enough remaining Heroes are available after applying the forced picks.' };
    }

    return {
      selected: [...selected, ...generalFiller.selected],
      usedFallback: teamFiller.usedFallback || generalFiller.usedFallback,
      fallbackItems: [...teamFiller.fallbackItems, ...generalFiller.fallbackItems],
      reason: null
    };
  }

  if (!requirements.heroNameRequirements.length) {
    const filler = selectFreshItems(heroes, requirements.heroCount - forcedHeroes.length, usageBucket, random, selectedIds, preferredExpansionId);
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
  let fallbackItems: HeroRuntime[] = [];
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
  const filler = selectFreshItems(generalPool, remainingHeroCount, usageBucket, random, new Set(), preferredExpansionId);
  if (filler.selected.length < remainingHeroCount) {
    return { selected: [], usedFallback: false, fallbackItems: [], reason: 'Not enough remaining Heroes are available after applying the forced picks.' };
  }

  selected = [...selected, ...filler.selected];
  usedFallback = usedFallback || filler.usedFallback;
  fallbackItems = [...fallbackItems, ...filler.fallbackItems];

  return { selected, usedFallback, fallbackItems, reason: null };
}
