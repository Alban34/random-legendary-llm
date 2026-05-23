import { normalizeForcedPicks } from './forced-picks-utils.ts';
import type { ForcedPicks } from './forced-picks-utils.ts';
import { resolveSetupTemplate } from './setup-rules.ts';
import type { SetupTemplate } from './setup-rules.ts';
import type {
  PlayMode,
  AppState,
  SchemeRuntime,
  MastermindRuntime
} from './types.ts';
import { buildOwnedPools } from './setup-pool-builder.ts';
import type { GamePool, GameRuntime } from './setup-pool-builder.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidateLegalityOptions {
  runtime: GameRuntime;
  state: AppState;
  playerCount: number;
  advancedSolo?: boolean;
  playMode?: PlayMode;
  forcedPicks?: unknown;
}

export interface ValidateLegalityResult {
  ok: boolean;
  reasons: string[];
  template: SetupTemplate | null;
  pools: GamePool;
  eligibleSchemes: SchemeRuntime[];
  forcedPicks?: ForcedPicks;
}

// ---------------------------------------------------------------------------
// Solo mode check
// ---------------------------------------------------------------------------

const SOLO_PLAY_MODES = new Set(['advanced-solo', 'two-handed-solo', 'standard-solo-v2']);

export function isSoloMode(template: SetupTemplate): boolean {
  return SOLO_PLAY_MODES.has(template.playMode) || (template.playMode === 'standard' && template.playerCount === 1);
}

// ---------------------------------------------------------------------------
// Scheme eligibility
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Base count validation
// ---------------------------------------------------------------------------

export function validateBaseCounts(pools: GamePool, template: SetupTemplate): string[] {
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

// ---------------------------------------------------------------------------
// Forced pick validation
// ---------------------------------------------------------------------------

function validateMastermindLeadSlots(
  forcedPicks: ForcedPicks,
  mastermindsById: Record<string, MastermindRuntime>,
  template: SetupTemplate,
  reasons: string[]
): void {
  const forcedMastermind = forcedPicks.mastermindId ? mastermindsById[forcedPicks.mastermindId] : null;
  const mastermindLeadIsVillain = forcedMastermind?.lead?.category === 'villains';
  const mastermindLeadVillainAlreadyForced =
    mastermindLeadIsVillain && forcedMastermind?.lead != null && forcedPicks.villainGroupIds.includes(forcedMastermind.lead.id);
  const mastermindLeadVillainGroupCount = mastermindLeadIsVillain && !mastermindLeadVillainAlreadyForced && !isSoloMode(template) ? 1 : 0;
  const effectiveForcedVillainCount = forcedPicks.villainGroupIds.length + mastermindLeadVillainGroupCount;

  if (effectiveForcedVillainCount > template.villainGroupCount) {
    reasons.push(`Forced Villain Groups (including mastermind lead) exceed the base Villain Group slots for this setup mode (${effectiveForcedVillainCount}/${template.villainGroupCount}).`);
  }

  const mastermindLeadIsHenchman = forcedMastermind?.lead?.category === 'henchmen';
  const mastermindLeadHenchmanAlreadyForced =
    mastermindLeadIsHenchman && forcedMastermind?.lead != null && forcedPicks.henchmanGroupIds.includes(forcedMastermind.lead.id);
  const mastermindLeadHenchmanGroupCount = mastermindLeadIsHenchman && !mastermindLeadHenchmanAlreadyForced && !isSoloMode(template) ? 1 : 0;
  const effectiveForcedHenchmanCount = forcedPicks.henchmanGroupIds.length + mastermindLeadHenchmanGroupCount;

  if (effectiveForcedHenchmanCount > template.henchmanGroupCount) {
    reasons.push(`Forced Henchman Groups (including mastermind lead) exceed the base Henchman Group slots for this setup mode (${effectiveForcedHenchmanCount}/${template.henchmanGroupCount}).`);
  }
}

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

  validateMastermindLeadSlots(forcedPicks, mastermindsById, template, reasons);

  return reasons;
}

// ---------------------------------------------------------------------------
// Main validation
// ---------------------------------------------------------------------------

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
