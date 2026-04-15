# Epics and Stories

STATUS: Approved

## Purpose

This document translates the roadmap milestones into implementation epics and stories.

It is intended to:
- define delivery slices before coding starts,
- keep implementation aligned with the approved specifications,
- and provide a stable structure for tracking progress in `documentation/planning/task-list.md`.

**Quality gate:** no story in this document is considered done until its matching implementation, test, and QC tasks are completed in `documentation/planning/task-list.md`.

See also: `documentation/testing/strategy.md`

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

These epics are derived from `documentation/archive/next-steps.md` and are intentionally separate from the approved V1 roadmap above.

They provide a candidate backlog for the next implementation phase and should be prioritized before being added to `documentation/planning/task-list.md`.

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
- fix the scheme-selection fallback notification that fires unconditionally instead of only when the selected scheme is an actual fallback pick
- alphabetical sorting of history groups by label, replacing the previous newest-group-first ordering

**Stories**
1. **Remove the "Show history-ready setup snapshot" debug panel from all production-rendered surfaces**
2. **Increase the app title size and align it vertically with the header's language and theme controls**
3. **Verify the revised header remains stable across all themes, locales, and viewport sizes**
4. **Fix the scheme-selection fallback notification that fires unconditionally**
5. **Sort history groups alphabetically by label across all grouping modes**

**Acceptance Criteria**
- Story 1: No "Show history-ready setup snapshot" control, button, or panel is reachable in any production-rendered surface without a deliberate developer override; the element is absent from the DOM in production builds.
- Story 2: The app title is visually larger and sits at the same vertical level as the language selector and theme toggle in the header; alignment holds on both desktop and mobile viewports.
- Story 3: The revised header passes visual checks in all supported themes and locales; no overflow, truncation, or layout regression is introduced.
- Story 4: The "Least-played fallback used for Scheme selection" notification appears only when the generated setup's selected scheme is actually a fallback pick (i.e., it has non-zero play count and was not the freshest eligible scheme); the notification is absent when the freshest scheme is selected even if other schemes in the pool have been played.
- Story 5: Groups within every history grouping mode are sorted alphabetically by their display label; the previous newest-group-first ordering is replaced.

---

## Epic 28 — SonarCloud Code Quality Remediation

**Status: Approved**

**Objective:** Address all 61 SonarCloud open findings to restore clean code quality gates. No functional behaviour changes are intended except where a finding identifies an actual bug.

**In scope:**
- Story 28.1 — Mechanical Code Modernization: Replace `JSON.parse(JSON.stringify())` with `structuredClone()`, `String#replace` with `String#replaceAll()`, array notation `[arr.length - 1]` with `.at(-1)`, `window` globals with `globalThis`, `.find()` used as existence check with `.some()`, and logical AND chains with optional chaining (`?.`).
- Story 28.2 — Readability and Intentionality Fixes: Extract nested ternary operations into named variables or if-statements; invert negated conditions to put the positive branch first; replace nested template literals with intermediate variables; provide a meaningful message for empty `Error()` throws; convert a promise chain boot call to top-level await.
- Story 28.3 — Structural Refactors and Bug Fixes: Reduce cognitive complexity of three functions (setup-generator.mjs `generateSetup`, history-utils.mjs grouping function, state-store.mjs `sanitizePreferences`) from above 15 to within the allowed limit by extracting helper functions; fix genuine bug in game-data-pipeline.mjs where a conditional ternary always evaluates to the same value; fix Blocker in state-store.mjs where `updateGameResult` always returns a cloned state even when no record was found (should return original state unchanged on the not-found path).

**Out of scope:** No new features, no UI redesign, no test-file modifications beyond fixing lint-equivalent patterns inside existing test assertions.

---

## Epic 29 — Svelte 5 Build Tooling and Project Foundation

**Status: Approved**

**Objective**
Replace the esbuild-based build pipeline with Vite and `@sveltejs/vite-plugin-svelte` so the project can compile Svelte 5 components while retaining zero runtime dependencies and a working dev server.

