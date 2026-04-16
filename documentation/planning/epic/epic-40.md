## Epic 40 — PWA Installability

**Status: In Review**

**Objective**
Make the app installable directly from the browser on Chrome, Edge, and Safari on iOS by adding a Web App Manifest and a Service Worker, so users can add it to their home screen or app drawer and use it offline after the first load — without any server-side changes or new runtime dependencies.

**In scope**
- a `manifest.webmanifest` file declaring app identity, display mode, theme colours, and icon references
- app icon assets at the sizes required by the install prompt (at minimum 192×192 and 512×512 PNG)
- a Service Worker that precaches all static build assets using a cache-first strategy and invalidates the cache on new deployments
- wiring the manifest link and Service Worker registration into the existing Vite build pipeline so both files are emitted to `dist/` and served correctly from GitHub Pages
- validation that the browser install prompt (`beforeinstallprompt` on Chromium; Add to Home Screen on Safari) is presented to users

**Out of scope**
- push notifications or background sync
- server-side caching headers or CDN configuration
- changes to game logic, localization, or any `src/app/` module

**Stories**
1. **Author the Web App Manifest and supply all required app icon assets**
2. **Implement a cache-first Service Worker that enables offline operation after first load**
3. **Integrate the manifest and Service Worker into the Vite build pipeline for GitHub Pages delivery**

**Acceptance Criteria**
- Story 1: A valid `manifest.webmanifest` is present in the repository and linked from `index.html`; it declares `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`, and icon entries for at least 192×192 and 512×512; icon asset files exist at the referenced paths.
- Story 2: A Service Worker is registered from the app entry point; on a repeat visit with the network disabled, the full app UI renders from cache; when a new build is deployed the old cache is superseded so users receive the updated version on next load.
- Story 3: Running `npm run build` emits `dist/manifest.webmanifest` and the Service Worker file at the correct root-relative path; no changes to server configuration are required; a Lighthouse PWA audit against the production build reports the installability criteria as passing.

---
