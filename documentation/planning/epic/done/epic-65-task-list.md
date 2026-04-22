# Epic 65 — Migrate App Services & Integrations to TypeScript

## Story 1 — Migrate `state-store.mjs` and `app-tabs.mjs` to TypeScript

- [x] Verify `tsconfig.json` includes `"lib": ["ESNext", "DOM"]`; add it if absent
- [x] Rename `src/app/app-tabs.mjs` → `src/app/app-tabs.ts`; delete `app-tabs.mjs`
- [x] In `src/app/app-tabs.ts`, annotate `APP_TABS` as a typed readonly constant, `DEFAULT_TAB_ID` as `string`, `normalizeSelectedTab(value: unknown): string | null`, and `getAdjacentTabId(currentId: string, direction: string): string | null`
- [x] Rename `src/app/state-store.mjs` → `src/app/state-store.ts`; delete `state-store.mjs`
- [x] In `src/app/state-store.ts`, update internal import of `'./app-tabs.mjs'` → `'./app-tabs'`
- [x] Annotate `createDefaultState(): AppState`
- [x] Annotate `sanitizePersistedState({ candidate, indexes }: { candidate: unknown; indexes: Indexes }): AppState`
- [x] Annotate `createStorageAdapter(storageCandidate: unknown): StorageAdapter` (define or import `StorageAdapter` interface as needed in `src/app/types.ts`)
- [x] Annotate `loadState({ storageAdapter, indexes }: { storageAdapter: StorageAdapter; indexes: Indexes }): AppState`
- [x] Annotate `hydrateState` (re-export alias of `loadState`) — verify the `export const hydrateState = loadState` line carries through the typed signature
- [x] Annotate `saveState({ storageAdapter, state }: { storageAdapter: StorageAdapter; state: AppState }): void`
- [x] Annotate `updateState({ storageAdapter, indexes, currentState, updater }: { storageAdapter: StorageAdapter; indexes: Indexes; currentState: AppState; updater: (s: AppState) => AppState }): AppState`
- [x] Annotate `setActiveSetIds(state: AppState, ids: string[]): AppState`
- [x] Annotate `clearActiveSetIds(state: AppState): AppState`
- [x] Annotate `deactivateAllSets(state: AppState): AppState`
- [x] Annotate `toggleOwnedSet(state: AppState, setId: string): AppState`
- [x] Annotate `incrementUsageStat`, `createGameRecordId`, `createGameRecord`, `acceptGameSetup`, `updateGameResult`, `resetUsageCategory`, `resetOwnedCollection`, and any remaining exports with explicit parameter and return types
- [x] Update import in `src/app/state-store.svelte.js`: `'./state-store.mjs'` → `'./state-store'`
- [x] Update import in `src/app/backup-utils.mjs`: `'./state-store.mjs'` → `'./state-store'`
- [x] Update import in `src/app/history-utils.mjs`: `'./state-store.mjs'` → `'./state-store'`
- [x] Update import in `src/app/stats-utils.mjs`: `'./state-store.mjs'` → `'./state-store'`
- [x] Update imports in `src/components/App.svelte`: `'../app/app-tabs.mjs'` → `'../app/app-tabs'` and `'../app/state-store.mjs'` → `'../app/state-store'`
- [x] Update test import path in `test/epic2-state.test.mjs`: `'../src/app/state-store.mjs'` → `'../src/app/state-store'`
- [x] Update test import path in `test/epic3-setup-generator.test.mjs`
- [x] Update test import paths in `test/epic4-shell-navigation.test.mjs` (both `app-tabs.mjs` and `state-store.mjs`)
- [x] Update test import path in `test/epic6-collection-management.test.mjs`
- [x] Update test import path in `test/epic7-new-game-experience.test.mjs`
- [x] Update test import path in `test/epic8-history-usage-reset.test.mjs`
- [x] Update test import path in `test/epic9-notifications-accessibility.test.mjs`
- [x] Update test import path in `test/epic11-play-modes.test.mjs`
- [x] Update test import path in `test/epic12-score-history.test.mjs`
- [x] Update test import path in `test/epic13-backup-portability.test.mjs` (state-store import only; backup-utils import handled in Story 2)
- [x] Update test import path in `test/epic14-stats-dashboard.test.mjs`
- [x] Update test import path in `test/epic15-forced-picks.test.mjs`
- [x] Update test import path in `test/epic17-onboarding-information-architecture.test.mjs`
- [x] Update test import path in `test/epic18-theme-personalization.test.mjs` (state-store import only)
- [x] Update test import path in `test/epic19-localization.test.mjs` (state-store import only; localization-utils import handled in Story 3)
- [x] Update test import path in `test/epic42-bgg-import.test.mjs` (state-store import only)
- [x] Update test import path in `test/epic45-myludo-import.test.mjs` (state-store import only)
- [x] Update test import path in `test/epic46-active-filter.test.mjs`
- [x] Update test import path in `test/epic53-solo-scheme-eligibility.test.mjs`
- [x] Update test import path in `test/epic56-standard-v2-solo.test.mjs`
- [x] **Test**: Manually confirm `createDefaultState()` return type is inferred as `AppState`; confirm `setActiveSetIds`, `clearActiveSetIds`, and `deactivateAllSets` reject non-`AppState` arguments at compile time; confirm `normalizeSelectedTab` return type is `string | null`
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 2 — Migrate `backup-utils.mjs` to TypeScript

