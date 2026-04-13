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

---

## Epic 11 — Alternate Solo and Multiplayer Modes

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 11 work complete

### Story 11.1 — Define the rules and UX contract for two-handed solo mode
- [x] Confirm the exact card-count and slot rules for two-handed solo mode
- [x] Document whether two-handed solo behaves as a 2-player setup, a custom setup, or a separate ruleset
- [x] Define the user-facing label, description, and control placement for the mode
- [x] Identify any history, scoring, or stats implications of the new mode metadata
- [x] **Test:** verify the documented rules and control contract stay aligned with generator assumptions
- [x] **QC (Automated):** automate QC coverage to confirm the new mode messaging is visible and understandable in the New Game flow

### Story 11.2 — Extend setup templates and validation for alternate play modes
- [x] Add setup-template support for two-handed solo mode
- [x] Update legality validation to evaluate collection sufficiency for the new mode
- [x] Ensure scheme and mastermind rule modifiers still apply correctly under the new template
- [x] Keep unsupported mode combinations blocked with clear reasons
- [x] **Test:** verify legal and illegal collections behave correctly for all supported mode combinations
- [x] **QC (Automated):** automate QC coverage for generating setups in standard solo, advanced solo, and two-handed solo modes

### Story 11.3 — Render play-mode selection and explain its impact in the New Game flow
- [x] Add UI controls for selecting the supported play mode
- [x] Update setup-requirements messaging to reflect the chosen mode
- [x] Show mode-specific notes when the selected mode changes the rules materially
- [x] Preserve accessible control labels and keyboard interaction
- [x] **Test:** verify the selected mode updates requirements, generation behavior, and labels consistently
- [x] **QC (Automated):** automate QC coverage for mode selection on desktop and mobile viewports

### Story 11.4 — Persist accepted setups with explicit play-mode metadata
- [x] Extend the game-record shape to include normalized play-mode metadata
- [x] Ensure accepted setups store the chosen mode in history
- [x] Preserve backward compatibility for existing history records without play-mode metadata
- [x] Update renderers to display mode information when present
- [x] **Test:** verify mixed old/new history records load safely and render correctly
- [x] **QC (Automated):** automate QC coverage for accepted setups that differ only by play mode

### Story 11.5 — Verify history, stats, and export payloads remain compatible with the new mode model
- [x] Audit all history readers for assumptions about player-count-only records
- [x] Update any stats derivations to account for play mode explicitly
- [x] Reserve a stable export representation for play-mode metadata
- [x] Document any fallback behavior for legacy records
- [x] **Test:** verify history, analytics inputs, and exported payloads remain valid after mode support is introduced
- [x] **QC (Automated):** automate QC coverage for one imported or restored record set containing legacy and mode-aware entries

---

## Epic 12 — Score Logging and Results History

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 12 work complete

### Story 12.1 — Define a post-game result model that extends the existing game record safely
- [x] Define fields for score, outcome, completion state, and optional notes
- [x] Decide whether result data is stored in the same record or a linked structure
- [x] Define validation rules for incomplete, partial, or corrected results
- [x] Preserve compatibility with history entries created before score support exists
- [x] **Test:** verify the result model accepts valid states and rejects invalid combinations
- [x] **QC (Automated):** automate QC coverage for representative valid and invalid result-entry states

### Story 12.2 — Add score and outcome entry to the accepted game workflow
- [x] Add UI for recording win/loss and score after a setup is accepted or completed
- [x] Decide whether result entry is immediate, deferred, or both
- [x] Prevent invalid score submission and incomplete required fields
- [x] Keep the flow understandable when users skip result entry intentionally
- [x] **Test:** verify the result-entry flow supports save, skip, and cancel paths correctly
- [x] **QC (Automated):** automate QC coverage for keyboard-only score entry and validation messaging

### Story 12.3 — Persist score history alongside setup history without breaking existing saved state
- [x] Extend storage loading and saving for result data
- [x] Add migration or fallback handling for saved states without score fields
- [x] Keep corruption recovery behavior safe if result data is malformed
- [x] Ensure result persistence does not mutate unrelated state slices
- [x] **Test:** verify save/load roundtrips for records with and without result data
- [x] **QC (Automated):** automate QC coverage for upgrading an older saved state into the richer history model

