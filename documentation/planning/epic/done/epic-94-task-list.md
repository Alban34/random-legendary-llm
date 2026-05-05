# Epic 94 — Code Duplication Reduction: Task List

## Story 94.1 — Audit all files flagged by SonarCloud and produce a prioritized deduplication inventory

- [x] Open the SonarCloud project dashboard and navigate to the Duplication measure report
- [x] Record every file flagged as containing duplicated blocks, noting the file path, duplicate block size, and number of duplicated lines
- [x] For each flagged block, identify the counterpart file(s) where the duplication is mirrored
- [x] Categorize each duplicated block by type: TypeScript logic, Svelte markup, or shared CSS/style
- [x] Sort the inventory by severity and impact (largest block size / most duplicated lines first)
- [x] Write the full prioritized audit inventory to `documentation/planning/epic/epic-94-duplication-inventory.md`, including file, block description, line count, type, and priority
- [x] Review the inventory for completeness and confirm all SonarCloud-flagged items are represented
- [x] Test: N/A (no code changes in this story)
- [x] QC (Automated): N/A (no code changes in this story)

---

## Story 94.2 — Extract repeated TypeScript logic into shared utility or helper functions

- [x] Read the audit inventory and list all TypeScript-level duplicated blocks in priority order
- [x] For each TS duplicated block: identify the exact logic being repeated and all files containing it
- [x] Create or extend an appropriate shared utility or helper module under `src/` for each extracted block
- [x] Move the duplicated logic into the shared helper, preserving the original function signature and behavior
- [x] Update every call site across the codebase to import and use the new shared helper
- [x] Remove the now-redundant inline copies from each original file
- [x] Verify no TypeScript compilation errors after each extraction (`tsc --noEmit` or equivalent)
- [x] Confirm existing unit tests covering affected files still pass after each extraction
- [x] Add new unit tests for any extracted helper that is not yet covered
- [x] Cross-check that the SonarCloud-flagged TS blocks are no longer present after all extractions
- [x] Test: Run `npm test` and confirm all unit tests pass with no regressions
- [x] QC (Automated): Run `npm run lint` and confirm no lint errors; run `npm test` and confirm full test suite passes

---

## Story 94.3 — Refactor repeated Svelte markup and style patterns into reusable components or shared CSS

- [x] Read the audit inventory and list all Svelte markup and CSS/style duplicated blocks in priority order
- [x] For each duplicated Svelte markup block: determine whether extraction into a new shared component or an existing component is appropriate
- [x] Create new shared Svelte component(s) under `src/components/` for each extracted markup pattern
- [x] Move the duplicated markup and any tightly coupled logic into the new shared component(s)
- [x] Update every usage site to import and render the new shared component in place of the inline markup
- [x] For each duplicated CSS/style block: identify the shared semantic meaning and create a shared CSS class or custom property in the appropriate stylesheet
- [x] Replace all inline duplicate style declarations with the new shared CSS class or custom property reference
- [x] Remove all now-redundant inline markup and style copies from the original files
- [x] Verify no TypeScript or Svelte compilation errors after each extraction
- [x] Do a visual review of each affected view/page to confirm rendered output is unchanged
- [x] Cross-check that the SonarCloud-flagged Svelte/CSS blocks are no longer present after all extractions
- [x] Test: Run `npm test` and confirm all unit tests pass with no regressions
- [x] QC (Automated): Run `npm run lint` and confirm no lint errors; run `npm test` and confirm full test suite passes; confirm visual output is unchanged via snapshot or manual comparison

---

## Story 94.4 — Confirm SonarCloud duplication density falls below 1% after all refactors land

- [ ] Trigger a SonarCloud analysis run on the updated codebase (via CI pipeline or manual scan)
- [ ] Open the SonarCloud project dashboard and read the `duplicated_lines_density` measure
- [ ] Confirm the measure reads below 1%
- [ ] If the measure is still at or above 1%, identify the remaining flagged blocks and route them back to the appropriate story (94.2 or 94.3) for remediation
- [ ] Confirm no regression in any test suite by reviewing CI run results
- [ ] Record the final `duplicated_lines_density` value in the audit inventory document as the closed metric
- [x] Test: Confirm `npm test` passes cleanly on the final branch with no regressions
- [ ] QC (Automated): Run `npm run lint` and `npm test`; verify SonarCloud `duplicated_lines_density` < 1%; confirm no new SonarCloud issues introduced
