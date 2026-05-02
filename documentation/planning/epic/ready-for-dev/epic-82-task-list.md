# Epic 82 — Co-locate Unit Tests with Their Source Modules

## Context

All 49 Vitest unit test files currently live in `test/` and are named after epics
(`epic3-setup-generator.test.ts`, etc.).  
The goal is to rename every file to a module-keyed name and physically move it next to its source
module so that coverage gaps are immediately visible (e.g. `browse-utils.ts` → `src/app/browse-utils.test.ts`).

The `test/playwright/` subtree (E2E specs) is **out of scope** for this epic.

---

## Pre-flight: record baseline

- [ ] Run `npm test` before touching any file and record the total number of passing tests as the
  pre-refactor baseline (used in Story 82.5).

---

## Story 82.1 — Audit: full mapping of current test files to target module-keyed names

### Tasks

- [ ] Confirm that each import in the table below still resolves to the correct path by grepping for
  the function names listed in the "Primary functions tested" column.

- [ ] Confirm that no test file in `test/` (excluding `test/playwright/`) is missing from the table.

### Complete mapping

#### Simple renames — one test file maps to exactly one target module

| Current file | Primary source module | Primary functions / symbols tested | Target path |
|---|---|---|---|
| `test/epic1.test.ts` | `src/app/game-data-pipeline.ts` | `buildCanonicalSourceData`, `createEpic1Bundle`, `normalizeGameData`, `validateNormalizedData` | `src/app/game-data-pipeline.test.ts` |
| `test/epic2-state.test.ts` | `src/app/state-store.ts` | `STORAGE_KEY`, `USAGE_CATEGORIES`, `acceptGameSetup`, `createDefaultState`, `createStorageAdapter`, `loadState`, `resetAllState`, `resetUsageCategory`, `saveState`, `toggleOwnedSet`, `updateState` | `src/app/state-store.test.ts` |
| `test/epic4-shell-navigation.test.ts` | `src/app/app-tabs.ts` | `APP_TABS`, `DEFAULT_TAB_ID`, `getAdjacentTabId`, `normalizeSelectedTab` | `src/app/app-tabs.test.ts` |
| `test/epic5-browse-extensions.test.ts` | `src/app/browse-utils.ts` | `filterBrowseSets`, `getBrowseTypeLabel`, `matchesBrowseSearch`, `summarizeBrowseSet` | `src/app/browse-utils.test.ts` |
| `test/epic6-collection-management.test.ts` | `src/app/collection-utils.ts` | `COLLECTION_FEASIBILITY_MODES`, `COLLECTION_TYPE_GROUPS`, `getCollectionFeasibility`, `groupSetsByType`, `summarizeOwnedCollection` | `src/app/collection-utils.test.ts` |
| `test/epic7-new-game-experience.test.ts` | `src/app/new-game-utils.ts` | `formatHeroTeamLabel`, `formatMastermindLeadLabel`, `getDisplayedSetupRequirements`, `isAdvancedSoloAvailable` | `src/app/new-game-utils.test.ts` |
| `test/epic8-history-usage-reset.test.ts` | `src/app/history-utils.ts` | `buildFullResetPreview`, `formatHistorySummary`, `summarizeUsageIndicators` | `src/app/history-utils.test.ts` |
| `test/epic12-score-history.test.ts` | `src/app/result-utils.ts` | `GAME_OUTCOME_OPTIONS`, `createCompletedGameResult`, `createPerPlayerScoreArray`, `createPlayerScoreEntry`, `formatGameResultStatus`, `normalizeGameResultDraft`, `sanitizeStoredGameResult`, `validateGameResultDraft` | `src/app/result-utils.test.ts` |
| `test/epic13-backup-portability.test.ts` | `src/app/backup-utils.ts` | `BACKUP_SCHEMA_ID`, `BACKUP_SCHEMA_VERSION`, `buildBackupFilename`, `createBackupPayload`, `mergeImportedState`, `parseBackupPayload`, `parseBackupText`, `summarizeBackupState` | `src/app/backup-utils.test.ts` |
| `test/epic14-stats-dashboard.test.ts` | `src/app/stats-utils.ts` | `buildInsightsDashboard`, `buildOutcomeInsights`, `buildUsageInsights` | `src/app/stats-utils.test.ts` |
| `test/epic18-theme-personalization.test.ts` | `src/app/theme-utils.ts` | `DEFAULT_THEME_ID`, `THEME_OPTIONS`, `getThemeDefinition`, `normalizeThemeId` | `src/app/theme-utils.test.ts` |
| `test/epic19-localization.test.ts` | `src/app/localization-utils.ts` | `DEFAULT_LOCALE_ID`, `createLocaleTools`, `getSelectableLocales`, `normalizeLocaleId` | `src/app/localization-utils.test.ts` |
| `test/epic24-toast-behavior.test.ts` | `src/app/preferences-actions.ts` | `setTheme` (no-toast contract), `setLocale` (toast contract) | `src/app/preferences-actions.test.ts` |
| `test/epic42-bgg-import.test.ts` | `src/app/bgg-import-utils.ts` | `fetchBggCollection`, `matchBggNamesToSets` | `src/app/bgg-import-utils.test.ts` |
| `test/epic45-myludo-import.test.ts` | `src/app/myludo-import-utils.ts` | `parseMyludoFile`, `matchMyludoNamesToSets` | `src/app/myludo-import-utils.test.ts` |
| `test/epic57-solo-rules-panel.test.ts` | `src/app/solo-rules.ts` | `getSoloRulesItems`, `SOLO_RULES_PANEL_MODES` | `src/app/solo-rules.test.ts` |
| `test/epic56-standard-v2-solo.test.ts` | `src/app/setup-rules.ts` | `resolvePlayMode`, `resolveSetupTemplate` (standard-solo-v2) | `src/app/setup-rules.test.ts` |
| `test/epic70-preferred-expansion.test.ts` | `src/app/forced-picks-utils.ts` | `createEmptyForcedPicks`, `hasForcedPicks`, `normalizeForcedPicks` (preferredExpansionId) | `src/app/forced-picks-utils.test.ts` |
| `test/epic72-active-expansions-collapsed.test.ts` | `src/components/NewGameTab.svelte` | `data-active-filter-panel`, `<details>` / `<summary>` structure (Epic 80 updated this file; the bespoke toggle button tests were removed) | `src/components/NewGameTab.test.ts` |
| `test/epic75-locale-sync-a11y.test.ts` | `src/app/locales/` (all locale files) | Key-parity of FR/DE/JA/KO/ES against EN | `src/app/locales/locales.test.ts` |
| `test/epic23-stats-simplification.test.ts` | `src/components/HistoryTab.svelte` | `stats-category-panel` `<details>`/`<summary>` structure, `data-stats-category` attribute | `src/components/HistoryTab.test.ts` |

