import { normalizeSelectedTab } from './app-tabs.ts';
import { normalizeLocaleId } from './localization-utils.ts';
import { isPlainObject } from './object-utils.ts';
import { sanitizeStoredGameResult } from './result-utils.ts';
import { resolvePlayMode } from './setup-rules.ts';
import { normalizeThemeId } from './theme-utils.ts';
import type { AppState, CollectionState, HistoryRecord, PlayMode, Preferences, RuntimeIndexes, UsageCategoryMap, UsageState } from './types';
import { createDefaultPreferences, createDefaultState, SCHEMA_VERSION } from './state-defaults.ts';
export * from './state-defaults.ts';

type Indexes = RuntimeIndexes;


const USAGE_INDEX_KEYS: Record<string, string> = {
  heroes: 'heroesById',
  masterminds: 'mastermindsById',
  villainGroups: 'villainGroupsById',
  henchmanGroups: 'henchmanGroupsById',
  schemes: 'schemesById'
};


function uniqueSortedStrings(values: unknown[]): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && Boolean(value)))].sort((left, right) => left.localeCompare(right));
}

function sanitizeOwnedSetIds(candidateIds: unknown, indexes: Indexes, notices: string[]): string[] {
  if (!Array.isArray(candidateIds)) {
    notices.push('Recovered collection ownership because stored set IDs were not a valid list.');
    return [];
  }

  const validIds = uniqueSortedStrings(candidateIds).filter((setId) => indexes.setsById[setId]);
  if (validIds.length !== uniqueSortedStrings(candidateIds).length) {
    notices.push('Removed invalid stored set IDs during state hydration.');
  }
  return validIds;
}

function sanitizeUsageStat(stat: unknown): { plays: number; lastPlayedAt: string | null } | null {
  if (!isPlainObject(stat)) {
    return null;
  }

  const candidate = stat as Record<string, unknown>;
  const plays = Number.isInteger(candidate.plays) && (candidate.plays as number) >= 0 ? (candidate.plays as number) : null;
  const lastPlayedAt = candidate.lastPlayedAt === null || typeof candidate.lastPlayedAt === 'string'
    ? candidate.lastPlayedAt
    : null;

  if (plays === null) {
    return null;
  }

  return { plays, lastPlayedAt };
}

function sanitizeUsageBucket(category: string, candidateBucket: unknown, indexes: Indexes, notices: string[]): UsageCategoryMap {
  const sanitizedBucket: UsageCategoryMap = {};
  const validLookup = (indexes as unknown as Record<string, Record<string, unknown>>)[USAGE_INDEX_KEYS[category]];

  if (!isPlainObject(candidateBucket)) {
    if (candidateBucket !== undefined) {
      notices.push(`Recovered ${category} usage because the stored value was invalid.`);
    }
    return sanitizedBucket;
  }

  for (const [id, stat] of Object.entries(candidateBucket as Record<string, unknown>)) {
    if (!validLookup[id]) {
      notices.push(`Removed invalid stored ${category} usage entry '${id}'.`);
      continue;
    }

    const sanitizedStat = sanitizeUsageStat(stat);
    if (!sanitizedStat) {
      notices.push(`Recovered ${category} usage entry '${id}' because its shape was invalid.`);
      continue;
    }

    sanitizedBucket[id] = sanitizedStat;
  }

  return sanitizedBucket;
}