### Story 12.4 — Render score and outcome summaries in the History experience
- [x] Display outcome state clearly in each game record
- [x] Display score information consistently when present
- [x] Distinguish pending-result records from completed-result records
- [x] Preserve readability for long history lists and compact layouts
- [x] **Test:** verify history rendering for win, loss, pending, and corrected-result records
- [x] **QC (Automated):** automate QC coverage for mixed history entries across desktop and mobile layouts

### Story 12.5 — Support editing or correcting a logged result after the initial save
- [x] Add edit affordances for previously logged results
- [x] Preserve audit-safe behavior for corrected values without duplicating records unintentionally
- [x] Recompute derived views after a result edit
- [x] Confirm destructive or overwriting edits appropriately if needed
- [x] **Test:** verify editing a result updates the stored record and derived views without duplication
- [x] **QC (Automated):** automate QC coverage for correcting a result and seeing the update reflected immediately in history

---

## Epic 13 — Data Portability and Backup

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 13 work complete

### Story 13.1 — Define a versioned import/export schema for collection, preferences, history, and scores
- [x] Define the exported root object shape and version marker
- [x] Include collection, preferences, history, score data, and future-safe metadata blocks
- [x] Define compatibility behavior for unknown or missing fields
- [x] Document the difference between internal runtime state and portable backup schema
- [x] **Test:** verify schema serialization and validation against representative sample payloads
- [x] **QC (Automated):** automate QC coverage for versioned backup fixtures with current and legacy-compatible fields

### Story 13.2 — Export app data as a downloadable JSON file
- [x] Add an export action in the UI with clear scope messaging
- [x] Serialize the portable schema from the current saved state
- [x] Trigger a browser-safe JSON download with a useful filename
- [x] Avoid exporting transient UI-only state
- [x] **Test:** verify exported JSON contains the expected persistent data and excludes ephemeral state
- [x] **QC (Automated):** automate QC coverage to trigger export and validate the downloaded payload structure

### Story 13.3 — Import previously exported JSON data through the UI
- [x] Add an import entry point and file-selection flow
- [x] Read JSON files safely in the browser
- [x] Parse and stage imported data before applying it
- [x] Keep the import flow accessible and recoverable after user mistakes
- [x] **Test:** verify valid exported files can be imported successfully into a clean or populated app state
- [x] **QC (Automated):** automate QC coverage for importing a valid backup and seeing the restored state rendered correctly

### Story 13.4 — Validate imported payloads and show actionable recovery errors
- [x] Validate schema version, required sections, and key field types
- [x] Surface clear errors for unsupported, corrupted, or partial payloads
- [x] Prevent destructive writes when validation fails
- [x] Keep error messages specific enough for recovery without exposing internals unnecessarily
- [x] **Test:** verify malformed and unsupported payloads fail safely without changing saved state
- [x] **QC (Automated):** automate QC coverage for representative import failure cases and visible error messaging

### Story 13.5 — Offer safe restore modes for replacing or merging existing local data
- [x] Define replace vs merge semantics for each persistent state slice
- [x] Add confirmation UX before applying destructive restore actions
- [x] Implement merge behavior that avoids duplicate history records where possible
- [x] Preserve user trust by previewing the chosen restore action clearly
- [x] **Test:** verify replace and merge paths update only the intended state slices
- [x] **QC (Automated):** automate QC coverage for both restore modes with overlapping history and collection data

---

## Epic 14 — Insights and Statistics Dashboard

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 14 work complete

### Story 14.1 — Define the derived metrics that can be computed from history and usage state
- [x] Define the initial metrics set for counts, outcomes, freshness, and score trends
- [x] Identify which metrics require score data and which can rely on usage data alone
- [x] Define calculation windows and empty-state behavior
- [x] Document tie-breaking and ranking rules for repeated entities
- [x] **Test:** verify metric definitions produce stable expected outputs for representative sample histories
- [x] **QC (Automated):** automate QC coverage for edge cases such as no history, one game, and partial score coverage

