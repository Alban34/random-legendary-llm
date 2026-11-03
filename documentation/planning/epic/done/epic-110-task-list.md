# Epic 110 Task List — Update All Project Dependencies

## Story 110.1 — Inventory project dependencies and assess available updates

1. - [x] Identify the repository’s package manager and authoritative manifest/lockfile; inventory every declared direct dependency and every lockfile-resolved transitive dependency, recording current versions and dependency paths where applicable
2. - [x] Assess available releases for the complete inventory without presuming that any dependency is outdated; record available updates and the assessment date/source in this task list
3. - [x] Test: verify the inventory covers every direct manifest entry and every resolved lockfile package, and that update availability is recorded for each entry
4. - [x] QC (Automated): run `npm ls --all` and `npm outdated --all`; reconcile their results with the recorded direct and transitive dependency inventory

---

## Story 110.2 — Evaluate compatibility and breaking changes for dependency updates

1. - [x] Evaluate selected available updates against the project’s existing dependency constraints and usage, explicitly reviewing major-version updates and their breaking changes
2. - [x] Record the selected update level and compatibility decision for each assessed dependency; identify any required migration work and defer any update that cannot be safely applied, with its reason and remaining compatibility risk
3. - [x] Keep evaluation limited to project dependencies and compatibility they require; exclude unrelated feature work and platform or infrastructure upgrades
4. - [x] Test: check that every available update in the inventory has a compatibility decision, major-version changes have an explicit breaking-change assessment, and each deferred update has a reason and risk recorded
5. - [x] QC (Automated): run `npm ls --all` to check the existing dependency graph for missing, invalid, or extraneous packages; verify the assessment has a disposition for every inventory entry

---

## Story 110.3 — Update dependency declarations and lockfile resolutions

1. - [x] Update manifest declarations only for the dependencies selected after compatibility assessment; update resolved transitive dependencies where supported by the existing package manager
2. - [x] Regenerate/update the lockfile with the existing package manager and verify its root metadata and resolved dependency graph are coherent with the manifest
3. - [x] Test: install from the updated manifest and lockfile using the package manager’s clean, lockfile-enforcing install command; verify the dependency graph has no missing or invalid entries
4. - [x] QC (Automated): run `npm ci` followed by `npm ls --all` and confirm both complete successfully with the checked-in manifest and lockfile

---

## Story 110.4 — Address compatibility changes caused by dependency updates

1. - [x] Implement only the code, configuration, or test migrations required by the selected dependency updates’ documented compatibility changes — reviewed selected Vite/esbuild, Svelte/Svelte Sonner, Playwright, Vitest/coverage, TypeScript/@types-node, and tsx usages; no migration was indicated or required by the selected targets, so no source/config changes were made
2. - [x] Update or add focused coverage for affected existing behavior; preserve unrelated behavior and avoid unrelated feature changes — existing component and toast-call-site tests provide focused coverage; no additional test change was needed
3. - [x] Test: run the focused tests for each changed integration and verify the compatibility changes address the recorded migration requirements
4. - [x] QC (Automated): run the affected focused test files and `npm run lint`

### Story 110.4 focused verification (2026-11-02)

- **Runtime:** Commands ran with `PATH=/opt/homebrew/bin:$PATH`, Node v26.13.0 and npm 11.20.0. A local Node 22 executable was not available at `/opt/homebrew/opt/node@22/bin/node`; this local verification therefore did not observe the effective Node 22 CI patch (see the residual risk noted below). This is not a runtime-version change.
- **Lint/typecheck:** `PATH=/opt/homebrew/bin:$PATH npm run lint` — passed; ESLint completed and `svelte-check` reported 0 errors and 0 warnings.
- **Focused Vitest:** `PATH=/opt/homebrew/bin:$PATH npm run test -- src/components src/app/feedback-utils.test.ts src/app/app-renderer.test.ts src/app/collection-actions.test.ts src/app/new-game-vm.test.ts src/app/preferences-actions.test.ts src/app/backup-vm.test.ts src/app/import-vm.test.ts src/app/history-vm.test.ts` — passed, 19 files / 215 tests.
- **Coverage-provider check:** `PATH=/opt/homebrew/bin:$PATH npm run test:coverage -- src/components src/app/feedback-utils.test.ts src/app/app-renderer.test.ts src/app/collection-actions.test.ts src/app/new-game-vm.test.ts src/app/preferences-actions.test.ts src/app/backup-vm.test.ts src/app/import-vm.test.ts src/app/history-vm.test.ts` — passed, 19 files / 215 tests; V8 coverage provider loaded successfully.
- **Build:** `PATH=/opt/homebrew/bin:$PATH npm run build` — passed; Vite 6.4.5 generated the production bundle and service worker. Existing Rollup chunk-size warning remains (one minified chunk exceeds 500 kB); no build failure.
- **tsx report:** `PATH=/opt/homebrew/bin:$PATH npm run report:epic1` — passed, 7 checks / 0 failures.
- **Browser verification at initial handoff:** targeted Playwright toast interaction/theme-locale specs and the full `npm test`/Playwright regression had not yet run. They were subsequently executed in the final QC below: all 185 Playwright tests passed, along with 713 Vitest tests, lint, and build.
- **Dependency/security notes:** No manifest or lockfile changes were made. The already-recorded npm audit result is 16 findings (3 low, 13 moderate); no audit fix was applied. npm previously warned that selected ESLint 9.39.5 is unsupported; ESLint 10 remains deferred by the assessed peer/config migration. This compatibility pass did not re-run the audit/install commands.
- **Status at initial handoff:** Story 110.4 implementation/test tasks 1–3 were complete and task 4 was then unchecked for the Epic QC Agent. No source, config, or test files were changed. The browser interaction checks were subsequently completed in the final QC below (185 Playwright tests passed). The local run used Node 26.13.0, so the effective Node 22 CI patch remains unobserved; this is a residual compatibility risk, not an open test task or epic-end sign-off gap.

---

## Story 110.5 — Validate updated dependencies and document blocked updates

1. - [x] Run the existing clean installation check against the final manifest and lockfile, then run `npm run lint`, `npm test`, and `npm run build`
2. - [x] Record the installation and lint/test/build commands and results in this task list; list every dependency left unchanged with its reason and any remaining compatibility risk
3. - [x] Test: verify the recorded results cover installation, lint, tests, and build, and confirm no blocked or deferred dependency is represented as updated
4. - [x] QC (Automated): run `npm ci`, `npm run lint`, `npm test`, and `npm run build`; confirm all pass and match the recorded results

## Story 110.1 — Audit results (2026-11-02)

- **Package manager / authoritative inputs:** npm; `package.json` and npm lockfile v3 (`package-lock.json`). The manifest has **17 direct entries** (1 runtime, 16 development); the lockfile has **322 resolved package entries** excluding its root record. The inventory below includes each direct entry exactly once and all other 305 resolved entries.
- **Toolchain and source:** Read-only registry assessment used Node v26.13.0/npm 11.20.0; this is the assessment host, not the project's declared CI runtime. `.nvmrc` declares Node `22`, and both GitHub Actions workflows use `actions/setup-node` with that file. `Dockerfile` uses the floating `node:lts-alpine` image, so its exact Node major is not pinned. npm registry: `https://registry.npmjs.org/`. Assessment date: **2026-11-02**.
- **Commands / results:** `npm ls --all --json` exited 0; valid JSON, `problems: []`, no `missing`, `invalid`, `extraneous`, `peerMissing`, or `peerInvalid` flags. Its expanded tree contains 496 nodes (including repeated dependency paths). `npm outdated --all --json` exited 1 because updates were reported; stdout was valid JSON and stderr empty. Direct-only `npm outdated --json` likewise exited 1 with valid JSON (17 direct entries reported). These non-zero outdated exit codes are expected when updates exist.
- **Reconciliation:** 322/322 lockfile package entries have a path in the dependency graph; all 17/17 direct manifest entries appear in the report. 252 lockfile entries have a reported available release (34 `wanted update`, 23 `wanted + latest beyond wanted`, 195 `latest beyond wanted`); for 70 entries npm reported no newer release. “No update reported” does not assert obsolescence or a security status.
- **`npm outdated --all` report shape:** 203 package-name keys expanded to 389 records, including records without an installed `current`/`location`. Of these, 153 unique physical locations match lockfile entries; 99 further lockfile entries (mostly platform-conditional optional packages) were reconciled using their lockfile version and matching `dependent`/`wanted` record. The remaining 20 no-location records did not identify a resolved lockfile package and are not counted as inventory entries. `current` in the table comes from the lockfile; `wanted` and `latest` are npm’s registry assessment for the representative dependency path.
- **Table legend:** paths start at the first declared direct dependency (manifest root omitted); `D-run`/`D-dev` mean direct runtime/development and `T`/`T-opt` mean transitive/optional transitive. “Wanted” is npm’s highest release for the applicable request; “latest” is the registry’s `latest` tag. A dash means the npm command did not report an update. This is an availability inventory only; no compatibility or update-selection decision is made in Story 110.1.

