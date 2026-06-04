import { hasForcedPicks, type ForcedPicks } from './forced-picks-utils.ts';
import { deepClone } from './object-utils.ts';
import { summarizeSetupTemplate, type SetupTemplate } from './setup-rules.ts';
import type {
  PlayMode,
  AppState,
  GeneratedSetup,
  GeneratorNotice,
  HeroRuntime,
  MastermindRuntime,
  VillainGroupRuntime,
  HenchmanGroupRuntime,
  SchemeRuntime,
  UsageCategoryMap
} from './types.ts';
import type { GamePool, GameRuntime } from './setup-pool-builder.ts';
import { applySchemeModifiersToTemplate, type SchemeRequirements } from './setup-scheme-modifiers.ts';
import { validateSetupLegality, isSoloMode } from './setup-validator.ts';
import { selectFreshItems, type SelectionResult } from './setup-freshness.ts';
import { selectHeroes, canSatisfyHeroRequirements } from './setup-hero-selector.ts';
import { buildCategorySelection, type CategoryFallback } from './setup-category-selector.ts';

// Re-exports for backward compatibility
export { validateSetupLegality } from './setup-validator.ts';
export { buildOwnedPools } from './setup-pool-builder.ts';
export { applySchemeModifiersToTemplate } from './setup-scheme-modifiers.ts';
export { rankItemsByFreshness } from './setup-freshness.ts';

interface GenerateSetupOptions {
  runtime: GameRuntime;
  state: AppState;
  playerCount: number;
  advancedSolo?: boolean;
  playMode?: PlayMode;
  forcedPicks?: unknown;
  epicMastermind?: boolean;
  random?: () => number;
}

interface TryMastermindContext {
  mastermindRanking: SelectionResult<MastermindRuntime>;
  scheme: SchemeRuntime;
  schemeSelection: SelectionResult<SchemeRuntime>;
  pools: GamePool;
  effectiveRequirements: SchemeRequirements;
  normalizedForcedPicks: ForcedPicks;
  state: AppState;
  runtime: GameRuntime;
  random: () => number;
  constraintFailureReasons: Set<string>;
  eligibleSchemes: SchemeRuntime[];
  template: SetupTemplate;
}

interface TrySchemeContext {
  schemeSelection: SelectionResult<SchemeRuntime>;
  pools: GamePool;
  template: SetupTemplate;
  normalizedForcedPicks: ForcedPicks;
  state: AppState;
  runtime: GameRuntime;
  random: () => number;
  hasConstraintSelections: boolean;
  constraintFailureReasons: Set<string>;
  eligibleSchemes: SchemeRuntime[];
}

interface NoticeInput {
  schemeFallback: SchemeRuntime[];
  mastermindFallback: MastermindRuntime[];
  heroFallback: HeroRuntime[];
  categoryFallback: CategoryFallback;
  forcedConstraintSummary: string[];
}

function createGeneratorNotices({ schemeFallback, mastermindFallback, heroFallback, categoryFallback, forcedConstraintSummary }: NoticeInput): GeneratorNotice[] {
  const notices: GeneratorNotice[] = [];
  if (forcedConstraintSummary.length) {
    notices.push({ key: 'newGame.generator.notice.forcedPicks', values: { summary: forcedConstraintSummary.join('; ') } });
  }
  if (schemeFallback.length) {
    notices.push({ key: 'newGame.generator.notice.schemeFallback', values: { names: schemeFallback.map((entity) => entity.name).join(', ') } });
  }
  if (mastermindFallback.length) {
    notices.push({ key: 'newGame.generator.notice.mastermindFallback', values: { names: mastermindFallback.map((entity) => entity.name).join(', ') } });
  }
  if (heroFallback.length) {
    notices.push({ key: 'newGame.generator.notice.heroFallback', values: { names: heroFallback.map((entity) => entity.name).join(', ') } });
  }
  if (categoryFallback.villainGroups.length) {
    notices.push({ key: 'newGame.generator.notice.villainFallback', values: { names: categoryFallback.villainGroups.map((entity) => entity.name).join(', ') } });
  }
  if (categoryFallback.henchmanGroups.length) {
    notices.push({ key: 'newGame.generator.notice.henchmanFallback', values: { names: categoryFallback.henchmanGroups.map((entity) => entity.name).join(', ') } });
  }
  return notices;
}

