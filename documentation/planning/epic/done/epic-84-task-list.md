# Epic 84 — Category Grouping Fieldsets in Browse Cards

## Context

The **Browse Cards** view in the Collection tab (`src/components/CardBrowserByCategory.svelte`)
already uses `getCardsByCategory` from `src/app/collection-utils.ts` to bucket cards by category.
Each category is currently rendered as a `<section>` / `<h3>` block.

The **History tab** (`src/components/HistoryTab.svelte`) wraps each group in a
`<details class="history-group">` / `<summary>` element — a collapsible, labelled group — with
shared styling defined in `src/app/app-shell.css` (`.history-group`).

Epic 84 aligns the Browse Cards category view to this same fieldset/group pattern so both views
share a consistent grouping visual language.

---

## Epic 84 Task List

### Story 84.1 — Identify the card category field and implement a grouping utility function

**Acceptance criteria:** The grouping key is the existing category field from the card data model;
the utility is a pure function; the choice is recorded in a code comment or in this epic file.

**Findings from exploration**

The grouping utility already exists. `CARD_CATEGORIES` in `src/app/collection-utils.ts` defines
the five canonical category identifiers (`heroes`, `masterminds`, `villainGroups`,
`henchmanGroups`, `schemes`). Each entry carries a `labelKey` that maps to a `common.*` locale
key. `getCardsByCategory(pools)` is the corresponding pure function: it returns a `CategoryEntry[]`
sorted A-Z per bucket.

The category field used as the grouping key is the **pool property key** on the `GamePool` object
(e.g. `pools.heroes`, `pools.masterminds`). `CARD_CATEGORIES` iterates over these keys in canonical
display order.

- [x] Open `src/app/collection-utils.ts` and verify that `CARD_CATEGORIES` lists exactly five
  entries in the canonical order:
  `heroes` → `masterminds` → `villainGroups` → `henchmanGroups` → `schemes`.
- [x] Confirm that each `CARD_CATEGORIES` entry carries a `labelKey` pointing to an existing
  `common.*` locale key (e.g. `common.heroes`, `common.masterminds`, `common.villainGroups`,
  `common.henchmanGroups`, `common.schemes`).
- [x] Confirm that `getCardsByCategory(pools)` is a pure function with no side effects — it only
  reads from `pools` and returns a new array.
- [x] Add a single-line code comment directly above the `CARD_CATEGORIES` constant in
  `src/app/collection-utils.ts` recording the grouping-key decision, e.g.:
  `// Grouping key: pool property name (heroes | masterminds | villainGroups | henchmanGroups | schemes)`.
- [x] **Test:** Verify that `src/app/collection-utils.test.ts` already contains the test
  `'CARD_CATEGORIES has exactly 5 entries in canonical order'` and that it passes without
  modification.

---

### Story 84.2 — Render a labelled fieldset group for each card category in the Browse Cards view

**Acceptance criteria:** Each category is visually wrapped in a fieldset/group element whose
styling matches the History tab groupings; no hardcoded colours or spacing values are introduced.

- [x] Open `src/components/CardBrowserByCategory.svelte` and read the current template. Each
  category group is rendered as `<section data-category={category.categoryId}>` with a bare
  `<h3>` heading.
- [x] Replace each `<section>` / `<h3>` group with the `<details>` / `<summary>` pattern used in
  `src/components/HistoryTab.svelte`:
  - Outer element: `<details class="history-group" data-category={category.categoryId}>`
  - Inner heading: `<summary><span class="history-group-title">{locale.t(category.labelKey)}</span>
    <span class="pill">({category.cards.length})</span></summary>`
  - Card list remains inside the `<details>` body unchanged.
  - The first group should render as open by default (`open` attribute on the first
    `<details>` element); subsequent groups can be collapsed by default to reduce visual noise —
    match the behaviour used in `HistoryTab.svelte` (first group `open`).
- [x] Do **not** introduce any hardcoded colour values, font sizes, or spacing values.
  Use only existing design-token variables (e.g. `--space-*`) or the shared `.history-group` class
  from `src/app/app-shell.css`.
- [x] Confirm that the `locale` prop is already threaded into `CardBrowserByCategory.svelte`
  (it is declared as `let { pools, locale }: { pools: GamePool; locale: LocaleTools } = $props();`).
  No prop changes are required.
- [x] Verify the empty-state path (`pools.sets.length === 0`) is unaffected by the template change.
- [x] **Test:** After the change, manually inspect the rendered output in a dev server (or via the
  automated test added in Story 84.4) to confirm that category group headings appear and the
  `.history-group` class is present on the wrapper elements.

---

### Story 84.3 — Add or update locale keys for category group labels in all six locale files

**Acceptance criteria:** All category label strings are sourced from the locale system; the
required keys are present in `en`, `fr`, `de`, `ja`, `ko`, and `es` locale files;
`npm run lint` passes.

**Findings from exploration**

