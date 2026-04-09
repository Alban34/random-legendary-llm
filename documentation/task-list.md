# Implementation Task List

STATUS: In Review

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

### Story 1.1 — Embed canonical game data in the single-page application
- [ ] Create the embedded canonical game-data constant in `index.html`
- [ ] Import or transcribe approved set inventory into the embedded data block
- [ ] Preserve source display names exactly as approved
- [ ] **Test:** verify all included sets from `documentation/game-data-normalized.md` are present in the embedded data
- [ ] **QC:** spot-check at least 5 sets against the approved data docs

### Story 1.2 — Normalize source entities into set-scoped runtime IDs
- [ ] Implement a slug/ID helper for set-scoped entity IDs
- [ ] Generate stable IDs for sets
- [ ] Generate stable IDs for heroes, masterminds, villain groups, henchman groups, and schemes
- [ ] Ensure duplicate display names remain distinct via set-scoped IDs
- [ ] **Test:** verify IDs are unique and duplicate display names remain distinct
- [ ] **QC:** manually inspect duplicate-name examples like `Black Widow`, `Loki`, and `Thor`

### Story 1.3 — Resolve cross-references for Masterminds and Schemes
- [ ] Resolve `alwaysLead` + category into runtime lead references
- [ ] Resolve forced Scheme groups into runtime IDs
- [ ] Convert known scheme setup behavior into structured rule modifiers
- [ ] Preserve human-readable rule notes for display
- [ ] **Test:** verify all resolved references exist and match approved source-backed behavior
- [ ] **QC:** manually inspect edge cases like `Dr. Doom` and `Secret Invasion of the Skrull Shapeshifters`

### Story 1.4 — Build flattened runtime indexes for all entity types
- [ ] Build `setsById`
- [ ] Build `heroesById`
- [ ] Build `mastermindsById`
- [ ] Build `villainGroupsById`
- [ ] Build `henchmanGroupsById`
- [ ] Build `schemesById`
- [ ] Build flat arrays for each entity category
- [ ] **Test:** verify index counts match canonical counts and each indexed ID resolves correctly
- [ ] **QC:** inspect runtime index samples in the browser console or debug output

### Story 1.5 — Validate normalized data and surface initialization errors
- [ ] Validate unique set IDs
- [ ] Validate unique entity IDs
- [ ] Validate Mastermind lead references
- [ ] Validate Scheme forced-group references
- [ ] Surface initialization failures clearly in the UI
- [ ] **Test:** trigger representative invalid-reference cases in a test harness and verify failure reporting
- [ ] **QC:** confirm errors are understandable and non-technical enough for review

---

## Epic 2 — State Management and Persistence

### Story 2.1 — Create a storage manager for versioned root state
- [ ] Define `legendary_state_v1` shape in code
- [ ] Implement default-state factory
- [ ] Implement safe load with fallback to defaults
- [ ] Implement save/update helpers for the root state object
- [ ] **Test:** verify save/load roundtrip preserves the root state shape
- [ ] **QC:** inspect stored browser data manually after state writes

### Story 2.2 — Persist and hydrate owned collection state
- [ ] Store owned set IDs
- [ ] Hydrate collection state on load
- [ ] Validate stored set IDs against runtime indexes
- [ ] Remove invalid stored references safely
- [ ] **Test:** verify owned-set changes persist across reloads and invalid set IDs are handled safely
- [ ] **QC:** manually toggle several owned sets, reload, and confirm consistency

### Story 2.3 — Persist and update usage statistics (`plays`, `lastPlayedAt`)
- [ ] Define per-category usage-stat containers
- [ ] Implement usage-stat increment helper
- [ ] Update `plays` on Accept & Log
- [ ] Update `lastPlayedAt` on Accept & Log
- [ ] **Test:** verify usage stats update only on accepted setups and store both `plays` and `lastPlayedAt`
- [ ] **QC:** manually accept multiple setups and inspect freshness ordering behavior

### Story 2.4 — Persist and retrieve accepted game history
- [ ] Define `GameRecord` creation helper
- [ ] Append accepted setups to history
- [ ] Load history on startup
- [ ] Sort or render history newest-first
- [ ] **Test:** verify accepted setups create stable ID-based history records in newest-first order
- [ ] **QC:** manually compare rendered history against accepted setup output

