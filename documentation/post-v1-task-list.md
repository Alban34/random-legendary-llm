# Post-V1 Implementation Task List

STATUS: Approved

This file covers Epics 22 and later. It is read by automated test suites.

---

## Epic 22 — Set Catalog Ordering and Taxonomy Cleanup

**Status**
Approved

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 22 work complete

### Story 22.1 — Define the corrected set taxonomy and ordering contract
- [x] Audit the current set ordering rules across Browse, Collection, and any set-selection controls
- [x] Define the authoritative alphabetical ordering behavior, including tie-breaking and locale-safe sorting assumptions
- [x] Confirm the corrected taxonomy, including treating Core and Villains as base games
- [x] Capture unresolved classification corrections that need source-review or user-provided clarification before implementation
- [x] Add any required documentation-update follow-up for the revised taxonomy and sorting contract
- [x] **Test:** verify the documented ordering and taxonomy rules stay internally consistent across planning references
- [x] **QC (Automated):** add planning coverage that fails if set-ordering and taxonomy assumptions drift across docs

### Story 22.2 — Apply alphabetical ordering consistently across set-driven surfaces
- [x] Identify every user-facing set list that should follow the shared alphabetical ordering contract
- [x] Apply the chosen ordering consistently to Browse set grids, collection checklists, and set-picking controls where relevant
- [x] Preserve any intentional non-alphabetical grouping only where it clearly improves usability and is explicitly documented
- [x] Verify the new ordering does not destabilize selection, filtering, or persisted ownership behavior
- [x] **Test:** verify representative set lists render in the documented alphabetical order
- [x] **QC (Automated):** automate QC coverage for alphabetized set ordering in at least Browse and Collection surfaces

### Story 22.3 — Reclassify sets into the corrected base-game and expansion groupings
- [x] Review the current set-type assignments against the agreed corrected taxonomy
- [x] Reclassify Core and Villains into the shared base-game grouping
- [x] Correct any mistaken small-expansion and large-expansion assignments in the shipped catalog model
- [x] Verify category totals, filters, and badges still behave coherently after the reclassification
- [x] **Test:** verify representative sets resolve to the corrected base-game, small-expansion, or large-expansion grouping
- [x] **QC (Automated):** automate QC coverage for the corrected grouping labels in Browse and Collection views

### Story 22.4 — Verify taxonomy and ordering remain clear across Browse and Collection experiences
- [x] Review Browse filters, grouping labels, and helper copy after the taxonomy and ordering changes
- [x] Review Collection grouping, counts, and empty states for clarity after the reclassification
- [x] Remove or rewrite any wording that still reflects superseded classification rules
- [x] Add any required follow-up documentation tasks if taxonomy decisions affect user guidance or reference docs
- [x] **Test:** verify Browse and Collection contracts remain understandable after the catalog cleanup
- [x] **QC (Automated):** automate QC coverage for taxonomy-aware Browse and Collection interactions after the cleanup

### Story 22.5 — Update supporting documentation and QA expectations for the revised catalog contract
- [x] Update planning or UX documentation that describes set ordering or grouping behavior
- [x] Update any data-reference or design documentation that names the old classification model
- [x] Align regression and QC expectations with the corrected ordering and taxonomy behavior
- [x] Record any remaining manual-review items if final expansion classifications still need external confirmation
- [x] **Test:** verify planning and UX docs reference Epic 22 consistently and do not conflict on taxonomy or ordering
- [x] **QC (Automated):** automate documentation-consistency checks for the revised catalog contract

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

## Epic 24 — Toast Behavior and Feedback Channel Cleanup

**Status**
Approved

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 24 work complete

### Story 24.1 — Define which preference changes should avoid toast notifications entirely
- [x] Audit the events that currently emit toasts for preference or shell changes
- [x] Decide which preference changes should use silent visual feedback instead of a toast
- [x] Confirm that theme switching should not produce a toast in the default interaction path
- [x] Preserve explicit feedback rules for changes that still need confirmation because they are less obvious or higher impact
- [x] Add any required documentation follow-up for the refined notification rules
- [x] **Test:** verify the notification rules distinguish silent preference changes from meaningful toast-worthy events
- [x] **QC (Automated):** add planning coverage for the refined toast-emission contract

