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
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX1 work complete

### Story UX1.1 — Align the primary shell documentation with the shipped five-tab product
- [ ] Audit every UX-facing document that still describes a four-tab or otherwise outdated shell
- [ ] Update the canonical shell description to reflect Browse, Collection, New Game, History, and Backup as the shipped primary destinations
- [ ] Align shell diagrams, tab labels, and responsive-navigation language across the documentation set
- [ ] Remove or reframe any wording that implies Backup is secondary or absent from the primary navigation contract
- [ ] **Test:** verify all documentation references to the shell now describe the same five-tab information architecture
- [ ] **QC (Automated):** extend documentation-readiness coverage to detect regressions in the five-tab shell contract

### Story UX1.2 — Document the shared header theme and locale controls plus their responsive behavior
- [ ] Document the shared header control group as part of the baseline product experience rather than optional polish
- [ ] Define desktop and mobile placement rules for theme and locale controls
- [ ] Document the expected confirmation, persistence, and focus behavior of header preference changes
- [ ] Clarify how the shared header behaves when the active tab changes or when onboarding is visible
- [ ] **Test:** verify the header documentation matches the shipped preference model and persisted state fields
- [ ] **QC (Automated):** add documentation-contract coverage for shared header controls and their responsive placement rules

### Story UX1.3 — Document the current first-run onboarding, replay, and About-entry behavior
- [ ] Document when onboarding appears on first launch and when it does not reappear automatically
- [ ] Define the skip, next, previous, replay, and completion paths in the UX documentation
- [ ] Document the intended relationship between onboarding, Browse, and the About entry point
- [ ] Clarify reset behavior that restores first-run onboarding visibility
- [ ] **Test:** verify the documented onboarding lifecycle matches stored preference behavior and current runtime expectations
- [ ] **QC (Automated):** add documentation-readiness checks for onboarding visibility, replay, and About-surface wording

### Story UX1.4 — Rewrite the primary New Game and History UI specs to match the shipped flows
- [ ] Expand the New Game documentation to cover play modes, forced picks, result-entry follow-up, and clear/regen behavior
- [ ] Expand the History documentation to cover pending versus completed results, result editing, grouping modes, and insights placement
- [ ] Align UI-spec terminology with the runtime data model and current tests for result states and grouping behavior
- [ ] Document the intended empty, sparse-data, and high-data UX states for History
- [ ] **Test:** verify New Game and History docs describe the same behavior enforced by runtime tests and browser QC
- [ ] **QC (Automated):** add documentation-contract coverage for the shipped New Game and History UX flows

### Story UX1.5 — Mark outdated four-tab or pre-alignment planning language as historical and non-authoritative
- [ ] Identify roadmap, task-list, and planning references that still describe superseded shell or flow assumptions
- [ ] Reframe those references clearly as historical or archival where they are intentionally retained
- [ ] Remove ambiguity about which documentation file is authoritative for current UX behavior
- [ ] Ensure the UX-alignment docs are linked from relevant planning references so future work starts from the right baseline
- [ ] **Test:** verify no retained historical planning doc can be misread as the current UX contract without an explicit archival framing
- [ ] **QC (Automated):** add checks that fail when superseded planning files present themselves as current shipped behavior

---

## Epic UX2 — Global Interaction Continuity and Accessible Recovery

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX2 work complete

### Story UX2.1 — Preserve focus when theme and locale preferences rerender the shell
- [ ] Audit the rerender path for theme and locale changes and identify where focus is currently lost
- [ ] Preserve or explicitly restore focus to the triggering theme button after theme changes
- [ ] Preserve or explicitly restore focus to the locale select after language changes
- [ ] Ensure the focus-restoration logic works after persistence writes and full-shell rerenders on both desktop and mobile
- [ ] **Test:** verify theme and locale changes never leave focus on the document body after rerender
- [ ] **QC (Automated):** add browser QC that changes theme and locale from the shared header and confirms correct post-action focus targets