| Type | Direct dependency path (manifest root omitted) | Current (lock) | Wanted | Latest | Update classification |
|---|---|---:|---:|---:|---|
| D-dev | `@eslint/js` | 9.39.4 | 9.39.5 | 10.0.1 | wanted + latest beyond wanted |
| D-dev | `@playwright/test` | 1.59.1 | 1.64.1 | 1.64.1 | wanted update |
| D-dev | `@sveltejs/vite-plugin-svelte` | 5.1.1 | 5.1.1 | 7.3.1 | latest beyond wanted |
| D-dev | `@types/node` | 25.6.0 | 25.9.9 | 26.6.6 | wanted + latest beyond wanted |
| D-dev | `@vitest/coverage-v8` | 4.1.5 | 4.1.12 | 5.0.5 | wanted + latest beyond wanted |
| D-dev | `esbuild` | 0.28.0 | 0.28.2 | 0.28.2 | wanted update |
| D-dev | `eslint` | 9.39.4 | 9.39.5 | 10.14.0 | wanted + latest beyond wanted |
| D-dev | `eslint-plugin-svelte` | 2.46.1 | 2.46.1 | 3.23.1 | latest beyond wanted |
| D-dev | `jiti` | 2.6.1 | 2.7.0 | 2.7.0 | wanted update |
| D-dev | `svelte` | 5.55.8 | 5.57.3 | 5.57.3 | wanted update |
| D-dev | `svelte-check` | 4.4.6 | 4.7.8 | 4.7.8 | wanted update |
| D-run | `svelte-sonner` | 1.1.0 | 1.2.2 | 1.2.2 | wanted update |
| D-dev | `tsx` | 4.21.0 | 4.23.15 | 4.23.15 | wanted update |
| D-dev | `typescript` | 6.0.3 | 6.0.3 | 7.0.2 | latest beyond wanted |
| D-dev | `typescript-eslint` | 8.59.0 | 8.72.1 | 8.72.1 | wanted update |
| D-dev | `vite` | 6.4.2 | 6.4.5 | 8.3.5 | wanted + latest beyond wanted |
| D-dev | `vitest` | 4.1.5 | 4.1.12 | 5.0.5 | wanted + latest beyond wanted |
| T | `@vitest/coverage-v8 > magicast > @babel/types > @babel/helper-string-parser` | 7.27.1 | 7.29.11 | 8.0.8 | wanted + latest beyond wanted |
| T | `@vitest/coverage-v8 > magicast > @babel/types > @babel/helper-validator-identifier` | 7.28.5 | 7.29.7 | 8.0.6 | wanted + latest beyond wanted |
| T | `@vitest/coverage-v8 > magicast > @babel/parser` | 7.29.2 | 7.29.12 | 8.1.0 | wanted + latest beyond wanted |
| T | `@vitest/coverage-v8 > magicast > @babel/types` | 7.29.0 | 7.29.11 | 8.1.0 | wanted + latest beyond wanted |
| T | `@vitest/coverage-v8 > @bcoe/v8-coverage` | 1.0.2 | — | — | no update reported |
| T-opt | `esbuild > @esbuild/aix-ppc64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/android-arm` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/android-arm64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/android-x64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/darwin-arm64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/darwin-x64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/freebsd-arm64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/freebsd-x64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-arm` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-arm64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-ia32` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-loong64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-mips64el` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-ppc64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-riscv64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-s390x` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/linux-x64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/netbsd-arm64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/netbsd-x64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/openbsd-arm64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/openbsd-x64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/openharmony-arm64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/sunos-x64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/win32-arm64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/win32-ia32` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T-opt | `esbuild > @esbuild/win32-x64` | 0.28.0 | 0.28.0 | 0.28.2 | latest beyond wanted |
| T | `eslint > @eslint-community/eslint-utils` | 4.9.1 | 4.10.1 | 4.10.1 | wanted update |
| T | `eslint > @eslint-community/eslint-utils > eslint-visitor-keys` | 3.4.3 | 3.4.3 | 5.0.1 | latest beyond wanted |
| T | `eslint > @eslint-community/regexpp` | 4.12.2 | — | — | no update reported |
| T | `eslint > @eslint/config-array` | 0.21.2 | 0.21.2 | 0.23.5 | latest beyond wanted |
| T | `eslint > @eslint/config-array > minimatch > brace-expansion > balanced-match` | 1.0.2 | 1.0.2 | 5.0.0 | latest beyond wanted |
| T | `eslint > @eslint/config-array > minimatch > brace-expansion` | 1.1.14 | 1.1.21 | 5.0.12 | wanted + latest beyond wanted |
| T | `eslint > @eslint/config-array > minimatch` | 3.1.5 | 3.1.5 | 11.0.4 | latest beyond wanted |
| T | `eslint > @eslint/config-helpers` | 0.4.2 | 0.4.2 | 0.7.0 | latest beyond wanted |
| T | `eslint > @eslint/core` | 0.17.0 | 0.17.0 | 1.2.1 | latest beyond wanted |
| T | `eslint > @eslint/eslintrc` | 3.3.5 | 3.3.7 | 3.3.7 | wanted update |
| T | `eslint > @eslint/eslintrc > minimatch > brace-expansion > balanced-match` | 1.0.2 | 1.0.2 | 5.0.0 | latest beyond wanted |
| T | `eslint > @eslint/eslintrc > minimatch > brace-expansion` | 1.1.14 | 1.1.21 | 5.0.12 | wanted + latest beyond wanted |
| T | `eslint > @eslint/eslintrc > minimatch` | 3.1.5 | 3.1.5 | 11.0.4 | latest beyond wanted |
| T | `eslint > @eslint/config-array > @eslint/object-schema` | 2.1.7 | 2.1.7 | 3.0.5 | latest beyond wanted |
| T | `eslint > @eslint/plugin-kit` | 0.4.1 | 0.4.1 | 0.7.3 | latest beyond wanted |
| T | `eslint > @humanfs/node > @humanfs/core` | 0.19.1 | 0.19.2 | 0.20.0 | wanted + latest beyond wanted |
| T | `eslint > @humanfs/node` | 0.16.7 | 0.16.8 | 0.17.0 | wanted + latest beyond wanted |
| T | `eslint > @humanwhocodes/module-importer` | 1.0.1 | — | — | no update reported |
| T | `eslint > @humanwhocodes/retry` | 0.4.3 | — | — | no update reported |
| T | `svelte > @jridgewell/remapping > @jridgewell/gen-mapping` | 0.3.13 | — | — | no update reported |
| T | `svelte > @jridgewell/remapping` | 2.3.5 | — | — | no update reported |
| T | `svelte-check > @jridgewell/trace-mapping > @jridgewell/resolve-uri` | 3.1.2 | — | — | no update reported |
| T | `eslint-plugin-svelte > @jridgewell/sourcemap-codec` | 1.5.5 | 1.6.0 | 1.6.0 | wanted update |
| T | `svelte-check > @jridgewell/trace-mapping` | 0.3.31 | — | — | no update reported |
| T-opt | `vite > rollup > @rollup/rollup-android-arm-eabi` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-android-arm64` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-darwin-arm64` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-darwin-x64` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-freebsd-arm64` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-freebsd-x64` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-arm-gnueabihf` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-arm-musleabihf` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-arm64-gnu` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-arm64-musl` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-loong64-gnu` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-loong64-musl` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-ppc64-gnu` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-ppc64-musl` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-riscv64-gnu` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-riscv64-musl` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-s390x-gnu` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-x64-gnu` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-linux-x64-musl` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-openbsd-x64` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-openharmony-arm64` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-win32-arm64-msvc` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-win32-ia32-msvc` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-win32-x64-gnu` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T-opt | `vite > rollup > @rollup/rollup-win32-x64-msvc` | 4.60.1 | 4.60.1 | 4.67.4 | latest beyond wanted |
| T | `vitest > @vitest/expect > @standard-schema/spec` | 1.1.0 | — | — | no update reported |
| T | `svelte > @sveltejs/acorn-typescript` | 1.0.9 | 1.0.13 | 1.0.13 | wanted update |
| T | `@sveltejs/vite-plugin-svelte > @sveltejs/vite-plugin-svelte-inspector` | 4.0.1 | 4.0.1 | 5.0.2 | latest beyond wanted |
| T | `vitest > @vitest/expect > @types/chai` | 5.2.3 | — | — | no update reported |
| T | `vitest > @vitest/expect > @types/chai > @types/deep-eql` | 4.0.2 | — | — | no update reported |
| T | `eslint > @types/estree` | 1.0.8 | 1.0.10 | 1.0.10 | wanted update |
| T | `eslint > @eslint/core > @types/json-schema` | 7.0.15 | — | — | no update reported |
| T | `svelte > @types/trusted-types` | 2.0.7 | — | — | no update reported |
| T | `typescript-eslint > @typescript-eslint/eslint-plugin` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/eslint-plugin > ignore` | 7.0.5 | 7.0.14 | 7.0.14 | wanted update |
| T | `typescript-eslint > @typescript-eslint/parser` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/typescript-estree > @typescript-eslint/project-service` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/scope-manager` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/typescript-estree > @typescript-eslint/tsconfig-utils` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/type-utils` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `svelte > esrap > @typescript-eslint/types` | 8.59.0 | 8.72.1 | 8.72.1 | wanted update |
| T | `typescript-eslint > @typescript-eslint/typescript-estree` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/utils` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/visitor-keys` | 8.59.0 | 8.59.0 | 8.72.1 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/eslint-plugin > @typescript-eslint/visitor-keys > eslint-visitor-keys` | 5.0.1 | — | — | no update reported |
| T | `vitest > @vitest/expect` | 4.1.5 | 4.1.5 | 5.0.5 | latest beyond wanted |
| T | `vitest > @vitest/mocker` | 4.1.5 | 4.1.5 | 5.0.5 | latest beyond wanted |
| T | `vitest > @vitest/pretty-format` | 4.1.5 | 4.1.5 | 5.0.5 | latest beyond wanted |
| T | `vitest > @vitest/runner` | 4.1.5 | 4.1.5 | 4.1.11 | latest beyond wanted |
| T | `vitest > @vitest/snapshot` | 4.1.5 | 4.1.5 | 5.0.5 | latest beyond wanted |
| T | `vitest > @vitest/spy` | 4.1.5 | 4.1.5 | 5.0.5 | latest beyond wanted |
| T | `@vitest/coverage-v8 > @vitest/utils` | 4.1.5 | 4.1.5 | 5.0.5 | latest beyond wanted |
| T | `svelte > acorn` | 8.16.0 | 8.19.0 | 8.19.0 | wanted update |
| T | `eslint > espree > acorn-jsx` | 5.3.2 | — | — | no update reported |
| T | `eslint > ajv` | 6.14.0 | 6.15.0 | 8.20.0 | wanted + latest beyond wanted |
| T | `eslint > chalk > ansi-styles` | 4.3.0 | 4.3.0 | 7.0.0 | latest beyond wanted |
| T | `eslint > @eslint/eslintrc > js-yaml > argparse` | 2.0.1 | 2.0.1 | 3.0.4 | latest beyond wanted |
| T | `svelte > aria-query` | 5.3.1 | 5.3.1 | 5.3.2 | latest beyond wanted |
| T | `vitest > @vitest/expect > @types/chai > assertion-error` | 2.0.1 | — | — | no update reported |
| T | `@vitest/coverage-v8 > ast-v8-to-istanbul` | 1.0.0 | 1.0.7 | 1.0.7 | wanted update |
| T | `svelte > axobject-query` | 4.1.0 | — | — | no update reported |
| T | `typescript-eslint > @typescript-eslint/typescript-estree > minimatch > brace-expansion > balanced-match` | 4.0.4 | 4.0.4 | 5.0.0 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/typescript-estree > minimatch > brace-expansion` | 5.0.6 | 5.0.12 | 5.0.12 | wanted update |
| T | `eslint > @eslint/eslintrc > import-fresh > parent-module > callsites` | 3.1.0 | 3.1.0 | 4.2.0 | latest beyond wanted |
| T | `vitest > @vitest/expect > chai` | 6.2.2 | 6.3.0 | 6.3.0 | wanted update |
| T | `eslint > chalk` | 4.1.2 | 4.1.2 | 6.0.1 | latest beyond wanted |
| T | `svelte-check > chokidar` | 4.0.3 | 4.0.3 | 6.0.0 | latest beyond wanted |
| T | `svelte > clsx` | 2.1.1 | — | — | no update reported |
| T | `eslint > chalk > ansi-styles > color-convert` | 2.0.1 | 2.0.1 | 3.1.3 | latest beyond wanted |
| T | `eslint > chalk > ansi-styles > color-convert > color-name` | 1.1.4 | 1.1.4 | 2.1.1 | latest beyond wanted |
| T | `eslint > minimatch > brace-expansion > concat-map` | 0.0.1 | 0.0.1 | 0.0.2 | latest beyond wanted |
| T | `@vitest/coverage-v8 > @vitest/utils > convert-source-map` | 2.0.0 | — | — | no update reported |
| T | `eslint > cross-spawn` | 7.0.6 | — | — | no update reported |
| T | `eslint-plugin-svelte > postcss-selector-parser > cssesc` | 3.0.0 | — | — | no update reported |
| T | `@sveltejs/vite-plugin-svelte > debug` | 4.4.3 | — | — | no update reported |
| T | `eslint > optionator > deep-is` | 0.1.4 | — | — | no update reported |
| T | `@sveltejs/vite-plugin-svelte > deepmerge` | 4.3.1 | — | — | no update reported |
| T | `svelte > devalue` | 5.8.1 | 5.9.4 | 6.0.3 | wanted + latest beyond wanted |
| T | `vitest > es-module-lexer` | 2.0.0 | 2.3.2 | 3.0.4 | wanted + latest beyond wanted |
| T | `eslint > escape-string-regexp` | 4.0.0 | 4.0.0 | 5.0.0 | latest beyond wanted |
| T | `eslint-plugin-svelte > eslint-compat-utils` | 0.5.1 | 0.5.1 | 0.6.5 | latest beyond wanted |
| T | `eslint > eslint-scope` | 8.4.0 | 8.4.0 | 9.1.2 | latest beyond wanted |
| T | `eslint > eslint-visitor-keys` | 4.2.1 | 4.2.1 | 5.0.1 | latest beyond wanted |
| T | `eslint > minimatch > brace-expansion > balanced-match` | 1.0.2 | 1.0.2 | 5.0.0 | latest beyond wanted |
| T | `eslint > minimatch > brace-expansion` | 1.1.14 | 1.1.21 | 5.0.12 | wanted + latest beyond wanted |
| T | `eslint > minimatch` | 3.1.5 | 3.1.5 | 11.0.4 | latest beyond wanted |
| T | `svelte > esm-env` | 1.2.2 | — | — | no update reported |
| T | `eslint > espree` | 10.4.0 | 10.4.0 | 11.2.0 | latest beyond wanted |
| T | `eslint > esquery` | 1.7.0 | — | — | no update reported |
| T | `svelte > esrap` | 2.2.5 | 2.4.0 | 2.4.0 | wanted update |
| T | `eslint > eslint-scope > esrecurse` | 4.3.0 | — | — | no update reported |
| T | `eslint > eslint-scope > estraverse` | 5.3.0 | — | — | no update reported |
| T | `@vitest/coverage-v8 > ast-v8-to-istanbul > estree-walker` | 3.0.3 | — | — | no update reported |
| T | `eslint > esutils` | 2.0.3 | — | — | no update reported |
| T | `vitest > expect-type` | 1.3.0 | 1.4.0 | 1.4.0 | wanted update |
| T | `eslint > fast-deep-equal` | 3.1.3 | — | — | no update reported |
| T | `eslint > ajv > fast-json-stable-stringify` | 2.1.0 | — | — | no update reported |
| T | `eslint > optionator > fast-levenshtein` | 2.0.6 | 2.0.6 | 3.0.0 | latest beyond wanted |
| T | `svelte-check > fdir` | 6.5.0 | — | — | no update reported |
| T | `eslint > file-entry-cache` | 8.0.0 | 8.0.0 | 11.1.5 | latest beyond wanted |
| T | `eslint > find-up` | 5.0.0 | 5.0.0 | 8.0.0 | latest beyond wanted |
| T | `eslint > file-entry-cache > flat-cache` | 4.0.1 | 4.0.1 | 6.1.23 | latest beyond wanted |
| T | `eslint > file-entry-cache > flat-cache > flatted` | 3.4.2 | 3.4.4 | 3.4.4 | wanted update |
| T-opt | `@playwright/test > playwright > fsevents` | 2.3.2 | 2.3.2 | 2.3.3 | latest beyond wanted |
| T | `tsx > get-tsconfig` | 4.14.0 | 4.14.3 | 4.14.3 | wanted update |
| T | `eslint > glob-parent` | 6.0.2 | — | — | no update reported |
| T | `eslint > @eslint/eslintrc > globals` | 14.0.0 | 14.0.0 | 17.14.0 | latest beyond wanted |
| T | `@vitest/coverage-v8 > istanbul-lib-report > supports-color > has-flag` | 4.0.0 | 4.0.0 | 5.0.1 | latest beyond wanted |
| T | `@vitest/coverage-v8 > istanbul-reports > html-escaper` | 2.0.2 | 2.0.2 | 3.0.3 | latest beyond wanted |
| T | `eslint > ignore` | 5.3.2 | 5.3.2 | 7.0.14 | latest beyond wanted |
| T | `eslint > @eslint/eslintrc > import-fresh` | 3.3.1 | 3.3.1 | 4.0.1 | latest beyond wanted |
| T | `eslint > imurmurhash` | 0.1.4 | — | — | no update reported |
| T | `eslint > is-glob > is-extglob` | 2.1.1 | — | — | no update reported |
| T | `eslint > is-glob` | 4.0.3 | — | — | no update reported |
| T | `svelte > is-reference` | 3.0.3 | — | — | no update reported |
| T | `eslint > cross-spawn > which > isexe` | 2.0.0 | 2.0.0 | 4.0.0 | latest beyond wanted |
| T | `@vitest/coverage-v8 > istanbul-lib-coverage` | 3.2.2 | — | — | no update reported |
| T | `@vitest/coverage-v8 > istanbul-lib-report` | 3.0.1 | — | — | no update reported |
| T | `@vitest/coverage-v8 > istanbul-reports` | 3.2.0 | — | — | no update reported |
| T | `@vitest/coverage-v8 > ast-v8-to-istanbul > js-tokens` | 10.0.0 | — | — | no update reported |
| T | `eslint > @eslint/eslintrc > js-yaml` | 4.1.1 | 4.3.2 | 5.5.0 | wanted + latest beyond wanted |
| T | `eslint > file-entry-cache > flat-cache > keyv > json-buffer` | 3.0.1 | — | — | no update reported |
| T | `eslint > ajv > json-schema-traverse` | 0.4.1 | 0.4.1 | 1.0.0 | latest beyond wanted |
| T | `eslint > json-stable-stringify-without-jsonify` | 1.0.1 | — | — | no update reported |
| T | `eslint > file-entry-cache > flat-cache > keyv` | 4.5.4 | 4.5.4 | 6.1.0 | latest beyond wanted |
| T | `@sveltejs/vite-plugin-svelte > kleur` | 4.1.5 | — | — | no update reported |
| T | `eslint-plugin-svelte > known-css-properties` | 0.35.0 | 0.35.0 | 0.37.0 | latest beyond wanted |
| T | `eslint > @eslint/plugin-kit > levn` | 0.4.1 | — | — | no update reported |
| T | `eslint-plugin-svelte > postcss-load-config > lilconfig` | 2.1.0 | 2.1.0 | 3.1.4 | latest beyond wanted |
| T | `svelte > locate-character` | 3.0.0 | — | — | no update reported |
| T | `eslint > find-up > locate-path` | 6.0.0 | 6.0.0 | 8.0.0 | latest beyond wanted |
| T | `eslint > lodash.merge` | 4.6.2 | — | — | no update reported |
| T | `@sveltejs/vite-plugin-svelte > magic-string` | 0.30.21 | 0.30.21 | 1.4.5 | latest beyond wanted |
| T | `@vitest/coverage-v8 > magicast` | 0.5.2 | 0.5.5 | 0.5.5 | wanted update |
| T | `@vitest/coverage-v8 > istanbul-lib-report > make-dir` | 4.0.0 | 4.0.0 | 5.1.0 | latest beyond wanted |
| T | `typescript-eslint > @typescript-eslint/typescript-estree > minimatch` | 10.2.5 | 10.2.6 | 11.0.4 | wanted + latest beyond wanted |
| T | `svelte-check > sade > mri` | 1.2.0 | — | — | no update reported |
| T | `@sveltejs/vite-plugin-svelte > debug > ms` | 2.1.3 | — | — | no update reported |
| T | `eslint-plugin-svelte > postcss > nanoid` | 3.3.11 | 3.3.20 | 6.0.2 | wanted + latest beyond wanted |
| T | `eslint > natural-compare` | 1.4.0 | — | — | no update reported |
| T | `@vitest/coverage-v8 > obug` | 2.1.1 | 2.2.1 | 3.0.0 | wanted + latest beyond wanted |
| T | `eslint > optionator` | 0.9.4 | — | — | no update reported |
| T | `eslint > find-up > locate-path > p-locate > p-limit` | 3.1.0 | 3.1.0 | 7.3.3 | latest beyond wanted |
| T | `eslint > find-up > locate-path > p-locate` | 5.0.0 | 5.0.0 | 7.0.0 | latest beyond wanted |
| T | `eslint > @eslint/eslintrc > import-fresh > parent-module` | 1.0.1 | 1.0.1 | 3.2.0 | latest beyond wanted |
| T | `eslint > find-up > path-exists` | 4.0.0 | 4.0.0 | 5.0.0 | latest beyond wanted |
| T | `eslint > cross-spawn > path-key` | 3.1.1 | 3.1.1 | 4.0.0 | latest beyond wanted |
| T | `vitest > pathe` | 2.0.3 | — | — | no update reported |
| T | `svelte-check > picocolors` | 1.1.1 | — | — | no update reported |
| T | `vite > picomatch` | 4.0.4 | 4.0.7 | 4.0.7 | wanted update |
| T | `@playwright/test > playwright` | 1.59.1 | 1.59.1 | 1.64.1 | latest beyond wanted |
| T | `@playwright/test > playwright > playwright-core` | 1.59.1 | 1.59.1 | 1.64.1 | latest beyond wanted |
| T | `eslint-plugin-svelte > postcss` | 8.5.14 | 8.5.32 | 8.5.32 | wanted update |
| T | `eslint-plugin-svelte > postcss-load-config` | 3.1.4 | 3.1.4 | 6.0.1 | latest beyond wanted |
| T | `eslint-plugin-svelte > postcss-load-config > yaml` | 1.10.3 | 1.10.3 | 2.9.1 | latest beyond wanted |
| T | `eslint-plugin-svelte > postcss-safe-parser` | 6.0.0 | 6.0.0 | 7.1.0 | latest beyond wanted |
| T | `eslint-plugin-svelte > svelte-eslint-parser > postcss-scss` | 4.0.9 | — | — | no update reported |
| T | `eslint-plugin-svelte > postcss-selector-parser` | 6.1.2 | 6.1.5 | 7.1.7 | wanted + latest beyond wanted |
| T | `eslint > optionator > prelude-ls` | 1.2.1 | — | — | no update reported |
| T | `eslint > ajv > uri-js > punycode` | 2.3.1 | — | — | no update reported |
| T | `svelte-check > chokidar > readdirp` | 4.1.2 | 4.1.2 | 5.1.1 | latest beyond wanted |
| T | `eslint > @eslint/eslintrc > import-fresh > resolve-from` | 4.0.0 | 4.0.0 | 5.0.0 | latest beyond wanted |
| T | `tsx > get-tsconfig > resolve-pkg-maps` | 1.0.0 | — | — | no update reported |
| T | `vite > rollup` | 4.60.1 | 4.67.4 | 4.67.4 | wanted update |
| T | `svelte-sonner > runed` | 0.28.0 | 0.28.0 | 0.38.0 | latest beyond wanted |
| T | `svelte-check > sade` | 1.8.1 | — | — | no update reported |
| T | `eslint-plugin-svelte > semver` | 7.7.4 | 7.8.5 | 7.8.5 | wanted update |
| T | `eslint > cross-spawn > shebang-command` | 2.0.0 | — | — | no update reported |
| T | `eslint > cross-spawn > shebang-command > shebang-regex` | 3.0.0 | 3.0.0 | 4.0.0 | latest beyond wanted |
| T | `vitest > why-is-node-running > siginfo` | 2.0.0 | — | — | no update reported |
| T | `@vitest/coverage-v8 > magicast > source-map-js` | 1.2.1 | 1.2.2 | 1.2.2 | wanted update |
| T | `vitest > why-is-node-running > stackback` | 0.0.2 | — | — | no update reported |
| T | `@vitest/coverage-v8 > std-env` | 4.1.0 | 4.3.0 | 4.3.0 | wanted update |
| T | `eslint > @eslint/eslintrc > strip-json-comments` | 3.1.1 | 3.1.1 | 5.0.3 | latest beyond wanted |
| T | `@vitest/coverage-v8 > istanbul-lib-report > supports-color` | 7.2.0 | 7.2.0 | 11.0.0 | latest beyond wanted |
| T | `eslint-plugin-svelte > svelte-eslint-parser` | 0.43.0 | 0.43.0 | 1.10.0 | latest beyond wanted |
| T | `eslint-plugin-svelte > svelte-eslint-parser > eslint-scope` | 7.2.2 | 7.2.2 | 9.1.2 | latest beyond wanted |
| T | `eslint-plugin-svelte > svelte-eslint-parser > eslint-visitor-keys` | 3.4.3 | 3.4.3 | 5.0.1 | latest beyond wanted |
| T | `eslint-plugin-svelte > svelte-eslint-parser > espree` | 9.6.1 | 9.6.1 | 11.2.0 | latest beyond wanted |
| T | `vitest > tinybench` | 2.9.0 | 2.9.0 | 6.2.3 | latest beyond wanted |
| T | `vitest > tinyexec` | 1.1.1 | 1.3.1 | 1.3.1 | wanted update |
| T | `vite > tinyglobby` | 0.2.16 | 0.2.17 | 0.2.17 | wanted update |
| T | `@vitest/coverage-v8 > tinyrainbow` | 3.1.0 | 3.2.0 | 3.2.0 | wanted update |
| T | `typescript-eslint > @typescript-eslint/eslint-plugin > ts-api-utils` | 2.5.0 | — | — | no update reported |
| T-opt | `tsx > esbuild > @esbuild/aix-ppc64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/android-arm` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/android-arm64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/android-x64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/darwin-arm64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/darwin-x64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/freebsd-arm64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/freebsd-x64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-arm` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-arm64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-ia32` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-loong64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-mips64el` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-ppc64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-riscv64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-s390x` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/linux-x64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/netbsd-arm64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/netbsd-x64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/openbsd-arm64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/openbsd-x64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/openharmony-arm64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/sunos-x64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/win32-arm64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/win32-ia32` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > esbuild > @esbuild/win32-x64` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T | `tsx > esbuild` | 0.27.7 | 0.27.7 | 0.28.2 | latest beyond wanted |
| T-opt | `tsx > fsevents` | 2.3.3 | — | — | no update reported |
| T | `eslint > optionator > type-check` | 0.4.0 | — | — | no update reported |
| T | `@types/node > undici-types` | 7.19.2 | 7.19.2 | 8.12.3 | latest beyond wanted |
| T | `eslint > ajv > uri-js` | 4.4.1 | — | — | no update reported |
| T | `eslint-plugin-svelte > postcss-selector-parser > util-deprecate` | 1.0.2 | — | — | no update reported |
| T-opt | `vite > esbuild > @esbuild/aix-ppc64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/android-arm` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/android-arm64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/android-x64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/darwin-arm64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/darwin-x64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/freebsd-arm64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/freebsd-x64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-arm` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-arm64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-ia32` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-loong64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-mips64el` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-ppc64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-riscv64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-s390x` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/linux-x64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/netbsd-arm64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/netbsd-x64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/openbsd-arm64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/openbsd-x64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/openharmony-arm64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/sunos-x64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/win32-arm64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/win32-ia32` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > esbuild > @esbuild/win32-x64` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T | `vite > esbuild` | 0.25.12 | 0.25.12 | 0.28.2 | latest beyond wanted |
| T-opt | `vite > fsevents` | 2.3.3 | — | — | no update reported |
| T | `@sveltejs/vite-plugin-svelte > vitefu` | 1.1.3 | — | — | no update reported |
| T | `eslint > cross-spawn > which` | 2.0.2 | 2.0.2 | 7.0.0 | latest beyond wanted |
| T | `vitest > why-is-node-running` | 2.3.0 | 2.3.0 | 3.2.3 | latest beyond wanted |
| T | `eslint > optionator > word-wrap` | 1.2.5 | — | — | no update reported |
| T | `eslint > find-up > locate-path > p-locate > p-limit > yocto-queue` | 0.1.0 | 0.1.0 | 1.2.2 | latest beyond wanted |
| T | `svelte > zimmerframe` | 1.1.4 | 1.1.5 | 1.1.5 | wanted update |

## Story 110.2 — Compatibility evaluation (assessment complete; QC pending at initial handoff, subsequently passed; 2026-11-02)

- **Assessment boundary:** This addendum finalizes the direct `@types/node` 26.6.6 assessment and distinguishes the Node 26.13.0 assessment host from the Node 22 CI runtime; other direct decisions remain as recorded below. It assesses the transitive rows in the Story 110.1 inventory against their current lockfile parent paths. The inventory has 322 resolved entries, of which 252 report an available release: 17 direct entries decided below and **235 transitive entries evaluated here**. No manifest, lockfile, source, test, or installed dependency was changed.
- **Assessment-time validation notes:** Statements below that QC, release-note review, or focused checks “remain” describe the state when this compatibility assessment was written. They are historical, not open validation tasks; the final QC and its results are recorded below.
- **Registry evidence:** Read-only `npm view` queries used `https://registry.npmjs.org/` on 2026-11-02 with the Node 26.13.0/npm 11.20.0 assessment host. The project CI runtime is separately declared as Node `22` in `.nvmrc`, consumed by both workflows. Immediate-parent dependency/optional/peer ranges and candidate `engines`/`peerDependencies` were checked; semver satisfaction was verified against the parent versions in the lockfile. “Latest” means the inventory’s npm `latest` tag, not a recommendation to override a parent.
- **Direct dependency decisions (all 17 manifest entries):**

