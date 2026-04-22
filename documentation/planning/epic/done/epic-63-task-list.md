# Epic 63 — Migrate Core Utility Modules to TypeScript

## Story 1 — Migrate `object-utils.mjs` and `collection-utils.mjs` to TypeScript

### `object-utils.mjs`

- [x] Delete `src/app/object-utils.mjs` and create `src/app/object-utils.ts` with the same contents
- [x] Annotate `deepClone` as a generic: `deepClone<T>(value: T): T`
- [x] Annotate `isPlainObject(value: unknown): boolean`
- [x] Update the `import { deepClone, isPlainObject }` in `src/app/backup-utils.mjs` to reference `./object-utils.ts`
- [x] Update the `import { deepClone }` in `src/app/setup-generator.mjs` to reference `./object-utils.ts`
- [x] Update the `import { deepClone, isPlainObject }` in `src/app/state-store.mjs` to reference `./object-utils.ts`
- [x] Update the `import { deepClone }` in `test/epic1.test.mjs` to reference `../src/app/object-utils.ts`

### `collection-utils.mjs`

- [x] Delete `src/app/collection-utils.mjs` and create `src/app/collection-utils.ts` with the same contents
- [x] Add explicit type annotation to `CARD_CATEGORIES` constant (e.g. `ReadonlyArray<{ id: string; labelKey: string }>`)
- [x] Add explicit type annotation to `COLLECTION_TYPE_GROUPS` constant
- [x] Add explicit type annotation to `COLLECTION_FEASIBILITY_MODES` constant
- [x] Annotate `getCardsByCategory(pools: CardPools): CategoryEntry[]` using types from `src/app/types.ts`
- [x] Annotate `getCardsByExpansion(pools: CardPools): ExpansionEntry[]`
- [x] Annotate `groupSetsByType(sets: GameSet[]): CollectionTypeGroup[]`
- [x] Annotate `summarizeOwnedCollection(runtime: AppRuntime, ownedSetIds: string[]): CollectionSummary`
- [x] Annotate `mergeOwnedSets(state: AppState, newSetIds: string[]): AppState`
- [x] Annotate `getCollectionFeasibility` with parameter and return types
- [x] Update the `import { summarizeOwnedCollection }` in `src/app/stats-utils.mjs` to reference `./collection-utils.ts`
- [x] Update the `import { getCardsByExpansion }` in `src/components/CardBrowserByExpansion.svelte` to reference `../app/collection-utils.ts`
- [x] Update the `import { getCardsByCategory }` in `src/components/CardBrowserByCategory.svelte` to reference `../app/collection-utils.ts`
- [x] Update the `import { mergeOwnedSets }` in `src/components/App.svelte` to reference `../app/collection-utils.ts`
- [x] Update the `import { getCollectionFeasibility, groupSetsByType, summarizeOwnedCollection }` in `src/components/CollectionTab.svelte` to reference `../app/collection-utils.ts`
- [x] Update the import in `test/epic6-collection-management.test.mjs` to reference `../src/app/collection-utils.ts`
- [x] Update the `import { getCollectionFeasibility }` in `test/epic11-play-modes.test.mjs` to reference `../src/app/collection-utils.ts`
- [x] Update the `fs.readFile` path string referencing `collection-utils.mjs` in `test/epic26-classification-corrections.test.mjs` to `collection-utils.ts`
- [x] Update the `import { mergeOwnedSets }` in `test/epic42-bgg-import.test.mjs` to reference `../src/app/collection-utils.ts`
- [x] Update the import in `test/epic44-card-browser.test.mjs` to reference `../src/app/collection-utils.ts`
- [x] Update the `import { mergeOwnedSets }` in `test/epic45-myludo-import.test.mjs` to reference `../src/app/collection-utils.ts`

### Verification

- [x] **Test**: Confirm `src/app/object-utils.ts` and `src/app/collection-utils.ts` exist and their `.mjs` originals are absent; verify `deepClone<string>` infers return type correctly; verify `mergeOwnedSets` rejects a non-`AppState` first argument at the type level
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 2 — Migrate `browse-utils.mjs` and `history-utils.mjs` to TypeScript

### `browse-utils.mjs`

