## Epic 68 — Test Runner Upgrade, Type Coverage & 2.0.0 Release

**Objective**
Update the test infrastructure so that test files can import from the migrated `.ts` source modules, integrate `svelte-check` as the final gate in the type-coverage pipeline, bump the project to version `2.0.0`, and update all documentation to reflect the new TypeScript baseline.

**Background**
After Epics 61–67, all source modules are TypeScript. However, the test files (`test/*.test.mjs`) still import from `.mjs` paths that no longer exist. The test runner (`node --test`) also cannot natively resolve `.ts` imports. This epic resolves the test infrastructure gap, formally closes the migration, and stamps the `2.0.0` release.

**Test runner strategy — `tsx`**
The lightest-weight fix is to replace `node --test` with `node --import tsx/esm --test`, using the `tsx` package (TypeScript Execute). This approach:
- Requires adding `tsx` as a dev dependency.
- Requires updating all `npm run test:*` scripts to use the `--import tsx/esm` flag.
- Requires renaming test file imports from `.mjs` → `.ts` for every source module that was migrated.
- Does **not** require converting test files themselves to TypeScript (they may remain as `.mjs` using JSDoc-typed assertions).

If the team prefers to migrate test files to `.ts` as well (using `tsx --test ./test/*.test.ts`), that is an acceptable variation; the acceptance criteria below accommodate both approaches.

**Version bump rationale**
The migration from a plain-JS codebase to a fully-typed TypeScript codebase is a breaking change in tooling and development workflow, warranting a major version increment to `2.0.0`. There are no breaking changes to the persisted `legendary_state_v1` data schema; existing user data is fully forward-compatible.

**In scope**
- Add `tsx` as a dev dependency
- Update all `test:*` scripts in `package.json` to prefix with `node --import tsx/esm --test` (or migrate to `tsx --test` if the team prefers); this explicitly includes `test:coverage` (`c8 ... node --import tsx/esm --test ./test/*.test.mjs`), which is invoked by the `code-analysis` job in `.github/workflows/ci.yml` to generate the LCOV report uploaded to SonarCloud — breaking it would cause SonarCloud to silently receive empty coverage data
- Update every `import` statement in `test/*.test.mjs` files that reference migrated source modules: change the file extension in the import path from `.mjs` to `.ts`
- Confirm all existing tests still pass (QC agent responsibility; flagged as a gate here)
- Add `svelte-check --tsconfig ./tsconfig.json` to the `npm run lint` script if not already done in Epic 61 (verify and complete)
- Bump `"version"` in `package.json` from `"1.0.4"` to `"2.0.0"`
- Update `documentation/architecture/overview.md` to reflect the TypeScript stack (replace references to `.mjs` entry points with their `.ts` counterparts)
- Update `documentation/README.md` to note the 2.0.0 TypeScript baseline
- Add a `2.0.0` entry to the release notes (create `documentation/release-notes/2.0.0.md` following the existing release-notes format)

**Out of scope**
- Converting test files from `.mjs` to `.ts` (optional; accommodated but not required)
- Adding new tests for the type system itself
- Editing `.github/workflows/ci.yml` or `.github/workflows/deploy.yml` — no workflow file changes are needed; every CI job (`lint-and-test`, `code-analysis`, `bundle-size`, `security-audit`) already invokes npm scripts (`npm run lint`, `npm test`, `npm run test:coverage`, `npm run test:qc`, `npm run build`) that are updated by this epic or by Epic 61; the CI gate automatically tightens without any YAML edits
- Changing any application logic or user-facing behavior

**Stories**
1. **Add `tsx` as a dev dependency and update all `test:*` npm scripts to use the TypeScript-aware runner**
2. **Update all import paths in test files from `.mjs` to `.ts` for every migrated source module**
3. **Verify the full test suite passes with the new runner (gate: QC agent runs `npm test`)**
4. **Bump `package.json` version to `2.0.0` and update architecture documentation and release notes**

**Acceptance Criteria**
- Story 1: `tsx` appears in `package.json` `devDependencies`; every `test:*` script uses `node --import tsx/esm --test` (or `tsx --test`) instead of bare `node --test`; `npm run test:epic1` executes without import resolution errors.
- Story 2: Every `import` path in `test/*.test.mjs` files that previously referenced a `.mjs` source module now references the corresponding `.ts` file; no `ERR_MODULE_NOT_FOUND` errors appear when running any test script; `npm run lint` (including `svelte-check`) exits 0.
- Story 3: `npm test` exits with code 0 and all previously-passing tests continue to pass; no test regressions are introduced by the import path changes or runner switch (QC agent sign-off required).
- Story 4: `package.json` `"version"` is `"2.0.0"`; `documentation/architecture/overview.md` references the `.ts` entry points for all listed runtime modules; `documentation/release-notes/2.0.0.md` exists and documents the TypeScript migration as the primary change; `npm run build` produces a valid bundle stamped with version `2.0.0`.