### Story 2.5 — Support per-category and full reset operations
- [ ] Reset hero usage stats
- [ ] Reset mastermind usage stats
- [ ] Reset villain-group usage stats
- [ ] Reset henchman usage stats
- [ ] Reset scheme usage stats
- [ ] Reset the entire root state safely
- [ ] **Test:** verify per-category reset only affects the intended category and full reset clears all slices
- [ ] **QC:** manually perform each reset action and confirm visible state updates correctly

### Story 2.6 — Handle corrupted or missing browser state gracefully
- [ ] Detect invalid JSON/state shape
- [ ] Recover with default state
- [ ] Notify the user when recovery occurs
- [ ] **Test:** simulate corrupted saved state and verify safe recovery
- [ ] **QC:** confirm the recovery message is visible and understandable

---

## Epic 3 — Setup Generation Engine

### Story 3.1 — Implement player-count setup templates
- [ ] Add `SETUP_RULES` constant for 1–5 players
- [ ] Add Advanced Solo template
- [ ] Expose helper for resolving the active template
- [ ] **Test:** verify required counts for all supported player modes including Advanced Solo
- [ ] **QC:** manually review displayed setup requirements against the approved rules table

### Story 3.2 — Validate owned collection legality before generation
- [ ] Validate hero sufficiency
- [ ] Validate villain-group sufficiency
- [ ] Validate henchman-group sufficiency
- [ ] Validate scheme availability for the chosen player count
- [ ] Validate Advanced Solo only for 1 player
- [ ] **Test:** verify illegal collections fail with correct reasons and legal collections proceed
- [ ] **QC:** manually try thin collections such as `Dimensions`-heavy or low-henchman selections

### Story 3.3 — Select a legal Scheme and apply its rule effects
- [ ] Filter schemes by legality constraints
- [ ] Select a scheme using freshness priority
- [ ] Apply scheme forced groups
- [ ] Apply scheme rule modifiers to required slot counts
- [ ] Capture scheme notes for result rendering
- [ ] **Test:** verify scheme constraints, forced groups, and modifiers alter setup correctly
- [ ] **QC:** manually inspect at least 3 scheme edge cases with special setup rules

### Story 3.4 — Select a legal Mastermind and account for mandatory leads
- [ ] Select a mastermind using freshness priority
- [ ] Apply resolved mastermind lead to the setup
- [ ] Account for villain vs henchman lead categories correctly
- [ ] **Test:** verify villain-led and henchman-led masterminds consume the correct slot type
- [ ] **QC:** manually inspect `Red Skull`, `Dr. Doom`, and one additional edge case

### Story 3.5 — Fill Villain Group and Henchman Group slots correctly
- [ ] Prevent duplicate forced/random group collisions
- [ ] Fill remaining villain-group slots legally
- [ ] Fill remaining henchman-group slots legally
- [ ] Preserve deterministic forced groups in the final result
- [ ] **Test:** verify slot-filling logic with and without forced groups and with reduced pool sizes
- [ ] **QC:** manually inspect a 5-player setup where multiple categories are tight

### Story 3.6 — Select Heroes using freshness and least-played priority
- [ ] Build eligible hero pool from owned sets
- [ ] Prefer never-played heroes first
- [ ] Fall back to least-played heroes when needed
- [ ] Break ties by oldest `lastPlayedAt`, then random
- [ ] **Test:** verify freshness ordering and least-played fallback with deterministic sample usage stats
- [ ] **QC:** manually confirm fallback messaging and result freshness behavior

### Story 3.7 — Keep Generate/Regenerate ephemeral until Accept & Log
- [ ] Ensure Generate does not mutate persisted state
- [ ] Ensure Regenerate does not mutate persisted state
- [ ] Keep current generated setup in ephemeral UI state only
- [ ] **Test:** verify repeated Generate/Regenerate leaves usage stats and history unchanged until accept
- [ ] **QC:** manually inspect storage before and after Regenerate cycles

### Story 3.8 — Produce history-ready setup snapshots using IDs only
- [ ] Build setup snapshot with entity IDs only
- [ ] Include player count and Advanced Solo flag
- [ ] Include accepted timestamp
- [ ] **Test:** verify history records store IDs only and still render correct labels through lookup indexes
- [ ] **QC:** manually inspect one stored record containing duplicate-name entities

