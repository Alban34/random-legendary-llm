# Epic 80 — Active Expansions Layout Alignment

## Context

The **Active Expansions** section in `src/components/NewGameTab.svelte` currently uses a bespoke
collapsible built with `<div class="panel">`, a manual `<button data-action="toggle-active-filter-panel">`,
`$state(false)` reactive variable `activeExpansionsPanelOpen`, and an `{#if}` guard. It sits at the top
of the left-column `.stack.gap-md` div, above all other controls.

The **Forced Picks** section (lines 381–485 of the same file) uses the native `<details>` /
`<summary>` pattern with an inner `<section class="result-card" data-forced-picks-panel>`. Epic 80
aligns Active Expansions to this same pattern and moves it below Forced Picks in DOM order.

---

### Story 80.1 — Apply the Forced Picks collapsible pattern to Active Expansions

- [x] **Remove the `activeExpansionsPanelOpen` reactive state variable** from
  `src/components/NewGameTab.svelte` (line 169):
  delete the line `let activeExpansionsPanelOpen = $state(false);`.

- [x] **Replace the outer `<div class="panel" data-active-filter-panel>` with `<details
  data-active-filter-panel>`** (line 181). Keep `data-active-filter-panel` on the outer element
  so existing Playwright locators (`[data-active-filter-panel]`) continue to match.

- [x] **Replace the `<div>` header block (lines 182–197) with a `<summary>` element.** The
  `<summary>` must keep:
  - the title text: `{locale.t('newGame.activeFilter.title')}`
  - the muted summary `<span class="muted">` with the `{#if activeSetIds === null} … {:else} …
    {/if}` summary labels unchanged

  Remove from this block:
  - the outer `<div>` wrapper tag
  - the entire `<button type="button" data-action="toggle-active-filter-panel" …>▼</button>` element

- [x] **Remove the `{#if activeExpansionsPanelOpen}` / `{/if}` wrapper** around the inner content
  section. The `<details>` native element handles visibility; the inner content must always be
  rendered inside the `<details>` (not guarded by an `{#if}`).

- [x] **Replace `<section class="result-card" style="margin-top: var(--space-sm)">` with
  `<section class="result-card">`** (drop the bespoke inline `margin-top` style, matching the
  Forced Picks inner section which carries no inline style).

- [x] **Replace the closing `</div>` of the former outer wrapper with `</details>`.**

- [x] **Update `test/epic72-active-expansions-collapsed.test.ts` — Story 72.1 block:** the
  following tests now assert the *opposite* of the new implementation and must be updated:
  - Replace `'Active Expansions section no longer uses a <details> element'` (which uses
    `assert.doesNotMatch` on `/<details[^>]*data-active-filter-panel/`) with
    `'Active Expansions section uses a <details data-active-filter-panel> element'` using
    `assert.match` on the same regex.
  - Delete the test `'Active Expansions header contains a toggle button with
    data-action="toggle-active-filter-panel"'` (the button no longer exists).
  - Delete the test `'Toggle button carries aria-expanded bound to activeExpansionsPanelOpen'`.
  - Delete the test `'Toggle button carries an aria-label using the newGame.activeFilter.title
    locale key'`.
  - Delete the test `'Toggle button onclick flips activeExpansionsPanelOpen'`.
  - Delete the test `'Toggle button is a native <button> element (keyboard-operable by default)'`.

- [x] **Update `test/epic72-active-expansions-collapsed.test.ts` — Story 72.2 block:** all five
  tests in this block rely on `activeExpansionsPanelOpen` and the `{#if}` guard and must be
  deleted:
  - `'activeExpansionsPanelOpen is declared as a let variable initialised to false'`
  - `'{#if activeExpansionsPanelOpen} guard block exists in template'`
  - `'Expansion checkboxes are inside the {#if activeExpansionsPanelOpen} guard'`
  - `'"Use all" button is inside the {#if activeExpansionsPanelOpen} guard'`
  - `'"Clear selection" button is inside the {#if activeExpansionsPanelOpen} guard'`

  *(Story 72.3 tests — about `hidden={activeTabId !== tab.id}` in App.svelte — are unrelated to
  the collapsible mechanism and must not be touched.)*

