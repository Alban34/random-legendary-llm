export const FORCED_PICK_FIELD_CONFIGS = [
  { field: 'schemeId', label: 'Scheme', entityKey: 'schemes', multi: false },
  { field: 'mastermindId', label: 'Mastermind', entityKey: 'masterminds', multi: false },
  { field: 'heroIds', label: 'Hero', entityKey: 'heroes', multi: true },
  { field: 'villainGroupIds', label: 'Villain Group', entityKey: 'villainGroups', multi: true },
  { field: 'henchmanGroupIds', label: 'Henchman Group', entityKey: 'henchmanGroups', multi: true }
];

const FORCED_PICK_FIELDS = new Set(FORCED_PICK_FIELD_CONFIGS.map((config) => config.field));

export function createEmptyForcedPicks() {
  return {
    schemeId: null,
    mastermindId: null,
    heroIds: [],
    villainGroupIds: [],
    henchmanGroupIds: []
  };
}

export function normalizeForcedPicks(candidateForcedPicks) {
  const candidate = candidateForcedPicks && typeof candidateForcedPicks === 'object'
    ? candidateForcedPicks
    : createEmptyForcedPicks();

  return {
    schemeId: typeof candidate.schemeId === 'string' && candidate.schemeId ? candidate.schemeId : null,
    mastermindId: typeof candidate.mastermindId === 'string' && candidate.mastermindId ? candidate.mastermindId : null,
    heroIds: [...new Set(Array.isArray(candidate.heroIds) ? candidate.heroIds.filter((id) => typeof id === 'string' && id) : [])],
    villainGroupIds: [...new Set(Array.isArray(candidate.villainGroupIds) ? candidate.villainGroupIds.filter((id) => typeof id === 'string' && id) : [])],
    henchmanGroupIds: [...new Set(Array.isArray(candidate.henchmanGroupIds) ? candidate.henchmanGroupIds.filter((id) => typeof id === 'string' && id) : [])]
  };
}

export function hasForcedPicks(forcedPicks) {
  const normalized = normalizeForcedPicks(forcedPicks);
  return Boolean(
    normalized.schemeId
    || normalized.mastermindId
    || normalized.heroIds.length
    || normalized.villainGroupIds.length
    || normalized.henchmanGroupIds.length
  );
}

export function addForcedPick(currentForcedPicks, field, value) {
  if (!FORCED_PICK_FIELDS.has(field) || typeof value !== 'string' || !value) {
    return normalizeForcedPicks(currentForcedPicks);
  }

  const next = normalizeForcedPicks(currentForcedPicks);
  const config = FORCED_PICK_FIELD_CONFIGS.find((entry) => entry.field === field);
  if (!config.multi) {
    next[field] = value;
    return next;
  }

  next[field] = [...new Set([...next[field], value])];
  return next;
}

export function removeForcedPick(currentForcedPicks, field, value = null) {
  if (!FORCED_PICK_FIELDS.has(field)) {
    return normalizeForcedPicks(currentForcedPicks);
  }

  const next = normalizeForcedPicks(currentForcedPicks);
  const config = FORCED_PICK_FIELD_CONFIGS.find((entry) => entry.field === field);
  if (!config.multi) {
    next[field] = null;
    return next;
  }

  next[field] = next[field].filter((id) => id !== value);
  return next;
}