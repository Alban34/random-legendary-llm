## Epic 86 Task List

**Epic:** UI Polish — Button Spacing, Preview Pane Label, Focus Ring, and Card Separators
**Source spec:** `documentation/planning/epic/ready-for-dev/epic-86.md`

---

### Story 86.1 — Add correct bottom spacing below buttons across all views where they are flush against content below

**Acceptance Criteria**
No button in any view has zero spacing between itself and the next content element; all spacing values reference design-system tokens; no hardcoded pixel values are introduced.

- [x] Open `src/app/app-shell.css` and locate the `.button-row` rule (currently at approx. line 981). Confirm it has no `margin-bottom` today.
- [x] Add `margin-bottom: var(--space-4);` to the `.button-row` rule so that every `.button-row` in every view gets bottom clearance via the design-system token.
- [x] Verify `NewGameTab.svelte` — the player-count button row (line 179), the play-mode button row (line 193), and the generate/accept button row (line 280) all receive spacing from the global rule; no inline overrides needed unless a specific row already has a larger gap from a parent stack container.
- [x] Verify `HistoryTab.svelte` — the grouping-mode button row (line 142), the outcome-filter button row (line 156), and the history-result-actions button row (line 244) each inherit bottom clearance.
- [x] Verify `CollectionTab.svelte` — all button rows (lines 67, 130, 177, 235, 291, 339, 351) receive the spacing.
- [x] Verify `BackupTab.svelte` — all button rows (lines 54, 106, 183) receive the spacing.
- [x] Verify `BrowseTab.svelte` — the sort-key button row and browse-hero-actions button row each receive bottom clearance.
- [x] Search the full CSS file for any hardcoded `px` values introduced by this change; there must be none.
- [x] **Test:** In `src/components/HistoryTab.test.ts` (which already loads `cssSource`), add an assertion that `cssSource` matches `/\.button-row\s*\{[^}]*margin-bottom\s*:\s*var\(--space-/` — confirming the token-based margin-bottom is present on `.button-row`.

---

### Story 86.2 — Remove the "Selected mode" label from the Setup engine preview pane

**Acceptance Criteria**
The "Selected mode" label/element is absent from the Setup engine preview pane in all rendering states.

- [x] Open `src/components/NewGameTab.svelte`. Locate the `<div class="summary-card new-game-status-summary" data-new-game-status-summary>` block (approx. line 229).
- [x] Remove the `<span class="muted" data-status-field="selected-mode">` element and its content (the `{locale.t('newGame.selectedMode')}: <strong>…</strong>` span).
- [x] Remove the immediately following dot-separator `<span aria-hidden="true" class="muted"> · </span>` that stood between the "selected-mode" span and the "owned-sets" span, so the remaining two fields (owned-sets and last-persisted) are still separated by their own `·` span.
- [x] Confirm no orphaned separators remain: the `data-new-game-status-summary` div must contain exactly the `data-status-field="owned-sets"` span, one `·` separator, and the `data-status-field="last-persisted"` span.
- [x] Open `src/components/NewGameTab.test.ts`. Locate the test `'NewGameTab contains all three data-status-field spans'` (approx. line 161). Remove the `assert.match(…/data-status-field="selected-mode"/)` assertion from that test (or convert it to `assert.doesNotMatch`) so the test reflects the new contract.
- [x] In `src/components/NewGameTab.test.ts`, add a new test — or extend the existing structural test — asserting that `newGameTabSource` does **not** match `/data-status-field="selected-mode"/`.
- [x] **Test:** Confirm `npm test` passes with the updated test asserting absence of `data-status-field="selected-mode"` and presence of `data-status-field="owned-sets"` and `data-status-field="last-persisted"`.

---

### Story 86.3 — Remove the pointer-triggered focus ring from game items in the History tab

**Acceptance Criteria**
Clicking or tapping a game item in the History tab does not produce a visible focus ring; keyboard-navigated focus (via Tab key) still shows a visible focus indicator, preserving WCAG 2.4.7 compliance.

- [x] Open `src/app/app-shell.css`. Locate the shared focus-within block (approx. line 1120):
  ```css
  .collection-row:focus-within,
  .history-item:focus-within,
  .history-group:focus-within,
  .result-card:focus-within,
  .summary-card:focus-within,
  .modal-dialog:focus-within {
    box-shadow: 0 0 0 2px var(--border-focus), var(--shadow-panel);
  }
  ```
