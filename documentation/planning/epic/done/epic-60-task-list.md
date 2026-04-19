# Epic 60 Task List

## Story 60.1 — Extend `filterBrowseSets()` with `sortKey` parameter

**File: `src/app/browse-utils.mjs`**

- [x] Immediately after the existing `BROWSE_TYPE_OPTIONS` constant declaration, export a new constant:
  ```js
  export const BROWSE_SORT_OPTIONS = [
    { id: 'name' },
    { id: 'releaseYear' },
    { id: 'collection' }
  ];
  ```

- [x] Update the `filterBrowseSets` function signature from:
  ```js
  export function filterBrowseSets(sets, { searchTerm = '', typeFilter = 'all' } = {}) {
  ```
  to:
  ```js
  export function filterBrowseSets(sets, { searchTerm = '', typeFilter = 'all', sortKey = 'name', ownedSetIds = new Set() } = {}) {
  ```

- [x] Replace the existing `.sort((a, b) => a.name.localeCompare(b.name))` call at the end of `filterBrowseSets` with a `sortKey`-dispatched comparator:
  ```js
  .sort((a, b) => {
    if (sortKey === 'releaseYear') {
      return (a.year - b.year) || a.name.localeCompare(b.name);
    }
    if (sortKey === 'collection') {
      const aOwned = ownedSetIds.has(a.id) ? 0 : 1;
      const bOwned = ownedSetIds.has(b.id) ? 0 : 1;
      return (aOwned - bOwned) || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });
  ```
  The `sortKey === 'name'` path (including the default when `sortKey` is omitted) retains the existing `localeCompare` behaviour.

- [x] **Test (Story 60.1):** Add a new test file `test/epic60-sets-browser-sort.test.mjs` with the following assertions (use the same import and `test()`/`assert` style as `test/epic5-browse-extensions.test.mjs`):
  - `BROWSE_SORT_OPTIONS` is an array of exactly three objects whose `id` values are `'name'`, `'releaseYear'`, `'collection'` in that order.
  - `filterBrowseSets(sets, { sortKey: 'name' })` returns sets sorted A–Z by `set.name`.
  - `filterBrowseSets(sets, { sortKey: 'releaseYear' })` returns sets sorted ascending by `set.year`; where two sets share the same year they appear A–Z by name.
  - `filterBrowseSets(sets, { sortKey: 'collection', ownedSetIds: new Set([id1]) })` returns the owned set before all unowned sets; unowned sets are sorted A–Z by name.
  - `filterBrowseSets(sets)` (no options) produces the same order as `filterBrowseSets(sets, { sortKey: 'name' })` — no regression.
  - The existing test in `test/epic22-catalog-ordering.test.mjs` (`filterBrowseSets applies a locale-safe alphabetical sort`) continues to pass unchanged.

- [ ] **QC (Automated) (Story 60.1):** Run `npm run lint` and confirm it exits with code 0.

---

## Story 60.2 — Add sort selector to browse toolbar in `BrowseTab.svelte`

**File: `src/components/BrowseTab.svelte`** and **`src/app/localization-utils.mjs`**

- [x] In `src/components/BrowseTab.svelte`, add `BROWSE_SORT_OPTIONS` to the named import at line 2:
  ```js
  import { BROWSE_TYPE_OPTIONS, BROWSE_SORT_OPTIONS, filterBrowseSets, summarizeBrowseSet } from '../app/browse-utils.mjs';
  ```

- [x] In `src/components/BrowseTab.svelte`, declare a session-level reactive variable immediately after `let firstRun = $derived(...)`. This is local `$state` — no prop, no `onSet*` callback, no localStorage persistence:
  ```js
  let browseSortKey = $state('name');
  ```

- [x] In `src/components/BrowseTab.svelte`, reorder and update the `ownedSetIds` and `browseSets` derived declarations so that `ownedSetIds` is declared first (it is already used by the sort logic) and `filterBrowseSets` receives the new parameters:
  ```js
  let ownedSetIds = $derived(new Set(appState.collection.ownedSetIds));
  let browseSets = $derived(
    filterBrowseSets(bundle.runtime.sets, {
      searchTerm: browseSearchTerm,
      typeFilter: browseTypeFilter,
      sortKey: browseSortKey,
      ownedSetIds
    })
  );
  ```
  Remove the standalone `let ownedSetIds = $derived(...)` that previously appeared after `browseSets`.

- [x] In `src/app/localization-utils.mjs`, add a `getBrowseSortLabel` method to the locale object returned by `getLocale()`, immediately after the existing `getBrowseTypeFilterLabel` method (around line 199):
  ```js
  getBrowseSortLabel(sortKey) {
    return t(`browse.sort.${sortKey}`);
  },
  ```

