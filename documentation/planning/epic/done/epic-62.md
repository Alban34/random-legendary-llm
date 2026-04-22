## Epic 62 — Domain Type Declarations

**Objective**
Establish a single, authoritative TypeScript type file (`src/app/types.ts`) that captures every domain concept used across the application — game data shapes, application state slices, setup results, history records, and all discriminated union literals — so that migrated modules in Epics 63–67 can import shared types rather than re-declaring them locally.

**Background**
The current data model is documented in `documentation/data/data-model.md` and is implicitly typed through JSDoc comments scattered across multiple `.mjs` files. Before migrating individual modules, a single source of truth for types eliminates duplication and ensures all modules agree on the same shape.

The canonical game data asset is `src/data/canonical-game-data.json`. Runtime indexes (`heroesById`, `mastermindsById`, etc.) are produced by `game-data-pipeline.mjs`. Persisted state lives under `legendary_state_v1` and is defined by `createDefaultState()` in `state-store.mjs`. All of these shapes need TypeScript interfaces or type aliases before any module migration begins.

This epic produces **only** `src/app/types.ts`. No existing source files are modified. All types must be exported as named exports.

**In scope**
- Create `src/app/types.ts` with the following type groups:

  **Game data (canonical source)**
  - `HeroCard`, `MastermindCard`, `VillainGroupCard`, `HenchmanGroupCard`, `SchemeCard` — card entity shapes within a set
  - `GameSet` — the top-level set shape in `canonical-game-data.json`: `id`, `name`, `year`, `type`, `heroes`, `masterminds`, `villainGroups`, `henchmanGroups`, `schemes`, optional `aliases`
  - `SetType` — `'base' | 'large-expansion' | 'small-expansion' | 'standalone'`

  **Runtime indexes (pipeline output)**
  - `HeroRuntime`, `MastermindRuntime`, `VillainGroupRuntime`, `HenchmanGroupRuntime`, `SchemeRuntime` — runtime entity shapes with resolved cross-references and scoped IDs
  - `RuntimeIndexes` — the full bundle produced by `game-data-pipeline.mjs`: `heroesById`, `mastermindsById`, `villainGroupsById`, `henchmanGroupsById`, `schemesById`, `setsById`, `setsList`

  **Application state (persisted)**
  - `PlayMode` — `'standard' | 'advanced-solo' | 'two-handed-solo' | 'standard-solo-v2'`
  - `ThemeId` — `'dark' | 'light'`
  - `LocaleId` — `'en-US' | 'fr-FR' | 'de-DE' | 'ja-JP' | 'ko-KR' | 'es-ES'`
  - `UsageStat` — `{ plays: number; lastPlayedAt: string | null }`
  - `UsageCategoryMap` — `Record<string, UsageStat>` (keyed by runtime entity ID)
  - `UsageState` — `{ heroes: UsageCategoryMap; masterminds: UsageCategoryMap; villainGroups: UsageCategoryMap; henchmanGroups: UsageCategoryMap; schemes: UsageCategoryMap }`
  - `CollectionState` — `{ ownedSetIds: string[]; activeSetIds: string[] | null }`
  - `Preferences` — `{ lastPlayerCount: number; lastAdvancedSolo: boolean; lastPlayMode: PlayMode; selectedTab: string | null; onboardingCompleted: boolean; themeId: ThemeId; localeId: LocaleId }`
  - `GameOutcome` — `'win' | 'loss' | 'draw'`
  - `GameResultStatus` — `'pending' | 'completed'`
  - `PlayerScoreEntry` — `{ playerName: string; score: number | null }`
  - `GameResult` — the discriminated union of pending and completed result shapes
  - `HistoryRecord` — the full persisted history entry shape (IDs + optional result + timestamp)
  - `AppState` — the root persisted state: `{ schemaVersion: number; collection: CollectionState; usage: UsageState; history: HistoryRecord[]; preferences: Preferences }`

  **Setup output**
  - `SetupRequirements` — `{ heroCount: number; villainGroupCount: number; henchmanGroupCount: number; wounds: number }`
  - `GeneratedSetup` — the full object returned by `generateSetup()`: picked entity IDs, player count, play mode, requirements

  **Import utilities**
  - `BggMatchResult` — the return type of `matchBggNamesToSets()`
  - `MyludoMatchResult` — the return type of `matchMyludoNamesToSets()`

- Verify `tsconfig.json` from Epic 61 resolves `src/app/types.ts` without errors (`npx tsc --noEmit`)

**Out of scope**
- Modifying any existing `.mjs` source file to import from `types.ts` (done in Epics 63–67)
- Defining UI-layer types (component prop shapes) — those are inferred from `$props()` in Svelte 5 and defined inline in each component
- Defining test helper types
- Adding runtime validation / Zod schemas (out of scope for this version)

**Stories**
1. **Define game data and `SetType` types (`GameSet`, card entity shapes)**
2. **Define runtime index types (`*Runtime` shapes and `RuntimeIndexes`)**
3. **Define application state types (`AppState` and all its slices, `PlayMode`, `ThemeId`, `LocaleId`)**
4. **Define setup output types (`SetupRequirements`, `GeneratedSetup`) and import utility return types**
5. **Verify `npx tsc --noEmit` and `npm run lint` pass with the new `types.ts` and no other changes**

**Acceptance Criteria**
- Story 1: `src/app/types.ts` exports `HeroCard`, `MastermindCard`, `VillainGroupCard`, `HenchmanGroupCard`, `SchemeCard`, `GameSet`, and `SetType`; the `GameSet` shape matches the structure of entries in `src/data/canonical-game-data.json`.
- Story 2: `src/app/types.ts` exports `HeroRuntime`, `MastermindRuntime`, `VillainGroupRuntime`, `HenchmanGroupRuntime`, `SchemeRuntime`, and `RuntimeIndexes`; `RuntimeIndexes` covers all five `*ById` maps plus `setsById` and `setsList`.
- Story 3: `src/app/types.ts` exports `PlayMode`, `ThemeId`, `LocaleId`, `UsageStat`, `UsageCategoryMap`, `UsageState`, `CollectionState`, `Preferences`, `GameOutcome`, `GameResultStatus`, `PlayerScoreEntry`, `GameResult`, `HistoryRecord`, and `AppState`; all union literal values match those documented in `documentation/data/data-model.md` and implemented in `state-store.mjs`.
- Story 4: `src/app/types.ts` exports `SetupRequirements`, `GeneratedSetup`, `BggMatchResult`, and `MyludoMatchResult`.
- Story 5: `npx tsc --noEmit` exits with code 0; `npm run lint` exits with code 0; `npm run build` produces a valid bundle; no existing source file has been modified.
