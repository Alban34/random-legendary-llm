# Epic 67 — Migrate Svelte Components to TypeScript

## Story 1 — Add `lang="ts"` to shell and shared components: `App.svelte`, `TabNav.svelte`, `ToastStack.svelte`, `ModalRoot.svelte`, `OnboardingShell.svelte`

### `App.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Type all `$state` declarations with explicit generics: `bundle` (`AppBundle | null`), `appState` (`AppState | null`), `locale` (`LocaleTools | null`), `persistence` (inline object type), `ui` (inline object type), `compactViewport` (`boolean`), `initError` (`Error | string | null`).
- [ ] Add explicit return types to `loadSeed()` and any other top-level async functions.
- [ ] Run `svelte-check` scoped to `App.svelte` and resolve all reported type errors.

### `TabNav.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type: `const { tabs, activeTab, locale, variant, navId, navLabel, onTabSelect, onTabKeydown }: { tabs: AppTab[]; activeTab: string; locale: LocaleTools; variant: string; navId: string; navLabel: string; onTabSelect: (id: string) => void; onTabKeydown: (id: string, key: string) => void } = $props();`.
- [ ] Add explicit `KeyboardEvent` type to the `onkeydown` inline arrow callback parameter `(e)`.
- [ ] Run `svelte-check` scoped to `TabNav.svelte` and resolve all reported type errors.

### `ToastStack.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type covering `toasts`, `locale`, `onDismiss`, `onPause`, and `onResume` with their correct callback signatures.
- [ ] Add explicit `MouseEvent` type to the `onclick` inline callback parameter `(e)` on the toast `<article>` element.
- [ ] Add explicit `FocusEvent` type to the `onfocusin` / `onfocusout` inline callback parameters.
- [ ] Run `svelte-check` scoped to `ToastStack.svelte` and resolve all reported type errors.

### `ModalRoot.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type: `{ modalConfig, locale }: { modalConfig: ModalConfig | null; locale: LocaleTools }`.
- [ ] Add explicit `KeyboardEvent` type to the `event` parameter of `handleModalKeydown(event)`.
- [ ] Add return type annotation `void` to `handleModalKeydown`.
- [ ] Run `svelte-check` scoped to `ModalRoot.svelte` and resolve all reported type errors.

### `OnboardingShell.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type: `{ locale, visible, step, onboardingActions }: { locale: LocaleTools; visible: boolean; step: number; onboardingActions: OnboardingActions }`.
- [ ] Add explicit types to all `$derived` variables: `clampedStep` (`number`), `currentStep` (inline step object type or named type), `isLastStep` (`boolean`), `currentStepNumber` (`number`).
- [ ] Run `svelte-check` scoped to `OnboardingShell.svelte` and resolve all reported type errors.

### Story 1 verification
- [ ] **Test**: Start the app with `npm run dev`; navigate through all five tabs; confirm the tab navigation, toast dismissal, modal open/close, and onboarding shell all render and function correctly with no console errors.
- [ ] **QC (Automated)**: Run `npm run lint` (includes `svelte-check`) and confirm exit 0; run `npm run build` and confirm a valid bundle is produced with zero type errors.

---

## Story 2 — Add `lang="ts"` to browse and collection components: `BrowseTab.svelte`, `CollectionTab.svelte`, `CardBrowserByCategory.svelte`, `CardBrowserByExpansion.svelte`

### `BrowseTab.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type covering all 21 props: `bundle`, `appState`, `locale`, `persistence`, `browseSearchTerm`, `browseTypeFilter`, `expandedBrowseSetId`, `compactViewport`, `aboutPanelOpen`, `onboardingVisible`, `currentSetup`, `selectedTab`, `onToggleOwnedSet`, `onSetSearchTerm`, `onSetTypeFilter`, `onToggleSetExpanded`, `onJumpTab`, `onToggleAboutPanel`, `onStartOnboarding`.
- [ ] Add explicit generic to `browseSortKey`: `$state<string>('name')`.
- [ ] Add explicit types to `$derived` variables: `firstRun` (`boolean`), `ownedSetIds` (`Set<string>`), `browseSets` (return type of `filterBrowseSets`).
- [ ] Add explicit parameter type to `formatBrowseMastermind(mastermind)` using the appropriate runtime mastermind type.
- [ ] Add explicit return type to `formatDuplicateEntries()`.
- [ ] Run `svelte-check` scoped to `BrowseTab.svelte` and resolve all reported type errors.

### `CollectionTab.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type covering all props including optional props with defaults: `myludoImportStatus`, `myludoImportError`, `myludoImportSummary`, `bggImportStatus`, `bggImportError`, `bggImportSummary`.
- [ ] Add explicit generics to `$state` declarations: `bggUsername: $state<string>('')`, `collectionView: $state<string>('sets')`, `cardBrowserGrouping: $state<string>('category')`.
- [ ] Add explicit types to `$derived` variables: `totals`, `feasibility`, `groupedSets`, `ownedSetSet` (`Set<string>`), `persistenceNotices`.
- [ ] Run `svelte-check` scoped to `CollectionTab.svelte` and resolve all reported type errors.