- [x] Rename `src/app/backup-utils.mjs` → `src/app/backup-utils.ts`; delete `backup-utils.mjs`
- [x] In `src/app/backup-utils.ts`, update internal import of `'./state-store.mjs'` → `'./state-store'` and `'./object-utils.mjs'` → `'./object-utils'`
- [x] Annotate `BACKUP_SCHEMA_ID` as `string` and `BACKUP_SCHEMA_VERSION` as `number`
- [x] Annotate `createBackupPayload(state: AppState, options?: { exportedAt?: string }): BackupPayload` (define `BackupPayload` type in `src/app/types.ts` if not already present)
- [x] Annotate `buildBackupFilename(exportedAt?: string): string`
- [x] Annotate `parseBackupPayload(payload: unknown, { indexes }: { indexes: Indexes }): { ok: true; data: AppState } | { ok: false; errors: string[] }` — add the discriminated union return type
- [x] Annotate `parseBackupText(rawText: unknown, { indexes }: { indexes: Indexes }): { ok: true; data: AppState } | { ok: false; errors: string[] }` — same discriminated union
- [x] Annotate `mergeImportedState(currentState: AppState, importedState: AppState): AppState`
- [x] Annotate `summarizeBackupState(state: AppState): BackupSummary` (define or inline return type)
- [x] Update import in `src/components/App.svelte`: `'../app/backup-utils.mjs'` → `'../app/backup-utils'`
- [x] Update test import path in `test/epic13-backup-portability.test.mjs`: `'../src/app/backup-utils.mjs'` → `'../src/app/backup-utils'`
- [x] Update import path in `test/playwright/epic13-qc.spec.mjs`: `'../../src/app/backup-utils.mjs'` → `'../../src/app/backup-utils'`
- [x] **Test**: Confirm `parseBackupPayload` and `parseBackupText` return types are narrowed correctly in a discriminated union branch (e.g., after `if (result.ok)`, `result.data` is typed as `AppState`); confirm `mergeImportedState` rejects non-`AppState` arguments at compile time
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 3 — Migrate `localization-utils.mjs` and all six locale files to TypeScript

