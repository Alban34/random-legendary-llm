# Epic: Migrate Unit Test Suite from Node Built-in Runner to Vitest

## Overview

Migrate all 42 unit test files from `node --test` + `tsx` to Vitest. Replace `c8` coverage with `@vitest/coverage-v8`. Keep all Playwright E2E tests entirely untouched. Maintain `lcov` format output into `coverage/`.

## Current State

| Concern | Current |
|---|---|
| Runner | `node --import tsx/esm --test ./test/*.test.mjs` |
| Coverage | `c8 --reporter=lcov --report-dir=coverage node --import tsx/esm --test ./test/*.test.mjs` |
| Test API | `node:test` (`test`, `before`), `node:assert/strict` |
| TypeScript loader | `tsx` (ESM hook) |
| Test file count | 42 files in `test/*.test.mjs` |
| Test structure | Top-level `test()` calls; optional `before()` for global setup |

## API Mapping

| `node:test` / current | Vitest equivalent |
|---|---|
| `import test from 'node:test'` | `import { test } from 'vitest'` |
| `import test, { before } from 'node:test'` | `import { test, beforeAll } from 'vitest'` |
| `before(() => {...})` | `beforeAll(() => {...})` |
| `node:assert/strict` assertions | Keep unchanged — compatible with Vitest's Node.js runtime |
| `c8 --reporter=lcov` | `vitest run --coverage` + `@vitest/coverage-v8` |
| `--import tsx/esm` TS loader | Vitest native TypeScript support (esbuild) — no loader needed |

---

## Story 1 — Install Vitest and update devDependencies

- [x] Install `vitest` as a devDependency: `npm install --save-dev vitest`
- [x] Install `@vitest/coverage-v8` as a devDependency: `npm install --save-dev @vitest/coverage-v8`
- [x] Remove `c8` from devDependencies: `npm uninstall c8`
- [x] Remove `tsx` from devDependencies once all test scripts are migrated: `npm uninstall tsx`

---

## Story 2 — Create Vitest configuration file

Create a dedicated `vitest.config.js` at the project root so the Vitest configuration does not pollute `vite.config.js` (which contains production-only build plugins).

- [x] Create `vitest.config.js` using `defineConfig` from `vitest/config`
- [x] Import and apply `@sveltejs/vite-plugin-svelte` in the config (needed to support any `.svelte` transitive imports)
- [x] Set `test.include` to `['test/**/*.test.mjs']`
- [x] Set `test.environment` to `'node'` (tests use `node:fs`, `node:path`, `node:url` — no DOM needed)
- [x] Set `test.globals` to `false` (tests use explicit named imports; globals are not needed)
- [x] Set `test.coverage.provider` to `'v8'`
- [x] Set `test.coverage.reporter` to `['lcov']`
- [x] Set `test.coverage.reportsDirectory` to `'coverage'`
- [x] Set `test.coverage.include` to `['src/**/*.ts', 'src/**/*.js']` to scope coverage to source files only

---

## Story 3 — Update npm scripts in `package.json`

- [x] Replace the `test` script: `vitest run`
- [x] Replace the `test:coverage` script: `vitest run --coverage`
- [x] Update `test:epic1` → `vitest run test/epic1.test.mjs`
- [x] Update `test:epic2` → `vitest run test/epic2-state.test.mjs`
- [x] Update `test:epic3` → `vitest run test/epic3-setup-generator.test.mjs`
- [x] Update `test:epic4` → `vitest run test/epic4-shell-navigation.test.mjs`
- [x] Update `test:epic5` → `vitest run test/epic5-browse-extensions.test.mjs`
- [x] Update `test:epic6` → `vitest run test/epic6-collection-management.test.mjs`
- [x] Update `test:epic7` → `vitest run test/epic7-new-game-experience.test.mjs`
- [x] Update `test:epic8` → `vitest run test/epic8-history-usage-reset.test.mjs`
- [x] Update `test:epic9` → `vitest run test/epic9-notifications-accessibility.test.mjs`
- [x] Update `test:epic12` → `vitest run test/epic12-score-history.test.mjs`
- [x] Update `test:epic13` → `vitest run test/epic13-backup-portability.test.mjs`
- [x] Update `test:epic14` → `vitest run test/epic14-stats-dashboard.test.mjs`
- [x] Update `test:epic18` → `vitest run test/epic18-theme-personalization.test.mjs`
- [x] Update `test:epic19` → `vitest run test/epic19-localization.test.mjs`
- [x] Update `test:epic20` → `vitest run test/epic20-history-grouping.test.mjs`
- [x] Confirm all `test:qc`, `test:qc:*`, and `playwright test` scripts are left unchanged

