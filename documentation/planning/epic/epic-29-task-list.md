## Epic 29 — Svelte 5 Build Tooling and Project Foundation

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 29 work complete

### Story 29.1 — Replace esbuild with Vite
- [x] Remove `tools/build.mjs` and install Vite + `@sveltejs/vite-plugin-svelte` as devDependencies
- [x] Create `vite.config.js` with the Svelte plugin and SPA output configuration
- [x] Update `package.json` `build` and `preview` scripts to use Vite
- [x] Verify `npm run build` produces an `index.html` and bundled assets in the output directory
- [x] **Test:** verify the Vite build output contains `index.html` and the bundled JS/CSS assets
- [x] **QC (Automated):** run `npm run build` in CI and assert exit code 0; check output directory structure

### Story 29.2 — Add Svelte 5 and configure runes mode
- [x] Add `svelte` and `@sveltejs/vite-plugin-svelte` to `devDependencies` only (not `dependencies`)
- [x] Create `svelte.config.js` with `compilerOptions: { runes: true }`
- [x] Confirm no Svelte runtime chunk appears in the production bundle output
- [x] **Test:** verify `svelte` is absent from `dependencies` in `package.json` and `svelte.config.js` enables runes mode
- [x] **QC (Automated):** inspect bundle output and assert no `svelte` runtime files are present

### Story 29.3 — Establish component directory structure
- [x] Create the `/src/components/` directory with a placeholder `App.svelte` component
- [x] Document the directory convention (component location, naming, import patterns) in a brief comment or README note
- [x] Verify the Svelte compiler resolves the placeholder component without errors
- [x] **Test:** verify the placeholder `.svelte` file can be compiled by the Vite build without errors
- [x] **QC (Automated):** run `npm run build` with the placeholder component included; assert zero Svelte compile errors

### Story 29.4 — Migrate custom dev server to Vite dev mode
- [x] Remove or archive `tools/dev-server.mjs`
- [x] Update the `dev` script in `package.json` to use `vite`
- [x] Verify `npm run dev` starts the Vite dev server and the app is reachable in a browser
- [x] **Test:** verify `package.json` `dev` script references Vite; `tools/dev-server.mjs` is removed or disabled
- [x] **QC (Automated):** run `npm run dev -- --port 3099` and assert the server starts without error (dry-run or timeout check acceptable)

### Story 29.5 — Confirm static build output has zero runtime dependencies
- [x] Run the Vite production build and inspect the bundle for Svelte runtime chunks
- [x] Document the pre-migration bundle size baseline in a comment or note
- [x] Assert the production bundle contains only compiled vanilla JS (no `svelte` library chunk)
- [x] **Test:** verify the production bundle artifacts contain no file matching `/svelte/` in their path or content
- [x] **QC (Automated):** add a build-output check that fails if a `svelte` runtime chunk is detected in the dist directory

### Story 29.6 — Verify ESLint and Playwright configurations resolve after tooling switch
- [x] Run `npm run lint` and confirm it exits without configuration errors
- [x] Run `npx playwright test` and confirm it exits without configuration errors related to the tooling change
- [x] Fix any import-resolution or path-alias issues introduced by the Vite migration
- [x] **Test:** verify `eslint.config.mjs` and `playwright.config.mjs` resolve correctly after Vite is configured
- [x] **QC (Automated):** run full `npm test` and `npx playwright test` and assert both exit cleanly at this epic boundary

---
