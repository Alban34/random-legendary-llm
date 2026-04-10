# Implementation Task List

STATUS: Approved

Historical note:
- This file records the original implementation backlog and completion history.
- For the current shipped UX contract and active alignment work, use `documentation/ux-alignment/task-list.md` and `documentation/ui-design.md`.

## Purpose

This file is the working checklist for implementation.

Each story from `documentation/epics.md` is broken down into concrete tasks that can be checked off during development.

**Completion rule:** a story is only considered **Done** when its:
- implementation tasks,
- **Test** task,
- and **QC** task

are all checked.

See also: `documentation/testing-qc-strategy.md`

---

## Epic 1 — Data Foundation and Normalization

### Story 1.1 — Ship canonical game data with the client application
- [x] Create the canonical client data asset used by the app
- [x] Import or transcribe approved set inventory into the client-shipped data asset
- [x] Preserve source display names exactly as approved
- [x] **Test:** verify all included sets from `documentation/game-data-normalized.md` are present in the client-shipped data and aligned with `documentation/sources.md`
- [x] **QC (Automated):** automate QC coverage to spot-check at least 5 sets against the approved data docs

### Story 1.2 — Normalize source entities into set-scoped runtime IDs
- [x] Implement a slug/ID helper for set-scoped entity IDs
- [x] Generate stable IDs for sets
- [x] Generate stable IDs for heroes, masterminds, villain groups, henchman groups, and schemes
- [x] Ensure duplicate display names remain distinct via set-scoped IDs
- [x] **Test:** verify IDs are unique and duplicate display names remain distinct
- [x] **QC (Automated):** automate QC coverage for duplicate-name examples like `Black Widow`, `Loki`, and `Thor`

### Story 1.3 — Resolve cross-references for Masterminds and Schemes
- [x] Resolve `alwaysLead` + category into runtime lead references
- [x] Resolve forced Scheme groups into runtime IDs
- [x] Convert known scheme setup behavior into structured rule modifiers
- [x] Preserve human-readable rule notes for display
- [x] **Test:** verify all resolved references exist and match the approved docs plus the BoardGameGeek references listed in `documentation/sources.md`
- [x] **QC (Automated):** automate QC coverage for edge cases like `Dr. Doom` and `Secret Invasion of the Skrull Shapeshifters`

### Story 1.4 — Build flattened runtime indexes for all entity types
- [x] Build `setsById`
- [x] Build `heroesById`
- [x] Build `mastermindsById`
- [x] Build `villainGroupsById`
- [x] Build `henchmanGroupsById`
- [x] Build `schemesById`
- [x] Build flat arrays for each entity category
- [x] **Test:** verify index counts match canonical counts and each indexed ID resolves correctly
- [x] **QC (Automated):** automate QC coverage for runtime index samples in browser diagnostics or debug output

### Story 1.5 — Validate normalized data and surface initialization errors
- [x] Validate unique set IDs
- [x] Validate unique entity IDs
- [x] Validate Mastermind lead references
- [x] Validate Scheme forced-group references
- [x] Surface initialization failures clearly in the UI
- [x] **Test:** trigger representative invalid-reference cases in a test harness and verify failure reporting
- [x] **QC (Automated):** automate QC coverage to confirm errors are understandable and non-technical enough for review

---

## Epic 2 — State Management and Persistence

### Story 2.1 — Create a storage manager for versioned root state
- [x] Define `legendary_state_v1` shape in code
- [x] Implement default-state factory
- [x] Implement safe load with fallback to defaults
- [x] Implement save/update helpers for the root state object
- [x] **Test:** verify save/load roundtrip preserves the root state shape
- [x] **QC (Automated):** automate QC coverage for stored browser data after state writes

### Story 2.2 — Persist and hydrate owned collection state
- [x] Store owned set IDs
- [x] Hydrate collection state on load
- [x] Validate stored set IDs against runtime indexes
- [x] Remove invalid stored references safely
- [x] **Test:** verify owned-set changes persist across reloads and invalid set IDs are handled safely
- [x] **QC (Automated):** automate QC coverage to toggle several owned sets, reload, and confirm consistency