| Direct dependency | Current | Selected target | Classification | Compatibility basis / migration disposition |
|---|---:|---:|---|---|
| `@eslint/js` | 9.39.4 | 9.39.5 | patch | In `^9.0.0`; Node engine supports the Node 22 CI baseline. Select patch only. Defer 10.0.1 with ESLint 10 as a set; the breaking changes and required plugin migration are assessed below. |
| `@playwright/test` | 1.59.1 | 1.64.1 | minor | In `^1.59.1`; `node >=20` includes the Node 22 CI baseline. No migration indicated by queried metadata; review changes and QC remain. |
| `@sveltejs/vite-plugin-svelte` | 5.1.1 | 5.1.1 | hold | No update in `^5.0.0`. Defer 7.3.1 with the Vite 8 migration: its peer requires Vite 8 and Svelte 5.46.4+, while installed plugin 5.1.1 peers with Vite 6 and Svelte 5. The coordinated migration and config checks are assessed below. |
| `@types/node` | 25.6.0 | 26.6.6 | major | Select major 26 for Story 110.3: the published package declares `typeScriptVersion: 5.6`, has no peer dependencies or Node `engines` restriction, and TypeScript 6.0.3 plus current `typescript-eslint`/`svelte-check` peers accept TypeScript 6. Existing project Node imports are limited to standard `node:` built-ins; no Node 26-only API is used in the inspected config/source. Story 110.3 must change the range to `^26.6.6` and resolve its `undici-types: ~8.9.0` dependency. Node 22 remains the CI runtime, so the broader declaration surface is a residual risk; typecheck must confirm the actual project API use. |
| `@vitest/coverage-v8` | 4.1.5 | 4.1.12 | patch | In `^4.1.5`; its peer requires Vitest exactly 4.1.12, so select only as a coordinated pair with Vitest 4.1.12. Defer 5.0.5 with Vitest 5; its default mock-clearing change and migration are assessed below. |
| `esbuild` | 0.28.0 | 0.28.2 | patch | In `^0.28.0`; `node >=18`. No migration indicated by queried metadata; QC remains. |
| `eslint` | 9.39.4 | 9.39.5 | patch | In `^9.0.0`; Node engine supports the Node 22 CI baseline. The project uses flat config. Defer 10.14.0 with `@eslint/js` 10 and `eslint-plugin-svelte` 3; migration assessment is below. |
| `eslint-plugin-svelte` | 2.46.1 | 2.46.1 | hold | No update in `^2.46.0`. Defer 3.23.1 with the ESLint 10 set: review the v2-to-v3 preset/rule changes and validate the flat config, as detailed below. |
| `jiti` | 2.6.1 | 2.7.0 | minor | In `^2.6.1`; queried release reports no engine/peer constraints. No migration indicated by queried metadata; QC remains. |
| `svelte` | 5.55.8 | 5.57.3 | minor | In `^5.0.0`; `node >=18`. Target satisfies peers reported by the selected Svelte plugin, Svelte Check, and Svelte Sonner. No migration indicated by queried metadata; QC remains. |
| `svelte-check` | 4.4.6 | 4.7.8 | minor | In `^4.4.6`; Node >=18, Svelte 5 and TypeScript 6 supported by peers. Hold TypeScript 7 because this package’s peer range ends at TypeScript 6. |
| `svelte-sonner` | 1.1.0 | 1.2.2 | minor | In `^1.1.0`; peer supports Svelte 5. Project imports `toast`; review release notes and validate this call site before sign-off. |
| `tsx` | 4.21.0 | 4.23.15 | minor | In `^4.21.0`; Node >=18. No migration indicated by queried metadata; QC remains. |
| `typescript` | 6.0.3 | 6.0.3 | hold | No update in `^6.0.3`. Defer latest 7.0.2: current `typescript-eslint` and `svelte-check` peer ranges exclude TypeScript 7, and TS 7.0 lacks the compiler API required by current tooling; the specific migration boundary is assessed below. |
| `typescript-eslint` | 8.59.0 | 8.72.1 | minor | In `^8.59.0`; peer range supports ESLint 9 and TypeScript 6 (<6.1), matching selected versions. No migration indicated by queried metadata; QC remains. |
| `vite` | 6.4.2 | 6.4.5 | patch | In `^6.0.0`; Node engine supports the Node 22 CI baseline. Target peers include current plugin-Svelte 5 and Vitest 4. Defer latest 8.3.5 (major): plugin-Svelte 5 peers only with Vite 6, requiring coordinated plugin/test-tool migration and Vite config/changelog review, assessed below. |
| `vitest` | 4.1.5 | 4.1.12 | patch | In `^4.1.5`; Node engine requirement includes the Node 22 CI baseline and Vite peers support Vite 6. Coordinate exact peer version with `@vitest/coverage-v8` 4.1.12. Defer 5.0.5 with its coverage peer; the documented migration is assessed below. |