---

## Epic 4 — Application Shell and Navigation

### Story 4.1 — Create the base HTML application shell
- [ ] Create page structure and root container
- [ ] Add four main tab panels
- [ ] Add shared header area
- [ ] **Test:** verify all four panels render and the default panel is correct
- [ ] **QC:** manually inspect the shell on desktop width and mobile width

### Story 4.2 — Implement responsive tab navigation for desktop and mobile
- [ ] Build desktop tab navigation
- [ ] Build mobile tab navigation
- [ ] Implement tab switching behavior
- [ ] Persist active tab if included in preferences
- [ ] **Test:** verify tab switching works correctly on both desktop and mobile layouts
- [ ] **QC:** manually tab through navigation with keyboard only

### Story 4.3 — Apply the approved dark Marvel visual design system
- [ ] Add CSS custom properties from the design spec
- [ ] Apply typography, spacing, and borders
- [ ] Style primary and secondary buttons
- [ ] **Test:** verify key UI primitives render with expected classes/styles
- [ ] **QC:** compare the UI visually against `documentation/ui-design.md`

### Story 4.4 — Create reusable UI primitives for cards, buttons, badges, and panels
- [ ] Create set card styles
- [ ] Create result card styles
- [ ] Create badge styles
- [ ] Create panel layout styles
- [ ] **Test:** verify shared primitives render consistently across tabs
- [ ] **QC:** visually inspect reused components in at least 3 different screens

### Story 4.5 — Support active-tab persistence and keyboard navigation
- [ ] Save selected tab in preferences if implemented
- [ ] Add keyboard focus styles
- [ ] Ensure tab navigation works with keyboard only
- [ ] **Test:** verify selected-tab persistence and focus navigation behavior
- [ ] **QC:** manually navigate the full shell without a mouse

---

## Epic 5 — Browse Extensions Experience

### Story 5.1 — Render the set grid from normalized data
- [ ] Render included sets from canonical/norm data
- [ ] Show year and type badges
- [ ] Show category counts per set
- [ ] **Test:** verify every included set renders exactly once with expected metadata
- [ ] **QC:** visually compare rendered set list with `documentation/game-data-normalized.md`

### Story 5.2 — Display set metadata and counts consistently
- [ ] Show heroes/masterminds/schemes counts
- [ ] Show villain and henchman counts where applicable
- [ ] Display ownership state visually
- [ ] **Test:** verify displayed counts match normalized data for representative sets
- [ ] **QC:** manually inspect low-count edge cases like `Dimensions` and `S.H.I.E.L.D.`

### Story 5.3 — Expand a set card to show its detailed contents
- [ ] Add card expand/collapse behavior
- [ ] Render heroes list
- [ ] Render masterminds list
- [ ] Render villain and henchman lists
- [ ] Render schemes list
- [ ] **Test:** verify expand/collapse state and content rendering for representative sets
- [ ] **QC:** manually inspect details for at least one normal set and one edge-case set

### Story 5.4 — Filter sets by type and search term
- [ ] Add search input
- [ ] Add type filter controls
- [ ] Filter rendered sets reactively
- [ ] **Test:** verify search and type filters work independently and together
- [ ] **QC:** manually try partial names, no-match searches, and type combinations

### Story 5.5 — Toggle set ownership from the Browse tab
- [ ] Add ownership toggle button
- [ ] Sync toggle with persisted collection state
- [ ] Re-render related UI on ownership change
- [ ] **Test:** verify Browse ownership toggles update collection state and survive reload
- [ ] **QC:** manually toggle several sets and confirm the UI feedback is clear

---

## Epic 6 — Collection Management Experience

### Story 6.1 — Render the collection view grouped by set type
- [ ] Group sets into Base / Large / Small / Standalone
- [ ] Render checklist rows for each set
- [ ] **Test:** verify groupings and checklist rendering against normalized type metadata
- [ ] **QC:** visually inspect grouping order and readability

### Story 6.2 — Mirror ownership toggles between Browse and Collection tabs
- [ ] Share the same ownership source of truth
- [ ] Re-render Browse on Collection changes
- [ ] Re-render Collection on Browse changes
- [ ] **Test:** verify ownership changes propagate across both tabs immediately
- [ ] **QC:** manually toggle from both tabs and confirm synchronization

