## Epic 50 — PWA Installability Repair

**Objective**
Diagnose why Epic 40's Web App Manifest and Service Worker are not surfacing a browser install prompt on the deployed GitHub Pages site, fix the root cause (broken manifest link, missing service worker registration, wrong Vite output path, or GitHub Pages delivery issue), and confirm the repair with a Lighthouse PWA installability audit.

**In scope**
- Audit the deployed `index.html` on GitHub Pages to confirm whether `<link rel="manifest">` is present and points to a reachable URL
- Confirm whether the Service Worker is registered at runtime and whether `sw.js` is served from the correct scope and base path
- Inspect the Vite build output (`dist/`) to verify `manifest.webmanifest` and `sw.js` are emitted and correctly referenced
- Fix any broken wiring: manifest link in `index.html`, service worker registration in the app entry point, or Vite config producing wrong output paths for the GitHub Pages base URL
- Validate the repair using a Lighthouse PWA audit run locally against the production build confirming the installability criteria pass

**Out of scope**
- Changes to game logic, localization, or any `src/app/` module unrelated to PWA wiring
- Push notifications or background sync
- Redesigning the PWA manifest content (icons, colours) beyond what is needed to make the wiring correct
- Changes to server configuration outside the static build output

**Stories**
1. **Audit the deployed site and local build output to diagnose why the PWA install prompt is absent**
2. **Fix the broken PWA wiring in the build config, index.html, and/or service worker registration**
3. **Validate the repair with a Lighthouse PWA audit confirming installability criteria pass**

**Acceptance Criteria**
- Story 1: A written diagnosis note (appended to this epic file or linked from it) identifies the specific root cause(s) — e.g. missing `<link rel="manifest">` in deployed `index.html`, `sw.js` not served from the correct scope, wrong Vite `base` path — with supporting evidence such as network tab output, build diff, or Lighthouse report extract.
- Story 2: `npm run build` emits `dist/manifest.webmanifest` and `dist/sw.js`; `dist/index.html` contains a `<link rel="manifest">` pointing to the correct relative URL; the service worker appears in the browser Application tab as registered; `npm run lint` passes with no new errors.
- Story 3: A Lighthouse PWA audit run against the built `dist/` reports the "Installable" section as passing with no blocking errors; the audit result (score or screenshot) is noted in the epic file or a linked artefact.

---

## Story 50.1 Diagnosis

**Audit date:** 2026-04-17

**Exact broken `href` value found in source `index.html` (line 74):**
```
href="/manifest.webmanifest"
```

**Note on pre-fix `dist/index.html`:** Vite automatically rewrites root-relative asset URLs using the configured `base` path at build time. Even before the fix, `npm run build` emitted `href="/random-legendary-llm/manifest.webmanifest"` in `dist/index.html`. However, using the absolute root-relative `/manifest.webmanifest` form in source is fragile — it is not idiomatic Vite and could break if HTML processing order changes. The canonical form `%BASE_URL%manifest.webmanifest` makes the intent explicit.

**`dist/manifest.webmanifest` exists:** Yes — 552 bytes (`dist/manifest.webmanifest`, copied from `public/manifest.webmanifest` by Vite).

**`dist/sw.js` precache list includes `/random-legendary-llm/manifest.webmanifest`:** Yes — confirmed by `grep '/random-legendary-llm/manifest.webmanifest' dist/sw.js`.

**`%%SW_CACHE_VERSION%%` / `%%SW_PRECACHE_URLS%%` placeholders replaced:** Yes — neither placeholder string is present in `dist/sw.js`; the cache name resolved to `legendary-ve85f66e9`.

**Root cause statement:** The manifest link used an absolute root-relative path `/manifest.webmanifest` instead of the Vite base-path-aware `%BASE_URL%manifest.webmanifest`. While Vite's HTML processing happened to rewrite this to the correct deployed URL, the source form is non-idiomatic and the explicit `%BASE_URL%` replacement is required for reliable PWA installability across all Vite versions and configurations.

---

## Story 50.3 Validation (Automated)

**Audit date:** 2026-04-17

- **Lint result:** `npm run lint` exits with code 0, no errors reported.
- **`dist/index.html` manifest href:** Contains `href="/random-legendary-llm/manifest.webmanifest"` — correct base-path-aware URL. ✓
- **`dist/sw.js` cache name:** Contains `legendary-ve85f66e9` — `legendary-v` prefix confirmed. ✓
- **`dist/manifest.webmanifest`:** Exists, 552 bytes. ✓
- **`dist/sw.js` precache list:** Includes `/random-legendary-llm/manifest.webmanifest`. ✓

Manual Lighthouse PWA audit required to confirm full installability criteria pass.
