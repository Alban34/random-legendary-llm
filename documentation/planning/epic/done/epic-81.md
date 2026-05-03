## Epic 81 — Eliminate All .js Source Files

**Objective**
The project is migrating fully to TypeScript. Several `.js` files remain in toolchain configs and other areas. This epic removes or converts every `.js` file so that no JavaScript sources remain in the project, and adds a guardrail to prevent regression.

**In Scope**
- Story 81.1: Audit all `.js` files in the repository (under `src/`, project root, `tools/`, `public/`) and produce a complete inventory with the conversion or removal action for each.
- Story 81.2: Convert toolchain config files at the project root (`vite.config.js`, `vitest.config.js`, `svelte.config.js`, `eslint.config.js`) to their TypeScript equivalents.
- Story 81.3: Convert or replace any remaining `.js` files under `src/`, `tools/`, or `public/` (e.g. service worker, build tools).
- Story 81.4: Add a lint rule or CI check that fails when any `.js` file is introduced under `src/` or the project root, preventing silent regression.

**Acceptance Criteria**
- Story 81.1: A written inventory (comment or planning note) lists every `.js` file found and the action taken for each before any conversion begins.
- Story 81.2: All toolchain config files are `.ts` (or use a format with no `.js` extension); `npm run build`, `npm test`, and `npm run lint` continue to pass.
- Story 81.3: No `.js` files remain under `src/`, `tools/`, or `public/` (other than compiled build output); the app builds and all tests pass.
- Story 81.4: A configured check causes the pipeline to fail if a new `.js` source file is introduced; `npm run lint` demonstrates the guardrail in action.
