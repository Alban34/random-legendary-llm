import { hasForcedPicks, normalizeForcedPicks } from './forced-picks-utils.ts';
import type { ForcedPicks } from './forced-picks-utils.ts';
import { deepClone } from './object-utils.ts';
import { resolveSetupTemplate, summarizeSetupTemplate } from './setup-rules.ts';
import type { SetupTemplate } from './setup-rules.ts';
import type {
  PlayMode,
  AppState,
  GeneratedSetup,
  GameSet,
  HeroRuntime,
  MastermindRuntime,
  VillainGroupRuntime,
  HenchmanGroupRuntime,
  SchemeRuntime,
  UsageState,
  UsageCategoryMap,
  UsageStat
} from './types.ts';

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

interface GameRuntimeIndexes {
  villainGroupsById: Record<string, VillainGroupRuntime>;
  henchmanGroupsById: Record<string, HenchmanGroupRuntime>;
}

interface GameRuntime {
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

interface SelectionResult<T> {
  selected: T[];
  usedFallback: boolean;
  fallbackItems: T[];
}

interface HeroSelectionResult extends SelectionResult<HeroRuntime> {
  reason: string | null;
}

interface CategoryFallback {
  villainGroups: VillainGroupRuntime[];
  henchmanGroups: HenchmanGroupRuntime[];
}

interface CategorySelectionData {
  villainGroups: Array<VillainGroupRuntime & { forced: boolean; forcedBy: string | string[]; forcedReasons: string[] }>;
  henchmanGroups: Array<HenchmanGroupRuntime & { forced: boolean; forcedBy: string | string[]; forcedReasons: string[] }>;
  fallback: CategoryFallback;
}

interface CategorySelectionResult {
  selection: CategorySelectionData | null;
  reason?: string;
}

interface ForcedEntry {
  id: string;
  reasons: string[];
}

interface ForcedCollectionsResult {
  forcedVillainIds: ForcedEntry[];
  forcedHenchmanIds: ForcedEntry[];
  allAvailable: boolean;
}

interface ValidateLegalityOptions {
  runtime: GameRuntime;
  state: AppState;
  playerCount: number;
  advancedSolo?: boolean;
  playMode?: PlayMode | string;
  forcedPicks?: unknown;
}

interface ValidateLegalityResult {
  ok: boolean;
  reasons: string[];
  template: SetupTemplate | null;
  pools: GamePool;
  eligibleSchemes: SchemeRuntime[];
  forcedPicks?: ForcedPicks;
}

interface GenerateSetupOptions {
  runtime: GameRuntime;
  state: AppState;
  playerCount: number;
  advancedSolo?: boolean;
  playMode?: PlayMode | string;
  forcedPicks?: unknown;
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

interface SchemeRequirements {
  heroCount: number;
  villainGroupCount: number;
  henchmanGroupCount: number;
  wounds: number;
  bystanders: number;
  heroNameRequirements: Array<{ pattern: string; value: number }>;
  playerCount?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BYSTANDERS = 30;

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function getUsageStat(usageBucket: UsageCategoryMap | undefined, id: string): UsageStat {
  return usageBucket?.[id] || { plays: 0, lastPlayedAt: null };
}

function getFreshnessKey(usageBucket: UsageCategoryMap | undefined, entity: { id: string }): [number, number, number] {
  const usage = getUsageStat(usageBucket, entity.id);
  const neverPlayed = usage.plays === 0 && usage.lastPlayedAt === null;
  return [
    neverPlayed ? 0 : 1,
    usage.plays,
    usage.lastPlayedAt === null ? Number.NEGATIVE_INFINITY : Date.parse(usage.lastPlayedAt)
  ];
}

export function rankItemsByFreshness<T extends { id: string }>(
  items: T[],
  usageBucket: UsageCategoryMap | undefined,
  random: () => number = Math.random,
  preferredExpansionId: string | null = null
): T[] {
  const grouped = new Map<string, { key: [number, number, number]; list: T[] }>();

  for (const item of items) {
    const key = getFreshnessKey(usageBucket, item);
    const keyStr = `${key[0]}|${key[1]}`;
    if (!grouped.has(keyStr)) {
      grouped.set(keyStr, { key, list: [] });
    }
    grouped.get(keyStr)!.list.push(item);
  }

  return [...grouped.values()]
    .sort((left, right) => {
      if (left.key[0] !== right.key[0]) return left.key[0] - right.key[0];
      return left.key[1] - right.key[1];
    })
    .flatMap(({ list }) => {
      if (preferredExpansionId) {
        const preferred = shuffle(list.filter((item) => (item as unknown as { setId?: string }).setId === preferredExpansionId), random);
        const others = shuffle(list.filter((item) => (item as unknown as { setId?: string }).setId !== preferredExpansionId), random);
        return [...preferred, ...others];
      }
      return shuffle(list, random);
    });
}

function summarizeFallback<T extends { id: string }>(
  selected: T[],
  usageBucket: UsageCategoryMap | undefined
): { usedFallback: boolean; fallbackItems: T[] } {
  const fallbackItems = selected.filter((entity) => getUsageStat(usageBucket, entity.id).plays > 0);
  return {
    usedFallback: fallbackItems.length > 0,
    fallbackItems
  };
}

function selectFreshItems<T extends { id: string }>(
  items: T[],
  count: number,
  usageBucket: UsageCategoryMap | undefined,
  random: () => number = Math.random,
  excludeIds: Set<string> = new Set(),
  preferredExpansionId: string | null = null
): SelectionResult<T> {
  const ranked = rankItemsByFreshness(items.filter((entity) => !excludeIds.has(entity.id)), usageBucket, random, preferredExpansionId);
  const selected = ranked.slice(0, count);
  return {
    selected,
    ...summarizeFallback(selected, usageBucket)
  };
}

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

// ---------------------------------------------------------------------------
// Scheme modifier application
// ---------------------------------------------------------------------------

interface Modifier {
  type: string;
  amount?: number;
  value?: number;
  pattern?: string;
  playerCounts?: number[];
}

function applyModifier(requirements: SchemeRequirements, modifier: Modifier, playerCount: number): void {
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
        pattern: modifier.pattern!,
        value: modifier.value!
      });
      break;
    default:
      break;
  }
}