### Story 6.3 — Compute category totals from the selected collection
- [ ] Count owned heroes
- [ ] Count owned masterminds
- [ ] Count owned villain groups
- [ ] Count owned henchman groups
- [ ] Count owned schemes
- [ ] **Test:** verify totals update correctly as collection ownership changes
- [ ] **QC:** manually cross-check totals with a small custom collection

### Story 6.4 — Display player-count feasibility indicators
- [ ] Compute feasibility for Standard Solo
- [ ] Compute feasibility for Advanced Solo
- [ ] Compute feasibility for 2–5 players
- [ ] Show warning states clearly
- [ ] **Test:** verify feasibility indicators reflect legality rules for multiple collection combinations
- [ ] **QC:** manually inspect at least one legal and one illegal collection scenario

### Story 6.5 — Support clearing the owned collection with confirmation
- [ ] Add collection reset action
- [ ] Add confirmation flow
- [ ] Persist cleared collection state
- [ ] **Test:** verify collection reset clears only ownership state and requires confirmation
- [ ] **QC:** manually confirm post-reset UI consistency in Browse and Collection tabs

---

## Epic 7 — New Game Setup Experience

### Story 7.1 — Render player-count and Advanced Solo controls
- [ ] Add player-count selector buttons
- [ ] Add Advanced Solo toggle
- [ ] Disable Advanced Solo outside 1-player mode
- [ ] **Test:** verify controls update state correctly and Advanced Solo is blocked outside 1-player mode
- [ ] **QC:** manually inspect button states and toggle affordance

### Story 7.2 — Display setup requirements for the current selection
- [ ] Show required heroes count
- [ ] Show required villain-group count
- [ ] Show required henchman-group count
- [ ] Show wound count
- [ ] **Test:** verify displayed requirements match the active template for all player modes
- [ ] **QC:** compare displayed numbers with `documentation/setup-rules.md`

### Story 7.3 — Generate and render a full setup result
- [ ] Render mastermind card
- [ ] Render scheme card
- [ ] Render hero cards/grid
- [ ] Render villain-group list
- [ ] Render henchman-group list
- [ ] **Test:** verify a generated setup renders every selected category correctly
- [ ] **QC:** manually inspect layout and readability of a full result panel

### Story 7.4 — Show Scheme notes and forced-group badges clearly
- [ ] Mark forced groups visually
- [ ] Render scheme rule notes
- [ ] Render mastermind lead information clearly
- [ ] **Test:** verify forced-group indicators and notes appear on appropriate setups
- [ ] **QC:** manually inspect at least 3 setups with special rules or forced groups

### Story 7.5 — Allow Regenerate without consuming state
- [ ] Add Regenerate action
- [ ] Replace only ephemeral current result
- [ ] Leave usage stats unchanged
- [ ] **Test:** verify Regenerate changes the result without mutating history or usage stats
- [ ] **QC:** inspect UI and storage before and after regenerate flow

### Story 7.6 — Accept and log the setup into persistent state
- [ ] Add Accept & Log action
- [ ] Update usage stats on accept
- [ ] Append history record on accept
- [ ] Refresh History tab data after accept
- [ ] **Test:** verify Accept & Log mutates state exactly once and records the correct snapshot
- [ ] **QC:** manually accept a setup and confirm History and Usage views update immediately

---

## Epic 8 — History, Usage, and Reset Experience

### Story 8.1 — Render per-category freshness and usage indicators
- [ ] Show never-played counts per category
- [ ] Show clear labels for reset actions
- [ ] Explain least-played fallback in the UI
- [ ] **Test:** verify indicators reflect actual usage stats from persisted state
- [ ] **QC:** manually inspect indicator changes after several accepted games

### Story 8.2 — Render accepted game history in newest-first order
- [ ] Render summary rows for history records
- [ ] Resolve IDs back to display names
- [ ] Show player count and mode metadata
- [ ] **Test:** verify history ordering, label resolution, and summary metadata
- [ ] **QC:** manually inspect history readability with multiple accepted games

