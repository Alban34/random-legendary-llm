# Epic 44 — Card Browser by Category or Expansion in Collection: Task List

## Story 44.1 — Add a mode toggle to the Collection tab to switch between set-ownership view and card-browser view

- [x] Add a `collectionView` session-scoped reactive variable to `CollectionTab.svelte` (values: `'sets'` | `'cards'`), defaulting to `'sets'`
- [x] Render a segmented toggle control (two buttons: "Sets" / "Browse Cards") in the Collection tab header panel, immediately below the existing `<h2>` and description paragraph, using existing `button-row` and `button` / `button-secondary` class patterns
- [x] Conditionally render the existing set-ownership and totals/feasibility sections only when `collectionView === 'sets'`
- [x] Conditionally render a placeholder `<section data-view="card-browser">` only when `collectionView === 'cards'` (card browser content delivered in Stories 44.3–44.5)
- [x] Add localization keys `collection.viewToggle.sets` ("Sets") and `collection.viewToggle.cards` ("Browse Cards") to `src/app/locales/en.mjs` and all five other locale files (`fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, `es.mjs`)
- [x] Ensure the toggle buttons carry `aria-pressed` reflecting the active view so keyboard and screen-reader users can identify the current mode
- [x] Verify that toggling to card-browser view and back to sets view does not alter `appState.collection.ownedSetIds`
- [x] **Test:** manually toggle between both views; confirm the set-ownership checklist, totals, feasibility, and Reset button remain visually and functionally unchanged when returning to the "Sets" view; confirm no owned-set state is lost on toggle
- [x] **QC (Automated):** add test assertions to `test/epic44-card-browser.test.mjs` confirming (a) the toggle control is present in the rendered Collection tab, (b) activating the "Browse Cards" button hides the set-ownership section, (c) activating the "Sets" button restores it, and (d) `appState.collection.ownedSetIds` is identical before and after toggling

---

## Story 44.2 — Build the card-browser data layer that aggregates owned-expansion cards with grouping support

- [x] Add a new exported function `getCardsByCategory(ownedPools)` to `src/app/collection-utils.mjs` that accepts the `pools` object returned by `buildOwnedPools` and returns an array of five objects `{ categoryId, label, cards[] }` — one per category in the fixed order: Heroes, Masterminds, Villain Groups, Henchman Groups, Schemes — where each `cards` array is sorted A–Z by `name` and empty categories are included (filtering happens at render time per the spec)
- [x] Add a new exported function `getCardsByExpansion(ownedPools)` to `src/app/collection-utils.mjs` that accepts the same `pools` object and returns one object per owned expansion `{ setId, setName, cards[] }`, sorted A–Z by `setName`, where `cards` aggregates all five category arrays for that expansion sorted A–Z by `name`
- [x] Define and export a constant `CARD_CATEGORIES` array in `src/app/collection-utils.mjs` listing the five category identifiers and their stable display-key labels (`{ id: 'heroes', labelKey: 'common.heroes' }`, etc.) in the canonical order above
- [x] Add localization key `collection.browser.noOwnedSets` ("Own at least one expansion to browse individual cards.") to `src/app/locales/en.mjs` and all five other locale files
- [x] **Test:** in `test/epic44-card-browser.test.mjs`, call `getCardsByCategory` with the `core-set` pools and assert (a) exactly five category buckets are returned, (b) Heroes bucket contains known core-set hero names sorted A–Z, (c) Masterminds bucket contains known mastermind names sorted A–Z; call `getCardsByExpansion` with pools from two owned expansions and assert (a) two expansion objects are returned sorted A–Z by expansion name, (b) each expansion's `cards` array is sorted A–Z by name
- [x] **QC (Automated):** run `npm test -- --test-name-pattern 'Epic 44'` and confirm all data-layer unit tests pass

---

## Story 44.3 — Render the "by category" card-browser grouping

- [x] Create `src/components/CardBrowserByCategory.svelte` accepting props `pools` (the pools object from `summarizeOwnedCollection`) and `locale`
- [x] Inside the component call `getCardsByCategory(pools.pools)` (imported from `collection-utils.mjs`) and render one `<section>` per category whose `cards` array is non-empty, skipping empty-category sections entirely
- [x] Each section must include an `<h3>` heading using the locale key for that category (e.g. `locale.t('common.heroes')`) and a `<ul>` listing each card name in a `<li>` element, sorted A–Z (already guaranteed by the data layer)
- [x] Apply existing design-system panel / stack / gap classes to match the visual density of the existing CollectionTab sections
- [x] If `pools.sets.length === 0` render a single `<p>` using locale key `collection.browser.noOwnedSets` instead of any category sections
- [x] Import and render `CardBrowserByCategory` inside `CollectionTab.svelte` within the `data-view="card-browser"` placeholder when the active grouping (Story 44.5) is `'category'`
- [x] **Test:** manually own only "Core Set"; confirm only non-empty categories appear (Heroes, Masterminds, Villain Groups, Henchman Groups, Schemes all present for core-set; none shown for zero-owned-sets state); confirm hero names render A–Z
- [x] **QC (Automated):** add Playwright browser QC in `test/playwright/epic44-card-browser.spec.mjs` that (a) selects "Core Set", opens the card browser, selects "By Category" grouping, and asserts the five section headings are visible, (b) asserts that a known hero name from the core set appears in the Heroes section, (c) verifies no section heading is rendered for a category with zero cards

---

## Story 44.4 — Render the "by expansion" card-browser grouping

- [x] Create `src/components/CardBrowserByExpansion.svelte` accepting props `pools` and `locale`
- [x] Inside the component call `getCardsByExpansion(pools.pools)` (imported from `collection-utils.mjs`) and render one `<section>` per returned expansion
- [x] Each section must include an `<h3>` heading with the expansion name and a `<ul>` listing all cards from that expansion A–Z in `<li>` elements
- [x] Apply the same design-system panel / stack / gap class patterns used in `CardBrowserByCategory.svelte`
- [x] If `pools.sets.length === 0` render the `collection.browser.noOwnedSets` message, consistent with the category view
- [x] Import and render `CardBrowserByExpansion` inside `CollectionTab.svelte` within the `data-view="card-browser"` block when the active grouping is `'expansion'`
- [x] **Test:** manually own "Core Set" and "Fantastic Four"; in the "By Expansion" view confirm two sections appear, both expansion names are present as headings, sections are sorted A–Z by expansion name ("Core Set" before "Fantastic Four"), and cards within each section are sorted A–Z by card name
- [x] **QC (Automated):** extend `test/playwright/epic44-card-browser.spec.mjs` to (a) own two expansions, switch grouping to "By Expansion", and assert two section headings matching those expansion names are visible, (b) assert the section headings appear in A–Z order, (c) assert at least one known card name from each expansion appears inside the correct section

---

## Story 44.5 — Add a grouping selector within the card browser that persists the active grouping for the session

- [x] Add a `cardBrowserGrouping` reactive variable in `CollectionTab.svelte` (values: `'category'` | `'expansion'`), defaulting to `'category'`, scoped to the component lifetime (session-only, no persistence to `appState`)
- [x] Render the grouping selector only when `collectionView === 'cards'`: a segmented toggle (two buttons: "By Category" / "By Expansion") placed at the top of the `data-view="card-browser"` section, above the card list content
- [x] Pass `cardBrowserGrouping` as the active grouping to the rendered card-browser component to drive which component (`CardBrowserByCategory` or `CardBrowserByExpansion`) is shown
- [x] Switching the grouping selector must update the displayed list immediately without any page navigation or scroll-position reset outside the card-browser section
- [x] Add localization keys `collection.browser.groupBy.category` ("By Category") and `collection.browser.groupBy.expansion` ("By Expansion") to `src/app/locales/en.mjs` and all five other locale files
- [x] Ensure grouping selector buttons carry `aria-pressed` on the active option; verify keyboard-tab focus order moves logically: mode toggle → grouping selector → card list
- [x] **Test:** open the card browser, switch grouping to "By Expansion", then navigate away to another tab and back to the Collection tab; confirm the grouping resets to the default "By Category" (session-scoped, not persisted); confirm switching grouping while browsing does not reset owned-set selections
- [x] **QC (Automated):** extend `test/playwright/epic44-card-browser.spec.mjs` to (a) assert the grouping selector is visible only when the card-browser mode is active, (b) assert switching from "By Category" to "By Expansion" updates the rendered section headings within the same page interaction, (c) assert the selector is keyboard-focusable and `aria-pressed` reflects the active grouping