export function applySchemeModifiersToTemplate(template: SetupTemplate, scheme: SchemeRuntime): SchemeRequirements {
  const requirements: SchemeRequirements = {
    heroCount: template.heroCount,
    villainGroupCount: template.villainGroupCount,
    henchmanGroupCount: template.henchmanGroupCount,
    wounds: template.wounds,
    bystanders: DEFAULT_BYSTANDERS,
    heroNameRequirements: []
  };

  for (const modifier of scheme.modifiers || []) {
    applyModifier(requirements, modifier as Modifier, template.playerCount);
  }

  return requirements;
}

// ---------------------------------------------------------------------------
// ID set helpers
// ---------------------------------------------------------------------------

function createIdSet<T extends { id: string }>(entities: T[]): Set<string> {
  return new Set(entities.map((entity) => entity.id));
}

function appendForcedReason(map: Map<string, ForcedEntry>, id: string, reason: string): void {
  const existing = map.get(id);
  if (!existing) {
    map.set(id, { id, reasons: [reason] });
    return;
  }

  if (!existing.reasons.includes(reason)) {
    existing.reasons.push(reason);
  }
}

// ---------------------------------------------------------------------------
// Forced pick validation
// ---------------------------------------------------------------------------

function validateForcedPickAvailability(
  forcedPicks: ForcedPicks,
  pools: GamePool,
  template: SetupTemplate,
  eligibleSchemes: SchemeRuntime[]
): string[] {
  const reasons: string[] = [];
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
    mastermindLeadIsVillain && forcedPicks.villainGroupIds.includes(forcedMastermind!.lead!.id);
  const mastermindLeadVillainGroupCount = mastermindLeadIsVillain && !mastermindLeadVillainAlreadyForced ? 1 : 0;
  const effectiveForcedVillainCount = forcedPicks.villainGroupIds.length + mastermindLeadVillainGroupCount;

  if (effectiveForcedVillainCount > template.villainGroupCount) {
    reasons.push(`Forced Villain Groups (including mastermind lead) exceed the base Villain Group slots for this setup mode (${effectiveForcedVillainCount}/${template.villainGroupCount}).`);
  }

  const mastermindLeadIsHenchman = forcedMastermind?.lead?.category === 'henchmen';
  const mastermindLeadHenchmanAlreadyForced =
    mastermindLeadIsHenchman && forcedPicks.henchmanGroupIds.includes(forcedMastermind!.lead!.id);
  const mastermindLeadHenchmanGroupCount = mastermindLeadIsHenchman && !mastermindLeadHenchmanAlreadyForced ? 1 : 0;
  const effectiveForcedHenchmanCount = forcedPicks.henchmanGroupIds.length + mastermindLeadHenchmanGroupCount;

  if (effectiveForcedHenchmanCount > template.henchmanGroupCount) {
    reasons.push(`Forced Henchman Groups (including mastermind lead) exceed the base Henchman Group slots for this setup mode (${effectiveForcedHenchmanCount}/${template.henchmanGroupCount}).`);
  }

  return reasons;
}

