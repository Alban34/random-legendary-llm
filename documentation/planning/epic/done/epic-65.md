## Epic 65 — Migrate App Services & Integrations to TypeScript

**Objective**
Rename and fully type the remaining non-reactive, non-Svelte modules in `src/app/`: the state store, backup utilities, localization system (including all six locale files), theme utilities, app tabs, browser entry point, and both import integrations (BGG and MyLudo).

**Background**
These modules handle the application's infrastructure concerns: persistence, backup serialization, localization, theming, and external-service integration. They sit at the boundary between the core game engine (migrated in Epic 64) and the Svelte reactive layer (migrated in Epics 66–67). They are grouped together because they share a common pattern — each has browser or I/O dependencies that require careful typing of Web API interfaces:

- `state-store.mjs` — root persisted state: `STORAGE_KEY`, `SCHEMA_VERSION`, `createDefaultState`, `loadState`, `saveState`, `hydrateState`, `setActiveSetIds`, `clearActiveSetIds`, `deactivateAllSets`, and related sanitization helpers
- `backup-utils.mjs` — versioned backup serialization (`exportBackup`), parsing, validation (`validateBackup`), and merge (`mergeBackup`)
- `localization-utils.mjs` — locale metadata, `t()` translation lookup, `createLocaleTools`, locale-aware date/number formatting
- `src/app/locales/en.mjs`, `fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, `es.mjs` — per-locale message catalog files
- `theme-utils.mjs` — `SUPPORTED_THEMES`, `DEFAULT_THEME_ID`, `normalizeThemeId`
- `app-tabs.mjs` — tab ID constants and `normalizeSelectedTab`
- `browser-entry.mjs` — Svelte 5 `mount()` call and Service Worker registration
- `bgg-import-utils.mjs` — `fetchBggCollection`, `matchBggNamesToSets`
- `myludo-import-utils.mjs` — `parseMyludoFile`, `matchMyludoNamesToSets`

**Dependency note:** `state-store.mjs` must be migrated before `bgg-import-utils.mjs` and `myludo-import-utils.mjs`, as both import from it indirectly. `localization-utils.mjs` must be migrated before its locale files.

**In scope**
- Rename each module: `.mjs` → `.ts` (delete the `.mjs`, create the `.ts`); locale files renamed from `locales/*.mjs` to `locales/*.ts`
- Add TypeScript annotations to all exported functions and constants using types from `src/app/types.ts`; Web API types (`File`, `Blob`, `Response`, etc.) are covered by `@types/node` and the `lib` setting in `tsconfig.json` (add `"lib": ["ESNext", "DOM"]` if not already present)
- `state-store.ts`: `createDefaultState` returns `AppState`; `loadState` / `hydrateState` return `AppState`; `saveState` accepts `AppState`; `setActiveSetIds`, `clearActiveSetIds`, and `deactivateAllSets` are typed accordingly
- `backup-utils.ts`: `exportBackup` returns `string`; `validateBackup` accepts `unknown` and returns a typed result discriminated union `{ ok: true; data: AppState } | { ok: false; errors: string[] }`
- `localization-utils.ts`: the message catalog type is a flat `Record<string, string>`; `t(key: string, locale: LocaleId): string`; locale files export typed `Record<string, string>` constants
- `theme-utils.ts`: `normalizeThemeId(raw: unknown): ThemeId`
- `bgg-import-utils.ts`: `fetchBggCollection` return typed as `Promise<BggMatchResult>`; accepts `AbortSignal` as an option
- `myludo-import-utils.ts`: `parseMyludoFile` accepts `File`, returns `Promise<string[]>`; `matchMyludoNamesToSets` returns `MyludoMatchResult`
- `browser-entry.ts`: imports updated; Svelte `mount` call typed correctly
- Update all intra-`src/` import references to new `.ts` extensions
- Update test file import paths for the affected modules
- Verify `npm run lint` and `npx tsc --noEmit` pass after each story

**Out of scope**
- Changing any function logic, algorithm, or public API shape
- Adding runtime Zod validation
- Migrating the Svelte reactive wrapper (`state-store.svelte.js`) — covered by Epic 66
- Migrating test files to TypeScript — covered by Epic 68

**Stories**
1. **Migrate `state-store.mjs` and `app-tabs.mjs` to TypeScript**
2. **Migrate `backup-utils.mjs` to TypeScript**
3. **Migrate `localization-utils.mjs` and all six locale files to TypeScript**
4. **Migrate `theme-utils.mjs`, `browser-entry.mjs`, and `bgg-import-utils.mjs` to TypeScript**
5. **Migrate `myludo-import-utils.mjs` to TypeScript and confirm the full service layer compiles cleanly**

**Acceptance Criteria**
- Story 1: `src/app/state-store.ts` and `src/app/app-tabs.ts` exist; `.mjs` originals deleted; `createDefaultState` return type is `AppState`; `loadState` / `hydrateState` / `saveState` are typed; `setActiveSetIds`, `clearActiveSetIds`, `deactivateAllSets` have explicit parameter and return types; `normalizeSelectedTab` returns `string | null`; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 2: `src/app/backup-utils.ts` exists; `.mjs` original deleted; `exportBackup` returns `string`; `validateBackup` accepts `unknown` and returns a discriminated union; `mergeBackup` is fully typed; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 3: `src/app/localization-utils.ts` and all six `src/app/locales/*.ts` files exist; `.mjs` originals deleted; message catalog constants are typed as `Record<string, string>`; `t` and `createLocaleTools` have explicit signatures using `LocaleId`; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 4: `src/app/theme-utils.ts`, `src/app/browser-entry.ts`, and `src/app/bgg-import-utils.ts` exist; `.mjs` originals deleted; `normalizeThemeId` accepts `unknown` and returns `ThemeId`; `fetchBggCollection` returns `Promise<BggMatchResult>`; all callers and test imports updated; `npm run lint` and `npx tsc --noEmit` pass.
- Story 5: `src/app/myludo-import-utils.ts` exists; `.mjs` original deleted; `parseMyludoFile` accepts `File` and returns `Promise<string[]>`; `matchMyludoNamesToSets` returns `MyludoMatchResult`; all callers and test imports updated; `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass with no errors.
