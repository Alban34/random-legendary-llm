// src/app/state-store.svelte.ts
// Svelte 5 reactive wrapper around the plain state-store module.
// This file is for use by Svelte components ONLY (.svelte files or .svelte.ts modules).
// Node unit tests must import from state-store.ts directly — they do not go through this file.

export * from './state-store.ts';

import { createDefaultState } from './state-store.ts';
import type { AppState } from './types.ts';

// ---------------------------------------------------------------------------
// Reactive application state
// ---------------------------------------------------------------------------
// _appState is the single source of truth for the in-memory application state
// when running inside the Svelte component tree. It is initialised with the
// plain default shape; callers should call setAppState() immediately after
// hydrating from localStorage (via hydrateState / loadState from state-store.ts).
//
// Rules:
//  - Read  : call getAppState() inside a $derived or reactive expression
//  - Write : call setAppState(newState) after every state-producing function
//            (acceptGameSetup, toggleOwnedSet, updateState, resetAllState, etc.)
//  - Never assign _appState directly outside this module.
// ---------------------------------------------------------------------------

const _appState: AppState = $state<AppState>(createDefaultState());

/**
 * Returns the current reactive application state object.
 * Reads inside $derived or Svelte component scripts will track this automatically.
 */
export function getAppState(): AppState {
  return _appState;
}

/**
 * Replaces the reactive application state in-place so that all Svelte
 * subscriptions see the update without recreating the proxy.
 */
export function setAppState(newState: AppState): void {
  Object.assign(_appState, newState);
}
