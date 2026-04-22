# Epic 64 — Migrate Core Game Engine to TypeScript

## Story 1 — Migrate `setup-rules.mjs` and `solo-rules.mjs` to TypeScript

### `setup-rules.ts`

- [x] Delete `src/app/setup-rules.mjs`; create `src/app/setup-rules.ts` containing the identical logic
- [x] Add `import type { PlayMode, SetupRequirements } from './types.ts'` (and any additional shared types required)
- [x] Type `SETUP_RULES` as `Record<string | number, SetupRequirements>`
- [x] Type `PLAY_MODE_OPTIONS` as `Record<PlayMode, { label: string; soloLabel: string; description: string }>`
- [x] Add explicit parameter types and return type `PlayMode` to `resolvePlayMode(playerCount: number, modeOptions?: boolean | Record<string, unknown>): PlayMode`
- [x] Add explicit parameter types and return type `string` to `getPlayModeLabel(playMode: PlayMode, playerCount?: number): string`
- [x] Add explicit parameter types and a named return type (e.g. `SetupTemplate`) to `resolveSetupTemplate(playerCount: number, modeOptions?: boolean | Record<string, unknown>)`
- [x] Add explicit parameter type and return type to `summarizeSetupTemplate(template: SetupTemplate)`
- [x] Update `src/app/state-store.mjs`: change `from './setup-rules.mjs'` → `from './setup-rules.ts'`
- [x] Update `src/app/history-utils.mjs`: change `from './setup-rules.mjs'` → `from './setup-rules.ts'`
- [x] Update `src/app/new-game-utils.mjs`: change `from './setup-rules.mjs'` → `from './setup-rules.ts'`
- [x] Update `src/app/setup-generator.mjs`: change `from './setup-rules.mjs'` → `from './setup-rules.ts'`
- [x] Update `src/components/App.svelte`: change `from '../app/setup-rules.mjs'` → `from '../app/setup-rules.ts'`

### `solo-rules.ts`

- [x] Delete `src/app/solo-rules.mjs`; create `src/app/solo-rules.ts` containing the identical logic
- [x] Add `import type { PlayMode } from './types.ts'`
- [x] Type `SOLO_RULES_PANEL_MODES` as `ReadonlySet<PlayMode>` (cast the `new Set([...])` literal accordingly)
- [x] Add explicit parameter type and return type `string[] | null` to `getSoloRulesItems(playMode: PlayMode): string[] | null`
- [x] Update `src/components/NewGameTab.svelte`: change `from '../app/solo-rules.mjs'` → `from '../app/solo-rules.ts'`

### Test import updates

- [x] Update `test/epic56-standard-v2-solo.test.mjs`: change `from '../src/app/setup-rules.mjs'` → `from '../src/app/setup-rules.ts'`
- [x] Update `test/epic3-setup-generator.test.mjs`: change `from '../src/app/setup-rules.mjs'` → `from '../src/app/setup-rules.ts'`
- [x] Update `test/epic11-play-modes.test.mjs`: change `from '../src/app/setup-rules.mjs'` → `from '../src/app/setup-rules.ts'`
- [x] Update `test/epic57-solo-rules-panel.test.mjs`: change `from '../src/app/solo-rules.mjs'` → `from '../src/app/solo-rules.ts'`

### Verification

- [x] **Test**: Confirm TypeScript infers `SOLO_RULES_PANEL_MODES` narrowing correctly; verify `resolvePlayMode` return is assignable to `PlayMode` without casting; verify `getSoloRulesItems` return is `string[] | null` without `any`; confirm no logic changes by running the existing test suite for the affected stories
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 2 — Migrate `game-data-pipeline.mjs` to TypeScript

### `game-data-pipeline.ts`