### Story 2.3 — Persist and update usage statistics (`plays`, `lastPlayedAt`)
- [x] Define per-category usage-stat containers
- [x] Implement usage-stat increment helper
- [x] Update `plays` on Accept & Log
- [x] Update `lastPlayedAt` on Accept & Log
- [x] **Test:** verify usage stats update only on accepted setups and store both `plays` and `lastPlayedAt`
- [x] **QC (Automated):** automate QC coverage to accept multiple setups and inspect freshness ordering behavior

### Story 2.4 — Persist and retrieve accepted game history
- [x] Define `GameRecord` creation helper
- [x] Append accepted setups to history
- [x] Load history on startup
- [x] Sort or render history newest-first
- [x] **Test:** verify accepted setups create stable ID-based history records in newest-first order
- [x] **QC (Automated):** automate QC coverage to compare rendered history against accepted setup output

### Story 2.5 — Support per-category and full reset operations
- [x] Reset hero usage stats
- [x] Reset mastermind usage stats
- [x] Reset villain-group usage stats
- [x] Reset henchman usage stats
- [x] Reset scheme usage stats
- [x] Reset the entire root state safely
- [x] **Test:** verify per-category reset only affects the intended category and full reset clears all slices
- [x] **QC (Automated):** automate QC coverage for each reset action and visible state update

### Story 2.6 — Handle corrupted or missing browser state gracefully
- [x] Detect invalid JSON/state shape
- [x] Recover with default state
- [x] Notify the user when recovery occurs
- [x] **Test:** simulate corrupted saved state and verify safe recovery
- [x] **QC (Automated):** automate QC coverage to confirm the recovery message is visible and understandable

---

## Epic 3 — Setup Generation Engine

### Story 3.1 — Implement player-count setup templates
- [x] Add `SETUP_RULES` constant for 1–5 players
- [x] Add Advanced Solo template
- [x] Expose helper for resolving the active template
- [x] **Test:** verify required counts for all supported player modes including Advanced Solo
- [x] **QC (Automated):** automate QC coverage to review displayed setup requirements against the approved rules table

### Story 3.2 — Validate owned collection legality before generation
- [x] Validate hero sufficiency
- [x] Validate villain-group sufficiency
- [x] Validate henchman-group sufficiency
- [x] Validate scheme availability for the chosen player count
- [x] Validate Advanced Solo only for 1 player
- [x] **Test:** verify illegal collections fail with correct reasons and legal collections proceed
- [x] **QC (Automated):** automate QC coverage for thin collections such as `Dimensions`-heavy or low-henchman selections

### Story 3.3 — Select a legal Scheme and apply its rule effects
- [x] Filter schemes by legality constraints
- [x] Select a scheme using freshness priority
- [x] Apply scheme forced groups
- [x] Apply scheme rule modifiers to required slot counts
- [x] Capture scheme notes for result rendering
- [x] **Test:** verify scheme constraints, forced groups, and modifiers alter setup correctly
- [x] **QC (Automated):** automate QC coverage for at least 3 scheme edge cases with special setup rules

### Story 3.4 — Select a legal Mastermind and account for mandatory leads
- [x] Select a mastermind using freshness priority
- [x] Apply resolved mastermind lead to the setup
- [x] Account for villain vs henchman lead categories correctly
- [x] **Test:** verify villain-led and henchman-led masterminds consume the correct slot type
- [x] **QC (Automated):** automate QC coverage for `Red Skull`, `Dr. Doom`, and one additional edge case

### Story 3.5 — Fill Villain Group and Henchman Group slots correctly
- [x] Prevent duplicate forced/random group collisions
- [x] Fill remaining villain-group slots legally
- [x] Fill remaining henchman-group slots legally
- [x] Preserve deterministic forced groups in the final result
- [x] **Test:** verify slot-filling logic with and without forced groups and with reduced pool sizes
- [x] **QC (Automated):** automate QC coverage for a 5-player setup where multiple categories are tight

