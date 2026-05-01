## Epic 72 — Active Expansions Collapsed by Default

**Objective**
Reduce the visual density of the New Game tab by collapsing the Active Expansions section by default, so users are not overwhelmed by the full expansion list on every page load and can expand it only when they need to adjust their play set.

**In scope**
- an expand/collapse toggle control in the Active Expansions section header, consistent with the existing panel toggle patterns used elsewhere in the app (e.g. `aboutPanelOpen`)
- the section's initial/default state set to collapsed on page load, so the expansion list is hidden until the user explicitly opens it
- preservation of the expanded/collapsed state when the user navigates between tabs within the same session, so the panel does not reset to collapsed on every tab switch

**Out of scope**
- persisting the expanded/collapsed preference to localStorage across separate sessions or page reloads (the collapsed default applies on every fresh load)
- collapsing or adding toggle behavior to any section other than Active Expansions
- changes to the active expansion selection logic (`activeSetIds`) or the generator behavior introduced by Epic 46

**Stories**
1. **Add an expand/collapse toggle to the Active Expansions section header**
2. **Default the Active Expansions section to collapsed on initial page load**
3. **Preserve the expanded/collapsed state across tab navigation within the same session**

**Acceptance Criteria**
- Story 1: The Active Expansions section header includes a clickable toggle control (e.g. chevron or button); activating it alternates the section between collapsed (expansion list hidden) and expanded (list visible); the toggle is keyboard-operable and carries an accessible label that describes the current state; `npm run lint` passes.
- Story 2: On fresh page load (or when no session state has been set), the Active Expansions section renders with the expansion list hidden and the toggle in its collapsed indicator state; the user can click the toggle to reveal the list; the expansion selection checkboxes and select-all/clear-all affordances remain functional once expanded; `npm run lint` passes.
- Story 3: If the user expands the Active Expansions section and then navigates to a different tab (e.g. Browse or History) and returns to the New Game tab, the section remains in the expanded state they left it in; if they collapse it before navigating, it remains collapsed on return; navigating away and back does NOT reset the section to the page-load default; `npm run lint` passes.