### Story 14.2 — Compute summary statistics for games played, outcomes, and scores
- [x] Implement selectors or helpers for total games, wins, losses, and score aggregates
- [x] Compute ratios and averages safely without divide-by-zero behavior
- [x] Keep derived metrics deterministic and independent of presentation order
- [x] Recompute summaries when history or results change
- [x] **Test:** verify summary statistics across mixed win/loss and scored/unscored histories
- [x] **QC (Automated):** automate QC coverage for summary cards updating after a new result is logged

### Story 14.3 — Surface most-played and least-played cards or groups across categories
- [x] Define which categories appear in ranking views
- [x] Build ranking helpers from usage stats and accepted history
- [x] Handle ties and low-sample-size displays sensibly
- [x] Show enough context for duplicate display names from different sets
- [x] **Test:** verify rankings are correct and stable for duplicate names and tied play counts
- [x] **QC (Automated):** automate QC coverage for rankings containing duplicate-name entities from different sets

### Story 14.4 — Add a dedicated stats presentation in History or a new insights view
- [x] Decide whether stats live in the History tab or in a separate section
- [x] Add summary cards, charts, or ranked lists consistent with the app design system
- [x] Preserve responsive layout and accessibility for data-heavy content
- [x] Keep stats understandable without requiring a large play history
- [x] **Test:** verify the stats UI renders correctly for empty, light, and heavy datasets
- [x] **QC (Automated):** automate QC coverage for the stats layout on mobile and desktop viewports

### Story 14.5 — Handle sparse or partial data gracefully so early users still see useful feedback
- [x] Add empty states and explanatory helper text for thin datasets
- [x] Hide or soften metrics that would otherwise mislead users with too little data
- [x] Distinguish unavailable data from a true zero result
- [x] Preserve a useful first impression after only one or two logged games
- [x] **Test:** verify sparse-data states render helpful messaging instead of broken or misleading metrics
- [x] **QC (Automated):** automate QC coverage for a fresh install and a minimally populated history state

---

## Epic 15 — Guided Setup Constraints and Forced Picks

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 15 work complete

### Story 15.1 — Define which entity categories can be forced into a generated setup
- [x] Decide which entity types are eligible for forced inclusion in v1 of the feature
- [x] Define legal combinations of forced picks across categories
- [x] Document collision rules when forced picks overlap with mandatory scheme or mastermind constraints
- [x] Define unsupported combinations and the user-facing error strategy
- [x] **Test:** verify the supported forced-pick matrix stays aligned with generator assumptions
- [x] **QC (Automated):** automate QC coverage for the user-facing explanation of supported forced-pick categories

### Story 15.2 — Add UI controls for selecting, reviewing, and clearing forced picks
- [x] Add controls for choosing forced picks from eligible entities
- [x] Display active constraints clearly before generation
- [x] Allow removing individual forced picks and clearing all constraints
- [x] Keep the selection UI usable with large owned collections
- [x] **Test:** verify adding, removing, and clearing constraints updates the pending generation state correctly
- [x] **QC (Automated):** automate QC coverage for forced-pick selection flows across at least two entity categories

### Story 15.3 — Update generator logic to satisfy forced picks when a legal setup exists
- [x] Apply forced picks before random slot-filling begins
- [x] Prevent duplicate-selection conflicts with forced scheme or mastermind effects
- [x] Keep legality-first behavior when the available pool is tight
- [x] Preserve deterministic handling when multiple forced rules interact
- [x] **Test:** verify legal forced-pick setups generate correctly across representative constraint combinations
- [x] **QC (Automated):** automate QC coverage for a setup that combines forced picks with mandatory mastermind or scheme groups

### Story 15.4 — Explain clearly when a forced pick makes the setup impossible for the current collection or player mode
- [x] Detect unsatisfied forced-pick constraints before or during generation
- [x] Surface actionable error messaging that explains the failure reason
- [x] Distinguish impossible constraints from temporary randomization retries
- [x] Preserve existing insufficiency messaging where it still applies
- [x] **Test:** verify impossible constraints fail with specific and correct reasons
- [x] **QC (Automated):** automate QC coverage for several impossible forced-pick combinations and the resulting UI feedback

