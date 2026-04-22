## Epic 63 — Migrate Core Utility Modules to TypeScript

**Objective**
Rename the eight pure utility modules in `src/app/` from `.mjs` to `.ts`, add explicit TypeScript signatures using the types defined in Epic 62, and ensure all consumers (other source files and test files) are updated accordingly.

**Background**
The following modules contain pure functions with no Svelte or browser-specific runtime dependencies. They are the safest modules to migrate first because they have the highest test coverage and the fewest inter-module dependencies:

- `object-utils.mjs` — `deepClone`, `isPlainObject`
- `collection-utils.mjs` — `mergeOwnedSets`, `getCardsByCategory`, `getCardsByExpansion`, `CARD_CATEGORIES`
- `browse-utils.mjs` — `filterBrowseSets`, `summarizeBrowseSet`, `BROWSE_TYPE_OPTIONS`, `BROWSE_SORT_OPTIONS`
- `history-utils.mjs` — `formatHistorySummary`, `filterHistoryByOutcome`
- `stats-utils.mjs` — statistics computation helpers
- `result-utils.mjs` — `createPlayerScoreEntry`, `createPerPlayerScoreArray`, `createCompletedGameResult`, `createPendingGameResult`, `sanitizeStoredGameResult`, `GAME_RESULT_STATUS_*`, `GAME_OUTCOME_OPTIONS`
- `feedback-utils.mjs` — feedback/notification helpers
- `focus-utils.mjs` — `focusActionButton`, `focusSelector`, `focusModalCancelButton`

Each story: rename the file (delete the `.mjs`, create the `.ts`), add return-type and parameter annotations, import shared types from `src/app/types.ts`, update all intra-`src/` import references to the new `.ts` extension, and update the corresponding test file import paths.

**In scope**
- Rename each module: `.mjs` → `.ts`
- Add TypeScript annotations to all exported functions and constants using types from `src/app/types.ts`; no new logic is introduced
- Update all `import` statements within `src/app/` and `src/components/` that reference these modules to use the `.ts` extension
- Update the import paths in the corresponding test files (`.test.mjs`) from `.mjs` to `.ts`
- Verify `npm run lint` and `npx tsc --noEmit` pass after each story
- `forced-picks-utils.mjs` and `new-game-utils.mjs` are included in Story 4 (they are small helpers with no complex type dependencies)

**Out of scope**
- Changing any function logic or public API shape
- Migrating the test files themselves to TypeScript (covered by Epic 68)
- Migrating modules with Svelte or browser-storage dependencies (covered by Epics 64–66)

**Stories**
1. **Migrate `object-utils.mjs` and `collection-utils.mjs` to TypeScript**
2. **Migrate `browse-utils.mjs` and `history-utils.mjs` to TypeScript**
3. **Migrate `stats-utils.mjs` and `result-utils.mjs` to TypeScript**
4. **Migrate `feedback-utils.mjs`, `focus-utils.mjs`, `forced-picks-utils.mjs`, and `new-game-utils.mjs` to TypeScript**

**Acceptance Criteria**
- Story 1: `src/app/object-utils.ts` and `src/app/collection-utils.ts` exist; the `.mjs` originals are deleted; `deepClone<T>` is generic; `mergeOwnedSets` accepts `AppState` and `string[]`; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 2: `src/app/browse-utils.ts` and `src/app/history-utils.ts` exist; `filterBrowseSets` accepts and returns `GameSet[]`; `filterHistoryByOutcome` accepts `HistoryRecord[]`; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 3: `src/app/stats-utils.ts` and `src/app/result-utils.ts` exist; exported constants have explicit type annotations; `createCompletedGameResult` and `createPendingGameResult` return typed `GameResult`; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 4: `src/app/feedback-utils.ts`, `src/app/focus-utils.ts`, `src/app/forced-picks-utils.ts`, and `src/app/new-game-utils.ts` exist; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
