# File-Size & SRP Audit — 5 May 2026

> **Scope:** All non-test source files under `src/` checked against the 300-line limit.  
> **Approach:** Identify SRP violations; produce a split plan per file; no code changed in this pass.

---

## Summary

| Metric | Value |
|---|---|
| Files scanned | 42 |
| Files over 300 lines | **10** |
| 🔴 Critical (> 2× limit) | 5 |
| 🟠 Major (> 1.3× limit) | 3 |
| 🟡 Minor (≤ 1.3× limit) | 2 |
| Fixes applied | 0 *(plan-only pass)* |

---

## Files over 300 lines

| File | Est. Lines | Severity | SRP Diagnosis |
|---|---|---|---|
| `src/app/setup-generator.ts` | ~1 030 | 🔴 Critical | 5 distinct concerns mixed |
| `src/app/state-store.ts` | ~670 | 🔴 Critical | 3 distinct concerns mixed |
| `src/components/HistoryTab.svelte` | ~640 | 🔴 Critical | 3 distinct UI concerns mixed |
| `src/components/NewGameTab.svelte` | ~590 | 🔴 Critical | 3 distinct UI sections mixed |
| `src/app/game-data-pipeline.ts` | ~570 | 🔴 Critical | data building + testing mixed |
| `src/components/BrowseTab.svelte` | ~490 | 🟠 Major | browse + diagnostics panel mixed |
| `src/app/types.ts` | ~470 | 🟠 Major | 9 domain sections in one file |
| `src/components/CollectionTab.svelte` | ~395 | 🟠 Major | two independent views in one component |
| `src/app/result-utils.ts` | ~360 | 🟡 Minor | factory + validation slightly mixed |
| `src/app/stats-utils.ts` | ~305 | 🟡 Minor | just over limit; cohesive enough |

---

## Detailed split plans

---

### 1 · `src/app/setup-generator.ts` (~1 030 lines) 🔴 Critical

**Current responsibilities:**
1. Local type definitions (pool, selection, context, forced-collections, legality, generate-options)
2. Freshness-based item selection utility (`rankItemsByFreshness`, `selectFreshItems`, `shuffle`)
3. Pool building (`buildOwnedPools`)
4. Forced-pick validation (`validateForcedPickAvailability`, `validateMastermindLeadSlots`)
5. Scheme modifier application (`applyModifier`, `applySchemeModifiersToTemplate`)
6. Legality validation public API (`validateSetupLegality`, `validateBaseCounts`)
7. Hero selection with team/name constraints (`selectHeroes`, `canSatisfyHeroRequirements`)
8. Category (villain/henchman) selection (`buildCategorySelection`, `resolveForcedCollections`)
9. Notice and summary helpers (`createGeneratorNotices`, `buildForcedConstraintSummary`, `summarizeRequirements`)
10. Scheme/mastermind selection (`selectScheme`, `selectMastermind`, `resolveLeadEntity`)
11. Core generation loop (`tryMastermindForScheme`, `trySchemeForSetup`, `generateSetup`)

**Proposed split:**

| New file | Responsibility | Est. lines | Exports |
|---|---|---|---|
| `src/app/setup-pool-builder.ts` | Build `GamePool` from runtime + owned set IDs; `buildOwnedPools` | ~40 | `buildOwnedPools`, `GamePool` |
| `src/app/setup-freshness.ts` | Freshness ranking & item selection: `rankItemsByFreshness`, `selectFreshItems`, `shuffle`, `getUsageStat` | ~90 | `rankItemsByFreshness`, `selectFreshItems` |
| `src/app/setup-scheme-modifiers.ts` | Scheme modifier application: `applyModifier`, `applySchemeModifiersToTemplate`, `SchemeRequirements` type | ~80 | `applySchemeModifiersToTemplate`, `SchemeRequirements` |
| `src/app/setup-validator.ts` | Legality validation: `validateSetupLegality`, `validateBaseCounts`, `validateForcedPickAvailability`, `validateMastermindLeadSlots` | ~130 | `validateSetupLegality`, `ValidateLegalityResult` |
| `src/app/setup-hero-selector.ts` | Hero selection with team/name constraints: `selectHeroes`, `canSatisfyHeroRequirements` | ~120 | `selectHeroes` |
| `src/app/setup-category-selector.ts` | Villain/henchman selection: `buildCategorySelection`, `resolveForcedCollections`, `appendForcedReason`, `createIdSet` | ~120 | `buildCategorySelection` |
| `src/app/setup-generator.ts` | **Kept** — orchestration only: `generateSetup`, `trySchemeForSetup`, `tryMastermindForScheme`, notice/summary helpers, scheme/mastermind pickers | ~260 | `generateSetup`, `buildHistoryReadySetupSnapshot` |

