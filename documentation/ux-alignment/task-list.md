# UX Alignment Stories and Task List

STATUS: Proposed

## Purpose

This file is the working checklist for implementing the UX-alignment backlog defined in `documentation/ux-alignment/epics.md`.

Each story is broken into concrete implementation tasks and must also include test and QC coverage before it is considered complete.

**Completion rule:** a story is only considered **Done** when its:
- implementation tasks,
- **Test** task,
- and **QC** task

are all checked.

For all UX-alignment implementation work, completion also requires running the full automated regression suite and confirming it passes:
- `npm test`
- `npx playwright test`

See also: `documentation/ux-alignment/epics.md`, `documentation/ux-review.md`, `documentation/testing-qc-strategy.md`

---

## Epic UX1 — Documentation and UX Contract Alignment

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX1 work complete

### Story UX1.1 — Align the primary shell documentation with the shipped five-tab product
- [x] Audit every UX-facing document that still describes a four-tab or otherwise outdated shell
- [x] Update the canonical shell description to reflect Browse, Collection, New Game, History, and Backup as the shipped primary destinations
- [x] Align shell diagrams, tab labels, and responsive-navigation language across the documentation set
- [x] Remove or reframe any wording that implies Backup is secondary or absent from the primary navigation contract
- [x] **Test:** verify all documentation references to the shell now describe the same five-tab information architecture
- [x] **QC (Automated):** extend documentation-readiness coverage to detect regressions in the five-tab shell contract

### Story UX1.2 — Document the shared header theme and locale controls plus their responsive behavior
- [x] Document the shared header control group as part of the baseline product experience rather than optional polish
- [x] Define desktop and mobile placement rules for theme and locale controls
- [x] Document the expected confirmation, persistence, and focus behavior of header preference changes
- [x] Clarify how the shared header behaves when the active tab changes or when onboarding is visible
- [x] **Test:** verify the header documentation matches the shipped preference model and persisted state fields
- [x] **QC (Automated):** add documentation-contract coverage for shared header controls and their responsive placement rules

### Story UX1.3 — Document the current first-run onboarding, replay, and About-entry behavior
- [x] Document when onboarding appears on first launch and when it does not reappear automatically
- [x] Define the skip, next, previous, replay, and completion paths in the UX documentation
- [x] Document the intended relationship between onboarding, Browse, and the About entry point
- [x] Clarify reset behavior that restores first-run onboarding visibility
- [x] **Test:** verify the documented onboarding lifecycle matches stored preference behavior and current runtime expectations
- [x] **QC (Automated):** add documentation-readiness checks for onboarding visibility, replay, and About-surface wording

### Story UX1.4 — Rewrite the primary New Game and History UI specs to match the shipped flows
- [x] Expand the New Game documentation to cover play modes, forced picks, result-entry follow-up, and clear/regen behavior
- [x] Expand the History documentation to cover pending versus completed results, result editing, grouping modes, and insights placement
- [x] Align UI-spec terminology with the runtime data model and current tests for result states and grouping behavior
- [x] Document the intended empty, sparse-data, and high-data UX states for History
- [x] **Test:** verify New Game and History docs describe the same behavior enforced by runtime tests and browser QC
- [x] **QC (Automated):** add documentation-contract coverage for the shipped New Game and History UX flows

### Story UX1.5 — Mark outdated four-tab or pre-alignment planning language as historical and non-authoritative
- [x] Identify roadmap, task-list, and planning references that still describe superseded shell or flow assumptions
- [x] Reframe those references clearly as historical or archival where they are intentionally retained
- [x] Remove ambiguity about which documentation file is authoritative for current UX behavior
- [x] Ensure the UX-alignment docs are linked from relevant planning references so future work starts from the right baseline
- [x] **Test:** verify no retained historical planning doc can be misread as the current UX contract without an explicit archival framing
- [x] **QC (Automated):** add checks that fail when superseded planning files present themselves as current shipped behavior

---

