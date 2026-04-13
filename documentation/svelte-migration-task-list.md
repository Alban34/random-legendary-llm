# Svelte 5 Migration Task List

STATUS: Approved

## Purpose

This file is the working checklist for implementing the Svelte 5 migration backlog defined in `documentation/epics.md` (Epics 29–33).

Each story is broken into concrete implementation tasks and must also include test and QC coverage before it is considered complete.

**Completion rule:** a story is only considered **Done** when its:
- implementation tasks,
- **Test** task,
- and **QC** task

are all checked.

For all Svelte migration implementation work, completion also requires running the full automated regression suite and confirming it passes:
- `npm test`
- `npx playwright test`

See also: `documentation/epics.md` (Epics 29–33), `documentation/testing-qc-strategy.md`

---

## Epic 29 — Svelte 5 Build Tooling and Project Foundation

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 29 work complete

### Story 29.1 — Replace esbuild with Vite
- [x] Remove `tools/build.mjs` and install Vite + `@sveltejs/vite-plugin-svelte` as devDependencies
- [x] Create `vite.config.js` with the Svelte plugin and SPA output configuration
- [x] Update `package.json` `build` and `preview` scripts to use Vite
- [x] Verify `npm run build` produces an `index.html` and bundled assets in the output directory
- [x] **Test:** verify the Vite build output contains `index.html` and the bundled JS/CSS assets
- [x] **QC (Automated):** run `npm run build` in CI and assert exit code 0; check output directory structure

### Story 29.2 — Add Svelte 5 and configure runes mode
- [x] Add `svelte` and `@sveltejs/vite-plugin-svelte` to `devDependencies` only (not `dependencies`)
- [x] Create `svelte.config.js` with `compilerOptions: { runes: true }`
- [x] Confirm no Svelte runtime chunk appears in the production bundle output
- [x] **Test:** verify `svelte` is absent from `dependencies` in `package.json` and `svelte.config.js` enables runes mode
- [x] **QC (Automated):** inspect bundle output and assert no `svelte` runtime files are present

### Story 29.3 — Establish component directory structure
- [x] Create the `/src/components/` directory with a placeholder `App.svelte` component
- [x] Document the directory convention (component location, naming, import patterns) in a brief comment or README note
- [x] Verify the Svelte compiler resolves the placeholder component without errors
- [x] **Test:** verify the placeholder `.svelte` file can be compiled by the Vite build without errors
- [x] **QC (Automated):** run `npm run build` with the placeholder component included; assert zero Svelte compile errors

### Story 29.4 — Migrate custom dev server to Vite dev mode
- [x] Remove or archive `tools/dev-server.mjs`
- [x] Update the `dev` script in `package.json` to use `vite`
- [x] Verify `npm run dev` starts the Vite dev server and the app is reachable in a browser
- [x] **Test:** verify `package.json` `dev` script references Vite; `tools/dev-server.mjs` is removed or disabled
- [x] **QC (Automated):** run `npm run dev -- --port 3099` and assert the server starts without error (dry-run or timeout check acceptable)

### Story 29.5 — Confirm static build output has zero runtime dependencies
- [x] Run the Vite production build and inspect the bundle for Svelte runtime chunks
- [x] Document the pre-migration bundle size baseline in a comment or note
- [x] Assert the production bundle contains only compiled vanilla JS (no `svelte` library chunk)
- [x] **Test:** verify the production bundle artifacts contain no file matching `/svelte/` in their path or content
- [x] **QC (Automated):** add a build-output check that fails if a `svelte` runtime chunk is detected in the dist directory

### Story 29.6 — Verify ESLint and Playwright configurations resolve after tooling switch
- [x] Run `npm run lint` and confirm it exits without configuration errors
- [x] Run `npx playwright test` and confirm it exits without configuration errors related to the tooling change
- [x] Fix any import-resolution or path-alias issues introduced by the Vite migration
- [x] **Test:** verify `eslint.config.mjs` and `playwright.config.mjs` resolve correctly after Vite is configured
- [x] **QC (Automated):** run full `npm test` and `npx playwright test` and assert both exit cleanly at this epic boundary

