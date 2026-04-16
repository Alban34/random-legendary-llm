## Epic 17 — Onboarding and Information Architecture

### Story 17.1 — Define the first-run onboarding flow and when it should appear
- [x] Decide whether onboarding appears on first launch, first interaction, or by user request
- [x] Define the onboarding entry, exit, skip, and replay behavior
- [x] Identify what must be explained in the first-run experience versus the main UI copy
- [x] Preserve compatibility with returning users and reset behavior
- [x] **Test:** verify first-run detection and replay behavior across clean, returning, and reset states
- [x] **QC (Automated):** automate QC coverage for first-run and returning-user onboarding visibility

### Story 17.2 — Create a lightweight tutorial that introduces the main tabs and actions
- [x] Define the tutorial steps and the minimum useful guidance for each one
- [x] Build the tutorial presentation using accessible controls and clear copy
- [x] Allow users to skip or complete the tutorial without trapping navigation
- [x] Keep the tutorial resilient across mobile and desktop layouts
- [x] **Test:** verify tutorial progression, skip, and completion flows behave correctly
- [x] **QC (Automated):** automate QC coverage for the tutorial on desktop and mobile viewports

### Story 17.3 — Redesign the welcome area to reduce density and improve visual hierarchy
- [x] Audit the current welcome content for crowding and low-priority material
- [x] Reorganize content into clearer groups with better spacing and hierarchy
- [x] Improve calls to action for the primary user journeys
- [x] Preserve design consistency with the existing shell and cards
- [x] **Test:** verify the redesigned welcome area still exposes the necessary primary actions and information
- [x] **QC (Automated):** automate QC coverage for the updated welcome layout at narrow and wide widths

### Story 17.4 — Move developer-facing or project-background details behind an explicit About entry point
- [x] Separate end-user guidance from developer or project-context content
- [x] Add an About entry point with clear but unobtrusive placement
- [x] Ensure secondary information remains accessible without dominating the default screen
- [x] Keep the About content readable and dismissible on small screens
- [x] **Test:** verify project-background information is no longer shown by default and remains reachable when requested
- [x] **QC (Automated):** automate QC coverage for default visibility and About-panel access behavior

### Story 17.5 — Persist onboarding completion so returning users are not repeatedly interrupted
- [x] Add a stored preference or flag for onboarding completion state
- [x] Respect the completion flag on startup while preserving a replay option
- [x] Keep onboarding-state persistence isolated from unrelated preferences
- [x] Ensure reset behavior handles onboarding state intentionally
- [x] **Test:** verify onboarding completion persists across reloads and resets according to the chosen rules
- [x] **QC (Automated):** automate QC coverage for onboarding persistence after completion and after full reset

---
