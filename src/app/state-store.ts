import { deepClone } from './object-utils.ts';
import { createCompletedGameResult, createPendingGameResult, createPerPlayerScoreArray, GAME_RESULT_STATUS_PENDING, sanitizeStoredGameResult } from './result-utils.ts';
import { resolvePlayMode } from './setup-rules.ts';
import { createUnavailableResult } from './storage-adapter.ts';
import {
  sortHistoryNewestFirst
} from './state-sanitizer.ts';
import { createDefaultState, STORAGE_KEY, USAGE_CATEGORIES } from './state-defaults.ts';
import type {
  AppState,
  GameOutcome,
  GameResult,
  HistoryRecord,
  PlayMode,
  StorageAdapter,
  StorageOperationResult,
  UsageCategoryMap
} from './types';

// Barrel re-exports so existing consumers of state-store.ts continue to work
export * from './state-defaults.ts';
export * from './state-sanitizer.ts';
export * from './storage-adapter.ts';
export * from './state-io.ts';

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

export function createGameRecord({ playerCount, advancedSolo, playMode, epicMastermind, setupSnapshot, createdAt = new Date().toISOString(), id = createGameRecordId(), result = createPendingGameResult() }: CreateGameRecordParams): HistoryRecord {
  const normalizedPlayMode = resolvePlayMode(playerCount, { advancedSolo, playMode });
  let effectiveResult = result;
  if (playerCount >= 2 && result.status === GAME_RESULT_STATUS_PENDING) {
    effectiveResult = { ...result, score: createPerPlayerScoreArray(playerCount) } as unknown as GameResult;
  }
  const sanitizedResult = sanitizeStoredGameResult(effectiveResult, playerCount).result;
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
  mutableRecord!.result = createCompletedGameResult({ outcome, score, notes, updatedAt, playerCount: resolvedPlayerCount });
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