#### Files to MERGE — multiple epic files targeting the same module

These files have the same primary module as another file above; their test cases must be folded into
the single target file rather than producing a second same-named file.

| Current file | Primary source module | Merge destination |
|---|---|---|
| `test/epic3-setup-generator.test.ts` | `src/app/setup-generator.ts` | `src/app/setup-generator.test.ts` (**seed file**; create first) |
| `test/epic15-forced-picks.test.ts` | `src/app/setup-generator.ts` (forced-picks in `generateSetup`/`validateSetupLegality`) | Merge into `src/app/setup-generator.test.ts` |
| `test/epic53-solo-scheme-eligibility.test.ts` | `src/app/setup-generator.ts` (`validateSetupLegality` solo scheme eligibility) | Merge into `src/app/setup-generator.test.ts` |
| `test/epic11-play-modes.test.ts` (new-game-utils portion) | `src/app/new-game-utils.ts` (`getAvailablePlayModes`, `getPlayModeHelpText`) | Merge into `src/app/new-game-utils.test.ts` |
| `test/epic20-history-grouping.test.ts` | `src/app/history-utils.ts` (`buildHistoryGroups`, `DEFAULT_HISTORY_GROUPING_MODE`) | Merge into `src/app/history-utils.test.ts` |
| `test/epic34-history-grouping.test.ts` | `src/app/history-utils.ts` (`buildHistoryGroups`, `HISTORY_GROUPING_MODES`, `normalizeHistoryGroupingMode`) | Merge into `src/app/history-utils.test.ts` |
| `test/epic43-expansion-attribution.test.ts` | `src/app/history-utils.ts` (`formatHistorySummary` expansion attribution) | Merge into `src/app/history-utils.test.ts` |
| `test/epic47-history-outcome-filter.test.ts` | `src/app/history-utils.ts` (`filterHistoryByOutcome`) | Merge into `src/app/history-utils.test.ts` |
| `test/epic44-card-browser.test.ts` | `src/app/collection-utils.ts` (`CARD_CATEGORIES`, `getCardsByCategory`, `getCardsByExpansion`) | Merge into `src/app/collection-utils.test.ts` |
| `test/epic46-active-filter.test.ts` | `src/app/state-store.ts` (`setActiveSetIds`, `clearActiveSetIds`, `activeSetIds`) | Merge into `src/app/state-store.test.ts` |
| `test/epic60-sets-browser-sort.test.ts` | `src/app/browse-utils.ts` (`BROWSE_SORT_OPTIONS`, sort keys in `filterBrowseSets`) | Merge into `src/app/browse-utils.test.ts` |
| `test/epic37-small-improvements.test.ts` (locale portion) | `src/app/locales/` (per-locale tab-string coverage, version check) | Merge into `src/app/locales/locales.test.ts` |

