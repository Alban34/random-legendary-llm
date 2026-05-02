# Epic 76 — Forced Picks Panel Cognitive Load Reduction: Task List

## Story 1 — Remove the duplicate "Forced picks" H3 heading from inside the accordion body

- [ ] In `src/components/NewGameTab.svelte`: inside `<section class="result-card" data-forced-picks-panel>` (the `<details>` body), locate the `<h3>{locale.t('newGame.forcedPicks.title')}</h3>` element that immediately follows the opening `<section>` tag and remove it. The `<summary>` element already renders the same locale key as the accordion toggle label; only the H3 inside the body is removed. No other content is affected. The `<div class="muted">` description line beneath it remains in place.
- [ ] Test: verify the `<details>` element opens and closes normally; verify only one occurrence of the translated "Forced picks" text is present in the DOM when the accordion is open (the `<summary>` label); verify `npm run lint` passes.
- [ ] QC (Automated): `npm run lint`; run the full `test/playwright/epic15-qc.spec.mjs` suite to confirm no existing assertion regresses.

---

## Story 2 — Normalize button layout across all five card-type picker controls

- [ ] In `src/app/app-shell.css`: add a new modifier class `.forced-pick-picker-row` after the `.button-row > *` rule block (around line 987). The rules must be:
  ```css
  .forced-pick-picker-row > select {
    flex: 1 1 auto;
    min-width: 10rem;
  }
  .forced-pick-picker-row > button {
    flex-shrink: 0;
  }
  ```
  This ensures the `<select>` fills available horizontal space while the "Add / Set" button stays at its natural width, producing a visually consistent row across all five card-type pickers.
- [ ] In `src/components/NewGameTab.svelte`: inside the `{#each FORCED_PICK_FIELD_CONFIGS as config (config.field)}` loop, change the inner wrapper from `class="button-row wrap"` to `class="button-row wrap forced-pick-picker-row"`.
- [ ] Test: verify all five pickers (scheme, mastermind, hero, villain group, henchman group) render with a `<select>` that stretches to fill the row and a button that does not shrink; verify the layout is visually consistent at 390px and 480px viewport widths in both light and dark themes; verify `npm run lint` passes.
- [ ] QC (Automated): `npm run lint`; run `test/playwright/epic15-qc.spec.mjs` and `test/playwright/epic70-qc.spec.mjs` to confirm no regression in forced picks interaction behavior.

---

## Story 3 — Add a visual sub-divider between card-type pickers and session settings inside the accordion

- [ ] In `src/app/app-shell.css`: add a new rule block for the divider (place it near the other forced-picks-panel layout rules, or after the `.forced-pick-picker-row` block added in Story 2):
  ```css
  .forced-picks-section-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: var(--space-3) 0;
  }
  ```
- [ ] In `src/components/NewGameTab.svelte`: immediately after the closing `</div>` of the `<div class="stack gap-md">` block that wraps the `{#each FORCED_PICK_FIELD_CONFIGS}` loop, and immediately before the `{#if ownedExpansions.length >= 2}` session-settings block, insert:
  ```html
  <hr class="forced-picks-section-divider" aria-hidden="true">
  ```
  This visually separates the five card-type pickers from the session-settings controls (preferred expansion and forced team) at all viewport widths.
- [ ] Test: verify the `<hr class="forced-picks-section-divider">` element exists in the DOM when the accordion is open; verify it renders a visible 1px border in both the light and dark themes (check CSS variable `--border` is non-transparent in both); verify the separator remains visible at 390px viewport width; verify `npm run lint` passes.
- [ ] QC (Automated): `npm run lint`; run `test/playwright/epic15-qc.spec.mjs` to confirm no regression.

---

## Story 4 — Move the "Active constraints" summary to a persistent position above the Generate Setup button

- [ ] In `src/components/NewGameTab.svelte`: cut the entire active-constraints `<div class="stack gap-sm">` block from the bottom of `<section class="result-card" data-forced-picks-panel>` (starting at the `<div class="stack gap-sm">` that contains `<strong>{locale.t('newGame.forcedPicks.activeConstraints')}</strong>` and ending at its closing `</div>` after the empty-state `<p class="muted empty-state">` branch). This block contains both the header row (with the Clear All button) and the conditional constraints list.
- [ ] In `src/components/NewGameTab.svelte`: paste the cut block immediately above the `<div class="button-row">` that contains the `data-action="generate-setup"` and `data-action="accept-current-setup"` buttons. Add the attribute `data-active-constraints` to the outer `<div class="stack gap-sm">` so QC tests can locate it by selector:
  ```html
  <div class="stack gap-sm" data-active-constraints>
    ...
  </div>
  ```
  The block must render unconditionally (outside and before the `<details>` element) regardless of whether the accordion is open or closed.
- [ ] In `test/playwright/epic15-qc.spec.mjs`: update the three assertions that currently check `[data-forced-picks-panel]` for the text `'No forced picks are active.'` (lines ~50, ~95, ~105) to instead query `[data-active-constraints]`. Also update the assertion at line ~41 that checks `[data-forced-picks-panel]` for the mastermind name when a forced pick is active — the mastermind name now appears in `[data-active-constraints]`, so redirect that assertion to `[data-active-constraints]`. Leave all other selectors and test logic unchanged.
- [ ] Test: verify `[data-active-constraints]` is present in the DOM with the accordion closed; verify `[data-active-constraints]` is present with the accordion open; verify `[data-active-constraints]` appears before `[data-action="generate-setup"]` in DOM order; verify `[data-active-constraints]` appears before the `<details>` element in DOM order; verify that setting and clearing forced picks updates `[data-active-constraints]` correctly; verify `npm run lint` passes.
- [ ] QC (Automated): `npm run lint`; run `test/playwright/epic15-qc.spec.mjs` (with the updated assertions), `test/playwright/epic70-qc.spec.mjs`, and `test/epic25-header-new-game.test.mjs` to confirm ordering invariants hold.

---

## Story 5 — Apply a two-column grid layout for card-type picker controls on viewports ≥480px

- [ ] In `src/app/app-shell.css`: add a new utility class for the card-type pickers grid. Place it after the `.forced-picks-section-divider` block added in Story 3:
  ```css
  .forced-picks-pickers-grid {
    display: grid;
    gap: var(--space-4);
  }

  @media (min-width: 480px) {
    .forced-picks-pickers-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  ```
  Below 480px the class behaves as a single-column stack (same spacing as the current `stack gap-md`). At 480px and above the five pickers arrange in a two-column grid; the fifth picker occupies the first cell of the second row and spans only one column.
- [ ] In `src/components/NewGameTab.svelte`: change the `<div class="stack gap-md">` wrapper that immediately contains the `{#each FORCED_PICK_FIELD_CONFIGS as config (config.field)}` loop to `<div class="forced-picks-pickers-grid">`. Do not touch any class on the inner per-picker `<div class="stack gap-sm">` elements.
- [ ] Test: verify at 390px viewport width the five pickers render in a single column; verify at 480px and 768px viewport widths the five pickers render in a two-column grid (i.e. `grid-template-columns` resolves to two equal columns); verify the fifth picker does not stretch to full-row width; verify the layout does not overflow horizontally at any width between 390px and 1024px; verify `npm run lint` passes.
- [ ] QC (Automated): `npm run lint`; run `test/playwright/epic15-qc.spec.mjs` and `test/playwright/epic70-qc.spec.mjs` at both a 390px-wide and a 768px-wide Playwright viewport to confirm all picker interactions still work.