### Story 15.5 — Persist or intentionally scope forced-pick preferences based on the final UX decision
- [x] Decide whether forced picks are one-shot, session-scoped, or persisted in preferences
- [x] Implement the chosen persistence or reset behavior consistently
- [x] Keep accepted-history snapshots free of stale UI-only constraint state
- [x] Document the final lifecycle of forced-pick selections in the UX copy or docs
- [x] **Test:** verify forced-pick lifecycle behavior across reloads and repeated generations
- [x] **QC (Automated):** automate QC coverage for persistence behavior after reload and after successful accept flows

---

## Epic 16 — Notification and Feedback Refinements

### Story 16.1 — Classify notifications by persistence and dismissal behavior
- [x] Define notification categories for transient, persistent, and critical messages
- [x] Map existing app events onto the new notification classes
- [x] Document which messages should never produce a toast
- [x] Preserve semantic roles and accessibility expectations for each class
- [x] **Test:** verify notification classification remains consistent for the main success, info, warning, and error paths
- [x] **QC (Automated):** automate QC coverage for representative events in each notification category

### Story 16.2 — Auto-dismiss non-critical toasts after an accessible timeout
- [x] Add timeout behavior for transient toasts
- [x] Pause or adjust dismissal timing as needed for accessibility-sensitive interactions
- [x] Ensure timers do not leak or remove the wrong toast when multiple are stacked
- [x] Keep critical errors exempt from auto-dismissal
- [x] **Test:** verify auto-dismiss timing works for single and stacked non-critical toasts
- [x] **QC (Automated):** automate QC coverage for stacked toasts that dismiss in the expected order

### Story 16.3 — Allow users to dismiss transient toasts directly
- [x] Add an explicit dismissal affordance or interaction to non-critical toasts
- [x] Keep the interaction keyboard-accessible
- [x] Ensure dismissal does not interfere with concurrent toast timers
- [x] Preserve focus behavior when a toast is dismissed manually
- [x] **Test:** verify manual dismissal works for mouse and keyboard interaction paths
- [x] **QC (Automated):** automate QC coverage for manual dismissal of a stacked toast set

### Story 16.4 — Suppress low-value notifications when equivalent information is already visible in the UI
- [x] Identify events that currently create redundant toasts
- [x] Remove or suppress redundant notifications without losing important feedback
- [x] Keep critical or exceptional fallback messaging intact
- [x] Confirm the remaining UI state is sufficient to explain reuse or freshness behavior
- [x] **Test:** verify redundant toasts are suppressed while required error messages still appear
- [x] **QC (Automated):** automate QC coverage for regeneration and reuse scenarios that should no longer emit informational toasts

### Story 16.5 — Preserve critical error messaging until the user has a reasonable chance to acknowledge it
- [x] Define which error conditions are considered critical
- [x] Keep critical toasts persistent or require explicit dismissal
- [x] Distinguish critical presentation visually and semantically from transient messages
- [x] Ensure critical messages remain non-blocking unless escalation is explicitly intended
- [x] **Test:** verify critical errors remain visible while non-critical messages continue to auto-dismiss
- [x] **QC (Automated):** automate QC coverage for one critical collection-insufficiency error and one recoverable transient message shown in sequence

---

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

## Epic 18 — Theme Personalization and Styling Architecture

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 18 work complete

### Story 18.1 — Add a user-selectable theme toggle and persist the preference in browser state
- [x] Add a theme toggle control in an appropriate persistent UI location
- [x] Define the supported initial theme set and the default selection rule
- [x] Save and load the selected theme from browser state
- [x] Apply the selected theme on startup without visible flicker where feasible
- [x] **Test:** verify theme selection persists across reloads and applies consistently on startup
- [x] **QC (Automated):** automate QC coverage for switching themes and reloading the app

### Story 18.2 — Refactor design tokens so multiple themes can be supported without CSS duplication
- [x] Audit existing CSS variables and theme assumptions
- [x] Separate semantic tokens from concrete palette values
- [x] Define theme token sets for each supported theme
- [x] Keep component styling reusable across themes without duplicated rule blocks
- [x] **Test:** verify components resolve the correct token values across supported themes
- [x] **QC (Automated):** automate QC coverage for representative screens under each theme token set

