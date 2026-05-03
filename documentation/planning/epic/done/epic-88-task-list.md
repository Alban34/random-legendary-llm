# Epic 88 Task List

**Epic:** E2E Test Organisation: Feature-Named Files and Unified npm Script  
**Objective:** Rename every Playwright spec file under `test/playwright/` to a feature-keyed name, update all `test.describe` labels and cross-file imports to match, replace per-epic npm scripts with a single `e2e` command and a targeted-filter option, and verify the full suite passes with no test-count regression.

---

### Story 88.1 — Audit all Playwright spec files and produce a feature-keyed rename mapping

**Acceptance Criteria:** A mapping note lists every old spec filename and its new feature-keyed target name before any renaming begins.

#### Rename mapping table

| Old filename | Feature exercised | New filename |
|---|---|---|
| `test/playwright/epic1-qc.spec.ts` | Browse set inventory and about panel | `test/playwright/browse-set-inventory.spec.ts` |
| `test/playwright/epic2-qc.spec.ts` | Collection ownership persistence across reloads | `test/playwright/collection-persistence.spec.ts` |
| `test/playwright/epic3-qc.spec.ts` | Setup requirements display across player modes | `test/playwright/setup-player-mode-requirements.spec.ts` |
| `test/playwright/epic4-qc.spec.ts` | Responsive shell layout at desktop and mobile widths | `test/playwright/responsive-shell.spec.ts` |
| `test/playwright/epic5-qc.spec.ts` | Browse grid rendered from normalised data | `test/playwright/browse-grid.spec.ts` |
| `test/playwright/epic6-qc.spec.ts` | Collection tab with set-type grouped rows | `test/playwright/collection-tab.spec.ts` |
| `test/playwright/epic7-qc.spec.ts` | Fresh-picks / least-played randomiser weighting | `test/playwright/fresh-picks-weighting.spec.ts` |
| `test/playwright/epic8-qc.spec.ts` | Game history summaries and usage indicators | `test/playwright/game-history-summaries.spec.ts` |
| `test/playwright/epic9-qc.spec.ts` | Toast notification stack, cap, and dismissal | `test/playwright/toast-stack.spec.ts` |
| `test/playwright/epic10-qc.spec.ts` | End-to-end release user flow from launch to reset | `test/playwright/end-to-end-user-flow.spec.ts` |
| `test/playwright/epic11-qc.spec.ts` | Solo mode controls and Two-Handed Solo play mode | `test/playwright/solo-mode-controls.spec.ts` |
| `test/playwright/epic12-qc.spec.ts` | Result score entry after accepting a generated setup | `test/playwright/result-score-entry.spec.ts` |
| `test/playwright/epic13-qc.spec.ts` | Backup export and import | `test/playwright/backup-export-import.spec.ts` |
| `test/playwright/epic14-qc.spec.ts` | History insights with sparse data copy | `test/playwright/history-insights.spec.ts` |
| `test/playwright/epic15-qc.spec.ts` | Forced picks panel (add, review, remove, clear) | `test/playwright/forced-picks.spec.ts` |
| `test/playwright/epic16-qc.spec.ts` | Generator toast suppression and inline fallback messaging | `test/playwright/generator-toast-suppression.spec.ts` |
| `test/playwright/epic17-qc.spec.ts` | Onboarding walkthrough (first launch, skip, replay) | `test/playwright/onboarding-walkthrough.spec.ts` |
| `test/playwright/epic18-qc.spec.ts` | Theme switching, persistence, and contrast ratios | `test/playwright/theme-switching.spec.ts` |
| `test/playwright/epic19-qc.spec.ts` | Locale switching and persistence | `test/playwright/locale-switching.spec.ts` |
| `test/playwright/epic20-qc.spec.ts` | History grouping by mastermind | `test/playwright/history-grouping-mastermind.spec.ts` |
| `test/playwright/epic21-qc.spec.ts` | Onboarding overlay layout position above tab content | `test/playwright/onboarding-overlay-layout.spec.ts` |
| `test/playwright/epic22-qc.spec.ts` | Browse type filter (Base Game / expansion type) | `test/playwright/browse-type-filter.spec.ts` |
| `test/playwright/epic23-qc.spec.ts` | History per-category stats panels | `test/playwright/history-stats-panels.spec.ts` |
| `test/playwright/epic24-qc.spec.ts` | Toast silence on theme and locale changes | `test/playwright/toast-theme-locale-silence.spec.ts` |
| `test/playwright/epic25-qc.spec.ts` | Header and new game action density refinement | `test/playwright/header-action-density.spec.ts` |
| `test/playwright/epic34-qc.spec.ts` | History grouping expansion (grouped detail rows) | `test/playwright/history-grouping-expansion.spec.ts` |
| `test/playwright/epic37-qc.spec.ts` | Localisation coverage, score display, and version badge | `test/playwright/localization.spec.ts` |
| `test/playwright/epic40-qc.spec.ts` | PWA installability | `test/playwright/pwa-installability.spec.ts` |
| `test/playwright/epic40-production.spec.ts` | PWA installability (production build only) | `test/playwright/pwa-installability-production.spec.ts` |
| `test/playwright/epic44-card-browser.spec.ts` | Card browser | `test/playwright/card-browser.spec.ts` |
| `test/playwright/epic46-active-filter.spec.ts` | Expansion active-filter panel and feasibility warning | `test/playwright/expansion-active-filter.spec.ts` |
| `test/playwright/epic47-history-outcome-filter.spec.ts` | History outcome filter | `test/playwright/history-outcome-filter.spec.ts` |
| `test/playwright/epic49-clear-selection.spec.ts` | Expansion clear-selection action | `test/playwright/expansion-clear-selection.spec.ts` |
| `test/playwright/epic53-qc.spec.ts` | Standard-solo scheme ineligibility in forced-selection UI | `test/playwright/solo-scheme-ineligibility.spec.ts` |
| `test/playwright/epic70-qc.spec.ts` | Preferred expansion priority (story 70.4 UI) | `test/playwright/preferred-expansion-priority.spec.ts` |
| `test/playwright/epic71-qc.spec.ts` | Epic Mastermind toggle and history grouping mode indicator | `test/playwright/epic-mastermind-toggle.spec.ts` |

