# Epics and Stories

STATUS: Approved

## Purpose

This document translates the roadmap milestones into implementation epics and stories.

It is intended to:
- define delivery slices before coding starts,
- keep implementation aligned with the approved specifications,
- and provide a stable structure for tracking progress in `documentation/task-list.md`.

**Quality gate:** no story in this document is considered done until its matching implementation, test, and QC tasks are completed in `documentation/task-list.md`.

See also: `documentation/testing-qc-strategy.md`

---

## Epic 1 — Data Foundation and Normalization

**Objective**
Build the canonical game-data layer from the approved BoardGameGeek references, normalize it into runtime-safe entities, and validate all resolved references.

**In scope**
- project-owned canonical client data
- normalized IDs
- resolved Mastermind leads
- normalized Scheme rules
- flattened runtime indexes
- validation of source references

**Stories**
1. **Ship canonical game data with the client application**
2. **Normalize source entities into set-scoped runtime IDs**
3. **Resolve cross-references for Masterminds and Schemes**
4. **Build flattened runtime indexes for all entity types**
5. **Validate normalized data and surface initialization errors**

---

## Epic 2 — State Management and Persistence

**Objective**
Implement the versioned root browser state and all storage operations required by the app.

**In scope**
- `legendary_state_v1`
- shared state/storage modules under `src/app/`
- collection persistence
- usage stats persistence
- history persistence
- preferences persistence
- reset behavior

**Stories**
1. **Create a storage manager for versioned root state**
2. **Persist and hydrate owned collection state**
3. **Persist and update usage statistics (`plays`, `lastPlayedAt`)**
4. **Persist and retrieve accepted game history**
5. **Support per-category and full reset operations**
6. **Handle corrupted or missing browser state gracefully**

---

## Epic 3 — Setup Generation Engine

**Objective**
Generate legal game setups from the owned collection using legality-first validation and least-played fallback.

**In scope**
- player-count rules
- Advanced Solo rules
- legality validation
- forced group accounting
- never-played preference
- least-played fallback
- acceptance vs regeneration behavior

**Stories**
1. **Implement player-count setup templates**
2. **Validate owned collection legality before generation**
3. **Select a legal Scheme and apply its rule effects**
4. **Select a legal Mastermind and account for mandatory leads**
5. **Fill Villain Group and Henchman Group slots correctly**
6. **Select Heroes using freshness and least-played priority**
7. **Keep Generate/Regenerate ephemeral until Accept & Log**
8. **Produce history-ready setup snapshots using IDs only**

---

## Epic 4 — Application Shell and Navigation

**Objective**
Expand the existing single-page shell into the full tabbed application shell, layout system, and shared UI infrastructure.

**In scope**
- HTML shell
- tabbed navigation
- responsive layout
- design tokens
- shared buttons/cards/badges
- empty states and panel layout

**Stories**
1. **Expand the base HTML application shell**
2. **Implement responsive tab navigation for desktop and mobile**
3. **Apply the approved dark Marvel visual design system**
4. **Create reusable UI primitives for cards, buttons, badges, and panels**
5. **Support active-tab persistence and keyboard navigation**

---

## Epic 5 — Browse Extensions Experience

**Objective**
Let users browse included sets, inspect their contents, and add/remove them from the owned collection.

**In scope**
- set cards
- set details expansion
- search/filter
- add/remove collection actions
- counts and badges

**Stories**
1. **Render the set grid from normalized data**
2. **Display set metadata and counts consistently**
3. **Expand a set card to show its detailed contents**
4. **Filter sets by type and search term**
5. **Toggle set ownership from the Browse tab**

---

## Epic 6 — Collection Management Experience

**Objective**
Provide an owned-collection view with grouped selection controls and setup-capacity visibility.

**In scope**
- grouped collection checklist
- totals by category
- capacity indicators
- collection reset

**Stories**
1. **Render the collection view grouped by set type**
2. **Mirror ownership toggles between Browse and Collection tabs**
3. **Compute category totals from the selected collection**
4. **Display player-count feasibility indicators**
5. **Support clearing the owned collection with confirmation**

---

## Epic 7 — New Game Setup Experience

**Objective**
Provide the full game setup workflow from player-count selection to accepting a generated setup.

**In scope**
- player-count controls
- Advanced Solo toggle
- setup summary
- result rendering
- Regenerate
- Accept & Log

**Stories**
1. **Render player-count and Advanced Solo controls**
2. **Display setup requirements for the current selection**
3. **Generate and render a full setup result**
4. **Show Scheme notes and forced-group badges clearly**
5. **Allow Regenerate without consuming state**
6. **Accept and log the setup into persistent state**

---

## Epic 8 — History, Usage, and Reset Experience

**Objective**
Show usage freshness, history records, and reset capabilities in a clear and safe way.

**In scope**
- never-played indicators
- history rendering
- collapsible records
- per-category resets
- full reset confirmation

**Stories**
1. **Render per-category freshness and usage indicators**
2. **Render accepted game history in newest-first order**
3. **Expand and collapse history records**
4. **Reset a single category of usage stats**
5. **Reset the full application state with confirmation**

---

## Epic 9 — Notifications, Error Handling, and Accessibility

**Objective**
Ensure the app behaves clearly and safely in edge cases and remains accessible.

**In scope**
- toast notifications
- error handling
- graceful degradation
- focus states
- keyboard interaction
- compatibility messaging

**Stories**
1. **Show success, info, warning, and error toast notifications**
2. **Report collection insufficiency and invalid setup requests clearly**
3. **Handle unavailable browser storage gracefully**
4. **Implement keyboard-accessible interactions and focus behavior**
5. **Verify color-independent state communication and semantic roles**