### Story UX2.2 — Add dependable status confirmation for header preference changes on every tab
- [ ] Decide on the shared confirmation channel for theme and locale changes, such as a header-adjacent status line or polite toast
- [ ] Render the confirmation mechanism consistently from any active tab instead of only Collection
- [ ] Ensure confirmation copy is concise, localizable, and semantically appropriate for user-initiated preference changes
- [ ] Avoid adding redundant or noisy notifications when the change is already visually obvious
- [ ] **Test:** verify preference changes surface the intended confirmation channel from every tab and locale
- [ ] **QC (Automated):** add browser coverage for visible confirmation of theme and locale changes outside Collection

### Story UX2.3 — Keep onboarding progression keyboard-continuous across next, previous, replay, and completion transitions
- [ ] Audit onboarding rerender transitions for focus loss across next, previous, replay, skip, and completion actions
- [ ] Restore focus to the equivalent onboarding control when the same control remains relevant after a step change
- [ ] Move focus to the new step heading when the step content changes materially and a direct control carryover is not ideal
- [ ] Ensure replay and completion transitions also leave users on a meaningful focus target
- [ ] **Test:** verify keyboard progression through the onboarding flow never drops focus to the document body on desktop or mobile
- [ ] **QC (Automated):** add browser QC for onboarding step progression and replay with focus assertions

### Story UX2.4 — Move focus into result entry when it opens from Accept & Log or History
- [ ] Audit the result-editor open path after Accept & Log and from History edit actions
- [ ] Move focus into the result editor when it opens, preferably to the heading or first actionable field
- [ ] Ensure the editor-open focus behavior works for pending-result and completed-result edit paths
- [ ] Preserve the user’s context when the editor is opened inside grouped history sections
- [ ] **Test:** verify opening result entry always lands focus inside the active editor on desktop and mobile
- [ ] **QC (Automated):** add browser QC for post-accept result entry and in-history editing with focus assertions

### Story UX2.5 — Announce result-entry validation errors accessibly and return focus to a meaningful recovery target
- [ ] Add a semantically announced error mechanism for invalid result saves, such as `role="alert"` or an appropriate live region
- [ ] Mark invalid result controls with `aria-invalid` and connect them to error copy
- [ ] Move focus to the error summary or first invalid field after validation fails
- [ ] Return focus to the originating trigger after save, skip, or cancel closes the editor
- [ ] **Test:** verify invalid saves announce recoverable errors and valid closes return focus predictably
- [ ] **QC (Automated):** add browser QC for invalid and corrected result-entry flows including focus-return checks

---

## Epic UX3 — Browse and First-Run Hierarchy Refinement

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX3 work complete

### Story UX3.1 — Redesign the first-run Browse surface around one primary next action
- [ ] Decide the single primary first-run action that should anchor the Browse landing state
- [ ] Rework the first-run hierarchy so onboarding, welcome content, and the main CTA do not compete equally
- [ ] Reduce simultaneous top-level cards and CTA clusters shown before the user acts
- [ ] Keep the first-run surface understandable without duplicating the onboarding walkthrough content
- [ ] **Test:** verify first-run Browse presents one clearly dominant action and does not hide access to the main workflow
- [ ] **QC (Automated):** add browser QC for first-run Browse hierarchy on desktop and mobile viewports

### Story UX3.2 — Move secondary checklist content fully into onboarding or progressive disclosure
- [ ] Identify checklist and helper-copy content that duplicates onboarding guidance
- [ ] Move durable first-use guidance into the onboarding flow or an optional expandable help pattern
- [ ] Keep only the minimum actionable helper text visible in the default Browse state
- [ ] Ensure the revised content still supports replay and discoverability for hesitant users
- [ ] **Test:** verify the default Browse state remains understandable after secondary checklist content is reduced or collapsed
- [ ] **QC (Automated):** add browser QC confirming the reduced default help stack and accessible disclosure behavior

