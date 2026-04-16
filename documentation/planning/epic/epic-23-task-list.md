## Epic 23 — Stats and Secondary Information Simplification

**Status**
Approved

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 23 work complete

### Story 23.1 — Define a record-first stats layout with collapsible full-width sections
- [x] Audit the current stats surface for narrow tiles, repeated headings, and low-value supporting copy
- [x] Define the revised hierarchy so per-category stats sections are full width and individually collapsible
- [x] Decide the default expanded or collapsed behavior for sparse and dense histories
- [x] Ensure the new layout contract keeps recent-game review and result actions easy to reach
- [x] Add any required documentation follow-up for the revised stats hierarchy
- [x] **Test:** verify the planned stats hierarchy remains consistent with the intended History-first UX direction
- [x] **QC (Automated):** add planning coverage for the revised full-width collapsible stats contract

### Story 23.2 — Rebuild per-category stats tiles into full-width collapsible panels
- [x] Replace narrow category tiles with full-width stats sections for heroes, masterminds, and other tracked categories
- [x] Add accessible expand and collapse affordances for each category section
- [x] Keep key summary numbers visible enough that users can scan without opening every panel
- [x] Preserve stable layout behavior across desktop and mobile viewports
- [x] **Test:** verify collapsible category panels render correctly for empty, sparse, and dense stats data
- [x] **QC (Automated):** automate QC coverage for expanding and collapsing multiple stats sections on desktop and mobile

### Story 23.3 — Remove low-value technical messaging from user-facing surfaces
- [x] Audit current user-facing copy for technical disclaimers that do not help users decide what to do next
- [x] Remove or rewrite messages such as presentation-only grouping disclaimers when they add more noise than clarity
- [x] Preserve only the technical detail that is necessary for trust, recovery, or data-safety understanding
- [x] Add documentation tasks where copy removals require updated UX or support references
- [x] **Test:** verify the remaining copy still explains important state boundaries without unnecessary technical detail
- [x] **QC (Automated):** automate QC coverage to confirm removed technical copy no longer appears in the visible UI

### Story 23.4 — Show storage status only when the app needs the user to act
- [x] Review the current storage-health messaging and identify which states are informational versus actionable
- [x] Hide healthy-storage indicators that merely announce normal behavior
- [x] Keep storage warnings and recovery guidance visible only when persistence is unavailable, degraded, or needs attention
- [x] Preserve accessible status announcement behavior for genuine storage problems
- [x] **Test:** verify storage status appears only for warning or error conditions and stays absent during healthy operation
- [x] **QC (Automated):** automate QC coverage for healthy, degraded, and unavailable storage scenarios

### Story 23.5 — Update documentation and QA expectations for the simplified information model
- [x] Update UX and planning docs that describe the stats layout, technical helper copy, or storage-status behavior
- [x] Align automation expectations with collapsible stats panels and issue-only storage messaging
- [x] Record any remaining follow-up questions if simplification creates new copy or accessibility review needs
- [x] Confirm doc updates cover the intent behind reduced technical messaging, not only the visual changes
- [x] **Test:** verify Epic 23 planning and UX references describe the same simplified information model
- [x] **QC (Automated):** automate documentation-consistency checks for stats hierarchy and storage-status expectations
