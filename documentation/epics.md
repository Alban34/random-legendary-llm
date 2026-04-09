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
- embedded canonical source data
- normalized IDs
- resolved Mastermind leads
- normalized Scheme rules
- flattened runtime indexes
- validation of source references

**Stories**
1. **Embed canonical game data in the single-page application**
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
Build the single-page shell, tab navigation, layout system, and shared UI infrastructure.

**In scope**
- HTML shell
- tabbed navigation
- responsive layout
- design tokens
- shared buttons/cards/badges
- empty states and panel layout

**Stories**
1. **Create the base HTML application shell**
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
2. **Document how to open and use the single-file app**
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
| Milestone 9 — Documentation Finalization | Epic 10 |
