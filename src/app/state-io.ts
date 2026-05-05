import { deepClone } from './object-utils.ts';
import { createDefaultState, sanitizePersistedState, STORAGE_KEY } from './state-sanitizer.ts';
import type { AppState, RuntimeIndexes, StorageAdapter, StorageOperationResult } from './types';

type Indexes = RuntimeIndexes;

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

  const { state, notices } = sanitizePersistedState({ candidate: parsedState, indexes });
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
  const { state, notices } = sanitizePersistedState({ candidate: updatedState, indexes });
  const save = saveState({ storageAdapter, state });

  return {
    state,
    notices,
    save
  };
}
