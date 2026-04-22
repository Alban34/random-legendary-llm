# Epic 62 — Domain Type Declarations: Task List

**Objective:** Create `src/app/types.ts` as the single authoritative TypeScript type file for all domain concepts used across the application. No existing source files are modified.

---

## Story 1 — Define game data and `SetType` types (`GameSet`, card entity shapes)

- [x] Create `src/app/types.ts` with a file-level comment referencing this epic (Epic 62).
- [x] Export `SetType` as `'base' | 'large-expansion' | 'small-expansion' | 'standalone'`, matching the `type` values in `src/data/canonical-game-data.json`'s `setCatalog` entries.
- [x] Export `HeroCard` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `teams: string[]`, `cardCount: number` — matching the shape built by `entityBuilders.heroes` in `game-data-pipeline.mjs`.
- [x] Export `MastermindCard` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `leadName: string | null`, `leadCategory: string | null`, `notes: string[]` — matching `entityBuilders.masterminds` in `game-data-pipeline.mjs`.
- [x] Export `VillainGroupCard` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `cardCount: number` — matching `entityBuilders.villainGroups`.
- [x] Export `HenchmanGroupCard` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `cardCount: number` — matching `entityBuilders.henchmanGroups`.
- [x] Export `SchemeCard` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `constraints: { minimumPlayerCount: number | null }`, `forcedGroups: Array<{ name: string; category: string }>`, `modifiers: unknown[]`, `notes: string[]` — matching `entityBuilders.schemes` (pre-normalization shape).
- [x] Export `GameSet` interface with fields: `id: string`, `name: string`, `year: number`, `type: SetType`, `aliases: string[]`, `heroes: HeroCard[]`, `masterminds: MastermindCard[]`, `villainGroups: VillainGroupCard[]`, `henchmanGroups: HenchmanGroupCard[]`, `schemes: SchemeCard[]` — matching the set shape produced by `buildCanonicalSourceData()` in `game-data-pipeline.mjs`.
- [x] **Test**: Manually verify that the `GameSet` type aligns with at least two concrete entries in `src/data/canonical-game-data.json` (e.g., "Core Set" and "Dark City") — confirm all required fields are present and the optional `aliases` array is typed correctly.
- [x] **QC (Automated)**: Run `npx tsc --noEmit` and `npm run lint`; confirm both exit 0.

---

## Story 2 — Define runtime index types (`*Runtime` shapes and `RuntimeIndexes`)

- [x] Export `HeroRuntime` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `teams: string[]`, `cardCount: number` — matching the hero shape after `normalizeGameData()` (identical to `HeroCard` post-pipeline; no cross-reference resolution changes heroes).
- [x] Export `MastermindRuntime` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `lead: { category: string; id: string } | null`, `notes: string[]` — matching the resolved mastermind shape from `normalizeGameData()` (where `leadName`/`leadCategory` are resolved to `lead`).
- [x] Export `VillainGroupRuntime` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `cardCount: number` — matching the villain group shape in `buildIndexes()`.
- [x] Export `HenchmanGroupRuntime` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `cardCount: number` — matching the henchman group shape in `buildIndexes()`.
- [x] Export `SchemeRuntime` interface with fields: `id: string`, `setId: string`, `name: string`, `aliases: string[]`, `constraints: { minimumPlayerCount: number | null; incompatiblePlayModes?: string[] }`, `forcedGroups: Array<{ category: string; id: string }>`, `modifiers: unknown[]`, `notes: string[]` — matching the resolved scheme shape from `normalizeGameData()` (where `forcedGroups` references are resolved from names to IDs).
- [x] Export `RuntimeIndexes` interface with fields: `setsById: Record<string, GameSet>`, `heroesById: Record<string, HeroRuntime>`, `mastermindsById: Record<string, MastermindRuntime>`, `villainGroupsById: Record<string, VillainGroupRuntime>`, `henchmanGroupsById: Record<string, HenchmanGroupRuntime>`, `schemesById: Record<string, SchemeRuntime>`, `setsList: GameSet[]` — aligning with the index object produced by `buildIndexes()` in `game-data-pipeline.mjs` (note: `setsList` corresponds to the ordered list of all sets).
- [x] **Test**: Cross-check `RuntimeIndexes` field names against the `USAGE_INDEX_KEYS` constant in `state-store.mjs` (`heroesById`, `mastermindsById`, `villainGroupsById`, `henchmanGroupsById`, `schemesById`) and against the `indexes.setsById` reference in `sanitizeOwnedSetIds()` to confirm all keys are spelled correctly.
- [x] **QC (Automated)**: Run `npx tsc --noEmit` and `npm run lint`; confirm both exit 0.