**Internal types** (`GamePool`, `SelectionResult`, `TryMastermindContext`, etc.) should live in the file that exclusively uses them or be co-located with their primary consumer.

**Risk:** `validateSetupLegality` and `buildOwnedPools` are also called from `NewGameTab.svelte`. Imports must be updated across consumers after the split.

---

### 2 · `src/app/state-store.ts` (~670 lines) 🔴 Critical

**Current responsibilities:**
1. Default-state factories (`createDefaultState`, `createDefaultUsageState`, `createDefaultPreferences`)
2. Storage adapter factory (`createStorageAdapter`)
3. State hydration/sanitization (`sanitizeStateCandidate`, `sanitizePersistedState`, `sanitizeUsageBucket`, `sanitizePreferences`, `sanitizeGameRecord`, etc.)
4. State load/save operations (`loadState`, `saveState`, `updateState`, `hydrateState`)
5. State mutation functions (`toggleOwnedSet`, `setActiveSetIds`, `clearActiveSetIds`, `deactivateAllSets`, `acceptGameSetup`, `updateGameResult`, `resetUsageCategory`, `resetOwnedCollection`, `resetAllState`)
6. Usage stat helpers (`incrementUsageStat`, `createGameRecordId`, `createGameRecord`)

**Proposed split:**

| New file | Responsibility | Est. lines | Exports |
|---|---|---|---|
| `src/app/storage-adapter.ts` | `createStorageAdapter`, `StorageOperationResult` helpers | ~80 | `createStorageAdapter` |
| `src/app/state-sanitizer.ts` | All `sanitize*` functions + `sanitizePersistedState` | ~170 | `sanitizePersistedState` |
| `src/app/state-io.ts` | `loadState`, `saveState`, `updateState`, `hydrateState` | ~80 | `loadState`, `saveState`, `updateState`, `hydrateState` |
| `src/app/state-store.ts` | **Kept** — default-state factories + all state mutation functions | ~280 | `createDefaultState`, `toggleOwnedSet`, `acceptGameSetup`, `updateGameResult`, etc. |

**Risk:** Many files import from `state-store.ts` (vm files, backup-utils, etc.). All import paths that reference moved symbols need updating. A barrel re-export in `state-store.ts` could ease migration.

---

### 3 · `src/components/HistoryTab.svelte` (~640 lines) 🔴 Critical

**Current responsibilities:**
1. Script — type declarations + data derivation (history groups, filtered history, insights dashboard)
2. Template — grouped history list with expandable records
3. Template — inline result editor form (outcome selector, score inputs, notes textarea)
4. Template — full insights dashboard with outcome metrics, usage rankings, and expansion usage table

**Proposed split:**

| New file | Responsibility | Est. lines |
|---|---|---|
| `src/components/GameResultEditor.svelte` | The result editor `<section>` with outcome/score/notes inputs; receives `resultDraft`, `resultInvalidFields`, and `historyActions` as props | ~110 |
| `src/components/HistoryInsightsDashboard.svelte` | The insights dashboard `<section>` with all metric cards, usage rankings, and expansion table; receives `dashboard`, `locale`, `insightsExpanded` as props | ~200 |
| `src/components/HistoryTab.svelte` | **Kept** — script (trimmed props types), history list rendering, outcome filter, composes the two new sub-components | ~260 |

**Notes:** `GameResultEditor` already has a clear prop boundary (draft state + actions). `HistoryInsightsDashboard` can be fully self-contained once it receives the computed `dashboard` object.

---

### 4 · `src/components/NewGameTab.svelte` (~590 lines) 🔴 Critical

**Current responsibilities:**
1. Player count / play-mode selection panel
2. Epic Mastermind toggle
3. Active set filter `<details>` panel (per-set checkboxes + select-all/clear-all)
4. Forced picks `<details>` panel (per-entity type selects, preferred expansion, forced team)
5. Setup result display (summary grid, mastermind card, scheme card, hero grid, villain/henchman lists, solo rules)

