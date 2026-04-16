## Epic 27 — Remaining Shell and Debug Polish

**Status: Approved**

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 27 work complete

### Story 27.1 — Remove the "Show history-ready setup snapshot" debug panel from all production-rendered surfaces

**Status: Approved**

- [x] Locate every render path that conditionally or unconditionally shows the "Show history-ready setup snapshot" control or panel
- [x] Remove the control, trigger button, and panel output from all production-rendered surfaces
- [x] Confirm the element is absent from the DOM in production builds rather than merely hidden via CSS
- [x] Verify no other debug surfaces are accidentally removed or left partially visible during the cleanup
- [x] **Test:** verify the "Show history-ready setup snapshot" button and panel are completely absent from the rendered DOM in production mode across all tabs
- [x] **QC (Automated):** automate QC coverage asserting the debug snapshot control does not appear in any production-rendered surface

### Story 27.2 — Increase the app title size and align it vertically with the header's language and theme controls

**Status: Approved**

- [x] Identify the current font-size and vertical-alignment rules applied to the app title element in the header
- [x] Increase the app title font size to a value that gives the title appropriate visual weight relative to the header controls
- [x] Apply vertical-alignment rules so the title sits at the same baseline or midpoint as the language selector and theme toggle
- [x] Verify the alignment holds on both desktop and mobile viewport widths
- [x] Confirm the updated title does not overflow or wrap unexpectedly on narrow viewports or long locale strings
- [x] **Test:** verify the app title is visually larger and vertically aligned with the language and theme controls on desktop and mobile
- [x] **QC (Automated):** automate QC coverage for app title alignment with the language selector and theme toggle across at least two viewport sizes

### Story 27.3 — Verify the revised header remains stable across all themes, locales, and viewport sizes

**Status: Approved**

- [x] Exercise the revised header in each supported theme and confirm no layout regression or colour clash is introduced
- [x] Exercise the revised header with each supported locale and confirm titles and labels do not overflow or truncate incorrectly
- [x] Test the revised header at narrow, medium, and wide viewport widths and confirm the layout remains stable
- [x] Record any overflow or truncation edge cases found and confirm they are resolved before marking this story done
- [x] **Test:** verify the revised header renders without overflow, truncation, or layout regression in all supported themes, locales, and viewport sizes
- [x] **QC (Automated):** automate QC coverage for the revised header across all theme and locale combinations on desktop and mobile viewports

### Story 27.4 — Fix the scheme-selection fallback notification that fires unconditionally

**Status: Approved**

- [x] Locate the `schemeFallback` condition in `setup-generator.mjs` that uses `schemeSelection.fallbackItems.length` as its gate
- [x] Replace the gate with `schemeSelection.fallbackItems.some((s) => s.id === scheme.id)` so the notification fires only when the selected scheme is itself a fallback pick
- [x] Verify the notification no longer appears when the freshest never-played scheme is selected even if other schemes in the pool have plays
- [x] Verify the notification still appears correctly when every eligible scheme has been played before
- [x] **Test:** verify the corrected condition produces no notification for a fresh scheme pick and produces a notification for a genuine fallback pick
- [x] **QC (Automated):** automate QC coverage asserting the scheme fallback notification is absent on a fresh selection and present on an all-played selection

### Story 27.5 — Sort history groups alphabetically by label

**Status: Approved**

- [x] Replace the `latestCreatedAt`-descending sort in `buildHistoryGroups` with a pure `label.localeCompare` alphabetical sort
- [x] Verify the new sort applies to all five grouping modes (mastermind, scheme, heroes, villains, play-mode)
- [x] **Test:** verify groups for each mode are returned in alphabetical order by label
- [x] **QC (Automated):** automate QC coverage confirming group headers appear in alphabetical order in the History tab

---