**In scope**
- replace `tools/build.mjs` and `tools/dev-server.mjs` with Vite equivalents
- install `vite`, `svelte`, and `@sveltejs/vite-plugin-svelte` as dev dependencies only
- configure Svelte 5 runes mode in `svelte.config.js`
- establish the `/src` component directory structure for `.svelte` files
- preserve the static SPA output (`index.html` + bundled JS/CSS)
- verify the app boots to a working shell after the tooling switch

**Stories**
1. **Replace esbuild with Vite and configure `@sveltejs/vite-plugin-svelte`**
2. **Add Svelte 5 as a dev dependency and enable runes mode globally**
3. **Establish the component directory structure for `.svelte` files under `src/`**
4. **Migrate the custom dev server to Vite's built-in dev mode**
5. **Confirm the static build output remains a self-contained SPA with zero runtime dependencies**
6. **Verify the existing ESLint and Playwright configurations still resolve after the tooling switch**

**Acceptance Criteria**
- Story 1: `npm run build` succeeds using Vite; the output directory contains an `index.html` and bundled assets equivalent to the previous esbuild output.
- Story 2: `svelte` and `@sveltejs/vite-plugin-svelte` appear only in `devDependencies`; `svelte.config.js` enables runes mode; no Svelte runtime chunk appears in the production bundle.
- Story 3: A documented directory convention exists for `.svelte` files under `src/`; at least one placeholder component file confirms the compiler resolves it.
- Story 4: `npm run dev` launches the Vite dev server; the app is reachable in a browser without the old custom dev server.
- Story 5: Inspecting the production bundle shows no Svelte runtime library — only compiled vanilla JS; bundle size does not exceed a documented baseline.
- Story 6: `npm run lint` and `npx playwright test` both exit without configuration errors related to the tooling change.

---

## Epic 30 — Data and State Layer Migration to Svelte 5

**Status: Approved**

**Objective**
Migrate the app's data pipeline and state management modules to work correctly within the Svelte 5 reactive system without breaking any existing behavioral contract.

**In scope**
- convert `state-store.mjs` to use Svelte 5 `$state` and `$derived` runes
- make `game-data-pipeline.mjs` importable from `.svelte` components without side effects
- verify collection, history, preferences, and usage-stats persistence remain intact after migration
- ensure the app remains fully functional at this epic boundary

**Stories**
1. **Audit all stateful modules and define their Svelte 5 reactive equivalents**
2. **Migrate `state-store.mjs` to export Svelte 5 `$state`-backed reactive stores**
3. **Verify game-data-pipeline modules are free of side effects that conflict with Svelte's module runtime**
4. **Confirm all storage persistence paths survive the migration intact**
5. **Validate that all existing Node unit tests still pass against the migrated state layer**

**Acceptance Criteria**
- Story 1: A written audit maps each stateful module to its intended Svelte 5 reactive pattern before any code changes are made.
- Story 2: `state-store.mjs` (or its replacement) exports reactive state objects backed by `$state` runes; consumers no longer call explicit setter functions for simple property updates where a reactive binding suffices.
- Story 3: `game-data-pipeline.mjs` and its dependents import cleanly inside `.svelte` files without triggering unintended side effects or initialization errors.
- Story 4: A round-trip integration check (set collection, accept game, persist, reload) passes in the browser after the migration; no localStorage key is lost or renamed.
- Story 5: All unit tests under `test/epic2-state.test.mjs` and related state test files pass without modification to the test assertions.

---

## Epic 31 — UI Shell and Navigation Migration to Svelte Components

**Status: Approved**

**Objective**
Convert the application shell, tab navigation, and shared UI primitives from DOM-manipulation modules into Svelte 5 components so the component hierarchy mirrors the rendered page structure.

**In scope**
- convert `app-renderer.mjs` shell and mount logic to a root Svelte component
- convert tab navigation to a Svelte component backed by reactive active-tab state
- convert shared UI primitives (buttons, cards, badges, toasts) to Svelte components
- preserve all existing visual design tokens and CSS without modification
- ensure the app is visually and behaviorally identical to the pre-migration shell at this epic boundary

**Stories**
1. **Create a root `App.svelte` component and mount it via the Vite entry point**
2. **Convert tab navigation to a `TabNav.svelte` component with reactive active-tab state**
3. **Convert shared UI primitives (buttons, cards, badges) to individual Svelte component files**
4. **Convert the toast notification system to a `ToastStack.svelte` component**
5. **Verify the app shell is visually and behaviorally identical to the pre-migration version**