---

## Story 4 — Migrate test file imports (`node:test` → `vitest`)

**Two patterns exist in the codebase:**

**Pattern A** — file uses `before` for async global setup:
```js
// Before
import test, { before } from 'node:test';
// …
before(async () => { /* setup */ });

// After
import { test, beforeAll } from 'vitest';
// …
beforeAll(async () => { /* setup */ });
```

**Pattern B** — file uses only `test`, no lifecycle hook:
```js
// Before
import test from 'node:test';

// After
import { test } from 'vitest';
```

**`node:assert/strict` is kept as-is in all files.** Vitest runs inside Node.js; `node:assert/strict` throws `AssertionError` on failure, which Vitest catches and reports correctly. No assertion rewrites are required.

### 4.1 — Pattern A files (import `test` + `before`; rename `before` → `beforeAll`)

- [x] `test/design-system-epic1-foundation.test.mjs`
- [x] `test/design-system-rollout.test.mjs`
- [x] `test/epic-ux6-backup-safety.test.mjs`
- [x] `test/epic1.test.mjs`
- [x] `test/epic2-state.test.mjs`
- [x] `test/epic3-setup-generator.test.mjs`
- [x] `test/epic5-browse-extensions.test.mjs`
- [x] `test/epic6-collection-management.test.mjs`
- [x] `test/epic7-new-game-experience.test.mjs`
- [x] `test/epic8-history-usage-reset.test.mjs`
- [x] `test/epic9-notifications-accessibility.test.mjs`
- [x] `test/epic11-play-modes.test.mjs`
- [x] `test/epic12-score-history.test.mjs`
- [x] `test/epic13-backup-portability.test.mjs`
- [x] `test/epic14-stats-dashboard.test.mjs`
- [x] `test/epic15-forced-picks.test.mjs`
- [x] `test/epic16-notification-refinements.test.mjs`
- [x] `test/epic17-onboarding-information-architecture.test.mjs`
- [x] `test/epic20-history-grouping.test.mjs`
- [x] `test/epic21-browse-polish.test.mjs`
- [x] `test/epic22-catalog-ordering.test.mjs`
- [x] `test/epic23-stats-simplification.test.mjs`
- [x] `test/epic24-toast-behavior.test.mjs`
- [x] `test/epic25-header-new-game.test.mjs`
- [x] `test/epic26-classification-corrections.test.mjs`
- [x] `test/epic27-shell-debug-polish.test.mjs`
- [x] `test/epic34-history-grouping.test.mjs`
- [x] `test/epic36-version-storage-disclosure.test.mjs`
- [x] `test/epic37-small-improvements.test.mjs`
- [x] `test/epic42-bgg-import.test.mjs`
- [x] `test/epic43-expansion-attribution.test.mjs`
- [x] `test/epic44-card-browser.test.mjs`
- [x] `test/epic45-myludo-import.test.mjs`
- [x] `test/epic46-active-filter.test.mjs`
- [x] `test/epic53-solo-scheme-eligibility.test.mjs`
- [x] `test/epic56-standard-v2-solo.test.mjs`

### 4.2 — Pattern B files (import `test` only; no lifecycle hook)

- [x] `test/epic4-shell-navigation.test.mjs`
- [x] `test/epic18-theme-personalization.test.mjs`
- [x] `test/epic19-localization.test.mjs`
- [x] `test/epic47-history-outcome-filter.test.mjs`
- [x] `test/epic57-solo-rules-panel.test.mjs`
- [x] `test/epic60-sets-browser-sort.test.mjs`

---

## Story 5 — Normalise test description style across all 42 files

All test descriptions must follow a single convention so Vitest's reporter output is scannable and consistent. The survey found three diverging styles that must be unified:

| Observed pattern | Example | Problem |
|---|---|---|
| Plain sentence, no sub-story number | `'Epic 3 hero counts match ...'` | Inconsistent with later files |
| Sub-story dot notation | `'Epic 42.1 ComponentName prop'` | Mixes story structure into description |
| Function-name colon prefix | `'Epic 42.2 fetchBggCollection: 200 with valid XML ...'` | Implementation detail, not behaviour |

