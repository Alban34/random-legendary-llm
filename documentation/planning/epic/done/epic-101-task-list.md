# Epic 101 — Eliminate SonarCloud Code Smell Issues Task List

## Story 1: Remove redundant type assertion casts

- [x] `bgg-import-utils.ts` — replace `el.textContent!.trim()` with `(el.textContent ?? '').trim()`
- [x] `bgg-import-utils.ts` — remove `as FetchFn` cast from `globalThis.fetch` default parameter
- [x] `game-data-indexes.ts` — remove `hero as HeroRuntime` cast in `heroesById` assignment
- [x] `game-data-indexes.ts` — remove `hero as HeroRuntime` cast in `allHeroes.push`
- [x] `game-data-indexes.ts` — remove `group as VillainGroupRuntime` cast in `villainGroupsById` assignment
- [x] `game-data-indexes.ts` — remove `group as VillainGroupRuntime` cast in `allVillainGroups.push`
- [x] `game-data-indexes.ts` — remove `group as HenchmanGroupRuntime` cast in `henchmanGroupsById` assignment
- [x] `game-data-indexes.ts` — remove `group as HenchmanGroupRuntime` cast in `allHenchmanGroups.push`
- [x] `history-vm.svelte.ts` — remove `as HistoryGroupingMode` cast in initial state `groupingMode`
- [x] `history-vm.svelte.ts` — remove `as HistoryGroupingMode` cast in `resetHistoryGroupingMode()`
- [x] `localization-utils.ts` — replace `String(value as string | number | boolean)` with `String(value)`
- [x] `result-utils.ts` — remove `score as number | null | undefined` cast in `normalizeScore(...)` call
- [x] `setup-generator.ts` — remove `as GeneratedSetup` cast from `tryMastermindForScheme` return object
- [x] `setup-rules.ts` — remove `as SetupTemplate` cast from `resolveSetupTemplate` return object

## Story 2: Optional chain replacements in `setup-validator.ts`

- [x] `setup-validator.ts` — replace `forcedMastermind !== null && forcedMastermind.lead !== null &&` with `forcedMastermind?.lead != null &&` in `mastermindLeadVillainAlreadyForced`
- [x] `setup-validator.ts` — replace `forcedMastermind !== null && forcedMastermind.lead !== null &&` with `forcedMastermind?.lead != null &&` in `mastermindLeadHenchmanAlreadyForced`

## Skipped / kept as-is

- `result-utils.ts` — `entry as Partial<PlayerScoreEntry>` (×2 in sanitize helpers) — kept; `entry` is narrowed only to `object` after the guard, which is not assignable to `Partial<PlayerScoreEntry>` without the cast in strict mode
