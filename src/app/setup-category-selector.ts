import type { ForcedPicks } from './forced-picks-utils.ts';
import type { SetupTemplate } from './setup-rules.ts';
import type {
  VillainGroupRuntime,
  HenchmanGroupRuntime,
  SchemeRuntime,
  MastermindRuntime,
  UsageState
} from './types.ts';
import { selectFreshItems } from './setup-freshness.ts';
import type { GamePool } from './setup-pool-builder.ts';
import type { SchemeRequirements } from './setup-scheme-modifiers.ts';
import { isSoloMode } from './setup-validator.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryFallback {
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

// ---------------------------------------------------------------------------
// ID set helpers
// ---------------------------------------------------------------------------

export function createIdSet<T extends { id: string }>(entities: T[]): Set<string> {
  return new Set(entities.map((entity) => entity.id));
}

export function appendForcedReason(map: Map<string, ForcedEntry>, id: string, reason: string): void {
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
// Forced collections
// ---------------------------------------------------------------------------

export function resolveForcedCollections(
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

  if (mastermind.lead && !isSoloMode(template)) {
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

export function buildCategorySelection(
  pools: GamePool,
  requirements: SchemeRequirements,
  scheme: SchemeRuntime,
  mastermind: MastermindRuntime,
  usageBucket: UsageState,
  opts: { template: SetupTemplate; preferredExpansionId?: string | null; random: () => number; forcedPicks: ForcedPicks }
): CategorySelectionResult {
  const { template, preferredExpansionId = null, random, forcedPicks } = opts;
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
