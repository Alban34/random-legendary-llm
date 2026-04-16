# Epic 46 — Active Expansion Filter ("Play Set"): Task List

## Story 46.1 — Model and persist the active expansion filter in the collection state slice

- [ ] Locate the `collection` slice definition in `src/app/collection-utils.mjs` (or whichever module owns the state shape) and add an `activeSetIds` field typed as `string[]` with a default value of `[]` (empty array = no filter, meaning all owned expansions are used)
- [ ] Update the `createDefaultState` (or equivalent) function so that any newly-created state object includes `activeSetIds: []`
- [ ] Add a `setActiveSetIds(ids)` action (or equivalent state updater) that accepts a `string[]` and replaces `activeSetIds` with the provided value; export this from the same module as the other collection actions
- [ ] Add a `clearActiveSetIds()` action that sets `activeSetIds` back to `[]`; this is the canonical way to restore the "use all owned" behavior
- [ ] In the state hydration / migration path (where `legendary_state_v1` is loaded from `localStorage`), add a sanitization step that removes any entry in `activeSetIds` that is not present in `ownedSetIds` at load time; after removal, emit a state-recovery notice (use the existing notice/toast system) if any IDs were dropped
- [ ] In the owned-set toggle logic (the handler for toggling a set's ownership to `false`), also remove the deselected set ID from `activeSetIds` if it is present; this keeps `activeSetIds` a valid subset of `ownedSetIds` at all times
- [ ] Confirm `activeSetIds` is included in the object written to and read from `localStorage` as part of the existing `legendary_state_v1` key — no schema version bump required if backward-compatible defaulting is handled in step 3 above
- [ ] **Test:** open the app in a browser; own three expansions; use the dev console to call `setActiveSetIds(['core-set'])` via the actions object; reload the page; confirm `activeSetIds` still contains only `'core-set'` after hydration; then deselect Core Set ownership and confirm it is also removed from `activeSetIds`; restore ownership and confirm `activeSetIds` remains as set
- [ ] **QC (Automated):** add `test/epic46-active-filter.test.mjs`; assert that `createDefaultState()` produces `activeSetIds: []`; assert `setActiveSetIds` replaces the field correctly; assert `clearActiveSetIds` resets it to `[]`; assert hydration sanitization removes an ID not in `ownedSetIds` and leaves valid IDs intact; assert toggling a set's ownership to `false` removes that set's ID from `activeSetIds` if present; run `npm run lint` and confirm no ESLint errors in modified source files

---

## Story 46.2 — Wire the active filter through the setup generator and validator

- [ ] Locate `validateSetupLegality` in `src/app/` (likely `setup-generator.mjs` or `collection-utils.mjs`) and identify where it calls `buildOwnedPools`
- [ ] Update `validateSetupLegality` to accept `activeSetIds` as a parameter (or read it from the state passed in); if `activeSetIds.length > 0`, resolve the pool by calling `buildOwnedPools(runtime, activeSetIds)`; if `activeSetIds` is empty, fall back to `buildOwnedPools(runtime, ownedSetIds)` — preserving all existing behavior
- [ ] Locate `generateSetup` and apply the identical pool-resolution logic: if `activeSetIds.length > 0`, use `buildOwnedPools(runtime, activeSetIds)`; otherwise use `buildOwnedPools(runtime, ownedSetIds)`
- [ ] Ensure neither function mutates `activeSetIds` or `ownedSetIds`; both must treat the resolved pool as read-only
- [ ] Update all call sites of `validateSetupLegality` and `generateSetup` in `src/components/App.svelte` (and elsewhere) to pass the `activeSetIds` value from the current `appState.collection.activeSetIds`
- [ ] Verify that when `activeSetIds` is empty the generated setup and validation results are identical to the pre-epic behavior; add a regression assertion for this in the test file
- [ ] **Test:** in a browser, own the Core Set and Dark City; set `activeSetIds` to `['core-set']` only; trigger setup generation; confirm the resulting setup cards all originate from Core Set only; then clear `activeSetIds` and regenerate; confirm both expansions are eligible
- [ ] **QC (Automated):** in `test/epic46-active-filter.test.mjs`, load `createEpic1Bundle`; call `validateSetupLegality` with a populated `activeSetIds` containing only one set and assert the returned pool reflects only that set's cards; call `validateSetupLegality` with `activeSetIds: []` and assert it behaves identically to the pre-epic behavior (full owned pool); call `generateSetup` with an `activeSetIds` containing a single large set and assert every card in the returned setup belongs to that set; assert `generateSetup` with `activeSetIds: []` produces valid setups across multiple iterations

---

## Story 46.3 — Build the expansion subset selector panel on the New Game tab

- [ ] In `src/components/NewGameTab.svelte` (or the equivalent New Game tab component), add a new `<section class="panel">` for the expansion subset selector, positioned above the player-count and play-mode controls but below any tab heading
- [ ] Inside the panel, render a list of all owned expansions (sourced from `appState.collection.ownedSetIds` resolved to set names via `runtime.sets`) as individually toggleable items; each item must be a `<label>` wrapping a `<input type="checkbox">` whose `checked` state reflects whether the expansion's ID is in `appState.collection.activeSetIds` (checked = in active filter; note: empty `activeSetIds` means all owned, so render all as checked when `activeSetIds` is empty)
- [ ] Toggling a checkbox calls the `setActiveSetIds` action with the updated ID array; removing the last checked item should call `clearActiveSetIds()` (resetting to empty = all-owned) rather than leaving a single checked state that prevents generation
- [ ] Add a "Select all" affordance (button or link) that calls `clearActiveSetIds()` to restore the all-owned fallback; label it "Select all" or "Use all"
- [ ] Add a "Clear all" affordance that calls `setActiveSetIds([])` when used to deselect every expansion — note: since empty = all-owned, "Clear all" should set `activeSetIds` to an empty array, which means all checkboxes appear checked in the "all" state; the UX distinction is surfaced via the summary line (see next task)
- [ ] Render a summary line below the checkbox list: when `activeSetIds.length > 0`, show "Using {activeSetIds.length} of {ownedSetIds.length} expansions"; when `activeSetIds` is empty (all-owned fallback), show "All {ownedSetIds.length} expansions"
- [ ] Every state change (checkbox toggle, select-all, clear-all) must immediately update `appState` via `updateState` so the filter is persisted without a separate save step
- [ ] If the user owns zero expansions, hide the selector panel entirely (the existing zero-owned state is handled elsewhere)
- [ ] Add localization keys `newGame.activeFilter.summaryAll` ("All {count} expansions"), `newGame.activeFilter.summaryFiltered` ("Using {active} of {total} expansions"), `newGame.activeFilter.selectAll` ("Use all expansions"), and `newGame.activeFilter.clearAll` ("Clear selection") to `src/app/locales/en.mjs` and all five other locale files
- [ ] **Test:** own three expansions; confirm all three appear in the selector with all checkboxes checked (all-owned state); deselect one; confirm the summary updates to "Using 2 of 3 expansions"; reload and confirm the selection persists; click "Use all expansions" and confirm all checkboxes return to checked and the summary reads "All 3 expansions"
- [ ] **QC (Automated):** add Playwright browser QC in `test/playwright/epic46-active-filter.spec.mjs`; assert the selector panel is visible on the New Game tab when expansions are owned; assert checking and unchecking items updates the summary text; assert "Use all expansions" restores the "All X expansions" summary; assert the persisted `activeSetIds` in `localStorage` matches the UI state after each interaction

---

## Story 46.4 — Surface a feasibility warning and disable generation when the active filter cannot produce a legal setup

- [ ] In `src/components/NewGameTab.svelte` (or the New Game tab state logic), derive the active pool from `appState.collection`: if `activeSetIds.length > 0`, use `buildOwnedPools(runtime, activeSetIds)`; otherwise use `buildOwnedPools(runtime, ownedSetIds)`
- [ ] Call `validateSetupLegality(activePool, playerCount, playMode)` reactively whenever `activeSetIds`, `playerCount`, or `playMode` changes; store the result in a local reactive variable (e.g. `filterFeasibility`)
- [ ] Bind the Generate button's `disabled` state to `filterFeasibility.result !== 'ok'` in addition to any existing disable conditions (e.g. zero owned sets); do not remove or weaken existing disable conditions
- [ ] When `filterFeasibility.result !== 'ok'`, render the legality reasons from `filterFeasibility` as an inline `<div class="notice warning">` or `<ul>` positioned immediately beneath the expansion selector panel and above the Generate button; this replaces or supplements any existing legality message area — do not introduce a second independent legality display if one already exists
- [ ] When `filterFeasibility.result === 'ok'`, hide the inline warning; no warning or placeholder must be visible
- [ ] Ensure the feasibility is re-evaluated on every change to `activeSetIds`, `playerCount`, and `playMode` without a page reload or manual trigger required
- [ ] **Test:** own only Core Set; set `activeSetIds` to a single small expansion that cannot legally satisfy a 5-player game; confirm the Generate button becomes disabled and a human-readable reason is shown inline; change player count to 1 and confirm the button re-enables if the pool is now sufficient; click "Use all expansions" and confirm the warning disappears and the Generate button is re-enabled (assuming the full collection is legal)
- [ ] **QC (Automated):** extend `test/playwright/epic46-active-filter.spec.mjs`; assert that selecting a filter that produces an insufficient pool disables the Generate button; assert the inline warning text is visible; assert changing player count to a legal value re-enables the Generate button; assert a legal filter (sufficient cards for the selected player count and play mode) shows no warning and leaves the Generate button enabled; run `npm run lint` and confirm no ESLint errors in modified source files
