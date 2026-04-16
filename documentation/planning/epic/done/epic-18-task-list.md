## Epic 18 — Theme Personalization and Styling Architecture

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 18 work complete

### Story 18.1 — Add a user-selectable theme toggle and persist the preference in browser state
- [x] Add a theme toggle control in an appropriate persistent UI location
- [x] Define the supported initial theme set and the default selection rule
- [x] Save and load the selected theme from browser state
- [x] Apply the selected theme on startup without visible flicker where feasible
- [x] **Test:** verify theme selection persists across reloads and applies consistently on startup
- [x] **QC (Automated):** automate QC coverage for switching themes and reloading the app

### Story 18.2 — Refactor design tokens so multiple themes can be supported without CSS duplication
- [x] Audit existing CSS variables and theme assumptions
- [x] Separate semantic tokens from concrete palette values
- [x] Define theme token sets for each supported theme
- [x] Keep component styling reusable across themes without duplicated rule blocks
- [x] **Test:** verify components resolve the correct token values across supported themes
- [x] **QC (Automated):** automate QC coverage for representative screens under each theme token set

### Story 18.3 — Verify all primary screens and components remain legible and accessible across themes
- [x] Review contrast-sensitive components across all major screens
- [x] Update badges, cards, controls, and notifications for cross-theme readability
- [x] Preserve visible focus states and semantic state indicators in each theme
- [x] Check empty states and dense content views for visual regressions
- [x] **Test:** verify key screens meet the chosen accessibility checks across supported themes
- [x] **QC (Automated):** automate QC coverage for cross-theme screenshots or assertions on the main app flows

### Story 18.4 — Evaluate candidate third-party CSS approaches that can be bundled statically without runtime dependencies
- [x] Identify realistic CSS-library or utility-layer candidates that fit the project's constraints
- [x] Evaluate whether each option improves maintainability, bundle simplicity, or design flexibility
- [x] Confirm any candidate can be integrated at build time without runtime dependency loading
- [x] Document tradeoffs against keeping the current hand-authored CSS approach
- [x] **Test:** verify any proof-of-concept styling approach can be built into the static app without runtime fetches
- [x] **QC (Automated):** automate QC coverage or build validation for the selected proof-of-concept integration path

### Story 18.5 — Document the styling architecture decision and any migration constraints before adoption
- [x] Record the final styling direction and decision rationale
- [x] Document migration constraints, non-goals, and rollout strategy if a new approach is chosen
- [x] Keep the theme model aligned with the documented design-system contract
- [x] Update future backlog assumptions that depend on the styling decision
- [x] **Test:** verify documentation remains aligned with the implemented theme and styling architecture behavior
- [x] **QC (Automated):** automate QC coverage or consistency checks for documentation references to the chosen styling approach

---