#### Files to SPLIT — one epic file covers multiple primary source modules

Each split produces test cases distributed across two or more module-keyed target files.

| Current file | Split target 1 | Split target 2 | Split target 3 | Split target 4 |
|---|---|---|---|---|
| `test/epic3-setup-generator.test.ts` | `src/app/setup-generator.test.ts` (generateSetup, validateSetupLegality, rankItemsByFreshness, applySchemeModifiersToTemplate) | `src/app/setup-rules.test.ts` (resolveSetupTemplate calls) | — | — |
| `test/epic9-notifications-accessibility.test.ts` | `src/app/app-renderer.ts` structural checks → `src/app/app-renderer.test.ts` | `src/components/App.svelte` / `TabNav.svelte` / `ModalRoot.svelte` structure → `src/components/App.test.ts` | state-store / setup-generator runtime assertions → respective module test files | — |
| `test/epic11-play-modes.test.ts` | `src/app/new-game-utils.ts` parts → merge into `src/app/new-game-utils.test.ts` | `src/app/setup-rules.ts` (`resolveSetupTemplate`) → `src/app/setup-rules.test.ts` | — | — |
| `test/epic16-notification-refinements.test.ts` | `src/app/new-game-vm.svelte.ts` (toast.error infinite-duration contract) → `src/app/new-game-vm.test.ts` | `src/app/app-renderer.ts` structural → `src/app/app-renderer.test.ts` | — | — |
| `test/epic17-onboarding-information-architecture.test.ts` | `src/app/state-store.ts` (state persistence) → merge into `src/app/state-store.test.ts` | `src/app/app-renderer.ts` (onboarding structure) → merge into `src/app/app-renderer.test.ts` | — | — |
| `test/epic21-browse-polish.test.ts` | `src/components/BrowseTab.svelte` (disclosure panel, data-browse-* attributes) → `src/components/BrowseTab.test.ts` | `src/app/app-renderer.ts` structural → merge into `src/app/app-renderer.test.ts` | — | — |
| `test/epic22-catalog-ordering.test.ts` | `src/data/canonical-game-data.json` (Villains "base" type) → `src/data/canonical-game-data.test.ts` | `src/app/browse-utils.ts` (`localeCompare` sort) → merge into `src/app/browse-utils.test.ts` | — | — |
| `test/epic25-header-new-game.test.ts` | `src/components/App.svelte` (app-version element, APP_VERSION) → merge into `src/components/App.test.ts` | `src/app/app-shell.css` (header padding reduction) → merge into `src/app/app-shell.test.ts` | `src/components/NewGameTab.svelte` (new-game button) → merge into `src/components/NewGameTab.test.ts` | — |
| `test/epic26-classification-corrections.test.ts` | `src/data/canonical-game-data.json` (Core Set, Villains, S.H.I.E.L.D., Venom type corrections) → merge into `src/data/canonical-game-data.test.ts` | `src/app/browse-utils.ts` / `src/app/collection-utils.ts` structural checks → merge into respective files | — | — |
| `test/epic27-shell-debug-polish.test.ts` | `src/app/app-renderer.ts` (debug snapshot removal, no setupSnapshot JSON.stringify) → merge into `src/app/app-renderer.test.ts` | `src/app/setup-generator.ts` structural → merge into `src/app/setup-generator.test.ts` | — | — |
| `test/epic36-version-storage-disclosure.test.ts` | `src/components/App.svelte` + vite.config.js (version injection) → merge into `src/components/App.test.ts` | `src/components/BackupTab.svelte` (storage-version disclosure, schema-version display) → `src/components/BackupTab.test.ts` | — | — |
| `test/epic71-epic-mastermind.test.ts` | `src/app/setup-generator.ts` (mastermind lead behavior in `generateSetup`) → merge into `src/app/setup-generator.test.ts` | `src/app/state-store.ts` (`sanitizePersistedState`, `SCHEMA_VERSION`) → merge into `src/app/state-store.test.ts` | `src/app/history-utils.ts` (`normalizeHistoryGroupingMode`) → merge into `src/app/history-utils.test.ts` | — |
| `test/epic73-solo-always-leads.test.ts` | `src/app/setup-generator.ts` (solo always-leads suppression) → merge into `src/app/setup-generator.test.ts` | `src/app/solo-rules.ts` (`getSoloRulesItems`) → merge into `src/app/solo-rules.test.ts` | — | — |
| `test/epic74-forced-hero-team.test.ts` | `src/app/forced-picks-utils.ts` (`forcedTeam` field) → merge into `src/app/forced-picks-utils.test.ts` | `src/app/setup-generator.ts` (`buildOwnedPools`, forced-team in `generateSetup`) → merge into `src/app/setup-generator.test.ts` | — | — |
| `test/epic78-ui-layout-polish.test.ts` | `src/components/HistoryTab.svelte` (grouping pill row, outcome filter wrap) → merge into `src/components/HistoryTab.test.ts` | `src/components/NewGameTab.svelte` → merge into `src/components/NewGameTab.test.ts` | `src/components/BrowseTab.svelte` → merge into `src/components/BrowseTab.test.ts` | `src/components/CollectionTab.svelte` → `src/components/CollectionTab.test.ts` |
| `test/design-system-epic1-foundation.test.ts` | `src/app/app-shell.css` (semantic token families, CSS custom properties) → `src/app/app-shell.test.ts` | `src/app/theme-utils.ts` (normalizeThemeId, THEME_OPTIONS) → merge into `src/app/theme-utils.test.ts` | — | — |
| `test/design-system-rollout.test.ts` | `src/app/app-shell.css` (typography roles) → merge into `src/app/app-shell.test.ts` | `src/components/HistoryTab.svelte` design-system adoption → merge into `src/components/HistoryTab.test.ts` | `src/app/focus-utils.ts` → `src/app/focus-utils.test.ts` | `src/app/preferences-actions.ts` → merge into `src/app/preferences-actions.test.ts` |
| `test/epic-ux6-backup-safety.test.ts` | `src/components/BackupTab.svelte` (portability panel, export/import actions) → merge into `src/components/BackupTab.test.ts` | `src/app/app-renderer.ts` / `src/app/app-shell.css` structural → merge into `src/app/app-renderer.test.ts` | — | — |

