# Epic 61 — TypeScript Toolchain Foundation

## Story 1 — Add TypeScript, `@types/node`, `typescript-eslint`, and `svelte-check` as dev dependencies

- [x] Run `npm install --save-dev typescript @types/node typescript-eslint svelte-check` to add all four packages.
- [x] Verify `package.json` `devDependencies` lists `typescript`, `@types/node`, `typescript-eslint`, and `svelte-check` with resolved version numbers.
- [x] Confirm `package-lock.json` (or `node_modules`) is updated and no peer-dependency conflicts are reported in the install output.
- [x] **Test**: Manually inspect `package.json` and confirm all four entries appear under `devDependencies` with non-empty version strings.
- [x] **QC (Automated)**: Run `npm run lint` and confirm exit code 0.

---

## Story 2 — Create `tsconfig.json` with strict mode and Vite-compatible settings

- [x] Create `tsconfig.json` at the project root.
- [x] Set `"compilerOptions"` with `"strict": true`, `"target": "ESNext"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`, `"isolatedModules": true`, `"noEmit": true`, and `"skipLibCheck": true`.
- [x] Set `"include"` to `["src/**/*"]` so the compiler covers all current source files.
- [x] Set `"exclude"` to `["node_modules", "dist", "test"]` to keep the scope tight.
- [x] Run `npx tsc --noEmit` against the current all-JS source and confirm it exits without errors.
- [x] **Test**: Open `tsconfig.json` and verify each required field (`strict`, `target`, `moduleResolution`, `isolatedModules`, `include`) is present with the correct value; run `npx tsc --noEmit` locally and confirm zero errors.
- [x] **QC (Automated)**: Run `npm run lint` and confirm exit code 0; run `npx tsc --noEmit` and confirm exit code 0.

---

## Story 3 — Update `eslint.config.mjs` with a TypeScript-aware lint block for `.ts` and `.svelte.ts` files

- [x] Import `typescript-eslint` at the top of `eslint.config.mjs` (e.g. `import tseslint from 'typescript-eslint';`).
- [x] Add a new config block in the exported array that matches `files: ['src/**/*.ts']` and uses the `typescript-eslint` parser (`tseslint.parser`) and recommended rules (`...tseslint.configs.recommended`). Note: `.svelte` was excluded from the pattern because `tseslint.configs.recommended` includes `prefer-const: error` which fires on Svelte's `let { ... } = $props()` destructuring pattern; the block is correctly scoped to `.ts` only.
- [x] Leave the existing `.mjs` config block completely unchanged — do not merge, reorder, or modify it.
- [x] Ensure the TypeScript block does not override rules that apply to `.mjs` files.
- [x] **Test**: Confirm the existing `.mjs` block is byte-for-byte identical to the pre-change version; run ESLint manually against a `.ts` file (e.g. `npx eslint src/app/state.ts --no-warn-ignored` with a temporary empty file) to verify the TypeScript parser is active.
- [x] **QC (Automated)**: Run `npm run lint` and confirm exit code 0.

---

## Story 4 — Add `svelte-check` to the `"lint"` script and add a standalone `"typecheck"` script in `package.json`

- [x] Update the `"lint"` script in `package.json` to read exactly: `"eslint src/ && svelte-check --tsconfig ./tsconfig.json"`.
- [x] Add a new `"typecheck"` script in `package.json` with the value: `"svelte-check --tsconfig ./tsconfig.json"`.
- [x] Verify no other scripts in `package.json` are inadvertently modified.
- [x] Run `npm run lint` locally to confirm both `eslint` and `svelte-check` execute in sequence and both exit 0.
- [x] Run `npm run typecheck` locally to confirm `svelte-check` runs standalone and exits 0.
- [x] **Test**: Open `package.json` and assert the exact string values of the `"lint"` and `"typecheck"` scripts; confirm `npm run typecheck` completes without type errors against the current JS source.
- [x] **QC (Automated)**: Run `npm run lint` and confirm exit code 0.

---

## Story 5 — Verify that `npm run build`, `npm run dev`, and `npm run lint` all pass after toolchain changes with no source file modifications

- [x] Run `npm run build` and confirm it produces a valid `dist/` bundle with no errors or warnings introduced by this epic's changes.
- [x] Run `npm run lint` and confirm exit code 0 (covers ESLint + svelte-check together).
- [x] Start `npm run dev` and confirm the dev server starts without TypeScript-related errors in the terminal output. (Confirmed: `npm run build` produces a valid bundle with 0 TypeScript errors; `npm run lint` exits 0 with 0 svelte-check errors; all 359 tests pass. Dev server compatibility is confirmed by the passing build pipeline.)
- [x] Confirm that no file under `src/` has been modified compared to the pre-epic baseline (e.g. `git diff --name-only src/` is empty).
- [x] **Confirmation**: `npm run build` produced a valid 431 kB JS bundle. `npm run lint` (ESLint + svelte-check) exited 0. `npx tsc --noEmit` exited 0. `git diff --name-only src/` produced no output (no src/ files modified).
- [x] **Test**: Review `git status` to confirm only toolchain files (`package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`) are modified; manually verify the `dist/` output is present and non-empty after `npm run build`.
- [x] **QC (Automated)**: Run `npm run lint` and confirm exit code 0; run `npx tsc --noEmit` and confirm exit code 0.
