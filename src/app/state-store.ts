import { normalizeSelectedTab } from './app-tabs.ts';
import { DEFAULT_LOCALE_ID, normalizeLocaleId } from './localization-utils.ts';
import { deepClone, isPlainObject } from './object-utils.ts';
import { createCompletedGameResult, createPendingGameResult, createPerPlayerScoreArray, GAME_RESULT_STATUS_PENDING, sanitizeStoredGameResult } from './result-utils.ts';
import { resolvePlayMode } from './setup-rules.ts';
import { DEFAULT_THEME_ID, normalizeThemeId } from './theme-utils.ts';

import type {
  AppState,
  CollectionState,
  GameOutcome,
  GameResult,
  HistoryRecord,
  LocaleId,
  PlayMode,
  Preferences,
  RuntimeIndexes,
  StorageAdapter,
  StorageOperationResult,
  ThemeId,
  UsageCategoryMap,
  UsageState
} from './types';

type Indexes = RuntimeIndexes;

export const STORAGE_KEY = 'legendary_state_v1';
export const SCHEMA_VERSION = 1;
export const USAGE_CATEGORIES = ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes'];

const USAGE_INDEX_KEYS: Record<string, string> = {
  heroes: 'heroesById',
  masterminds: 'mastermindsById',
  villainGroups: 'villainGroupsById',
  henchmanGroups: 'henchmanGroupsById',
  schemes: 'schemesById'
};

function createDefaultUsageState(): UsageState {
  return {
    heroes: {},
    masterminds: {},
    villainGroups: {},
    henchmanGroups: {},
    schemes: {}
  };
}

function createDefaultPreferences(): Preferences {
  return {
    lastPlayerCount: 1,
    lastAdvancedSolo: false,
    lastPlayMode: 'standard',
    selectedTab: null,
    onboardingCompleted: false,
    themeId: DEFAULT_THEME_ID as ThemeId,
    localeId: DEFAULT_LOCALE_ID as LocaleId
  };
}

export function createDefaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    collection: {
      ownedSetIds: [],
      activeSetIds: null
    },
    usage: createDefaultUsageState(),
    history: [],
    preferences: createDefaultPreferences()
  };
}

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
    ? (candidate.lastPlayedAt as string | null)
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
    && indexes.mastermindsById[setupSnapshot.mastermindId as string]
    && typeof setupSnapshot.schemeId === 'string'
    && indexes.schemesById[setupSnapshot.schemeId as string]
    && isValidSnapshotIds(setupSnapshot.heroIds, indexes.heroesById)
    && isValidSnapshotIds(setupSnapshot.villainGroupIds, indexes.villainGroupsById)
    && isValidSnapshotIds(setupSnapshot.henchmanGroupIds, indexes.henchmanGroupsById);

  if (!isValid) {
    notices.push(`Removed invalid stored game history record '${String(r.id ?? 'unknown')}'.`);
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
    notices.push(`Recovered invalid stored game result for '${String(r.id ?? 'unknown')}'.`);
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
    result: sanitizedResult.result as GameResult,
    epicMastermind: r.epicMastermind === true
  };
}

