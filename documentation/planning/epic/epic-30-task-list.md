## Epic 30 — Data and State Layer Migration to Svelte 5

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 30 work complete

### Story 30.1 — Audit stateful modules and define reactive equivalents
- [x] List all stateful modules (`state-store.mjs`, reactive state exported from `app-renderer.mjs`, etc.)
- [x] Map each to its intended Svelte 5 reactive pattern (`$state`, `$derived`, context, props)
- [x] Document the audit findings as a short written note (comment, inline doc, or markdown note in the task list context)
- [x] **Test:** verify the audit document lists all state-bearing modules and each has a named Svelte 5 pattern assigned
- [x] **QC (Automated):** no automated check for a written audit; verify manually that the document is complete before proceeding

<!-- AUDIT NOTE — Story 30.1 (completed 2026-04-13)

Stateful module inventory for src/app/:

| Module                  | Holds mutable state?         | Svelte 5 reactive pattern                                                  |
|-------------------------|------------------------------|----------------------------------------------------------------------------|
| state-store.mjs         | YES — persisted app state    | Wrapped by state-store.svelte.js; _appState backed by $state               |
| browser-entry.mjs       | YES — runtime viewModel      | Epic 31: viewModel becomes $state in root App.svelte                        |
| app-renderer.mjs        | NO  — pure render functions  | Epic 31: replaced by Svelte component templates; no $state needed here      |
| feedback-utils.mjs      | NO  — pure toast utilities   | Remain as plain module; toast list lives in $state on parent component      |
| forced-picks-utils.mjs  | NO  — pure utilities         | Remain as plain module                                                      |
| history-utils.mjs       | NO  — pure formatting        | Remain as plain module; derived views use $derived                          |
| localization-utils.mjs  | NO  — pure locale factory    | Remain as plain module; active locale object becomes $derived from $state   |
| setup-generator.mjs     | NO  — pure computation       | Remain as plain module                                                      |
| backup-utils.mjs        | NO  — pure serialization     | Remain as plain module                                                      |
| new-game-utils.mjs      | NO  — pure computation       | Remain as plain module                                                      |
| browse-utils.mjs        | NO  — pure filtering         | Remain as plain module                                                      |
| collection-utils.mjs    | NO  — pure computation       | Remain as plain module                                                      |
| result-utils.mjs        | NO  — pure record helpers    | Remain as plain module                                                      |
| stats-utils.mjs         | NO  — pure dashboard builder | Remain as plain module; dashboard output becomes $derived                   |
| theme-utils.mjs         | NO  — pure lookups           | Remain as plain module; active theme becomes $derived from state.prefs      |
| app-tabs.mjs            | NO  — pure normalization     | Remain as plain module; selected-tab becomes $derived from state            |
| game-data-pipeline.mjs  | NO  — pure data processing   | Remain as plain module; bundle loaded once, passed via Svelte context       |

Summary:
- Only state-store.mjs requires a reactive wrapper (state-store.svelte.js).
- browser-entry.mjs mutable viewModel will migrate to $state inside App.svelte in Epic 31.
- All other modules are pure and require no reactive migration.
- game-data-pipeline.mjs has zero top-level side effects: audit confirmed clean (Story 30.3).
- STORAGE_KEY = 'legendary_state_v1' is unchanged; all persistence paths intact (Story 30.4).
-->


### Story 30.2 — Migrate `state-store.mjs` to Svelte 5 reactive stores
- [x] Replace exported setter-function patterns with `$state`-backed reactive objects where appropriate
- [x] Keep non-reactive utility functions (e.g. `createDefaultState`, `acceptGameSetup`) as plain module exports
- [x] Ensure `$state` declarations appear only inside `.svelte` component files or `.svelte.js`/`.svelte.ts` module files
- [x] **Test:** verify the state module exports reactive state and the existing state-store tests pass against the migrated module
- [x] **QC (Automated):** run `test/epic2-state.test.mjs` and related state tests and confirm zero failures

### Story 30.3 — Verify game-data-pipeline is free of conflicting side effects
- [x] Audit `game-data-pipeline.mjs` for top-level side effects (DOM writes, global state mutations, etc.)
- [x] Remove or guard any side effects that would conflict with Svelte's module system or SSR
- [x] Verify the pipeline module imports cleanly inside a `.svelte` component file
- [x] **Test:** verify `game-data-pipeline.mjs` can be imported in a test without triggering side effects
- [x] **QC (Automated):** confirm existing `test/epic1*.test.mjs` tests pass against the unchanged pipeline module

### Story 30.4 — Confirm all storage persistence paths survive intact
- [x] Perform a manual or automated round-trip: set collection → accept game → persist → simulate reload → verify localStorage keys
- [x] Run all backup and history tests to confirm no key is lost or renamed
- [x] **Test:** verify the localStorage round-trip test passes; `legendary_state_v1` key is present and correctly shaped after migration
- [x] **QC (Automated):** run `test/epic13-backup-portability.test.mjs` and confirm zero failures

### Story 30.5 — Validate all existing Node unit tests pass against the migrated state layer
- [x] Run the full `npm test` suite
- [x] Fix any test that fails specifically because of the state migration (not pre-existing failures)
- [x] **Test:** verify `npm test` exits with zero failures at this epic boundary
- [x] **QC (Automated):** run `npm test` and assert all tests pass; count must not decrease from the pre-migration baseline

---