### Story 3.6 — Select Heroes using freshness and least-played priority
- [x] Build eligible hero pool from owned sets
- [x] Prefer never-played heroes first
- [x] Fall back to least-played heroes when needed
- [x] Break ties by oldest `lastPlayedAt`, then random
- [x] **Test:** verify freshness ordering and least-played fallback with deterministic sample usage stats
- [x] **QC (Automated):** automate QC coverage for fallback messaging and result freshness behavior

### Story 3.7 — Keep Generate/Regenerate ephemeral until Accept & Log
- [x] Ensure Generate does not mutate persisted state
- [x] Ensure Regenerate does not mutate persisted state
- [x] Keep current generated setup in ephemeral UI state only
- [x] **Test:** verify repeated Generate/Regenerate leaves usage stats and history unchanged until accept
- [x] **QC (Automated):** automate QC coverage for storage before and after Regenerate cycles

### Story 3.8 — Produce history-ready setup snapshots using IDs only
- [x] Build setup snapshot with entity IDs only
- [x] Include player count and Advanced Solo flag
- [x] Include accepted timestamp
- [x] **Test:** verify history records store IDs only and still render correct labels through lookup indexes
- [x] **QC (Automated):** automate QC coverage for one stored record containing duplicate-name entities

---

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
- [x] **QC (Automated):** automate QC coverage to compare the UI against `documentation/ui-design.md`

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

## Epic 5 — Browse Extensions Experience

### Story 5.1 — Render the set grid from normalized data
- [x] Render included sets from canonical/norm data
- [x] Show year and type badges
- [x] Show category counts per set
- [x] **Test:** verify every included set renders exactly once with expected metadata
- [x] **QC (Automated):** automate QC coverage to compare the rendered set list with `documentation/game-data-normalized.md`

### Story 5.2 — Display set metadata and counts consistently
- [x] Show heroes/masterminds/schemes counts
- [x] Show villain and henchman counts where applicable
- [x] Display ownership state visually
- [x] **Test:** verify displayed counts match normalized data for representative sets
- [x] **QC (Automated):** automate QC coverage for low-count edge cases like `Dimensions` and `S.H.I.E.L.D.`

### Story 5.3 — Expand a set card to show its detailed contents
- [x] Add card expand/collapse behavior
- [x] Render heroes list
- [x] Render masterminds list
- [x] Render villain and henchman lists
- [x] Render schemes list
- [x] **Test:** verify expand/collapse state and content rendering for representative sets
- [x] **QC (Automated):** automate QC coverage for details in at least one normal set and one edge-case set

### Story 5.4 — Filter sets by type and search term
- [x] Add search input
- [x] Add type filter controls
- [x] Filter rendered sets reactively
- [x] **Test:** verify search and type filters work independently and together
- [x] **QC (Automated):** automate QC coverage for partial names, no-match searches, and type combinations

### Story 5.5 — Toggle set ownership from the Browse tab
- [x] Add ownership toggle button
- [x] Sync toggle with persisted collection state
- [x] Re-render related UI on ownership change
- [x] **Test:** verify Browse ownership toggles update collection state and survive reload
- [x] **QC (Automated):** automate QC coverage to toggle several sets and confirm the UI feedback is clear

---

## Epic 6 — Collection Management Experience

### Story 6.1 — Render the collection view grouped by set type
- [x] Group sets into Base / Large / Small / Standalone
- [x] Render checklist rows for each set
- [x] **Test:** verify groupings and checklist rendering against normalized type metadata
- [x] **QC (Automated):** automate QC coverage for grouping order and readability

### Story 6.2 — Mirror ownership toggles between Browse and Collection tabs
- [x] Share the same ownership state source across Browse and Collection
- [x] Re-render Browse on Collection changes
- [x] Re-render Collection on Browse changes
- [x] **Test:** verify ownership changes propagate across both tabs immediately
- [x] **QC (Automated):** automate QC coverage for toggling from both tabs and confirming synchronization

### Story 6.3 — Compute category totals from the selected collection
- [x] Count owned heroes
- [x] Count owned masterminds
- [x] Count owned villain groups
- [x] Count owned henchman groups
- [x] Count owned schemes
- [x] **Test:** verify totals update correctly as collection ownership changes
- [x] **QC (Automated):** automate QC coverage to cross-check totals with a small custom collection