## Epic UX2 — Global Interaction Continuity and Accessible Recovery

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX2 work complete

### Story UX2.1 — Preserve focus when theme and locale preferences rerender the shell
- [x] Audit the rerender path for theme and locale changes and identify where focus is currently lost
- [x] Preserve or explicitly restore focus to the triggering theme button after theme changes
- [x] Preserve or explicitly restore focus to the locale select after language changes
- [x] Ensure the focus-restoration logic works after persistence writes and full-shell rerenders on both desktop and mobile
- [x] **Test:** verify theme and locale changes never leave focus on the document body after rerender
- [x] **QC (Automated):** add browser QC that changes theme and locale from the shared header and confirms correct post-action focus targets

### Story UX2.2 — Add dependable status confirmation for header preference changes on every tab
- [x] Decide on the shared confirmation channel for theme and locale changes, such as a header-adjacent status line or polite toast
- [x] Render the confirmation mechanism consistently from any active tab instead of only Collection
- [x] Ensure confirmation copy is concise, localizable, and semantically appropriate for user-initiated preference changes
- [x] Avoid adding redundant or noisy notifications when the change is already visually obvious
- [x] **Test:** verify preference changes surface the intended confirmation channel from every tab and locale
- [x] **QC (Automated):** add browser coverage for visible confirmation of theme and locale changes outside Collection

### Story UX2.3 — Keep onboarding progression keyboard-continuous across next, previous, replay, and completion transitions
- [x] Audit onboarding rerender transitions for focus loss across next, previous, replay, skip, and completion actions
- [x] Restore focus to the equivalent onboarding control when the same control remains relevant after a step change
- [x] Move focus to the new step heading when the step content changes materially and a direct control carryover is not ideal
- [x] Ensure replay and completion transitions also leave users on a meaningful focus target
- [x] **Test:** verify keyboard progression through the onboarding flow never drops focus to the document body on desktop or mobile
- [x] **QC (Automated):** add browser QC for onboarding step progression and replay with focus assertions

### Story UX2.4 — Move focus into result entry when it opens from Accept & Log or History
- [x] Audit the result-editor open path after Accept & Log and from History edit actions
- [x] Move focus into the result editor when it opens, preferably to the heading or first actionable field
- [x] Ensure the editor-open focus behavior works for pending-result and completed-result edit paths
- [x] Preserve the user’s context when the editor is opened inside grouped history sections
- [x] **Test:** verify opening result entry always lands focus inside the active editor on desktop and mobile
- [x] **QC (Automated):** add browser QC for post-accept result entry and in-history editing with focus assertions

### Story UX2.5 — Announce result-entry validation errors accessibly and return focus to a meaningful recovery target
- [x] Add a semantically announced error mechanism for invalid result saves, such as `role="alert"` or an appropriate live region
- [x] Mark invalid result controls with `aria-invalid` and connect them to error copy
- [x] Move focus to the error summary or first invalid field after validation fails
- [x] Return focus to the originating trigger after save, skip, or cancel closes the editor
- [x] **Test:** verify invalid saves announce recoverable errors and valid closes return focus predictably
- [x] **QC (Automated):** add browser QC for invalid and corrected result-entry flows including focus-return checks

---

## Epic UX3 — Browse and First-Run Hierarchy Refinement

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX3 work complete

### Story UX3.1 — Redesign the first-run Browse surface around one primary next action
- [x] Decide the single primary first-run action that should anchor the Browse landing state
- [x] Rework the first-run hierarchy so onboarding, welcome content, and the main CTA do not compete equally
- [x] Reduce simultaneous top-level cards and CTA clusters shown before the user acts
- [x] Keep the first-run surface understandable without duplicating the onboarding walkthrough content
- [x] **Test:** verify first-run Browse presents one clearly dominant action and does not hide access to the main workflow
- [x] **QC (Automated):** add browser QC for first-run Browse hierarchy on desktop and mobile viewports

