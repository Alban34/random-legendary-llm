# Epic 47 — History Outcome Filter

**Objective**
Let a user narrow the history list to games with a specific outcome — won, lost, or pending result — so they can focus on a meaningful subset without scrolling through every recorded session.

**In scope**
- a filter control on the History tab offering four states: All (default), Won, Lost, Pending
- a `historyOutcomeFilter` field in the UI state slice (or a local Svelte store) holding the active filter value; `'all'` is the default/reset value
- applying the active filter to the rendered history list so only game records whose outcome matches the selection are shown
- a visible indication of the active filter (e.g. selected tab or highlighted button)
- a result count displayed beneath the filter control showing how many games match the active filter (e.g. "3 games"); the total count is not included in the count line
- "pending" matching any game record whose `result` was created by `createPendingGameResult()` (i.e. no `outcome` field set)

**Out of scope**
- combining outcome filter with other hypothetical filters (e.g. by expansion, by player count) — this epic handles outcome only
- persisting the active filter across page reloads
- sorting or reordering the filtered list (sort order is unchanged)
- any changes to `stats-utils.mjs` or the Stats Dashboard tab

**Stories**
1. **Model the outcome filter state and derive the filtered history list**
2. **Build the outcome filter control UI on the History tab**
3. **Show the filtered result count and empty-state message when no games match**

**Acceptance Criteria**
- Story 1: A reactive value (store field or Svelte derived store) holds the active outcome filter; valid values are `'all'`, `'win'`, `'loss'`, and `'pending'`; the default is `'all'`; the derived history list returned to the History tab view is the full `state.history` array when the filter is `'all'`, or a subset filtered to records whose `result.outcome` matches `'win'`/`'loss'`, or records with no `outcome` field when the filter is `'pending'`; the underlying `state.history` array is never mutated.
- Story 2: The History tab displays a row of filter options — All, Won, Lost, Pending — above the game list; the active option is visually distinguished; selecting an option updates the filter state immediately and re-renders the list; the control is keyboard-accessible and each option has an accessible label; the filter row appears only when `state.history` contains at least one record.
- Story 3: A count line below the filter control reads "X games" when a filter is active and the count differs from the total, or is omitted when showing all results; when the filtered list is empty a contextual empty-state message is shown (e.g. "No won games yet") in place of the list; switching to a different filter or back to All restores the normal list view.