- [x] Rename `src/app/locales/en.mjs` → `src/app/locales/en.ts`; annotate the `EN_MESSAGES` export as `Record<string, string>`; delete `en.mjs`
- [x] Rename `src/app/locales/fr.mjs` → `src/app/locales/fr.ts`; annotate the `FR_MESSAGES` export as `Record<string, string>`; delete `fr.mjs`
- [x] Rename `src/app/locales/de.mjs` → `src/app/locales/de.ts`; annotate the `DE_MESSAGES` export as `Record<string, string>`; delete `de.mjs`
- [x] Rename `src/app/locales/ja.mjs` → `src/app/locales/ja.ts`; annotate the `JA_MESSAGES` export as `Record<string, string>`; delete `ja.mjs`
- [x] Rename `src/app/locales/ko.mjs` → `src/app/locales/ko.ts`; annotate the `KO_MESSAGES` export as `Record<string, string>`; delete `ko.mjs`
- [x] Rename `src/app/locales/es.mjs` → `src/app/locales/es.ts`; annotate the `ES_MESSAGES` export as `Record<string, string>`; delete `es.mjs`
- [x] Rename `src/app/localization-utils.mjs` → `src/app/localization-utils.ts`; delete `localization-utils.mjs`
- [x] In `src/app/localization-utils.ts`, update all six locale imports from `'./locales/en.mjs'` etc. → `'./locales/en'` etc.
- [x] Annotate `DEFAULT_LOCALE_ID` as `LocaleId` (ensure `LocaleId` is defined in `src/app/types.ts` as a union of the six locale ID strings)
- [x] Annotate `normalizeLocaleId(localeId: unknown): LocaleId`
- [x] Annotate `getSelectableLocales(): Array<{ id: LocaleId; label: string; nativeLabel: string }>`
- [x] Annotate `getLocaleOption(localeId: LocaleId): { id: LocaleId; label: string; nativeLabel: string } | undefined`
- [x] Annotate `createLocaleTools(localeId: LocaleId): LocaleTools` (define `LocaleTools` type in `src/app/types.ts` or inline; include `t(key: string, params?: Record<string, unknown>): string` and date/number formatter signatures)
- [x] Update import in `src/app/state-store.ts`: `'./localization-utils.mjs'` → `'./localization-utils'`
- [x] Update import in `src/app/result-utils.mjs`: `'./localization-utils.mjs'` → `'./localization-utils'`
- [x] Update import in `src/components/App.svelte`: `'../app/localization-utils.mjs'` → `'../app/localization-utils'`
- [x] Update test import path in `test/epic19-localization.test.mjs`: `'../src/app/localization-utils.mjs'` → `'../src/app/localization-utils'`
- [x] Update file path string in `test/epic27-shell-debug-polish.test.mjs` line referencing `'src/app/localization-utils.mjs'` → `'src/app/localization-utils.ts'`
- [x] **Test**: Confirm `normalizeLocaleId` return type is `LocaleId`; confirm passing an invalid locale string to `normalizeLocaleId` does not cause a type error (it accepts `unknown`); confirm locale message constants are inferred as `Record<string, string>` and not `{ [key: string]: string }` with excess properties
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 4 — Migrate `theme-utils.mjs`, `browser-entry.mjs`, and `bgg-import-utils.mjs` to TypeScript

