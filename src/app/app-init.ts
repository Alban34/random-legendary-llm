// src/app/app-init.ts
// Application initialisation — async data loading, storage setup, and state hydration.
// Extracted from App.svelte (F-02).

import { createEpic1Bundle } from './game-data-pipeline.ts';
import type { Epic1Bundle } from './game-data-pipeline.ts';
import { createStorageAdapter, hydrateState } from './state-store.ts';
import type { AppState, StorageAdapter } from './types.ts';

export interface AppInitResult {
  bundle: Epic1Bundle;
  storageAdapter: StorageAdapter;
  hydratedState: AppState;
  storageAvailable: boolean;
  hydratedFromStorage: boolean;
  recovered: boolean;
  hydrateNotices: string[];
}

async function loadSeed(): Promise<unknown> {
  const seedUrl = new URL('../data/canonical-game-data.json', import.meta.url);
  const response = await fetch(seedUrl);
  if (!response.ok) {
    throw new Error(`Unable to load canonical game data (${response.status} ${response.statusText})`);
  }
  return response.json();
}

export async function initApp(): Promise<AppInitResult> {
  const seed = await loadSeed();
  const bundle = createEpic1Bundle(seed as Parameters<typeof createEpic1Bundle>[0]);
  const storageAdapter = createStorageAdapter(globalThis.localStorage);
  const hydration = hydrateState({ storageAdapter, indexes: bundle.runtime.indexes });
  return {
    bundle,
    storageAdapter,
    hydratedState: hydration.state,
    storageAvailable: hydration.storageAvailable,
    hydratedFromStorage: hydration.hydratedFromStorage,
    recovered: hydration.recovered,
    hydrateNotices: hydration.notices
  };
}
