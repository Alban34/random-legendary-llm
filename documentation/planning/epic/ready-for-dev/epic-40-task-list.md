# Epic 40 — PWA Installability: Task List

## Story 40.1 — Author the Web App Manifest and supply all required app icon assets

- [ ] Create `public/manifest.webmanifest` with the following fields:
  - `name`: `"Legendary: Marvel Randomizer"`
  - `short_name`: `"Legendary"`
  - `start_url`: `"/random-legendary-llm/"` (matches the Vite `base` for production builds)
  - `display`: `"standalone"`
  - `theme_color`: `"#f05a28"` (matches `--color-primary` from `app-shell.css`)
  - `background_color`: `"#1b1f29"` (matches dark-theme `--color-surface` from `app-shell.css`)
  - `icons` array with at minimum:
    - `{ "src": "/random-legendary-llm/icons/icon-192.png", "sizes": "192x192", "type": "image/png" }`
    - `{ "src": "/random-legendary-llm/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }`
    - `{ "src": "/random-legendary-llm/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }`
- [ ] Create PNG icon asset files at:
  - `public/icons/icon-192.png` (192×192 px)
  - `public/icons/icon-512.png` (512×512 px)
  - `public/icons/icon-512-maskable.png` (512×512 px, safe-zone design for maskable use)
- [ ] Add `<link rel="manifest" href="/manifest.webmanifest" />` to the `<head>` of `index.html` (Vite rewrites absolute paths to include the base, so this resolves to `/random-legendary-llm/manifest.webmanifest` in production)
- [ ] Add `<meta name="theme-color" content="#f05a28" />` to `<head>` of `index.html`, matching the manifest `theme_color`
- [ ] Add iOS Safari PWA meta tags to `<head>` of `index.html`:
  - `<meta name="apple-mobile-web-app-capable" content="yes" />`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
  - `<meta name="apple-mobile-web-app-title" content="Legendary" />`
  - `<link rel="apple-touch-icon" href="/icons/icon-192.png" />` (Vite will rebase this to `/random-legendary-llm/icons/icon-192.png`)
- [ ] Test: Open Chrome DevTools → Application → Manifest and verify all required fields (`name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color`, `icons`) are populated and that each icon URL returns HTTP 200 with a valid PNG
- [ ] Test: On iOS Safari, tap Share → Add to Home Screen and confirm the app appears with the correct icon and title, and opens in standalone mode (no browser chrome)
- [ ] QC (Automated): `npm run lint` (must pass before further checks), then `playwright test ./test/playwright/epic40-qc.spec.mjs` — the spec file (created in Story 40.3) must assert: (a) `<link rel="manifest">` is present in the DOM, (b) fetching the manifest URL returns valid JSON with all required fields, (c) each icon `src` URL responds HTTP 200

---

## Story 40.2 — Implement a cache-first Service Worker that enables offline operation after first load

- [ ] Create `public/sw.js` as a template Service Worker with:
  - `const CACHE_NAME = '%%SW_CACHE_VERSION%%';` — a build-time placeholder string that will be replaced with a hash by the Vite plugin (Story 40.3)
  - `const PRECACHE_URLS = %%SW_PRECACHE_URLS%%;` — a build-time placeholder array that will be replaced with all emitted asset paths
  - An `install` event handler that opens `CACHE_NAME` and calls `cache.addAll(PRECACHE_URLS)`, then calls `self.skipWaiting()`
  - An `activate` event handler that deletes every cache whose key is not `CACHE_NAME`, then calls `clients.claim()`
  - A `fetch` event handler implementing cache-first: respond from `caches.match(event.request)` if found, otherwise `fetch(event.request)` and store the response clone in the cache before returning it; skip non-GET requests and cross-origin requests
- [ ] Add Service Worker registration to `src/app/browser-entry.mjs`, after the `mount()` call:
  ```js
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js');
  }
  ```
  This uses `import.meta.env.BASE_URL` so the path resolves to `/random-legendary-llm/sw.js` in production and `/sw.js` in dev preview