### Story UX3.3 — Simplify the returning-user Browse intro so the catalog starts much sooner
- [ ] Define the minimal returning-user intro content needed after onboarding is complete
- [ ] Reduce welcome copy, duplicated CTAs, and summary blocks that delay the set catalog
- [ ] Keep collection-management actions visible without forcing users through an orientation stack
- [ ] Confirm the revised layout still works for fresh, returning, and reset states
- [ ] **Test:** verify returning users reach filters and the set catalog with substantially less scrolling than the current baseline
- [ ] **QC (Automated):** add browser QC for returning-user Browse scroll position and content ordering on desktop and mobile

### Story UX3.4 — Reduce low-value summary metrics and repeated helper copy that compete with the working surface
- [ ] Audit Browse metrics and helper text for action value versus display cost
- [ ] Remove or demote metrics that do not materially help users decide what to do next
- [ ] Reduce repeated explanation blocks once users have already completed onboarding
- [ ] Ensure any remaining summary content supports collection management or setup generation directly
- [ ] **Test:** verify the revised Browse summary layer still supports task understanding without reintroducing clutter
- [ ] **QC (Automated):** add browser QC ensuring low-value metrics stay removed or demoted from the primary Browse scan path

### Story UX3.5 — Tune desktop and mobile Browse layouts so filters and set browsing become visible earlier in the scroll path
- [ ] Rework Browse spacing and section order so filters and catalog content appear sooner on desktop
- [ ] Rework the phone layout so the set catalog begins much closer to the top of the mobile panel
- [ ] Preserve filter visibility, accessibility, and responsiveness while reducing the pre-catalog stack
- [ ] Validate that the revised Browse layout remains stable across themes and supported locales
- [ ] **Test:** verify desktop and mobile Browse layouts expose filters and set browsing earlier without breaking responsiveness
- [ ] **QC (Automated):** add viewport-based QC that measures or asserts improved Browse content ordering on desktop and mobile

---

## Epic UX4 — Mobile Shell Compression and Task-First Layout

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX4 work complete

### Story UX4.1 — Reduce the mobile header footprint after first-run orientation is complete
- [ ] Audit which header elements must remain permanently visible on phone-sized screens
- [ ] Compress or collapse non-essential branding and descriptive copy after onboarding is complete
- [ ] Ensure the reduced mobile header still communicates app identity and current context clearly
- [ ] Preserve a distinct first-run presentation without carrying the same height cost into routine use
- [ ] **Test:** verify the post-onboarding mobile header uses materially less height while preserving clarity
- [ ] **QC (Automated):** add browser QC that measures reduced mobile header footprint after onboarding completion

### Story UX4.2 — Move theme and locale controls into a lighter mobile preferences pattern
- [ ] Design a mobile-specific preferences entry point that keeps theme and locale discoverable without occupying permanent header space
- [ ] Implement the new mobile preference pattern while keeping desktop behavior intact where appropriate
- [ ] Preserve keyboard and screen-reader accessibility for the relocated controls
- [ ] Ensure the new preference pattern still exposes current selection state clearly
- [ ] **Test:** verify mobile users can discover, change, and confirm theme and locale preferences through the lighter pattern
- [ ] **QC (Automated):** add browser QC for the revised mobile preferences flow across supported locales and themes

### Story UX4.3 — Trim or collapse persistent descriptive copy that repeats across phone screens
- [ ] Identify repeated descriptive text that appears on multiple mobile screens without adding new decision value
- [ ] Collapse, shorten, or relocate repeated copy so task controls remain visually dominant
- [ ] Preserve important orientation cues for first-run users while reducing repeated informational weight later
- [ ] Recheck Browse, New Game, History, and Backup for unnecessary repetition after the copy changes
- [ ] **Test:** verify trimmed copy does not remove required comprehension cues for first-use and returning-user states
- [ ] **QC (Automated):** add browser QC for mobile screens confirming the reduced persistent-copy footprint

