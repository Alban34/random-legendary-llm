// src/app/state-store.svelte.js
// Svelte 5 reactive wrapper around the plain state-store module.
// This file is for use by Svelte components ONLY (.svelte files or .svelte.js modules).
// Node unit tests must import from state-store.mjs directly — they do not go through this file.

export * from './state-store.mjs';

import { createDefaultState } from './state-store.mjs';

// ---------------------------------------------------------------------------
// Reactive application state
// ---------------------------------------------------------------------------
// _appState is the single source of truth for the in-memory application state
// when running inside the Svelte component tree. It is initialised with the
// plain default shape; callers should call setAppState() immediately after
// hydrating from localStorage (via hydrateState / loadState from state-store.mjs).
//
// Rules:
//  - Read  : call getAppState() inside a $derived or reactive expression
//  - Write : call setAppState(newState) after every state-producing function
//            (acceptGameSetup, toggleOwnedSet, updateState, resetAllState, etc.)
//  - Never assign _appState directly outside this module.
// ---------------------------------------------------------------------------

let _appState = $state(createDefaultState());

/**
 * Returns the current reactive application state object.
 * Reads inside $derived or Svelte component scripts will track this automatically.
 */
export function getAppState() {
  return _appState;
}

/**
 * Replaces the reactive application state in-place so that all Svelte
 * subscriptions see the update without recreating the proxy.
 *
 * @param {ReturnType<import('./state-store.mjs').createDefaultState>} newState
 */
export function setAppState(newState) {
  Object.assign(_appState, newState);
}