- [x] Delete `src/app/game-data-pipeline.mjs`; create `src/app/game-data-pipeline.ts` containing the identical logic
- [x] Add `import type { RuntimeIndexes } from './types.ts'` (and any additional shared types required)
- [x] Add explicit parameter type and return type `string` to `slugify(value: unknown): string`
- [x] Add explicit parameter type and structured return type to `buildCanonicalSourceData(seed: SeedData)` — type all intermediate `set`, `entity`, and builder-map variables
- [x] Add explicit parameter type and structured return type to `normalizeGameData(source: CanonicalSourceData)` — type all intermediate normalization variables
- [x] Add explicit parameter and return types to `buildIndexes(sets: NormalizedSet[])`
- [x] Add explicit parameter and return types to `validateNormalizedData(sets: NormalizedSet[], indexes: RuntimeIndexes)`
- [x] Add explicit parameter and return types to `runEpic1Tests(seed: SeedData, source: CanonicalSourceData, runtime: RuntimeIndexes)`
- [x] Add explicit return type annotation `RuntimeIndexes` to `createEpic1Bundle(seed: SeedData): RuntimeIndexes`
- [x] Update `src/app/browse-utils.mjs`: change `from './game-data-pipeline.mjs'` → `from './game-data-pipeline.ts'`
- [x] Update `src/components/App.svelte`: change `from '../app/game-data-pipeline.mjs'` → `from '../app/game-data-pipeline.ts'`

### Test import updates

- [x] Update `test/epic1.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic2-state.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic3-setup-generator.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic5-browse-extensions.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic6-collection-management.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic7-new-game-experience.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic8-history-usage-reset.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic9-notifications-accessibility.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic11-play-modes.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic12-score-history.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic13-backup-portability.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic14-stats-dashboard.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic15-forced-picks.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic20-history-grouping.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic34-history-grouping.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic42-bgg-import.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic43-expansion-attribution.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic44-card-browser.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic45-myludo-import.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic46-active-filter.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic53-solo-scheme-eligibility.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`
- [x] Update `test/epic56-standard-v2-solo.test.mjs`: change `from '../src/app/game-data-pipeline.mjs'` → `from '../src/app/game-data-pipeline.ts'`

### Verification

- [x] **Test**: Confirm `createEpic1Bundle` return value is typed as `RuntimeIndexes` and is assignable to `RuntimeIndexes` parameters in callers without casting; verify no logic changes by running the existing test suite for the affected stories
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 3 — Migrate `setup-generator.mjs` to TypeScript

### `setup-generator.ts`

- [x] Delete `src/app/setup-generator.mjs`; create `src/app/setup-generator.ts` containing the identical logic
- [x] Add `import type { PlayMode, RuntimeIndexes, AppState, GeneratedSetup } from './types.ts'` (and any additional shared types required)
- [x] Update internal import: `from './setup-rules.mjs'` → `from './setup-rules.ts'` (already migrated in Story 1)
- [x] Update internal imports from `./forced-picks-utils.mjs` and `./object-utils.mjs` to `.ts` extensions if those modules were migrated in Epic 63; retain `.mjs` otherwise
- [x] Add explicit parameter types and return type to `rankItemsByFreshness(items: Entity[], usageBucket: UsageBucket, random?: () => number)`
- [x] Add explicit parameter types and return type to `buildOwnedPools(runtime: RuntimeIndexes, ownedSetIds: string[])`
- [x] Add explicit parameter types and return type to `applySchemeModifiersToTemplate(template: SetupTemplate, scheme: Scheme)`
- [x] Add explicit parameter types and return type to `validateSetupLegality({ runtime, state, playerCount, advancedSolo, playMode, forcedPicks }: ValidateLegalityOptions)` — define an inline or named options type
- [x] Add explicit parameter types and return type `GeneratedSetup` to `generateSetup({ runtime, state, playerCount, advancedSolo, playMode, forcedPicks, random }: GenerateSetupOptions): GeneratedSetup`
- [x] Add explicit parameter type and return type to `buildHistoryReadySetupSnapshot(setup: GeneratedSetup)`
- [x] Annotate all internal helper functions (`shuffle`, `getUsageStat`, `getFreshnessKey`, `summarizeFallback`, `selectFreshItems`, and any others) with parameter and return types
- [x] Update `src/app/collection-utils.mjs`: change `from './setup-generator.mjs'` → `from './setup-generator.ts'`
- [x] Update `src/components/App.svelte`: change `from '../app/setup-generator.mjs'` → `from '../app/setup-generator.ts'`
- [x] Update `src/components/NewGameTab.svelte`: change `from '../app/setup-generator.mjs'` → `from '../app/setup-generator.ts'`