### Story 18.3 — Verify all primary screens and components remain legible and accessible across themes
- [x] Review contrast-sensitive components across all major screens
- [x] Update badges, cards, controls, and notifications for cross-theme readability
- [x] Preserve visible focus states and semantic state indicators in each theme
- [x] Check empty states and dense content views for visual regressions
- [x] **Test:** verify key screens meet the chosen accessibility checks across supported themes
- [x] **QC (Automated):** automate QC coverage for cross-theme screenshots or assertions on the main app flows

### Story 18.4 — Evaluate candidate third-party CSS approaches that can be bundled statically without runtime dependencies
- [x] Identify realistic CSS-library or utility-layer candidates that fit the project's constraints
- [x] Evaluate whether each option improves maintainability, bundle simplicity, or design flexibility
- [x] Confirm any candidate can be integrated at build time without runtime dependency loading
- [x] Document tradeoffs against keeping the current hand-authored CSS approach
- [x] **Test:** verify any proof-of-concept styling approach can be built into the static app without runtime fetches
- [x] **QC (Automated):** automate QC coverage or build validation for the selected proof-of-concept integration path

### Story 18.5 — Document the styling architecture decision and any migration constraints before adoption
- [x] Record the final styling direction and decision rationale
- [x] Document migration constraints, non-goals, and rollout strategy if a new approach is chosen
- [x] Keep the theme model aligned with the documented design-system contract
- [x] Update future backlog assumptions that depend on the styling decision
- [x] **Test:** verify documentation remains aligned with the implemented theme and styling architecture behavior
- [x] **QC (Automated):** automate QC coverage or consistency checks for documentation references to the chosen styling approach

---

## Additional backlog candidates pending review

These epics are derived from the remaining unchecked items in `documentation/_next-steps.md`.

## Epic 19 — Interface Localization

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 19 work complete

### Story 19.1 — Define the localization architecture, supported locales, and fallback rules
- [x] Decide the initial supported locales and fallback chain
- [x] Define how UI copy, labels, helper text, and validation messages are keyed and stored
- [x] Decide whether canonical game names stay source-accurate while UI chrome is localized
- [x] Document locale persistence and first-run default behavior
- [x] **Test:** verify locale configuration, fallback behavior, and persisted preference rules stay aligned with the documented contract
- [x] **QC (Automated):** automate QC coverage for default-locale and fallback-locale startup behavior

### Story 19.2 — Externalize user-facing application strings and formatting rules
- [x] Move app-shell strings, tab labels, onboarding copy, notifications, and modal copy behind locale resources
- [x] Localize number, date, and score formatting where appropriate
- [x] Keep IDs, exported schema fields, and canonical entity names stable where localization should not apply
- [x] Preserve accessible labels and semantic announcements across locales
- [x] **Test:** verify localized string lookup and formatting cover the main UI surfaces without breaking non-localized data
- [x] **QC (Automated):** automate QC coverage for representative screens rendered in at least two locales

### Story 19.3 — Add a language selector and persist the chosen locale
- [x] Add a locale-selection control in an appropriate persistent UI location
- [x] Save and load the selected locale from browser preferences
- [x] Apply the selected locale on startup without leaving mixed-language UI remnants
- [x] Keep the locale switch understandable on desktop and mobile layouts
- [x] **Test:** verify locale switching updates the rendered UI and persists across reloads
- [x] **QC (Automated):** automate QC coverage for switching locales and reloading the app

### Story 19.4 — Verify localized layouts remain readable and accessible
- [x] Audit buttons, cards, panels, toasts, and onboarding steps for longer translated copy
- [x] Prevent clipped labels, broken wrapping, and ambiguous icon-only states in supported locales
- [x] Preserve focus behavior, keyboard navigation, and semantic announcements after translation
- [x] Confirm translated empty states and errors remain actionable
- [x] **Test:** verify localized layouts tolerate representative long-copy strings and preserve accessibility-critical attributes
- [x] **QC (Automated):** automate QC coverage for desktop and mobile layouts in at least one long-text locale

