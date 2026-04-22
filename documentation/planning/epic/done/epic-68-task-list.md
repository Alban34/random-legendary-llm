# Epic 68 — Test Runner Upgrade, Type Coverage & 2.0.0 Release

## Story 1 — Add `tsx` as a dev dependency and update all `test:*` npm scripts to use the TypeScript-aware runner

- [x] Run `npm install --save-dev tsx` to add `tsx` to `devDependencies` in `package.json`
- [x] Verify `tsx` appears under `devDependencies` in `package.json` after install
- [x] Check whether `svelte-check` is already in `devDependencies` (it should have been added by Epic 61); if absent, run `npm install --save-dev svelte-check` to add it
- [x] Check whether `"lint"` in `package.json` already includes `svelte-check --tsconfig ./tsconfig.json`; if the script is still `"eslint src/"` only, update it to `"eslint src/ && svelte-check --tsconfig ./tsconfig.json"`
- [x] In `package.json`, update the `"test"` script from `node --test ./test/*.test.mjs` to `node --import tsx/esm --test ./test/*.test.mjs`
- [x] Update `"test:epic1"` from `node --test ./test/epic1.test.mjs` to `node --import tsx/esm --test ./test/epic1.test.mjs`
- [x] Update `"test:epic2"` from `node --test ./test/epic2-state.test.mjs` to `node --import tsx/esm --test ./test/epic2-state.test.mjs`
- [x] Update `"test:epic3"` from `node --test ./test/epic3-setup-generator.test.mjs` to `node --import tsx/esm --test ./test/epic3-setup-generator.test.mjs`
- [x] Update `"test:epic4"` from `node --test ./test/epic4-shell-navigation.test.mjs` to `node --import tsx/esm --test ./test/epic4-shell-navigation.test.mjs`
- [x] Update `"test:epic5"` from `node --test ./test/epic5-browse-extensions.test.mjs` to `node --import tsx/esm --test ./test/epic5-browse-extensions.test.mjs`
- [x] Update `"test:epic6"` from `node --test ./test/epic6-collection-management.test.mjs` to `node --import tsx/esm --test ./test/epic6-collection-management.test.mjs`
- [x] Update `"test:epic7"` from `node --test ./test/epic7-new-game-experience.test.mjs` to `node --import tsx/esm --test ./test/epic7-new-game-experience.test.mjs`
- [x] Update `"test:epic8"` from `node --test ./test/epic8-history-usage-reset.test.mjs` to `node --import tsx/esm --test ./test/epic8-history-usage-reset.test.mjs`
- [x] Update `"test:epic9"` from `node --test ./test/epic9-notifications-accessibility.test.mjs` to `node --import tsx/esm --test ./test/epic9-notifications-accessibility.test.mjs`
- [x] Update `"test:epic12"` from `node --test ./test/epic12-score-history.test.mjs` to `node --import tsx/esm --test ./test/epic12-score-history.test.mjs`
- [x] Update `"test:epic13"` from `node --test ./test/epic13-backup-portability.test.mjs` to `node --import tsx/esm --test ./test/epic13-backup-portability.test.mjs`
- [x] Update `"test:epic14"` from `node --test ./test/epic14-stats-dashboard.test.mjs` to `node --import tsx/esm --test ./test/epic14-stats-dashboard.test.mjs`
- [x] Update `"test:epic18"` from `node --test ./test/epic18-theme-personalization.test.mjs` to `node --import tsx/esm --test ./test/epic18-theme-personalization.test.mjs`
- [x] Update `"test:epic19"` from `node --test ./test/epic19-localization.test.mjs` to `node --import tsx/esm --test ./test/epic19-localization.test.mjs`
- [x] Update `"test:epic20"` from `node --test ./test/epic20-history-grouping.test.mjs` to `node --import tsx/esm --test ./test/epic20-history-grouping.test.mjs`
- [x] Update `"test:coverage"` from `c8 --reporter=lcov --report-dir=coverage node --test ./test/*.test.mjs` to `c8 --reporter=lcov --report-dir=coverage node --import tsx/esm --test ./test/*.test.mjs`
- [x] Confirm that all `test:qc`, `test:qc:epic9`, `test:qc:epic10`, `test:qc:epic12`, `test:qc:epic13`, `test:qc:epic14`, `test:qc:epic18`, `test:qc:epic19`, `test:qc:epic20`, `test:qc:epic40`, and `test:qc:headed` scripts are left unchanged (they invoke `playwright test`, not `node --test`)
- [x] **Test**: Run `npm run test:epic1` from the command line and confirm the process starts without `ERR_MODULE_NOT_FOUND` or `tsx` resolution errors (import path errors are expected until Story 2 is complete; the goal here is only to confirm the runner itself loads)
- [x] **QC (Automated)**: Run `npm run lint` and confirm exit 0 — BLOCKED: pre-existing `no-unused-vars` errors in `App.svelte`, `TabNav.svelte`, `ToastStack.svelte` (introduced in Epics 61–67, not caused by Epic 68); requires `Epic Frontend Expert` pass to resolve

---

## Story 2 — Update all import paths in test files from `.mjs` to `.ts` for every migrated source module