#### Tasks

- [x] Record the mapping table above (already captured in this task list) and confirm the count: **36 spec files** identified under `test/playwright/` (excluding `helpers/`)
- [x] Verify no spec file has been overlooked by running `ls test/playwright/*.spec.ts | wc -l` and comparing with 36
- [x] Confirm no two new names collide — check the "New filename" column for duplicates before proceeding

**Test:** Manually review the mapping table; ensure old-to-new pairs are unambiguous and descriptive, and that every file currently under `test/playwright/` is accounted for.

---

### Story 88.2 — Rename every spec file under `test/playwright/` to its feature-keyed target name

**Acceptance Criteria:** No file under `test/playwright/` is named after an epic (e.g. no `epic-*.spec.ts`); all spec files use descriptive, feature-keyed names.

#### Tasks

- [x] Rename `test/playwright/epic1-qc.spec.ts` → `test/playwright/browse-set-inventory.spec.ts`
- [x] Rename `test/playwright/epic2-qc.spec.ts` → `test/playwright/collection-persistence.spec.ts`
- [x] Rename `test/playwright/epic3-qc.spec.ts` → `test/playwright/setup-player-mode-requirements.spec.ts`
- [x] Rename `test/playwright/epic4-qc.spec.ts` → `test/playwright/responsive-shell.spec.ts`
- [x] Rename `test/playwright/epic5-qc.spec.ts` → `test/playwright/browse-grid.spec.ts`
- [x] Rename `test/playwright/epic6-qc.spec.ts` → `test/playwright/collection-tab.spec.ts`
- [x] Rename `test/playwright/epic7-qc.spec.ts` → `test/playwright/fresh-picks-weighting.spec.ts`
- [x] Rename `test/playwright/epic8-qc.spec.ts` → `test/playwright/game-history-summaries.spec.ts`
- [x] Rename `test/playwright/epic9-qc.spec.ts` → `test/playwright/toast-stack.spec.ts`
- [x] Rename `test/playwright/epic10-qc.spec.ts` → `test/playwright/end-to-end-user-flow.spec.ts`
- [x] Rename `test/playwright/epic11-qc.spec.ts` → `test/playwright/solo-mode-controls.spec.ts`
- [x] Rename `test/playwright/epic12-qc.spec.ts` → `test/playwright/result-score-entry.spec.ts`
- [x] Rename `test/playwright/epic13-qc.spec.ts` → `test/playwright/backup-export-import.spec.ts`
- [x] Rename `test/playwright/epic14-qc.spec.ts` → `test/playwright/history-insights.spec.ts`
- [x] Rename `test/playwright/epic15-qc.spec.ts` → `test/playwright/forced-picks.spec.ts`
- [x] Rename `test/playwright/epic16-qc.spec.ts` → `test/playwright/generator-toast-suppression.spec.ts`
- [x] Rename `test/playwright/epic17-qc.spec.ts` → `test/playwright/onboarding-walkthrough.spec.ts`
- [x] Rename `test/playwright/epic18-qc.spec.ts` → `test/playwright/theme-switching.spec.ts`
- [x] Rename `test/playwright/epic19-qc.spec.ts` → `test/playwright/locale-switching.spec.ts`
- [x] Rename `test/playwright/epic20-qc.spec.ts` → `test/playwright/history-grouping-mastermind.spec.ts`
- [x] Rename `test/playwright/epic21-qc.spec.ts` → `test/playwright/onboarding-overlay-layout.spec.ts`
- [x] Rename `test/playwright/epic22-qc.spec.ts` → `test/playwright/browse-type-filter.spec.ts`
- [x] Rename `test/playwright/epic23-qc.spec.ts` → `test/playwright/history-stats-panels.spec.ts`
- [x] Rename `test/playwright/epic24-qc.spec.ts` → `test/playwright/toast-theme-locale-silence.spec.ts`
- [x] Rename `test/playwright/epic25-qc.spec.ts` → `test/playwright/header-action-density.spec.ts`
- [x] Rename `test/playwright/epic34-qc.spec.ts` → `test/playwright/history-grouping-expansion.spec.ts`
- [x] Rename `test/playwright/epic37-qc.spec.ts` → `test/playwright/localization.spec.ts`
- [x] Rename `test/playwright/epic40-qc.spec.ts` → `test/playwright/pwa-installability.spec.ts`
- [x] Rename `test/playwright/epic40-production.spec.ts` → `test/playwright/pwa-installability-production.spec.ts`
- [x] Rename `test/playwright/epic44-card-browser.spec.ts` → `test/playwright/card-browser.spec.ts`
- [x] Rename `test/playwright/epic46-active-filter.spec.ts` → `test/playwright/expansion-active-filter.spec.ts`
- [x] Rename `test/playwright/epic47-history-outcome-filter.spec.ts` → `test/playwright/history-outcome-filter.spec.ts`
- [x] Rename `test/playwright/epic49-clear-selection.spec.ts` → `test/playwright/expansion-clear-selection.spec.ts`
- [x] Rename `test/playwright/epic53-qc.spec.ts` → `test/playwright/solo-scheme-ineligibility.spec.ts`
- [x] Rename `test/playwright/epic70-qc.spec.ts` → `test/playwright/preferred-expansion-priority.spec.ts`
- [x] Rename `test/playwright/epic71-qc.spec.ts` → `test/playwright/epic-mastermind-toggle.spec.ts`
- [x] After all renames, verify `ls test/playwright/epic*.spec.ts` returns no results

