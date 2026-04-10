# Testing and Quality Control Strategy

STATUS: Approved

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

The authoritative reference baseline for inventory and setup-rule verification is defined in `documentation/sources.md`.

---

## Quality policy

A story can move to **Done** only when all of the following are true:

1. the implementation task(s) for that story are complete,
2. the story's matching test task(s) are complete,
3. relevant automated QC coverage has been executed,
4. no blocking errors remain in edited files,
5. the behavior matches the approved specifications.

---

## Test pyramid for this project

Because the project is a static-hosted client app with shared JavaScript modules, testing will rely on a practical mix of:

### 1. Data and logic verification
Used for:
- normalization
- cross-reference validation
- setup generation
- legality checks
- selection priority
- persistence helpers

Preferred form:
- `node:test`-based module tests run locally through npm
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
- Playwright browser QC specs for stable user-visible flows
- targeted follow-up coverage only where automation is not yet practical

### 3. End-to-end scenario verification
Used for:
- full user flows from collection selection to accepted setup
- persistence across reloads
- reset flows
- legality errors
- least-played fallback

Preferred form:
- scripted Playwright walkthroughs with expected outcomes
- focused supplemental checks for any flows not yet automated

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
- all in-scope BGG-listed sets are present in normalized data

QC checks:
- included set counts and coverage match `documentation/game-data-normalized.md` and the BoardGameGeek references listed in `documentation/sources.md`
- normalization errors are understandable if thrown

---

## Epic 2 — State Management and Persistence

Required tests:
- default root state is valid
- load/save roundtrip preserves state correctly
- invalid stored set IDs are removed safely during hydration
- invalid or corrupted saved state falls back safely
- recovery notification behavior is triggered when corrupted state is recovered
- per-category resets clear only the intended usage data
- full reset clears collection, usage, history, and preferences

QC checks:
- reload page and confirm state persistence
- simulate missing storage support and verify graceful handling

Automated coverage:
- `test/playwright/epic2-qc.spec.mjs` covers persistence roundtrips, history rendering, reset behavior, and corrupted-state recovery

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
- manual comparison of representative special-rule setups against the BoardGameGeek card text reference

Automated coverage:
- `test/playwright/epic3-qc.spec.mjs` covers player-count requirements, thin-collection legality failures, scheme and mastermind edge cases, fallback messaging, ephemeral generate/regenerate behavior, and duplicate-name history rendering

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

Automated coverage:
- `test/playwright/epic4-qc.spec.mjs` covers responsive shell rendering, tab persistence, keyboard-only navigation, and visual primitive reuse checks

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

Automated coverage:
- `test/epic5-browse-extensions.test.mjs` covers browse filtering, alias search behavior, type metadata, and representative set counts
- `test/playwright/epic5-qc.spec.mjs` covers browse-grid rendering, detail expansion, type/search filtering, empty states, and ownership persistence from the Browse tab

---

## Epic 6 — Collection Management Experience

Required tests:
- grouped set rendering is correct
- collection changes stay synchronized across tabs
- totals update when ownership changes
- feasibility indicators react to collection changes

QC checks:
- verify warnings for thin/uneven collections

Automated coverage:
- `test/epic6-collection-management.test.mjs` covers type grouping, owned totals, feasibility indicators, and collection-only reset behavior
- `test/playwright/epic6-qc.spec.mjs` covers grouped collection rendering, cross-tab ownership sync, totals/feasibility updates, and reset confirmation behavior

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

Automated coverage:
- `test/epic7-new-game-experience.test.mjs` covers New Game control helpers, visible requirements, special-rule rendering inputs, and Accept & Log persistence behavior

---

## Epic 11 — Alternate Solo and Multiplayer Modes

Required tests:
- two-handed solo resolves to the documented setup counts
- play-mode controls update requirement messaging without breaking legacy Advanced Solo behavior
- accepted history records persist explicit play-mode metadata
- legacy history records without `playMode` still hydrate and render safely

QC checks:
- verify the New Game screen exposes clear mode selection for 1-player flows
- verify Two-Handed Solo shows the correct explanatory copy and setup counts
- verify accepted setups that differ only by play mode remain distinguishable in history

Automated coverage:
- `test/epic11-play-modes.test.mjs` covers the play-mode model, history compatibility, and helper behavior
- `test/playwright/epic11-qc.spec.mjs` covers mode selection, generated two-handed setups, and history rendering in the browser
- `test/playwright/epic7-qc.spec.mjs` covers player-count controls, displayed requirements, full result rendering, scheme/mastermind cues, regenerate ephemerality, and Accept & Log browser flows

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

Automated coverage:
- `test/epic8-history-usage-reset.test.mjs` covers usage indicators, readable history summaries, and reset preview/behavior logic
- `test/playwright/epic8-qc.spec.mjs` covers usage indicators, newest-first history rendering, expand/collapse behavior, per-category resets, and full reset confirmation flows

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

Automated coverage:
- `test/epic9-notifications-accessibility.test.mjs` covers toast helper behavior, invalid-request/fallback messaging inputs, degraded storage recovery, and shipped semantic markup plus focus styling
- `test/playwright/epic9-qc.spec.mjs` covers stacked toasts, targeted error/info/warning notification readability, degraded-mode storage behavior, and keyboard-only tab/modal flows

---

## Epic 10 — Final Documentation and Release Readiness

Required tests:
- README reflects actual implemented behavior
- documentation terminology matches implementation
- task list and story completion states are aligned

QC checks:
- final documentation review pass before completion

Automated coverage:
- `test/epic10-documentation-release-readiness.test.mjs` verifies README commands, architecture/data-model/setup-rules alignment with runtime symbols, Epic 10 task completion, and archival framing for planning-only docs
- `test/playwright/epic10-qc.spec.mjs` smoke-tests the documented launch → generate → accept → persist → reset flow against the shipped browser app

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
- the app runs as a static-served single page without server-side dependencies
- local persistence works across reloads
- reset flows and least-played fallback are verified through automated and logic-level coverage
- representative inventory and rule behaviors have been cross-checked against `documentation/sources.md`

Current automated browser QC command for Epic 1–10:
- `npm run check:qc`

Targeted Epic 9 browser QC command:
- `npm run check:qc:epic9`

Targeted Epic 10 browser QC command:
- `npm run check:qc:epic10`

