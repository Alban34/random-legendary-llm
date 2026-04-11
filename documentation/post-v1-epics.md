# Post-V1 Epics and Stories

STATUS: Approved

## Purpose

This document captures the proposed post-V1 backlog derived from `documentation/_next-steps.md`.

It is intended to:
- keep future work separate from the approved V1 scope,
- group individual improvement ideas into coherent delivery epics,
- and provide story-level planning before implementation tasks are created.

See also: `documentation/post-v1-delivery-sequence.md`, `documentation/post-v1-task-list.md`

---

## Epic 11 — Alternate Solo and Multiplayer Modes

**Objective**
Expand setup generation and game logging to support additional supported play modes beyond the current single-handed flow.

**In scope**
- two-handed solo support
- mode-specific setup requirements
- mode-aware validation and history labels
- UX changes for selecting alternate play modes

**Stories**
1. **Define the rules and UX contract for two-handed solo mode**
2. **Extend setup templates and validation for alternate play modes**
3. **Render play-mode selection and explain its impact in the New Game flow**
4. **Persist accepted setups with explicit play-mode metadata**
5. **Verify history, stats, and export payloads remain compatible with the new mode model**

---

## Epic 12 — Score Logging and Results History

**Objective**
Capture the outcome of a played game so the app can retain meaningful score and result history instead of setup history alone.

**In scope**
- post-game score entry
- win/loss tracking
- score history persistence
- result summaries in history

**Stories**
1. **Define a post-game result model that extends the existing game record safely**
2. **Add score and outcome entry to the accepted game workflow**
3. **Persist score history alongside setup history without breaking existing saved state**
4. **Render score and outcome summaries in the History experience**
5. **Support editing or correcting a logged result after the initial save**

---

## Epic 13 — Data Portability and Backup

**Objective**
Allow users to back up and restore their app data so collection progress and play history are portable between browsers or devices.

**In scope**
- JSON export
- JSON import
- schema validation
- merge or replace restore behavior
- compatibility safeguards

**Stories**
1. **Define a versioned import/export schema for collection, preferences, history, and scores**
2. **Export app data as a downloadable JSON file**
3. **Import previously exported JSON data through the UI**
4. **Validate imported payloads and show actionable recovery errors**
5. **Offer safe restore modes for replacing or merging existing local data**

---

## Epic 14 — Insights and Statistics Dashboard

**Objective**
Turn stored play history and usage data into useful gameplay insights that help users understand what they play most and how often they win.

**In scope**
- aggregate game counts
- win/loss ratio
- score trends
- most-played and least-played entities
- collection usage insights

**Stories**
1. **Define the derived metrics that can be computed from history and usage state**
2. **Compute summary statistics for games played, outcomes, and scores**
3. **Surface most-played and least-played cards or groups across categories**
4. **Add a dedicated stats presentation in History or a new insights view**
5. **Handle sparse or partial data gracefully so early users still see useful feedback**

---

## Epic 15 — Guided Setup Constraints and Forced Picks

**Objective**
Give users more control over setup generation by allowing them to require specific cards or entities in the next generated setup when legal.

**In scope**
- forced card selection
- legality-aware generator constraints
- fallback messaging when constraints cannot be satisfied
- UX for choosing and clearing forced picks

**Stories**
1. **Define which entity categories can be forced into a generated setup**
2. **Add UI controls for selecting, reviewing, and clearing forced picks**
3. **Update generator logic to satisfy forced picks when a legal setup exists**
4. **Explain clearly when a forced pick makes the setup impossible for the current collection or player mode**
5. **Persist or intentionally scope forced-pick preferences based on the final UX decision**

---

## Epic 16 — Notification and Feedback Refinements

**Objective**
Reduce noise in the app's feedback model while making transient notifications behave more naturally and accessibly.

**In scope**
- auto-dismissing toasts
- manual dismissal
- critical vs non-critical toast behavior
- duplicate or low-value notification suppression
- non-blocking toast layout

**Stories**
1. **Classify notifications by persistence and dismissal behavior**
2. **Auto-dismiss non-critical toasts after an accessible timeout**
3. **Allow users to dismiss transient toasts directly**
4. **Suppress low-value notifications when equivalent information is already visible in the UI**
5. **Preserve critical error messaging until the user has a reasonable chance to acknowledge it**

---

## Epic 17 — Onboarding and Information Architecture

**Objective**
Make the app easier to approach for first-time users by simplifying the welcome experience and moving secondary project details out of the primary flow.

**In scope**
- first-run tutorial or walkthrough
- welcome page redesign
- progressive disclosure of project information
- clearer grouping and spacing in introductory content

**Stories**
1. **Define the first-run onboarding flow and when it should appear**
2. **Create a lightweight tutorial that introduces the main tabs and actions**
3. **Redesign the welcome area to reduce density and improve visual hierarchy**
4. **Move developer-facing or project-background details behind an explicit About entry point**
5. **Persist onboarding completion so returning users are not repeatedly interrupted**

---

## Epic 18 — Theme Personalization and Styling Architecture

**Objective**
Improve visual flexibility and long-term maintainability by adding theme controls and evaluating whether the CSS approach should evolve.

**In scope**
- dark mode toggle behavior
- theme preference persistence
- design token expansion
- investigation of build-time CSS library adoption without runtime dependencies

**Stories**
1. **Add a user-selectable theme toggle and persist the preference in browser state**
2. **Refactor design tokens so multiple themes can be supported without CSS duplication**
3. **Verify all primary screens and components remain legible and accessible across themes**
4. **Evaluate candidate third-party CSS approaches that can be bundled statically without runtime dependencies**
5. **Document the styling architecture decision and any migration constraints before adoption**

---

## Additional post-V1 backlog