**Acceptance Criteria**
- Story 1: The app mounts from a single `App.svelte` root component; `app-renderer.mjs` is removed or reduced to the Vite entry bootstrap only; the page renders correctly in the browser.
- Story 2: Tab switching is driven by a reactive `$state` variable inside `TabNav.svelte`; active-tab persistence and keyboard navigation continue to work exactly as before.
- Story 3: Buttons, cards, and badges are individually importable `.svelte` files; each matches the visual output of its DOM-manipulation predecessor without CSS changes.
- Story 4: Toasts appear and dismiss correctly via `ToastStack.svelte`; auto-dismiss timing and ARIA attributes are preserved.
- Story 5: A side-by-side visual comparison confirms no layout, color, or typography regression; existing Playwright shell navigation tests pass unchanged.

---

## Epic 32 — Feature Tab Components Migration

**Status: Approved**

**Objective**
Convert each major feature tab — Browse, Collection, New Game, History, and Stats — from DOM-manipulation rendering functions into Svelte 5 components, completing the full UI layer migration from vanilla JS to Svelte.

**In scope**
- Browse tab: set grid, set detail expansion, search/filter controls, ownership toggle
- Collection tab: grouped checklist, category totals, capacity indicators, collection reset
- New Game tab: player-count controls, setup generation, result display, Accept & Log
- History tab: history list, record expansion, result editing
- Stats tab: per-category usage panels, collapsible sections, reset actions
- all feature behavior must be preserved exactly — no functional changes during migration

**Stories**
1. **Convert Browse tab rendering to a `BrowseTab.svelte` component with reactive filtering**
2. **Convert Collection tab rendering to a `CollectionTab.svelte` component with reactive ownership state**
3. **Convert New Game tab to a `NewGameTab.svelte` component with reactive setup generation flow**
4. **Convert History tab to a `HistoryTab.svelte` component with reactive record expansion**
5. **Convert Stats tab to a `StatsTab.svelte` component with reactive usage displays**
6. **Run the full Playwright end-to-end suite and confirm all feature scenarios pass**

**Acceptance Criteria**
- Story 1: `BrowseTab.svelte` renders the set grid; search filtering and ownership toggles are driven by reactive state; no standalone DOM manipulation functions remain for Browse rendering.
- Story 2: `CollectionTab.svelte` mirrors ownership state with Browse; category totals and capacity indicators update reactively; collection reset with confirmation works as before.
- Story 3: `NewGameTab.svelte` generates, displays, and accepts setups; player-count and Advanced Solo controls update reactively; Regenerate does not consume history state.
- Story 4: `HistoryTab.svelte` renders history in newest-first order; records expand and collapse; result editing actions remain functional.
- Story 5: `StatsTab.svelte` displays per-category usage panels that expand and collapse correctly; all reset actions work as before.
- Story 6: The full Playwright suite exits with zero failures after all feature tab components are in place.

---

## Epic 33 — Test Suite Alignment for Svelte 5

**Status: Approved**

**Objective**
Update the Node unit test suite and Playwright end-to-end specs to correctly exercise the Svelte 5 component hierarchy so coverage remains meaningful and no test is silently bypassed by the migration.

**In scope**
- audit which unit tests target DOM-manipulation modules replaced by Svelte components
- replace or update unit tests that imported removed vanilla JS rendering modules
- confirm Playwright specs exercise the correct component-rendered DOM
- ensure `node --test` and `npx playwright test` both exit cleanly with no skipped or failing tests
- no new features are tested — coverage scope must match the pre-migration baseline

**Stories**
1. **Audit all existing test files to identify tests that target removed DOM-manipulation modules**
2. **Update or replace unit tests that imported vanilla JS rendering modules with component-equivalent tests**
3. **Verify Playwright specs select the correct DOM elements produced by Svelte-rendered components**
4. **Confirm `node --test` exits with zero failures and no uncovered epic boundary**
5. **Document the updated test strategy reflecting the Svelte component test model**