- **Transitive dispositions (bound to the existing inventory rows):** The inventory already records the exact package path, lockfile `current`, npm `wanted`, and npm `latest`; all 235 update-bearing `T`/`T-opt` paths are unique, so dispositions below are a deterministic classification of those rows and do not duplicate the inventory.

| Inventory-row condition (Type `T`/`T-opt`) | Exact count | Disposition |
|---|---:|---|
| `current != wanted` | 43 (26 “wanted update”; 17 “wanted + latest beyond wanted”) | **Select `wanted`.** All 43 satisfy the immediate parent request checked for that exact path. The assessed wanted targets' recorded engine requirements include the Node 22 CI baseline; exact CI patch resolution remains for automated QC. No parent-peer incompatibility was found. |
| `current = wanted` and `latest != wanted` | 192 | **Hold `current`; defer `latest`** because no newer release is admitted by that path’s current parent request. |
| `latest != wanted` (including the 17 rows in the first condition) | 209 total | **Defer `latest`** because it is outside the current parent request. For the 17 overlapping rows, retain the compatible `wanted` target and defer only `latest`. |

These conditions cover all **235/235 transitive update rows**: select `wanted` for 43; hold the current resolution where wanted has not moved for 192; and defer the beyond-wanted tag on 209 paths. `wanted` fits the immediate parent range on all 235 checked rows, and all 209 `latest != wanted` candidates fail that range check. The inventory’s exact path/version columns identify every affected package instance; repeated package names are assessed per path, not collapsed or assigned a guessed common target. No duplicate path key or unresolved path collision was found.