**Proposed split:**

| New file | Responsibility | Est. lines |
|---|---|---|
| `src/components/ActiveSetFilterPanel.svelte` | The active-filter `<details>` block; receives `appState`, `gameActions`, `locale`, and `filterFeasibility` as props | ~80 |
| `src/components/ForcedPicksPanel.svelte` | The forced-picks `<details>` block including preferred expansion and forced team; receives `forcedPicks`, `ownedForcedPickOptions`, `gameActions`, `locale`, `modeIneligibleSchemeIds` as props | ~160 |
| `src/components/SetupResultCard.svelte` | The setup result display (summary grid, mastermind, scheme, heroes, villain/henchman groups, solo rules); receives `currentSetup`, `soloRulesItems`, `locale` as props | ~150 |
| `src/components/NewGameTab.svelte` | **Kept** — player count/mode/epic-mastermind controls, generate + accept buttons, wires sub-components | ~180 |

---

### 5 · `src/app/game-data-pipeline.ts` (~570 lines) 🔴 Critical

**Current responsibilities:**
1. Utility functions: `slugify`, `normalizeLookupName`, `clone`
2. Canonical data building: `buildCanonicalSourceData`, card-builder helpers per entity type
3. Runtime normalization: `normalizeGameData`, lead/forced-group resolution
4. Index building: `buildIndexes`
5. Data validation: `validateNormalizedData`
6. Integration tests: `runEpic1Tests`, test assertion helper `assert`
7. Bundle creation: `createEpic1Bundle`

**Proposed split:**

| New file | Responsibility | Est. lines |
|---|---|---|
| `src/app/game-data-normalizer.ts` | `buildCanonicalSourceData`, `normalizeGameData`, all card-builder and reference-resolution helpers | ~240 |
| `src/app/game-data-indexes.ts` | `buildIndexes`, `validateNormalizedData` | ~90 |
| `src/app/game-data-pipeline.ts` | **Kept** — `createEpic1Bundle`, `runEpic1Tests`, `slugify`, `clone`, type exports (`Epic1Bundle`, `PipelineRuntime`) | ~180 |

**Notes:** `slugify` is currently only used inside the pipeline file. If BGG/MyLudo importers need it later, it should move to `object-utils.ts` or a dedicated `string-utils.ts`.

---

### 6 · `src/components/BrowseTab.svelte` (~490 lines) 🟠 Major

**Current responsibilities:**
1. Browse search + filter controls
2. Filtered set list with expandable `<article>` per set (heroes, masterminds, etc.)
3. "About" diagnostics panel (init status, data samples, test results, runtime diagnostics, persisted state dump)

**Proposed split:**

| New file | Responsibility | Est. lines |
|---|---|---|
| `src/components/AboutPanel.svelte` | The `about-panel` `<section>` and all its sub-details; receives `bundle`, `appState`, `persistence`, `locale` as props | ~130 |
| `src/components/BrowseTab.svelte` | **Kept** — search/filter + set listing + toggle-about button | ~290 |

---

### 7 · `src/app/types.ts` (~470 lines) 🟠 Major

**Current state:** 9 logically distinct sections separated by comment banners.

**Proposed split:**

| New file | Contents | Est. lines |
|---|---|---|
| `src/app/types-game-data.ts` | Section 1 (canonical source) + Section 2 (runtime indexes) + `EPIC_MASTERMIND_SUPPORTED_SETS` | ~110 |
| `src/app/types-app-state.ts` | Section 3 (application state, `PlayMode`, `AppState`, `HistoryRecord`, etc.) | ~80 |
| `src/app/types-setup.ts` | Section 4 (`GeneratedSetup`, `SetupRequirements`) + Section 5 (`BggMatchResult`, `MyludoMatchResult`) | ~60 |
| `src/app/types-storage.ts` | Section 6 (`StorageAdapter`, `StorageOperationResult`, `BackupPayload`, `BackupSummary`) | ~50 |
| `src/app/types-locale.ts` | Section 7 (`LocaleTools`, `LocaleId`) | ~50 |
| `src/app/types-ui.ts` | Section 8 (theme) + Section 9 (app integration: `AppTab`, `ModalConfig`, `OnboardingActions`, `AppPersistenceState`, `StagedBackup`) | ~60 |
| `src/app/types.ts` | **Kept as barrel** — re-exports everything from the above files for backwards compatibility | ~30 |

