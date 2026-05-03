# Architecture Review — 2 May 2026

## Overview

This document records the findings of a structured code audit performed against the 2026 engineering
standards (Svelte 5 Runes, ES2026, ESM modularity, clean code principles, security).  
Scope: all files under `src/`.

---

## Summary

| Severity | Count | Status |
|---|---|---|
| 🔴 Blocking | 1 | Fixed |
| 🟠 Major | 4 | Proposed — needs sprint planning |
| 🟡 Minor | 3 | Proposed — fix opportunistically |

---

## Findings

---

### F-01 — `catch (error: any)` in App.svelte 🔴 Blocking — FIXED

**File**: `src/components/App.svelte` — `generateSetup` action  
**Standard**: No `any`-equivalent patterns; annotate with precise types.

**Before**:
```ts
} catch (error: any) {
  setGeneratorError(error.message);
```

**After (applied)**:
```ts
} catch (error: unknown) {
  setGeneratorError((error as Error).message);
```

Typing a catch binding as `any` silently disables all type-checking on the error value.
The fix was applied automatically.

---

### F-02 — God Component: `App.svelte` is ~1,600 lines 🟠 Major

**File**: `src/components/App.svelte`  
**Standard**: Functions do one thing; each module has a single clear responsibility.

`App.svelte` is responsible for all of the following at once:

- App initialisation — async data loading, localStorage probing, hydration, error recovery
- A single `actions` object (~60 methods) covering every user interaction in every tab
- All cross-tab UI orchestration and state wiring
- Modal config derivation
- The full component template with three distinct render branches (loading / error / loaded)

This makes the file extremely hard to navigate, diff, and test in isolation.

**Proposed remediation**:

1. **Extract initialisation** into `src/app/app-init.ts`.  
   Return a typed `AppInitResult` (bundle, storageAdapter, hydratedState) from a single
   async `initApp()` function. `App.svelte` just calls it inside `$effect`.

2. **Move per-feature action logic into the corresponding VM module**.  
   Each `*-vm.svelte.ts` file already owns the relevant `$state`; it should also export
   an `create*Actions(deps)` factory that accepts `{ bundle, appState, locale, ... }` and
   returns the action implementations.  For example, `new-game-vm.svelte.ts` exports
   `createNewGameActions(...)` containing `generateSetup`, `acceptCurrentSetup`,
   `addForcedPick`, etc.

3. **Extract `computeModalConfig`** into a pure function in `src/app/modal-utils.ts`.

4. **`App.svelte` becomes a thin orchestrator** (~300 lines): mount effects, derived
   values, prop wiring, and template.

---

### F-03 — Module-level `$state` singletons in all VM files 🟠 Major

**Files**: `src/app/new-game-vm.svelte.ts`, `history-vm.svelte.ts`, `browse-vm.svelte.ts`,
`backup-vm.svelte.ts`, `import-vm.svelte.ts`  
**Standard**: Svelte 5 — reactive dependencies should be explicit; avoid unnecessary boilerplate.

Every piece of UI state is currently declared as a private module-level `$state` variable
with a paired getter and setter:

```ts
let _currentSetup: GeneratedSetup | null = $state(null);
export function getCurrentSetup() { return _currentSetup; }
export function setCurrentSetup(v) { _currentSetup = v; }
```

Problems:

- **Boilerplate scales linearly**: each new atom requires 3 lines of accessor code.
- **Opaque dependency graph**: a `$derived` that calls `getCurrentSetup()` silently
  tracks the module-level `$state`, which is only apparent if you understand Svelte 5's
  cross-module reactivity rules.
- **Difficult to reset**: resetting a VM to its initial state requires calling each
  setter individually, making it easy to forget an atom.

**Proposed remediation**:

Replace each VM file's individual atoms with a single exported reactive state object:

```ts
// src/app/new-game-vm.svelte.ts
export const newGameVm = $state({
  currentSetup: null as GeneratedSetup | null,
  generatorError: null as string | null,
  generatorNotices: [] as string[],
  selectedPlayerCount: 1,
  selectedPlayMode: 'standard' as PlayMode,
  advancedSolo: false,
  forcedPicks: createEmptyForcedPicks()
});
```

Consumers access `newGameVm.currentSetup` directly; `App.svelte` passes
`newGameVm.selectedPlayerCount` as a prop. Dependencies are explicit and boilerplate
disappears entirely.

---

### F-04 — Parallel `.mjs` / `.ts` file pairs (DRY violation) 🟠 Major — FIXED

**Files**: every `src/app/*.ts` logic module has a hand-maintained `.mjs` sibling  
(`backup-utils.mjs`, `bgg-import-utils.mjs`, `history-utils.mjs`, `result-utils.mjs`,
`state-store.mjs`, `setup-generator.mjs`, `setup-rules.mjs`, and more)  
**Standard**: DRY — duplicated logic appearing in more than one place must be extracted.

The `.mjs` files are type-annotation-stripped copies of the `.ts` files, maintained manually
so that Node-based test files can import them without a TypeScript compilation step.
Any change to a `.ts` file must be manually mirrored to its `.mjs` twin.  
This is a silent trap: a developer editing `setup-rules.ts` may not notice the `.mjs` copy,
causing tests to pass against stale logic.

**Proposed remediation** (pick one):

**Option A — Vitest with native TypeScript** (recommended):  
Configure Vitest to resolve `.ts` imports directly via its built-in esbuild/Vite transform.
Test files import from `.ts` sources; `.mjs` files are deleted entirely.  
Check `vitest.config.ts` — if it already uses Vite as the test runner, this may require
only removing the `.mjs` aliases.

