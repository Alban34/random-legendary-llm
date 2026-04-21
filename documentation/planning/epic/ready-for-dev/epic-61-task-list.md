# Epic 61 — TypeScript Toolchain Foundation

## Story 1 — Add TypeScript, `@types/node`, `typescript-eslint`, and `svelte-check` as dev dependencies

- [ ] Run `npm install --save-dev typescript @types/node typescript-eslint svelte-check` to add all four packages.
- [ ] Verify `package.json` `devDependencies` lists `typescript`, `@types/node`, `typescript-eslint`, and `svelte-check` with resolved version numbers.
- [ ] Confirm `package-lock.json` (or `node_modules`) is updated and no peer-dependency conflicts are reported in the install output.
- [ ] **Test**: Manually inspect `package.json` and confirm all four entries appear under `devDependencies` with non-empty version strings.
- [ ] **QC (Automated)**: Run `npm run lint` and confirm exit code 0.

---

## Story 2 — Create `tsconfig.json` with strict mode and Vite-compatible settings

- [ ] Create `tsconfig.json` at the project root.
- [ ] Set `"compilerOptions"` with `"strict": true`, `"target": "ESNext"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`, `"isolatedModules": true`, `"noEmit": true`, and `"skipLibCheck": true`.
- [ ] Set `"include"` to `["src/**/*"]` so the compiler covers all current source files.
- [ ] Set `"exclude"` to `["node_modules", "dist", "test"]` to keep the scope tight.
- [ ] Run `npx tsc --noEmit` against the current all-JS source and confirm it exits without errors.
- [ ] **Test**: Open `tsconfig.json` and verify each required field (`strict`, `target`, `moduleResolution`, `isolatedModules`, `include`) is present with the correct value; run `npx tsc --noEmit` locally and confirm zero errors.
- [ ] **QC (Automated)**: Run `npm run lint` and confirm exit code 0; run `npx tsc --noEmit` and confirm exit code 0.

---

## Story 3 — Update `eslint.config.mjs` with a TypeScript-aware lint block for `.ts` and `.svelte.ts` files

- [ ] Import `typescript-eslint` at the top of `eslint.config.mjs` (e.g. `import tseslint from 'typescript-eslint';`).
- [ ] Add a new config block in the exported array that matches `files: ['src/**/*.ts', 'src/**/*.svelte']` and uses the `typescript-eslint` parser (`tseslint.parser`) and recommended rules (`...tseslint.configs.recommended`).
- [ ] Leave the existing `.mjs` config block completely unchanged — do not merge, reorder, or modify it.
- [ ] Ensure the TypeScript block does not override rules that apply to `.mjs` files.
- [ ] **Test**: Confirm the existing `.mjs` block is byte-for-byte identical to the pre-change version; run ESLint manually against a `.ts` file (e.g. `npx eslint src/app/state.ts --no-warn-ignored` with a temporary empty file) to verify the TypeScript parser is active.
- [ ] **QC (Automated)**: Run `npm run lint` and confirm exit code 0.

---

## Story 4 — Add `svelte-check` to the `"lint"` script and add a standalone `"typecheck"` script in `package.json`

- [ ] Update the `"lint"` script in `package.json` to read exactly: `"eslint src/ && svelte-check --tsconfig ./tsconfig.json"`.
- [ ] Add a new `"typecheck"` script in `package.json` with the value: `"svelte-check --tsconfig ./tsconfig.json"`.
- [ ] Verify no other scripts in `package.json` are inadvertently modified.
- [ ] Run `npm run lint` locally to confirm both `eslint` and `svelte-check` execute in sequence and both exit 0.
- [ ] Run `npm run typecheck` locally to confirm `svelte-check` runs standalone and exits 0.
- [ ] **Test**: Open `package.json` and assert the exact string values of the `"lint"` and `"typecheck"` scripts; confirm `npm run typecheck` completes without type errors against the current JS source.
- [ ] **QC (Automated)**: Run `npm run lint` and confirm exit code 0.

---

## Story 5 — Verify that `npm run build`, `npm run dev`, and `npm run lint` all pass after toolchain changes with no source file modifications

- [ ] Run `npm run build` and confirm it produces a valid `dist/` bundle with no errors or warnings introduced by this epic's changes.
- [ ] Run `npm run lint` and confirm exit code 0 (covers ESLint + svelte-check together).
- [ ] Start `npm run dev` and confirm the dev server starts without TypeScript-related errors in the terminal output.
- [ ] Confirm that no file under `src/` has been modified compared to the pre-epic baseline (e.g. `git diff --name-only src/` is empty).
- [ ] Leave a brief confirmation note in this task list (or in an epic-level note file) stating that all three commands passed and no source files were changed.
- [ ] **Test**: Review `git status` to confirm only toolchain files (`package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.mjs`) are modified; manually verify the `dist/` output is present and non-empty after `npm run build`.
- [ ] **QC (Automated)**: Run `npm run lint` and confirm exit code 0; run `npx tsc --noEmit` and confirm exit code 0.