---

## Story 3 — Define application state types (`AppState` and all its slices, `PlayMode`, `ThemeId`, `LocaleId`)

- [x] Export `PlayMode` as `'standard' | 'advanced-solo' | 'two-handed-solo' | 'standard-solo-v2'` — matching the mode strings validated in `setup-rules.mjs` (`resolvePlayMode`).
- [x] Export `ThemeId` as `'dark' | 'light'` — matching the values normalised by `normalizeThemeId` in `theme-utils.mjs`.
- [x] Export `LocaleId` as `'en-US' | 'fr-FR' | 'de-DE' | 'ja-JP' | 'ko-KR' | 'es-ES'` — matching the values normalised by `normalizeLocaleId` in `localization-utils.mjs`.
- [x] Export `UsageStat` interface with fields: `plays: number`, `lastPlayedAt: string | null` — matching the shape returned by `sanitizeUsageStat()` in `state-store.mjs`.
- [x] Export `UsageCategoryMap` as `Record<string, UsageStat>` (keyed by runtime entity ID).
- [x] Export `UsageState` interface with fields: `heroes: UsageCategoryMap`, `masterminds: UsageCategoryMap`, `villainGroups: UsageCategoryMap`, `henchmanGroups: UsageCategoryMap`, `schemes: UsageCategoryMap` — matching `createDefaultUsageState()` in `state-store.mjs`.
- [x] Export `CollectionState` interface with fields: `ownedSetIds: string[]`, `activeSetIds: string[] | null` — matching the `collection` slice in `createDefaultState()`.
- [x] Export `Preferences` interface with fields: `lastPlayerCount: number`, `lastAdvancedSolo: boolean`, `lastPlayMode: PlayMode`, `selectedTab: string | null`, `onboardingCompleted: boolean`, `themeId: ThemeId`, `localeId: LocaleId` — matching `createDefaultPreferences()` in `state-store.mjs`.
- [x] Export `GameOutcome` as `'win' | 'loss' | 'draw'` — matching the `id` values in `GAME_OUTCOME_OPTIONS` in `result-utils.mjs`.
- [x] Export `GameResultStatus` as `'pending' | 'completed'` — matching `GAME_RESULT_STATUS_PENDING` and `GAME_RESULT_STATUS_COMPLETED` in `result-utils.mjs`.
- [x] Export `PlayerScoreEntry` interface with fields: `playerName: string`, `score: number | null` — matching `createPlayerScoreEntry()` in `result-utils.mjs`.
- [x] Export `GameResult` as a discriminated union on `status`: pending branch `{ status: 'pending'; outcome: null; score: null; notes: string; updatedAt: null }` and completed branch `{ status: 'completed'; outcome: GameOutcome; score: number | null | PlayerScoreEntry[]; notes: string; updatedAt: string }` — matching `createPendingGameResult()` and `createCompletedGameResult()` in `result-utils.mjs`.
- [x] Export `HistoryRecord` interface with fields: `id: string`, `createdAt: string`, `playerCount: number`, `advancedSolo: boolean`, `playMode: PlayMode`, `setupSnapshot: { mastermindId: string; schemeId: string; heroIds: string[]; villainGroupIds: string[]; henchmanGroupIds: string[] }`, `result: GameResult` — matching the sanitized record shape returned by `sanitizeGameRecord()` in `state-store.mjs`.
- [x] Export `AppState` interface with fields: `schemaVersion: number`, `collection: CollectionState`, `usage: UsageState`, `history: HistoryRecord[]`, `preferences: Preferences` — matching `createDefaultState()` in `state-store.mjs`.
- [x] **Test**: Verify each exported union literal against `state-store.mjs` constants: `PlayMode` values against `resolvePlayMode` branch logic; `GameOutcome` values against `GAME_OUTCOME_OPTIONS`; `HistoryRecord.setupSnapshot` field names against those checked in `sanitizeGameRecord()` (`mastermindId`, `schemeId`, `heroIds`, `villainGroupIds`, `henchmanGroupIds`).
- [x] **QC (Automated)**: Run `npx tsc --noEmit` and `npm run lint`; confirm both exit 0.

---

## Story 4 — Define setup output types (`SetupRequirements`, `GeneratedSetup`) and import utility return types