- [x] Replace the selectors `.history-item:focus-within` and `.history-group:focus-within` with their `:has(:focus-visible)` equivalents — `.history-item:has(:focus-visible)` and `.history-group:has(:focus-visible)` — so that only keyboard-driven focus (which sets `:focus-visible`) triggers the box-shadow, not pointer clicks.
- [x] Keep all other selectors in the same rule unchanged (`.collection-row:focus-within`, `.result-card:focus-within`, `.summary-card:focus-within`, `.modal-dialog:focus-within`), as those are outside the scope of this story.
- [x] Verify the existing `summary:focus-visible` rule (approx. line 1113) is unchanged; Tab-key focus on a history item's `<summary>` still gets the `outline: 2px solid var(--border-focus)` from that rule.
- [x] **Test:** In `src/components/HistoryTab.test.ts` (which loads `cssSource`), add an assertion that `cssSource` matches `/\.history-item:has\(:focus-visible\)/` and does **not** match `/\.history-item:focus-within/`.

---

### Story 86.4 — Remove per-card separators from the Browse "Show details" panel, keeping category separators

**Acceptance Criteria**
The "Show details" panel in the Browse tab renders exactly one separator per category group and zero separators between individual cards within a group.

- [x] Open `src/app/app-shell.css`. Locate the `.browse-entity-item` rule (approx. line 1755):
  ```css
  .browse-entity-item {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--surface-soft);
    border: 1px solid var(--surface-border-soft);
  }
  ```
- [x] Remove the `border: 1px solid var(--surface-border-soft);` and `border-radius: var(--radius-md);` declarations from `.browse-entity-item` so individual items within a category list no longer render as bordered cards.
- [x] Optionally keep `background: var(--surface-soft)` and `padding` on `.browse-entity-item` for readability, but ensure no `border` or `box-shadow` separates individual items visually.
- [x] Verify that the `.summary-card` border (from the shared `.summary-card` rule, approx. line 953) remains the sole visual separator at the category level. Each category section (`<section class="summary-card">` inside `.browse-details-grid`) retains its panel border — this is the one-per-category separator.
- [x] Confirm `BrowseTab.svelte` markup requires no changes: the structure of `browse-details-grid > section.summary-card > ul.browse-entity-list > li.browse-entity-item` already maps to the intended one-separator-per-category model once the CSS is corrected.
- [ ] **Test:** In `src/components/BrowseTab.test.ts` (which loads `cssSource`), add an assertion that `cssSource` does **not** match `/\.browse-entity-item\s*\{[^}]*border\s*:\s*1px/` — confirming the per-item border is absent from the rule.

---

### Story 86.5 — Test: all four UI polish changes

**Acceptance Criteria**
`npm run lint` and `npm test` pass with no regressions; each of the four changes is covered by at least one unit or integration test assertion.

- [x] Confirm Story 86.1 test is in place: `src/components/HistoryTab.test.ts` asserts `.button-row` CSS contains a token-based `margin-bottom`.
- [x] Confirm Story 86.2 tests are in place: `src/components/NewGameTab.test.ts` asserts absence of `data-status-field="selected-mode"` and presence of `data-status-field="owned-sets"` and `data-status-field="last-persisted"`.
- [x] Confirm Story 86.3 test is in place: `src/components/HistoryTab.test.ts` asserts `.history-item:has(:focus-visible)` is present in CSS and `.history-item:focus-within` is absent.
- [x] Confirm Story 86.4 test is in place: `src/components/BrowseTab.test.ts` asserts `.browse-entity-item` rule does not contain `border: 1px`.
- [x] Ensure no pre-existing tests were silently broken by the removal of `data-status-field="selected-mode"` (specifically the test at `NewGameTab.test.ts` line 162 must be updated as described in Story 86.2).
- [x] **Test:** Hand off to QC (Story 86.6) for final `npm run lint` and `npm test` execution.

---

### Story 86.6 — QC (Automated)

**Acceptance Criteria**
Run `npm run lint` then `npm test`; all checks pass with no regressions.

- [ ] **QC (Automated):** Run `npm run lint` — must exit 0 with no lint errors across all changed files (`src/app/app-shell.css`, `src/components/NewGameTab.svelte`, `src/components/NewGameTab.test.ts`, `src/components/HistoryTab.test.ts`, `src/components/BrowseTab.test.ts`).
- [ ] **QC (Automated):** Run `npm test` — all unit and integration tests must pass with no regressions. Confirm the five new/updated test assertions (Stories 86.1–86.4) are green.
- [ ] **QC (Automated):** If either command exits non-zero, return the failure output to the dispatcher for triage; do not self-repair.
