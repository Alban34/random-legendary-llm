## Epic 60 — Sets Browser Sort Order

**Objective**
Let users choose how the sets list in the Browse tab is ordered — by name, by release year, or by whether the set is in their collection — so that players can quickly find recently added content, scan alphabetically, or see what they own at a glance.

**Background**
`filterBrowseSets()` in `browse-utils.mjs` currently applies a fixed A–Z name sort after filtering. The browse toolbar exposes a text search and a type filter but no sort control. Set objects already carry a `year` field (integer) in the data model and are linked to the user's `ownedSetIds` through `appState.collection`. The sort order should follow the same session-level reactive pattern as `browseTypeFilter` (not persisted to localStorage) and must be internationalized across all six supported locales.

**In scope**
- A `sortKey` parameter added to `filterBrowseSets()` (and its exported constant list) supporting three values: `'name'`, `'releaseYear'`, and `'collection'`
- Sort comparators: name → A–Z by `set.name`; releaseYear → ascending `set.year`, A–Z name as tiebreaker; collection → owned sets first, then unowned, A–Z name within each group
- A sort selector control (segmented button group or `<select>`) added to the browse toolbar in `BrowseTab.svelte`, wired to a new session-level reactive variable `browseSortKey`
- The `browseSortKey` variable defaulting to `'name'` on each page load (session state only — no localStorage persistence)
- Locale strings for the sort group label and all three sort option labels in all six locale files (`en.mjs`, `fr.mjs`, `de.mjs`, `es.mjs`, `ja.mjs`, `ko.mjs`)
- Aria label on the sort control group for screen-reader accessibility

**Out of scope**
- Persisting `browseSortKey` across page reloads or sessions in `appState.preferences`
- Descending sort directions or user-toggled asc/desc per key
- Sorting within the Collection tab, the New Game tab, or any other view
- Filtering by ownership (separate from sorting)
- Adding a `releaseYear` display badge to browse set cards (the year field is used for sorting only)

**Stories**
1. **Extend `filterBrowseSets()` to accept a `sortKey` parameter and implement the name, release-year, and collection-ownership comparators**
2. **Add a sort selector to the browse toolbar in `BrowseTab.svelte` and wire it to a new `browseSortKey` session variable**
3. **Add and translate locale strings for the sort control label and all three sort option labels across all six locale files**

**Acceptance Criteria**
- Story 1: `filterBrowseSets(sets, { sortKey: 'name' })` returns sets sorted A–Z by `set.name`; `filterBrowseSets(sets, { sortKey: 'releaseYear' })` returns sets sorted ascending by `set.year` with A–Z name as a tiebreaker for equal years; `filterBrowseSets(sets, { sortKey: 'collection', ownedSetIds: new Set([...]) })` returns owned sets before unowned sets, each group sorted A–Z by name; calling `filterBrowseSets()` with no `sortKey` continues to produce the existing A–Z name sort (no regression); the exported constant list `BROWSE_SORT_OPTIONS` contains exactly the three sort keys.
- Story 2: The browse toolbar renders a sort selector with three options (Name, Release Year, In Collection); selecting an option immediately re-orders the visible set list without a page reload; the currently active sort option is visually distinguished (matching the existing type-filter button-group pattern); no regression to the search input or type-filter behaviour; the sort selector resets to `'name'` on page reload.
- Story 3: All six locale files contain non-empty, translated strings for the sort group label and each of the three sort option labels under consistent locale keys prefixed with `browse.sort`; no raw locale key is visible in the UI when any sort option is selected; `npm run lint` passes.