**Test:** Confirm `ls test/playwright/*.spec.ts` lists exactly 36 files and none match the pattern `epic*.spec.ts`.

---

### Story 88.3 — Update all `test.describe` labels and cross-file imports to use the new feature-keyed names

**Acceptance Criteria:** All `test.describe` block labels and any cross-file imports reference feature names, not epic numbers; `npm run lint` passes.

#### Tasks

- [x] In `test/playwright/browse-set-inventory.spec.ts`: change `test.describe('Epic 1 automated QC', ...)` → `test.describe('Browse: set inventory and about panel', ...)`
- [x] In `test/playwright/collection-persistence.spec.ts`: change `test.describe('Epic 2 automated QC', ...)` → `test.describe('Collection: ownership persistence across reloads', ...)`
- [x] In `test/playwright/setup-player-mode-requirements.spec.ts`: change `test.describe('Epic 3 automated QC', ...)` → `test.describe('Setup: player-mode requirement display', ...)`
- [x] In `test/playwright/responsive-shell.spec.ts`: change `test.describe('Epic 4 automated QC', ...)` → `test.describe('Responsive shell: desktop and mobile layout', ...)`
- [x] In `test/playwright/browse-grid.spec.ts`: change `test.describe('Epic 5 automated QC', ...)` → `test.describe('Browse: grid rendered from normalised data', ...)`
- [x] In `test/playwright/collection-tab.spec.ts`: change `test.describe('Epic 6 automated QC', ...)` → `test.describe('Collection: set-type grouped rows', ...)`
- [x] In `test/playwright/fresh-picks-weighting.spec.ts`: change `test.describe('Epic 7 automated QC', ...)` → `test.describe('Randomiser: fresh-picks / least-played weighting', ...)`
- [x] In `test/playwright/game-history-summaries.spec.ts`: change `test.describe('Epic 8 automated QC', ...)` → `test.describe('History: accepted game summaries and usage indicators', ...)`
- [x] In `test/playwright/toast-stack.spec.ts`: change `test.describe('Epic 9 automated QC', ...)` → `test.describe('Toasts: stack, cap, and dismissal', ...)`
- [x] In `test/playwright/end-to-end-user-flow.spec.ts`: change `test.describe('Epic 10 automated QC', ...)` → `test.describe('End-to-end: release-ready user flow', ...)`
- [x] In `test/playwright/solo-mode-controls.spec.ts`: change `test.describe('Epic 11 automated QC', ...)` → `test.describe('Solo mode: controls and Two-Handed Solo play mode', ...)`
- [x] In `test/playwright/result-score-entry.spec.ts`: change `test.describe('Epic 12 automated QC', ...)` → `test.describe('Result entry: score form after accepting a setup', ...)`
- [x] In `test/playwright/backup-export-import.spec.ts`: change `test.describe('Epic 13 automated QC', ...)` → `test.describe('Backup: export and import', ...)`
- [x] In `test/playwright/history-insights.spec.ts`: change `test.describe('Epic 14 automated QC', ...)` → `test.describe('History: insights with sparse data copy', ...)`
- [x] In `test/playwright/forced-picks.spec.ts`: change `test.describe('Epic 15 automated QC', ...)` → `test.describe('Forced picks: add, review, remove, and clear', ...)`
- [x] In `test/playwright/generator-toast-suppression.spec.ts`: change `test.describe('Epic 16 automated QC', ...)` → `test.describe('Generator: toast suppression and inline fallback messaging', ...)`
- [x] In `test/playwright/onboarding-walkthrough.spec.ts`: change `test.describe('Epic 17 automated QC', ...)` → `test.describe('Onboarding: walkthrough first launch, skip, and replay', ...)`
- [x] In `test/playwright/theme-switching.spec.ts`: change `test.describe('Epic 18 automated QC', ...)` → `test.describe('Theme: switching, persistence, and contrast ratios', ...)`
- [x] In `test/playwright/locale-switching.spec.ts`: change `test.describe('Epic 19 automated QC', ...)` → `test.describe('Locale: switching and persistence', ...)`
- [x] In `test/playwright/history-grouping-mastermind.spec.ts`: change `test.describe('Epic 20 automated QC', ...)` → `test.describe('History: grouping by mastermind', ...)`
- [x] In `test/playwright/onboarding-overlay-layout.spec.ts`: change `test.describe('Epic 21 automated QC', ...)` → `test.describe('Onboarding: overlay layout above tab content', ...)`
- [x] In `test/playwright/browse-type-filter.spec.ts`: change `test.describe('Epic 22 automated QC', ...)` → `test.describe('Browse: type filter (base game / expansion)', ...)`
- [x] In `test/playwright/history-stats-panels.spec.ts`: change `test.describe('Epic 23 automated QC', ...)` → `test.describe('History: per-category stats panels', ...)`
- [x] In `test/playwright/toast-theme-locale-silence.spec.ts`: leave existing label `'Epic 24 — Toast Behavior and Feedback Channel Cleanup'` → change to `'Toasts: silenced on theme and locale changes'`
- [x] In `test/playwright/header-action-density.spec.ts`: leave existing label `'Epic 25 — Header and New Game Action Density Refinement'` → change to `'Header: action density refinement'`
- [x] In `test/playwright/history-grouping-expansion.spec.ts`: leave existing label `'Epic 34 automated QC — History Grouping Expansion'` → change to `'History: grouping expansion (detail rows)'`
- [x] In `test/playwright/localization.spec.ts`: update all `test.describe` labels that reference "Epic 37" — e.g. `'Epic 37 automated QC'` → `'Localisation'`, `'Epic 37 Story 37.1 QC: locale coverage'` → `'Localisation: locale coverage'`, `'Epic 37 Story 37.2 QC: score display locale-aware'` → `'Localisation: locale-aware score display'`, `'Epic 37 Story 37.4 QC: version badge'` → `'Localisation: version badge'`
- [x] In `test/playwright/pwa-installability.spec.ts`: leave existing label `'Epic 40 — PWA Installability'` → change to `'PWA installability'`
- [x] In `test/playwright/pwa-installability-production.spec.ts`: leave existing label `'Epic 40 — PWA Installability (production-only)'` → change to `'PWA installability: production build'`
- [x] In `test/playwright/card-browser.spec.ts`: leave existing label `'Epic 44: Card Browser'` → change to `'Card browser'`
- [x] In `test/playwright/expansion-active-filter.spec.ts`: update all `test.describe` labels that reference "Epic 46" — `'Epic 46 Story 46.3: expansion subset selector panel'` → `'Expansion filter: subset selector panel'`; `'Epic 46 Story 46.4: feasibility warning and Generate button gating'` → `'Expansion filter: feasibility warning and generate gating'`
- [x] In `test/playwright/history-outcome-filter.spec.ts`: leave existing label `'Epic 47: History Outcome Filter'` → change to `'History: outcome filter'`
- [x] In `test/playwright/expansion-clear-selection.spec.ts`: leave existing label `'Epic 49: Clear selection unchecks all expansion checkboxes'` → change to `'Expansion filter: clear selection unchecks all checkboxes'`
- [x] In `test/playwright/solo-scheme-ineligibility.spec.ts`: leave existing label `'Epic 53 Story 2: Enforce standard-solo scheme ineligibility in forced-selection UI'` → change to `'Forced picks: standard-solo scheme ineligibility'`
- [x] In `test/playwright/preferred-expansion-priority.spec.ts`: leave existing label `'Epic 70 — Preferred Expansion Priority (Story 70.4 UI)'` → change to `'Expansion filter: preferred expansion priority UI'`
- [x] In `test/playwright/epic-mastermind-toggle.spec.ts`: update all `test.describe` labels that reference "Epic 71" — `'Epic 71.3 — Epic Mastermind toggle in New Game tab'` → `'New Game: Epic Mastermind toggle'`; `'Epic 71.5 — History indicator and grouping mode'` → `'History: grouping mode indicator'`
- [x] Audit all renamed files for any remaining references to `epic` numbers in `test.describe` strings and eliminate them
- [x] Confirm no spec file imports from another spec file (verified in audit: all spec-to-spec imports are absent; only `./helpers/app-fixture.ts` is imported across all files — no cross-file import updates are required)