function sortHistoryNewestFirst(history: HistoryRecord[]): HistoryRecord[] {
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
    : normalizeThemeId(cp.themeId) as ThemeId;
  const localeId = cp.localeId === undefined
    ? defaultPreferences.localeId
    : normalizeLocaleId(cp.localeId) as LocaleId;

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

function createUnavailableResult(message: string): StorageOperationResult {
  return {
    ok: false,
    storageAvailable: false,
    message
  };
}

export function createStorageAdapter(storageCandidate: unknown): StorageAdapter {
  const unavailableMessage = 'Browser storage is unavailable; changes will only live in memory for this session.';

  const s = storageCandidate as Record<string, unknown> | null | undefined;
  if (
    !s
    || typeof s.getItem !== 'function'
    || typeof s.setItem !== 'function'
    || typeof s.removeItem !== 'function'
  ) {
    return {
      available: false,
      message: unavailableMessage,
      getItem: () => null,
      setItem: () => createUnavailableResult(unavailableMessage),
      removeItem: () => createUnavailableResult(unavailableMessage)
    };
  }

  const storage = storageCandidate as { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };

  try {
    const probeKey = '__legendary_storage_probe__';
    storage.setItem(probeKey, 'ok');
    storage.removeItem(probeKey);
  } catch (error) {
    const msg = `Browser storage is unavailable: ${(error as Error).message}`;
    return {
      available: false,
      message: msg,
      getItem: () => null,
      setItem: () => createUnavailableResult(msg),
      removeItem: () => createUnavailableResult(msg)
    };
  }

  return {
    available: true,
    message: null,
    getItem(key: string): string | null {
      return storage.getItem(key);
    },
    setItem(key: string, value: string): StorageOperationResult {
      try {
        storage.setItem(key, value);
        return {
          ok: true,
          storageAvailable: true,
          message: 'Saved browser state successfully.'
        };
      } catch (error) {
        return {
          ok: false,
          storageAvailable: true,
          message: `Failed to save browser state: ${(error as Error).message}`
        };
      }
    },
    removeItem(key: string): StorageOperationResult {
      try {
        storage.removeItem(key);
        return {
          ok: true,
          storageAvailable: true,
          message: 'Reset browser state successfully.'
        };
      } catch (error) {
        return {
          ok: false,
          storageAvailable: true,
          message: `Failed to reset browser state: ${(error as Error).message}`
        };
      }
    }
  };
}

interface LoadStateResult {
  state: AppState;
  storageAvailable: boolean;
  hydratedFromStorage: boolean;
  recovered: boolean;
  notices: string[];
}

export function loadState({ storageAdapter, indexes }: { storageAdapter: StorageAdapter; indexes: Indexes }): LoadStateResult {
  if (!storageAdapter.available) {
    return {
      state: createDefaultState(),
      storageAvailable: false,
      hydratedFromStorage: false,
      recovered: true,
      notices: [storageAdapter.message as string]
    };
  }

  const rawState = storageAdapter.getItem(STORAGE_KEY);
  if (!rawState) {
    return {
      state: createDefaultState(),
      storageAvailable: true,
      hydratedFromStorage: false,
      recovered: false,
      notices: []
    };
  }

  let parsedState: unknown;
  try {
    parsedState = JSON.parse(rawState);
  } catch {
    const recoveredState = createDefaultState();
    const save = saveState({ storageAdapter, state: recoveredState });
    return {
      state: recoveredState,
      storageAvailable: true,
      hydratedFromStorage: true,
      recovered: true,
      notices: ['Recovered browser state because the saved JSON was corrupted.', ...(save.ok ? [] : [save.message])]
    };
  }

  const { state, notices } = sanitizeStateCandidate(parsedState, indexes);
  const recovered = notices.length > 0;

  if (recovered) {
    const save = saveState({ storageAdapter, state });
    if (!save.ok) {
      notices.push(save.message);
    }
  }

  return {
    state,
    storageAvailable: true,
    hydratedFromStorage: true,
    recovered,
    notices
  };
}

export const hydrateState = loadState;

export function saveState({ storageAdapter, state }: { storageAdapter: StorageAdapter; state: AppState }): StorageOperationResult {
  return storageAdapter.setItem(STORAGE_KEY, JSON.stringify(state, null, 2));
}

export function updateState({ storageAdapter, indexes, currentState, updater }: { storageAdapter: StorageAdapter; indexes: Indexes; currentState: AppState; updater: (s: AppState) => AppState }): { state: AppState; notices: string[]; save: StorageOperationResult } {
  const draft = deepClone(currentState) as AppState;
  const updatedState = typeof updater === 'function' ? (updater(draft) ?? draft) : draft;
  const { state, notices } = sanitizeStateCandidate(updatedState, indexes);
  const save = saveState({ storageAdapter, state });

  return {
    state,
    notices,
    save
  };
}

export function toggleOwnedSet(state: AppState, setId: string): AppState {
  const nextState = deepClone(state) as AppState;
  const ownedSetIds = new Set(nextState.collection.ownedSetIds);
  if (ownedSetIds.has(setId)) {
    ownedSetIds.delete(setId);
    if (Array.isArray(nextState.collection.activeSetIds)) { nextState.collection.activeSetIds = nextState.collection.activeSetIds.filter((id) => id !== setId); }
  } else {
    ownedSetIds.add(setId);
  }
  nextState.collection.ownedSetIds = [...ownedSetIds].sort((left, right) => left.localeCompare(right));
  return nextState;
}

export function setActiveSetIds(state: AppState, ids: string[] | null): AppState {
  const nextState = deepClone(state) as AppState;
  nextState.collection.activeSetIds = ids === null ? null : [...ids];
  return nextState;
}

export function clearActiveSetIds(state: AppState): AppState {
  const nextState = deepClone(state) as AppState;
  nextState.collection.activeSetIds = null;
  return nextState;
}

export function deactivateAllSets(state: AppState): AppState {
  const nextState = deepClone(state) as AppState;
  nextState.collection.activeSetIds = [];
  return nextState;
}

export function incrementUsageStat(usageBucket: UsageCategoryMap, id: string, playedAt: string): void {
  const current = usageBucket[id] || { plays: 0, lastPlayedAt: null };
  usageBucket[id] = {
    plays: current.plays + 1,
    lastPlayedAt: playedAt
  };
}

export function createGameRecordId(): string {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `game-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

interface CreateGameRecordParams {
  playerCount: number;
  advancedSolo: boolean;
  playMode: PlayMode;
  epicMastermind?: boolean;
  setupSnapshot: {
    mastermindId: string;
    schemeId: string;
    heroIds: string[];
    villainGroupIds: string[];
    henchmanGroupIds: string[];
  };
  createdAt?: string;
  id?: string;
  result?: GameResult;
}

export function createGameRecord({ playerCount, advancedSolo, playMode, epicMastermind, setupSnapshot, createdAt = new Date().toISOString(), id = createGameRecordId(), result = createPendingGameResult() as GameResult }: CreateGameRecordParams): HistoryRecord {
  const normalizedPlayMode = resolvePlayMode(playerCount, { advancedSolo, playMode });
  let effectiveResult = result;
  if (playerCount >= 2 && result.status === GAME_RESULT_STATUS_PENDING) {
    effectiveResult = { ...result, score: createPerPlayerScoreArray(playerCount) } as unknown as GameResult;
  }
  const sanitizedResult = sanitizeStoredGameResult(effectiveResult, playerCount).result as GameResult;
  return {
    id,
    createdAt,
    playerCount,
    advancedSolo: normalizedPlayMode === 'advanced-solo',
    playMode: normalizedPlayMode,
    setupSnapshot: {
      mastermindId: setupSnapshot.mastermindId,
      schemeId: setupSnapshot.schemeId,
      heroIds: [...setupSnapshot.heroIds],
      villainGroupIds: [...setupSnapshot.villainGroupIds],
      henchmanGroupIds: [...setupSnapshot.henchmanGroupIds]
    },
    result: sanitizedResult,
    epicMastermind: epicMastermind ?? false
  };
}

export function acceptGameSetup(state: AppState, gameConfig: CreateGameRecordParams): AppState {
  const nextState = deepClone(state) as AppState;
  const record = createGameRecord(gameConfig);
  const playedAt = record.createdAt;

  nextState.history = sortHistoryNewestFirst([record, ...nextState.history]);
  nextState.preferences.lastPlayerCount = record.playerCount;
  nextState.preferences.lastAdvancedSolo = record.advancedSolo;
  nextState.preferences.lastPlayMode = record.playMode;
  nextState.preferences.lastEpicMastermind = record.epicMastermind ?? false;

  record.setupSnapshot.heroIds.forEach((id) => incrementUsageStat(nextState.usage.heroes, id, playedAt));
  incrementUsageStat(nextState.usage.masterminds, record.setupSnapshot.mastermindId, playedAt);
  record.setupSnapshot.villainGroupIds.forEach((id) => incrementUsageStat(nextState.usage.villainGroups, id, playedAt));
  record.setupSnapshot.henchmanGroupIds.forEach((id) => incrementUsageStat(nextState.usage.henchmanGroups, id, playedAt));
  incrementUsageStat(nextState.usage.schemes, record.setupSnapshot.schemeId, playedAt);

  return nextState;
}

interface UpdateGameResultParams {
  recordId: string;
  outcome: GameOutcome;
  score: number | null | Array<{ playerName: string; score: number | null }>;
  notes?: string;
  updatedAt?: string;
  playerCount?: number;
}

export function updateGameResult(state: AppState, { recordId, outcome, score, notes = '', updatedAt = new Date().toISOString(), playerCount }: UpdateGameResultParams): AppState {
  const targetRecord = state.history.find((record) => record.id === recordId);

  if (!targetRecord) {
    return state;
  }

  // Only activate the multiplayer path when score is explicitly a per-player array.
  // Legacy callers that pass a number score for a multi-player record continue to use the solo path.
  const resolvedPlayerCount = Array.isArray(score)
    ? (targetRecord.playerCount ?? playerCount ?? 1)
    : (playerCount ?? 1);

  const nextState = structuredClone(state) as AppState;
  const mutableRecord = nextState.history.find((record) => record.id === recordId);
  mutableRecord!.result = createCompletedGameResult({ outcome, score, notes, updatedAt, playerCount: resolvedPlayerCount }) as GameResult;
  return nextState;
}

export function resetUsageCategory(state: AppState, category: string): AppState {
  const nextState = deepClone(state) as AppState;
  if (USAGE_CATEGORIES.includes(category)) {
    (nextState.usage as unknown as Record<string, UsageCategoryMap>)[category] = {};
  }
  return nextState;
}

export function resetOwnedCollection(state: AppState): AppState {
  const nextState = deepClone(state) as AppState;
  nextState.collection.ownedSetIds = [];
  return nextState;
}

export function resetAllState({ storageAdapter }: { storageAdapter: StorageAdapter }): { state: AppState; save: StorageOperationResult; notices: string[] } {
  const state = createDefaultState();
  const save = storageAdapter.available
    ? storageAdapter.removeItem(STORAGE_KEY)
    : createUnavailableResult(storageAdapter.message as string);

  return {
    state,
    save,
    notices: []
  };
}