interface PartialSetup {
  scheme: SchemeRuntime;
  mastermind: MastermindRuntime;
  heroes: HeroRuntime[];
  villainGroups: VillainGroupRuntime[];
  henchmanGroups: HenchmanGroupRuntime[];
}

function buildForcedConstraintSummary(forcedPicks: ForcedPicks, setup: PartialSetup): string[] {
  const parts: string[] = [];

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

function summarizeRequirements(template: SetupTemplate, effectiveRequirements: SchemeRequirements): GeneratedSetup['requirements'] {
  return {
    ...summarizeSetupTemplate(template),
    heroCount: effectiveRequirements.heroCount,
    villainGroupCount: effectiveRequirements.villainGroupCount,
    henchmanGroupCount: effectiveRequirements.henchmanGroupCount,
    wounds: effectiveRequirements.wounds,
    bystanders: effectiveRequirements.bystanders
  } as GeneratedSetup['requirements'];
}

// ---------------------------------------------------------------------------
// Scheme / mastermind selection
// ---------------------------------------------------------------------------
function selectScheme(
  eligibleSchemes: SchemeRuntime[],
  normalizedForcedPicks: ForcedPicks,
  usageSchemes: UsageCategoryMap | undefined,
  random: () => number,
  preferredExpansionId: string | null = null
): SelectionResult<SchemeRuntime> {
  if (normalizedForcedPicks.schemeId) {
    return { selected: eligibleSchemes.filter((scheme) => scheme.id === normalizedForcedPicks.schemeId), fallbackItems: [], usedFallback: false };
  }
  return selectFreshItems(eligibleSchemes, eligibleSchemes.length, usageSchemes, random, new Set(), preferredExpansionId);
}

function selectMastermind(
  pools: GamePool,
  normalizedForcedPicks: ForcedPicks,
  usageMasterminds: UsageCategoryMap | undefined,
  random: () => number,
  preferredExpansionId: string | null = null
): SelectionResult<MastermindRuntime> {
  if (normalizedForcedPicks.mastermindId) {
    return { selected: pools.masterminds.filter((mastermind) => mastermind.id === normalizedForcedPicks.mastermindId), fallbackItems: [], usedFallback: false };
  }
  return selectFreshItems(pools.masterminds, pools.masterminds.length, usageMasterminds, random, new Set(), preferredExpansionId);
}

function resolveLeadEntity(
  mastermind: MastermindRuntime,
  runtime: GameRuntime
): VillainGroupRuntime | HenchmanGroupRuntime | null {
  if (!mastermind.lead) {
    return null;
  }
  return mastermind.lead.category === 'villains'
    ? runtime.indexes.villainGroupsById[mastermind.lead.id]
    : runtime.indexes.henchmanGroupsById[mastermind.lead.id];
}

// ---------------------------------------------------------------------------
// Core generation loop
// ---------------------------------------------------------------------------
function tryMastermindForScheme(mastermind: MastermindRuntime, context: TryMastermindContext): GeneratedSetup | null {
  const { mastermindRanking, scheme, schemeSelection, pools, effectiveRequirements, normalizedForcedPicks, state, runtime, random, constraintFailureReasons, eligibleSchemes, template } = context;

  // 107.2d — categorical lead: pick one candidate at random from the owned pool
  let activeForcedPicks = normalizedForcedPicks;
  if (mastermind.lead === null && mastermind.leadCandidates && mastermind.leadCandidates.length > 0) {
    const poolVillainIds = new Set(pools.villainGroups.map((vg) => vg.id));
    const poolHenchmanIds = new Set(pools.henchmanGroups.map((hg) => hg.id));
    const availableCandidates = mastermind.leadCandidates.filter((c) =>
      c.category === 'villains' ? poolVillainIds.has(c.id) : poolHenchmanIds.has(c.id)
    );
    if (availableCandidates.length === 0) {
      constraintFailureReasons.add(`No eligible lead candidate for ${mastermind.name} is present in the current owned collection.`);
      return null;
    }
    const picked = availableCandidates[Math.floor(random() * availableCandidates.length)];
    activeForcedPicks = {
      ...normalizedForcedPicks,
      villainGroupIds: picked.category === 'villains'
        ? [...normalizedForcedPicks.villainGroupIds, picked.id]
        : normalizedForcedPicks.villainGroupIds,
      henchmanGroupIds: picked.category === 'henchmen'
        ? [...normalizedForcedPicks.henchmanGroupIds, picked.id]
        : normalizedForcedPicks.henchmanGroupIds
    };
  }

  const categorySelection = buildCategorySelection(pools, effectiveRequirements, scheme, mastermind, state.usage, { template, preferredExpansionId: activeForcedPicks.preferredExpansionId, random, forcedPicks: activeForcedPicks });
  if (!categorySelection.selection) {
    if (categorySelection.reason) {
      constraintFailureReasons.add(categorySelection.reason);
    }
    return null;
  }

  const heroSelection = selectHeroes(pools.heroes, effectiveRequirements, state.usage.heroes, random, normalizedForcedPicks.heroIds, normalizedForcedPicks.preferredExpansionId, normalizedForcedPicks.forcedTeam);
  if (heroSelection.selected.length !== effectiveRequirements.heroCount) {
    if (heroSelection.reason) {
      constraintFailureReasons.add(heroSelection.reason);
    }
    return null;
  }

  const leadEntity = isSoloMode(template) ? null : resolveLeadEntity(mastermind, runtime);
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

function trySchemeForSetup(scheme: SchemeRuntime, context: TrySchemeContext): GeneratedSetup | null {
  const { schemeSelection, pools, template, normalizedForcedPicks, state, runtime, random, hasConstraintSelections, constraintFailureReasons, eligibleSchemes } = context;
  const effectiveRequirements = applySchemeModifiersToTemplate(template, scheme);
  if (!canSatisfyHeroRequirements(pools.heroes, effectiveRequirements)) {
    if (hasConstraintSelections && normalizedForcedPicks.heroIds.length) {
      constraintFailureReasons.add('Forced Hero selections cannot satisfy the Hero requirements created by the current scheme and play mode.');
    }
    return null;
  }

  const mastermindRanking = selectMastermind(pools, normalizedForcedPicks, state.usage.masterminds, random, normalizedForcedPicks.preferredExpansionId);
  for (const mastermind of mastermindRanking.selected) {
    const result = tryMastermindForScheme(mastermind, { mastermindRanking, scheme, schemeSelection, pools, effectiveRequirements, normalizedForcedPicks, state, runtime, random, constraintFailureReasons, eligibleSchemes, template });
    if (result) {
      return result;
    }
  }
  return null;
}

export function generateSetup({ runtime, state, playerCount, advancedSolo = false, playMode, forcedPicks, epicMastermind, random = Math.random }: GenerateSetupOptions): GeneratedSetup {
  const legality = validateSetupLegality({ runtime, state, playerCount, advancedSolo, playMode, forcedPicks });
  if (!legality.ok) {
    throw new Error(legality.reasons.join(' '));
  }

  const { template, pools, eligibleSchemes, forcedPicks: normalizedForcedPicks } = legality;

  if (epicMastermind === true) {
    const epicPool = pools.masterminds.filter((m) => m.isEpicMastermind === true);
    if (epicPool.length === 0) {
      throw new Error('newGame.epicMastermind.noCardsError');
    }
    pools.masterminds = epicPool;
  }

  const hasConstraintSelections = hasForcedPicks(normalizedForcedPicks);
  const constraintFailureReasons = new Set<string>();
  const tmpl = template!;
  const normalizedPicks = normalizedForcedPicks!;
  const schemeSelection = selectScheme(eligibleSchemes, normalizedPicks, state.usage.schemes, random, normalizedPicks.preferredExpansionId);

  for (const scheme of schemeSelection.selected) {
    const result = trySchemeForSetup(scheme, {
      schemeSelection,
      pools,
      template: tmpl,
      normalizedForcedPicks: normalizedPicks,
      state,
      runtime,
      random,
      hasConstraintSelections,
      constraintFailureReasons,
      eligibleSchemes
    });
    if (result) {
      return result;
    }
  }

  if (hasConstraintSelections && constraintFailureReasons.size) {
    throw new Error([...constraintFailureReasons].join(' ') || 'newGame.generator.error.constraintConflict');
  }

  throw new Error('newGame.generator.error.noLegalSetup');
}

export function buildHistoryReadySetupSnapshot(setup: GeneratedSetup): GeneratedSetup['setupSnapshot'] {
  return deepClone(setup.setupSnapshot);
}
