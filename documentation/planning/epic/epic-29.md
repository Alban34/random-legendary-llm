## Epic 29 — Svelte 5 Build Tooling and Project Foundation

**Status: Approved**

**Objective**
Replace the esbuild-based build pipeline with Vite and `@sveltejs/vite-plugin-svelte` so the project can compile Svelte 5 components while retaining zero runtime dependencies and a working dev server.

**In scope**
- replace `tools/build.mjs` and `tools/dev-server.mjs` with Vite equivalents
- install `vite`, `svelte`, and `@sveltejs/vite-plugin-svelte` as dev dependencies only
- configure Svelte 5 runes mode in `svelte.config.js`
- establish the `/src` component directory structure for `.svelte` files
- preserve the static SPA output (`index.html` + bundled JS/CSS)
- verify the app boots to a working shell after the tooling switch

**Stories**
1. **Replace esbuild with Vite and configure `@sveltejs/vite-plugin-svelte`**
2. **Add Svelte 5 as a dev dependency and enable runes mode globally**
3. **Establish the component directory structure for `.svelte` files under `src/`**
4. **Migrate the custom dev server to Vite's built-in dev mode**
5. **Confirm the static build output remains a self-contained SPA with zero runtime dependencies**
6. **Verify the existing ESLint and Playwright configurations still resolve after the tooling switch**

**Acceptance Criteria**
- Story 1: `npm run build` succeeds using Vite; the output directory contains an `index.html` and bundled assets equivalent to the previous esbuild output.
- Story 2: `svelte` and `@sveltejs/vite-plugin-svelte` appear only in `devDependencies`; `svelte.config.js` enables runes mode; no Svelte runtime chunk appears in the production bundle.
- Story 3: A documented directory convention exists for `.svelte` files under `src/`; at least one placeholder component file confirms the compiler resolves it.
- Story 4: `npm run dev` launches the Vite dev server; the app is reachable in a browser without the old custom dev server.
- Story 5: Inspecting the production bundle shows no Svelte runtime library — only compiled vanilla JS; bundle size does not exceed a documented baseline.
- Story 6: `npm run lint` and `npx playwright test` both exit without configuration errors related to the tooling change.

---