- [x] **Update `test/playwright/epic46-active-filter.spec.ts`** — replace both occurrences of the
  bespoke toggle button locator with the native `<summary>` click:
  - Line 18 (inside `beforeEach` of `'Epic 46 Story 46.3'`): replace
    `await page.locator('[data-action="toggle-active-filter-panel"]').click();`
    with
    `await page.locator('[data-active-filter-panel] summary').click();`
  - Line 127 (inside `'warning disappears and Generate re-enables…'`): replace
    `await page.locator('[data-action="toggle-active-filter-panel"]').click();`
    with
    `await page.locator('[data-active-filter-panel] summary').click();`

- [x] **Update `test/playwright/epic49-clear-selection.spec.ts`** — the `openActiveFilterPanel`
  helper (lines 11–17) uses `[data-action="toggle-active-filter-panel"]` and its `aria-expanded`
  attribute to decide whether to click. Replace the entire helper body with the `<details>`-based
  equivalent:
  ```ts
  async function openActiveFilterPanel(page) {
    const details = page.locator('[data-active-filter-panel]');
    const isOpen = await details.evaluate((el) => (el as HTMLDetailsElement).open);
    if (!isOpen) {
      await page.locator('[data-active-filter-panel] summary').click();
    }
  }
  ```

- [x] **Test:** Create `test/epic80-active-expansions-layout-alignment.test.ts` with a Story 80.1
  section containing:
  - A test asserting `newGameTabSource` matches `/<details[^>]*data-active-filter-panel/` (the
    outer element is now a `<details>`).
  - A test asserting `newGameTabSource` does NOT match
    `/let\s+activeExpansionsPanelOpen\s*=\s*\$state\(false\)/` (the state variable is gone).
  - A test asserting `newGameTabSource` does NOT match
    `/data-action="toggle-active-filter-panel"/` (the manual toggle button is gone).
  - A test asserting `newGameTabSource` does NOT match `/{#if activeExpansionsPanelOpen}/` (the
    `{#if}` guard is gone).

- [x] **QC (Automated):** Run `npm run lint`, then `npm test -- epic80` and
  `npm test -- epic72` to confirm all story 80.1 tests pass and no remaining epic72 tests
  reference removed symbols. Then run
  `npx playwright test test/playwright/epic46-active-filter.spec.ts test/playwright/epic49-clear-selection.spec.ts`
  to confirm the updated Playwright helpers and locators work against the new `<details>` markup.

---

### Story 80.2 — Reorder Active Expansions below Forced Picks

- [x] **Move the entire Active Expansions conditional block in `src/components/NewGameTab.svelte`**
  from its current position at the top of the `.stack.gap-md` div to immediately after the
  `</details>` closing tag of the Forced Picks panel (the `</details>` currently at line 485).

  The block to move starts at:
  ```svelte
  {#if appState.collection.ownedSetIds.length > 0}
    <!-- Active expansion filter panel -->
    <details data-active-filter-panel>
  ```
  and ends at the `{/if}` that closes the `appState.collection.ownedSetIds.length > 0` guard
  (which includes both the `<details>` collapsible and the `<div class="notice warning"
  data-active-filter-warning>` feasibility warning block).

  After the move the order inside `.stack.gap-md` must be:
  1. Player count controls (`<div data-mobile-task-anchor="new-game">`)
  2. Play mode controls
  3. Epic Mastermind toggle (conditional)
  4. Reset / clear-to-defaults button row
  5. Mode help text (`.new-game-mode-help`)
  6. Status summary (`.new-game-status-summary`)
  7. Setup requirements card (`#setup-requirements-card`)
  8. Active constraints / Forced Picks summary (`[data-active-constraints]`)
  9. Generate / Accept button row
  10. Ephemeral notice (conditional on `!compactViewport`)
  11. Forced Picks `<details>` panel
  12. **Active Expansions `{#if …}` block** ← moved here

- [x] **Test:** Add a Story 80.2 section to `test/epic80-active-expansions-layout-alignment.test.ts`
  containing:
  - A test asserting that `newGameTabSource.indexOf('data-active-filter-panel')` is greater than
    `newGameTabSource.indexOf('data-forced-picks-panel')` (Active Expansions appears after Forced
    Picks in DOM/source order).

- [x] **QC (Automated):** Run `npm run lint`, then `npm test -- epic80` to confirm the Story 80.2
  ordering assertion passes. Then run
  `npx playwright test test/playwright/epic46-active-filter.spec.ts` to confirm the full
  active-filter flow is intact at the new DOM position. Include in the epic-end full regression
  when all stories are merged.