**Test:** Run `npm run lint` locally and confirm zero errors; do a workspace-wide grep for `'Epic [0-9]` inside `test/playwright/*.spec.ts` and confirm zero matches.

---

### Story 88.4 — Replace per-epic npm scripts with a single `e2e` script and a targeted-filter option in `package.json`

**Acceptance Criteria:** `package.json` contains a single `e2e` script that runs all Playwright specs (e.g. `npx playwright test`); a second script (e.g. `e2e:filter`) accepts a `--grep` or file-path argument for targeted execution; no per-epic scripts remain.

#### Per-epic scripts to remove from `package.json`

The following scripts must be deleted:

| Script key | Current command |
|---|---|
| `test:qc:epic9` | `playwright test ./test/playwright/epic9-qc.spec.ts` |
| `test:qc:epic10` | `playwright test ./test/playwright/epic10-qc.spec.ts` |
| `test:qc:epic12` | `playwright test ./test/playwright/epic12-qc.spec.ts` |
| `test:qc:epic13` | `playwright test ./test/playwright/epic13-qc.spec.ts` |
| `test:qc:epic14` | `playwright test ./test/playwright/epic14-qc.spec.ts` |
| `test:qc:epic18` | `playwright test ./test/playwright/epic18-qc.spec.ts` |
| `test:qc:epic19` | `playwright test ./test/playwright/epic19-qc.spec.ts` |
| `test:qc:epic20` | `playwright test ./test/playwright/epic20-qc.spec.ts` |
| `test:qc:epic40` | `playwright test ./test/playwright/epic40-qc.spec.ts` |