### Story 6.4 — Display player-count feasibility indicators
- [x] Compute feasibility for Standard Solo
- [x] Compute feasibility for Advanced Solo
- [x] Compute feasibility for 2–5 players
- [x] Show warning states clearly
- [x] **Test:** verify feasibility indicators reflect legality rules for multiple collection combinations
- [x] **QC (Automated):** automate QC coverage for at least one legal and one illegal collection scenario

### Story 6.5 — Support clearing the owned collection with confirmation
- [x] Add collection reset action
- [x] Add confirmation flow
- [x] Persist cleared collection state
- [x] **Test:** verify collection reset clears only ownership state and requires confirmation
- [x] **QC (Automated):** automate QC coverage for post-reset UI consistency in Browse and Collection tabs

---

## Epic 7 — New Game Setup Experience

### Story 7.1 — Render player-count and Advanced Solo controls
- [x] Add player-count selector buttons
- [x] Add Advanced Solo toggle
- [x] Disable Advanced Solo outside 1-player mode
- [x] **Test:** verify controls update state correctly and Advanced Solo is blocked outside 1-player mode
- [x] **QC (Automated):** automate QC coverage for button states and toggle affordance

### Story 7.2 — Display setup requirements for the current selection
- [x] Show required heroes count
- [x] Show required villain-group count
- [x] Show required henchman-group count
- [x] Show wound count
- [x] **Test:** verify displayed requirements match the active template for all player modes
- [x] **QC (Automated):** automate QC coverage to compare displayed numbers with `documentation/setup-rules.md`

### Story 7.3 — Generate and render a full setup result
- [x] Render mastermind card
- [x] Render scheme card
- [x] Render hero cards/grid
- [x] Render villain-group list
- [x] Render henchman-group list
- [x] **Test:** verify a generated setup renders every selected category correctly
- [x] **QC (Automated):** automate QC coverage for the layout and readability of a full result panel

### Story 7.4 — Show Scheme notes and forced-group badges clearly
- [x] Mark forced groups visually
- [x] Render scheme rule notes
- [x] Render mastermind lead information clearly
- [x] **Test:** verify forced-group indicators and notes appear on appropriate setups
- [x] **QC (Automated):** automate QC coverage for at least 3 setups with special rules or forced groups

### Story 7.5 — Allow Regenerate without consuming state
- [x] Add Regenerate action
- [x] Replace only ephemeral current result
- [x] Leave usage stats unchanged
- [x] **Test:** verify Regenerate changes the result without mutating history or usage stats
- [x] **QC (Automated):** automate QC coverage for UI and storage before and after the regenerate flow

### Story 7.6 — Accept and log the setup into persistent state
- [x] Add Accept & Log action
- [x] Update usage stats on accept
- [x] Append history record on accept
- [x] Refresh History tab data after accept
- [x] **Test:** verify Accept & Log mutates state exactly once and records the correct snapshot
- [x] **QC (Automated):** automate QC coverage to accept a setup and confirm History and Usage views update immediately

---

## Epic 8 — History, Usage, and Reset Experience

### Story 8.1 — Render per-category freshness and usage indicators
- [x] Show never-played counts per category
- [x] Show clear labels for reset actions
- [x] Explain least-played fallback in the UI
- [x] **Test:** verify indicators reflect actual usage stats from persisted state
- [x] **QC (Automated):** automate QC coverage for indicator changes after several accepted games

### Story 8.2 — Render accepted game history in newest-first order
- [x] Render summary rows for history records
- [x] Resolve IDs back to display names
- [x] Show player count and mode metadata
- [x] **Test:** verify history ordering, label resolution, and summary metadata
- [x] **QC (Automated):** automate QC coverage for history readability with multiple accepted games

### Story 8.3 — Expand and collapse history records
- [x] Add expandable history item behavior
- [x] Show full setup details inside expanded items
- [x] **Test:** verify expand/collapse works correctly for multiple history entries
- [x] **QC (Automated):** automate QC coverage for one collapsed and one expanded entry on mobile and desktop widths