- **Peer/engine exceptions:** For the 43 selected `wanted` path rows, queried metadata produced 26 applicable Node-engine checks and 3 peer checks; the wanted targets' engine requirements include the project's Node 22 CI baseline, and the peer checks found no blockers. The assessment host itself was Node 26.13.0 and is not used as the runtime policy. Across the 209 beyond-wanted paths, 163 applicable engine checks were compatible with that assessment host; two latest-tag peer checks were incompatible with the current graph and reinforce the parent-range deferral: `@sveltejs/vite-plugin-svelte > @sveltejs/vite-plugin-svelte-inspector` 4.0.1 → latest 5.0.2 requires plugin-Svelte `^6.0.0-next.0` (current parent 5.1.1), and `typescript-eslint > @typescript-eslint/eslint-plugin` 8.59.0 → latest 8.72.1 requires parser `^8.72.1` (current parser 8.59.0). These latest targets remain deferred; neither is an exception permitting an out-of-range update.
- **Parent-target coupling / remaining compatibility risk:** These decisions describe the current lockfile graph, not an override plan. Selected direct targets can change child requests when Story 110.3 regenerates the lockfile—for example, `@playwright/test` 1.64.1 pins Playwright/core 1.64.1; `esbuild` 0.28.2 changes its platform binaries; selected `tsx` 4.23.15 changes its esbuild range; and selected `@types/node` 25.9.9 changes `undici-types` to `>=7.24.0 <7.24.7` (7.24.6 is available). The Vitest/coverage and TypeScript-ESLint targets likewise move their exact-version package families. Treat those as parent-coupled lockfile resolutions in 110.3, not independent overrides; re-check the resulting path/version graph against these dispositions. Release notes and every project use site were not reviewed, and no focused compatibility tests were run.
- **Status at initial handoff:** Transitive compatibility dispositions were complete for the 235 update-bearing paths; together with the unchanged 17-entry direct assessment, all **252/252** reported updates had decisions. Story tasks 1–4 were checked, while the automated QC checkbox was still open at that point. QC subsequently passed; see the final QC record below. This assessment itself is not an applied update or full regression sign-off.

### Story 110.2 qualitative release-note, usage, and graph review (2026-11-02)