### Story UX4.4 — Refine the fixed bottom navigation so it consumes less height without harming tap clarity
- [ ] Audit the current mobile tab bar for label length, spacing, and icon/text balance
- [ ] Reduce vertical footprint while preserving clear tap targets and current-tab visibility
- [ ] Ensure five-tab navigation remains legible across supported locales and themes
- [ ] Confirm the compressed navigation does not obscure panel content or overlap essential controls
- [ ] **Test:** verify the revised bottom navigation remains usable, tappable, and clear on mobile widths
- [ ] **QC (Automated):** add browser QC for bottom-nav height, current-tab clarity, and overlap avoidance on mobile

### Story UX4.5 — Verify that the compressed mobile shell improves task visibility across the major tabs
- [ ] Audit the revised mobile shell against Browse, New Game, History, and Backup after the preceding changes land
- [ ] Confirm active panel content becomes visible earlier in the scroll path on each major tab
- [ ] Tune per-tab spacing where the shell changes expose new opportunities or regressions
- [ ] Capture before/after evidence so the improvement is measurable rather than anecdotal
- [ ] **Test:** verify major mobile tabs retain stability and readability after shell compression changes
- [ ] **QC (Automated):** add cross-tab mobile QC that asserts improved task visibility and no new overlap regressions

---

## Epic UX5 — History as Logbook First, Insights Second

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX5 work complete

### Story UX5.1 — Reorder the History page so grouped records appear before analytics on desktop
- [ ] Redesign the desktop History layout so grouped records and their actions sit above insights
- [ ] Preserve clear access to grouping controls and result-edit actions in the reordered layout
- [ ] Ensure insights remain available without dominating the first viewport
- [ ] Validate the revised layout with light and heavy history datasets
- [ ] **Test:** verify desktop History shows record review above analytics while keeping all current actions usable
- [ ] **QC (Automated):** add desktop browser QC that asserts record sections appear before the insights stack

### Story UX5.2 — Design a mobile-specific History layout that keeps record review dominant
- [ ] Define a phone-first History hierarchy that prioritizes recent records and editability
- [ ] Reduce the chance that a single record is immediately followed by an oversized analytics stack
- [ ] Keep grouping controls understandable without pushing records too far down the screen
- [ ] Validate the mobile History layout across sparse and dense history states
- [ ] **Test:** verify mobile History exposes multiple recent records before deep analytics take over the page
- [ ] **QC (Automated):** add mobile browser QC for record-first History ordering and scroll behavior

### Story UX5.3 — Move insights behind a collapsible, secondary, or companion presentation when appropriate
- [ ] Decide the presentation model for insights after the rebalance: collapsed section, secondary tab, companion area, or explicit reveal
- [ ] Implement the chosen reveal model without breaking current stats calculations
- [ ] Preserve accessibility and discoverability for users who intentionally want insight analysis
- [ ] Ensure the reveal model scales from empty states to heavy data states cleanly
- [ ] **Test:** verify insights remain available and correct while no longer dominating the primary History scan path
- [ ] **QC (Automated):** add browser QC for opening, closing, or navigating to the revised insights presentation

### Story UX5.4 — Clarify the relationship between grouping controls, record actions, and deeper statistics
- [ ] Refine History labels and helper copy so grouping is clearly about presentation, not data mutation
- [ ] Ensure record actions such as add result, edit result, and expand/collapse remain prominent after the layout change
- [ ] Reduce or rewrite explanatory copy that currently competes with the record list
- [ ] Confirm users can understand where to review records versus where to analyze trends
- [ ] **Test:** verify grouping, record editing, and insights remain understandable after the hierarchy changes
- [ ] **QC (Automated):** add browser QC for clear grouping-copy behavior and stable record-action discoverability