- [x] In `src/components/BrowseTab.svelte`, inside `<div class="browse-toolbar">`, add the sort selector immediately after the closing `</div>` of the existing type-filter `<div class="stack gap-sm">` block. Replicate the type-filter segmented button pattern exactly — same `<div class="stack gap-sm">` outer wrapper, same `role="group"` inner `<div class="button-row">` with `aria-label`, same `button-primary`/`button-secondary` active toggle via `aria-pressed`, same `data-action` naming convention:
  ```svelte
  <div class="stack gap-sm">
    <span class="muted">{locale.t('browse.sort.label')}</span>
    <div class="button-row" role="group" aria-label={locale.t('browse.sort.label')}>
      {#each BROWSE_SORT_OPTIONS as option (option.id)}
        <button
          type="button"
          class={"button " + (browseSortKey === option.id ? 'button-primary' : 'button-secondary') + " browse-sort-button"}
          data-action="set-browse-sort-key"
          data-sort-key={option.id}
          aria-pressed={browseSortKey === option.id}
          onclick={() => browseSortKey = option.id}
        >{locale.getBrowseSortLabel(option.id)}</button>
      {/each}
    </div>
  </div>
  ```

- [x] **Test (Story 60.2):** In `test/epic60-sets-browser-sort.test.mjs`, add Playwright-style assertions consistent with tests in `test/epic5-browse-extensions.test.mjs`:
  - The browse toolbar within `[data-browse-sets-panel]` contains three buttons with `data-action="set-browse-sort-key"` and `data-sort-key` values of `'name'`, `'releaseYear'`, `'collection'`.
  - The Name button has `aria-pressed="true"` by default on page load.
  - After clicking the Release Year button, the first `[data-set-name]` attribute in the set grid corresponds to the set with the lowest `set.year` in the data.
  - After clicking the In Collection button, the first set card's `data-set-id` is an id present in the user's `ownedSetIds`.
  - After clicking the Name button, the first set card returns to the alphabetically first set name.
  - The search input and type-filter buttons remain functional alongside the sort selector (no regression).
  - On page reload, the sort selector's Name button has `aria-pressed="true"` (default reset).

- [ ] **QC (Automated) (Story 60.2):** Run `npm run lint` and confirm it exits with code 0.

---

## Story 60.3 — Add locale strings for sort control across all six locale files

Add four keys under the `browse.sort` namespace to every locale file. In each file, insert the four keys immediately after the `'browse.typeLabel.standalone'` entry (the last `browse.typeLabel.*` key), which is the final `browse.*` block before the `collection.*` section begins.

The four required keys per locale file are:
- `'browse.sort.label'` — label for the sort control group (used as `aria-label` on the `role="group"` and as the visible `<span>` above the buttons)
- `'browse.sort.name'` — label for the Name sort option button
- `'browse.sort.releaseYear'` — label for the Release Year sort option button
- `'browse.sort.collection'` — label for the In Collection sort option button

- [x] In `src/app/locales/en.mjs`, after `'browse.typeLabel.standalone': 'Standalone',`, add:
  ```js
  'browse.sort.label': 'Sort by',
  'browse.sort.name': 'Name',
  'browse.sort.releaseYear': 'Release Year',
  'browse.sort.collection': 'In Collection',
  ```

- [x] In `src/app/locales/fr.mjs`, after the equivalent `'browse.typeLabel.standalone'` entry, add:
  ```js
  'browse.sort.label': 'Trier par',
  'browse.sort.name': 'Nom',
  'browse.sort.releaseYear': 'Année de sortie',
  'browse.sort.collection': 'Dans ma collection',
  ```

- [x] In `src/app/locales/de.mjs`, after the equivalent `'browse.typeLabel.standalone'` entry, add:
  ```js
  'browse.sort.label': 'Sortieren nach',
  'browse.sort.name': 'Name',
  'browse.sort.releaseYear': 'Erscheinungsjahr',
  'browse.sort.collection': 'In meiner Sammlung',
  ```

- [x] In `src/app/locales/es.mjs`, after the equivalent `'browse.typeLabel.standalone'` entry, add:
  ```js
  'browse.sort.label': 'Ordenar por',
  'browse.sort.name': 'Nombre',
  'browse.sort.releaseYear': 'Año de lanzamiento',
  'browse.sort.collection': 'En mi colección',
  ```

- [x] In `src/app/locales/ja.mjs`, after the equivalent `'browse.typeLabel.standalone'` entry, add:
  ```js
  'browse.sort.label': '並び替え',
  'browse.sort.name': '名前',
  'browse.sort.releaseYear': '発売年',
  'browse.sort.collection': 'コレクション内',
  ```

- [x] In `src/app/locales/ko.mjs`, after the equivalent `'browse.typeLabel.standalone'` entry, add:
  ```js
  'browse.sort.label': '정렬 기준',
  'browse.sort.name': '이름',
  'browse.sort.releaseYear': '출시 연도',
  'browse.sort.collection': '내 컬렉션',
  ```

- [x] **Test (Story 60.3):** Run `grep -rn "browse\.sort\." src/app/locales/` and confirm exactly four matching keys appear in each of the six locale files (24 total matches). Run `grep -n "getBrowseSortLabel" src/app/localization-utils.mjs` and confirm exactly one definition is returned.

- [ ] **QC (Automated) (Story 60.3):** Run `npm run lint` and confirm it exits with code 0.