### Story 24.2 — Remove theme-switch toasts while preserving clear preference feedback where needed
- [x] Remove toast emission from theme-toggle actions
- [x] Keep any remaining confirmation channel concise, accessible, and non-disruptive if the UX still needs one
- [x] Verify theme changes remain understandable from every major tab without relying on transient toast feedback
- [x] Ensure the quieted behavior stays compatible with locale switching and other shared-header preferences
- [x] **Test:** verify theme changes no longer emit toasts while the selected theme still updates clearly and persistently
- [x] **QC (Automated):** automate QC coverage for quiet theme switching across desktop and mobile layouts

### Story 24.3 — Render bottom-anchored toasts that animate in and out from outside the window
- [x] Anchor the toast stack at the bottom of the viewport rather than inside the layout flow
- [x] Update enter motion so toasts rise in from beyond the visible window edge
- [x] Update exit motion so dismissed toasts leave the screen in the same direction
- [x] Preserve stacked-toast spacing, timing, and dismissal behavior during the motion changes
- [x] **Test:** verify toast placement and motion remain stable for single and stacked notifications
- [x] **QC (Automated):** automate QC coverage for bottom-edge toast entry and exit behavior across representative viewports

### Story 24.4 — Verify toast motion, stacking, and accessibility remain stable across viewports
- [x] Review motion timing and easing so the revised toast behavior feels intentional rather than distracting
- [x] Ensure the bottom toast stack does not cover essential controls or trap focus on small screens
- [x] Preserve semantic roles, reduced-motion compatibility, and manual dismissal affordances
- [x] Add any required follow-up documentation tasks if the refined toast behavior changes UX guidance or accessibility notes
- [x] **Test:** verify bottom-anchored toasts remain accessible and non-disruptive under reduced-motion and stacked-notification scenarios
- [x] **QC (Automated):** automate QC coverage for reduced-motion, stacking order, and mobile overlap behavior

### Story 24.5 — Update documentation and QA expectations for the refined toast contract
- [x] Update UX, accessibility, or planning docs that describe toast behavior or preference-change confirmations
- [x] Align automated coverage expectations with quiet theme switching and bottom-edge toast animation
- [x] Record any remaining open questions about which shared-header changes deserve visible confirmation
- [x] Ensure documentation makes the refined toast contract easy to preserve during future UX work
- [x] **Test:** verify Epic 24 planning and UX docs reference the same toast and feedback behavior
- [x] **QC (Automated):** automate documentation-consistency checks for the refined toast contract

## Epic 25 — Header and New Game Action Density Refinement

**Status**
Approved

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 25 work complete

### Story 25.1 — Define the revised header hierarchy including a compact version display
- [x] Audit the current header for permanently visible elements, duplicate labels, and avoidable vertical cost
- [x] Define where the app version should appear so it remains visible without becoming dominant
- [x] Decide how the version display should behave across desktop and mobile shells
- [x] Confirm the revised header contract still supports onboarding, About access, and shared preferences cleanly
- [x] Add any required documentation tasks for the revised header information hierarchy
- [x] **Test:** verify the planned header contract preserves required controls while reducing visual weight
- [x] **QC (Automated):** add planning coverage for the compact header and version-display rules

### Story 25.2 — Reduce header footprint while keeping theme and locale controls discoverable
- [x] Reassess the placement and density of theme and locale controls in the persistent header
- [x] Introduce a lighter header presentation that keeps preferences accessible without dominating the top of the screen
- [x] Preserve keyboard, touch, and screen-reader access to the shared preferences after the compaction
- [x] Verify the compact header remains stable across locales with longer labels and across supported themes
- [x] **Test:** verify the revised header uses less space while keeping preference changes discoverable and usable
- [x] **QC (Automated):** automate QC coverage for compact-header behavior on desktop and mobile viewports

### Story 25.3 — Consolidate Generate and Regenerate into one clearer action model
- [x] Define the single primary action contract for first generation and subsequent rerolls
- [x] Remove redundant button labeling that suggests two different behaviors when the workflow is effectively the same
- [x] Preserve any distinct secondary actions that still matter, such as accepting or clearing a pending setup
- [x] Update helper copy and state labels so the one-button model remains obvious after a setup is already visible
- [x] **Test:** verify the revised generation controls expose one clear reroll path without changing persistence behavior
- [x] **QC (Automated):** automate QC coverage for first-generation and subsequent reroll flows using the consolidated action model

### Story 25.4 — Move the primary setup action higher in the New Game flow
- [x] Audit which optional information blocks currently push the primary generate action too far down the screen
- [x] Reorder or condense the New Game layout so the primary action appears earlier without hiding important setup choices
- [x] Keep optional explanatory content accessible through secondary placement, disclosure, or more compact presentation
- [x] Verify the revised layout reduces scroll cost on desktop and mobile while preserving accessibility
- [x] **Test:** verify the primary setup action becomes reachable earlier in the scroll path without breaking setup clarity
- [x] **QC (Automated):** automate QC coverage for earlier primary-action visibility on desktop and mobile New Game layouts