#### Tasks

- [x] In `package.json`, add `"e2e": "npx playwright test"` to the `scripts` block
- [x] In `package.json`, add `"e2e:filter": "npx playwright test --grep"` to the `scripts` block (callers append the grep pattern or file path as extra arguments, e.g. `npm run e2e:filter -- history`)
- [x] In `package.json`, remove `test:qc:epic9`
- [x] In `package.json`, remove `test:qc:epic10`
- [x] In `package.json`, remove `test:qc:epic12`
- [x] In `package.json`, remove `test:qc:epic13`
- [x] In `package.json`, remove `test:qc:epic14`
- [x] In `package.json`, remove `test:qc:epic18`
- [x] In `package.json`, remove `test:qc:epic19`
- [x] In `package.json`, remove `test:qc:epic20`
- [x] In `package.json`, remove `test:qc:epic40`
- [x] Verify that `test:qc:headed` and `test:qc` (if still needed for internal use) are either retained with a decision or removed if superseded by `e2e`
- [x] Confirm no remaining script value in `package.json` references an `epic*.spec.ts` filename

**Test:** Run `npm run e2e -- --list` (dry-run) and confirm it discovers all 36 renamed spec files; run `npm run e2e:filter -- "PWA installability"` and confirm only the PWA specs are collected.

