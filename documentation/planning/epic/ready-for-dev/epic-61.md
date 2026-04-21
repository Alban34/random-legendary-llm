## Epic 61 — TypeScript Toolchain Foundation

**Objective**
Wire up TypeScript compilation support across the build, lint, and dev pipelines so that subsequent epics can migrate source files to `.ts` and `.svelte.ts` one module at a time without breaking the working application or any existing tooling.

**Background**
The current project is written entirely in plain ESM JavaScript (`.mjs` files, `.svelte.js` reactive modules, and `.svelte` components with untyped `<script>` blocks). The build uses Vite with `@sveltejs/vite-plugin-svelte`, the linter uses ESLint 9 with `eslint-plugin-svelte`, and tests run under Node's built-in test runner against `.mjs` source files directly.

TypeScript support requires:
- A `tsconfig.json` that covers `src/` and the Svelte compiler output.
- `@sveltejs/vite-plugin-svelte` already supports `.svelte.ts` files via the existing `vitePreprocess()` call; only minimal config changes are needed to activate TypeScript preprocessing for `.svelte` files.
- ESLint 9 needs `typescript-eslint` and `eslint-plugin-svelte`'s TypeScript-aware parser to lint `.ts` and `lang="ts"` Svelte scripts.
- `svelte-check` is the canonical compile-time type-checker for Svelte projects; it must be added as a dev dependency and integrated into the lint gate.

No source files are changed in this epic. The goal is an empty-migration proof that `npm run build`, `npm run dev`, and `npm run lint` all continue to pass after the toolchain changes.

**In scope**
- Add `typescript` and `@types/node` as dev dependencies
- Add `typescript-eslint` (the unified package: `typescript-eslint`) as a dev dependency
- Add `svelte-check` as a dev dependency
- Create `tsconfig.json` at the project root, configured for strict mode, `ESNext` target, `bundler` module resolution (matching Vite's defaults), and covering `src/**`
- Update `svelte.config.js` to enable TypeScript preprocessing via `vitePreprocess()` (already present; verify it is sufficient for `.svelte.ts` support)
- Update `eslint.config.mjs` to add a TypeScript-aware configuration block for `.ts` and `.svelte.ts` files alongside the existing `.mjs` block; keep the `.mjs` block unchanged
- Add an `svelte-check` invocation to the `"lint"` script in `package.json` (run after `eslint`): `eslint src/ && svelte-check --tsconfig ./tsconfig.json`
- Add a `"typecheck"` script alias in `package.json` for standalone type-checking: `svelte-check --tsconfig ./tsconfig.json`
- Confirm `npm run build` and `npm run lint` both pass with zero errors after the toolchain changes and no source file modifications

**Out of scope**
- Migrating any `.mjs`, `.svelte.js`, or `.svelte` source file to TypeScript (covered by Epics 62–67)
- Migrating test files or the test runner (covered by Epic 68)
- Enabling stricter `tsconfig` flags beyond standard `strict: true` (can be tightened after migration is complete)
- Adding path aliases (`@/`) or monorepo configuration

**Stories**
1. **Add TypeScript, `@types/node`, `typescript-eslint`, and `svelte-check` as dev dependencies**
2. **Create `tsconfig.json` with strict mode and Vite-compatible settings**
3. **Update `eslint.config.mjs` with a TypeScript-aware lint block for `.ts` and `.svelte.ts` files**
4. **Add `svelte-check` to the `"lint"` script and add a standalone `"typecheck"` script in `package.json`**
5. **Verify that `npm run build`, `npm run dev`, and `npm run lint` all pass after toolchain changes with no source file modifications**

**Acceptance Criteria**
- Story 1: `package.json` `devDependencies` contains `typescript`, `@types/node`, `typescript-eslint`, and `svelte-check`; `npm install` completes without conflicts.
- Story 2: `tsconfig.json` exists at the project root; it sets `"strict": true`, `"target": "ESNext"`, `"moduleResolution": "bundler"`, `"isolatedModules": true`, and includes `"src/**/*"`; running `npx tsc --noEmit` against the current (all-JS) source exits without error.
- Story 3: `eslint.config.mjs` contains a separate config block matching `['src/**/*.ts', 'src/**/*.svelte']` that uses `typescript-eslint` parser and recommended rules; the existing `.mjs` block is unchanged; `npm run lint` exits 0.
- Story 4: The `"lint"` script in `package.json` reads `"eslint src/ && svelte-check --tsconfig ./tsconfig.json"`; a `"typecheck"` script exists; running `npm run lint` completes without errors.
- Story 5: `npm run build` produces a valid `dist/` bundle; `npm run lint` exits with code 0; no existing functionality is broken; a brief note is left in this epic confirming all three commands pass.
