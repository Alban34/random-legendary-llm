# Epic 81 — Eliminate All .js Source Files

## Story 81.1 — Audit all `.js` files and produce inventory

### Inventory

The following is the complete inventory of every `.js` file found in the repository (project root, `src/`, `tools/`, `public/`) as of the Epic 81 audit. No files exist under `tools/` with a live `.js` extension; two dead backup scripts carry a `.mjs.bak` double extension and are listed as non-JS cleanup candidates.

| # | File | Area | Intended action | Story |
|---|------|------|-----------------|-------|
| 1 | `eslint.config.js` | root | Convert to `eslint.config.ts` | 81.2 |
| 2 | `svelte.config.js` | root | Convert to `svelte.config.ts` | 81.2 |
| 3 | `vite.config.js` | root | Convert to `vite.config.ts` | 81.2 |
| 4 | `vitest.config.js` | root | Convert to `vitest.config.ts` | 81.2 |
| 5 | `src/app/backup-vm.svelte.js` | src/ | Delete — dead code; already superseded by `backup-vm.svelte.ts` | 81.3 |
| 6 | `src/app/browse-vm.svelte.js` | src/ | Delete — dead code; already superseded by `browse-vm.svelte.ts` | 81.3 |
| 7 | `src/app/history-vm.svelte.js` | src/ | Delete — dead code; already superseded by `history-vm.svelte.ts` | 81.3 |
| 8 | `src/app/import-vm.svelte.js` | src/ | Delete — dead code; already superseded by `import-vm.svelte.ts` | 81.3 |
| 9 | `src/app/new-game-vm.svelte.js` | src/ | Delete — dead code; already superseded by `new-game-vm.svelte.ts` | 81.3 |
| 10 | `src/app/state-store.svelte.js` | src/ | Delete — dead code; already superseded by `state-store.svelte.ts` | 81.3 |
| 11 | `public/sw.js` | public/ | Migrate to `src/sw.ts`; add esbuild-backed Vite plugin to compile it to `dist/sw.js` during build | 81.3 |

**Non-JS cleanup candidates** (not `.js` files; included for completeness):

| File | Notes |
|------|-------|
| `tools/build.mjs.bak` | Dead backup of the pre-Vite esbuild script; never executed |
| `tools/dev-server.mjs.bak` | Dead backup of the pre-Vite dev server; never executed |

### Tasks

- [ ] Run `find . -name '*.js' -not -path './node_modules/*' -not -path './dist/*' -not -path './coverage/*'` to confirm the inventory above is complete and record the output as a comment in this task list
- [ ] Verify that all six `src/app/*.svelte.ts` counterparts already exist and that no `src/` or `test/` file imports from any `*.svelte.js` path (confirm with `grep -r '\.svelte\.js' src/ test/`)
- [ ] Confirm that all Svelte components in `src/components/` import view-model functions from `.svelte.ts` paths, not `.svelte.js` paths
- [ ] **Test:** no automated test to write for the audit itself; record the `find` output in a comment below this task and sign off
- [ ] **QC (Automated):** n/a for this story; inventory is a planning artefact only

---

## Story 81.2 — Convert root toolchain config files to TypeScript

### Context notes (required before implementing)

- **`vite.config.js`**: Imports `package.json` via `createRequire`; defines a custom `swInjectPlugin`; uses `defineConfig(({ command }) => …)`. Rename to `vite.config.ts`, annotate `swInjectPlugin` return type as `import type { Plugin } from 'vite'`, and annotate the `command` parameter as `'build' | 'serve'`. Keep `createRequire` for the `package.json` read; no `resolveJsonModule` change needed.
- **`vitest.config.js`**: Minimal config with `defineConfig`. Rename to `vitest.config.ts`; no structural changes required.
- **`svelte.config.js`**: Two-line config. Rename to `svelte.config.ts`; add `import type { UserConfig } from '@sveltejs/vite-plugin-svelte'` and annotate the default export as `satisfies UserConfig`.
- **`eslint.config.js`**: ESLint 9.9+ supports `.ts` config files via `tsx` (already installed as a devDependency). Rename to `eslint.config.ts`; type imports are optional — the config works untyped but `tsconfig` must include it (see below).
- **`tsconfig.json`**: Currently `"include": ["src/**/*"]`. Add `"*.config.ts"` so that `tsc --noEmit` type-checks all four root config files.