### Story 8.3 — Expand and collapse history records
- [ ] Add expandable history item behavior
- [ ] Show full setup details inside expanded items
- [ ] **Test:** verify expand/collapse works correctly for multiple history entries
- [ ] **QC:** manually inspect one collapsed and one expanded entry on mobile and desktop widths

### Story 8.4 — Reset a single category of usage stats
- [ ] Add reset button for heroes
- [ ] Add reset button for masterminds
- [ ] Add reset button for villain groups
- [ ] Add reset button for henchman groups
- [ ] Add reset button for schemes
- [ ] **Test:** verify each category reset affects only its own usage stats and indicators
- [ ] **QC:** manually test at least two category resets after accepted games exist

### Story 8.5 — Reset the full application state with confirmation
- [ ] Add full reset action
- [ ] Show confirmation modal
- [ ] Clear collection, usage, history, and preferences on confirm
- [ ] **Test:** verify full reset clears all persisted state only after confirmation
- [ ] **QC:** manually confirm the app returns to a clean initial state after reset

---

## Epic 9 — Notifications, Error Handling, and Accessibility

### Story 9.1 — Show success, info, warning, and error toast notifications
- [ ] Implement toast container
- [ ] Implement toast rendering and dismissal
- [ ] Add success/info/warning/error variants
- [ ] **Test:** verify each toast type renders and dismisses correctly
- [ ] **QC:** manually inspect stacking, timing, and readability

### Story 9.2 — Report collection insufficiency and invalid setup requests clearly
- [ ] Show error when collection is illegal for selected setup
- [ ] Show info when least-played fallback is used
- [ ] Show validation errors without breaking the UI
- [ ] **Test:** verify invalid requests produce clear messages and do not crash the page
- [ ] **QC:** manually try several invalid scenarios and assess message clarity

### Story 9.3 — Handle unavailable browser storage gracefully
- [ ] Detect storage availability
- [ ] Show compatibility warning if storage is unavailable
- [ ] Keep the page functional in degraded mode where possible
- [ ] **Test:** simulate unavailable storage and verify graceful degradation behavior
- [ ] **QC:** manually inspect degraded-mode messaging and usable fallbacks

### Story 9.4 — Implement keyboard-accessible interactions and focus behavior
- [ ] Ensure all controls are tabbable
- [ ] Add visible `:focus-visible` styling
- [ ] Ensure modal keyboard controls work
- [ ] **Test:** verify keyboard interaction works for tabs, buttons, and modal flows
- [ ] **QC:** manually navigate primary flows using keyboard only

### Story 9.5 — Verify color-independent state communication and semantic roles
- [ ] Add supporting text/icon cues alongside color states
- [ ] Apply ARIA roles to tabs and modal
- [ ] Verify semantic structure of interactive regions
- [ ] **Test:** verify state remains understandable without relying on color alone
- [ ] **QC:** manually review accessibility cues and semantic structure

---

## Epic 10 — Final Documentation and Release Readiness

### Story 10.1 — Update documentation to reflect implemented runtime behavior
- [ ] Reconcile implementation with `documentation/architecture.md`
- [ ] Reconcile implementation with `documentation/data-model.md`
- [ ] Reconcile implementation with `documentation/setup-rules.md`
- [ ] **Test:** verify implemented behavior matches documented architecture and rules
- [ ] **QC:** perform a documentation-to-implementation consistency review

### Story 10.2 — Document how to open and use the single-file app
- [ ] Update `README.md` usage instructions
- [ ] Confirm browser support wording
- [ ] **Test:** verify README instructions are sufficient to open and use the app from scratch
- [ ] **QC:** read the README as a first-time user and check for ambiguity

### Story 10.3 — Document reset behavior, persistence, and limitations
- [ ] Document how persistence works
- [ ] Document reset behavior
- [ ] Document known V1 limitations
- [ ] **Test:** verify documented persistence/reset behavior matches actual app behavior
- [ ] **QC:** manually compare docs against live app behavior

### Story 10.4 — Perform a final consistency pass across all markdown specs
- [ ] Verify statuses of documentation files
- [ ] Align terminology across all markdown documents
- [ ] Ensure final docs match approved implementation scope
- [ ] **Test:** verify no spec file contradicts implemented behavior or other approved docs
- [ ] **QC:** complete one final end-to-end documentation review