### Target test file inventory (post-refactor)

After Stories 82.2 and 82.3 complete, these 31 module-keyed files must exist and no epic-keyed
files may remain:

**`src/app/`** (23 files)
- `app-renderer.test.ts`
- `app-shell.test.ts`
- `app-tabs.test.ts`
- `backup-utils.test.ts`
- `bgg-import-utils.test.ts`
- `browse-utils.test.ts`
- `collection-utils.test.ts`
- `focus-utils.test.ts`
- `forced-picks-utils.test.ts`
- `game-data-pipeline.test.ts`
- `history-utils.test.ts`
- `localization-utils.test.ts`
- `myludo-import-utils.test.ts`
- `new-game-utils.test.ts`
- `new-game-vm.test.ts`
- `preferences-actions.test.ts`
- `result-utils.test.ts`
- `setup-generator.test.ts`
- `setup-rules.test.ts`
- `solo-rules.test.ts`
- `state-store.test.ts`
- `stats-utils.test.ts`
- `theme-utils.test.ts`

**`src/app/locales/`** (1 file)
- `locales.test.ts`

**`src/components/`** (6 files)
- `App.test.ts`
- `BackupTab.test.ts`
- `BrowseTab.test.ts`
- `CollectionTab.test.ts`
- `HistoryTab.test.ts`
- `NewGameTab.test.ts`