### `CardBrowserByCategory.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type: `{ pools, locale }: { pools: OwnedPools; locale: LocaleTools }`, importing or referencing the `OwnedPools` type from the appropriate runtime module (e.g. `setup-generator.mjs` return type of `buildOwnedPools`).
- [ ] Add explicit type to the `$derived` variable `categories` (return type of `getCardsByCategory`).
- [ ] Run `svelte-check` scoped to `CardBrowserByCategory.svelte` and resolve all reported type errors.

### `CardBrowserByExpansion.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with the same explicit inline prop type used in `CardBrowserByCategory.svelte`: `{ pools, locale }: { pools: OwnedPools; locale: LocaleTools }`.
- [ ] Add explicit type to the `$derived` variable `expansions` (return type of `getCardsByExpansion`).
- [ ] Run `svelte-check` scoped to `CardBrowserByExpansion.svelte` and resolve all reported type errors.

### Story 2 verification
- [ ] **Test**: Start the app with `npm run dev`; open the Browse tab and verify search, type filter, and set expansion work; open the Collection tab and verify set checklist, card browser by category, and card browser by expansion all render correctly; confirm no console errors.
- [ ] **QC (Automated)**: Run `npm run lint` (includes `svelte-check`) and confirm exit 0.

---

## Story 3 — Add `lang="ts"` to remaining feature tab components: `NewGameTab.svelte`, `HistoryTab.svelte`, `BackupTab.svelte`

### `NewGameTab.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type covering all 13 props: `bundle`, `appState`, `locale`, `selectedPlayerCount`, `selectedPlayMode`, `advancedSolo`, `currentSetup`, `generatorError`, `generatorNotices`, `forcedPicks`, `compactViewport`, `gameActions`.
- [ ] Add explicit types to all `$derived` variables: `availablePlayModes`, `displayedRequirements`, `hasActiveForcedPicks` (`boolean`), `soloRulesItems`.
- [ ] Add explicit types to all `$derived.by()` variables: `filterFeasibility`, `ownedForcedPickOptions` (inline object type with `schemeId`, `mastermindId`, `heroIds`, `villainGroupIds`, `henchmanGroupIds` arrays), `modeIneligibleSchemeIds` (`Set<string>`).
- [ ] Run `svelte-check` scoped to `NewGameTab.svelte` and resolve all reported type errors.

### `HistoryTab.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type covering all 13 props: `bundle`, `appState`, `locale`, `compactViewport`, `historyGroupingMode`, `historyInsightsExpanded`, `historyExpandedRecordId`, `resultEditorRecordId`, `resultDraft`, `resultFormError`, `resultInvalidFields`, `historyActions`.
- [ ] Add explicit types to all `$derived` variables: `activeGroupingMode` (`string`), `filteredHistory`, `groups`, `filteredCount` (`number`), `dashboard`, `insightsExpanded` (`boolean`).
- [ ] Add explicit parameter and return types to `formatInsightMetric(value, options?)`, `getLocalizedGroupLabel(group)`, and `getHelperCopy(outcome)`.
- [ ] Run `svelte-check` scoped to `HistoryTab.svelte` and resolve all reported type errors.

### `BackupTab.svelte`
- [ ] Add `lang="ts"` to the `<script>` block.
- [ ] Replace the bare `$props()` destructuring with an explicit inline prop type: `{ bundle, appState, locale, compactViewport, backupImportError, stagedBackup, backupActions }: { bundle: AppBundle; appState: AppState; locale: LocaleTools; compactViewport: boolean; backupImportError: string | null; stagedBackup: BackupPayload | null; backupActions: BackupActions }`.
- [ ] Add explicit type to the `$derived` variable `indicators` (return type of `summarizeUsageIndicators`).
- [ ] Add explicit `Event` type to the `e` parameter of `handleFileChange(e)` and cast `e.target` to `HTMLInputElement` where `.files` is accessed.
- [ ] Run `svelte-check` scoped to `BackupTab.svelte` and resolve all reported type errors.

### Story 3 verification
- [ ] **Test**: Start the app with `npm run dev`; verify all five tabs (Browse, Collection, New Game, History, Backup) render and function correctly end-to-end; generate a game setup, log a result, export a backup, and confirm no console errors or TypeScript-related runtime exceptions.
- [ ] **QC (Automated)**: Run `npm run lint` (includes `svelte-check`) and confirm exit 0 across the entire `src/` directory; run `npm run build` and confirm a valid production bundle is produced with zero TypeScript errors remaining in the codebase.
