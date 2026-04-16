## Epic 32 — Feature Tab Components Migration

**Status: Approved**

**Objective**
Convert each major feature tab — Browse, Collection, New Game, History, and Stats — from DOM-manipulation rendering functions into Svelte 5 components, completing the full UI layer migration from vanilla JS to Svelte.

**In scope**
- Browse tab: set grid, set detail expansion, search/filter controls, ownership toggle
- Collection tab: grouped checklist, category totals, capacity indicators, collection reset
- New Game tab: player-count controls, setup generation, result display, Accept & Log
- History tab: history list, record expansion, result editing
- Stats tab: per-category usage panels, collapsible sections, reset actions
- all feature behavior must be preserved exactly — no functional changes during migration

**Stories**
1. **Convert Browse tab rendering to a `BrowseTab.svelte` component with reactive filtering**
2. **Convert Collection tab rendering to a `CollectionTab.svelte` component with reactive ownership state**
3. **Convert New Game tab to a `NewGameTab.svelte` component with reactive setup generation flow**
4. **Convert History tab to a `HistoryTab.svelte` component with reactive record expansion**
5. **Convert Stats tab to a `StatsTab.svelte` component with reactive usage displays**
6. **Run the full Playwright end-to-end suite and confirm all feature scenarios pass**

**Acceptance Criteria**
- Story 1: `BrowseTab.svelte` renders the set grid; search filtering and ownership toggles are driven by reactive state; no standalone DOM manipulation functions remain for Browse rendering.
- Story 2: `CollectionTab.svelte` mirrors ownership state with Browse; category totals and capacity indicators update reactively; collection reset with confirmation works as before.
- Story 3: `NewGameTab.svelte` generates, displays, and accepts setups; player-count and Advanced Solo controls update reactively; Regenerate does not consume history state.
- Story 4: `HistoryTab.svelte` renders history in newest-first order; records expand and collapse; result editing actions remain functional.
- Story 5: `StatsTab.svelte` displays per-category usage panels that expand and collapse correctly; all reset actions work as before.
- Story 6: The full Playwright suite exits with zero failures after all feature tab components are in place.

---
