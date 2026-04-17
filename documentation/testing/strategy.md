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

The authoritative reference baseline for inventory and setup-rule verification is defined in `data/sources.md`.

---

## Quality policy

A story can move to **Done** only when all of the following are true:

1. the implementation task(s) for that story are complete,
2. the story's matching test task(s) are complete,
3. relevant automated QC coverage has been executed,
4. no blocking errors remain in edited files,
5. the behavior matches the approved specifications.

Additional workflow rules for implementation epics:

6. if the implemented story changed files under `/src`, run the story-specific automated checks needed to satisfy that story's documented **Test** and **QC** tasks,
7. if the completed epic changed files under `/src`, run the full regression suite before marking the epic complete,
8. documentation-only, planning-only, prompt-only, or agent-only changes that do not modify `/src` do not require the full regression suite.

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

When a story changes files under `/src`, its **QC** task should be satisfied through targeted automated checks that are appropriate for that story's scope.

When the epic containing that story changes files under `/src`, the epic is not complete until the full regression suite also passes.

---

## Design System Epic DS1 — Design Token Foundation and Theme Contract

Automated verification: `test/design-system-epic1-foundation.test.mjs`

Browser QC: `test/playwright/epic18-qc.spec.mjs`

---

## Design System Epic DS2 — Typography, Layout, and Shell Rhythm

Automated verification: `test/design-system-rollout.test.mjs`

Browser QC: `test/playwright/epic18-qc.spec.mjs`

---

## Epic 10 — Final Documentation and Release Readiness

Automated verification: `test/epic10-documentation-release-readiness.test.mjs`

Browser QC: `test/playwright/epic10-qc.spec.mjs`

Current automated browser QC command for Epic 1–10:

```
npm run check:qc:epic10
```

---

## Epic 43 — Expansion Attribution in History

Automated verification: `test/epic43-expansion-attribution.test.mjs`

---

## Epic 45 — MyLudo Collection Import

Automated verification: `test/epic45-myludo-import.test.mjs`

Covers: `parseMyludoFile`, `matchMyludoNamesToSets`, `mergeOwnedSets` (via `collection-utils.mjs`), CollectionTab import panel rendering, post-import summary, and dismiss flow. All 23 tests pass.

---

## Epic 44 — Card Browser by Category or Expansion in Collection

Automated verification: `test/epic44-card-browser.test.mjs`

Browser QC: `test/playwright/epic44-card-browser.spec.mjs`

Covers: `CARD_CATEGORIES`, `getCardsByCategory`, `getCardsByExpansion` (via `collection-utils.mjs`), `CardBrowserByCategory.svelte`, `CardBrowserByExpansion.svelte`, the "Sets" / "Browse Cards" view toggle in `CollectionTab.svelte`, the "By Category" / "By Expansion" grouping selector, session-scoped grouping persistence, and `aria-pressed` state on all toggle controls.

---

## Epic 49 — Clear Selection Regression Fix & E2E Guard

Browser QC: `test/playwright/epic49-clear-selection.spec.mjs`

Covers: 4 Playwright tests guarding the "Clear selection" button behaviour in the Active Expansions panel on the New Game tab. Verifies that clicking "Clear selection" sets `activeSetIds` to `[]` in persisted state (not `null`) and that all expansion checkboxes render as unchecked; also verifies that "Use all expansions" restores the `null` state with all checkboxes checked. The existing `test/playwright/epic46-active-filter.spec.mjs` was also updated to align with the corrected `deactivateAllSets` action.
