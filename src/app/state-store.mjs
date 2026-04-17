import { normalizeSelectedTab } from './app-tabs.mjs';
import { DEFAULT_LOCALE_ID, normalizeLocaleId } from './localization-utils.mjs';
import { deepClone, isPlainObject } from './object-utils.mjs';
import { createCompletedGameResult, createPendingGameResult, sanitizeStoredGameResult } from './result-utils.mjs';
import { resolvePlayMode } from './setup-rules.mjs';
import { DEFAULT_THEME_ID, normalizeThemeId } from './theme-utils.mjs';

export const STORAGE_KEY = 'legendary_state_v1';
export const SCHEMA_VERSION = 1;
export const USAGE_CATEGORIES = ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes'];

const USAGE_INDEX_KEYS = {
  heroes: 'heroesById',
  masterminds: 'mastermindsById',
  villainGroups: 'villainGroupsById',
  henchmanGroups: 'henchmanGroupsById',
  schemes: 'schemesById'
};

function createDefaultUsageState() {
  return {
    heroes: {},
    masterminds: {},
    villainGroups: {},
    henchmanGroups: {},
    schemes: {}
  };
}

function createDefaultPreferences() {
  return {
    lastPlayerCount: 1,
    lastAdvancedSolo: false,
    lastPlayMode: 'standard',
    selectedTab: null,
    onboardingCompleted: false,
    themeId: DEFAULT_THEME_ID,
    localeId: DEFAULT_LOCALE_ID
  };
}

export function createDefaultState() {
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

function uniqueSortedStrings(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value))].sort((left, right) => left.localeCompare(right));
}

