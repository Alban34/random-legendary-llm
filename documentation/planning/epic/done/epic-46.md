## Epic 46 — Active Expansion Filter ("Play Set")

**Objective**
Let a user choose a subset of their owned expansions to restrict a given randomization session — so that a player who owns ten expansions can generate a setup using only two tonight, and a different two tomorrow, without altering their permanent owned collection.

**In scope**
- a new `activeSetIds` field in the `collection` state slice that records which owned expansions are currently selected for generation; an empty value means "use all owned expansions" (no filter)
- persisting `activeSetIds` in localStorage alongside the rest of the collection state so the last-used filter survives page reload
- sanitization of `activeSetIds` on state hydration: remove IDs that are not in `ownedSetIds`
- wiring the active filter through `validateSetupLegality` and `generateSetup` so both functions draw from the active subset (or the full owned pool when no filter is set)
- an expansion subset selector UI on the New Game tab showing owned expansions as individually toggleable items with select-all and clear-all affordances, and a "Using X of Y expansions" summary line
- a feasibility warning shown on the New Game tab when the active filter's card pool is too small to produce a legal setup for the selected player count and play mode — with the Generate button disabled in that state

**Out of scope**
- saving named "play set" presets that can be recalled by name (possible future epic)
- filtering the browse or collection tabs based on the active expansion filter
- any changes to how `ownedSetIds` itself is managed (collection ownership remains separate from the active filter)
- forced-picks behavior (Epic 15); the active filter operates at the expansion level, not the card level

**Stories**
1. **Model and persist the active expansion filter in the collection state slice**
2. **Wire the active filter through the setup generator and validator**
3. **Build the expansion subset selector panel on the New Game tab**
4. **Surface a feasibility warning and disable generation when the active filter cannot produce a legal setup**

**Acceptance Criteria**
- Story 1: The `collection` state slice gains an `activeSetIds` field (array of set ID strings, default empty); an empty array is the canonical "no filter" value; on hydration any ID not present in `ownedSetIds` is silently removed and a state-recovery notice is emitted; toggling a set's ownership off also removes it from `activeSetIds`; `activeSetIds` is written to and read from localStorage as part of the existing `legendary_state_v1` key; a state action exists to set `activeSetIds` and another to clear it back to empty.
- Story 2: Both `validateSetupLegality` and `generateSetup` resolve the active pool as: if `activeSetIds` is non-empty, use `buildOwnedPools(runtime, activeSetIds)` (guaranteed to be a subset of owned); otherwise fall back to `buildOwnedPools(runtime, ownedSetIds)`; all existing behaviour when no filter is active is preserved; unit tests confirm both the filtered and unfiltered paths.
- Story 3: The New Game tab exposes an expansion selector control that lists every owned expansion as a toggleable item; toggling an item adds or removes it from `activeSetIds`; a "Select all" control sets `activeSetIds` to empty (all-owned fallback); a "Clear all" control deselects every expansion; a summary line reads "Using X of Y expansions" when a filter is active, or "All X expansions" when none is active; changes to the selector are reflected immediately in the persisted state.
- Story 4: Before the Generate button is enabled, the UI evaluates `validateSetupLegality` against the resolved active pool for the currently selected player count and play mode; if the result is not `ok`, the Generate button is disabled and the legality reasons are displayed inline beneath the selector; when the active pool changes or the player count / play mode changes the feasibility is re-evaluated; a legal active filter leaves the Generate button enabled with no inline warning.