### Story UX5.5 — Tune sparse-data and high-data states so History still feels like a practical logbook
- [ ] Define History behavior for zero-record, one-record, sparse, and dense-history states after the layout changes
- [ ] Ensure sparse states still feel useful without overpromoting analytics
- [ ] Ensure dense-history states stay scannable with grouping and record-first ordering intact
- [ ] Validate that insights help when useful but never replace the logbook function
- [ ] **Test:** verify History remains understandable and useful across empty, sparse, and dense data states
- [ ] **QC (Automated):** add browser QC for representative empty, sparse, and dense-history scenarios after the redesign

---

## Epic UX6 — Backup Safety, Maintenance Clarity, and Danger-Zone Separation

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX6 work complete

### Story UX6.1 — Split Backup into distinct sections for portability, maintenance, and destructive reset
- [ ] Redesign the Backup information architecture into clearly separated portability, maintenance, and destructive areas
- [ ] Keep export/import actions prominent and understandable without visual competition from reset controls
- [ ] Move routine per-category resets into their own clearly labeled maintenance section
- [ ] Preserve existing backup preview and restore semantics while improving page scanability
- [ ] **Test:** verify the revised Backup layout preserves all current functionality while making section purposes clearer
- [ ] **QC (Automated):** add browser QC for section ordering and section-label clarity on desktop and mobile

### Story UX6.2 — Create a dedicated danger-zone treatment for full reset with stronger consequence framing
- [ ] Design a distinct danger-zone visual treatment for full reset that is clearly separated from routine actions
- [ ] Add concise pre-action consequence copy directly adjacent to the full-reset control
- [ ] Ensure the danger-zone treatment remains legible and clear across themes and locales
- [ ] Preserve the existing confirmation modal while improving pre-confirmation clarity
- [ ] **Test:** verify the full-reset path remains functionally unchanged while becoming more clearly destructive before confirmation
- [ ] **QC (Automated):** add browser QC for danger-zone visibility and consequence-copy presence

### Story UX6.3 — Collapse or reorganize routine per-category resets on mobile to reduce repeated action stacks
- [ ] Design a mobile-specific organization pattern for per-category resets, such as an accordion or grouped maintenance panel
- [ ] Reduce the length of the mobile reset stack while keeping each category reset discoverable
- [ ] Ensure the reorganization does not weaken clarity about what each reset does
- [ ] Validate the reorganized reset controls across phone-sized viewports and supported locales
- [ ] **Test:** verify mobile users can still access and execute each category reset without scanning a long repeated stack
- [ ] **QC (Automated):** add mobile browser QC for the collapsed or reorganized maintenance-reset pattern

### Story UX6.4 — Reduce explanatory-copy density so maintenance controls are easier to scan
- [ ] Audit Backup helper text for repetition, low-value explanation, and visual competition with actions
- [ ] Shorten or relocate explanatory copy that can be safely deferred behind progressive disclosure
- [ ] Keep essential backup, restore, and reset-risk cues visible where decisions are made
- [ ] Recheck the screen across desktop and mobile to confirm the revised copy improves scanability
- [ ] **Test:** verify reduced Backup copy still preserves comprehension for export, import, reset, merge, and replace flows
- [ ] **QC (Automated):** add browser QC for streamlined Backup copy and stable comprehension cues

### Story UX6.5 — Verify that routine upkeep and destructive removal are visually and cognitively distinct across desktop and mobile
- [ ] Audit the revised Backup screen end to end on desktop and mobile after the earlier changes land
- [ ] Confirm routine maintenance controls no longer read as equivalent in severity to full reset
- [ ] Tune spacing, section order, and action styling wherever the distinction remains weak
- [ ] Capture before/after UX evidence to support the final alignment decision
- [ ] **Test:** verify desktop and mobile Backup flows preserve clarity between safe upkeep, restore operations, and destructive full reset
- [ ] **QC (Automated):** add cross-viewport browser QC for routine-versus-destructive distinction and stable destructive-flow access
