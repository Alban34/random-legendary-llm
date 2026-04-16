## Epic 4 — Application Shell and Navigation

### Story 4.1 — Expand the base HTML application shell
- [x] Create page structure and root container
- [x] Add five main tab panels
- [x] Add shared header area
- [x] **Test:** verify all five panels render and the default panel is correct
- [x] **QC (Automated):** automate QC coverage for the shell on desktop width and mobile width

### Story 4.2 — Implement responsive tab navigation for desktop and mobile
- [x] Build desktop tab navigation
- [x] Build mobile tab navigation
- [x] Implement tab switching behavior
- [x] Persist active tab if included in preferences
- [x] **Test:** verify tab switching works correctly on both desktop and mobile layouts
- [x] **QC (Automated):** automate QC coverage for keyboard-only navigation through the tabs

### Story 4.3 — Apply the approved dark Marvel visual design system
- [x] Add CSS custom properties from the design spec
- [x] Apply typography, spacing, and borders
- [x] Style primary and secondary buttons
- [x] **Test:** verify key UI primitives render with expected classes/styles
- [x] **QC (Automated):** automate QC coverage to compare the UI against `documentation/ux/ui-design.md`

### Story 4.4 — Create reusable UI primitives for cards, buttons, badges, and panels
- [x] Create set card styles
- [x] Create result card styles
- [x] Create badge styles
- [x] Create panel layout styles
- [x] **Test:** verify shared primitives render consistently across tabs
- [x] **QC (Automated):** automate QC coverage for reused components in at least 3 different screens

### Story 4.5 — Support active-tab persistence and keyboard navigation
- [x] Save selected tab in preferences if implemented
- [x] Add keyboard focus styles
- [x] Ensure tab navigation works with keyboard only
- [x] **Test:** verify selected-tab persistence and focus navigation behavior
- [x] **QC (Automated):** automate QC coverage for full-shell navigation without a mouse

---