**Option B — Generated `.mjs` as a build artefact**:  
Add a `prebuild` / `generate` npm script that runs `tsc --module esnext --outDir src/app/.gen/`.
Test files import from `.gen/`; the `.gen/` directory is gitignored.  
Hand-maintained `.mjs` files are deleted.

Either option eliminates the duplication. Option A is lower overhead.

---

### F-05 — In-place mutation of `currentState` inside `applyStateUpdate` updaters 🟠 Major

**File**: `src/components/App.svelte` — Lines 463–483, 756, 765, 776  
**Standard**: Prefer immutable spread patterns; avoid `delete obj.key` and in-place mutation.

Several updater functions mutate the state object they receive and return it:

```ts
applyStateUpdate((currentState: AppState) => {
  currentState.preferences.lastPlayerCount = playerCount;   // ← mutation
  currentState.preferences.lastAdvancedSolo = advancedSolo;
  currentState.preferences.lastPlayMode = normalizedPlayMode;
  return currentState;
}, actionNotice);
```

This is safe today **only because** `applyStateUpdate` passes a `$state.snapshot()` deep
clone as input. If that implementation detail ever changes — or if a future developer
passes a live state reference — silent bugs will result.

**Proposed remediation**:

Either use immutable spread at the call site:

```ts
applyStateUpdate((s) => ({
  ...s,
  preferences: {
    ...s.preferences,
    lastPlayerCount: playerCount,
    lastAdvancedSolo: advancedSolo,
    lastPlayMode: normalizedPlayMode
  }
}), actionNotice);
```

Or (preferred) add dedicated updater functions in `state-store.ts` for each preference
mutation, following the same pattern as the existing `toggleOwnedSet`, `setActiveSetIds`,
`clearActiveSetIds`, etc.  This makes call sites in `App.svelte` trivially readable and
centralises all mutation logic in one place.

---

### F-06 — `getLocaleFlag` and `getThemeIcon` defined inside App.svelte 🟡 Minor

**File**: `src/components/App.svelte`  
**Standard**: Each module has a single clear responsibility.

Two private lookup functions are defined in the component instead of their natural home:

```ts
function getLocaleFlag(localeId: string) { ... }   // belongs in localization-utils.ts
function getThemeIcon(themeId: string) { ... }     // belongs in theme-utils.ts
```

**Proposed**: Move both as named exports to the respective utils files and import them.

---

### F-07 — `setTimeout(…, 50)` magic number in focus management effect 🟡 Minor

**File**: `src/components/App.svelte` — Line 198  
**Standard**: Magic numbers must be named constants; prefer `queueMicrotask` over arbitrary delays.

```ts
setTimeout(() => {
  if (document.contains(candidate)) candidate.focus();
  ...
}, 50);   // ← magic number
```

The existing `focusSelector` helper in `focus-utils.ts` uses `queueMicrotask` for DOM-tick
deferrals. The 50 ms here compensates for a toast dismiss animation.

**Proposed**: Replace with a `transitionend` listener on the toast element, or at minimum
extract the constant:

```ts
const TOAST_DISMISS_FOCUS_DELAY_MS = 50;
```

---

### F-08 — `computeModalConfig` has hidden reactive dependencies 🟡 Minor

**File**: `src/components/App.svelte` — Line 153  
**Standard**: Reactive dependencies should be explicit.

```ts
let modalConfig = $derived(isLoaded ? computeModalConfig() : null);
```

`computeModalConfig()` calls `getConfirmBackupRestoreMode()` and `getStagedBackup()`
internally — reading module-level `$state` from `backup-vm.svelte.ts`.  
Svelte 5 tracks these automatically, but a reader cannot determine the reactive surface
of `computeModalConfig` without reading its entire body.

**Proposed**: Pass reactive values as explicit arguments:

```ts
let modalConfig = $derived(
  isLoaded
    ? computeModalConfig({
        locale,
        appState,
        confirmResetOwnedCollection: ui.confirmResetOwnedCollection,
        confirmResetAllState: ui.confirmResetAllState,
        confirmBackupRestoreMode: getConfirmBackupRestoreMode(),
        stagedBackup: getStagedBackup(),
        actions
      })
    : null
);
```

---

## Prioritised Remediation Backlog

| # | ID | Severity | Title | Estimated Effort |
|---|---|---|---|---|
| 1 | F-04 | 🟠 Major | Eliminate `.mjs`/`.ts` duplicate file pairs | Medium |
| 2 | F-03 | 🟠 Major | VM singletons → class-based `$state` objects | Medium |
| 3 | F-02 | 🟠 Major | App.svelte God Component → split into feature controllers | Large |
| 4 | F-05 | 🟠 Major | Updater mutation pattern → immutable spread / dedicated store fns | Small |
| 5 | F-06 | 🟡 Minor | Move `getLocaleFlag`/`getThemeIcon` to utils | Tiny |
| 6 | F-07 | 🟡 Minor | Replace `setTimeout(…, 50)` magic number | Small |
| 7 | F-08 | 🟡 Minor | Explicit deps for `computeModalConfig` | Small |

**F-01 is already resolved** (applied automatically during the audit).

The highest-leverage fix for long-term maintainability is **F-04** (the `.mjs` duplicates)
because it is a silent maintenance trap with no automatic safety net.  
**F-02** (the God Component) is the largest structural debt but also the largest refactor —
it is best tackled incrementally over a sprint by extracting one feature controller at a time.
