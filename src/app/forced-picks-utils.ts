export interface ForcedPicks {
  schemeId: string | null;
  mastermindId: string | null;
  heroIds: string[];
  villainGroupIds: string[];
  henchmanGroupIds: string[];
  preferredExpansionId: string | null;
  forcedTeam: string | null;
}

interface ForcedPickFieldConfig {
  field: string;
  label: string;
  entityKey: string;
  multi: boolean;
}

export const FORCED_PICK_FIELD_CONFIGS: ForcedPickFieldConfig[] = [
  { field: 'schemeId', label: 'Scheme', entityKey: 'schemes', multi: false },
  { field: 'mastermindId', label: 'Mastermind', entityKey: 'masterminds', multi: false },
  { field: 'heroIds', label: 'Hero', entityKey: 'heroes', multi: true },
  { field: 'villainGroupIds', label: 'Villain Group', entityKey: 'villainGroups', multi: true },
  { field: 'henchmanGroupIds', label: 'Henchman Group', entityKey: 'henchmanGroups', multi: true }
];

const FORCED_PICK_FIELDS = new Set(FORCED_PICK_FIELD_CONFIGS.map((config) => config.field));

export function createEmptyForcedPicks(): ForcedPicks {
  return {
    schemeId: null,
    mastermindId: null,
    heroIds: [],
    villainGroupIds: [],
    henchmanGroupIds: [],
    preferredExpansionId: null,
    forcedTeam: null
  };
}

export function normalizeForcedPicks(candidateForcedPicks: unknown): ForcedPicks {
  const candidate = candidateForcedPicks && typeof candidateForcedPicks === 'object'
    ? (candidateForcedPicks as Record<string, unknown>)
    : (createEmptyForcedPicks() as unknown as Record<string, unknown>);

  return {
    schemeId: typeof candidate.schemeId === 'string' && candidate.schemeId ? candidate.schemeId : null,
    mastermindId: typeof candidate.mastermindId === 'string' && candidate.mastermindId ? candidate.mastermindId : null,
    heroIds: [...new Set(Array.isArray(candidate.heroIds) ? (candidate.heroIds as unknown[]).filter((id): id is string => typeof id === 'string' && !!id) : [])],
    villainGroupIds: [...new Set(Array.isArray(candidate.villainGroupIds) ? (candidate.villainGroupIds as unknown[]).filter((id): id is string => typeof id === 'string' && !!id) : [])],
    henchmanGroupIds: [...new Set(Array.isArray(candidate.henchmanGroupIds) ? (candidate.henchmanGroupIds as unknown[]).filter((id): id is string => typeof id === 'string' && !!id) : [])],
    preferredExpansionId: typeof candidate.preferredExpansionId === 'string' && candidate.preferredExpansionId ? candidate.preferredExpansionId : null,
    forcedTeam: typeof candidate.forcedTeam === 'string' && candidate.forcedTeam ? candidate.forcedTeam : null
  };
}

export function hasForcedPicks(forcedPicks: unknown): boolean {
  const normalized = normalizeForcedPicks(forcedPicks);
  return Boolean(
    normalized.schemeId
    || normalized.mastermindId
    || normalized.heroIds.length
    || normalized.villainGroupIds.length
    || normalized.henchmanGroupIds.length
    || normalized.preferredExpansionId
    || normalized.forcedTeam
  );
}

export function addForcedPick(currentForcedPicks: ForcedPicks, field: string, value: string): ForcedPicks {
  if (!FORCED_PICK_FIELDS.has(field) || typeof value !== 'string' || !value) {
    return normalizeForcedPicks(currentForcedPicks);
  }

  const next = normalizeForcedPicks(currentForcedPicks);
  const config = FORCED_PICK_FIELD_CONFIGS.find((entry) => entry.field === field)!;
  if (!config.multi) {
    (next as unknown as Record<string, unknown>)[field] = value;
    return next;
  }

  (next as unknown as Record<string, unknown>)[field] = [...new Set([...(next[field as keyof ForcedPicks] as string[]), value])];
  return next;
}

export function removeForcedPick(currentForcedPicks: ForcedPicks, field: string, value: string | null = null): ForcedPicks {
  if (!FORCED_PICK_FIELDS.has(field)) {
    return normalizeForcedPicks(currentForcedPicks);
  }

  const next = normalizeForcedPicks(currentForcedPicks);
  const config = FORCED_PICK_FIELD_CONFIGS.find((entry) => entry.field === field)!;
  if (!config.multi) {
    (next as unknown as Record<string, unknown>)[field] = null;
    return next;
  }

  (next as unknown as Record<string, unknown>)[field] = (next[field as keyof ForcedPicks] as string[]).filter((id) => id !== value);
  return next;
}
