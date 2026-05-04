## Epic 90 — Fix History Grouping Filter Button Hover Clipping

**Objective**
Fix the CSS layout defect in the History tab where the grouping mode filter buttons (Mastermind, Scheme, Heroes, Villains, Player Mode, Epic) have their top edge cut off on hover, restoring full hover and focus visual feedback without breaking the row's horizontal scrollability.

**Background**
In `src/components/HistoryTab.svelte`, the grouping mode buttons sit inside `<div class="button-row button-row-scroll">`. The `.button-row-scroll` class sets `overflow-x: auto`, which causes browsers to implicitly clip vertical overflow as well — any hover outline, box-shadow, or raised visual state that extends above the container edge is invisible.

The outcome filter buttons use `flex-wrap: wrap` with no overflow constraint and are unaffected.

Likely fix options include adding `padding-top` to `.button-row-scroll` to give room for the hover visual, or wrapping the scroll region in an outer container that allows vertical overflow while the inner element scrolls horizontally.

**In scope**
- Adjust `.button-row-scroll` in `src/app/app-shell.css`, or add a targeted override in `HistoryTab.svelte`, so that hover and focus styles on buttons are not clipped vertically while horizontal scrollability is preserved
- Verify the fix against the grouping mode buttons in the History tab (Mastermind, Scheme, Heroes, Villains, Player Mode, Epic)
- Audit every other usage of `button-row-scroll` in the codebase to confirm no regression is introduced

**Out of scope**
- Redesigning the scrollable button row (adding fade overlays, scroll indicators, etc.)
- Changing the button visual design (colors, border-radius, typography)
- Any changes to the outcome filter row (`button-row wrap`), which is not affected by this defect

**Stories**
1. **Fix vertical overflow clipping on `.button-row-scroll` so hover and focus styles render fully on history grouping buttons**
2. **Audit all other `button-row-scroll` usages in the codebase and confirm no regressions from the fix**

**Acceptance Criteria**
- Story 1: Hovering over any grouping mode button in the History tab displays the full hover visual state (outline, shadow, or raised style) with no clipping at the top edge; the row still scrolls horizontally when its content overflows; the outcome filter row is visually unchanged.
- Story 2: A review of all elements using the `button-row-scroll` class confirms each continues to render correctly after the fix; findings are noted as a comment in the epic file or the implementing PR.

## Audit

**Codebase-wide search for `button-row-scroll` runtime usages (completed 2026-05-04):**

| File | Usage type | Assessment |
|------|------------|------------|
| `src/components/HistoryTab.svelte` line 142 | Runtime markup — `<div class="button-row button-row-scroll">` | **Only runtime usage.** Adding `padding-top: 4px` gives vertical clearance for focus outline (2px outline + 2px offset) and hover transform (`translateY(-1px)`). Intended change, no regression. |
| `src/components/HistoryTab.test.ts` lines 87–122 | Test assertions | Updated to assert `padding-top` is present. |
| `src/app/app-shell.css` lines 993–1003 | Rule definition | Modified — `padding-top: 4px` added. `overflow-x: auto` and `flex-wrap: nowrap` preserved. |
| `documentation/release-notes/v2.1.0-release-notes.md` line 79 | Historical docs | No change needed. |
| `documentation/ux/ui-design.md` lines 337, 377 | Design documentation | No change needed. |

**Conclusion:** There is exactly **one** runtime markup usage of `button-row-scroll`. The global `padding-top: 4px` addition to `.button-row-scroll` in `app-shell.css` is safe. No scoped override in `HistoryTab.svelte` is required. The `.button-row` base rule has no padding declarations that would conflict. No other Svelte or HTML files use this class.