**Acceptance Criteria**
- Story 1: A written audit lists every test file that imports a module removed or renamed during the migration; no test file is silently broken without being identified.
- Story 2: All listed tests are updated to import or mount the replacement Svelte components; total test count does not decrease across any epic boundary.
- Story 3: Playwright selectors target rendered DOM from Svelte components; no selector relies on DOM structure that only the old vanilla JS renderer produced.
- Story 4: `node --test` exits with zero failures and zero skipped tests on the fully migrated codebase.
- Story 5: `documentation/testing/strategy.md` is updated to describe how unit tests interact with Svelte components and how Playwright exercises the compiled output.

---

## Epic 34 — History Grouping Expansion

**Status: Approved**

**Objective**
Replace the current limited grouping options with the five user-requested dimensions — mastermind, scheme, heroes, villains, and player mode — so every game record is explorable from the angles that matter most at the table.

**In scope**
- five supported grouping modes: mastermind, scheme, heroes, villains, and player mode
- derivation of scheme, hero, and villain group keys from `setupSnapshot` fields (`schemeId`, `heroIds`, `villainGroupIds`)
- multi-value grouping behavior for heroes and villains: a single record appears under each hero it contains and under each villain group it contains
- removal of the `player-count` grouping mode
- removal of the `none` (ungrouped) mode; mastermind becomes the default grouping
- localization of all five grouping mode labels in English and French
- grouping is a presentation-only concern — no modification to the persisted history model

**Stories**
1. **Define the five-mode grouping contract including multi-value semantics for heroes and villains**
2. **Add scheme, hero, and villain grouping derivations to `history-utils.mjs` and remove `player-count` and `none` modes**
3. **Update the History grouping UI controls to expose exactly the five new modes**
4. **Localize all five grouping mode labels in English and French**
5. **Verify all five grouping modes render correctly for existing records, including multi-group membership for heroes and villains**

**Acceptance Criteria**
- Story 1: A written contract specifies the group key derivation for each of the five modes, documents that heroes and villains produce one group entry per entity, and declares mastermind as the default mode replacing the removed `none` option.
- Story 2: `history-utils.mjs` derives correct group keys for all five modes from `setupSnapshot`; `player-count` and `none` are removed; the persisted history model is unchanged.
- Story 3: The grouping control in the History tab presents exactly five mode options; selecting any mode updates the displayed groups immediately; `player-count` and ungroup options are unreachable.
- Story 4: All five grouping mode labels render in English and French without falling back to the alternate locale; no untranslated string is visible in either supported locale.
- Story 5: Each mode groups all existing records correctly; a record with three heroes appears under all three hero groups; a record with two villain groups appears under both; no record is silently omitted from a group it belongs to.

---

## Epic 35 — v1.0.1 Release Polish

**Status: Approved**

**Objective**
Correct all translation quality issues across every supported locale, fix a score-input focus regression that prevents fluid digit entry, and advance the application version to 1.0.1.

**In scope**
- correction of all French locale strings for missing apostrophes and accented characters, including the specific mistranslation "Non posee actuellement." → "Non possédée actuellement."
- audit and correction of all other supported locales for equivalent character encoding and translation quality problems
- identification and addition of translations for every user-facing string not yet localised in any supported locale
- fix to the score input field to retain keyboard focus between successive keystrokes during score entry
- version bump to 1.0.1 in `package.json` and in every UI surface that displays the application version

**Stories**
1. **Audit and correct all French locale strings for missing apostrophes, accented characters, and the mistranslation of "Non posee actuellement."**
2. **Audit all other supported locales for equivalent character encoding and translation quality issues**
3. **Identify and supply translations for every user-facing string missing a localised equivalent in any supported locale**
4. **Fix the score input field to retain keyboard focus after each keystroke during score entry**
5. **Bump the application version to 1.0.1 in `package.json` and in every UI surface that displays it**