### Story 19.5 — Establish translation maintenance and QA safeguards
- [x] Define how new strings are added without leaving untranslated gaps
- [x] Add consistency checks for missing translation keys or unexpected fallback churn
- [x] Document what content is intentionally not localized in v1 of the feature
- [x] Keep backup, history, and analytics behavior compatible with locale-aware rendering
- [x] **Test:** verify missing or malformed locale entries fail safely back to the default locale
- [x] **QC (Automated):** automate QC coverage for one incomplete locale pack and visible fallback behavior

## Epic 20 — History Grouping and Organization

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 20 work complete

### Story 20.1 — Define the grouping model and user-facing history contract
- [x] Decide which grouping modes are supported initially, such as mastermind, player count, play mode, or time period
- [x] Define the default grouping behavior and whether users can switch or disable grouping
- [x] Document how pending and completed results should appear inside grouped sections
- [x] Preserve clarity for duplicate mastermind names, legacy records, and sparse histories
- [x] **Test:** verify grouping definitions remain stable for representative mixed-history datasets
- [x] **QC (Automated):** automate QC coverage for the chosen default grouping on desktop and mobile

### Story 20.2 — Build grouped history derivations without breaking existing records
- [x] Add selectors or helpers that transform the flat newest-first history list into grouped sections
- [x] Keep within-group ordering deterministic and preserve the current record detail model
- [x] Ensure legacy records without newer metadata still group safely
- [x] Avoid duplicating records across groups unless explicitly designed
- [x] **Test:** verify grouped history derivations for mixed play modes, results, and legacy records
- [x] **QC (Automated):** automate QC coverage for one restored or legacy dataset rendered through the grouped view

### Story 20.3 — Render grouped history sections with clear navigation and collapse behavior
- [x] Add grouped section headers, counts, and collapse or expand affordances where appropriate
- [x] Keep individual game records readable within each group
- [x] Preserve responsive layout and keyboard accessibility for nested history interactions
- [x] Keep the ungrouped experience understandable if grouping is optional
- [x] **Test:** verify grouped rendering and expand-collapse behavior for short and long histories
- [x] **QC (Automated):** automate QC coverage for grouped history interaction on desktop and mobile viewports

### Story 20.4 — Support regrouping or filtering without breaking history actions
- [x] Add the chosen grouping or sorting controls to the History experience
- [x] Ensure result editing, record expansion, and navigation still target the correct game inside grouped views
- [x] Preserve newest-first expectations within the active grouping mode unless intentionally overridden
- [x] Keep controls understandable when the history is empty or lightly populated
- [x] **Test:** verify regrouping or filtering updates the rendered sections without breaking record actions
- [x] **QC (Automated):** automate QC coverage for changing grouping modes and editing a result inside a grouped section

### Story 20.5 — Keep grouped history compatible with insights, backup, and future exports
- [x] Confirm insights continue to derive from the underlying flat data rather than presentation-only grouping state
- [x] Keep backup and restore flows free of grouped UI-only state unless persistence is explicitly chosen
- [x] Document how grouping interacts with duplicate names, play modes, and localization-ready labels
- [x] Reserve room for future history filters without redesigning the grouped data model
- [x] **Test:** verify grouping state does not mutate persisted history records or backup payloads unintentionally
- [x] **QC (Automated):** automate QC coverage for grouped history after reload and after backup restore

## Epic 21 — Browse and Onboarding Detail Polish

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 21 work complete

### Story 21.1 — Move the onboarding walkthrough shell above the main tab content when it is visible
- [x] Move the onboarding shell above the tab-panel content in the main page flow
- [x] Keep first-run and replay behavior unchanged after the layout move
- [x] **Test:** verify the onboarding shell renders before the tab panels in the shipped shell structure
- [x] **QC (Automated):** automate QC coverage for first-launch onboarding placement in the browser

### Story 21.2 — Restructure the Browse page so the set-browsing section spans the full available width
- [x] Replace the Browse two-column section with stacked sections so the set browser can use the full row
- [x] Keep the Start here guidance visible without constraining the Browse sets panel width
- [x] Add stable test hooks for the revised Browse section structure
- [x] **Test:** verify the Browse renderer exposes the new stacked structure for the sets panel
- [x] **QC (Automated):** automate QC coverage for full-width Browse sets layout on desktop

