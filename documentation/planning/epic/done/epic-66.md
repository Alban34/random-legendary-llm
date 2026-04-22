## Epic 66 — Migrate Svelte Reactive View Models to TypeScript

**Objective**
Rename all six Svelte 5 reactive module files (`.svelte.js`) to `.svelte.ts`, add explicit TypeScript annotations to their exported reactive state and functions, and update all consumers so that the Svelte component tree continues to compile and run without errors.

**Background**
The reactive layer lives in six `.svelte.js` files. These files use Svelte 5 runes (`$state`, `$derived`) outside of `.svelte` component files — a pattern supported by the `.svelte.js` / `.svelte.ts` module extension. Each exports typed reactive state and mutation functions consumed by Svelte components:

- `state-store.svelte.js` — `getAppState()`, `setAppState()`, re-exports all pure exports from `state-store.ts`
- `browse-vm.svelte.js` — browse tab reactive state: `browseSearchTerm`, `browseTypeFilter`, `browseSortKey`, etc.
- `new-game-vm.svelte.js` — new-game tab reactive state: `playerCount`, `playMode`, `generatedSetup`, `notification`, etc.
- `history-vm.svelte.js` — history tab reactive state: filter state, expanded record tracking
- `backup-vm.svelte.js` — backup tab reactive state: backup status, file input state
- `import-vm.svelte.js` — BGG and MyLudo import reactive state: `importStatus`, `bggUsername`, etc.

After Epics 63–65, all imported peer modules already use `.ts` extensions. The rename here primarily means: updating the file extension, adding return-type and variable type annotations to the reactive functions and their `$state` initialisers, and updating every Svelte component import to use the `.svelte.ts` extension.

**In scope**
- Rename each file: `.svelte.js` → `.svelte.ts` (delete the `.svelte.js`, create the `.svelte.ts`)
- Add TypeScript annotations to all exported functions, reactive variables, and their `$state(...)` initialisers; use types from `src/app/types.ts` and local inline types where appropriate
  - `getAppState(): AppState` and `setAppState(newState: AppState): void` in `state-store.svelte.ts`
  - Browse VM: `browseTypeFilter`, `browseSortKey` annotated with their string-literal union types
  - New-game VM: `playerCount: number`, `playMode: PlayMode`, `generatedSetup: GeneratedSetup | null`
  - History VM: filter types aligned with `GameOutcome | 'all'`
  - Import VM: import status discriminated union types
- Update all `import` statements in `src/components/*.svelte` files that reference these modules to use `.svelte.ts` extensions
- Verify `npm run lint` and `npx tsc --noEmit` pass after each story

**Out of scope**
- Changing any reactive logic, state shape, or public API
- Migrating Svelte component `<script>` blocks to `lang="ts"` (covered by Epic 67)
- Migrating test files to TypeScript (covered by Epic 68)

**Stories**
1. **Migrate `state-store.svelte.js` to `state-store.svelte.ts` and update all component consumers**
2. **Migrate `browse-vm.svelte.js` and `new-game-vm.svelte.js` to TypeScript**
3. **Migrate `history-vm.svelte.js`, `backup-vm.svelte.js`, and `import-vm.svelte.js` to TypeScript**

**Acceptance Criteria**
- Story 1: `src/app/state-store.svelte.ts` exists; `.svelte.js` original deleted; `getAppState()` is typed to return `AppState`; `setAppState` accepts `AppState`; all Svelte components that import from `state-store.svelte.js` now import from `state-store.svelte.ts`; `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass.
- Story 2: `src/app/browse-vm.svelte.ts` and `src/app/new-game-vm.svelte.ts` exist; `.svelte.js` originals deleted; `browseSortKey` is typed as `'name' | 'releaseYear' | 'collection'`; `playMode` is typed as `PlayMode`; `generatedSetup` is typed as `GeneratedSetup | null`; all component imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 3: `src/app/history-vm.svelte.ts`, `src/app/backup-vm.svelte.ts`, and `src/app/import-vm.svelte.ts` exist; `.svelte.js` originals deleted; all exported reactive state and functions carry explicit TypeScript types; all component imports updated; `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass; the application boots and all five tabs function correctly when served via `npm run dev`.
