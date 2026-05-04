## Epic 92 — Consistent Rotating-Arrow Indicator on All Collapsible Panels

**Objective**
Apply the rotating `›` arrow open/close indicator uniformly to every collapsible panel in the app. Currently only the Insights stat panels (`.stats-category-summary`) and the Backup maintenance accordion (`.maintenance-accordion-summary`) have the rotating arrow. Every other `<details>` element still shows the native browser disclosure triangle.

**Background**
The rotating `›` arrow was introduced in Epic 91 (stats panels) and already existed in the Backup tab accordion. The pattern:
- Hides the native browser marker with `list-style: none` + `::-webkit-details-marker { display: none }`
- Renders a `›` via `::after` pseudo-element, rotated 90° (right-pointing = collapsed) → 270° (down-pointing = open) with a CSS transition

The cleanest, most maintainable fix is a **single update to the global `details summary` base rule** in `src/app/app-shell.css`, which already applies to all summaries. This removes the need to update individual component files and eliminates the duplicate `::after` rules that exist on `.maintenance-accordion-summary` and `.stats-category-summary`.

**Inventory of collapsibles and their current indicator**

| Element | File | Current indicator |
|---------|------|-------------------|
| `.maintenance-accordion-summary` | `BackupTab.svelte` line 132 | ✅ Rotating `›` arrow |
| `.stats-category-summary` | `HistoryTab.svelte` lines 489, 532 | ✅ Rotating `›` arrow |
| `.history-group` | `HistoryTab.svelte` line 190, `CardBrowserByCategory.svelte` line 16, `CardBrowserByExpansion.svelte` line 16 | ❌ Native triangle |
| `.history-item` | `HistoryTab.svelte` line 213 | **Excluded** — see below |
| `.about-card` | `BrowseTab.svelte` lines 351, 361, 372, 386, 402 | ❌ Native triangle |
| Bare `<details>` (nested in about-card) | `BrowseTab.svelte` line 365 | ❌ Native triangle |
| `.panel.browse-help-disclosure` | `BrowseTab.svelte` line 120 | ❌ Native triangle |
| Forced picks `<details>` | `NewGameTab.svelte` line 296 | ❌ Native triangle |
| Active expansion filter `<details data-active-filter-panel>` | `NewGameTab.svelte` line 403 | ❌ Native triangle |
| Solo rules `<details class="result-card">` | `NewGameTab.svelte` line 572 | ❌ Native triangle |
| BGG import `<details class="panel">` | `CollectionTab.svelte` line 108 | ❌ Native triangle |
| MyLudo unrecognised titles `<details>` | `CollectionTab.svelte` line 277 | ❌ Native triangle |

**Exclusion: `.history-item summary`**
Individual game-record rows (`.history-item`) have summaries containing the mastermind name, expansion label, 3–4 pills (player count, mode, result, epic flag). These are content-rich data rows, not labelled panel headers. Injecting an arrow into an already-crowded summary row would create visual noise without adding clarity. `.history-item` is excluded from this epic; it retains the native browser triangle.

**In scope**

1. **Global base rule update in `src/app/app-shell.css`**
   - Update the existing `details summary` rule to add `list-style: none`, `display: flex`, `align-items: center`, `gap: var(--space-2)`
   - Add `details summary::-webkit-details-marker { display: none; }` immediately after
   - Add `details summary::after` with `content: '›'`, `font-size: 1.25rem`, `color: var(--text-muted)`, `flex-shrink: 0`, `margin-left: auto`, `display: inline-block`, `transform: rotate(90deg)`, `transition: transform var(--motion-duration) var(--motion-easing)`
   - Add `details[open] summary::after { transform: rotate(270deg); }`
   - Add `@media (prefers-reduced-motion: reduce) { details summary::after { transition: none; } }`

2. **Remove now-redundant `::after` rules from specific classes**
   - From `.maintenance-accordion-summary`: remove the `::after` block, the `details[open].maintenance-accordion .maintenance-accordion-summary::after` block, and the `@media (prefers-reduced-motion)` block that only contains the summary transition guard. Keep all other layout properties (display, flex, padding, etc.)
   - From `.stats-category-summary`: remove the `::after` block, the `details[open] .stats-category-summary::after` block, and the `@media (prefers-reduced-motion)` block that only contains the summary transition guard. Keep all other layout properties.

3. **Exclude `.history-item` from the global arrow**
   - Add an override rule: `.history-item summary::after { display: none; }` (or `content: none`) so the individual game-record rows are unaffected

4. **Visual audit of all affected summaries**
   - Confirm the arrow renders correctly and does not break the layout for: `.history-group`, `.about-card`, `.browse-help-disclosure`, the bare forced-picks / active-expansion-filter / solo-rules / BGG-import / MyLudo `<details>` elements
   - If any specific summary class needs a layout tweak (e.g. the `flex-wrap: wrap` on `.history-group summary` pushes the arrow to a second line), apply a targeted fix in the same CSS file

**Out of scope**
- Changing the visual design of the arrow (character, color, size)
- Animating `<details>` open/close beyond the arrow rotation
- Adding the arrow to `.history-item` (explicitly excluded)
- Any changes to Svelte template files (this is a CSS-only change)

**Stories**
1. **Update the global `details summary` base rule to add the rotating `›` arrow and suppress the native browser marker**
2. **Remove the duplicate `::after` and reduced-motion rules from `.maintenance-accordion-summary` and `.stats-category-summary`; add `.history-item summary::after { content: none }` exclusion**
3. **Visually audit every affected collapsible and apply any targeted layout fixes needed**

**Acceptance Criteria**
- Story 1: Every `<details>` in the app (except `.history-item`) renders a `›` arrow that rotates from 90° to 270° when opened; the native browser disclosure triangle is not visible; the `prefers-reduced-motion` media query suppresses the transition.
- Story 2: The `::after` CSS for `.maintenance-accordion-summary` and `.stats-category-summary` is not duplicated (the global rule handles it); `.history-item summary` shows no arrow.
- Story 3: No collapsible panel has its summary layout broken by the global flex rule; the arrow appears at the far right of each summary row; any wrapping summaries (e.g. `.history-group`) still render legibly.