### Story 21.3 — Remove low-value Browse summary metrics that do not help users act
- [x] Remove the Ready Tabs metric from the Browse hero summary cards
- [x] Keep the remaining summary metrics balanced after the removal
- [x] **Test:** verify the Browse renderer no longer ships the removed metric label
- [x] **QC (Automated):** automate QC coverage to confirm the removed metric is absent from the visible Browse UI

### Story 21.4 — Keep the revised Browse hierarchy readable and stable across supported viewports
- [x] Keep the stacked Browse sections aligned and readable on desktop and mobile layouts
- [x] Preserve replay walkthrough access and About entry points inside the revised Browse hierarchy
- [x] **Test:** verify the revised layout and shell structure remain aligned with the intended hierarchy
- [x] **QC (Automated):** automate QC coverage for viewport-stable Browse hierarchy and panel widths

### Story 21.5 — Align backlog and QC documentation with the polish changes once shipped
- [x] Add the new epic to the post-V1 backlog docs
- [x] Mark the matching `_next-steps.md` items complete
- [x] Document the required automated coverage for the new polish epic
- [x] **Test:** verify planning docs reference Epic 21 consistently
- [x] **QC (Automated):** automate QC coverage for doc-alignment checks that mention Epic 21

### Story 21.6 — Translate residual onboarding chrome that still falls back to English in supported locales
- [x] Identify onboarding labels or eyebrow copy that still fall back to English in shipped locales
- [x] Add translated onboarding eyebrow copy for each supported public locale
- [x] Verify the first-run walkthrough header stays localized after locale switching and reload
- [x] **Test:** verify supported locale resources include the onboarding eyebrow key without falling back to English
- [x] **QC (Automated):** automate QC coverage for the onboarding eyebrow rendered in at least two non-English locales

---

## Additional backlog candidates Approved

These epics are derived from the newly added unchecked items in `documentation/_next-steps.md` and are prepared for review before implementation starts.

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

---

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

---

## Epic 28 — SonarCloud Code Quality Remediation

### Story 28.1 — Mechanical Code Modernization
- [x] Replace `JSON.parse(JSON.stringify())` with `structuredClone()` in backup-utils.mjs, game-data-pipeline.mjs, setup-generator.mjs, state-store.mjs, and browser-entry.mjs
- [x] Replace `String#replace()` with `String#replaceAll()` in game-data-pipeline.mjs and localization-utils.mjs
- [x] Replace `arr[arr.length - n]` with `arr.at(-n)` in app-renderer.mjs and app-tabs.mjs
- [x] Replace `window.*` references with `globalThis.*` in browser-entry.mjs
- [x] Replace `.find()` used as existence check with `.some()` in app-renderer.mjs
- [x] Replace logical-AND guard chains with optional chaining (`?.`) in app-renderer.mjs, game-data-pipeline.mjs, localization-utils.mjs, and new-game-utils.mjs
- [x] **Test:** verify all mechanical replacements are functionally equivalent in the running application
- [x] **QC (Automated):** run the full regression suite to confirm no regressions

### Story 28.2 — Readability and Intentionality Fixes
- [x] Extract nested ternary operations in app-renderer.mjs (L261, L293, L537, L728, L897, L1265, L1280) into named variables or if/else blocks
- [x] Extract nested ternary operations in history-utils.mjs (L115, L124, L126) into named variables or if/else blocks
- [x] Extract nested ternary operation in setup-generator.mjs (L599) into a named variable
- [x] Extract nested ternary operation in setup-rules.mjs (L81) into a named variable
- [x] Invert negated conditions in browser-entry.mjs (L898) and app-renderer.mjs (L897) to put the positive branch first
- [x] Replace nested template literal in app-renderer.mjs (L1280) with an intermediate variable
- [x] Provide a meaningful error message in setup-generator.mjs (L648) where `throw new Error('')` uses an empty string
- [x] Convert promise-chain boot pattern in browser-entry.mjs to top-level await
- [x] **Test:** verify all structural changes preserve the same runtime output
- [x] **QC (Automated):** run the full regression suite to confirm no regressions