---

## Epic 10 — Final Documentation and Release Readiness

**Objective**
Finish all user-facing and developer-facing project documentation and align it with the implemented behavior.

**In scope**
- root README
- documentation consistency
- implementation notes
- final review alignment

**Stories**
1. **Update documentation to reflect implemented runtime behavior**
2. **Document how to open and use the static-served app**
3. **Document reset behavior, persistence, and limitations**
4. **Perform a final consistency pass across all markdown specs**

---

## Mapping to roadmap milestones

| Roadmap Milestone | Epic Mapping |
|---|---|
| Milestone 1 — Data Compilation | Epic 1 |
| Milestone 2 — Core Engine | Epics 2–3 |
| Milestone 3 — UI Shell | Epic 4 |
| Milestone 4 — Browse Extensions | Epic 5 |
| Milestone 5 — My Collection | Epic 6 |
| Milestone 6 — New Game | Epic 7 |
| Milestone 7 — History & Reset | Epic 8 |
| Milestone 8 — Polish & Error Handling | Epic 9 |
| Milestone 9 — Documentation and Release Readiness | Epic 10 |

---

## Proposed Post-V1 Epics

These epics are derived from `documentation/_next-steps.md` and are intentionally separate from the approved V1 roadmap above.

They provide a candidate backlog for the next implementation phase and should be prioritized before being added to `documentation/task-list.md`.

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

---

## Epic 26 — Remaining Set Classification Data Corrections

**Status: Approved**

**Objective**
Correct the remaining misclassifications in the set catalog so every set carries the right type, giving users accurate groupings when browsing or building a collection.

**In scope**
- reclassification of Core and Villains as base games
- audit and correction of small-expansion assignments across the catalog
- audit and correction of large-expansion assignments across the catalog
- correction of Revelations as a small expansion with no standalone mode

**Stories**
1. **Audit all base-game, small-expansion, and large-expansion assignments against the published Legendary ruleset**
2. **Reclassify Core and Villains as base games throughout the catalog data**
3. **Correct remaining small- and large-expansion misassignments identified by the audit**
4. **Fix the Revelations entry to reflect it is a small expansion with no standalone mode**
5. **Verify corrected classifications display accurately across Browse and Collection surfaces**

**Acceptance Criteria**
- Story 1: A written record lists every set whose current classification differs from the target before code changes are made; all affected sets are identified.
- Story 2: Core and Villains appear under the base-game group in all catalog, browse, and collection surfaces; no other type label is applied to them.
- Story 3: Every misassigned expansion flagged in Story 1 carries the correct small- or large-expansion type; no uncorrected entry remains.
- Story 4: Revelations appears as a small expansion with no standalone row in all surfaces; any existing standalone entry for Revelations is removed.
- Story 5: All corrected sets render in the expected category in Browse and Collection; alphabetical ordering and filtering show no regressions.

---

## Epic 27 — Remaining Shell and Debug Polish

**Status: Approved**

**Objective**
Remove a residual developer debug control that is visible in production and correct the app title presentation so the header feels intentional and complete across all supported themes and locales.

**In scope**
- removal of the "Show history-ready setup snapshot" debug control from all user-facing surfaces
- app title size increase and vertical alignment with the language and theme controls in the header

**Stories**
1. **Remove the "Show history-ready setup snapshot" debug panel from all production-rendered surfaces**
2. **Increase the app title size and align it vertically with the header's language and theme controls**
3. **Verify the revised header remains stable across all themes, locales, and viewport sizes**

**Acceptance Criteria**
- Story 1: No "Show history-ready setup snapshot" control, button, or panel is reachable in any production-rendered surface without a deliberate developer override; the element is absent from the DOM in production builds.
- Story 2: The app title is visually larger and sits at the same vertical level as the language selector and theme toggle in the header; alignment holds on both desktop and mobile viewports.
- Story 3: The revised header passes visual checks in all supported themes and locales; no overflow, truncation, or layout regression is introduced.

---

## Epic 28 — SonarCloud Code Quality Remediation

**Status: Approved**

**Objective:** Address all 61 SonarCloud open findings to restore clean code quality gates. No functional behaviour changes are intended except where a finding identifies an actual bug.

**In scope:**
- Story 28.1 — Mechanical Code Modernization: Replace `JSON.parse(JSON.stringify())` with `structuredClone()`, `String#replace` with `String#replaceAll()`, array notation `[arr.length - 1]` with `.at(-1)`, `window` globals with `globalThis`, `.find()` used as existence check with `.some()`, and logical AND chains with optional chaining (`?.`).
- Story 28.2 — Readability and Intentionality Fixes: Extract nested ternary operations into named variables or if-statements; invert negated conditions to put the positive branch first; replace nested template literals with intermediate variables; provide a meaningful message for empty `Error()` throws; convert a promise chain boot call to top-level await.
- Story 28.3 — Structural Refactors and Bug Fixes: Reduce cognitive complexity of three functions (setup-generator.mjs `generateSetup`, history-utils.mjs grouping function, state-store.mjs `sanitizePreferences`) from above 15 to within the allowed limit by extracting helper functions; fix genuine bug in game-data-pipeline.mjs where a conditional ternary always evaluates to the same value; fix Blocker in state-store.mjs where `updateGameResult` always returns a cloned state even when no record was found (should return original state unchanged on the not-found path).

**Out of scope:** No new features, no UI redesign, no test-file modifications beyond fixing lint-equivalent patterns inside existing test assertions.
