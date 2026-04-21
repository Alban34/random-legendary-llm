# Epic 66 — Migrate Svelte Reactive View Models to TypeScript

---

## Story 1 — Migrate `state-store.svelte.js` to `state-store.svelte.ts` and update all component consumers

- [ ] Create `src/app/types.ts` and declare the `AppState` type (either derived from `ReturnType<typeof createDefaultState>` imported from `state-store.mjs`, or as an explicit interface matching the state shape); this file will also be extended in Stories 2 and 3 for `PlayMode`, `GeneratedSetup`, `GameOutcome`, etc.
- [ ] Delete `src/app/state-store.svelte.js` and create `src/app/state-store.svelte.ts` with the same `export * from './state-store.mjs'` re-export and the same reactive logic
- [ ] In `state-store.svelte.ts`, annotate `_appState` with the `AppState` type in its `$state<AppState>(createDefaultState())` initialiser
- [ ] Annotate `getAppState()` with explicit return type `AppState`
- [ ] Annotate `setAppState(newState: AppState): void` with parameter and return types
- [ ] Confirm via `grep` that no file in `src/components/` currently imports from `state-store.svelte.js` (none do as of this writing); update any found imports to `state-store.svelte.ts`
- [ ] **Test**: Run `npm run dev`; boot the app and verify all five tabs (New Game, Browse, History, Backup, Collection) load and function correctly; confirm no console errors
- [ ] **QC (Automated)**: Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`; confirm all three exit 0

---

## Story 2 — Migrate `browse-vm.svelte.js` and `new-game-vm.svelte.js` to TypeScript

### `browse-vm.svelte.ts`

- [ ] Delete `src/app/browse-vm.svelte.js` and create `src/app/browse-vm.svelte.ts`
- [ ] Annotate `_browseSearchTerm` as `string` in its `$state<string>('')` initialiser
- [ ] Annotate `_browseTypeFilter` as `'all' | 'base' | 'large-expansion' | 'small-expansion'` in its `$state` initialiser (values sourced from `BROWSE_TYPE_OPTIONS` in `browse-utils.mjs`)
- [ ] Annotate `_expandedBrowseSetId` as `string | null` in its `$state<string | null>(null)` initialiser
- [ ] Add explicit return-type annotations to all six getter/setter exports: `getBrowseSearchTerm(): string`, `setBrowseSearchTerm(v: string): void`, `getBrowseTypeFilter(): 'all' | 'base' | 'large-expansion' | 'small-expansion'`, `setBrowseTypeFilter(v: 'all' | 'base' | 'large-expansion' | 'small-expansion'): void`, `getExpandedBrowseSetId(): string | null`, `setExpandedBrowseSetId(v: string | null): void`
- [ ] Per spec AC, add `_browseSortKey: 'name' | 'releaseYear' | 'collection'` to `browse-vm.svelte.ts` with initialiser `$state<'name' | 'releaseYear' | 'collection'>('name')` and export `getBrowseSortKey(): 'name' | 'releaseYear' | 'collection'` and `setBrowseSortKey(v: 'name' | 'releaseYear' | 'collection'): void` (values sourced from `BROWSE_SORT_OPTIONS` in `browse-utils.mjs`); this moves `browseSortKey` out of `BrowseTab.svelte` local state
- [ ] Update `src/components/BrowseTab.svelte`: remove `let browseSortKey = $state('name')` local declaration; import `getBrowseSortKey` and `setBrowseSortKey` from `../app/browse-vm.svelte.ts`; replace all direct `browseSortKey` reads with `getBrowseSortKey()` and all assignments with `setBrowseSortKey(…)`
- [ ] Update `src/components/App.svelte`: change `from '../app/browse-vm.svelte.js'` to `from '../app/browse-vm.svelte.ts'`

### `new-game-vm.svelte.ts`

- [ ] Add `PlayMode`, `GeneratedSetup`, and `ForcedPicks` type declarations to `src/app/types.ts` (or derive them from `setup-rules.mjs` / `forced-picks-utils.mjs` using `ReturnType`/`Parameters` helpers as appropriate)
- [ ] Delete `src/app/new-game-vm.svelte.js` and create `src/app/new-game-vm.svelte.ts`
- [ ] Annotate `_currentSetup` as `GeneratedSetup | null` in its `$state<GeneratedSetup | null>(null)` initialiser
- [ ] Annotate `_generatorError` as `string | null` in its `$state<string | null>(null)` initialiser
- [ ] Annotate `_generatorNotices` as `string[]` in its `$state<string[]>([])` initialiser
- [ ] Annotate `_selectedPlayerCount` as `number` in its `$state<number>(1)` initialiser
- [ ] Annotate `_selectedPlayMode` as `PlayMode` in its `$state<PlayMode>('standard')` initialiser
- [ ] Annotate `_advancedSolo` as `boolean` in its `$state<boolean>(false)` initialiser
- [ ] Annotate `_forcedPicks` as `ForcedPicks` in its `$state<ForcedPicks>(createEmptyForcedPicks())` initialiser
- [ ] Add explicit return-type annotations to all exported getter, setter, and reset functions (`getCurrentSetup(): GeneratedSetup | null`, `setCurrentSetup(v: GeneratedSetup | null): void`, `getSelectedPlayerCount(): number`, `setSelectedPlayerCount(v: number): void`, `getSelectedPlayMode(): PlayMode`, `setSelectedPlayMode(v: PlayMode): void`, `getAdvancedSolo(): boolean`, `setAdvancedSolo(v: boolean): void`, `getForcedPicks(): ForcedPicks`, `setForcedPicks(v: ForcedPicks): void`, `resetForcedPicks(): void`, `resetNewGame(): void`, etc.)
- [ ] Update `src/components/App.svelte`: change `from '../app/new-game-vm.svelte.js'` to `from '../app/new-game-vm.svelte.ts'`
- [ ] **Test**: Run `npm run dev`; verify the New Game tab generates a setup; verify the Browse tab type filter and sort key (name/releaseYear/collection) behave correctly; confirm no console errors
- [ ] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 3 — Migrate `history-vm.svelte.js`, `backup-vm.svelte.js`, and `import-vm.svelte.js` to TypeScript

### `history-vm.svelte.ts`

- [ ] Add `GameOutcome`, `HistoryGroupingMode`, `ResultDraft`, and `PerPlayerScoreEntry` type declarations to `src/app/types.ts` (derive from or align with the shapes used in `history-utils.mjs` and `result-utils.mjs`)
- [ ] Delete `src/app/history-vm.svelte.js` and create `src/app/history-vm.svelte.ts`
- [ ] Annotate `_historyExpandedRecordId` as `string | null`
- [ ] Annotate `_historyInsightsExpanded` as `boolean`
- [ ] Annotate `_historyGroupingMode` with `HistoryGroupingMode` (the type of the values exported from `HISTORY_GROUPING_MODES` in `history-utils.mjs`, e.g. `'game' | 'date'` or the appropriate union)
- [ ] Annotate `_historyOutcomeFilter` as `GameOutcome | 'all'`
- [ ] Annotate `_resultEditorRecordId` as `string | null`
- [ ] Annotate `_resultEditorReturnFocusSelector` as `string | null`
- [ ] Annotate `_resultDraft` with the inline `ResultDraft` type: `{ outcome: string; score?: string; notes: string; playerScores?: PerPlayerScoreEntry[] }`
- [ ] Annotate `_resultFormError` as `string | null`
- [ ] Annotate `_resultInvalidFields` as `string[]`
- [ ] Add explicit return-type annotations to all exported functions, including `resetResultDraftForPlayerCount(playerCount: number): void`, `setResultPlayerScore(index: number, value: string): void`, and `setResultPlayerName(index: number, value: string): void`
- [ ] Update `src/components/App.svelte`: change `from '../app/history-vm.svelte.js'` to `from '../app/history-vm.svelte.ts'`
- [ ] Update `src/components/HistoryTab.svelte` line 10: change `from '../app/history-vm.svelte.js'` to `from '../app/history-vm.svelte.ts'`

### `backup-vm.svelte.ts`

- [ ] Add `BackupPayload` and `ConfirmRestoreMode` type declarations to `src/app/types.ts` (align with the shape used in `backup-utils.mjs`)
- [ ] Delete `src/app/backup-vm.svelte.js` and create `src/app/backup-vm.svelte.ts`
- [ ] Annotate `_backupImportError` as `string | null`
- [ ] Annotate `_stagedBackup` as `BackupPayload | null`
- [ ] Annotate `_confirmBackupRestoreMode` as `ConfirmRestoreMode | null` (or `string | null` if no discriminated union exists)
- [ ] Annotate `_lastBackupExportFileName` as `string | null`
- [ ] Add explicit return-type annotations to all exported getter, setter, and `resetBackupDraft(): void` functions
- [ ] Update `src/components/App.svelte`: change `from '../app/backup-vm.svelte.js'` to `from '../app/backup-vm.svelte.ts'`

### `import-vm.svelte.ts`

- [ ] Add `ImportStatus` (`'idle' | 'loading' | 'success' | 'error'`) and `ImportSummary` type declarations to `src/app/types.ts` (align with shapes used in `bgg-import-utils.mjs` and `myludo-import-utils.mjs`)
- [ ] Delete `src/app/import-vm.svelte.js` and create `src/app/import-vm.svelte.ts`
- [ ] Annotate `myludoImportStatus` as `ImportStatus` in its `$state<ImportStatus>('idle')` initialiser
- [ ] Annotate `myludoImportError` as `string`
- [ ] Annotate `myludoImportSummary` as `ImportSummary | null`
- [ ] Annotate `bggImportStatus` as `ImportStatus` in its `$state<ImportStatus>('idle')` initialiser
- [ ] Annotate `bggImportError` as `string`
- [ ] Annotate `bggImportSummary` as `ImportSummary | null`
- [ ] Add explicit return-type annotations to all twelve exported getter/setter functions
- [ ] Update `src/components/App.svelte`: change `from '../app/import-vm.svelte.js'` to `from '../app/import-vm.svelte.ts'`
- [ ] **Test**: Run `npm run dev`; verify the History tab (record expansion, outcome filter, result editor), Backup tab (export and import flows), and BGG/MyLudo import flows in the Collection tab all function correctly; confirm no console errors and all five tabs boot
- [ ] **QC (Automated)**: Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`; confirm all three exit 0; serve via `npm run dev` and verify application boots and all five tabs function correctly
