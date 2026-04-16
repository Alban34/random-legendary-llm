## Epic 21 — Browse and Onboarding Detail Polish

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 21 work complete

### Story 21.1 — Move the onboarding walkthrough shell above the main tab content when it is visible
- [x] Move the onboarding shell above the tab-panel content in the main page flow
- [x] Keep first-run and replay behavior unchanged after the layout move
- [x] **Test:** verify the onboarding shell renders before the tab panels in the shipped shell structure
- [x] **QC (Automated):** automate QC coverage for first-launch onboarding placement in the browser

### Story 21.2 — Restructure the Browse page so the set-browsing section spans the full available width
- [x] Replace the Browse two-column section with stacked sections so the set browser can use the full row
- [x] Keep the Start here guidance visible without constraining the Browse sets panel width
- [x] Add stable test hooks for the revised Browse section structure
- [x] **Test:** verify the Browse renderer exposes the new stacked structure for the sets panel
- [x] **QC (Automated):** automate QC coverage for full-width Browse sets layout on desktop

### Story 21.3 — Remove low-value Browse summary metrics that do not help users act
- [x] Remove the Ready Tabs metric from the Browse hero summary cards
- [x] Keep the remaining summary metrics balanced after the removal
- [x] **Test:** verify the Browse renderer no longer ships the removed metric label
- [x] **QC (Automated):** automate QC coverage to confirm the removed metric is absent from the visible Browse UI

### Story 21.4 — Keep the revised Browse hierarchy readable and stable across supported viewports
- [x] Keep the stacked Browse sections aligned and readable on desktop and mobile layouts
- [x] Preserve replay walkthrough access and About entry points inside the revised Browse hierarchy
- [x] **Test:** verify the revised layout and shell structure remain aligned with the intended hierarchy
- [x] **QC (Automated):** automate QC coverage for viewport-stable Browse hierarchy and panel widths

### Story 21.5 — Align backlog and QC documentation with the polish changes once shipped
- [x] Add the new epic to the post-V1 backlog docs
- [x] Mark the matching `documentation/archive/next-steps.md` items complete
- [x] Document the required automated coverage for the new polish epic
- [x] **Test:** verify planning docs reference Epic 21 consistently
- [x] **QC (Automated):** automate QC coverage for doc-alignment checks that mention Epic 21

### Story 21.6 — Translate residual onboarding chrome that still falls back to English in supported locales
- [x] Identify onboarding labels or eyebrow copy that still fall back to English in shipped locales
- [x] Add translated onboarding eyebrow copy for each supported public locale
- [x] Verify the first-run walkthrough header stays localized after locale switching and reload
- [x] **Test:** verify supported locale resources include the onboarding eyebrow key without falling back to English
- [x] **QC (Automated):** automate QC coverage for the onboarding eyebrow rendered in at least two non-English locales

---