const SOLO_PLAY_MODES = new Set(['advanced-solo', 'two-handed-solo', 'standard-solo-v2']);

function resolveForcedCollections(
  scheme: SchemeRuntime,
  mastermind: MastermindRuntime,
  pools: GamePool,
  forcedPicks: ForcedPicks,
  template: SetupTemplate
): ForcedCollectionsResult {
  const poolVillainIds = createIdSet(pools.villainGroups);
  const poolHenchmanIds = createIdSet(pools.henchmanGroups);
  const villainMap = new Map<string, ForcedEntry>();
  const henchmanMap = new Map<string, ForcedEntry>();

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

function isSchemeEligibleForTemplate(scheme: SchemeRuntime, template: SetupTemplate): boolean {
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

function validateBaseCounts(pools: GamePool, template: SetupTemplate): string[] {
  const reasons: string[] = [];
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

export function validateSetupLegality({ runtime, state, playerCount, advancedSolo = false, playMode, forcedPicks }: ValidateLegalityOptions): ValidateLegalityResult {
  const activeSetIds = state.collection.activeSetIds ?? null;
  const effectiveSetIds = Array.isArray(activeSetIds) ? activeSetIds : state.collection.ownedSetIds;

  let template: SetupTemplate;
  try {
    template = resolveSetupTemplate(playerCount, { advancedSolo, playMode });
  } catch (error) {
    return {
      ok: false,
      reasons: [(error as Error).message],
      template: null,
      pools: buildOwnedPools(runtime, effectiveSetIds),
      eligibleSchemes: []
    };
  }

  const pools = buildOwnedPools(runtime, effectiveSetIds);
  const reasons: string[] = [];
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

// ---------------------------------------------------------------------------
// Hero selection
// ---------------------------------------------------------------------------

function canSatisfyHeroRequirements(heroes: HeroRuntime[], requirements: SchemeRequirements): boolean {
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

function selectHeroes(
  heroes: HeroRuntime[],
  requirements: SchemeRequirements,
  usageBucket: UsageCategoryMap | undefined,
  random: () => number,
  forcedHeroIds: string[] = [],
  preferredExpansionId: string | null = null
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

// ---------------------------------------------------------------------------
// Category selection
// ---------------------------------------------------------------------------

type ForcedEntityDetails<T> = T & { forced: boolean; forcedBy: string | string[]; forcedReasons: string[] };

function buildForcedDetails<T extends { id: string }>(
  entries: ForcedEntry[],
  lookup: Record<string, T>
): Array<ForcedEntityDetails<T>> {
  return entries.map((entry) => ({
    ...lookup[entry.id],
    forced: true,
    forcedBy: entry.reasons.length === 1 ? entry.reasons[0] : entry.reasons,
    forcedReasons: [...entry.reasons]
  }));
}

function buildRandomDetails<T>(entities: T[]): Array<T & { forced: boolean; forcedBy: null }> {
  return entities.map((entity) => ({
    ...entity,
    forced: false,
    forcedBy: null
  }));
}

function buildCategorySelection(
  pools: GamePool,
  requirements: SchemeRequirements,
  scheme: SchemeRuntime,
  mastermind: MastermindRuntime,
  usageBucket: UsageState,
  random: () => number,
  forcedPicks: ForcedPicks,
  template: SetupTemplate,
  preferredExpansionId: string | null = null
): CategorySelectionResult {
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
    new Set(forcedVillains.map((entity) => entity.id)),
    preferredExpansionId
  );
  if (extraVillains.selected.length !== requirements.villainGroupCount - forcedVillains.length) {
    return { selection: null, reason: 'Not enough remaining Villain Groups are available after applying the forced picks.' };
  }

  const extraHenchmen = selectFreshItems(
    pools.henchmanGroups,
    requirements.henchmanGroupCount - forcedHenchmen.length,
    usageBucket.henchmanGroups,
    random,
    new Set(forcedHenchmen.map((entity) => entity.id)),
    preferredExpansionId
  );
  if (extraHenchmen.selected.length !== requirements.henchmanGroupCount - forcedHenchmen.length) {
    return { selection: null, reason: 'Not enough remaining Henchman Groups are available after applying the forced picks.' };
  }

  return {
    selection: {
      villainGroups: [...forcedVillains, ...buildRandomDetails(extraVillains.selected)] as CategorySelectionData['villainGroups'],
      henchmanGroups: [...forcedHenchmen, ...buildRandomDetails(extraHenchmen.selected)] as CategorySelectionData['henchmanGroups'],
      fallback: {
        villainGroups: extraVillains.fallbackItems,
        henchmanGroups: extraHenchmen.fallbackItems
      }
    }
  };
}

// ---------------------------------------------------------------------------
// Notice / summary helpers
// ---------------------------------------------------------------------------

interface NoticeInput {
  schemeFallback: SchemeRuntime[];
  mastermindFallback: MastermindRuntime[];
  heroFallback: HeroRuntime[];
  categoryFallback: CategoryFallback;
  forcedConstraintSummary: string[];
}

function createGeneratorNotices({ schemeFallback, mastermindFallback, heroFallback, categoryFallback, forcedConstraintSummary }: NoticeInput): string[] {
  const notices: string[] = [];
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
  const categorySelection = buildCategorySelection(pools, effectiveRequirements, scheme, mastermind, state.usage, random, normalizedForcedPicks, template, normalizedForcedPicks.preferredExpansionId);
  if (!categorySelection.selection) {
    if (categorySelection.reason) {
      constraintFailureReasons.add(categorySelection.reason);
    }
    return null;
  }

  const heroSelection = selectHeroes(pools.heroes, effectiveRequirements, state.usage.heroes, random, normalizedForcedPicks.heroIds, normalizedForcedPicks.preferredExpansionId);
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
  } as GeneratedSetup;
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

export function generateSetup({ runtime, state, playerCount, advancedSolo = false, playMode, forcedPicks, random = Math.random }: GenerateSetupOptions): GeneratedSetup {
  const legality = validateSetupLegality({ runtime, state, playerCount, advancedSolo, playMode, forcedPicks });
  if (!legality.ok) {
    throw new Error(legality.reasons.join(' '));
  }

  const { template, pools, eligibleSchemes, forcedPicks: normalizedForcedPicks } = legality;
  const hasConstraintSelections = hasForcedPicks(normalizedForcedPicks);
  const constraintFailureReasons = new Set<string>();
  const schemeSelection = selectScheme(eligibleSchemes!, normalizedForcedPicks!, state.usage.schemes, random, normalizedForcedPicks!.preferredExpansionId);

  for (const scheme of schemeSelection.selected) {
    const result = trySchemeForSetup(scheme, { schemeSelection, pools: pools!, template: template!, normalizedForcedPicks: normalizedForcedPicks!, state, runtime, random, hasConstraintSelections, constraintFailureReasons, eligibleSchemes: eligibleSchemes! });
    if (result) {
      return result;
    }
  }

  if (hasConstraintSelections && constraintFailureReasons.size) {
    throw new Error([...constraintFailureReasons].join(' ') || 'No legal setup could be generated due to constraint conflicts.');
  }

  throw new Error('No legal setup could be generated from the current owned collection for the selected play mode.');
}

export function buildHistoryReadySetupSnapshot(setup: GeneratedSetup): GeneratedSetup['setupSnapshot'] {
  return deepClone(setup.setupSnapshot);
}
