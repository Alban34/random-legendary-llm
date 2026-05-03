## Epic 88 — E2E Test Organisation: Feature-Named Files and Unified npm Script

**Objective**
Playwright end-to-end tests are currently named after epics (e.g. `epic-N.spec.ts`) and `package.json` exposes a dedicated npm script for each test file, making the suite hard to navigate and maintain as features evolve. This epic renames every e2e spec file after the feature it exercises, consolidates the npm scripts into a single "run all" command, and adds an optional filter mechanism for targeted execution.

**In scope**
- Audit all spec files under `test/playwright/` and produce a feature-to-file mapping
- Rename every spec file to a feature-keyed name (e.g. `setup-forced-picks.spec.ts`, `history-grouping.spec.ts`)
- Update internal `test.describe` labels and cross-file imports to match the new names
- Replace per-epic npm scripts in `package.json` with a single `e2e` script plus a targeted-filter option
- Verify the full e2e suite passes after the reorganisation with no test-count regression

**Stories**

### Story 88.1 — Audit all Playwright spec files and produce a feature-keyed rename mapping
**Acceptance Criteria**
A mapping note (inline in this epic file or as a comment in a migration script) lists every old spec filename and its new feature-keyed target name before any renaming begins.

### Story 88.2 — Rename every spec file under `test/playwright/` to its feature-keyed target name
**Acceptance Criteria**
No file under `test/playwright/` is named after an epic (e.g. no `epic-*.spec.ts`); all spec files use descriptive, feature-keyed names.

### Story 88.3 — Update all `test.describe` labels and cross-file imports to use the new feature-keyed names
**Acceptance Criteria**
All `test.describe` block labels and any cross-file imports reference feature names, not epic numbers; `npm run lint` passes.

### Story 88.4 — Replace per-epic npm scripts with a single `e2e` script and a targeted-filter option in `package.json`
**Acceptance Criteria**
`package.json` contains a single `e2e` script that runs all Playwright specs (e.g. `npx playwright test`); a second script (e.g. `e2e:filter`) accepts a `--grep` or file-path argument for targeted execution; no per-epic scripts remain.

### Story 88.5 — Verify the full e2e suite passes after all renames with no test-count regression
**Acceptance Criteria**
Running `npm run e2e` executes all renamed specs and all pass; the passing test count equals the pre-refactor count.

### Story 88.6 — QC (Automated)
Run `npm run lint` then the full e2e suite; all checks pass with no regressions.