function sanitizeOwnedSetIds(candidateIds, indexes, notices) {
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

function sanitizeUsageStat(stat) {
  if (!isPlainObject(stat)) {
    return null;
  }

  const plays = Number.isInteger(stat.plays) && stat.plays >= 0 ? stat.plays : null;
  const lastPlayedAt = stat.lastPlayedAt === null || typeof stat.lastPlayedAt === 'string'
    ? stat.lastPlayedAt
    : null;

  if (plays === null) {
    return null;
  }

  return { plays, lastPlayedAt };
}

function sanitizeUsageBucket(category, candidateBucket, indexes, notices) {
  const sanitizedBucket = {};
  const validLookup = indexes[USAGE_INDEX_KEYS[category]];

  if (!isPlainObject(candidateBucket)) {
    if (candidateBucket !== undefined) {
      notices.push(`Recovered ${category} usage because the stored value was invalid.`);
    }
    return sanitizedBucket;
  }

  for (const [id, stat] of Object.entries(candidateBucket)) {
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

function isValidSnapshotIds(ids, lookup) {
  return Array.isArray(ids) && ids.every((id) => typeof id === 'string' && lookup[id]);
}

function sanitizeGameRecord(record, indexes, notices) {
  if (!isPlainObject(record) || !isPlainObject(record.setupSnapshot)) {
    notices.push('Removed an invalid stored game history record during hydration.');
    return null;
  }

  const { setupSnapshot } = record;
  const isValid = typeof record.id === 'string'
    && typeof record.createdAt === 'string'
    && Number.isInteger(record.playerCount)
    && record.playerCount >= 1
    && record.playerCount <= 5
    && typeof record.advancedSolo === 'boolean'
    && typeof setupSnapshot.mastermindId === 'string'
    && indexes.mastermindsById[setupSnapshot.mastermindId]
    && typeof setupSnapshot.schemeId === 'string'
    && indexes.schemesById[setupSnapshot.schemeId]
    && isValidSnapshotIds(setupSnapshot.heroIds, indexes.heroesById)
    && isValidSnapshotIds(setupSnapshot.villainGroupIds, indexes.villainGroupsById)
    && isValidSnapshotIds(setupSnapshot.henchmanGroupIds, indexes.henchmanGroupsById);

  if (!isValid) {
    notices.push(`Removed invalid stored game history record '${record.id ?? 'unknown'}'.`);
    return null;
  }

  let playMode;
  try {
    playMode = resolvePlayMode(record.playerCount, {
      advancedSolo: record.advancedSolo,
      playMode: record.playMode
    });
  } catch {
    return null;
  }

  const sanitizedResult = sanitizeStoredGameResult(record.result);
  if (sanitizedResult.recovered) {
    notices.push(`Recovered invalid stored game result for '${record.id ?? 'unknown'}'.`);
  }

  return {
    id: record.id,
    createdAt: record.createdAt,
    playerCount: record.playerCount,
    advancedSolo: playMode === 'advanced-solo',
    playMode,
    setupSnapshot: {
      mastermindId: record.setupSnapshot.mastermindId,
      schemeId: record.setupSnapshot.schemeId,
      heroIds: [...record.setupSnapshot.heroIds],
      villainGroupIds: [...record.setupSnapshot.villainGroupIds],
      henchmanGroupIds: [...record.setupSnapshot.henchmanGroupIds]
    },
    result: sanitizedResult.result
  };
}

function sortHistoryNewestFirst(history) {
  return [...history].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

function sanitizeIntegerRange(candidate, min, max, fallback) {
  return Number.isInteger(candidate) && candidate >= min && candidate <= max ? candidate : fallback;
}

function sanitizeBoolean(candidate, fallback) {
  return typeof candidate === 'boolean' ? candidate : fallback;
}

function sanitizePreferences(candidatePreferences, notices) {
  if (!isPlainObject(candidatePreferences)) {
    if (candidatePreferences !== undefined) {
      notices.push('Recovered preferences because the stored value was invalid.');
    }
    return createDefaultPreferences();
  }

  const defaultPreferences = createDefaultPreferences();
  const lastPlayerCount = sanitizeIntegerRange(candidatePreferences.lastPlayerCount, 1, 5, defaultPreferences.lastPlayerCount);
  const lastAdvancedSolo = sanitizeBoolean(candidatePreferences.lastAdvancedSolo, defaultPreferences.lastAdvancedSolo);
  let lastPlayMode;
  try {
    lastPlayMode = resolvePlayMode(lastPlayerCount, {
      advancedSolo: lastAdvancedSolo,
      playMode: candidatePreferences.lastPlayMode
    });
  } catch {
    lastPlayMode = resolvePlayMode(lastPlayerCount, { advancedSolo: lastAdvancedSolo });
  }
  let selectedTab = defaultPreferences.selectedTab;
  if (candidatePreferences.selectedTab === null || candidatePreferences.selectedTab === undefined) {
    selectedTab = defaultPreferences.selectedTab;
  } else if (typeof candidatePreferences.selectedTab === 'string') {
    selectedTab = normalizeSelectedTab(candidatePreferences.selectedTab);
  }
  const onboardingCompleted = sanitizeBoolean(candidatePreferences.onboardingCompleted, defaultPreferences.onboardingCompleted);
  const themeId = candidatePreferences.themeId === undefined
    ? defaultPreferences.themeId
    : normalizeThemeId(candidatePreferences.themeId);
  const localeId = candidatePreferences.localeId === undefined
    ? defaultPreferences.localeId
    : normalizeLocaleId(candidatePreferences.localeId);

  if (
    lastPlayerCount !== candidatePreferences.lastPlayerCount
    || lastAdvancedSolo !== candidatePreferences.lastAdvancedSolo
    || (candidatePreferences.lastPlayMode !== undefined && lastPlayMode !== candidatePreferences.lastPlayMode)
    || selectedTab !== candidatePreferences.selectedTab
    || onboardingCompleted !== candidatePreferences.onboardingCompleted
    || (candidatePreferences.themeId !== undefined && themeId !== candidatePreferences.themeId)
    || (candidatePreferences.localeId !== undefined && localeId !== candidatePreferences.localeId)
  ) {
    notices.push('Recovered invalid preference values during state hydration.');
  }

  return { lastPlayerCount, lastAdvancedSolo, lastPlayMode, selectedTab, onboardingCompleted, themeId, localeId };
}

function sanitizeStateCandidate(candidate, indexes) {
  const notices = [];
  const defaultState = createDefaultState();

  if (!isPlainObject(candidate) || candidate.schemaVersion !== SCHEMA_VERSION) {
    notices.push('Recovered browser state because it was missing or had an unsupported schema.');
    return { state: defaultState, notices };
  }

  const ownedSetIds = sanitizeOwnedSetIds(candidate.collection?.ownedSetIds, indexes, notices);

  const rawActiveSetIds = candidate.collection?.activeSetIds;
  let activeSetIds = null;
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

  const collection = {
    ownedSetIds,
    activeSetIds
  };

  const usage = {};
  for (const category of USAGE_CATEGORIES) {
    usage[category] = sanitizeUsageBucket(category, candidate.usage?.[category], indexes, notices);
  }

  const history = Array.isArray(candidate.history)
    ? sortHistoryNewestFirst(candidate.history.map((record) => sanitizeGameRecord(record, indexes, notices)).filter(Boolean))
    : [];

  if (!Array.isArray(candidate.history) && candidate.history !== undefined) {
    notices.push('Recovered game history because the stored value was invalid.');
  }

  const preferences = sanitizePreferences(candidate.preferences, notices);

  return {
    state: {
      schemaVersion: SCHEMA_VERSION,
      collection,
      usage,
      history,
      preferences
    },
    notices
  };
}

export function sanitizePersistedState({ candidate, indexes }) {
  return sanitizeStateCandidate(candidate, indexes);
}

function createUnavailableResult(message) {
  return {
    ok: false,
    storageAvailable: false,
    message
  };
}

export function createStorageAdapter(storageCandidate) {
  const unavailableMessage = 'Browser storage is unavailable; changes will only live in memory for this session.';

  if (
    !storageCandidate
    || typeof storageCandidate.getItem !== 'function'
    || typeof storageCandidate.setItem !== 'function'
    || typeof storageCandidate.removeItem !== 'function'
  ) {
    return {
      available: false,
      message: unavailableMessage,
      getItem: () => null,
      setItem: () => createUnavailableResult(unavailableMessage),
      removeItem: () => createUnavailableResult(unavailableMessage)
    };
  }

  try {
    const probeKey = '__legendary_storage_probe__';
    storageCandidate.setItem(probeKey, 'ok');
    storageCandidate.removeItem(probeKey);
  } catch (error) {
    return {
      available: false,
      message: `Browser storage is unavailable: ${error.message}`,
      getItem: () => null,
      setItem: () => createUnavailableResult(`Browser storage is unavailable: ${error.message}`),
      removeItem: () => createUnavailableResult(`Browser storage is unavailable: ${error.message}`)
    };
  }

  return {
    available: true,
    message: null,
    getItem(key) {
      return storageCandidate.getItem(key);
    },
    setItem(key, value) {
      try {
        storageCandidate.setItem(key, value);
        return {
          ok: true,
          storageAvailable: true,
          message: 'Saved browser state successfully.'
        };
      } catch (error) {
        return {
          ok: false,
          storageAvailable: true,
          message: `Failed to save browser state: ${error.message}`
        };
      }
    },
    removeItem(key) {
      try {
        storageCandidate.removeItem(key);
        return {
          ok: true,
          storageAvailable: true,
          message: 'Reset browser state successfully.'
        };
      } catch (error) {
        return {
          ok: false,
          storageAvailable: true,
          message: `Failed to reset browser state: ${error.message}`
        };
      }
    }
  };
}

export function loadState({ storageAdapter, indexes }) {
  if (!storageAdapter.available) {
    return {
      state: createDefaultState(),
      storageAvailable: false,
      hydratedFromStorage: false,
      recovered: true,
      notices: [storageAdapter.message]
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

  let parsedState;
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

export function saveState({ storageAdapter, state }) {
  return storageAdapter.setItem(STORAGE_KEY, JSON.stringify(state, null, 2));
}

export function updateState({ storageAdapter, indexes, currentState, updater }) {
  const draft = deepClone(currentState);
  const updatedState = typeof updater === 'function' ? (updater(draft) ?? draft) : draft;
  const { state, notices } = sanitizeStateCandidate(updatedState, indexes);
  const save = saveState({ storageAdapter, state });

  return {
    state,
    notices,
    save
  };
}

export function toggleOwnedSet(state, setId) {
  const nextState = deepClone(state);
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

export function setActiveSetIds(state, ids) {
  const nextState = deepClone(state);
  nextState.collection.activeSetIds = ids === null ? null : [...ids];
  return nextState;
}

export function clearActiveSetIds(state) {
  const nextState = deepClone(state);
  nextState.collection.activeSetIds = null;
  return nextState;
}

export function incrementUsageStat(usageBucket, id, playedAt) {
  const current = usageBucket[id] || { plays: 0, lastPlayedAt: null };
  usageBucket[id] = {
    plays: current.plays + 1,
    lastPlayedAt: playedAt
  };
}

export function createGameRecordId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `game-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function createGameRecord({ playerCount, advancedSolo, playMode, setupSnapshot, createdAt = new Date().toISOString(), id = createGameRecordId(), result = createPendingGameResult() }) {
  const normalizedPlayMode = resolvePlayMode(playerCount, { advancedSolo, playMode });
  const sanitizedResult = sanitizeStoredGameResult(result).result;
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
    result: sanitizedResult
  };
}

export function acceptGameSetup(state, gameConfig) {
  const nextState = deepClone(state);
  const record = createGameRecord(gameConfig);
  const playedAt = record.createdAt;

  nextState.history = sortHistoryNewestFirst([record, ...nextState.history]);
  nextState.preferences.lastPlayerCount = record.playerCount;
  nextState.preferences.lastAdvancedSolo = record.advancedSolo;
  nextState.preferences.lastPlayMode = record.playMode;

  record.setupSnapshot.heroIds.forEach((id) => incrementUsageStat(nextState.usage.heroes, id, playedAt));
  incrementUsageStat(nextState.usage.masterminds, record.setupSnapshot.mastermindId, playedAt);
  record.setupSnapshot.villainGroupIds.forEach((id) => incrementUsageStat(nextState.usage.villainGroups, id, playedAt));
  record.setupSnapshot.henchmanGroupIds.forEach((id) => incrementUsageStat(nextState.usage.henchmanGroups, id, playedAt));
  incrementUsageStat(nextState.usage.schemes, record.setupSnapshot.schemeId, playedAt);

  return nextState;
}

export function updateGameResult(state, { recordId, outcome, score, notes = '', updatedAt = new Date().toISOString() }) {
  const targetRecord = state.history.find((record) => record.id === recordId);

  if (!targetRecord) {
    return state;
  }

  const nextState = structuredClone(state);
  const mutableRecord = nextState.history.find((record) => record.id === recordId);
  mutableRecord.result = createCompletedGameResult({ outcome, score, notes, updatedAt });
  return nextState;
}

export function resetUsageCategory(state, category) {
  const nextState = deepClone(state);
  if (USAGE_CATEGORIES.includes(category)) {
    nextState.usage[category] = {};
  }
  return nextState;
}

export function resetOwnedCollection(state) {
  const nextState = deepClone(state);
  nextState.collection.ownedSetIds = [];
  return nextState;
}

export function resetAllState({ storageAdapter }) {
  const state = createDefaultState();
  const save = storageAdapter.available
    ? storageAdapter.removeItem(STORAGE_KEY)
    : createUnavailableResult(storageAdapter.message);

  return {
    state,
    save,
    notices: []
  };
}