### Story 25.5 — Update documentation and QA expectations for the revised shell and setup-action hierarchy
- [x] Update UX and planning docs that describe the header footprint, shared preferences placement, version display, or New Game control hierarchy
- [x] Align automated coverage with the compact shell and one-button generation model
- [x] Record any remaining follow-up decisions if the new header design affects onboarding or mobile-shell guidance
- [x] Ensure the documentation explains why the setup action and header hierarchy were simplified, not only what moved
- [x] **Test:** verify Epic 25 planning and UX docs describe the same revised shell and New Game action contract
- [x] **QC (Automated):** automate documentation-consistency checks for the compact header and setup-action hierarchy

---

## Epic 26 — Remaining Set Classification Data Corrections

**Status: Approved**

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 26 work complete

### Story 26.1 — Audit all base-game, small-expansion, and large-expansion assignments against the published Legendary ruleset

**Status: Approved**

- [x] Read all set entries in the catalog data source and list their current type assignments
- [x] Cross-reference each assignment against the published Legendary ruleset definition of base game, small expansion, and large expansion
- [x] Produce a written correction manifest that names every set whose current classification differs from the target
- [x] Group the manifest by correction category (base-game, small-expansion, large-expansion) so follow-on stories can consume it directly
- [x] **Test:** verify the correction manifest accounts for every set in the catalog and that no set is listed under more than one correction category
- [x] **QC (Automated):** add a QC check that confirms the correction manifest file exists and is non-empty before Story 26.2 work begins

### Story 26.2 — Reclassify Core and Villains as base games throughout the catalog data

**Status: Approved**

- [x] Locate all catalog data entries for Core and Villains and update their type field to the base-game value
- [x] Confirm no other set is unintentionally changed by the same edit
- [x] Verify Core and Villains appear under the base-game group in Browse and Collection surfaces after the change
- [x] Remove or update any hardcoded label or filter assumption that treated Core or Villains as expansions
- [x] **Test:** verify Core and Villains render under the base-game category in every surface that groups by set type
- [x] **QC (Automated):** automate QC coverage that asserts Core and Villains are visible under the base-game group and absent from expansion groups in Browse and Collection

### Story 26.3 — Correct remaining small- and large-expansion misassignments identified by the audit

**Status: Approved**

- [x] Work through each entry in the Story 26.1 correction manifest that is classified as a small- or large-expansion correction
- [x] Update each affected catalog entry's type field to the correct target value
- [x] Confirm no set from the manifest remains uncorrected after changes are applied
- [x] Verify the corrected sets appear in the expected Browse and Collection groups
- [x] **Test:** verify every set flagged in the correction manifest now carries the target classification and renders in the correct Browse and Collection group
- [x] **QC (Automated):** automate QC coverage that iterates the correction manifest and asserts each set appears only under its corrected category in Browse

### Story 26.4 — Fix the Revelations entry to reflect it is a small expansion with no standalone mode

**Status: Approved**

- [x] Locate the Revelations catalog entry and update its type to small expansion
- [x] Remove any standalone-mode flag or row for Revelations from the catalog data
- [x] Confirm no Browse or Collection surface renders a standalone row for Revelations after the change
- [x] Verify Revelations appears correctly grouped as a small expansion in all affected surfaces
- [x] **Test:** verify Revelations shows as a small expansion with no standalone entry in Browse and Collection
- [x] **QC (Automated):** automate QC coverage asserting Revelations is present under small expansions and that no standalone Revelations row appears in any rendered surface

### Story 26.5 — Verify corrected classifications display accurately across Browse and Collection surfaces

**Status: Approved**

- [x] Run through all corrected sets in Browse and confirm each appears in the expected category group
- [x] Run through all corrected sets in Collection and confirm each appears in the expected category group
- [x] Check that alphabetical ordering and filtering show no regressions after the reclassification changes
- [x] Document any edge cases found during the verification pass and confirm they are resolved or logged
- [x] **Test:** verify all corrected sets appear in the right Browse and Collection groups with correct alphabetical order and no stale category assignments
- [x] **QC (Automated):** automate QC coverage for Browse and Collection rendering after the full reclassification, asserting no set appears under an incorrect group

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
