## Epic 27 — Remaining Shell and Debug Polish

**Status: Approved**

**Objective**
Remove a residual developer debug control that is visible in production and correct the app title presentation so the header feels intentional and complete across all supported themes and locales.

**In scope**
- removal of the "Show history-ready setup snapshot" debug control from all user-facing surfaces
- app title size increase and vertical alignment with the language and theme controls in the header
- fix the scheme-selection fallback notification that fires unconditionally instead of only when the selected scheme is an actual fallback pick
- alphabetical sorting of history groups by label, replacing the previous newest-group-first ordering

**Stories**
1. **Remove the "Show history-ready setup snapshot" debug panel from all production-rendered surfaces**
2. **Increase the app title size and align it vertically with the header's language and theme controls**
3. **Verify the revised header remains stable across all themes, locales, and viewport sizes**
4. **Fix the scheme-selection fallback notification that fires unconditionally**
5. **Sort history groups alphabetically by label across all grouping modes**

**Acceptance Criteria**
- Story 1: No "Show history-ready setup snapshot" control, button, or panel is reachable in any production-rendered surface without a deliberate developer override; the element is absent from the DOM in production builds.
- Story 2: The app title is visually larger and sits at the same vertical level as the language selector and theme toggle in the header; alignment holds on both desktop and mobile viewports.
- Story 3: The revised header passes visual checks in all supported themes and locales; no overflow, truncation, or layout regression is introduced.
- Story 4: The "Least-played fallback used for Scheme selection" notification appears only when the generated setup's selected scheme is actually a fallback pick (i.e., it has non-zero play count and was not the freshest eligible scheme); the notification is absent when the freshest scheme is selected even if other schemes in the pool have been played.
- Story 5: Groups within every history grouping mode are sorted alphabetically by their display label; the previous newest-group-first ordering is replaced.

---