### Story UX3.2 — Move secondary checklist content fully into onboarding or progressive disclosure
- [x] Identify checklist and helper-copy content that duplicates onboarding guidance
- [x] Move durable first-use guidance into the onboarding flow or an optional expandable help pattern
- [x] Keep only the minimum actionable helper text visible in the default Browse state
- [x] Ensure the revised content still supports replay and discoverability for hesitant users
- [x] **Test:** verify the default Browse state remains understandable after secondary checklist content is reduced or collapsed
- [x] **QC (Automated):** add browser QC confirming the reduced default help stack and accessible disclosure behavior

### Story UX3.3 — Simplify the returning-user Browse intro so the catalog starts much sooner
- [x] Define the minimal returning-user intro content needed after onboarding is complete
- [x] Reduce welcome copy, duplicated CTAs, and summary blocks that delay the set catalog
- [x] Keep collection-management actions visible without forcing users through an orientation stack
- [x] Confirm the revised layout still works for fresh, returning, and reset states
- [x] **Test:** verify returning users reach filters and the set catalog with substantially less scrolling than the current baseline
- [x] **QC (Automated):** add browser QC for returning-user Browse scroll position and content ordering on desktop and mobile

### Story UX3.4 — Reduce low-value summary metrics and repeated helper copy that compete with the working surface
- [x] Audit Browse metrics and helper text for action value versus display cost
- [x] Remove or demote metrics that do not materially help users decide what to do next
- [x] Reduce repeated explanation blocks once users have already completed onboarding
- [x] Ensure any remaining summary content supports collection management or setup generation directly
- [x] **Test:** verify the revised Browse summary layer still supports task understanding without reintroducing clutter
- [x] **QC (Automated):** add browser QC ensuring low-value metrics stay removed or demoted from the primary Browse scan path

### Story UX3.5 — Tune desktop and mobile Browse layouts so filters and set browsing become visible earlier in the scroll path
- [x] Rework Browse spacing and section order so filters and catalog content appear sooner on desktop
- [x] Rework the phone layout so the set catalog begins much closer to the top of the mobile panel
- [x] Preserve filter visibility, accessibility, and responsiveness while reducing the pre-catalog stack
- [x] Validate that the revised Browse layout remains stable across themes and supported locales
- [x] **Test:** verify desktop and mobile Browse layouts expose filters and set browsing earlier without breaking responsiveness
- [x] **QC (Automated):** add viewport-based QC that measures or asserts improved Browse content ordering on desktop and mobile

---

## Epic UX4 — Mobile Shell Compression and Task-First Layout

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX4 work complete

### Story UX4.1 — Reduce the mobile header footprint after first-run orientation is complete
- [x] Audit which header elements must remain permanently visible on phone-sized screens
- [x] Compress or collapse non-essential branding and descriptive copy after onboarding is complete
- [x] Ensure the reduced mobile header still communicates app identity and current context clearly
- [x] Preserve a distinct first-run presentation without carrying the same height cost into routine use
- [x] **Test:** verify the post-onboarding mobile header uses materially less height while preserving clarity
- [x] **QC (Automated):** add browser QC that measures reduced mobile header footprint after onboarding completion

### Story UX4.2 — Move theme and locale controls into a lighter mobile preferences pattern
- [x] Design a mobile-specific preferences entry point that keeps theme and locale discoverable without occupying permanent header space
- [x] Implement the new mobile preference pattern while keeping desktop behavior intact where appropriate
- [x] Preserve keyboard and screen-reader accessibility for the relocated controls
- [x] Ensure the new preference pattern still exposes current selection state clearly
- [x] **Test:** verify mobile users can discover, change, and confirm theme and locale preferences through the lighter pattern
- [x] **QC (Automated):** add browser QC for the revised mobile preferences flow across supported locales and themes