- [x] Delete `src/app/browse-utils.mjs` and create `src/app/browse-utils.ts` with the same contents
- [x] Add explicit type annotations to `BROWSE_TYPE_OPTIONS` and `BROWSE_SORT_OPTIONS` constants
- [x] Annotate `getBrowseTypeLabel(type: string): string`
- [x] Annotate `summarizeBrowseSet(set: GameSet): BrowseSetSummary` using types from `src/app/types.ts`
- [x] Annotate `matchesBrowseSearch(set: GameSet, searchTerm: string): boolean`
- [x] Annotate `filterBrowseSets(sets: GameSet[], options?: FilterBrowseSetsOptions): GameSet[]` with an inline or shared options type covering `searchTerm`, `typeFilter`, `sortKey`, and `ownedSetIds`
- [x] Update the `import { BROWSE_TYPE_OPTIONS, BROWSE_SORT_OPTIONS, filterBrowseSets, summarizeBrowseSet }` in `src/components/BrowseTab.svelte` to reference `../app/browse-utils.ts`
- [x] Update the `import { summarizeBrowseSet }` in `src/components/CollectionTab.svelte` to reference `../app/browse-utils.ts`
- [x] Update the import in `test/epic5-browse-extensions.test.mjs` to reference `../src/app/browse-utils.ts`
- [x] Update the `fs.readFile` path string referencing `browse-utils.mjs` in `test/epic22-catalog-ordering.test.mjs` to `browse-utils.ts`
- [x] Update the `fs.readFile` path string referencing `browse-utils.mjs` in `test/epic26-classification-corrections.test.mjs` to `browse-utils.ts`
- [x] Update the import in `test/epic60-sets-browser-sort.test.mjs` to reference `../src/app/browse-utils.ts`

### `history-utils.mjs`

- [x] Delete `src/app/history-utils.mjs` and create `src/app/history-utils.ts` with the same contents
- [x] Add explicit type annotation to `HISTORY_GROUPING_MODES` and `HISTORY_USAGE_LABELS` constants
- [x] Annotate `summarizeUsageIndicators(runtime: AppRuntime, state: AppState): UsageIndicator[]`
- [x] Annotate `formatHistorySummary(record: HistoryRecord, indexes: AppIndexes): string`
- [x] Annotate `filterHistoryByOutcome(records: HistoryRecord[], outcome: string | null): HistoryRecord[]`
- [x] Annotate `buildHistoryGroups` with parameter and return types
- [x] Annotate `buildFullResetPreview` with parameter and return types
- [x] Annotate `normalizeHistoryGroupingMode(mode: string): string`
- [x] Update import in `src/components/HistoryTab.svelte` to reference `../app/history-utils.ts`
- [x] Update the `import { DEFAULT_HISTORY_GROUPING_MODE, HISTORY_GROUPING_MODES }` in `src/components/App.svelte` to reference `../app/history-utils.ts`
- [x] Update the `import { summarizeUsageIndicators }` in `src/components/BackupTab.svelte` to reference `../app/history-utils.ts`
- [x] Update the `import { DEFAULT_HISTORY_GROUPING_MODE }` in `src/app/history-vm.svelte.js` to reference `./history-utils.ts`
- [x] Update the import in `test/epic8-history-usage-reset.test.mjs` to reference `../src/app/history-utils.ts`
- [x] Update the `import { formatHistorySummary }` in `test/epic11-play-modes.test.mjs` to reference `../src/app/history-utils.ts`
- [x] Update the `import { formatHistorySummary }` in `test/epic12-score-history.test.mjs` to reference `../src/app/history-utils.ts`
- [x] Update the import in `test/epic20-history-grouping.test.mjs` to reference `../src/app/history-utils.ts`
- [x] Update the import in `test/epic34-history-grouping.test.mjs` to reference `../src/app/history-utils.ts`
- [x] Update the `import { formatHistorySummary }` in `test/epic43-expansion-attribution.test.mjs` to reference `../src/app/history-utils.ts`
- [x] Update the `import { filterHistoryByOutcome }` in `test/epic47-history-outcome-filter.test.mjs` to reference `../src/app/history-utils.ts`

### Verification

- [x] **Test**: Confirm `src/app/browse-utils.ts` and `src/app/history-utils.ts` exist and their `.mjs` originals are absent; verify `filterBrowseSets` parameter accepts a `GameSet[]` argument; verify `filterHistoryByOutcome` parameter accepts a `HistoryRecord[]` argument
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 3 — Migrate `stats-utils.mjs` and `result-utils.mjs` to TypeScript

### `stats-utils.mjs`

