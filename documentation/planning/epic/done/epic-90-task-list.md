## Epic 90 Task List

**Epic:** Fix History Grouping Filter Button Hover Clipping
**Source spec:** `documentation/planning/epic/approved/epic-90.md`

---

### Story 90.1 — Fix vertical overflow clipping on `.button-row-scroll` so hover and focus styles render fully on history grouping buttons

**Acceptance Criteria**
Hovering over any grouping mode button in the History tab displays the full hover visual state (outline, shadow, or raised style) with no clipping at the top edge; the row still scrolls horizontally when its content overflows; the outcome filter row is visually unchanged.

- [x] Open `src/app/app-shell.css` and locate the `.button-row-scroll` rule (currently at approx. line 993):
  ```css
  .button-row-scroll {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px; /* clearance for scrollbar on Windows */
  }
  ```
- [x] Add `padding-top` to `.button-row-scroll` to give vertical clearance for hover/focus visuals that extend above the element's content edge. Choose a value that matches the pixel height of the hover outline or box-shadow used by `.button-secondary` (typically `2px`–`4px`; inspect the button hover rule in `app-shell.css` to confirm the exact offset needed):
  ```css
  .button-row-scroll {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-top: <value>; /* clearance for hover/focus outline */
    padding-bottom: 2px; /* clearance for scrollbar on Windows */
  }
  ```
  Alternatively, if `padding-top` alone is insufficient (e.g. the container has a hard clip from a parent), wrap the `.button-row.button-row-scroll` div in `HistoryTab.svelte` with an outer `<div>` that carries `overflow: visible` while the inner div retains `overflow-x: auto`. Only choose this wrapper approach if the `padding-top` fix does not fully expose the hover visual.
- [x] Confirm that `overflow-x: auto` and `flex-wrap: nowrap` remain on `.button-row-scroll` — horizontal scrollability must be preserved.
- [x] Confirm the outcome filter row (`<div data-outcome-filter-row class="button-row wrap">` in `src/components/HistoryTab.svelte`, approx. line 156) is unchanged and still uses the `wrap` class with no overflow constraint.
- [x] Search `src/app/app-shell.css` for any `.button-row` overrides that could conflict with the new `padding-top`; confirm none apply to `.button-row-scroll` in a way that zero-out the padding.
- [x] **Test:** In `src/components/HistoryTab.test.ts`, update or extend the existing test `'CSS contains .button-row-scroll with flex-wrap: nowrap'` (approx. line 115) to additionally assert that `cssSource` matches `/\.button-row-scroll[^}]*padding-top\s*:/ ` — confirming the vertical clearance declaration is present in the CSS rule.
- [x] **Test:** Confirm the existing assertions in `src/components/HistoryTab.test.ts` (lines 116–122) still pass:
  - `.button-row-scroll` must still set `flex-wrap: nowrap`
  - `.button-row-scroll` must still set `overflow-x: auto`
  - `.button-row-scroll > *` must still set `flex-shrink: 0`

---

### Story 90.2 — Audit all other `button-row-scroll` usages in the codebase and confirm no regressions from the fix

**Acceptance Criteria**
A review of all elements using the `button-row-scroll` class confirms each continues to render correctly after the fix; findings are noted as a comment in the epic file or the implementing PR.

- [x] Run a codebase-wide search for all files containing `button-row-scroll`. Current known locations are:
  - `src/components/HistoryTab.svelte` — line 142 (the grouping mode button row — the row being fixed)
  - `src/components/HistoryTab.test.ts` — lines 87–122 (test assertions)
  - `src/app/app-shell.css` — lines 993–1003 (rule definition)
  - `documentation/release-notes/v2.1.0-release-notes.md` — historical documentation reference
- [x] Confirm there is currently **only one** runtime usage of `button-row-scroll` in the application markup — the `<div class="button-row button-row-scroll">` in `src/components/HistoryTab.svelte`. If any additional usages are found in other Svelte or HTML files, list them explicitly.
- [x] For each runtime usage found, verify the fix (added `padding-top` on `.button-row-scroll`) does not introduce visual regressions:
  - The grouping mode button row in `HistoryTab.svelte` gains vertical hover clearance — intended change.
  - Any other usages found: visually assess whether added top padding would be unexpected or cause layout shifts; if so, convert the fix to a scoped override in `HistoryTab.svelte` instead of a global rule change in `app-shell.css`.
- [x] Record audit findings (list of all runtime `button-row-scroll` usages found and their assessment) as a comment inside `documentation/planning/epic/approved/epic-90.md` under an `## Audit` heading, or include them in the implementing PR description.
- [ ] **QC (Automated):** Run the following Playwright spec files to confirm no regressions in the History tab grouping UI after the CSS fix:
  - `test/playwright/history-grouping-mastermind.spec.ts`
  - `test/playwright/history-grouping-expansion.spec.ts`
  - `test/playwright/history-stats-panels.spec.ts`
  - `test/playwright/history-outcome-filter.spec.ts`
  - `test/playwright/history-insights.spec.ts`
- [ ] **QC (Automated):** Run `npm test` (Vitest) and confirm all assertions in `src/components/HistoryTab.test.ts` pass, including the updated `padding-top` assertion from Story 90.1.