### Story UX4.3 — Trim or collapse persistent descriptive copy that repeats across phone screens
- [x] Identify repeated descriptive text that appears on multiple mobile screens without adding new decision value
- [x] Collapse, shorten, or relocate repeated copy so task controls remain visually dominant
- [x] Preserve important orientation cues for first-run users while reducing repeated informational weight later
- [x] Recheck Browse, New Game, History, and Backup for unnecessary repetition after the copy changes
- [x] **Test:** verify trimmed copy does not remove required comprehension cues for first-use and returning-user states
- [x] **QC (Automated):** add browser QC for mobile screens confirming the reduced persistent-copy footprint

### Story UX4.4 — Refine the fixed bottom navigation so it consumes less height without harming tap clarity
- [x] Audit the current mobile tab bar for label length, spacing, and icon/text balance
- [x] Reduce vertical footprint while preserving clear tap targets and current-tab visibility
- [x] Ensure five-tab navigation remains legible across supported locales and themes
- [x] Confirm the compressed navigation does not obscure panel content or overlap essential controls
- [x] **Test:** verify the revised bottom navigation remains usable, tappable, and clear on mobile widths
- [x] **QC (Automated):** add browser QC for bottom-nav height, current-tab clarity, and overlap avoidance on mobile

### Story UX4.5 — Verify that the compressed mobile shell improves task visibility across the major tabs
- [x] Audit the revised mobile shell against Browse, New Game, History, and Backup after the preceding changes land
- [x] Confirm active panel content becomes visible earlier in the scroll path on each major tab
- [x] Tune per-tab spacing where the shell changes expose new opportunities or regressions
- [x] Capture before/after evidence so the improvement is measurable rather than anecdotal
- [x] **Test:** verify major mobile tabs retain stability and readability after shell compression changes
- [x] **QC (Automated):** add cross-tab mobile QC that asserts improved task visibility and no new overlap regressions

---

## Epic UX5 — History as Logbook First, Insights Second

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX5 work complete

### Story UX5.1 — Reorder the History page so grouped records appear before analytics on desktop
- [x] Redesign the desktop History layout so grouped records and their actions sit above insights
- [x] Preserve clear access to grouping controls and result-edit actions in the reordered layout
- [x] Ensure insights remain available without dominating the first viewport
- [x] Validate the revised layout with light and heavy history datasets
- [x] **Test:** verify desktop History shows record review above analytics while keeping all current actions usable
- [x] **QC (Automated):** add desktop browser QC that asserts record sections appear before the insights stack

### Story UX5.2 — Design a mobile-specific History layout that keeps record review dominant
- [x] Define a phone-first History hierarchy that prioritizes recent records and editability
- [x] Reduce the chance that a single record is immediately followed by an oversized analytics stack
- [x] Keep grouping controls understandable without pushing records too far down the screen
- [x] Validate the mobile History layout across sparse and dense history states
- [x] **Test:** verify mobile History exposes multiple recent records before deep analytics take over the page
- [x] **QC (Automated):** add mobile browser QC for record-first History ordering and scroll behavior

### Story UX5.3 — Move insights behind a collapsible, secondary, or companion presentation when appropriate
- [x] Decide the presentation model for insights after the rebalance: collapsed section, secondary tab, companion area, or explicit reveal
- [x] Implement the chosen reveal model without breaking current stats calculations
- [x] Preserve accessibility and discoverability for users who intentionally want insight analysis
- [x] Ensure the reveal model scales from empty states to heavy data states cleanly
- [x] **Test:** verify insights remain available and correct while no longer dominating the primary History scan path
- [x] **QC (Automated):** add browser QC for opening, closing, or navigating to the revised insights presentation

### Story UX5.4 — Clarify the relationship between grouping controls, record actions, and deeper statistics
- [x] Refine History labels and helper copy so grouping is clearly about presentation, not data mutation
- [x] Ensure record actions such as add result, edit result, and expand/collapse remain prominent after the layout change
- [x] Reduce or rewrite explanatory copy that currently competes with the record list
- [x] Confirm users can understand where to review records versus where to analyze trends
- [x] **Test:** verify grouping, record editing, and insights remain understandable after the hierarchy changes
- [x] **QC (Automated):** add browser QC for clear grouping-copy behavior and stable record-action discoverability