- [x] Run `grep -rn "from '.*\.mjs'" test/` to produce a baseline list of all `.mjs` import paths across the 42 test files; save the output for reference
- [x] Update all `.mjs` → `.ts` import paths in `test/design-system-epic1-foundation.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/design-system-rollout.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic-ux6-backup-safety.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic1.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic11-play-modes.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic12-score-history.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic13-backup-portability.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic14-stats-dashboard.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic15-forced-picks.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic16-notification-refinements.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic17-onboarding-information-architecture.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic18-theme-personalization.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic19-localization.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic2-state.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic20-history-grouping.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic21-browse-polish.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic22-catalog-ordering.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic23-stats-simplification.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic24-toast-behavior.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic25-header-new-game.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic26-classification-corrections.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic27-shell-debug-polish.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic3-setup-generator.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic34-history-grouping.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic36-version-storage-disclosure.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic37-small-improvements.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic4-shell-navigation.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic42-bgg-import.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic43-expansion-attribution.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic44-card-browser.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic45-myludo-import.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic46-active-filter.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic47-history-outcome-filter.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic5-browse-extensions.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic53-solo-scheme-eligibility.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic56-standard-v2-solo.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic57-solo-rules-panel.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic6-collection-management.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic60-sets-browser-sort.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic7-new-game-experience.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic8-history-usage-reset.test.mjs`
- [x] Update all `.mjs` → `.ts` import paths in `test/epic9-notifications-accessibility.test.mjs`
- [x] Run `grep -rn "from '.*src.*\.mjs'" test/` and confirm zero matches remain (no residual `.mjs` source imports)
- [x] Run `npm run test:epic1` and confirm no `ERR_MODULE_NOT_FOUND` errors appear for any source module import
- [x] **Test**: Run `npm run test:epic1` through `npm run test:epic9` individually and confirm each resolves all imports without error; spot-check `npm run test:epic42`, `npm run test:epic44`, and `npm run test:epic57` which import several distinct source modules
- [x] **QC (Automated)**: Run `npm run lint` and confirm exit 0 — BLOCKED: same pre-existing lint errors as Story 1

---

## Story 3 — Verify the full test suite passes with the new runner (gate: QC agent runs `npm test`)

- [x] Confirm Stories 1 and 2 are both marked complete before triggering this gate
- [x] Confirm that `node --import tsx/esm --test` is present in every `node --test`-based script in `package.json` (cross-check the full `"scripts"` block)
- [x] Confirm that no test file in `test/` contains a remaining import path ending in `.mjs` for a source module under `src/`
- [x] Confirm that `"test:coverage"` script uses `node --import tsx/esm --test` so that the `code-analysis` CI job continues to produce a valid LCOV report for SonarCloud
- [x] **Test**: Run `npm run test:coverage` locally and confirm the `coverage/lcov.info` file is produced and non-empty
- [x] **QC (Automated)**: QC agent runs `npm test`; all tests must pass with exit code 0

---

## Story 4 — Bump `package.json` version to `2.0.0` and update architecture documentation and release notes

- [x] In `package.json`, change `"version": "1.0.4"` to `"version": "2.0.0"`
- [x] In `documentation/architecture/overview.md`, update the "Current shipped implementation snapshot" entry for `src/app/backup-utils.mjs` → `src/app/backup-utils.ts`
- [x] Update the entry for `src/app/collection-utils.mjs` → `src/app/collection-utils.ts`
- [x] Update the entry for `src/app/localization-utils.mjs` → `src/app/localization-utils.ts`
- [x] Update the entry for `src/app/myludo-import-utils.mjs` → `src/app/myludo-import-utils.ts`
- [x] Update the entry for `src/app/bgg-import-utils.mjs` → `src/app/bgg-import-utils.ts`
- [x] Update the entry for `src/app/theme-utils.mjs` → `src/app/theme-utils.ts`
- [x] Update the entry for `src/app/browser-entry.mjs` → `src/app/browser-entry.ts`
- [x] Update the entry for `src/app/game-data-pipeline.mjs` → `src/app/game-data-pipeline.ts`
- [x] Update the entry for `src/app/state-store.mjs` → `src/app/state-store.ts`
- [x] Update the entry for `src/app/object-utils.mjs` → `src/app/object-utils.ts`
- [x] Update the entry for `src/app/history-utils.mjs` → `src/app/history-utils.ts`
- [x] Update the entries for `src/app/setup-rules.mjs` and `src/app/setup-generator.mjs` → `src/app/setup-rules.ts` and `src/app/setup-generator.ts`
- [x] Update the entry for `src/app/solo-rules.mjs` → `src/app/solo-rules.ts`
- [x] Update the entry for `src/app/app-renderer.mjs` → `src/app/app-renderer.ts`
- [x] Update the entry for `src/app/focus-utils.mjs` → `src/app/focus-utils.ts`
- [x] Update the locale file entries `src/app/locales/en.mjs`, `fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, `es.mjs` → `en.ts`, `fr.ts`, `de.ts`, `ja.ts`, `ko.ts`, `es.ts`
- [x] In the "Recommended physical split" section of `documentation/architecture/overview.md`, change `src/app/*.mjs` to `src/app/*.ts` to reflect the TypeScript migration
- [x] Update `documentation/README.md` to note that the 2.0.0 baseline uses TypeScript for all runtime source modules (add a sentence or bullet under the stack/tooling section describing the migration completed in Epics 61–68)
- [x] Create `documentation/release-notes/2.0.0.md` following the format established by `v1.0.4-release-notes.md`: include a `# Legendary: Marvel Randomizer — v2.0.0 Release Notes` heading, a released date, the fan-made disclaimer, the "What is this?" boilerplate, and a "What's in v2.0.0" section documenting the TypeScript migration as the primary change (full source migration from `.mjs` to `.ts`, `tsx` test runner, `svelte-check` type gate in lint, and no user-facing data schema changes)
- [x] **Test**: Run `npm run build` and inspect the generated output in `dist/` to confirm the bundle is produced without errors and the app version string `2.0.0` appears in the build output or asset filenames as expected by the Vite config
- [x] **QC (Automated)**: Run `npm run lint` and confirm exit 0; run `npm run build` and confirm exit 0