- [x] Delete `src/app/stats-utils.mjs` and create `src/app/stats-utils.ts` with the same contents
- [x] Add explicit type annotations to `INSIGHT_CATEGORY_LABELS` and `RECENT_SCORE_WINDOW` constants
- [x] Annotate `buildInsightsDashboard` with parameter and return types using types from `src/app/types.ts`
- [x] Annotate `buildOutcomeInsights` with parameter and return types
- [x] Annotate `buildUsageInsights` with parameter and return types
- [x] Update the `import { buildInsightsDashboard, RECENT_SCORE_WINDOW }` in `src/components/HistoryTab.svelte` to reference `../app/stats-utils.ts`
- [x] Update the `import { sanitizeStoredGameResult }` at the top of `src/app/stats-utils.ts` (internal import) to reference `./result-utils.ts` (needed after Story 3 renames result-utils)
- [x] Update the `import { summarizeOwnedCollection }` in `src/app/stats-utils.ts` to reference `./collection-utils.ts`
- [x] Update the import in `test/epic14-stats-dashboard.test.mjs` to reference `../src/app/stats-utils.ts`

### `result-utils.mjs`

- [x] Delete `src/app/result-utils.mjs` and create `src/app/result-utils.ts` with the same contents
- [x] Add explicit type annotations to `GAME_RESULT_STATUS_PENDING` and `GAME_RESULT_STATUS_COMPLETED` constants (e.g. `as const`)
- [x] Add explicit type annotation to `GAME_OUTCOME_OPTIONS` constant
- [x] Annotate `createPlayerScoreEntry(options?: Partial<PlayerScoreEntry>): PlayerScoreEntry`
- [x] Annotate `createPerPlayerScoreArray(playerCount: number): PlayerScoreEntry[]`
- [x] Annotate `createPendingGameResult(): GameResult`
- [x] Annotate `isCompletedGameResult(result: unknown): result is GameResult`
- [x] Annotate `formatGameOutcomeLabel(outcome: string): string`
- [x] Annotate `formatGameResultStatus(result: GameResult, locale?: string): string`
- [x] Annotate `createCompletedGameResult(options: CreateCompletedGameResultOptions): GameResult`
- [x] Annotate `sanitizeStoredGameResult(candidate: unknown, playerCount?: number): { result: GameResult; recovered: boolean }`
- [x] Annotate `normalizeGameResultDraft` and `validateGameResultDraft` with parameter and return types
- [x] Update the `import { sanitizeStoredGameResult }` in `src/app/stats-utils.mjs` to reference `./result-utils.ts` (coordinate with stats-utils rename above)
- [x] Update the `import { formatGameResultStatus, isCompletedGameResult, sanitizeStoredGameResult }` in `src/app/history-utils.mjs` (now `.ts`) to reference `./result-utils.ts`
- [x] Update the `import { createCompletedGameResult, createPendingGameResult, createPerPlayerScoreArray, GAME_RESULT_STATUS_PENDING, sanitizeStoredGameResult }` in `src/app/state-store.mjs` to reference `./result-utils.ts`
- [x] Update the `import { GAME_OUTCOME_OPTIONS, isCompletedGameResult }` in `src/components/HistoryTab.svelte` to reference `../app/result-utils.ts`
- [x] Update the `import { normalizeGameResultDraft, validateGameResultDraft, isCompletedGameResult }` in `src/components/App.svelte` to reference `../app/result-utils.ts`
- [x] Update the `import { createPerPlayerScoreArray }` in `src/app/history-vm.svelte.js` to reference `./result-utils.ts`
- [x] Update the imports in `test/epic12-score-history.test.mjs` to reference `../src/app/result-utils.ts`

### Verification

- [x] **Test**: Confirm `src/app/stats-utils.ts` and `src/app/result-utils.ts` exist and their `.mjs` originals are absent; verify exported constants carry explicit type annotations; verify `createCompletedGameResult` and `createPendingGameResult` are typed to return `GameResult`
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 4 — Migrate `feedback-utils.mjs`, `focus-utils.mjs`, `forced-picks-utils.mjs`, and `new-game-utils.mjs` to TypeScript

### `feedback-utils.mjs`