### Tasks

- [ ] Delete `vite.config.js` and create `vite.config.ts` with identical logic; add `import type { Plugin } from 'vite'` and annotate the `swInjectPlugin` function signature: `function swInjectPlugin(command: 'build' | 'serve'): Plugin`
- [ ] Delete `vitest.config.js` and create `vitest.config.ts` with identical logic; in the coverage `include` array, remove the `'src/**/*.js'` entry (no `.js` source files will remain after Story 81.3)
- [ ] Delete `svelte.config.js` and create `svelte.config.ts`; add `import type { UserConfig } from '@sveltejs/vite-plugin-svelte'` and change the default export to `export default { … } satisfies UserConfig`
- [ ] Delete `eslint.config.js` and create `eslint.config.ts` with identical logic (no structural changes required for the rename)
- [ ] In `tsconfig.json`, update the `"include"` array from `["src/**/*"]` to `["src/**/*", "*.config.ts"]` so all four new config files are covered by `tsc --noEmit`
- [ ] Run `npx tsc --noEmit` and confirm no type errors are introduced by the four new config files
- [ ] Run `npm run build` locally and confirm the build completes without errors and `dist/` output is identical in structure to the pre-conversion baseline
- [ ] **Test:** Run `npm run lint` and confirm ESLint loads from `eslint.config.ts` without errors; run `npm run build` and `npm test` and confirm both pass
- [ ] **QC (Automated):** QC agent runs `npm run lint`, `npm test`, and `npm run build` on the branch; all three must pass with zero new errors or warnings

---

## Story 81.3 — Remove remaining `.js` files under `src/` and `public/`

### Context notes (required before implementing)

**`src/app/*.svelte.js` files (6 files):** All six are dead code. Each was already superseded by its `.svelte.ts` counterpart during a prior migration. All Svelte components import only from `.svelte.ts` paths. No test file references any `.svelte.js` path. Safe to delete without any import-path updates.

**`public/sw.js`:** This is the Service Worker source template. It is served directly to the browser so it must be emitted as `sw.js` — TypeScript cannot be served as-is. The correct approach is:
1. Move the source to `src/sw.ts` and add a `/// <reference lib="webworker" />` triple-slash directive at the top so the TS compiler resolves `self`, `caches`, and other SW globals correctly.
2. Add a `swCompilePlugin` to `vite.config.ts` that uses `esbuild` (already a devDependency) to compile `src/sw.ts` → `dist/sw.js` during the `writeBundle` hook, before `swInjectPlugin`'s `closeBundle` hook reads and patches the file.
3. Remove `public/sw.js` so Vite no longer copies a `.js` file to `dist/`.
4. The existing `swInjectPlugin` (which reads `dist/sw.js` and injects placeholders) requires no further changes.

**`tools/*.mjs.bak` files:** Not `.js` files, but dead artifacts. Delete both to complete the cleanup.

### Tasks

**Dead `src/app/*.svelte.js` deletion:**

- [ ] Confirm with `grep -rn 'svelte\.js' src/ test/'` that no live import still references any of the six files
- [ ] Delete `src/app/backup-vm.svelte.js`
- [ ] Delete `src/app/browse-vm.svelte.js`
- [ ] Delete `src/app/history-vm.svelte.js`
- [ ] Delete `src/app/import-vm.svelte.js`
- [ ] Delete `src/app/new-game-vm.svelte.js`
- [ ] Delete `src/app/state-store.svelte.js`

**`public/sw.js` → `src/sw.ts` migration:**

