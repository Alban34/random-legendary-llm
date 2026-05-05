# Epic 95 — Test Coverage Improvement: Task List

## Story 95.1 — Audit coverage gaps by module using the SonarCloud coverage report and define a target threshold

- [x] Run `npm test -- --coverage` locally and capture the full coverage report output
- [x] Open the SonarCloud project dashboard and navigate to the Coverage measure report
- [x] Cross-reference the local Vitest coverage output with the SonarCloud coverage view to identify discrepancies
- [x] List every module under `src/app/`, `src/components/`, and `src/data/` that has line coverage below 80%, recording the exact coverage percentage for each
- [x] For each under-covered module, note whether the gap is caused by missing tests entirely or by partially tested branches
- [x] Identify modules with zero coverage (no test file exists at all) and flag them separately
- [x] Agree on and document the numeric coverage target threshold (e.g., ≥ 80% line and branch coverage per module)
- [x] Write the full coverage audit to `documentation/planning/epic/epic-95-coverage-audit.md`, listing each under-covered module, its current coverage percentage, gap type (no tests / partial), and the agreed threshold
- [x] Review the audit document for completeness and confirm all under-covered modules are represented
- [x] Test: N/A (no code changes in this story)
- [x] QC (Automated): N/A (no code changes in this story)

---

## Story 95.2 — Add unit tests for untested or partially tested utility and helper functions

- [x] Read `documentation/planning/epic/epic-95-coverage-audit.md` and extract the list of utility and helper function files below the agreed threshold
- [x] Enumerate the specific untested or partially tested files, starting with those that have zero coverage: `src/app/collection-actions.ts`, `src/app/feedback-utils.ts`, `src/app/modal-utils.ts`, `src/app/object-utils.ts`
- [x] For each zero-coverage utility file, identify all exported functions and the input/output contract for each
- [x] Write Vitest unit tests for `src/app/collection-actions.ts`, covering all exported functions and their edge cases
- [x] Write Vitest unit tests for `src/app/feedback-utils.ts`, covering all exported functions and their edge cases
- [x] Write Vitest unit tests for `src/app/modal-utils.ts`, covering all exported functions and their edge cases
- [x] Write Vitest unit tests for `src/app/object-utils.ts`, covering all exported functions and their edge cases
- [x] Review the audit for any additional partially covered utility files (e.g., `src/app/app-renderer.ts`, `src/app/app-tabs.ts`, `src/app/localization-utils.ts`) and add missing branch coverage tests for each
- [x] After each file's tests are written, run coverage locally and confirm that file's line and branch coverage meets or exceeds the agreed threshold
- [x] Ensure no production code is modified solely to improve testability (changes must also be quality improvements)
- [x] Test: Run `npm test` and confirm all unit tests pass with no regressions
- [x] QC (Automated): Run `npm run lint` and confirm no lint errors; run `npm test` and confirm full test suite passes

---

## Story 95.3 — Add unit tests for untested or partially tested Svelte components and view-models

- [x] Read `documentation/planning/epic/epic-95-coverage-audit.md` and extract the list of Svelte component and view-model files below the agreed threshold
- [x] Enumerate the specific untested files: `src/components/ModalRoot.svelte`, `src/components/OnboardingShell.svelte`, `src/components/TabNav.svelte`, `src/components/ToastStack.svelte`
- [x] Enumerate the untested view-model files: `src/app/backup-vm.svelte.ts`, `src/app/browse-vm.svelte.ts`, `src/app/history-vm.svelte.ts`, `src/app/import-vm.svelte.ts`
- [x] For each untested Svelte component, identify the props, slots, events, and conditional rendering branches to cover
- [x] Write Vitest + `@testing-library/svelte` unit tests for `src/components/ModalRoot.svelte`, covering render and conditional display logic
- [x] Write Vitest unit tests for `src/components/OnboardingShell.svelte`, covering render states and slot content
- [x] Write Vitest unit tests for `src/components/TabNav.svelte`, covering tab rendering, active state, and keyboard/click interaction
- [x] Write Vitest unit tests for `src/components/ToastStack.svelte`, covering toast display, stacking, and dismissal logic
- [x] Write Vitest unit tests for `src/app/backup-vm.svelte.ts`, covering all exported state and action logic
- [x] Write Vitest unit tests for `src/app/browse-vm.svelte.ts`, covering all exported state and action logic
- [x] Write Vitest unit tests for `src/app/history-vm.svelte.ts`, covering all exported state and action logic
- [x] Write Vitest unit tests for `src/app/import-vm.svelte.ts`, covering all exported state and action logic
- [x] Review the audit for any additional partially covered component files and add missing branch coverage tests for each
- [x] After each file's tests are written, run coverage locally and confirm that file's line and branch coverage meets or exceeds the agreed threshold
- [x] Test: Run `npm test` and confirm all unit tests pass with no regressions
- [x] QC (Automated): Run `npm run lint` and confirm no lint errors; run `npm test` and confirm full test suite passes

---

## Story 95.4 — Add unit tests for untested or partially tested stores and app-init logic

- [x] Read `documentation/planning/epic/epic-95-coverage-audit.md` and extract the list of store and app-init files below the agreed threshold
- [x] Enumerate the specific untested files: `src/app/app-init.ts`, `src/app/browser-entry.ts`
- [x] Review `src/app/state-store.svelte.ts` and `src/app/state-store.ts` for any branches not yet covered by `src/app/state-store.test.ts`
- [x] For `src/app/app-init.ts`: identify all initialization paths, side effects, and error branches
- [x] Write Vitest unit tests for `src/app/app-init.ts`, mocking browser APIs and store dependencies as needed, covering the main initialization path and error/fallback branches
- [x] Assess `src/app/browser-entry.ts` for testable logic and write unit tests if meaningful coverage is achievable; document a skip rationale if the file is a pure entry-point with no testable logic
- [x] Add missing branch coverage tests to `src/app/state-store.test.ts` for any uncovered branches identified in the audit
- [x] After each file's tests are written, run coverage locally and confirm that file's line and branch coverage meets or exceeds the agreed threshold
- [x] Ensure no production code is modified solely to improve testability (changes must also be quality improvements)
- [x] Test: Run `npm test` and confirm all unit tests pass with no regressions
- [x] QC (Automated): Run `npm run lint` and confirm no lint errors; run `npm test` and confirm full test suite passes

---

## Story 95.5 — Verify overall SonarCloud coverage meets the agreed target threshold

- [ ] Trigger a SonarCloud analysis run on the updated codebase (via CI pipeline or manual scan)
- [ ] Open the SonarCloud project dashboard and read the `coverage` measure
- [ ] Confirm the `coverage` measure meets or exceeds the agreed numeric threshold documented in the audit
- [ ] If the measure is still below the threshold, identify the remaining under-covered modules from the SonarCloud report and route them back to the appropriate story (95.2, 95.3, or 95.4) for remediation
- [ ] Confirm no regression in any test suite by reviewing CI run results
- [ ] Record the final `coverage` value in the audit document as the closed metric