**Target convention** — every description must be a concise behaviour sentence in the form:
`'[Subject] [verb/outcome phrase]'`
- No epic number prefix (file name already scopes the epic; Vitest groups by file)
- No story sub-number (e.g. `42.1`, `42.2`)
- No leading function name followed by a colon
- Use plain English; keep arrow `→` only where it genuinely aids readability (e.g. mapping/alias tests)
- Sentence case; no trailing period

### 5.1 — Audit and rewrite descriptions in Pattern A files

- [x] `test/design-system-epic1-foundation.test.mjs`
- [x] `test/design-system-rollout.test.mjs`
- [x] `test/epic-ux6-backup-safety.test.mjs`
- [x] `test/epic1.test.mjs`
- [x] `test/epic2-state.test.mjs`
- [x] `test/epic3-setup-generator.test.mjs`
- [x] `test/epic5-browse-extensions.test.mjs`
- [x] `test/epic6-collection-management.test.mjs`
- [x] `test/epic7-new-game-experience.test.mjs`
- [x] `test/epic8-history-usage-reset.test.mjs`
- [x] `test/epic9-notifications-accessibility.test.mjs`
- [x] `test/epic11-play-modes.test.mjs`
- [x] `test/epic12-score-history.test.mjs`
- [x] `test/epic13-backup-portability.test.mjs`
- [x] `test/epic14-stats-dashboard.test.mjs`
- [x] `test/epic15-forced-picks.test.mjs`
- [x] `test/epic16-notification-refinements.test.mjs`
- [x] `test/epic17-onboarding-information-architecture.test.mjs`
- [x] `test/epic20-history-grouping.test.mjs`
- [x] `test/epic21-browse-polish.test.mjs`
- [x] `test/epic22-catalog-ordering.test.mjs`
- [x] `test/epic23-stats-simplification.test.mjs`
- [x] `test/epic24-toast-behavior.test.mjs`
- [x] `test/epic25-header-new-game.test.mjs`
- [x] `test/epic26-classification-corrections.test.mjs`
- [x] `test/epic27-shell-debug-polish.test.mjs`
- [x] `test/epic34-history-grouping.test.mjs`
- [x] `test/epic36-version-storage-disclosure.test.mjs`
- [x] `test/epic37-small-improvements.test.mjs`
- [x] `test/epic42-bgg-import.test.mjs`
- [x] `test/epic43-expansion-attribution.test.mjs`
- [x] `test/epic44-card-browser.test.mjs`
- [x] `test/epic45-myludo-import.test.mjs`
- [x] `test/epic46-active-filter.test.mjs`
- [x] `test/epic53-solo-scheme-eligibility.test.mjs`
- [x] `test/epic56-standard-v2-solo.test.mjs`

### 5.2 — Audit and rewrite descriptions in Pattern B files

- [x] `test/epic4-shell-navigation.test.mjs`
- [x] `test/epic18-theme-personalization.test.mjs`
- [x] `test/epic19-localization.test.mjs`
- [x] `test/epic47-history-outcome-filter.test.mjs`
- [x] `test/epic57-solo-rules-panel.test.mjs`
- [x] `test/epic60-sets-browser-sort.test.mjs`

---

## Story 6 — Verify Playwright E2E tests are unaffected

- [x] Confirm `playwright.config.mjs`, `playwright.base.config.mjs`, and `playwright.prod.config.mjs` have no reference to `node:test` or `c8`
- [x] Confirm no file under `test/playwright/` imports from `node:test` (Playwright specs use `@playwright/test`)
- [x] Confirm all `test:qc` scripts continue to invoke `playwright test` unchanged after package.json edits in Story 3

---

## Story 7 — Full regression smoke-test (delegated to QC agent)

- [x] Run `npm run lint` — must pass clean before any test run
- [x] Run `npm test` (vitest run) — all 42 unit test files must pass
- [x] Run `npm run test:coverage` — `coverage/lcov.info` must be generated at project root
- [x] Confirm `coverage/lcov-report/` is populated with HTML report
- [x] Confirm no test file depends on `node:test`-specific behaviour absent in Vitest (e.g. TAP output format, `t.mock`, `test.todo` skip markers)
- [x] Run `npm run test:qc` (Playwright) — E2E suite must remain green