### Story UX5.5 — Tune sparse-data and high-data states so History still feels like a practical logbook
- [x] Define History behavior for zero-record, one-record, sparse, and dense-history states after the layout changes
- [x] Ensure sparse states still feel useful without overpromoting analytics
- [x] Ensure dense-history states stay scannable with grouping and record-first ordering intact
- [x] Validate that insights help when useful but never replace the logbook function
- [x] **Test:** verify History remains understandable and useful across empty, sparse, and dense data states
- [x] **QC (Automated):** add browser QC for representative empty, sparse, and dense-history scenarios after the redesign

---

## Epic UX6 — Backup Safety, Maintenance Clarity, and Danger-Zone Separation

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX6 work complete

### Story UX6.1 — Split Backup into distinct sections for portability, maintenance, and destructive reset
- [x] Redesign the Backup information architecture into clearly separated portability, maintenance, and destructive areas
- [x] Keep export/import actions prominent and understandable without visual competition from reset controls
- [x] Move routine per-category resets into their own clearly labeled maintenance section
- [x] Preserve existing backup preview and restore semantics while improving page scanability
- [x] **Test:** verify the revised Backup layout preserves all current functionality while making section purposes clearer
- [x] **QC (Automated):** add browser QC for section ordering and section-label clarity on desktop and mobile

### Story UX6.2 — Create a dedicated danger-zone treatment for full reset with stronger consequence framing
- [x] Design a distinct danger-zone visual treatment for full reset that is clearly separated from routine actions
- [x] Add concise pre-action consequence copy directly adjacent to the full-reset control
- [x] Ensure the danger-zone treatment remains legible and clear across themes and locales
- [x] Preserve the existing confirmation modal while improving pre-confirmation clarity
- [x] **Test:** verify the full-reset path remains functionally unchanged while becoming more clearly destructive before confirmation
- [x] **QC (Automated):** add browser QC for danger-zone visibility and consequence-copy presence

### Story UX6.3 — Collapse or reorganize routine per-category resets on mobile to reduce repeated action stacks
- [x] Design a mobile-specific organization pattern for per-category resets, such as an accordion or grouped maintenance panel
- [x] Reduce the length of the mobile reset stack while keeping each category reset discoverable
- [x] Ensure the reorganization does not weaken clarity about what each reset does
- [x] Validate the reorganized reset controls across phone-sized viewports and supported locales
- [x] **Test:** verify mobile users can still access and execute each category reset without scanning a long repeated stack
- [x] **QC (Automated):** add mobile browser QC for the collapsed or reorganized maintenance-reset pattern

### Story UX6.4 — Reduce explanatory-copy density so maintenance controls are easier to scan
- [x] Audit Backup helper text for repetition, low-value explanation, and visual competition with actions
- [x] Shorten or relocate explanatory copy that can be safely deferred behind progressive disclosure
- [x] Keep essential backup, restore, and reset-risk cues visible where decisions are made
- [x] Recheck the screen across desktop and mobile to confirm the revised copy improves scanability
- [x] **Test:** verify reduced Backup copy still preserves comprehension for export, import, reset, merge, and replace flows
- [x] **QC (Automated):** add browser QC for streamlined Backup copy and stable comprehension cues

### Story UX6.5 — Verify that routine upkeep and destructive removal are visually and cognitively distinct across desktop and mobile
- [x] Audit the revised Backup screen end to end on desktop and mobile after the earlier changes land
- [x] Confirm routine maintenance controls no longer read as equivalent in severity to full reset
- [x] Tune spacing, section order, and action styling wherever the distinction remains weak
- [x] Capture before/after UX evidence to support the final alignment decision
- [x] **Test:** verify desktop and mobile Backup flows preserve clarity between safe upkeep, restore operations, and destructive full reset
- [x] **QC (Automated):** add cross-viewport browser QC for routine-versus-destructive distinction and stable destructive-flow access