**`src/data/`** (1 file)
- `canonical-game-data.test.ts`

- [ ] **Test (manual):** Verify the target inventory list above matches what was actually created
  before closing this story.

- [ ] **QC (Automated):** Run `npm run lint` and confirm zero lint errors. No test execution yet.

---

## Story 82.2 — Rename all epic-keyed files to module-keyed names

**Rule:** For each simple-rename row in the Story 82.1 mapping (files that map 1:1 to a target), create the new file at the target path and delete the old file. Adjust all relative import paths inside the moved file (e.g. `'../src/app/X.ts'` → `'./X.ts'` or `'../X.ts'` depending on depth).

### Tasks — `src/app/` renames

- [ ] Move `test/epic1.test.ts` → `src/app/game-data-pipeline.test.ts`; update imports from
  `'../src/app/...'` to `'./'` or `'../'`; update `rootDir` / `__dirname` derived seed paths.
- [ ] Move `test/epic2-state.test.ts` → `src/app/state-store.test.ts`; fix relative paths.
- [ ] Move `test/epic4-shell-navigation.test.ts` → `src/app/app-tabs.test.ts`; fix relative paths.
- [ ] Move `test/epic5-browse-extensions.test.ts` → `src/app/browse-utils.test.ts`; fix relative
  paths.
- [ ] Move `test/epic6-collection-management.test.ts` → `src/app/collection-utils.test.ts`; fix
  relative paths.
- [ ] Move `test/epic7-new-game-experience.test.ts` → `src/app/new-game-utils.test.ts`; fix relative
  paths.
- [ ] Move `test/epic8-history-usage-reset.test.ts` → `src/app/history-utils.test.ts`; fix relative
  paths.
- [ ] Move `test/epic12-score-history.test.ts` → `src/app/result-utils.test.ts`; fix relative paths.
- [ ] Move `test/epic13-backup-portability.test.ts` → `src/app/backup-utils.test.ts`; fix relative
  paths.
- [ ] Move `test/epic14-stats-dashboard.test.ts` → `src/app/stats-utils.test.ts`; fix relative paths.
- [ ] Move `test/epic18-theme-personalization.test.ts` → `src/app/theme-utils.test.ts`; fix relative
  paths.
- [ ] Move `test/epic19-localization.test.ts` → `src/app/localization-utils.test.ts`; fix relative
  paths.
- [ ] Move `test/epic24-toast-behavior.test.ts` → `src/app/preferences-actions.test.ts`; fix
  relative paths.
- [ ] Move `test/epic42-bgg-import.test.ts` → `src/app/bgg-import-utils.test.ts`; fix relative paths.
- [ ] Move `test/epic45-myludo-import.test.ts` → `src/app/myludo-import-utils.test.ts`; fix relative
  paths.
- [ ] Move `test/epic56-standard-v2-solo.test.ts` → `src/app/setup-rules.test.ts`; fix relative
  paths.
- [ ] Move `test/epic57-solo-rules-panel.test.ts` → `src/app/solo-rules.test.ts`; fix relative paths.
- [ ] Move `test/epic70-preferred-expansion.test.ts` → `src/app/forced-picks-utils.test.ts`; fix
  relative paths.

### Tasks — `src/app/locales/` renames