- **Scope / evidence boundary:** Read-only follow-up to the quantitative assessment above. Checked the current manifest, lockfile, `vite.config.ts`, `eslint.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, package scripts, and relevant imports/use sites. Queried npm registry metadata for the exact target versions, including `dependencies`, `optionalDependencies`, `peerDependencies`, and `engines`. Opened the upstream sources linked below where marked inspected. No dependency installation/update, manifest/lockfile/source/test edit, or test run was performed. Inventory tables above remain authoritative for all 43 transitive paths and exact current/wanted/latest values.
- **Decision vocabulary:** “Select” below means an assessment disposition for a later 110.3 change, not an update already applied. Where release-note content could not be retrieved, the absence is explicit; semver/peer checks are not represented as a changelog review or as proof of behavioral compatibility.

#### Selected direct targets: usage and release evidence

| Direct target | Upstream note checked and compatibility observation |
|---|---|
| `@eslint/js` 9.39.5 | Published with ESLint 9.39.5; its direct pairing is confirmed by the upstream ESLint release and target package metadata. Patch-level target only. The ESLint 10 companion is assessed separately below. |
| `@playwright/test` 1.64.1 | [1.64.1 release notes](https://github.com/microsoft/playwright/releases/tag/v1.64.1) inspected: fixes include an Electron first-window regression and a Chromium cross-origin redirect regression. The project imports `@playwright/test` in its Playwright specs and starts Vite through `playwright.config.ts`; no config API migration was identified in these notes. Browser/e2e behavior still needs focused QC. |
| `@types/node` 26.6.6 | [Published package metadata](https://www.npmjs.com/package/@types/node/v/26.6.6) inspected: declaration-only package, `typeScriptVersion: 5.6`, empty `peerDependencies`, no `engines` field, and dependency `undici-types: ~8.9.0`; no version-specific DefinitelyTyped release note/changelog was found. TypeScript 6.0.3 exceeds the declared TS floor, while `typescript-eslint` 8.72.1 accepts `<6.1.0` and `svelte-check` 4.7.8 accepts TypeScript `^5 || ^6`. `tsconfig.json` uses `target`/`module: ESNext`, `moduleResolution: bundler`, and `skipLibCheck`; it includes `vite.config.ts` but excludes `src/**/*.test.ts`. The Vite config uses `node:module`, `node:crypto`, `node:fs`, and `node:path` APIs; the Node imports in tests are standard assertion/fs/path/url APIs, and no Node 26-only API use was found. **Select the major** for later 110.3; keep runtime at the declared Node 22 CI baseline. This is not a runtime upgrade, but declarations can expose newer APIs than Node 22 provides, so run `npm run typecheck` and retain the runtime/API mismatch as a risk. Change the manifest range to `^26.6.6` and resolve `undici-types` to the parent-requested `~8.9.0`; do not force a separate child override. |
| `@vitest/coverage-v8` 4.1.12 | [Vitest 4.1.12 release](https://github.com/vitest-dev/vitest/releases/tag/v4.1.12) inspected; the patch note is a mocker hardening fix. Registry metadata confirms the coverage package has an exact `vitest: 4.1.12` peer, so it must move with Vitest 4.1.12. `test:coverage` uses provider `v8`; run it after the paired update. |
| `esbuild` 0.28.2 | [0.28.2 release notes](https://github.com/evanw/esbuild/releases/tag/v0.28.2) inspected: tree-shaking and CSS-minification fixes, and restoration of protection against overwriting inputs. The project imports `build` in `vite.config.ts` for the separate `src/sw.ts` build (`bundle:false`, `format:'iife'`, `target:'es2020'`); the notes identify no migration for those options. |
| `eslint` 9.39.5 | [9.39.5 release notes](https://github.com/eslint/eslint/releases/tag/v9.39.5) inspected: bug fix for unavailable `require` cache plus maintenance/documentation. Keep the 9.x target; project already uses flat `eslint.config.ts`. |
| `jiti` 2.7.0 | [2.7.0 release notes](https://github.com/unjs/jiti/releases/tag/v2.7.0) inspected: adds explicit resource-management syntax, opt-in `tsconfigPaths`, virtual modules, and `jiti/static`; no migration is called for in the notes. Current use is the TypeScript ESLint config/runtime path and the `tsx` script family; no new API is used by project code. |
| `svelte` 5.57.3 | [5.57.3 release notes](https://github.com/sveltejs/svelte/releases/tag/svelte%405.57.3) inspected: patch fixes include accessibility-role fallback handling, initialization/state tracking, and hydration attribute writes. The project has Svelte components and Svelte 5 runes; no breaking change is identified in this patch entry. Compile/build and UI-oriented tests remain necessary. |
| `svelte-check` 4.7.8 | [4.7.8 upstream changelog](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check/CHANGELOG.md) inspected: patch fixes concern experimental `--tsgo`/incremental paths and TypeScript 7.1 integration. The selected package's peer range remains TypeScript 5/6; these experimental notes do **not** make TypeScript 7.0.2 compatible with the project's normal `svelte-check --tsconfig` script. |
| `svelte-sonner` 1.2.2 | [upstream changelog](https://github.com/wobsoriano/svelte-sonner/blob/main/CHANGELOG.md) inspected. 1.2.2 fixes auto-closing when duration is infinite; 1.2.0 introduced multiple-toaster routing and changed what `Toaster.id` identifies. Project `App.svelte` uses `<Toaster>` without `id`, and toast call sites do not supply `toasterId`; thus the changed routing/id semantics are not exercised. It does use `closeButton` and a finite duration, so focused visual/interaction QC should still check toast behavior. |
| `tsx` 4.23.15 | [4.23.15 release notes](https://github.com/privatenumber/tsx/releases/tag/v4.23.15) inspected: fixes cover bare built-ins, CommonJS `require.cache`/extensions, and declaration portability. The manifest uses `tsx` in `report:epic1`; that script should be checked. |
| `typescript-eslint` 8.72.1 | [8.72.1 release notes](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v8.72.1) inspected: fixes to conditional-type analysis, recursive traversal, and project-service single-run program reuse. `eslint.config.ts` uses its flat recommended configs, parser, and plugin; no migration is noted for this same-major release. Validate both lint and Svelte typecheck. |
| `vite` 6.4.5 | [6.4.5 changelog](https://github.com/vitejs/vite/blob/v6.4.5/packages/vite/CHANGELOG.md) inspected: one server filesystem access fix. `vite.config.ts` uses `defineConfig`, the Svelte plugin, custom `writeBundle`/`closeBundle` hooks, `base`, and an explicit ES2022 build target; no change to these uses is described by the 6.4.5 entry. |
| `vitest` 4.1.12 | [4.1.12 release notes](https://github.com/vitest-dev/vitest/releases/tag/v4.1.12) inspected: mocker hardening for manual/redirect mocks. Project runs Vitest with `vitest.config.ts`, Svelte plugin, Node environment, and V8 coverage; focused unit and coverage runs are required. The exact coverage peer coupling above applies. |

#### Selected wanted transitive targets: upstream notes and per-path coverage

The following package/version list covers the selected wanted targets; the inventory above preserves each distinct parent path (including repeated package names), and no path is collapsed in the compatibility decision. All selected versions remain within the assessed immediate-parent request and the same package major on each listed path.

| Parent branch in inventory | Selected wanted package targets | Upstream notes / remaining uncertainty |
|---|---|---|
| `@vitest/coverage-v8` (10 paths) | `@babel/helper-string-parser` 7.29.11; `@babel/helper-validator-identifier` 7.29.7; `@babel/parser` 7.29.12; `@babel/types` 7.29.11; `ast-v8-to-istanbul` 1.0.7; `magicast` 0.5.5; `obug` 2.2.1; `source-map-js` 1.2.2; `std-env` 4.3.0; `tinyrainbow` 3.2.0 | `source-map-js` [1.2.2 changelog](https://github.com/7rulnik/source-map-js/blob/main/CHANGELOG.md) explicitly fixes a CSP `unsafe-eval` crash and a denial-of-service in malicious indexed source maps (CVE-2026-93749): a security/robustness fix, not a stated breaking change. Babel 7.29.x release tags were found, but their note bodies could not be inspected after GitHub API rate limiting; `ast-v8-to-istanbul` and `tinyrainbow` tags were likewise located but bodies not inspected. No versioned changelog was found for `magicast`, `obug`, or `std-env` (registry source link was absent/unusable). For the rest, do not infer “no changes” from the missing note body. These are coverage/transform helpers; exercise V8 coverage and inspect any new lockfile paths in 110.3. |
| `vitest` (4 paths) | `chai` 6.3.0; `es-module-lexer` 2.3.2; `expect-type` 1.4.0; `tinyexec` 1.3.1 | Release tags were located for Chai, es-module-lexer, and expect-type, but note bodies were not retrievable after GitHub API rate limiting. No version-specific release note was found for tinyexec. These remain same-major changes; no breaking change is asserted without the missing content. Focused Vitest/unit QC is required. |
| `eslint` (11 paths) | `@eslint-community/eslint-utils` 4.10.1; `@eslint/eslintrc` 3.3.7; `@humanfs/core` 0.19.2; `@humanfs/node` 0.16.8; `@types/estree` 1.0.10; `ajv` 6.15.0; `brace-expansion` 1.1.21 (three distinct paths); `flatted` 3.4.4; `js-yaml` 4.3.2 | [`@eslint/eslintrc` 3.3.7 changelog](https://github.com/eslint/eslintrc/blob/main/CHANGELOG.md) includes the js-yaml 4.3.2 security update. `@humanfs` 0.19.2/0.16.8 remain on their current majors; the later 0.20.0/0.17.0 changelog explicitly labels Node.js 24+ as a breaking engine change, but those are **not** the selected wanted versions. The eslint-utils release tag was found but its body was not inspected after API rate limiting. No version-specific note was located for @types/estree, brace-expansion, ajv, or flatted. Their transitive status is not a substitute for checking ESLint behavior; run lint and graph/engine checks. |
| `eslint-plugin-svelte` (5 paths) | `@jridgewell/sourcemap-codec` 1.6.0; `nanoid` 3.3.20; `postcss` 8.5.32; `postcss-selector-parser` 6.1.5; `semver` 7.8.5 | Inspected changelog entries: sourcemap-codec 1.6.0 adds range-mapping APIs; nanoid 3.3.20 fixes types; PostCSS 8.5.32 fixes source-offset/warning/Promise behavior; semver 7.8.5 fixes prerelease handling for a tilde range. The postcss-selector-parser release tag exists but its note body was not inspected after API rate limiting. All are same-major updates, but parser/source-map changes still merit linting real `.svelte` files. |
| `svelte` (6 paths) | `@sveltejs/acorn-typescript` 1.0.13; `@typescript-eslint/types` 8.72.1; `acorn` 8.19.0; `devalue` 5.9.4; `esrap` 2.4.0; `zimmerframe` 1.1.5 | Inspected changelogs: acorn-typescript 1.0.13 fixes TypeScript AST parsing cases; devalue 5.9.4 adds a tree-shaking annotation (5.9.x also includes serialization/security fixes); esrap 2.4.0 adds an optional `tokens` argument to `print`; zimmerframe 1.1.5 is a traversal-allocation optimization; typescript-eslint 8.72.1 is described above. No breaking change is stated in these selected entries. Acorn 8.19.0 has no versioned note at the standard path checked. Svelte compiler/build tests should cover these internal compiler changes. |
| `typescript-eslint` (3 paths) | `ignore` 7.0.14; `minimatch` 10.2.6; `brace-expansion` 5.0.12 | The selected minimatch/brace-expansion targets stay within their current majors. No version-specific changelog body was found for these exact updates. Keep the exact parent path and peer graph under review; don't substitute the latest major tags shown elsewhere in the inventory. |
| `vite` (3 paths) | `picomatch` 4.0.7; `rollup` 4.67.4; `tinyglobby` 0.2.17 | `tinyglobby` 0.2.17 changelog lists defaults when options are `undefined`, Windows drive-relative paths, and restoration of the `FileSystemAdapter` export. Rollup's release tag exists but its body was not inspected after API rate limiting; no versioned note was found for picomatch. Rollup is Vite's bundler/plugin host, so the project's custom Vite plugin hooks require a production build check. |
| `tsx` (1 path) | `get-tsconfig` 4.14.3 | Release tag located; note body not inspected after GitHub API rate limiting. The only direct project call is `report:epic1`; run that script in focused validation. |

**Source-access limits:** GitHub's unauthenticated release API returned HTTP 403 (rate limit) while retrieving note bodies for the targets explicitly called out above; package release tags or source repositories were found where stated, but tag existence is not treated as reading the notes. Standard versioned changelog paths checked did not yield version entries for the other packages explicitly identified as lacking notes. No changelog is claimed as reviewed for those cases. A follow-up QC reviewer may use the linked tag/source pages or upstream compare links; if still inaccessible, retain the recorded uncertainty rather than inventing change summaries.

#### Deferred direct majors: changelog/config/use assessment

| Candidate major(s) | Evidence and current project use | Decision / migration boundary |
|---|---|---|
| `vite` 8.3.5 | Official [Vite migration guide](https://vite.dev/guide/migration.html) says Vite 8 uses Rolldown/Oxc instead of Rollup/esbuild, changes default browser targets, and deprecates `optimizeDeps.esbuildOptions` in favor of Rolldown options. Current `vite.config.ts` uses `defineConfig`, Svelte plugin, `build.target: 'es2022'`, `base`, and Rollup-compatible custom hooks; it does not set `optimizeDeps.esbuildOptions`. The custom service-worker `buildSw` call is a direct esbuild API, outside Vite's internal transform. Candidate Vite 8 peers include `@sveltejs/vite-plugin-svelte` 7.x, while current plugin 5.1.1 peers only with Vite 6. | **Defer.** Requires coordinated Vite 8 + plugin-Svelte 7 migration, review of plugin-hook/Rolldown compatibility, and build/PWA/service-worker checks. Current configuration looks small but is not evidence that output behavior is identical. |
| `eslint` 10.14.0 + `@eslint/js` 10.0.1 | Official [ESLint 10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0) documents breaking changes including config lookup changes, removal of legacy eslintrc support, JSX reference handling, and `eslint-env` comments becoming errors. Current project already uses a root flat `eslint.config.ts`, `js.configs.recommended`, Svelte flat recommended config, and `typescript-eslint` flat configs; no `.eslintrc` or `eslint-env` use was found. The CI baseline is Node 22 (the exact patch is setup-node-resolved). `@eslint/js` 10.0.1 has an exact ESLint `^10` peer; current `eslint-plugin-svelte` 2.46.1 peer excludes ESLint 10, whereas plugin 3.23.1 allows it. | **Defer as a coordinated set.** Update `eslint` and `@eslint/js` together and migrate `eslint-plugin-svelte` (and verify TypeScript ESLint's config integration); check config-file loading/lookup for `eslint.config.ts`, lint all Svelte/TS source, and compare diagnostics. Existing flat config reduces migration work but does not remove plugin-peer or changed lint semantics risk. |
| `eslint-plugin-svelte` 3.23.1 | Upstream [3.23.1 changelog entry](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/CHANGELOG.md) inspected: its patch entry removes deprecated rules from `all` while retaining active rules; package peers allow ESLint 8/9/10 and Svelte 3/4/5. Current `eslint.config.ts` consumes `svelte.configs['flat/recommended']`, supplies TypeScript parser options, browser/rune globals, and TypeScript rules. The 3.23.1 patch entry does not by itself document the earlier v2-to-v3 transition or prove identical preset/rule output. | **Defer with the ESLint 10 set.** Review the v2→v3 migration history and compare the flat preset/rule set; then lint `.svelte`/`.svelte.ts` and handle new/removed diagnostics deliberately. No independent plugin major is selected. |
| `typescript` 7.0.2 | Official [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) describes the native Go compiler port and explicitly says TypeScript 7.0 does **not** ship the compiler API; it recommends the `@typescript/typescript6` compatibility package/alias for tools such as typescript-eslint that still need the TypeScript 6 API, with TypeScript 7.1 expected to introduce a different API. The current project runs `svelte-check --tsconfig ./tsconfig.json`, uses `strict`, `moduleResolution: 'bundler'`, TS source/config files, and TypeScript ESLint parsing. Current `typescript-eslint` 8.72.1 peer is `>=4.8.4 <6.1.0`; `svelte-check` 4.7.8 peer is `^5 \|\| ^6`. The `--tsgo` experimental fixes in svelte-check 4.7.8 do not widen these normal peer ranges. | **Defer.** Two current type-tool peers explicitly exclude TS7, and TS7.0's missing compiler API means a compatibility alias/workaround is needed for API-consuming tooling. Requires supported versions or an intentional TS6 compatibility alias, review of native-compiler behavior for this `tsconfig`, then `svelte-check`, lint, build and test validation. |
| `@sveltejs/vite-plugin-svelte` 7.3.1 | Official [plugin changelog](https://github.com/sveltejs/vite-plugin-svelte/blob/main/packages/vite-plugin-svelte/CHANGELOG.md) inspected: 7.3.1 is a patch fix, but its peer requires Vite 8 and Svelte `^5.46.4`; current plugin 5.1.1 peers with Vite 6 and Svelte 5. | **Defer** until the Vite 8 migration. The 7.3.1 patch note does not remove the major-version Vite peer requirement. |
| `vitest` 5.0.5 + `@vitest/coverage-v8` 5.0.5 | Official [Vitest migration guide](https://vitest.dev/guide/migration.html) says v5 requires Vite >=6.4.0 and Node >=22.12.0, turns `clearMocks` on by default, and changes `testNamePattern` matching to include the ` > ` suite separator. Project CI resolves Node `22` from `.nvmrc`; the exact patch should be confirmed by QC against the >=22.12.0 floor. Selected Vite 6.4.5 meets the Vite minimum and metadata confirms an exact Vitest/coverage 5.0.5 peer pair. `vitest.config.ts` uses `defineConfig` from `vitest/config`, Svelte plugin, `test.include`, Node environment, and v8 coverage; it does not set `clearMocks`. Tests contain module-scoped `vi.fn` mocks and inspect `.mock.calls`, so the new default can change cross-test call-history behavior. | **Defer.** Migration requires confirming the CI Node patch is >=22.12.0, then either deliberately retaining v4 behavior with `clearMocks: false` or auditing/validating tests under v5's default; also verify test-name filtering. Upgrade coverage-v8 in lockstep and check test discovery, mocks, coverage output, and Svelte config. |

#### Parent/peer graph assessment and next-story checks

- **Immediate-parent requests:** The existing per-path semver checks cover all 43 `wanted` rows; none of those 43 target versions violates its recorded immediate-parent range. Review of selected parent target metadata found no peer conflict in the selected same-major families. Examples: Vite 6.4.5 accepts Rollup `^4.34.9`, picomatch `^4.0.2`, tinyglobby `^0.2.13`; Vitest 4.1.12 peers with Vite 6/7/8 and has an exact 4.1.12 coverage peer; `@vitest/coverage-v8` 4.1.12 has the matching exact peer; TypeScript ESLint 8.72.1's target family is exact 8.72.1 and peers with ESLint 9/TypeScript 6; selected Svelte compiler children satisfy Svelte 5.57.3's declared ranges. No selected candidate requires an out-of-range override.
- **Parent-coupled lockfile changes that are not independent 43-row updates:** `@playwright/test` 1.64.1 pins `playwright` to 1.64.1 (and the corresponding core), superseding the old child's wanted 1.59.1; esbuild 0.28.2 pins its optional platform binaries to 0.28.2; `tsx` 4.23.15 requests esbuild `~0.28.0`; selected `@types/node` 26.6.6 requests `undici-types: ~8.9.0` (replacing the current Node-25-types request), so 110.3 must follow that exact parent range; Vitest and coverage 4.1.12 move their exact-version `@vitest/*` families; TypeScript ESLint 8.72.1 moves its exact-version `@typescript-eslint/*` family. These are expected parent-driven resolutions, not permission to force separate overrides. Re-evaluate the *resulting* lockfile package paths, optional platform packages, peers, and engines after the manifest changes.
- **Story 110.3 focused graph/behavior checks at pre-implementation assessment:** after selecting the direct versions, the planned checks were clean lockfile install and `npm ls --all`; Playwright/core alignment, esbuild binary alignment on the target OS, `undici-types` range, exact Vitest/coverage family versions, TypeScript-ESLint family versions, and all Svelte/Vite peer paths; targeted lint, typecheck, tests, coverage, build, `report:epic1`, and Playwright specs; plus PWA/service-worker output and `svelte-sonner` toast behavior. These checks had not run at that pre-implementation point. They were subsequently executed as applicable in the final QC below: clean install and graph, lint, 713 Vitest tests, 185 Playwright tests, and build all passed. Coverage was also recorded as passed in Story 110.4 focused verification; the final QC explains why it was not repeated.
- **Story 110.4/110.5:** implement only migrations supported by selected version notes; record any deferred target/source-access uncertainty. Story 110.2 QC passed, authorizing the Story 110.3 update recorded below. This assessment is not an epic-end regression sign-off.
- **Status:** Qualitative compatibility decisions and the above focused validation plan are recorded; no update had been applied at the time of this assessment. Story 110.2 tasks 1–4 remain checked, and Story 110.2 QC has passed. This is not an epic-end regression sign-off.

## Story 110.3 — Applied dependency resolutions (2026-11-02)

- **Resolution method:** Node v26.13.0/npm 11.20.0. Used npm update with only the direct targets and 43 selected transitive inventory paths, followed by npm package-manager resolution for the paired Vitest targets. No `overrides` or manual lockfile version edits were used. The existing direct ranges were retained except for `@types/node`, as authorized below.
- **Direct targets actually resolved:**

| Direct dependency | Before | Resolved |
|---|---:|---:|
| `@eslint/js` | 9.39.4 | 9.39.5 |
| `@playwright/test` | 1.59.1 | 1.64.1 |
| `@types/node` | 25.6.0 | 26.6.6 |
| `@vitest/coverage-v8` | 4.1.5 | 4.1.12 |
| `esbuild` | 0.28.0 | 0.28.2 |
| `eslint` | 9.39.4 | 9.39.5 |
| `jiti` | 2.6.1 | 2.7.0 |
| `svelte` | 5.55.8 | 5.57.3 |
| `svelte-check` | 4.4.6 | 4.7.8 |
| `svelte-sonner` | 1.1.0 | 1.2.2 |
| `tsx` | 4.21.0 | 4.23.15 |
| `typescript-eslint` | 8.59.0 | 8.72.1 |
| `vite` | 6.4.2 | 6.4.5 |
| `vitest` | 4.1.5 | 4.1.12 |

`package.json` changes only `@types/node`'s range, from `^25.6.0` to `^26.6.6`; the other direct declarations retain their pre-story ranges. The direct holds remain `@sveltejs/vite-plugin-svelte` 5.1.1, `eslint-plugin-svelte` 2.46.1, and TypeScript 6.0.3. Vite 8, ESLint 10, eslint-plugin-svelte 3, TypeScript 7, Vitest 5, plugin-Svelte 7, and all other latest versions explicitly deferred in Story 110.2 were not selected.

- **Selected transitive wanted reconciliation:** The table below is the exact set of 43 selected inventory paths. Forty-two remain in the resulting graph at the selected `wanted` version. The `tsx > get-tsconfig` child is no longer in the graph under `tsx` 4.23.15, so npm did not retain the old parent’s 4.14.3 target.

| Selected inventory path | Selected wanted | Result in final lock |
|---|---:|---:|
| `@vitest/coverage-v8 > magicast > @babel/types > @babel/helper-string-parser` | 7.29.11 | 7.29.11 |
| `@vitest/coverage-v8 > magicast > @babel/types > @babel/helper-validator-identifier` | 7.29.7 | 7.29.7 |
| `@vitest/coverage-v8 > magicast > @babel/parser` | 7.29.12 | 7.29.12 |
| `@vitest/coverage-v8 > magicast > @babel/types` | 7.29.11 | 7.29.11 |
| `eslint > @eslint-community/eslint-utils` | 4.10.1 | 4.10.1 |
| `eslint > @eslint/config-array > minimatch > brace-expansion` | 1.1.21 | 1.1.21 |
| `eslint > @eslint/eslintrc` | 3.3.7 | 3.3.7 |
| `eslint > @eslint/eslintrc > minimatch > brace-expansion` | 1.1.21 | 1.1.21 |
| `eslint > @humanfs/node > @humanfs/core` | 0.19.2 | 0.19.2 |
| `eslint > @humanfs/node` | 0.16.8 | 0.16.8 |
| `eslint-plugin-svelte > @jridgewell/sourcemap-codec` | 1.6.0 | 1.6.0 |
| `svelte > @sveltejs/acorn-typescript` | 1.0.13 | 1.0.13 |
| `eslint > @types/estree` | 1.0.10 | 1.0.10 |
| `typescript-eslint > @typescript-eslint/eslint-plugin > ignore` | 7.0.14 | 7.0.14 |
| `svelte > esrap > @typescript-eslint/types` | 8.72.1 | 8.72.1 |
| `svelte > acorn` | 8.19.0 | 8.19.0 |
| `eslint > ajv` | 6.15.0 | 6.15.0 |
| `@vitest/coverage-v8 > ast-v8-to-istanbul` | 1.0.7 | 1.0.7 |
| `typescript-eslint > @typescript-eslint/typescript-estree > minimatch > brace-expansion` | 5.0.12 | 5.0.12 |
| `vitest > @vitest/expect > chai` | 6.3.0 | 6.3.0 |
| `svelte > devalue` | 5.9.4 | 5.9.4 |
| `vitest > es-module-lexer` | 2.3.2 | 2.3.2 |
| `eslint > minimatch > brace-expansion` | 1.1.21 | 1.1.21 |
| `svelte > esrap` | 2.4.0 | 2.4.0 |
| `vitest > expect-type` | 1.4.0 | 1.4.0 |
| `eslint > file-entry-cache > flat-cache > flatted` | 3.4.4 | 3.4.4 |
| `tsx > get-tsconfig` | 4.14.3 | removed with the old parent dependency |
| `eslint > @eslint/eslintrc > js-yaml` | 4.3.2 | 4.3.2 |
| `@vitest/coverage-v8 > magicast` | 0.5.5 | 0.5.5 |
| `typescript-eslint > @typescript-eslint/typescript-estree > minimatch` | 10.2.6 | 10.2.6 |
| `eslint-plugin-svelte > postcss > nanoid` | 3.3.20 | 3.3.20 |
| `@vitest/coverage-v8 > obug` | 2.2.1 | 2.2.1 |
| `vite > picomatch` | 4.0.7 | 4.0.7 |
| `eslint-plugin-svelte > postcss` | 8.5.32 | 8.5.32 |
| `eslint-plugin-svelte > postcss-selector-parser` | 6.1.5 | 6.1.5 |
| `vite > rollup` | 4.67.4 | 4.67.4 |
| `eslint-plugin-svelte > semver` | 7.8.5 | 7.8.5 |
| `@vitest/coverage-v8 > magicast > source-map-js` | 1.2.2 | 1.2.2 |
| `@vitest/coverage-v8 > std-env` | 4.3.0 | 4.3.0 |
| `vitest > tinyexec` | 1.3.1 | 1.3.1 |
| `vite > tinyglobby` | 0.2.17 | 0.2.17 |
| `@vitest/coverage-v8 > tinyrainbow` | 3.2.0 | 3.2.0 |
| `svelte > zimmerframe` | 1.1.5 | 1.1.5 |

- **Parent-coupled npm resolutions and lockfile changes:** Playwright and playwright-core resolve to 1.64.1 with `@playwright/test`; esbuild 0.28.2 brings its 26 optional platform entries to 0.28.2; Vite 6.4.5 resolves Rollup 4.67.4 and its 26 optional platform entries; Vitest and its exact-version `@vitest/*` family resolve to 4.1.12; `typescript-eslint` and its exact-version `@typescript-eslint/*` family resolve to 8.72.1. These are npm’s constraint-compatible child resolutions, not independent overrides. `@humanfs/types` 0.15.0, `@sveltejs/load-config` 0.2.3, and the optional Linux x64 `@napi-rs/lzma-linux-x64-gnu` 1.5.1 also enter the graph through selected parents; obsolete child entries including `resolve-pkg-maps` disappear. The lock has 290 package entries (322 before); this also reflects npm’s re-hoisting/deduplication.
- **`@types/node` and Node 22:** The selected `@types/node` 26.6.6 changes `undici-types` from 7.19.2 to 8.9.0, matching its `~8.9.0` dependency. These are type declarations, not a Node runtime update. `.nvmrc` and CI remain on Node 22. A selected-parent optional Rollup package, `@napi-rs/lzma-linux-x64-gnu` 1.5.1, declares `^22.20 || ^24.12 || >=25`; the effective CI Node 22 patch was not observed locally, so its being at least 22.20 remains an unverified compatibility risk (see final QC below). The wider Node 26 type surface may expose APIs absent at runtime 22; the project typecheck passed under local Node 26 in final QC (`npm run lint`/`svelte-check`: 0 errors and 0 warnings), but that does not verify the Node 22 runtime. npm also warns that selected `eslint@9.39.5` is no longer supported; ESLint 10 remains deferred by the assessed peer/config migration.
- **Verification:** `npm ci --prefer-offline` completed successfully (214 packages installed); `npm ls --all` exited 0, and its JSON graph reports `problems: []` for all 17 direct dependencies. Manifest and lock root metadata both remain version 2.3.0 and their root dependency ranges match. npm reported 16 audit findings (3 low, 13 moderate); no audit fix or unrelated security update was applied.
- **Scope/status at initial handoff:** Story 110.3 implementation and install/graph test items 1–3 were complete; final QC was still pending at that point and subsequently passed. See the final QC record below.


## Epic 108/109 + Epic 110.4/110.5 final regression QC (2026-11-02)

- **Scope:** Epic-end full regression after dependency updates; delivery source included the Epic 108/109 `/src` files from commit `3ab542e`. No application or test files were changed by this QC. The Epic 108 and 109 task lists already had their applicable QC items checked; this run revalidated all behavior against the updated manifest.
- **Runtime:** `PATH=/opt/homebrew/bin:$PATH`; Node `v26.13.0`, npm `11.20.0`; resolved `@playwright/test`/`playwright`/`playwright-core` `1.64.1`. Browser supplied for this run: Chromium headless-shell 1248, version `156.0.8078.4`.
- **Commands and results:**
  - `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm ci --prefer-offline` — passed; 214 packages installed and 215 audited. npm reported 16 advisories (3 low, 13 moderate, 0 high, 0 critical).
  - `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm ls --all` — passed (exit 0; dependency tree resolved).
  - `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run lint` — passed after clean install; ESLint and `svelte-check`, 0 errors and 0 warnings.
  - `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm test` — passed; 60 test files, 713 tests.
  - `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:qc` — passed; all 185 Playwright tests, including `toast-stack`, `toast-theme-locale-silence`, and Collection/108/109 browser coverage.
  - `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run build` — passed; Vite 6.4.5 transformed 273 modules. Existing non-blocking warning: one minified chunk exceeds 500 kB.
  - `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm audit --json` — confirmed the same 16 advisories (3 low, 13 moderate, 0 high/critical); command reports audit findings (exit 1). No `npm audit fix` or additional dependency update was run.
- **Coverage disposition:** Full Vitest and Playwright supersede the narrower Story 110.4 targeted checks for this validation; toast requirements in 110.4 are exercised by the full browser suite. `npm run test:coverage` was not repeated: the already recorded Story 110.4 coverage run passed 19 files/215 tests, and it was not needed for this regression gate. No new tests were authored.
- **Node 22 CI compatibility:** `.nvmrc` contains `22`; every setup-node entry in CI/release workflows uses `node-version-file: .nvmrc`, so the workflow selects the latest available Node 22 patch rather than pinning an older patch. The lockfile entry for optional Linux package `@napi-rs/lzma-linux-x64-gnu@1.5.1` declares `^22.20 || ^24.12 || >=25`. The workflow configuration is not pinned below 22.20 and is coherent provided setup-node resolves a current Node 22 patch (>=22.20); this local run used Node 26.13 and therefore does not independently prove the effective CI patch. No workflow change was made.
- **Security note:** The clean install and a fresh audit summary both show the previously documented 16 findings (3 low, 13 moderate, 0 high/critical); deferred dependency changes and their reasons/risks remain as documented in the assessment above.
- **Result:** All requested regression gates passed; no failing tests, implementation root causes, hidden regressions, or paradigm conflicts. Final QC tasks 110.4 and 110.5 are checked.