- [ ] Create `src/sw.ts` with identical content to `public/sw.js`; add `/// <reference lib="webworker" />` as the very first line and remove the file-level `const` declarations' inferred global types if TypeScript reports conflicts
- [ ] Delete `public/sw.js`
- [ ] In `vite.config.ts`, add a new `swCompilePlugin` function before `swInjectPlugin` that uses `esbuild.build()` in its `writeBundle` hook to compile `src/sw.ts` to `dist/sw.js` with `bundle: false`, `format: 'iife'`, `target: 'es2020'`; add `import { build as buildSw } from 'esbuild'` at the top of `vite.config.ts`
- [ ] Add `swCompilePlugin(command)` to the `plugins` array in `vite.config.ts` before `swInjectPlugin(command)`
- [ ] Run `npm run build` and confirm `dist/sw.js` exists, contains no `%%SW_CACHE_VERSION%%` or `%%SW_PRECACHE_URLS%%` placeholders, and contains a valid precache URL array
- [ ] Confirm `src/app/browser-entry.ts` still registers the SW at `import.meta.env.BASE_URL + 'sw.js'` — no change needed since the output filename is unchanged

**Dead tools backup scripts:**

- [ ] Delete `tools/build.mjs.bak`
- [ ] Delete `tools/dev-server.mjs.bak`

**Coverage config update:**

- [ ] Confirm `vitest.config.ts` coverage `include` no longer contains `'src/**/*.js'` (this should have been done in Story 81.2; verify here)

**Verification:**

- [ ] Run `find . -name '*.js' -not -path './node_modules/*' -not -path './dist/*' -not -path './coverage/*'` and confirm zero results
- [ ] Run `npx tsc --noEmit` and confirm no new type errors
- [ ] **Test:** Run `npm run build`; verify `dist/sw.js` exists and is well-formed; run `npm test` and confirm all test suites pass
- [ ] **QC (Automated):** QC agent runs `npm run lint`, `npm test`, and `npm run build`; confirms `dist/sw.js` is present with placeholders replaced; confirms `find . -name '*.js' -not -path './node_modules/*' -not -path './dist/*'` returns zero results

---

## Story 81.4 — Add lint guardrail to prevent `.js` source file regression

### Context notes (required before implementing)

ESLint's flat config supports a `no-restricted-syntax` rule targeting the `Program` AST node to trigger an error on every file that matches a given `files` glob. Adding a config block matching `src/**/*.js` and the project root `*.js` pattern with this rule causes `npm run lint` to fail immediately if any new `.js` file is introduced in those locations.

The block must be placed **after** all other config entries in `eslint.config.ts` so it does not interfere with existing rule sets. Config files at the project root (e.g., `vite.config.ts`) will be `.ts` after Story 81.2 and are not affected.

### Tasks

- [ ] In `eslint.config.ts`, append a new config object at the end of the exported array:
  ```ts
  {
    files: ['src/**/*.js', '*.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message:
            'JavaScript source files (.js) are not permitted in this project. Rename to .ts or .svelte.ts.',
        },
      ],
    },
  },
  ```
- [ ] Run `npm run lint` on the clean branch (no `.js` files present) and confirm zero errors from the new rule
- [ ] Manually create a temporary `src/guardrail-test.js` file containing `const x = 1;`, run `npm run lint`, confirm the output contains the "JavaScript source files (.js) are not permitted" error message, then delete the temporary file
- [ ] Confirm the temporary file deletion restores a zero-error lint result
- [ ] **Test:** The temporary-file smoke test above (create `src/guardrail-test.js`, run `npm run lint`, assert error, delete file, assert clean) constitutes the manual test for this story
- [ ] **QC (Automated):** QC agent runs `npm run lint` on the final branch; confirms zero lint errors; creates `src/guardrail-test.js`, runs `npm run lint` again, and confirms the error message `"JavaScript source files (.js) are not permitted"` appears in the output; deletes the file