`CARD_CATEGORIES` reuses the pre-existing `common.*` locale keys. All six locale files already
carry these keys:

| Key | en | fr | de | ja | ko | es |
|---|---|---|---|---|---|---|
| `common.heroes` | Heroes | Héros | Helden | ヒーロー | 히어로 | Héroes |
| `common.masterminds` | Masterminds | Masterminds | Masterminds | マスターマインド | 마스터마인드 | Mentes maestras |
| `common.villainGroups` | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ |
| `common.henchmanGroups` | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ |
| `common.schemes` | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ | _(confirm)_ |

- [x] In `src/app/locales/en.ts`, confirm that `common.heroes`, `common.masterminds`,
  `common.villainGroups`, `common.henchmanGroups`, and `common.schemes` are all present.
- [x] In `src/app/locales/fr.ts`, confirm the same five `common.*` keys are present.
- [x] In `src/app/locales/de.ts`, confirm the same five `common.*` keys are present.
- [x] In `src/app/locales/ja.ts`, confirm the same five `common.*` keys are present.
- [x] In `src/app/locales/ko.ts`, confirm the same five `common.*` keys are present.
- [x] In `src/app/locales/es.ts`, confirm the same five `common.*` keys are present.
- [x] If any key is absent from any locale file, add the missing entry immediately after the
  nearest sibling `common.*` key block in that file, using a translation consistent with the
  existing vocabulary in that locale.
- [x] **Test:** Run `npm run lint` and confirm it passes with no errors. This is the mandatory
  verification gate for Story 84.3.

---

### Story 84.4 — Test: grouping utility and Browse Cards integration

**Acceptance criteria:** `npm run lint` and `npm test` pass; the grouping utility has unit-test
coverage for at least three category configurations; at least one Browse Cards integration test
asserts that category group headings are rendered.

**Grouping utility tests (unit — `src/app/collection-utils.test.ts`)**

The following tests already exist and cover three category configurations (empty collection,
single expansion, and two-expansion pool). Verify each is still present and passing after
Story 84.1:

- [x] `'CARD_CATEGORIES has exactly 5 entries in canonical order'` — canonical order and
  `labelKey` presence.
- [x] `'getCardsByCategory returns exactly 5 category buckets'` — bucket count for a
  single owned set.
- [x] `'getCardsByCategory empty set list returns 5 empty-cards buckets'` — empty-collection
  edge case (third distinct configuration).

If any of these tests are missing or fail after Story 84.1 edits, restore or add them before
Story 84.4 is considered complete.

**Browse Cards integration tests (new — `src/components/CardBrowserByCategory.svelte`)**

The existing component test suite for the Collection tab lives in
`src/components/CollectionTab.test.ts`. Add a dedicated test file
`src/components/CardBrowserByCategory.test.ts` (or extend `CollectionTab.test.ts` with a clearly
labelled block) that asserts the new fieldset rendering:

- [x] Create (or extend) the test file and add a test:
  `'CardBrowserByCategory renders a .history-group details element for each non-empty category'`
  — reads `src/components/CardBrowserByCategory.svelte` source and asserts that
  `class="history-group"` appears on `<details>` elements, one per non-empty category.
- [x] Add a test:
  `'CardBrowserByCategory category heading references a locale key from CARD_CATEGORIES'`
  — asserts that each `<summary>` references a `category.labelKey` expression
  (e.g. `locale.t(category.labelKey)`) rather than a hardcoded string.
- [x] Add a test:
  `'CardBrowserByCategory first group renders with the open attribute'`
  — asserts that the first `<details>` element carries the `open` attribute.
- [x] Run `npm run lint` locally to confirm no lint regressions before handing off to Story 84.5.
- [x] **Test (gate):** All new and existing tests in `src/app/collection-utils.test.ts` and the
  new `src/components/CardBrowserByCategory.test.ts` (or `CollectionTab.test.ts` block) pass
  under `npm test`.

---

### Story 84.5 — QC (Automated)

**Acceptance criteria:** Run `npm run lint` then `npm test`; all checks pass with no regressions.

- [ ] **QC (Automated):** Run `npm run lint`. Lint must pass with zero errors and zero warnings
  before proceeding. Lint failures are blocking.
- [ ] **QC (Automated):** Run `npm test`. All tests must pass, including:
  - The existing suite in `src/app/collection-utils.test.ts` (grouping utility unit tests).
  - The new or extended tests in `src/components/CardBrowserByCategory.test.ts` (or
    `src/components/CollectionTab.test.ts`) asserting category group headings.
  - The existing `src/components/CollectionTab.test.ts` suite (no regressions).
  - The `src/app/locales/locales.test.ts` key-parity suite (all six locale files structurally
    consistent).
- [ ] Confirm no regressions in `src/app/locales/locales.test.ts` after any locale-file edits
  in Story 84.3.
- [ ] If any check fails, record the failure evidence and return to the relevant story owner
  before marking this story done.