- [ ] Move `test/epic75-locale-sync-a11y.test.ts` → `src/app/locales/locales.test.ts`; fix relative
  paths (source imports are already absolute module imports, no path changes needed for those).

### Tasks — `src/components/` renames

- [ ] Move `test/epic23-stats-simplification.test.ts` → `src/components/HistoryTab.test.ts`; fix
  relative paths (all `fs.readFile` calls using `rootDir` must use `path.resolve(__dirname, '../..')`
  to reach the workspace root from `src/components/`).
- [ ] Move `test/epic72-active-expansions-collapsed.test.ts` → `src/components/NewGameTab.test.ts`;
  fix relative paths similarly.

### Tasks — confirm deletions

- [ ] Delete all 20 original `test/epic*.test.ts` files handled in this story (the moved files).
  Confirm `test/` still contains only the remaining epic-keyed files (those handled in Story 82.3)
  plus the `test/playwright/` directory.

- [ ] **Test (manual):** After this story, run `npm test` (update the config first per Story 82.4 if
  needed) and confirm at minimum the 20 moved files are discovered and their tests still pass.

- [ ] **QC (Automated):** Run `npm run lint`. Confirm zero errors on moved files.

---

## Story 82.3 — Split multi-module test files and merge same-module duplicates

**Rule:** For each "SPLIT" row and each "MERGE" row in the Story 82.1 mapping, redistribute test
cases into the correct module-keyed target files. Do not leave any epic-keyed file in the repo after
this story.

### Tasks — seed new target files (create file if it does not yet exist from Story 82.2)

- [ ] Create `src/app/setup-generator.test.ts` using the content of `test/epic3-setup-generator.test.ts`
  as the seed file (primary setup-generator functions); fix relative paths.
- [ ] Create `src/app/app-renderer.test.ts`; seed with app-renderer structural assertions extracted
  from `test/epic9-notifications-accessibility.test.ts` and `test/epic27-shell-debug-polish.test.ts`.
- [ ] Create `src/app/new-game-vm.test.ts`; seed with `new-game-vm.svelte.ts` toast-behavior
  assertions extracted from `test/epic16-notification-refinements.test.ts`.
- [ ] Create `src/app/app-shell.test.ts`; seed with CSS token assertions extracted from
  `test/design-system-epic1-foundation.test.ts`.
- [ ] Create `src/app/focus-utils.test.ts`; seed with `focus-utils.ts` assertions extracted from
  `test/design-system-rollout.test.ts`.
- [ ] Create `src/components/App.test.ts`; seed with `App.svelte` assertions extracted from
  `test/epic9-notifications-accessibility.test.ts` (TabNav/ModalRoot structure) and
  `test/epic25-header-new-game.test.ts` (app-version element, APP_VERSION).
- [ ] Create `src/components/BackupTab.test.ts`; seed with `BackupTab.svelte` portability-panel
  assertions extracted from `test/epic-ux6-backup-safety.test.ts`.
- [ ] Create `src/components/BrowseTab.test.ts`; seed with `BrowseTab.svelte` structural assertions
  extracted from `test/epic21-browse-polish.test.ts`.
- [ ] Create `src/components/CollectionTab.test.ts`; seed with `CollectionTab.svelte` assertions
  extracted from `test/epic78-ui-layout-polish.test.ts`.
- [ ] Create `src/data/canonical-game-data.test.ts`; seed with game-data type-classification
  assertions extracted from `test/epic22-catalog-ordering.test.ts` and
  `test/epic26-classification-corrections.test.ts`.

### Tasks — merge remaining epic files into existing target files

For every merge below: append the relevant test cases from the source file into the target file,
deduplicate any identical fixtures or helpers, then delete the source file.

- [ ] Merge `test/epic15-forced-picks.test.ts` → `src/app/setup-generator.test.ts`
  (forced-picks integration in `generateSetup`/`validateSetupLegality`).
- [ ] Merge `test/epic53-solo-scheme-eligibility.test.ts` → `src/app/setup-generator.test.ts`
  (`validateSetupLegality` solo scheme eligibility).