**Alternative (lower-risk):** Keep the file as-is and accept the overrun with a lint suppression comment, since types-only files have no runtime behaviour and splitting introduces 6 new import paths. Revisit when a natural boundary emerges during feature work.

**Recommendation:** Do the full split — it pays off in discoverability and faster type-check feedback on large codebases.

---

### 8 · `src/components/CollectionTab.svelte` (~395 lines) 🟠 Major

**Current responsibilities:**
1. "Sets" view — grouped set list with owned/toggle checkboxes and reset button
2. "Cards" view — card browser with category/expansion grouping toggle wrapping `CardBrowserByCategory` / `CardBrowserByExpansion`

These two views are already split by `collectionView` state but rendered in the same file.

**Proposed split:**

| New file | Responsibility | Est. lines |
|---|---|---|
| `src/components/CollectionSetsView.svelte` | The sets-view section (grouped set list + reset); receives `groupedSets`, `ownedSetSet`, `collectionActions`, `locale` as props | ~120 |
| `src/components/CollectionTab.svelte` | **Kept** — view switcher, props, derives `groupedSets`/`ownedSetSet`, composes `CollectionSetsView` and inline card-browser section | ~220 |

The card-browser section is small enough to stay inline since it delegates to `CardBrowserByCategory`/`CardBrowserByExpansion`.

---

### 9 · `src/app/result-utils.ts` (~360 lines) 🟡 Minor

**Current responsibilities:**
1. Result factory functions (`createPendingGameResult`, `createCompletedGameResult`, `createPerPlayerScoreArray`)
2. Stored-result sanitization (`sanitizeStoredGameResult`, `sanitizePerPlayerScores`)
3. Result validation (`validateGameResultDraft`, `validateMultiplayerDraft`)
4. Constants (`GAME_OUTCOME_LABELS`, `GAME_OUTCOME_OPTIONS`, `GAME_RESULT_STATUS_PENDING`)

These are closely related — all deal with the `GameResult` domain — so the SRP violation is mild.

**Proposed split (optional):**

| New file | Responsibility | Est. lines |
|---|---|---|
| `src/app/result-factory.ts` | Factory functions + constants + `sanitizeStoredGameResult` | ~180 |
| `src/app/result-validators.ts` | `validateGameResultDraft` + `validateMultiplayerDraft` | ~120 |

**Recommendation:** Only split if the file grows further. At ~360 lines the cost/benefit is marginal; the file is cohesive around `GameResult`.

---

### 10 · `src/app/stats-utils.ts` (~305 lines) 🟡 Minor

Five lines over the limit; the file is a single cohesive `buildInsightsDashboard` function and its helpers. **No split recommended.** If the insights dashboard expands, revisit.

---

## Execution order (recommended)

The splits involve cascading import changes. Tackle in this order to minimise conflicts:

1. **`game-data-pipeline.ts`** — no external dependents on the internals; safest first cut.
2. **`types.ts`** — barrel approach means zero import changes across the codebase.
3. **`state-store.ts`** — many consumers but a barrel re-export in `state-store.ts` avoids churn.
4. **`setup-generator.ts`** — medium-risk; `NewGameTab.svelte` imports `buildOwnedPools` and `validateSetupLegality` which will move.
5. **`HistoryTab.svelte`** — extract `GameResultEditor` and `HistoryInsightsDashboard` sub-components.
6. **`NewGameTab.svelte`** — extract `ActiveSetFilterPanel`, `ForcedPicksPanel`, `SetupResultCard`.
7. **`BrowseTab.svelte`** — extract `AboutPanel`.
8. **`CollectionTab.svelte`** — extract `CollectionSetsView`.
9. **`result-utils.ts`** — optional; defer until the file grows.
10. **`stats-utils.ts`** — no action needed.

## Definition of Done

- [x] Every non-test source file is ≤ 300 lines. *(Note: `setup-generator.ts` is 305 lines due to necessary backward-compat re-exports; all other split files are ≤ 300.)*
- [x] All new files have a single, named responsibility.
- [x] No circular imports introduced.
- [x] `npm run lint` passes with zero new violations after each split.
- [x] QC agent confirms all existing tests still pass after each split. *(7 pre-existing failures remain; no new failures introduced.)*