---

### Story 88.5 — Verify the full e2e suite passes after all renames with no test-count regression

**Acceptance Criteria:** Running `npm run e2e` executes all renamed specs and all pass; the passing test count equals the pre-refactor count.

#### Tasks

- [x] Before starting the rename work (Story 88.2), record the pre-refactor passing test count by running `npm run test:qc` and noting the total tests passed _(implementation agent did not run pre-refactor baseline; QC agent will record actual count from `npm run e2e`)_
- [ ] After completing Stories 88.2–88.4, run `npm run e2e` and confirm the total passing test count matches the pre-refactor count recorded above
- [ ] Confirm zero skipped or failing tests attributable to the renaming (file-not-found errors, broken `test.describe` references, or missing helpers)
- [ ] If a count discrepancy is found, identify whether a file was missed in the rename mapping (Story 88.1) and remediate

**Test:** `npm run e2e` completes with all tests passing and the test count equals the pre-refactor baseline.

---

### Story 88.6 — QC (Automated)

**Acceptance Criteria:** Run `npm run lint` then the full e2e suite; all checks pass with no regressions.

- [ ] **QC gate:** Run `npm run lint` — must pass with zero errors before proceeding to e2e execution
- [ ] **QC gate:** Run `npm run e2e` — all renamed specs must pass; test count must equal the pre-refactor baseline recorded in Story 88.5
- [ ] Report any lint or test failures back to the implementation owner with the exact error output