- [x] Rename `src/app/theme-utils.mjs` → `src/app/theme-utils.ts`; delete `theme-utils.mjs`
- [x] In `src/app/theme-utils.ts`, annotate `DEFAULT_THEME_ID` as `ThemeId` (ensure `ThemeId` is defined in `src/app/types.ts`)
- [x] Annotate `THEME_OPTIONS` as a typed readonly array of theme option objects
- [x] Annotate `isSupportedThemeId(themeId: unknown): themeId is ThemeId` (type predicate)
- [x] Annotate `normalizeThemeId(themeId: unknown): ThemeId`
- [x] Annotate `getThemeDefinition(themeId: ThemeId): ThemeDefinition` (define or import `ThemeDefinition` type)
- [x] Update import in `src/app/state-store.ts`: `'./theme-utils.mjs'` → `'./theme-utils'`
- [x] Update import in `src/components/App.svelte`: `'../app/theme-utils.mjs'` → `'../app/theme-utils'`
- [x] Update test import path in `test/design-system-epic1-foundation.test.mjs`: `'../src/app/theme-utils.mjs'` → `'../src/app/theme-utils'`
- [x] Update test import path in `test/epic18-theme-personalization.test.mjs`: `'../src/app/theme-utils.mjs'` → `'../src/app/theme-utils'`
- [x] Rename `src/app/browser-entry.mjs` → `src/app/browser-entry.ts`; delete `browser-entry.mjs`
- [x] In `src/app/browser-entry.ts`, ensure `mount` import from `'svelte'` is typed correctly; annotate the `document.getElementById('app')` argument cast as `HTMLElement` to satisfy the Svelte `mount` target type
- [x] Update `index.html` script src: `'./src/app/browser-entry.mjs'` → `'./src/app/browser-entry.ts'`
- [x] Update file path string in `test/epic25-header-new-game.test.mjs` referencing `'src/app/browser-entry.mjs'` → `'src/app/browser-entry.ts'`
- [x] Update file path string in `test/epic16-notification-refinements.test.mjs` referencing `'src/app/browser-entry.mjs'` → `'src/app/browser-entry.ts'`
- [x] Rename `src/app/bgg-import-utils.mjs` → `src/app/bgg-import-utils.ts`; delete `bgg-import-utils.mjs`
- [x] In `src/app/bgg-import-utils.ts`, update any internal imports pointing to `.mjs` modules already migrated in earlier stories
- [x] Annotate `fetchBggCollection` parameters (including optional `signal: AbortSignal`) and return type `Promise<BggMatchResult>` (define or import `BggMatchResult` from `src/app/types.ts`)
- [x] Annotate `matchBggNamesToSets(bggGameNames: string[], sets: GameSet[]): BggMatchResult`
- [x] Update import in `src/components/App.svelte`: `'../app/bgg-import-utils.mjs'` → `'../app/bgg-import-utils'`
- [x] Update test import path in `test/epic42-bgg-import.test.mjs`: `'../src/app/bgg-import-utils.mjs'` → `'../src/app/bgg-import-utils'`
- [x] **Test**: Confirm `normalizeThemeId` accepts `unknown` and returns `ThemeId`; confirm `fetchBggCollection` return type is `Promise<BggMatchResult>` and the optional `signal` parameter is typed as `AbortSignal`; confirm `browser-entry.ts` compiles without any implicit `any` on the `mount` target
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 5 — Migrate `myludo-import-utils.mjs` to TypeScript and confirm the full service layer compiles cleanly

- [x] Rename `src/app/myludo-import-utils.mjs` → `src/app/myludo-import-utils.ts`; delete `myludo-import-utils.mjs`
- [x] In `src/app/myludo-import-utils.ts`, update any internal imports pointing to `.mjs` modules already migrated in earlier stories
- [x] Annotate `parseMyludoFile(file: File): Promise<string[]>` — `File` is provided by the DOM lib; confirm `"lib": ["ESNext", "DOM"]` is active
- [x] Annotate `matchMyludoNamesToSets(myludoGameNames: string[], sets: GameSet[]): MyludoMatchResult` (define or import `MyludoMatchResult` from `src/app/types.ts`)
- [x] Update import in `src/components/App.svelte`: `'../app/myludo-import-utils.mjs'` → `'../app/myludo-import-utils'`
- [x] Update test import path in `test/epic45-myludo-import.test.mjs`: `'../src/app/myludo-import-utils.mjs'` → `'../src/app/myludo-import-utils'`
- [x] Perform a final audit: search `src/` for any remaining `.mjs` import specifiers that reference a module already migrated to `.ts` in this epic; fix any missed references
- [x] **Test**: Confirm `parseMyludoFile` rejects a non-`File` argument at compile time; confirm `matchMyludoNamesToSets` return type is inferred as `MyludoMatchResult`; confirm no implicit `any` errors remain across the full `src/app/` service layer
- [x] **QC (Automated)**: Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`; confirm all three exit 0
