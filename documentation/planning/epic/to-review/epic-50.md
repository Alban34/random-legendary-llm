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