- [x] Export `SetupRequirements` interface with fields: `heroCount: number`, `villainGroupCount: number`, `henchmanGroupCount: number`, `wounds: number`, `bystanders: number`, `heroNameRequirements: Array<{ pattern: string; value: number }>` — matching the object built by `applySchemeModifiersToTemplate()` in `setup-generator.mjs`.
- [x] Export `GeneratedSetup` interface to match the object returned by `generateSetup()` via `tryMastermindForScheme()` in `setup-generator.mjs`, with fields:
  - `template: { playerCount: number; effectivePlayerCount: number; advancedSolo: boolean; playMode: PlayMode; modeLabel: string; modeDescription: string; heroCount: number; villainGroupCount: number; henchmanGroupCount: number; wounds: number }` (from `summarizeSetupTemplate()`),
  - `requirements: SetupRequirements & { playerCount: number; effectivePlayerCount: number; advancedSolo: boolean; playMode: PlayMode; modeLabel: string; modeDescription: string }`,
  - `scheme: SchemeRuntime`,
  - `mastermind: MastermindRuntime & { leadEntity: VillainGroupRuntime | HenchmanGroupRuntime | null }`,
  - `heroes: HeroRuntime[]`,
  - `villainGroups: VillainGroupRuntime[]`,
  - `henchmanGroups: HenchmanGroupRuntime[]`,
  - `setupSnapshot: { mastermindId: string; schemeId: string; heroIds: string[]; villainGroupIds: string[]; henchmanGroupIds: string[] }`,
  - `forcedPicks: { schemeId: string | null; mastermindId: string | null; heroIds: string[]; villainGroupIds: string[]; henchmanGroupIds: string[] }`,
  - `notices: string[]`,
  - `fallbackUsed: boolean`,
  - `legalSchemesCount: number`.
- [x] Export `BggMatchResult` interface with fields: `matched: Array<{ setId: string; setName: string; bggName: string }>`, `unmatched: string[]` — matching the return value of `matchBggNamesToSets()` in `bgg-import-utils.mjs`.
- [x] Export `MyludoMatchResult` interface with fields: `matched: Array<{ setId: string; setName: string; myludoName: string }>`, `unmatched: string[]` — matching the return value of `matchMyludoNamesToSets()` in `myludo-import-utils.mjs` (note: matched entry uses `myludoName` not `bggName`).
- [x] **Test**: Cross-check `GeneratedSetup.setupSnapshot` field names against the `setupSnapshot` literal in `tryMastermindForScheme()` (`mastermindId`, `schemeId`, `heroIds`, `villainGroupIds`, `henchmanGroupIds`); verify `BggMatchResult.matched` entry has `bggName` and `MyludoMatchResult.matched` entry has `myludoName` as the source-name field.
- [x] **QC (Automated)**: Run `npx tsc --noEmit` and `npm run lint`; confirm both exit 0.

---

## Story 5 — Verify `npx tsc --noEmit` and `npm run lint` pass with the new `types.ts` and no other changes

- [x] Confirm `tsconfig.json` (from Epic 61) includes `src/app/types.ts` in its compilation scope — verify by checking the `include` or `files` field resolves `src/app/**/*.ts`.
- [x] Run `npx tsc --noEmit` and confirm it exits with code 0 and emits no diagnostics.
- [x] Run `npm run lint` and confirm it exits with code 0 and emits no ESLint errors or warnings on `src/app/types.ts`.
- [x] Run `npm run build` and confirm Vite produces a valid bundle without errors.
- [x] Confirm with `git diff --name-only` that no file other than `src/app/types.ts` has been modified.
- [x] **Test**: Review all named exports in `src/app/types.ts` against the full export list required by the epic AC — confirm all 30+ symbols (`HeroCard`, `MastermindCard`, `VillainGroupCard`, `HenchmanGroupCard`, `SchemeCard`, `GameSet`, `SetType`, `HeroRuntime`, `MastermindRuntime`, `VillainGroupRuntime`, `HenchmanGroupRuntime`, `SchemeRuntime`, `RuntimeIndexes`, `PlayMode`, `ThemeId`, `LocaleId`, `UsageStat`, `UsageCategoryMap`, `UsageState`, `CollectionState`, `Preferences`, `GameOutcome`, `GameResultStatus`, `PlayerScoreEntry`, `GameResult`, `HistoryRecord`, `AppState`, `SetupRequirements`, `GeneratedSetup`, `BggMatchResult`, `MyludoMatchResult`) are present as `export` declarations.
- [x] **QC (Automated)**: Run `npx tsc --noEmit` and `npm run lint`; confirm both exit 0. Then run `npm run build`; confirm exit 0 with no bundle errors.
