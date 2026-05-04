# Epic 89 — Browse Card Grouping Consistency and Default Expanded State

## Story 1 — Expand all category groups by default in the "by category" card browser

**Acceptance Criteria:** Every category `<details>` element carries the `open` attribute on initial render; no category is collapsed.

### Implementation

- [x] In `src/components/CardBrowserByCategory.svelte`, on the `<details class="history-group">` element (line 17), change `open={categoryIndex === 0}` to a bare `open` attribute.
  - Before: `<details class="history-group" data-category={category.categoryId} open={categoryIndex === 0}>`
  - After:  `<details class="history-group" data-category={category.categoryId} open>`

### Test

- [x] In `src/components/CardBrowserByCategory.test.ts`, update the existing test `'CardBrowserByCategory first group renders with the open attribute'`:
  - Replace the assertion that matches `/open=\{categoryIndex === 0\}/` with one that verifies the template contains a bare `open` attribute (e.g. match `/open(?!=\{categoryIndex)/` or match `/open>/` without the conditional binding).
  - Add a new test `'CardBrowserByCategory all groups render with the open attribute'` that asserts the source does **not** contain `open={categoryIndex === 0}` (i.e. `assert.doesNotMatch(source, /open=\{categoryIndex/)`) and does contain an unconditional `open` on the `<details>` element.

### QC (Automated)

- [x] In `test/playwright/card-browser.spec.ts`, add a new test inside `test.describe('Card browser')` under the `// Story 44.3` block:
  - Name: `'By Category: all category groups are open on initial render'`
  - Setup: call `ownSets(page, ['core-set', 'fantastic-four'])` then activate the cards view.
  - Assert: `await expect(browser.locator('details[data-category]')).toHaveCount` equal to the number of non-empty categories, and each `<details>` locator has the attribute `open` (`toHaveAttribute('open', '')`).

---

## Story 2 — Rebuild the "by expansion" card browser to use collapsible `<details>` groups

**Acceptance Criteria:** Each expansion group is wrapped in `<details class="history-group">` whose `<summary>` contains the expansion name (via `expansion.setName`) and a `(N)` pill count badge using `<span class="pill">`; the previous `<section>` + `<h3>` structure is fully removed; visual appearance matches the category view.

### Implementation

- [x] In `src/components/CardBrowserByExpansion.svelte`, replace the `{#each}` loop body:
  - Remove: `<section data-expansion={expansion.setId}>` and its closing `</section>`.
  - Remove: `<h3>{expansion.setName} <span class="muted" style="font-weight: normal; font-size: 0.85em;">({expansion.cards.length})</span></h3>`.
  - Add: `<details class="history-group" data-expansion={expansion.setId} open>` wrapping the group.
  - Add inside the `<details>`: `<summary><span class="history-group-title">{expansion.setName}</span><span class="pill">({expansion.cards.length})</span></summary>` — mirroring the exact `<summary>` structure used in `CardBrowserByCategory.svelte`.
  - Keep the `<ul class="card-browser-columns">` and its `{#each}` block unchanged.
  - Close the group with `</details>` instead of `</section>`.
- [x] Remove the `.muted` inline style block (`<span class="muted" style="font-weight: normal; font-size: 0.85em;">`) — the pill count is now rendered via `<span class="pill">` matching the category component.
- [x] Confirm the `<style>` block (`.card-browser-columns` rules) is preserved unchanged.

### Test

- [x] Create `src/components/CardBrowserByExpansion.test.ts` (new file, modelled after `CardBrowserByCategory.test.ts`):
  - Read `src/components/CardBrowserByExpansion.svelte` source in `beforeAll`.
  - Test `'CardBrowserByExpansion renders a .history-group details element for each expansion'`: assert source matches `/<details[^>]*class="history-group"[^>]*>/` and does **not** match `/<section[^>]*data-expansion/`.
  - Test `'CardBrowserByExpansion summary contains expansion name and pill count'`: assert source contains `expansion.setName` inside a `<summary>` and contains `<span class="pill">` with `expansion.cards.length`.
  - Test `'CardBrowserByExpansion preserves data-expansion attribute on details element'`: assert source matches `/data-expansion=\{expansion\.setId\}/`.

### QC (Automated)

- [x] In `test/playwright/card-browser.spec.ts`, update the two broken `// Story 44.4` tests that reference the old markup:
  - In `'By Expansion: owned Core Set shows one expansion heading'`:
    - Change `browser.locator('[data-expansion="core-set"] h3')` → `browser.locator('[data-expansion="core-set"] summary')`.
    - The `toContainText('Core Set')` assertion remains valid.
  - In `'By Expansion: two owned expansions show two sections sorted A-Z'`:
    - Change `browser.locator('section[data-expansion] h3').allTextContents()` → `browser.locator('details[data-expansion] summary').allTextContents()`.
    - The length and order assertions remain valid.
- [x] Add a new test `'By Expansion: each expansion group uses details.history-group with a summary'`:
  - Setup: `ownSets(page, ['core-set'])`, activate cards view, switch to expansion grouping.
  - Assert: `browser.locator('details.history-group[data-expansion]')` count is 1.
  - Assert: `browser.locator('details[data-expansion="core-set"] summary')` `toBeVisible()`.
  - Assert: `browser.locator('details[data-expansion="core-set"] summary')` `toContainText('Core Set')`.
  - Assert: `browser.locator('details[data-expansion="core-set"] .pill')` `toBeVisible()`.

---

## Story 3 — Set all expansion groups to open by default

**Acceptance Criteria:** All expansion `<details>` elements carry the `open` attribute on initial render; no expansion group is collapsed on load; the `data-expansion` attribute is present on each `<details>` element.

> **Note:** The bare `open` attribute was already added as part of Story 2 (`<details class="history-group" data-expansion={expansion.setId} open>`). Story 3 has no additional implementation task if Story 2 is completed correctly; the tasks below verify and document it as a distinct acceptance check.

### Implementation

- [x] Confirm that the `<details>` element written in Story 2 carries a bare `open` attribute (not a conditional binding). No further code change is needed beyond what Story 2 produces.

### Test

- [x] In `src/components/CardBrowserByExpansion.test.ts`, add:
  - Test `'CardBrowserByExpansion all groups render with the open attribute'`: assert source matches an unconditional bare `open` on the `<details>` element (e.g. assert it matches `/details[^>]+open[^=]/` or assert it does **not** match `/open=\{/`).
  - Test `'CardBrowserByExpansion data-expansion attribute is present on the details element'`: assert source matches `/data-expansion=\{expansion\.setId\}/`.

### QC (Automated)

- [x] In `test/playwright/card-browser.spec.ts`, add a new test `'By Expansion: all expansion groups are open on initial render'`:
  - Setup: `ownSets(page, ['core-set', 'fantastic-four'])`, activate cards view, switch to expansion grouping.
  - Assert: `browser.locator('details[data-expansion]')` count is 2.
  - Assert each `<details>` locator has attribute `open` (`toHaveAttribute('open', '')`).
  - Assert: `browser.locator('details[data-expansion="core-set"]')` `toHaveAttribute('open', '')`.
  - Assert: `browser.locator('details[data-expansion="fantastic-four"]')` `toHaveAttribute('open', '')`.