### Test import updates

- [x] Update `test/epic3-setup-generator.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`
- [x] Update `test/epic7-new-game-experience.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`
- [x] Update `test/epic9-notifications-accessibility.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`
- [x] Update `test/epic11-play-modes.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`
- [x] Update `test/epic15-forced-picks.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`
- [x] Update `test/epic44-card-browser.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`
- [x] Update `test/epic46-active-filter.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`
- [x] Update `test/epic53-solo-scheme-eligibility.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`
- [x] Update `test/epic56-standard-v2-solo.test.mjs`: change `from '../src/app/setup-generator.mjs'` → `from '../src/app/setup-generator.ts'`

### Verification

- [x] **Test**: Confirm `generateSetup` accepts a typed `GeneratedSetup`-returning call without `any`; verify `buildOwnedPools` and `validateSetupLegality` parameter shapes are satisfied by their callers without casting; confirm no logic changes by running the existing test suite for the affected stories
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0

---

## Story 4 — Migrate `app-renderer.mjs` to TypeScript

### `app-renderer.ts`

- [x] Delete `src/app/app-renderer.mjs`; create `src/app/app-renderer.ts` containing the identical logic
- [x] Add `import type { RuntimeIndexes } from './types.ts'` (and any entity subtypes required by render parameters)
- [x] Add explicit parameter types and return type `void` to `renderInitializationError(doc: Document, error: Error): void`
- [x] Verify no Svelte components import from `app-renderer.mjs` directly (confirmed zero src/ callers at time of authoring); if any are found during migration, update their import paths to `../app/app-renderer.ts`

### Test path string updates

- [x] Update `test/design-system-rollout.test.mjs`: change the `fs.readFile` path argument from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic23-stats-simplification.test.mjs`: change the `fs.readFile` path argument from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic25-header-new-game.test.mjs`: change the `fs.readFile` path argument from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic-ux6-backup-safety.test.mjs`: change the `fs.readFile` path argument from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic24-toast-behavior.test.mjs`: change the `fs.readFile` path argument from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic27-shell-debug-polish.test.mjs`: change the `fs.readFile` path argument from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic21-browse-polish.test.mjs`: change the `fs.readFile` path argument from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic22-catalog-ordering.test.mjs`: change the `fs.readFile` path argument from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic9-notifications-accessibility.test.mjs`: change the path variable `rendererPath` from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic16-notification-refinements.test.mjs`: change the path variable `rendererPath` from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/epic17-onboarding-information-architecture.test.mjs`: change the path variable `rendererPath` from `'app-renderer.mjs'` → `'app-renderer.ts'`
- [x] Update `test/playwright/epic1-qc.spec.mjs`: change the dynamic `import()` path from `'./src/app/app-renderer.mjs'` → `'./src/app/app-renderer.ts'`

### Verification

- [x] **Test**: Confirm `renderInitializationError` parameter shape matches its call sites; confirm no logic changes by running the existing test suite for the affected stories; verify the Playwright smoke test referencing `renderInitializationError` resolves the updated path correctly
- [x] **QC (Automated)**: Run `npm run lint` and `npx tsc --noEmit`; confirm both exit 0. Run `npm run build`; confirm the bundle is produced without errors and the output references no deleted `.mjs` modules
