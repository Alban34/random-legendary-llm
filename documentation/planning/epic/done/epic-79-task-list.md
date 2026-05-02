# Epic 79 — Eliminate .mjs Files: Task List

## Story 79.1 — Delete stale .mjs compiled output files from src/

- [x] Identify all .mjs files under `src/app/` and `src/app/locales/`
- [x] Verify each has a .ts counterpart (all 29 did)
- [x] Delete `src/app/app-renderer.mjs`
- [x] Delete `src/app/app-tabs.mjs`
- [x] Delete `src/app/backup-utils.mjs`
- [x] Delete `src/app/bgg-import-utils.mjs`
- [x] Delete `src/app/browse-utils.mjs`
- [x] Delete `src/app/browser-entry.mjs`
- [x] Delete `src/app/collection-utils.mjs`
- [x] Delete `src/app/feedback-utils.mjs`
- [x] Delete `src/app/focus-utils.mjs`
- [x] Delete `src/app/forced-picks-utils.mjs`
- [x] Delete `src/app/game-data-pipeline.mjs`
- [x] Delete `src/app/history-utils.mjs`
- [x] Delete `src/app/localization-utils.mjs`
- [x] Delete `src/app/myludo-import-utils.mjs`
- [x] Delete `src/app/new-game-utils.mjs`
- [x] Delete `src/app/object-utils.mjs`
- [x] Delete `src/app/result-utils.mjs`
- [x] Delete `src/app/setup-generator.mjs`
- [x] Delete `src/app/setup-rules.mjs`
- [x] Delete `src/app/solo-rules.mjs`
- [x] Delete `src/app/state-store.mjs`
- [x] Delete `src/app/stats-utils.mjs`
- [x] Delete `src/app/theme-utils.mjs`
- [x] Delete `src/app/locales/de.mjs`
- [x] Delete `src/app/locales/en.mjs`
- [x] Delete `src/app/locales/es.mjs`
- [x] Delete `src/app/locales/fr.mjs`
- [x] Delete `src/app/locales/ja.mjs`
- [x] Delete `src/app/locales/ko.mjs`

## Story 79.2 — Rename unit test files from .test.mjs to .test.ts

- [x] Rename all 48 `test/*.test.mjs` files to `.test.ts` using `git mv`
- [x] Update `vitest.config.js` include pattern: `test/**/*.test.mjs` → `test/**/*.test.ts`
- [x] Update `package.json` `test:epic1` through `test:epic9`, `test:epic12`, `test:epic13`, `test:epic14`, `test:epic18`, `test:epic19`, `test:epic20` scripts to reference `.test.ts` files

## Story 79.3 — Rename Playwright spec and helper files from .mjs to .ts

- [x] Rename all 36 `test/playwright/*.spec.mjs` files to `.spec.ts` using `git mv`
- [x] Rename `test/playwright/helpers/app-fixture.mjs` to `app-fixture.ts` using `git mv`
- [x] Update all imports of `'./helpers/app-fixture.mjs'` → `'./helpers/app-fixture.ts'` across all spec files (36 files updated via `sed`)
- [x] Update `package.json` `test:qc:epic9`, `test:qc:epic10`, `test:qc:epic12`, `test:qc:epic13`, `test:qc:epic14`, `test:qc:epic18`, `test:qc:epic19`, `test:qc:epic20`, `test:qc:epic40` scripts to reference `.spec.ts` files

## Story 79.4 — Convert root configuration files from .mjs to .js or .ts

- [x] Rename `eslint.config.mjs` → `eslint.config.js` using `git mv`
- [x] Remove now-dead `src/**/*.mjs` block from `eslint.config.js` (no .mjs files remain in src/)
- [x] Rename `playwright.base.config.mjs` → `playwright.base.config.ts` using `git mv`
- [x] Rename `playwright.config.mjs` → `playwright.config.ts` using `git mv`
- [x] Rename `playwright.prod.config.mjs` → `playwright.prod.config.ts` using `git mv`
- [x] Update `playwright.config.ts`: import from `./playwright.base.config.ts`, update `testIgnore` pattern to `.spec.ts`
- [x] Update `playwright.prod.config.ts`: import from `./playwright.base.config.ts`, update `testMatch` pattern to `.spec.ts`, update usage comment

## Story 79.5 — Convert tools scripts from .mjs to .ts

- [x] Rename `tools/generate-icons.mjs` → `tools/generate-icons.ts` using `git mv`
- [x] Rename `tools/run_epic1_checks.mjs` → `tools/run_epic1_checks.ts` using `git mv`
- [x] Update `tools/run_epic1_checks.ts`: change dynamic import path from `game-data-pipeline.mjs` → `game-data-pipeline.ts`
- [x] Verify `tsx` is in devDependencies; add via `npm install --save-dev tsx`
- [x] Update `package.json` `report:epic1` script: `node ./tools/run_epic1_checks.mjs` → `tsx ./tools/run_epic1_checks.ts`

## Story 79.6 — Update tsconfig.json and final cleanup

- [x] Update `tsconfig.json`: remove `"test"` from `exclude` array so test .ts files are type-checked
- [x] Verify `package.json` scripts contain zero `.mjs` references
- [x] Run `find . -name "*.mjs" -not -path "./node_modules/*" -not -path "./dist/*"` → output empty (confirmed)
