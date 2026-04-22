## Epic 64 — Migrate Core Game Engine to TypeScript

**Objective**
Rename and fully type the five core game-engine modules — `setup-rules.mjs`, `setup-generator.mjs`, `game-data-pipeline.mjs`, `solo-rules.mjs`, and `app-renderer.mjs` — converting them from plain JavaScript to TypeScript while preserving every public API unchanged.

**Background**
These modules implement the heart of the application: rule resolution, setup generation, data normalization, and rendering helpers. They have the deepest type complexity in the codebase and the most valuable payoff from TypeScript annotations:

- `setup-rules.mjs` — exports `SETUP_RULES` (keyed by player count / mode key), `PLAY_MODE_OPTIONS`, `resolvePlayMode`, `getSetupRequirements`
- `setup-generator.mjs` — exports `generateSetup(playerCount, options, indexes, state)`, which produces the full randomized setup object
- `game-data-pipeline.mjs` — exports `createEpic1Bundle(seed)`, which normalizes canonical JSON into the full `RuntimeIndexes` bundle
- `solo-rules.mjs` — exports `SOLO_RULES_PANEL_MODES` (a `Set<PlayMode>`) and `getSoloRulesItems(playMode)`
- `app-renderer.mjs` — exports transitional render helpers used by Svelte tab components via `{@html}`; these accept runtime-typed arguments

All five modules depend on types established in Epic 62 and on peer utilities already migrated in Epic 63. They must be migrated in dependency order: `setup-rules` first (no internal dependencies), then `solo-rules`, then `game-data-pipeline`, then `setup-generator` (depends on all three), then `app-renderer` (depends on the pipeline bundle).

**In scope**
- Rename each module: `.mjs` → `.ts` (delete the `.mjs`, create the `.ts`)
- Add full TypeScript signatures to all exported functions and constants:
  - `SETUP_RULES` typed as `Record<string | number, SetupRequirements>`
  - `PLAY_MODE_OPTIONS` typed as `Record<PlayMode, { label: string; soloLabel: string; description: string }>`
  - `SOLO_RULES_PANEL_MODES` typed as `ReadonlySet<PlayMode>`
  - `getSoloRulesItems` return typed as `string[] | null`
  - `createEpic1Bundle` return typed as `RuntimeIndexes`
  - `generateSetup` return typed as `GeneratedSetup`
  - `resolvePlayMode` return typed as `PlayMode`
  - `getSetupRequirements` return typed as `SetupRequirements`
- Import shared types exclusively from `src/app/types.ts`
- Update all intra-`src/` import references to the new `.ts` extensions
- Update test file import paths (`.mjs` → `.ts`) for the affected modules
- Verify `npm run lint` and `npx tsc --noEmit` pass after each story

**Out of scope**
- Changing any function logic, algorithm, or public API shape
- Adding runtime validation or Zod schemas
- Migrating `state-store.mjs` (covered by Epic 65)
- Migrating test files to TypeScript (covered by Epic 68)

**Stories**
1. **Migrate `setup-rules.mjs` and `solo-rules.mjs` to TypeScript**
2. **Migrate `game-data-pipeline.mjs` to TypeScript**
3. **Migrate `setup-generator.mjs` to TypeScript**
4. **Migrate `app-renderer.mjs` to TypeScript**

**Acceptance Criteria**
- Story 1: `src/app/setup-rules.ts` and `src/app/solo-rules.ts` exist; the `.mjs` originals are deleted; `SETUP_RULES` is typed as `Record<string | number, SetupRequirements>`; `PLAY_MODE_OPTIONS` is typed using `PlayMode` as key; `SOLO_RULES_PANEL_MODES` is a `ReadonlySet<PlayMode>`; `resolvePlayMode` returns `PlayMode`; `getSoloRulesItems` returns `string[] | null`; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 2: `src/app/game-data-pipeline.ts` exists; the `.mjs` original is deleted; `createEpic1Bundle` is annotated to return `RuntimeIndexes`; all internal normalization steps use typed intermediate variables; callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 3: `src/app/setup-generator.ts` exists; the `.mjs` original is deleted; `generateSetup` is fully typed with explicit parameter types (`number`, `PlayMode`, `RuntimeIndexes`, `AppState`) and return type `GeneratedSetup`; all internal helper functions carry type annotations; callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 4: `src/app/app-renderer.ts` exists; the `.mjs` original is deleted; all exported render functions accept typed `RuntimeIndexes` or entity subtypes as parameters; callers (Svelte components) are updated to import from the `.ts` path; `npm run lint` and `npx tsc --noEmit` pass; `npm run build` produces a valid bundle.
