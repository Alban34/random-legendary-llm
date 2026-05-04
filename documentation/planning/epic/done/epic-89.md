## Epic 89 — Browse Card Grouping Consistency and Default Expanded State

**Objective**
Improve the Browse tab card browser by ensuring all groups are expanded on first render and by giving the "by expansion" view the same collapsible-group visual treatment currently used by the "by category" view.

**Background**
The Browse tab hosts two card browser components:

- `src/components/CardBrowserByCategory.svelte` uses `<details class="history-group">` with `open={categoryIndex === 0}`, so only the first group is open on load; the rest are collapsed.
- `src/components/CardBrowserByExpansion.svelte` uses a plain `<section>` + `<h3>` structure — no collapsible affordance, no pill count badge, no use of the `history-group` design token — making it visually inconsistent with the category view.

The desired end state: both views use the same `<details class="history-group">` + `<summary>` + pill-count structure, and all groups start open.

**In scope**
- Change `open={categoryIndex === 0}` to a bare `open` attribute in `CardBrowserByCategory.svelte` so every category group renders expanded by default
- Restructure `CardBrowserByExpansion.svelte` to replace the `<section>` + `<h3>` markup with `<details class="history-group">` + `<summary>` containing the expansion name and a `(N)` pill count badge, matching the category view's markup pattern exactly
- Set all expansion `<details>` elements to `open` by default in the rebuilt component
- Preserve the `data-expansion` attribute on each group element so that existing e2e selectors remain valid

**Out of scope**
- Persisting the expanded/collapsed state of individual groups across page reloads or tab switches
- Changes to the card list layout (columns, card detail display) inside the groups
- Adding search, filtering, or sorting within the card browser
- Visual style changes beyond applying the existing `history-group` pattern

**Stories**
1. **Expand all category groups by default in the "by category" card browser**
2. **Rebuild the "by expansion" card browser to use collapsible `<details>` groups with a title and pill count, matching the "by category" visual**
3. **Set all expansion groups to open by default in the rebuilt "by expansion" view**

**Acceptance Criteria**
- Story 1: When the "by category" view is active in the card browser, every category `<details>` element carries the `open` attribute on initial render; no category is collapsed.
- Story 2: Each expansion group in the "by expansion" view is wrapped in a `<details class="history-group">` element whose `<summary>` contains the expansion name and a `(N)` pill count; the previous `<section>` + `<h3>` structure is fully removed; visual appearance matches the category view's grouping style.
- Story 3: All expansion `<details>` elements carry the `open` attribute on initial render; no expansion group is collapsed on load; the `data-expansion` attribute is present on each `<details>` element.
