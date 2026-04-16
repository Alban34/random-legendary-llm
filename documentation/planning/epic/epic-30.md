## Epic 30 — Data and State Layer Migration to Svelte 5

**Status: Approved**

**Objective**
Migrate the app's data pipeline and state management modules to work correctly within the Svelte 5 reactive system without breaking any existing behavioral contract.

**In scope**
- convert `state-store.mjs` to use Svelte 5 `$state` and `$derived` runes
- make `game-data-pipeline.mjs` importable from `.svelte` components without side effects
- verify collection, history, preferences, and usage-stats persistence remain intact after migration
- ensure the app remains fully functional at this epic boundary

**Stories**
1. **Audit all stateful modules and define their Svelte 5 reactive equivalents**
2. **Migrate `state-store.mjs` to export Svelte 5 `$state`-backed reactive stores**
3. **Verify game-data-pipeline modules are free of side effects that conflict with Svelte's module runtime**
4. **Confirm all storage persistence paths survive the migration intact**
5. **Validate that all existing Node unit tests still pass against the migrated state layer**

**Acceptance Criteria**
- Story 1: A written audit maps each stateful module to its intended Svelte 5 reactive pattern before any code changes are made.
- Story 2: `state-store.mjs` (or its replacement) exports reactive state objects backed by `$state` runes; consumers no longer call explicit setter functions for simple property updates where a reactive binding suffices.
- Story 3: `game-data-pipeline.mjs` and its dependents import cleanly inside `.svelte` files without triggering unintended side effects or initialization errors.
- Story 4: A round-trip integration check (set collection, accept game, persist, reload) passes in the browser after the migration; no localStorage key is lost or renamed.
- Story 5: All unit tests under `test/epic2-state.test.mjs` and related state test files pass without modification to the test assertions.

---