- [ ] Merge `test/epic11-play-modes.test.ts` new-game-utils portion → `src/app/new-game-utils.test.ts`;
  merge setup-rules portion (`resolveSetupTemplate`) → `src/app/setup-rules.test.ts`.
- [ ] Merge `test/epic20-history-grouping.test.ts` → `src/app/history-utils.test.ts`.
- [ ] Merge `test/epic34-history-grouping.test.ts` → `src/app/history-utils.test.ts`
  (HISTORY_GROUPING_MODES, normalizeHistoryGroupingMode).
- [ ] Merge `test/epic43-expansion-attribution.test.ts` → `src/app/history-utils.test.ts`
  (`formatHistorySummary` expansion-attribution assertions).
- [ ] Merge `test/epic47-history-outcome-filter.test.ts` → `src/app/history-utils.test.ts`
  (`filterHistoryByOutcome`).
- [ ] Merge `test/epic44-card-browser.test.ts` → `src/app/collection-utils.test.ts`
  (CARD_CATEGORIES, getCardsByCategory, getCardsByExpansion).
- [ ] Merge `test/epic46-active-filter.test.ts` → `src/app/state-store.test.ts`
  (setActiveSetIds, clearActiveSetIds, sanitizePersistedState SCHEMA_VERSION).
- [ ] Merge `test/epic60-sets-browser-sort.test.ts` → `src/app/browse-utils.test.ts`
  (BROWSE_SORT_OPTIONS, sort-key variants of filterBrowseSets).
- [ ] Merge `test/epic37-small-improvements.test.ts` → `src/app/locales/locales.test.ts`
  (per-locale tab-string coverage, package.json version assertion).
- [ ] Merge `test/epic3-setup-generator.test.ts` setup-rules portion (`resolveSetupTemplate` calls) →
  `src/app/setup-rules.test.ts`; delete the original epic3 file after the seed file (above) was
  created from it.
- [ ] Merge `test/epic9-notifications-accessibility.test.ts` state-store/setup-generator runtime
  assertions → respective module test files; merge App.svelte/TabNav/ModalRoot structural assertions
  → `src/components/App.test.ts`; merge app-renderer assertions → `src/app/app-renderer.test.ts`;
  delete original file.
- [ ] Merge `test/epic16-notification-refinements.test.ts` app-renderer structural assertions →
  `src/app/app-renderer.test.ts`; delete original file.
- [ ] Merge `test/epic17-onboarding-information-architecture.test.ts`: state-store parts →
  `src/app/state-store.test.ts`; app-renderer parts → `src/app/app-renderer.test.ts`; delete
  original file.
- [ ] Merge `test/epic21-browse-polish.test.ts` app-renderer structural assertions →
  `src/app/app-renderer.test.ts`; delete original file.
- [ ] Merge `test/epic22-catalog-ordering.test.ts` browse-utils sort assertion →
  `src/app/browse-utils.test.ts`; delete original file.
- [ ] Merge `test/epic25-header-new-game.test.ts`: app-shell.css assertions →
  `src/app/app-shell.test.ts`; NewGameTab button assertion → `src/components/NewGameTab.test.ts`;
  delete original file.
- [ ] Merge `test/epic26-classification-corrections.test.ts` browse-utils/collection-utils structural
  checks → respective module test files; delete original file.
- [ ] Merge `test/epic27-shell-debug-polish.test.ts` setup-generator structural assertion →
  `src/app/setup-generator.test.ts`; delete original file.
- [ ] Merge `test/epic36-version-storage-disclosure.test.ts`: App.svelte/vite.config.js version parts
  → `src/components/App.test.ts`; BackupTab disclosure → `src/components/BackupTab.test.ts`; delete
  original file.
- [ ] Merge `test/epic71-epic-mastermind.test.ts`: setup-generator mastermind lead tests →
  `src/app/setup-generator.test.ts`; state-store sanitizePersistedState/SCHEMA_VERSION →
  `src/app/state-store.test.ts`; history-utils normalizeHistoryGroupingMode →
  `src/app/history-utils.test.ts`; delete original file.