- [x] Delete `src/app/feedback-utils.mjs` and create `src/app/feedback-utils.ts` with the same contents
- [x] Add explicit type annotations to `TOAST_VARIANTS` and `TOAST_BEHAVIORS` constants
- [x] Annotate `createToastRecord(options: CreateToastRecordOptions): ToastRecord`
- [x] Annotate `pushToast(toasts: ToastRecord[], toast: ToastRecord, maxToasts?: number): ToastRecord[]`
- [x] Annotate `removeToast(toasts: ToastRecord[], id: string): ToastRecord[]`
- [x] Annotate `shouldAutoDismissToast` with parameter and return types
- [x] Update the `import { createToastRecord, pushToast, removeToast, shouldAutoDismissToast }` in `src/components/App.svelte` to reference `../app/feedback-utils.ts`
- [x] Update the import in `test/epic9-notifications-accessibility.test.mjs` to reference `../src/app/feedback-utils.ts`
- [x] Update the import in `test/epic16-notification-refinements.test.mjs` to reference `../src/app/feedback-utils.ts`
- [x] Update the `fs.readFile` path string referencing `feedback-utils.mjs` in `test/epic24-toast-behavior.test.mjs` to `feedback-utils.ts`

### `focus-utils.mjs`

- [x] Delete `src/app/focus-utils.mjs` and create `src/app/focus-utils.ts` with the same contents
- [x] Annotate `focusActionButton(actionName: string): void`
- [x] Annotate `focusSelector(selector: string): void`
- [x] Annotate `focusModalCancelButton(): void`
- [x] Update the `import { focusActionButton, focusSelector, focusModalCancelButton }` in `src/components/App.svelte` to reference `../app/focus-utils.ts`
- [x] Update the `fs.readFile` path string referencing `focus-utils.mjs` in `test/design-system-rollout.test.mjs` to `focus-utils.ts`

### `forced-picks-utils.mjs`

- [x] Delete `src/app/forced-picks-utils.mjs` and create `src/app/forced-picks-utils.ts` with the same contents
- [x] Add explicit type annotation to `FORCED_PICK_FIELD_CONFIGS` constant
- [x] Annotate `createEmptyForcedPicks(): ForcedPicks`
- [x] Annotate `normalizeForcedPicks(candidateForcedPicks: unknown): ForcedPicks`
- [x] Annotate `hasForcedPicks(forcedPicks: unknown): boolean`
- [x] Annotate `addForcedPick(currentForcedPicks: ForcedPicks, field: string, value: string): ForcedPicks`
- [x] Annotate `removeForcedPick(currentForcedPicks: ForcedPicks, field: string, value?: string | null): ForcedPicks`
- [x] Update the `import { FORCED_PICK_FIELD_CONFIGS, hasForcedPicks }` in `src/components/NewGameTab.svelte` to reference `../app/forced-picks-utils.ts`
- [x] Update the `import { addForcedPick, hasForcedPicks, removeForcedPick }` in `src/components/App.svelte` to reference `../app/forced-picks-utils.ts`
- [x] Update the `import { createEmptyForcedPicks }` in `src/app/new-game-vm.svelte.js` to reference `./forced-picks-utils.ts`
- [x] Update the `import { hasForcedPicks, normalizeForcedPicks }` in `src/app/setup-generator.mjs` to reference `./forced-picks-utils.ts`

### `new-game-utils.mjs`

- [x] Delete `src/app/new-game-utils.mjs` and create `src/app/new-game-utils.ts` with the same contents
- [x] Annotate `isAdvancedSoloAvailable(playerCount: number): boolean`
- [x] Annotate `getAvailablePlayModes(playerCount: number): PlayModeOption[]`
- [x] Annotate `getPlayModeHelpText(playerCount: number, playMode: string): string`
- [x] Annotate `getDisplayedSetupRequirements(options: GetDisplayedSetupRequirementsOptions): SetupRequirements`
- [x] Annotate `formatHeroTeamLabel(hero: Hero): string`
- [x] Annotate `formatMastermindLeadLabel(mastermind: Mastermind): string`
- [x] Update the `import { getAvailablePlayModes, getDisplayedSetupRequirements }` in `src/components/NewGameTab.svelte` to reference `../app/new-game-utils.ts`
- [x] Update the import in `test/epic7-new-game-experience.test.mjs` to reference `../src/app/new-game-utils.ts`
- [x] Update the `import { getAvailablePlayModes, getDisplayedSetupRequirements, getPlayModeHelpText }` in `test/epic11-play-modes.test.mjs` to reference `../src/app/new-game-utils.ts`
- [x] Update the `import { getAvailablePlayModes }` in `test/epic56-standard-v2-solo.test.mjs` to reference `../src/app/new-game-utils.ts`

### Verification

- [x] **Test**: Confirm all four `.ts` files exist and their `.mjs` originals are absent; verify `createToastRecord` return type matches `ToastRecord`; verify `normalizeForcedPicks` accepts an `unknown` argument without type errors; verify `getAvailablePlayModes` return type is inferred as an array
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0
