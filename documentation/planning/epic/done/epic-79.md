## Epic 79 — Eliminate .mjs Files: Migrate All Sources to TypeScript and JavaScript

**Objective**
Remove every `.mjs` file from the repository by deleting stale compiled outputs from `src/`, converting all unit and Playwright test files to TypeScript, migrating root configuration files to `.js` or `.ts`, and rewriting developer tool scripts in TypeScript — so the project has a single consistent source format with no mixed `.mjs` artefacts.

**Background**
The repository has accumulated `.mjs` files in four distinct categories: (1) stale compiled outputs co-located with their `.ts` sources in `src/app/` (~33 files) and `src/app/locales/` (6 locale files) that should simply be deleted; (2) 50+ unit test files (`test/**/*.test.mjs`) and 38+ Playwright spec files plus one helper (`test/playwright/**/*.spec.mjs`, `test/playwright/helpers/app-fixture.mjs`) that were authored as `.mjs` and need to become TypeScript; (3) the four root configuration files (`eslint.config.mjs`, `playwright.config.mjs`, `playwright.base.config.mjs`, `playwright.prod.config.mjs`) that can be migrated to `.js` or `.ts`; and (4) two developer tool scripts (`tools/generate-icons.mjs`, `tools/run_epic1_checks.mjs`). The migration also requires updating `vitest.config.js` include patterns, all per-epic `test:epicN` and `test:qc:epicN` scripts in `package.json`, the `report:epic1` script, and `tsconfig.json` so TypeScript tooling covers the renamed test files.

**In scope**
- Deleting all `.mjs` compiled output files under `src/app/` (~33 files) and `src/app/locales/` (6 files: `en.mjs`, `fr.mjs`, `de.mjs`, `es.mjs`, `ja.mjs`, `ko.mjs`) whose `.ts` counterparts already exist alongside them
- Renaming all 50+ `test/**/*.test.mjs` files to `.test.ts`; updating the `include` array in `vitest.config.js` from `['test/**/*.test.mjs']` to `['test/**/*.test.ts']`; updating all per-epic `test:epicN` script entries in `package.json` to reference the renamed `.test.ts` files
- Renaming all 38+ `test/playwright/**/*.spec.mjs` files to `.spec.ts`; renaming `test/playwright/helpers/app-fixture.mjs` to `app-fixture.ts`; updating any cross-imports inside spec and helper files to use the new extensions; updating all `test:qc:epicN` script entries in `package.json` to reference the renamed `.spec.ts` files
- Converting `eslint.config.mjs` → `eslint.config.js`, `playwright.config.mjs` → `playwright.config.ts`, `playwright.base.config.mjs` → `playwright.base.config.ts`, `playwright.prod.config.mjs` → `playwright.prod.config.ts`; updating the cross-import inside `playwright.config.ts` that references `playwright.base.config`
- Converting `tools/generate-icons.mjs` and `tools/run_epic1_checks.mjs` to `.ts`; updating the `report:epic1` script in `package.json` to invoke the replacement via a TypeScript-aware runner (e.g. `tsx`)
- Updating `tsconfig.json` to include the `test/` directory (or creating a `tsconfig.test.json` that extends the base) so TypeScript tooling type-checks the converted test files; verifying that zero `.mjs` references remain anywhere in `package.json` scripts after all renames

**Out of scope**
- Modifying any test logic, assertions, or coverage — only extension and import-path changes are in scope
- Converting `src/**/*.svelte` or existing `src/**/*.ts` files — these are already in the correct format
- Converting `vitest.config.js` or `vite.config.js` themselves to TypeScript (only their content changes)
- Setting up a new TypeScript compilation or bundling pipeline; Vite already handles TypeScript transparently
- Changes to CI/CD pipeline scripts beyond what is required to invoke the renamed config files

**Stories**

### Story 79.1 — Delete stale .mjs compiled output files from src/

Delete all `.mjs` files under `src/app/` and `src/app/locales/` whose `.ts` counterparts already exist in the same directory. These are stale compiled outputs and are no longer needed.

**Acceptance criteria:**
- No `.mjs` file exists anywhere under `src/`
- Every previously-deleted `.mjs` file had a `.ts` counterpart that is still present and unchanged
- `npm run lint` passes with no errors

### Story 79.2 — Rename unit test files from .test.mjs to .test.ts and update vitest config

Rename every `test/**/*.test.mjs` file to `.test.ts`. Update `vitest.config.js` include pattern. Update all per-epic `test:epicN` script entries in `package.json` to reference `.test.ts` paths.

**Acceptance criteria:**
- Every file previously named `*.test.mjs` under `test/` now has `.test.ts` extension
- `vitest.config.js` `include` contains `'test/**/*.test.ts'` and no `.mjs` pattern
- `npm test` discovers and executes all renamed test files without errors
- All per-epic `test:epicN` entries in `package.json` reference `.test.ts` file paths

### Story 79.3 — Rename Playwright spec and helper files from .mjs to .ts

Rename every `test/playwright/**/*.spec.mjs` file to `.spec.ts`. Rename `test/playwright/helpers/app-fixture.mjs` to `app-fixture.ts`. Update internal imports. Update all `test:qc:epicN` script entries in `package.json`.

**Acceptance criteria:**
- Every file previously named `*.spec.mjs` under `test/playwright/` now has `.spec.ts` extension
- `test/playwright/helpers/app-fixture.ts` is present; `.mjs` original deleted
- Internal imports within spec files that referenced `.mjs` helpers now resolve to `.ts`
- All `test:qc:epicN` entries in `package.json` reference `.spec.ts` file paths
- `npx playwright test` completes without config-load or import-resolution errors

### Story 79.4 — Convert root configuration files from .mjs to .js or .ts

Convert `eslint.config.mjs` → `eslint.config.js`, `playwright.config.mjs` → `playwright.config.ts`, `playwright.base.config.mjs` → `playwright.base.config.ts`, `playwright.prod.config.mjs` → `playwright.prod.config.ts`. Update the cross-import inside `playwright.config.ts`.

**Acceptance criteria:**
- None of the four `.mjs` config files exist at the repository root
- Their replacements are present and load without error
- `npm run lint` and `npx playwright test` complete without configuration-load errors

### Story 79.5 — Convert tools scripts from .mjs to .ts

Convert `tools/generate-icons.mjs` → `tools/generate-icons.ts` and `tools/run_epic1_checks.mjs` → `tools/run_epic1_checks.ts`. Update the `report:epic1` script in `package.json` to invoke via a TypeScript-aware runner (`tsx`).

**Acceptance criteria:**
- `tools/generate-icons.mjs` and `tools/run_epic1_checks.mjs` no longer exist
- `.ts` replacements are present with equivalent logic
- `npm run report:epic1` executes without error

### Story 79.6 — Update tsconfig.json and eliminate all remaining .mjs references

Update `tsconfig.json` `include` to cover `test/**/*` (or create `tsconfig.test.json` extending base). Verify no `.mjs` references remain in `package.json` scripts. Run full lint pass to confirm clean state.

**Acceptance criteria:**
- TypeScript tooling covers test files
- A grep for `\.mjs` across `package.json` `"scripts"` returns zero matches
- `npm run lint` and `npm test` pass with no errors