function isValidSnapshotIds(ids: unknown, lookup: Record<string, unknown>): boolean {
  return Array.isArray(ids) && ids.every((id) => typeof id === 'string' && lookup[id]);
}
function sanitizeGameRecord(record: unknown, indexes: Indexes, notices: string[]): HistoryRecord | null {
  const r = record as Record<string, unknown>;
  if (!isPlainObject(record) || !isPlainObject(r.setupSnapshot)) {
    notices.push('Removed an invalid stored game history record during hydration.');
    return null;
  }

  const setupSnapshot = r.setupSnapshot as Record<string, unknown>;
  const isValid = typeof r.id === 'string'
    && typeof r.createdAt === 'string'
    && Number.isInteger(r.playerCount)
    && (r.playerCount as number) >= 1
    && (r.playerCount as number) <= 5
    && typeof r.advancedSolo === 'boolean'
    && typeof setupSnapshot.mastermindId === 'string'
    && indexes.mastermindsById[setupSnapshot.mastermindId]
    && typeof setupSnapshot.schemeId === 'string'
    && indexes.schemesById[setupSnapshot.schemeId]
    && isValidSnapshotIds(setupSnapshot.heroIds, indexes.heroesById)
    && isValidSnapshotIds(setupSnapshot.villainGroupIds, indexes.villainGroupsById)
    && isValidSnapshotIds(setupSnapshot.henchmanGroupIds, indexes.henchmanGroupsById);

  if (!isValid) {
    notices.push(`Removed invalid stored game history record '${typeof r.id === 'string' ? r.id : 'unknown'}'.`);
    return null;
  }

  let playMode: PlayMode;
  try {
    playMode = resolvePlayMode(r.playerCount as number, {
      advancedSolo: r.advancedSolo as boolean,
      playMode: r.playMode as string
    });
  } catch {
    return null;
  }

  const sanitizedResult = sanitizeStoredGameResult(r.result, r.playerCount as number);
  if (sanitizedResult.recovered) {
    notices.push(`Recovered invalid stored game result for '${typeof r.id === 'string' ? r.id : 'unknown'}'.`);
  }

  return {
    id: r.id as string,
    createdAt: r.createdAt as string,
    playerCount: r.playerCount as number,
    advancedSolo: playMode === 'advanced-solo',
    playMode,
    setupSnapshot: {
      mastermindId: setupSnapshot.mastermindId as string,
      schemeId: setupSnapshot.schemeId as string,
      heroIds: [...(setupSnapshot.heroIds as string[])],
      villainGroupIds: [...(setupSnapshot.villainGroupIds as string[])],
      henchmanGroupIds: [...(setupSnapshot.henchmanGroupIds as string[])]
    },
    result: sanitizedResult.result,
    epicMastermind: r.epicMastermind === true
  };
}

export function sortHistoryNewestFirst(history: HistoryRecord[]): HistoryRecord[] {
  return [...history].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}
function sanitizeIntegerRange(candidate: unknown, min: number, max: number, fallback: number): number {
  return Number.isInteger(candidate) && (candidate as number) >= min && (candidate as number) <= max ? (candidate as number) : fallback;
}
function sanitizeBoolean(candidate: unknown, fallback: boolean): boolean {
  return typeof candidate === 'boolean' ? candidate : fallback;
}

function sanitizePreferences(candidatePreferences: unknown, notices: string[]): Preferences {
  if (!isPlainObject(candidatePreferences)) {
    if (candidatePreferences !== undefined) {
      notices.push('Recovered preferences because the stored value was invalid.');
    }
    return createDefaultPreferences();
  }

  const cp = candidatePreferences as Record<string, unknown>;
  const defaultPreferences = createDefaultPreferences();
  const lastPlayerCount = sanitizeIntegerRange(cp.lastPlayerCount, 1, 5, defaultPreferences.lastPlayerCount);
  const lastAdvancedSolo = sanitizeBoolean(cp.lastAdvancedSolo, defaultPreferences.lastAdvancedSolo);
  const lastEpicMastermind = sanitizeBoolean(cp.lastEpicMastermind, false);
  let lastPlayMode: PlayMode;
  try {
    lastPlayMode = resolvePlayMode(lastPlayerCount, {
      advancedSolo: lastAdvancedSolo,
      playMode: cp.lastPlayMode as string
    });
  } catch {
    lastPlayMode = resolvePlayMode(lastPlayerCount, { advancedSolo: lastAdvancedSolo });
  }
  let selectedTab = defaultPreferences.selectedTab;
  if (cp.selectedTab === null || cp.selectedTab === undefined) {
    selectedTab = defaultPreferences.selectedTab;
  } else if (typeof cp.selectedTab === 'string') {
    selectedTab = normalizeSelectedTab(cp.selectedTab);
  }
  const onboardingCompleted = sanitizeBoolean(cp.onboardingCompleted, defaultPreferences.onboardingCompleted);
  const themeId = cp.themeId === undefined
    ? defaultPreferences.themeId
    : normalizeThemeId(cp.themeId);
  const localeId = cp.localeId === undefined
    ? defaultPreferences.localeId
    : normalizeLocaleId(cp.localeId);

  if (
    lastPlayerCount !== cp.lastPlayerCount
    || lastAdvancedSolo !== cp.lastAdvancedSolo
    || (cp.lastPlayMode !== undefined && lastPlayMode !== cp.lastPlayMode)
    || selectedTab !== cp.selectedTab
    || onboardingCompleted !== cp.onboardingCompleted
    || (cp.themeId !== undefined && themeId !== cp.themeId)
    || (cp.localeId !== undefined && localeId !== cp.localeId)
  ) {
    notices.push('Recovered invalid preference values during state hydration.');
  }

  return { lastPlayerCount, lastAdvancedSolo, lastEpicMastermind, lastPlayMode, selectedTab, onboardingCompleted, themeId, localeId };
}