These epics come from the remaining or newly adopted ideas in `documentation/_next-steps.md`. They can be sequenced in `documentation/post-v1-delivery-sequence.md` once they are ready for implementation.

## Epic 19 — Interface Localization

**Objective**
Make the application usable in multiple languages without destabilizing canonical game data, persisted state, or accessibility behavior.

**In scope**
- localized UI chrome and helper copy
- locale selection and persistence
- fallback rules for missing translations
- locale-aware formatting for dates and numbers
- layout and accessibility verification across languages

**Stories**
1. **Define the localization architecture, supported locales, and fallback rules**
2. **Externalize user-facing application strings and formatting rules**
3. **Add a language selector and persist the chosen locale**
4. **Verify localized layouts remain readable and accessible**
5. **Establish translation maintenance and QA safeguards**

---

## Epic 20 — History Grouping and Organization

**Objective**
Improve scanability for larger play histories by organizing records into clearer groups without weakening result editing, insights, or portability guarantees.

**In scope**
- grouping modes for history presentation
- grouped section rendering and navigation
- compatibility with legacy records and duplicate names
- grouping controls or view toggles
- keeping grouping state separate from the underlying persisted history model

**Stories**
1. **Define the grouping model and user-facing history contract**
2. **Build grouped history derivations without breaking existing records**
3. **Render grouped history sections with clear navigation and collapse behavior**
4. **Support regrouping or filtering without breaking history actions**
5. **Keep grouped history compatible with insights, backup, and future exports**

---

## Epic 21 — Browse and Onboarding Detail Polish

**Objective**
Resolve remaining low-risk UX rough edges in the Browse and onboarding surfaces so the landing experience feels more intentional and less cluttered.

**In scope**
- onboarding shell placement in the page flow
- Browse page section stacking and width usage
- removal of low-value summary metrics
- residual untranslated onboarding chrome in supported locales
- keeping the revised landing layout stable on desktop and mobile

**Stories**
1. **Move the onboarding walkthrough shell above the main tab content when it is visible**
2. **Restructure the Browse page so the set-browsing section spans the full available width**
3. **Remove low-value Browse summary metrics that do not help users act**
4. **Keep the revised Browse hierarchy readable and stable across supported viewports**
5. **Align backlog and QC documentation with the polish changes once shipped**
6. **Translate residual onboarding chrome that still falls back to English in supported locales**

---

## Additional backlog candidates in review

These epics are derived from the newly added unchecked items in `documentation/_next-steps.md`.

## Epic 22 — Set Catalog Ordering and Taxonomy Cleanup

**Status**
Done

**Objective**
Make set browsing and collection management easier to scan by applying consistent alphabetical ordering and correcting the set-type taxonomy used across the app.

**In scope**
- alphabetical ordering for set-driven lists and controls
- corrected set classification rules
- base-game grouping for Core and Villains
- review of small and large expansion assignments
- documentation and QA alignment for the revised catalog contract

**Stories**
1. **Define the corrected set taxonomy and ordering contract**
2. **Apply alphabetical ordering consistently across set-driven surfaces**
3. **Reclassify sets into the corrected base-game and expansion groupings**
4. **Verify taxonomy and ordering remain clear across Browse and Collection experiences**
5. **Update supporting documentation and QA expectations for the revised catalog contract**

---

## Epic 23 — Stats and Secondary Information Simplification

**Status**
Done

**Objective**
Reduce information density in the stats and maintenance surfaces so practical gameplay information stays prominent and low-value technical status copy recedes. The guiding principle is to surface only user-actionable information: messages and indicators that do not require a user response are suppressed so the interface communicates necessity rather than status.

**In scope**
- full-width collapsible stats sections
- simplified stats information hierarchy
- removal of unnecessary technical copy
- storage issue visibility only when an actionable problem exists
- documentation alignment for the simplified user-facing contract

**Stories**
1. **Define a record-first stats layout with collapsible full-width sections**
2. **Rebuild per-category stats tiles into full-width collapsible panels**
3. **Remove low-value technical messaging from user-facing surfaces**
4. **Show storage status only when the app needs the user to act**
5. **Update documentation and QA expectations for the simplified information model**

---

## Epic 24 — Toast Behavior and Feedback Channel Cleanup

**Status**
Done

**Objective**
Make feedback quieter and more natural by reserving toasts for meaningful events and refining how the toast stack enters, exits, and anchors to the viewport.

**In scope**
- suppression of theme-switch toasts
- bottom-anchored toast placement
- enter and exit motion from outside the viewport
- stacked-toast stability
- accessibility and documentation alignment for refined feedback behavior

**Stories**
1. **Define which preference changes should avoid toast notifications entirely**
2. **Remove theme-switch toasts while preserving clear preference feedback where needed**
3. **Render bottom-anchored toasts that animate in and out from outside the window**
4. **Verify toast motion, stacking, and accessibility remain stable across viewports**
5. **Update documentation and QA expectations for the refined toast contract**

---

## Epic 25 — Header and New Game Action Density Refinement

**Status**
Done

**Objective**
Reduce persistent chrome weight and bring the primary setup action closer to the user so the shell feels more task-focused without losing important context.

**In scope**
- compact header hierarchy
- app version display in the header
- lighter presentation of locale and theme controls
- consolidation of Generate and Regenerate behavior
- higher-visibility New Game primary action placement
- documentation and QA alignment for the revised shell contract

**Stories**
1. **Define the revised header hierarchy including a compact version display**
2. **Reduce header footprint while keeping theme and locale controls discoverable**
3. **Consolidate Generate and Regenerate into one clearer action model**
4. **Move the primary setup action higher in the New Game flow**
5. **Update documentation and QA expectations for the revised shell and setup-action hierarchy**
