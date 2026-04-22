# Epic 66 — Migrate Svelte Reactive View Models to TypeScript

---

## Story 1 — Migrate `state-store.svelte.js` to `state-store.svelte.ts` and update all component consumers

- [x] Create `src/app/types.ts` and declare the `AppState` type (either derived from `ReturnType<typeof createDefaultState>` imported from `state-store.mjs`, or as an explicit interface matching the state shape); this file will also be extended in Stories 2 and 3 for `PlayMode`, `GeneratedSetup`, `GameOutcome`, etc.
- [x] Delete `src/app/state-store.svelte.js` and create `src/app/state-store.svelte.ts` with the same `export * from './state-store.mjs'` re-export and the same reactive logic
- [x] In `state-store.svelte.ts`, annotate `_appState` with the `AppState` type in its `$state<AppState>(createDefaultState())` initialiser
- [x] Annotate `getAppState()` with explicit return type `AppState`
- [x] Annotate `setAppState(newState: AppState): void` with parameter and return types
- [x] Confirm via `grep` that no file in `src/components/` currently imports from `state-store.svelte.js` (none do as of this writing); update any found imports to `state-store.svelte.ts`
- [x] **Test**: Run `npm run dev`; boot the app and verify all five tabs (New Game, Browse, History, Backup, Collection) load and function correctly; confirm no console errors
- [x] **QC (Automated)**: Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`; confirm all three exit 0

---

## Story 2 — Migrate `browse-vm.svelte.js` and `new-game-vm.svelte.js` to TypeScript

### `browse-vm.svelte.ts`

- [x] Delete `src/app/browse-vm.svelte.js` and create `src/app/browse-vm.svelte.ts`
- [x] Annotate `_browseSearchTerm` as `string` in its `$state<string>('')` initialiser
- [x] Annotate `_browseTypeFilter` as `'all' | 'base' | 'large-expansion' | 'small-expansion'` in its `$state` initialiser (values sourced from `BROWSE_TYPE_OPTIONS` in `browse-utils.ts`)
- [x] Annotate `_expandedBrowseSetId` as `string | null` in its `$state<string | null>(null)` initialiser
- [x] Add explicit return-type annotations to all six getter/setter exports: `getBrowseSearchTerm(): string`, `setBrowseSearchTerm(v: string): void`, `getBrowseTypeFilter(): 'all' | 'base' | 'large-expansion' | 'small-expansion'`, `setBrowseTypeFilter(v: 'all' | 'base' | 'large-expansion' | 'small-expansion'): void`, `getExpandedBrowseSetId(): string | null`, `setExpandedBrowseSetId(v: string | null): void`
- [x] Per spec AC, add `_browseSortKey: 'name' | 'releaseYear' | 'collection'` to `browse-vm.svelte.ts` with initialiser `$state<'name' | 'releaseYear' | 'collection'>('name')` and export `getBrowseSortKey(): 'name' | 'releaseYear' | 'collection'` and `setBrowseSortKey(v: 'name' | 'releaseYear' | 'collection'): void` (values sourced from `BROWSE_SORT_OPTIONS` in `browse-utils.ts`); this moves `browseSortKey` out of `BrowseTab.svelte` local state
- [x] Update `src/components/BrowseTab.svelte`: remove `let browseSortKey = $state('name')` local declaration; import `getBrowseSortKey` and `setBrowseSortKey` from `../app/browse-vm.svelte.ts`; replace all direct `browseSortKey` reads with `getBrowseSortKey()` and all assignments with `setBrowseSortKey(…)`
- [x] Update `src/components/App.svelte`: change `from '../app/browse-vm.svelte.js'` to `from '../app/browse-vm.svelte.ts'`

### `new-game-vm.svelte.ts`

- [x] Add `PlayMode`, `GeneratedSetup`, and `ForcedPicks` type declarations to `src/app/types.ts` (or derive them from `setup-rules.ts` / `forced-picks-utils.ts` using `ReturnType`/`Parameters` helpers as appropriate)
- [x] Delete `src/app/new-game-vm.svelte.js` and create `src/app/new-game-vm.svelte.ts`
- [x] Annotate `_currentSetup` as `GeneratedSetup | null` in its `$state<GeneratedSetup | null>(null)` initialiser
- [x] Annotate `_generatorError` as `string | null` in its `$state<string | null>(null)` initialiser
- [x] Annotate `_generatorNotices` as `string[]` in its `$state<string[]>([])` initialiser
- [x] Annotate `_selectedPlayerCount` as `number` in its `$state<number>(1)` initialiser
- [x] Annotate `_selectedPlayMode` as `PlayMode` in its `$state<PlayMode>('standard')` initialiser
- [x] Annotate `_advancedSolo` as `boolean` in its `$state<boolean>(false)` initialiser
- [x] Annotate `_forcedPicks` as `ForcedPicks` in its `$state<ForcedPicks>(createEmptyForcedPicks())` initialiser
- [x] Add explicit return-type annotations to all exported getter, setter, and reset functions (`getCurrentSetup(): GeneratedSetup | null`, `setCurrentSetup(v: GeneratedSetup | null): void`, `getSelectedPlayerCount(): number`, `setSelectedPlayerCount(v: number): void`, `getSelectedPlayMode(): PlayMode`, `setSelectedPlayMode(v: PlayMode): void`, `getAdvancedSolo(): boolean`, `setAdvancedSolo(v: boolean): void`, `getForcedPicks(): ForcedPicks`, `setForcedPicks(v: ForcedPicks): void`, `resetForcedPicks(): void`, `resetNewGame(): void`, etc.)
- [x] Update `src/components/App.svelte`: change `from '../app/new-game-vm.svelte.js'` to `from '../app/new-game-vm.svelte.ts'`
- [x] **Test**: Run `npm run dev`; verify the New Game tab generates a setup; verify the Browse tab type filter and sort key (name/releaseYear/collection) behave correctly; confirm no console errors
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 3 — Migrate `history-vm.svelte.js`, `backup-vm.svelte.js`, and `import-vm.svelte.js` to TypeScript

### `history-vm.svelte.ts`

- [x] Add `GameOutcome`, `HistoryGroupingMode`, `ResultDraft`, and `PerPlayerScoreEntry` type declarations to `src/app/types.ts` (derive from or align with the shapes used in `history-utils.ts` and `result-utils.ts`)
- [x] Delete `src/app/history-vm.svelte.js` and create `src/app/history-vm.svelte.ts`
- [x] Annotate `_historyExpandedRecordId` as `string | null`
- [x] Annotate `_historyInsightsExpanded` as `boolean`
- [x] Annotate `_historyGroupingMode` with `HistoryGroupingMode` (the type of the values exported from `HISTORY_GROUPING_MODES` in `history-utils.ts`, e.g. `'game' | 'date'` or the appropriate union)
- [x] Annotate `_historyOutcomeFilter` as `GameOutcome | 'all'`
- [x] Annotate `_resultEditorRecordId` as `string | null`
- [x] Annotate `_resultEditorReturnFocusSelector` as `string | null`
- [x] Annotate `_resultDraft` with the inline `ResultDraft` type: `{ outcome: string; score?: string; notes: string; playerScores?: PerPlayerScoreEntry[] }`
- [x] Annotate `_resultFormError` as `string | null`
- [x] Annotate `_resultInvalidFields` as `string[]`
- [x] Add explicit return-type annotations to all exported functions, including `resetResultDraftForPlayerCount(playerCount: number): void`, `setResultPlayerScore(index: number, value: string): void`, and `setResultPlayerName(index: number, value: string): void`
- [x] Update `src/components/App.svelte`: change `from '../app/history-vm.svelte.js'` to `from '../app/history-vm.svelte.ts'`
- [x] Update `src/components/HistoryTab.svelte` line 10: change `from '../app/history-vm.svelte.js'` to `from '../app/history-vm.svelte.ts'`

### `backup-vm.svelte.ts`

- [x] Add `BackupPayload` and `ConfirmRestoreMode` type declarations to `src/app/types.ts` (align with the shape used in `backup-utils.mjs`)
- [x] Delete `src/app/backup-vm.svelte.js` and create `src/app/backup-vm.svelte.ts`
- [x] Annotate `_backupImportError` as `string | null`
- [x] Annotate `_stagedBackup` as `BackupPayload | null`
- [x] Annotate `_confirmBackupRestoreMode` as `ConfirmRestoreMode | null` (or `string | null` if no discriminated union exists)
- [x] Annotate `_lastBackupExportFileName` as `string | null`
- [x] Add explicit return-type annotations to all exported getter, setter, and `resetBackupDraft(): void` functions
- [x] Update `src/components/App.svelte`: change `from '../app/backup-vm.svelte.js'` to `from '../app/backup-vm.svelte.ts'`

### `import-vm.svelte.ts`

- [x] Add `ImportStatus` (`'idle' | 'loading' | 'success' | 'error'`) and `ImportSummary` type declarations to `src/app/types.ts` (align with shapes used in `bgg-import-utils.mjs` and `myludo-import-utils.mjs`)
- [x] Delete `src/app/import-vm.svelte.js` and create `src/app/import-vm.svelte.ts`
- [x] Annotate `myludoImportStatus` as `ImportStatus` in its `$state<ImportStatus>('idle')` initialiser
- [x] Annotate `myludoImportError` as `string`
- [x] Annotate `myludoImportSummary` as `ImportSummary | null`
- [x] Annotate `bggImportStatus` as `ImportStatus` in its `$state<ImportStatus>('idle')` initialiser
- [x] Annotate `bggImportError` as `string`
- [x] Annotate `bggImportSummary` as `ImportSummary | null`
- [x] Add explicit return-type annotations to all twelve exported getter/setter functions
- [x] Update `src/components/App.svelte`: change `from '../app/import-vm.svelte.js'` to `from '../app/import-vm.svelte.ts'`
- [x] **Test**: Run `npm run dev`; verify the History tab (record expansion, outcome filter, result editor), Backup tab (export and import flows), and BGG/MyLudo import flows in the Collection tab all function correctly; confirm no console errors and all five tabs boot
- [x] **QC (Automated)**: Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`; confirm all three exit 0; serve via `npm run dev` and verify application boots and all five tabs function correctly