function sanitizeStateCandidate(candidate: unknown, indexes: Indexes): { state: AppState; notices: string[] } {
  const notices: string[] = [];
  const defaultState = createDefaultState();

  const c = candidate as Record<string, unknown>;
  if (!isPlainObject(candidate) || c.schemaVersion !== SCHEMA_VERSION) {
    notices.push('Recovered browser state because it was missing or had an unsupported schema.');
    return { state: defaultState, notices };
  }

  const collection = c.collection as Record<string, unknown> | undefined;
  const ownedSetIds = sanitizeOwnedSetIds(collection?.ownedSetIds, indexes, notices);

  const rawActiveSetIds = collection?.activeSetIds;
  let activeSetIds: string[] | null = null;
  if (Array.isArray(rawActiveSetIds)) {
    if (rawActiveSetIds.length === 0) {
      activeSetIds = []; // explicitly empty — all boxes unchecked
    } else {
      const validActiveSetIds = rawActiveSetIds.filter((id) => typeof id === 'string' && id && ownedSetIds.includes(id));
      if (validActiveSetIds.length !== rawActiveSetIds.filter((id) => typeof id === 'string' && id).length) {
        notices.push('Removed invalid active set IDs during state hydration.');
      }
      activeSetIds = validActiveSetIds;
    }
  }

  const collectionState: CollectionState = {
    ownedSetIds,
    activeSetIds
  };

  const candidateUsage = c.usage as Record<string, unknown> | undefined;
  const usage: UsageState = {
    heroes: sanitizeUsageBucket('heroes', candidateUsage?.heroes, indexes, notices),
    masterminds: sanitizeUsageBucket('masterminds', candidateUsage?.masterminds, indexes, notices),
    villainGroups: sanitizeUsageBucket('villainGroups', candidateUsage?.villainGroups, indexes, notices),
    henchmanGroups: sanitizeUsageBucket('henchmanGroups', candidateUsage?.henchmanGroups, indexes, notices),
    schemes: sanitizeUsageBucket('schemes', candidateUsage?.schemes, indexes, notices)
  };

  const history: HistoryRecord[] = Array.isArray(c.history)
    ? sortHistoryNewestFirst((c.history as unknown[]).map((record) => sanitizeGameRecord(record, indexes, notices)).filter((r): r is HistoryRecord => r !== null))
    : [];

  if (!Array.isArray(c.history) && c.history !== undefined) {
    notices.push('Recovered game history because the stored value was invalid.');
  }

  const preferences = sanitizePreferences(c.preferences, notices);

  return {
    state: {
      schemaVersion: SCHEMA_VERSION,
      collection: collectionState,
      usage,
      history,
      preferences
    },
    notices
  };
}

export function sanitizePersistedState({ candidate, indexes }: { candidate: unknown; indexes: Indexes }): { state: AppState; notices: string[] } {
  return sanitizeStateCandidate(candidate, indexes);
}