### Story 8.4 — Reset a single category of usage stats
- [x] Add reset button for heroes
- [x] Add reset button for masterminds
- [x] Add reset button for villain groups
- [x] Add reset button for henchman groups
- [x] Add reset button for schemes
- [x] **Test:** verify each category reset affects only its own usage stats and indicators
- [x] **QC (Automated):** automate QC coverage for at least two category resets after accepted games exist

### Story 8.5 — Reset the full application state with confirmation
- [x] Add full reset action
- [x] Show confirmation modal
- [x] Clear collection, usage, history, and preferences on confirm
- [x] **Test:** verify full reset clears all persisted state only after confirmation
- [x] **QC (Automated):** automate QC coverage to confirm the app returns to a clean initial state after reset

---

## Epic 9 — Notifications, Error Handling, and Accessibility

### Story 9.1 — Show success, info, warning, and error toast notifications
- [x] Implement toast container
- [x] Implement toast rendering and dismissal
- [x] Add success/info/warning/error variants
- [x] **Test:** verify each toast type renders and dismisses correctly
- [x] **QC (Automated):** automate QC coverage for stacking, timing, and readability

### Story 9.2 — Report collection insufficiency and invalid setup requests clearly
- [x] Show error when collection is illegal for selected setup
- [x] Show info when least-played fallback is used
- [x] Show validation errors without breaking the UI
- [x] **Test:** verify invalid requests produce clear messages and do not crash the page
- [x] **QC (Automated):** automate QC coverage for several invalid scenarios and message clarity

### Story 9.3 — Handle unavailable browser storage gracefully
- [x] Detect storage availability
- [x] Show compatibility warning if storage is unavailable
- [x] Keep the page functional in degraded mode where possible
- [x] **Test:** simulate unavailable storage and verify graceful degradation behavior
- [x] **QC (Automated):** automate QC coverage for degraded-mode messaging and usable fallbacks

### Story 9.4 — Implement keyboard-accessible interactions and focus behavior
- [x] Ensure all controls are tabbable
- [x] Add visible `:focus-visible` styling
- [x] Ensure modal keyboard controls work
- [x] **Test:** verify keyboard interaction works for tabs, buttons, and modal flows
- [x] **QC (Automated):** automate QC coverage for primary flows using keyboard only

### Story 9.5 — Verify color-independent state communication and semantic roles
- [x] Add supporting text/icon cues alongside color states
- [x] Apply ARIA roles to tabs and modal
- [x] Verify semantic structure of interactive regions
- [x] **Test:** verify state remains understandable without relying on color alone
- [x] **QC (Automated):** automate QC coverage for accessibility cues and semantic structure

---

## Epic 10 — Final Documentation and Release Readiness

### Story 10.1 — Update documentation to reflect implemented runtime behavior
- [x] Reconcile implementation with `documentation/architecture.md`
- [x] Reconcile implementation with `documentation/data-model.md`
- [x] Reconcile implementation with `documentation/setup-rules.md`
- [x] **Test:** verify implemented behavior matches documented architecture and rules
- [x] **QC (Automated):** automate QC coverage for documentation-to-implementation consistency

### Story 10.2 — Document how to open and use the static-served app
- [x] Update `README.md` usage instructions
- [x] Confirm browser support wording
- [x] **Test:** verify README instructions are sufficient to open and use the app from scratch
- [x] **QC (Automated):** automate QC coverage for first-time README clarity and ambiguity checks

### Story 10.3 — Document reset behavior, persistence, and limitations
- [x] Document how persistence works
- [x] Document reset behavior
- [x] Document known V1 limitations
- [x] **Test:** verify documented persistence/reset behavior matches actual app behavior
- [x] **QC (Automated):** automate QC coverage to compare docs against live app behavior

### Story 10.4 — Perform a final consistency pass across all markdown specs
- [x] Verify statuses of documentation files
- [x] Align terminology across all markdown documents
- [x] Ensure final docs match approved implementation scope
- [x] **Test:** verify no spec file contradicts implemented behavior or other approved docs
- [x] **QC (Automated):** automate QC coverage for one final end-to-end documentation review