- [ ] Merge `test/epic73-solo-always-leads.test.ts`: setup-generator solo always-leads →
  `src/app/setup-generator.test.ts`; solo-rules assertions → `src/app/solo-rules.test.ts`; delete
  original file.
- [ ] Merge `test/epic74-forced-hero-team.test.ts`: forced-picks-utils forcedTeam →
  `src/app/forced-picks-utils.test.ts`; setup-generator buildOwnedPools/generateSetup forced-team →
  `src/app/setup-generator.test.ts`; delete original file.
- [ ] Merge `test/epic78-ui-layout-polish.test.ts`: HistoryTab cases → `src/components/HistoryTab.test.ts`;
  NewGameTab cases → `src/components/NewGameTab.test.ts`; BrowseTab cases →
  `src/components/BrowseTab.test.ts`; CollectionTab cases → `src/components/CollectionTab.test.ts`;
  delete original file.
- [ ] Merge `test/design-system-epic1-foundation.test.ts` theme-utils assertions →
  `src/app/theme-utils.test.ts`; delete original file.
- [ ] Merge `test/design-system-rollout.test.ts`: app-shell.css typography →
  `src/app/app-shell.test.ts`; HistoryTab design-system adoption → `src/components/HistoryTab.test.ts`;
  preferences-actions → `src/app/preferences-actions.test.ts`; delete original file.
- [ ] Merge `test/epic-ux6-backup-safety.test.ts` app-renderer/app-shell structural assertions →
  `src/app/app-renderer.test.ts`; delete original file.

### Confirm clean-up

- [ ] Verify the `test/` directory contains only `test/playwright/` (no `*.test.ts` files remain at
  the top level of `test/`).
- [ ] Verify the 31 module-keyed test files listed in the Story 82.1 inventory all exist.

- [ ] **Test (manual):** With the vitest config updated (Story 82.4), confirm `npm test` finds all 31
  files and no test is reported as missing or skipped.

- [ ] **QC (Automated):** Run `npm run lint`. Confirm zero errors on all 31 new test files.

---

## Story 82.4 — Update Vitest configuration to discover tests at their new locations

### Tasks

- [ ] Open `vitest.config.js`. The current `include` glob is:
  ```js
  include: ['test/**/*.test.ts'],
  ```
  Change it to:
  ```js
  include: ['src/**/*.test.ts'],
  ```
  so that Vitest discovers all tests co-located under `src/`.

- [ ] Verify the `coverage.include` already covers `src/**/*.ts` and `src/**/*.js`; no change
  required to the coverage block.

- [ ] Check `package.json` for any `test:*` scripts that reference hard-coded paths inside `test/`
  (e.g. `vitest run test/epic3-*.test.ts`). Update or remove any such scripts so they reference
  module-keyed paths or rely on the updated include glob.

- [ ] Verify there are no `tsconfig.json` `include`/`exclude` patterns that explicitly reference
  `test/**` in a way that would need updating now that test files live in `src/`.

- [ ] **Test (manual):** Run `npm test -- --reporter=verbose` and confirm every one of the 31 target
  test files appears in the output.

- [ ] **QC (Automated):** Run `npm run lint` after the config change. Confirm no new lint errors
  are introduced by the config modification.

---

## Story 82.5 — Verify the complete test suite passes with no regression

### Tasks

- [ ] Run `npm test` and compare the total passing test count to the pre-refactor baseline recorded
  in the pre-flight step. The counts must be equal.

- [ ] Confirm that no test file is collected zero times (i.e. no accidental empty file or
  wrong-glob exclusion).

- [ ] Confirm that coverage output (if generated) still reports `src/**` files and has not regressed
  from the pre-refactor run.

- [ ] Confirm that no import in any test file still references a path that begins with `'../test/'`.

- [ ] Confirm that no file named `epic*.test.ts` or `design-system-*.test.ts` or
  `epic-ux*.test.ts` exists anywhere under `src/` or `test/` (excluding `test/playwright/`).

- [ ] **Test (manual):** Run the full suite locally and record the final passing count.

- [ ] **QC (Automated):** Run `npm run lint` then `npm test`. Both must exit 0. Pass the final test
  count back to the dispatcher for epic-end regression records.