**Acceptance Criteria**
- Story 1: All French locale strings containing apostrophes or accented characters render correctly in the UI; the phrase "Non possédée actuellement." appears in the French locale resource and displays wherever collection-ownership absence is communicated; no raw ASCII substitutes remain visible in French.
- Story 2: Every supported locale other than French is audited; any apostrophe, encoding, or obvious quality error found is corrected; if no issues are found, a brief comment in the locale file records the audit result.
- Story 3: No user-facing string in any tab or panel falls back to an alternate locale or renders a raw translation key; every string in the English and French locales resolves to a visible, human-readable translation.
- Story 4: Entering a score digit in the score input field does not move keyboard focus away from the field; successive digits can be typed without the user needing to click the field between keystrokes.
- Story 5: The version string "1.0.1" is present in `package.json` and is rendered wherever the application version is displayed in the UI; no reference to "1.0.0" remains visible on any production surface.

## Epic 36 — Version Source and Storage Disclosure

**Status: Approved**

**Objective**
Ensure the displayed application version is always derived from a single authoritative source (`package.json`) so version bumps never require manual code edits, add an accurate browser-storage disclosure so users understand what data the app persists locally and why, and surface a GitHub repository link in the header for transparency, and ensure the Vite development server works correctly when serving locally without breaking the GitHub Pages production deployment.

**In scope**
- injecting the `package.json` version as a Vite build-time constant and consuming it in `App.svelte`
- adding a concise, accurate disclosure stating that the app uses browser `localStorage` (not cookies), what categories of data are stored (collection state, game history, preferences), and that the data is local to the device and browser
- adding a GitHub icon link in the header area (near the version badge) pointing to the project repository, opening in a new tab
- ensuring the Vite `base` path is `/random-legendary-llm/` only for production builds, and `/` for the local dev server, so both environments work without configuration changes
- reducing the vertical footprint of the desktop header preference controls by removing redundant label/caption copy and relying solely on aria-label for accessibility
- moving the GitHub icon link to the far right of the header controls row, visible on all viewports

**Stories**
1. **Inject the `package.json` version into the Vite build and replace the hardcoded constant in `App.svelte`** *(done)*
2. **Add a localStorage disclosure note to the appropriate UI surface explaining what data is stored and its local scope** *(done)*
3. **Add a GitHub repository icon link in the header near the version badge** *(done)*
4. **Fix the Vite base path so the local dev server works without 404 errors while keeping GitHub Pages production builds intact** *(done)*
5. **Remove the verbose label/caption blocks from the desktop locale and theme controls, keeping only the functional controls with proper aria-label**
6. **Relocate the GitHub repository icon to the far-right end of the header controls row so it is prominently visible on all viewports**

**Acceptance Criteria**
- Story 1: `vite.config.js` reads `version` from `package.json` and exposes it via `define` as `__APP_VERSION__`; the hardcoded `APP_VERSION = '1.0.1'` constant is removed from `App.svelte` and replaced with the injected value; incrementing the version in `package.json` alone causes the updated string to appear in the running UI without any further code changes.
- Story 2: A visible disclosure is present in the UI (Backup tab, About section, or equivalent surface) stating clearly that the app uses browser `localStorage` — not cookies — to persist data; the notice names the categories of stored data (collection ownership, game history, user preferences); the notice confirms the data remains on the user's device and browser and is never transmitted; the word "cookie" or "cookies" does not appear in the disclosure.
- Story 3: A GitHub SVG icon link is rendered in the header area near the version badge, pointing to `https://github.com/Alban34/random-legendary-llm`; the link carries an accessible label (e.g. `aria-label="View source on GitHub"`); the link opens in a new tab via `target="_blank"` with `rel="noopener noreferrer"`; the icon is visually consistent with the header's existing style and does not dominate the layout.
- Story 4: Running `npm run dev` serves the app correctly at `http://127.0.0.1:5173/` with no 404 errors in the browser console; running `npm run build` still produces a dist bundle with all asset paths prefixed by `/random-legendary-llm/` so GitHub Pages hosting is unaffected; no environment variables, .env files, or manual toggles are needed to switch between the two modes.
- Story 5: On desktop viewports, the locale and theme preference controls in the header show no visible label text or caption text — only the select dropdown and theme toggle buttons are visible; all accessibility labels are preserved via aria-label and title attributes; the controls retain their full functionality.
- Story 6: The GitHub icon link appears as the rightmost element inside the header controls row (after the tab navigation); it is visible on both desktop and mobile viewports; it is keyboard-focusable (no tabindex="-1"); the version badge (app-version span) remains in header-copy without an adjacent inline github-link anchor.
