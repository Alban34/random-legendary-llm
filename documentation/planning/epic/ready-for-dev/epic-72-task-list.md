# Epic 72 — Active Expansions Collapsed by Default

## Story 1 — Add an expand/collapse toggle to the Active Expansions section header

- [ ] In `src/components/NewGameTab.svelte`, declare a local boolean variable `let activeExpansionsPanelOpen = false` at the top of the `<script>` block
- [ ] Replace the `<details data-active-filter-panel>` / `<summary>` element (lines ~156–166) with a `<div>` header containing a toggle button; the button must call `activeExpansionsPanelOpen = !activeExpansionsPanelOpen` on click, carry `aria-expanded={activeExpansionsPanelOpen}`, and include a descriptive `aria-label` referencing the `newGame.activeFilter.title` locale key
- [ ] Wrap the inner content (checkboxes, "Use all" / "Clear selection" buttons, lines ~176–210) in an `{#if activeExpansionsPanelOpen}...{/if}` block, replacing the `<details>` open/close mechanism
- [ ] Verify the toggle button is keyboard-operable (native `<button>` element satisfies this; confirm no `tabindex` suppression)
- [ ] Test — add `test/epic72-active-expansions-collapsed.test.mjs`: verify toggle button is present in the Active Expansions header, that clicking it shows/hides the checkbox list, and that the button's `aria-expanded` attribute reflects the current state
- [ ] QC (Automated) — run `npm run lint` and confirm zero errors

## Story 2 — Default the Active Expansions section to collapsed on initial page load

> **Note:** This story is fully satisfied by Story 1's implementation. Initialising `activeExpansionsPanelOpen = false` means the section is collapsed on every fresh page load. No additional code changes are required beyond Story 1.

- [ ] Confirm `let activeExpansionsPanelOpen = false` (the initialiser, not a derived value) is the canonical source of the default state in `src/components/NewGameTab.svelte`
- [ ] Confirm that "Use all" / "Clear selection" buttons and all expansion checkboxes are rendered inside the `{#if activeExpansionsPanelOpen}` block and therefore hidden until the user expands the section
- [ ] Test — extend `test/epic72-active-expansions-collapsed.test.mjs`: on fresh page load the Active Expansions checkbox list must not be visible; after expanding, checkboxes, "Use all", and "Clear selection" must all be interactable
- [ ] QC (Automated) — run `npm run lint` and confirm zero errors

## Story 3 — Preserve the expanded/collapsed state across tab navigation within the same session

> **Note:** This story requires no additional code changes beyond Story 1. Because `NewGameTab.svelte` is rendered with `hidden` (not `{#if}`) in `src/app/App.svelte` (lines ~1490–1507), the component is never unmounted on tab switch. The local `activeExpansionsPanelOpen` variable therefore persists naturally for the lifetime of the session.

- [ ] Verify in `src/app/App.svelte` (lines ~1490–1507) that `NewGameTab` is gated with `hidden={activeTabId !== tab.id}` and NOT wrapped in a `{#if}` — no change needed, but confirm as a precondition
- [ ] Test — extend `test/epic72-active-expansions-collapsed.test.mjs`: expand the Active Expansions section, navigate to another tab, return to the New Game tab, and assert the section remains expanded (toggle button shows `aria-expanded="true"` and checkboxes are visible)
- [ ] QC (Automated) — run `npm run lint` and confirm zero errors
