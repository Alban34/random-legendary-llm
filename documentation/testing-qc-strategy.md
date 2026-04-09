# Testing and Quality Control Strategy

STATUS: In Review

## Purpose

This document defines how implementation quality will be verified.

Its core rule is:

> **No story is considered done until its corresponding tests and QC checks are completed.**

This applies to:
- data normalization,
- state management,
- setup generation,
- UI behavior,
- persistence,
- accessibility,
- and documentation consistency.

---

## Quality policy

A story can move to **Done** only when all of the following are true:

1. the implementation task(s) for that story are complete,
2. the story's matching test task(s) are complete,
3. relevant manual QC checks have been executed,
4. no blocking errors remain in edited files,
5. the behavior matches the approved specifications.

---

## Test pyramid for this project

Because the project is a single HTML file with embedded JavaScript, testing will rely on a practical mix of:

### 1. Data and logic verification
Used for:
- normalization
- cross-reference validation
- setup generation
- legality checks
- selection priority
- persistence helpers

Preferred form:
- pure-function test harness embedded or run locally
- deterministic sample inputs / expected outputs

### 2. UI behavior verification
Used for:
- tab switching
- collection toggling
- generated result rendering
- history rendering
- reset behavior
- notifications and modals

Preferred form:
- manual scenario checklist
- optional lightweight browser test harness if practical

### 3. End-to-end scenario verification
Used for:
- full user flows from collection selection to accepted setup
- persistence across reloads
- reset flows
- legality errors
- least-played fallback

Preferred form:
- scripted manual walkthroughs with expected outcomes

---

## Story-level Definition of Done

Every story must satisfy this Definition of Done:

- implementation tasks checked
- matching **Test** task checked
- matching **QC** task checked
- any discovered defect fixed or explicitly deferred
- task list updated accordingly

---

## Required test categories by epic

## Epic 1 — Data Foundation and Normalization

Required tests:
- IDs are unique across all included entities
- duplicate display names remain distinct by ID
- Mastermind leads resolve to valid entity IDs
- Scheme forced groups resolve to valid entity IDs
- excluded sets are not present in normalized data

QC checks:
- included set counts match `documentation/game-data-normalized.md`
- normalization errors are understandable if thrown

---

## Epic 2 — State Management and Persistence

Required tests:
- default root state is valid
- load/save roundtrip preserves state correctly
- invalid or corrupted saved state falls back safely
- per-category resets clear only the intended usage data
- full reset clears collection, usage, history, and preferences

QC checks:
- reload page and confirm state persistence
- simulate missing storage support and verify graceful handling

---

## Epic 3 — Setup Generation Engine

Required tests:
- each player-count template returns the correct slot counts
- Advanced Solo applies only to 1-player mode
- illegal collections are rejected with correct error reasons
- Mastermind leads consume the proper villain/henchman slot
- Scheme constraints and modifiers affect setup correctly
- never-played items are preferred first
- least-played fallback is used when fresh pool is insufficient
- `lastPlayedAt` resolves ties before random selection
- Generate/Regenerate do not mutate persisted usage/history
- Accept & Log updates usage and history

QC checks:
- walkthrough of at least one setup for each supported player count
- walkthrough of a fallback scenario where no fully fresh setup is possible

---

## Epic 4 — Application Shell and Navigation

Required tests:
- tabs switch correctly
- active panel visibility is correct
- selected-tab persistence works if implemented

QC checks:
- desktop layout check
- mobile layout check
- keyboard navigation through tabs

---

## Epic 5 — Browse Extensions Experience

Required tests:
- set cards render from data correctly
- expand/collapse detail works
- search filters correctly
- type filters correctly
- ownership toggles persist correctly

QC checks:
- spot-check displayed counts and contents against approved data docs

---

## Epic 6 — Collection Management Experience

Required tests:
- grouped set rendering is correct
- collection changes stay synchronized across tabs
- totals update when ownership changes
- feasibility indicators react to collection changes

QC checks:
- verify warnings for thin/uneven collections

---

## Epic 7 — New Game Setup Experience

Required tests:
- player-count controls update setup requirements correctly
- result view renders every selected category correctly
- forced groups and notes are visibly marked
- Regenerate leaves usage/history unchanged
- Accept & Log persists accepted setup correctly

QC checks:
- verify result clarity for both normal and edge-case setups

---

## Epic 8 — History, Usage, and Reset Experience

Required tests:
- history renders newest-first
- history items expand/collapse correctly
- usage indicators reflect actual usage stats
- per-category reset updates indicators immediately
- full reset clears the visible UI state correctly

QC checks:
- verify history labels remain clear with duplicate character names

---

## Epic 9 — Notifications, Error Handling, and Accessibility

Required tests:
- toast variants render and dismiss correctly
- validation errors do not break the page
- storage warnings appear in degraded mode
- keyboard interaction works for modal and tabs
- visual state is understandable without color only

QC checks:
- focus visibility review
- semantic/ARIA spot check

---

## Epic 10 — Final Documentation and Release Readiness

Required tests:
- README reflects actual implemented behavior
- documentation terminology matches implementation
- task list and story completion states are aligned

QC checks:
- final documentation review pass before completion

---

## Traceability rule

Each story in `documentation/task-list.md` must contain:
- at least one **implementation** task,
- one **Test** task,
- and one **QC** task.

If a story does not yet have those three elements, it is **not ready to be marked done**.

---

## Minimum execution standard during implementation

For every file edited during implementation:
- run file-level diagnostics,
- run story-relevant test scenarios,
- verify no regressions in impacted flows.

For every completed epic:
- run a short regression pass on previously completed user flows.

---

## Release readiness checklist

Before implementation is considered complete:
- all stories in `documentation/task-list.md` have checked implementation, test, and QC items
- no approved-scope story is left partially verified
- root `README.md` matches the shipped behavior
- the app runs as a single page without external dependencies
- local persistence works across reloads
- reset flows and least-played fallback are verified manually and logically