### Story 28.3 — Structural Refactors and Bug Fixes
- [x] Refactor `generateSetup` in setup-generator.mjs to reduce cognitive complexity from 44 to ≤15 by extracting helper functions
- [x] Refactor the history grouping function in history-utils.mjs to reduce cognitive complexity from 19 to ≤15
- [x] Refactor `sanitizePreferences` in state-store.mjs to reduce cognitive complexity from 16 to ≤15
- [x] Fix Bug in game-data-pipeline.mjs L140: collapse the three-branch ternary for `searchOrder` to two branches (the 'villains' and default branches were identical)
- [x] Fix Blocker in state-store.mjs: `updateGameResult` should return the original `state` unchanged when no matching record is found, rather than a needless deep clone
- [x] **Test:** verify all refactored functions produce identical runtime output to their predecessors
- [x] **QC (Automated):** run the full regression suite to confirm no regressions

---

## Epic 34 — History Grouping Expansion

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 34 work complete

### Story 34.1 — Define the five-mode grouping contract
- [x] Write the group key derivation rules for all five modes: mastermind (mastermindId), scheme (schemeId), heroes (each heroId), villains (each villainGroupId), player mode (play-mode label)
- [x] Document that heroes and villains produce one group entry per entity (multi-group membership)
- [x] Declare mastermind as the default grouping mode, replacing the removed `none` default
- [x] **Test:** verify the contract document specifies derivation rules for all five modes and multi-group semantics
- [x] **QC (Automated):** no automated check for documentation; confirm manually before Story 34.2 starts

### Story 34.2 — Add new grouping derivations to `history-utils.mjs`
- [x] Add `scheme` grouping: derive key from `record.setupSnapshot.schemeId`, resolve display name from the data bundle indexes
- [x] Add `heroes` grouping: derive one group entry per `heroId` in `setupSnapshot.heroIds`, resolve each display name
- [x] Add `villains` grouping: derive one group entry per `villainGroupId` in `setupSnapshot.villainGroupIds`, resolve each display name
- [x] Remove `player-count` from `HISTORY_GROUPING_MODES`
- [x] Remove `none` from `HISTORY_GROUPING_MODES`
- [x] Update `DEFAULT_HISTORY_GROUPING_MODE` to remain `'mastermind'`
- [x] **Test:** verify all five modes produce correct group keys; records with multiple heroes appear in multiple hero groups; records with multiple villain groups appear in multiple villain groups; `player-count` and `none` are no longer valid modes
- [x] **QC (Automated):** automate QC coverage that exercises all five grouping derivations with representative history records and asserts correct group membership

### Story 34.3 — Update History grouping UI controls
- [x] Update the grouping control in the History tab to present exactly five mode buttons: Mastermind, Scheme, Heroes, Villains, Player Mode
- [x] Remove any button or option for `player-count` or `none` from the rendered grouping UI
- [x] Verify selecting any mode immediately updates the displayed groups
- [x] **Test:** verify the rendered grouping control exposes exactly five modes and no others; selecting each mode changes the displayed content
- [x] **QC (Automated):** add browser QC that opens History, verifies five and only five grouping mode controls, and selects each mode to confirm a grouped view renders

### Story 34.4 — Localize all five grouping mode labels
- [x] Add or update localization keys in English for all five modes: Mastermind, Scheme, Heroes, Villains, Player Mode (`history.groupBy.mastermind`, `history.groupBy.scheme`, `history.groupBy.heroes`, `history.groupBy.villains`, `history.groupBy.playMode`)
- [x] Add or update the same keys in French
- [x] Remove or archive localization keys for `player-count` and `none` grouping modes if they existed
- [x] **Test:** verify all five grouping labels render in English and French without falling back; no untranslated string is visible in either locale
- [x] **QC (Automated):** add locale-switching QC that opens History in both locales and verifies all five grouping mode buttons display their translated labels

### Story 34.5 — Verify all five grouping modes with existing records
- [x] Test all five modes against real or representative history records
- [x] Confirm a record with three heroes appears in all three hero groups
- [x] Confirm a record with two villain groups appears in both groups
- [x] Confirm no record is silently omitted from a group it belongs to under any mode
- [x] **Test:** verify all five modes produce correct groupings for diverse representative setups; multi-entity records appear under all applicable groups
- [x] **QC (Automated):** run Playwright History tab QC exercising all five grouping modes with seeded data; assert correct group headings and record distribution