---

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

## Epic 31 — UI Shell and Navigation Migration to Svelte Components

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 31 work complete

### Story 31.1 — Create root `App.svelte` and mount via Vite entry
- [x] Create `src/components/App.svelte` as the root component rendering the full app shell
- [x] Update the Vite entry point (`src/browser-entry.mjs` or equivalent) to mount `App.svelte` instead of calling DOM-manipulation functions
- [x] Remove or archive the shell-rendering code from `app-renderer.mjs` once replaced
- [x] **Test:** verify the app mounts from `App.svelte`; the rendered HTML matches the pre-migration shell structure
- [x] **QC (Automated):** run a Playwright smoke test confirming the page loads and the main shell is present in the DOM

### Story 31.2 — Convert tab navigation to `TabNav.svelte`
- [x] Create `src/components/TabNav.svelte` with `$state` reactive active-tab tracking
- [x] Preserve active-tab persistence and keyboard navigation behavior exactly
- [x] Remove the tab-rendering code from `app-renderer.mjs` once replaced
- [x] **Test:** verify tab switching works correctly and active-tab state persists across reloads in the browser
- [x] **QC (Automated):** run existing Playwright tab-navigation tests and confirm zero failures

### Story 31.3 — Convert shared UI primitives to individual Svelte components
- [x] Create individual `.svelte` files for buttons, cards, badges, and any other shared primitives
- [x] Match the visual output of each to its DOM-manipulation predecessor without CSS changes
- [x] **Test:** verify each primitive component renders the same HTML structure as the function it replaces
- [x] **QC (Automated):** run visual regression or snapshot comparison on shared primitives in browser QC

### Story 31.4 — Convert toast notification system to `ToastStack.svelte`
- [x] Create `src/components/ToastStack.svelte`
- [x] Preserve auto-dismiss timing, manual dismissal, ARIA roles, and stacking behavior
- [x] **Test:** verify toasts appear, stack, auto-dismiss, and can be dismissed manually in both themes
- [x] **QC (Automated):** run existing Playwright toast tests and confirm zero failures

### Story 31.5 — Verify the app shell is visually and behaviorally identical post-migration
- [x] Run side-by-side visual comparison of pre- and post-migration shell
- [x] Run the full `npx playwright test` suite and confirm zero failures
- [x] Document any minor cosmetic differences that are acceptable and intentional
- [x] **Test:** verify zero style or layout regressions are present after the shell migration
- [x] **QC (Automated):** run `npm test` and `npx playwright test` and confirm all pass at this epic boundary

---

## Epic 32 — Feature Tab Components Migration

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 32 work complete

### Story 32.1 — Convert Browse tab to `BrowseTab.svelte`
- [x] Create `src/components/BrowseTab.svelte` with reactive search filtering and ownership toggle state
- [ ] Remove or archive Browse-specific rendering functions from `app-renderer.mjs`
- [ ] **Test:** verify set grid renders, filtering works, and ownership toggles persist after the migration
- [ ] **QC (Automated):** run Playwright Browse tab tests and confirm zero failures

### Story 32.2 — Convert Collection tab to `CollectionTab.svelte`
- [x] Create `src/components/CollectionTab.svelte` with reactive ownership state mirroring Browse
- [x] Preserve category totals, capacity indicators, and collection reset with confirmation
- [ ] **Test:** verify ownership state mirrors Browse and collection reset works as before
- [ ] **QC (Automated):** run Playwright collection tab tests and confirm zero failures