- [ ] Confirm the Service Worker `scope` defaults to the directory of the SW file (`/random-legendary-llm/`), which covers all app routes — no explicit `scope` option is required in the `register()` call
- [ ] Test: Run `npm run build && npm run preview`, visit the app in Chrome, confirm DevTools → Application → Service Workers shows the SW registered and active
- [ ] Test: After confirming the SW is active, open DevTools → Network, set throttling to "Offline", reload the page, and verify the full app UI renders from cache (no network error)
- [ ] Test: Build a second time (so `CACHE_NAME` changes due to a new hash), hard-reload, and verify DevTools → Application → Cache Storage shows only the new cache name; the old cache has been deleted
- [ ] QC (Automated): `npm run lint` first; then `playwright test ./test/playwright/epic40-qc.spec.mjs` — the spec must include a test that calls `context.setOffline(true)` after first page load, reloads, and asserts the app shell renders (e.g., the `#app` element contains rendered content)

---

## Story 40.3 — Integrate the manifest and Service Worker into the Vite build pipeline for GitHub Pages delivery

- [ ] Add a custom inline Vite plugin to `vite.config.js` (no new npm packages) that implements a `closeBundle` hook executed only when `command === 'build'`; the hook must:
  1. Collect all asset file paths emitted to `dist/` (using `fs.readdirSync` recursively or the Rollup bundle object)
  2. Prefix each path with `/random-legendary-llm/` to form absolute root-relative URLs matching the GitHub Pages base
  3. Generate a `CACHE_NAME` string as `'legendary-v' + hash`, where `hash` is a short deterministic hash (e.g., first 8 chars of a SHA-256 over the sorted asset path list) — import `node:crypto` for this
  4. Read `dist/sw.js`, replace `'%%SW_CACHE_VERSION%%'` with the computed cache name string, replace `%%SW_PRECACHE_URLS%%` with a `JSON.stringify`-ed array of the collected asset URLs, and write the result back to `dist/sw.js`
- [ ] Verify that `public/manifest.webmanifest` and `public/icons/` are copied to `dist/` by Vite's built-in static asset handling (no additional plugin configuration required — Vite copies `public/` contents to `dist/` by default)
- [ ] Confirm that the `<link rel="manifest">` href in `index.html` is correctly rewritten by Vite to `/random-legendary-llm/manifest.webmanifest` in `dist/index.html` after `npm run build`
- [ ] Add a `"test:qc:epic40"` script to `package.json`:
  ```json
  "test:qc:epic40": "playwright test ./test/playwright/epic40-qc.spec.mjs"
  ```
- [ ] Create `test/playwright/epic40-qc.spec.mjs` containing the following automated checks (use the existing `gotoApp` helper from `./helpers/app-fixture.mjs`):
  - **Manifest link present**: assert `page.locator('link[rel="manifest"]')` exists and its `href` attribute ends with `manifest.webmanifest`
  - **Manifest JSON fields**: fetch the manifest URL via `page.request.get(manifestHref)` and assert the response contains `name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color`, and `icons` with at least two entries
  - **Icon assets reachable**: for each icon `src` in the manifest, assert `page.request.get(iconSrc)` returns status 200 and content-type `image/png`
  - **SW registered**: after `gotoApp`, assert `await page.evaluate(() => navigator.serviceWorker.controller !== null || navigator.serviceWorker.ready.then(() => true))` resolves without error
  - **Offline load**: after first `gotoApp`, call `context.setOffline(true)`, reload, and assert `page.locator('#app')` is visible and non-empty
- [ ] Test: Run `npm run build` and inspect `dist/` manually to confirm: `dist/manifest.webmanifest` exists with correct JSON, `dist/sw.js` has no `%%` placeholder strings remaining, `dist/icons/icon-192.png` and `dist/icons/icon-512.png` exist
- [ ] Test: Run `npm run preview` (serves `dist/` locally) and execute a Lighthouse PWA audit in Chrome DevTools; confirm the "Installable" section shows no failures and the `beforeinstallprompt` event fires (visible in DevTools → Application → Manifest → "Add to Home Screen" eligibility)
- [ ] QC (Automated): `npm run lint` (blocking); `playwright test ./test/playwright/epic40-qc.spec.mjs`