### Story 32.3 — Convert New Game tab to `NewGameTab.svelte`
- [x] Create `src/components/NewGameTab.svelte` with reactive setup generation, player-count controls, and Accept & Log
- [x] Preserve Regenerate (ephemeral) and Accept & Log (committed) behavior exactly
- [ ] **Test:** verify setup generation, player count selection, and game logging work correctly after migration
- [ ] **QC (Automated):** run Playwright New Game tab tests and confirm zero failures

### Story 32.4 — Convert History tab to `HistoryTab.svelte`
- [x] Create `src/components/HistoryTab.svelte` with reactive record expansion and result editing
- [x] Preserve newest-first ordering and grouping controls
- [ ] **Test:** verify history renders in newest-first order and record editing actions remain functional
- [ ] **QC (Automated):** run Playwright History tab tests and confirm zero failures

### Story 32.5 — Convert Backup tab to `BackupTab.svelte`
- [x] Create `src/components/BackupTab.svelte` with reactive usage panels and collapsible sections (note: actual tab id is `backup`, not `stats`)
- [x] Preserve all reset actions and panel collapse behavior
- [ ] **Test:** verify backup/stats panels display correctly and reset actions work as before
- [ ] **QC (Automated):** run Playwright Stats/Backup tab tests and confirm zero failures

### Story 32.6 — Full Playwright suite confirmation after all tabs migrated
- [ ] Run `npx playwright test` with all feature tab components in place
- [ ] Fix any remaining selector or behavior regressions introduced by the migration
- [ ] **Test:** verify `npx playwright test` exits with zero failures after all six components are complete
- [ ] **QC (Automated):** run `npm test` and `npx playwright test` and assert both pass cleanly at the Epic 32 boundary

---

## Epic 33 — Test Suite Alignment for Svelte 5

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 33 work complete

### Story 33.1 — Audit test files for removed DOM-manipulation module imports
- [x] List every test file that imports a module removed or renamed during the migration
- [x] Record which test assertions depend on DOM structure that only the vanilla JS renderer produced
- [x] **Test:** verify the audit document is complete and every affected test file is identified
- [x] **QC (Automated):** no automated check for the audit document; verify manually before proceeding to Story 33.2

### Story 33.2 — Update or replace unit tests for migrated modules
- [x] For each test file identified in Story 33.1, update imports to reference the replacement Svelte component equivalents
- [x] Mount components in a test environment if needed; ensure all original assertions still pass
- [x] Verify total test count does not decrease from the pre-migration baseline
- [x] **Test:** verify all updated test files pass under `npm test` and the total test count is preserved
- [ ] **QC (Automated):** run `npm test` and assert zero failures and no reduction in total test count

### Story 33.3 — Verify Playwright specs target Svelte-rendered DOM
- [x] Audit Playwright selectors for any that rely on DOM structure produced only by the old vanilla JS renderer
- [x] Update those selectors to target the Svelte-rendered DOM equivalents
- [x] **Test:** verify all updated Playwright specs select elements that actually exist in the Svelte-rendered DOM
- [ ] **QC (Automated):** run `npx playwright test` and assert zero failures after the selector updates

### Story 33.4 — Confirm `npm test` exits with zero failures and no uncovered epic boundary
- [x] Run the full Node unit test suite
- [x] Confirm every epic boundary (epic1–epic34) has at least one test file exercising it
- [x] **Test:** verify `npm test` exits with zero failures; no epic boundary is silently uncovered
- [ ] **QC (Automated):** run `npm test` and assert exit code 0 and full coverage across all registered epic boundaries

### Story 33.5 — Document the updated test strategy for Svelte component testing
- [x] Update `documentation/testing-qc-strategy.md` to describe how unit tests interact with Svelte components
- [x] Explain how Playwright exercises the compiled component output vs the old DOM-manipulation output
- [x] **Test:** verify `documentation/testing-qc-strategy.md` mentions Svelte component test mounting and compiled-output QC
- [ ] **QC (Automated):** extend documentation checks to confirm testing-qc-strategy.md is updated if the project uses doc-contract checks
