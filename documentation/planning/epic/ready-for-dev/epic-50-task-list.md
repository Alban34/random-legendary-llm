# Epic 50 — PWA Installability Repair: Task List

## Story 50.1 — Audit the deployed site and local build output to diagnose why the PWA install prompt is absent

- [ ] Open `index.html` at the repo root and record the exact `href` value of the `<link rel="manifest">` tag on line 74 — confirm it reads `/manifest.webmanifest` (absolute root-relative path, not base-path-aware)
- [ ] Run `npm run build` and inspect `dist/index.html` — confirm whether Vite rewrites the manifest `href` to include `/random-legendary-llm/` or leaves it as `/manifest.webmanifest`
- [ ] Run `npm run build` and confirm `dist/manifest.webmanifest` exists (copied from `public/manifest.webmanifest` by Vite)
- [ ] Run `npm run build` and confirm `dist/sw.js` exists and that the `%%SW_CACHE_VERSION%%` and `/*%%SW_PRECACHE_URLS%%*/[]` placeholders have been replaced by the `swInjectPlugin` in `vite.config.js`
- [ ] Confirm that `dist/sw.js` precache URL list includes `/random-legendary-llm/manifest.webmanifest` — if the manifest is not in the precache list, offline loads will not serve it
- [ ] Verify `src/app/browser-entry.mjs` registers the service worker via `import.meta.env.BASE_URL + 'sw.js'` and confirm that at build time `BASE_URL` resolves to `/random-legendary-llm/`, making the registration path `/random-legendary-llm/sw.js`
- [ ] Fetch `https://<owner>.github.io/random-legendary-llm/` in a browser, open DevTools → Network, and check whether a request for `/manifest.webmanifest` returns 404 (root-relative) vs. `/random-legendary-llm/manifest.webmanifest` returning 200
- [ ] Open DevTools → Application → Service Workers on the deployed site and record whether a service worker is registered and what scope it is registered under
- [ ] Open DevTools → Application → Manifest on the deployed site and record whether the manifest is parsed successfully or shows a fetch/parse error
- [ ] Run a Lighthouse PWA audit against the deployed site (DevTools → Lighthouse → Progressive Web App) and record each failing "Installable" check with its exact error message
- [ ] Append a diagnosis note to `documentation/planning/epic/approved/epic-50.md` listing each root cause found with supporting evidence (network 404 URL, Lighthouse error text, or build diff)
- [ ] Test: Manually open `dist/index.html` source after a local build and confirm whether `<link rel="manifest" href="...">` resolves to a URL reachable under `/random-legendary-llm/`
- [ ] QC (Automated): Run `grep -n 'rel="manifest"' dist/index.html` after `npm run build` and assert the `href` attribute includes `/random-legendary-llm/` prefix; run `ls dist/manifest.webmanifest dist/sw.js` and assert both files exist with non-zero size

---

## Story 50.2 — Fix the broken PWA wiring in the build config, index.html, and/or service worker registration

- [ ] In `index.html` line 74, change `href="/manifest.webmanifest"` to `href="%BASE_URL%manifest.webmanifest"` so Vite substitutes the correct base path (`/random-legendary-llm/`) at build time and `/` during dev
- [ ] Run `npm run build` and verify `dist/index.html` now contains `href="/random-legendary-llm/manifest.webmanifest"` (not the bare `/manifest.webmanifest`)
- [ ] Confirm `dist/sw.js` precache URL array includes `/random-legendary-llm/manifest.webmanifest` after the build (the `collectFiles` walk in `swInjectPlugin` covers `dist/manifest.webmanifest`, which maps to `/random-legendary-llm/manifest.webmanifest`)
- [ ] Confirm no changes are needed to `src/app/browser-entry.mjs` — `import.meta.env.BASE_URL + 'sw.js'` already resolves to `/random-legendary-llm/sw.js` at build time
- [ ] Confirm no changes are needed to `vite.config.js` — `base: '/random-legendary-llm/'` and the `swInjectPlugin` `closeBundle` logic are already correct
- [ ] Run `npm run lint` and confirm it exits with code 0 and reports no new errors
- [ ] Test: Serve `dist/` locally with `npx serve -s dist -l 5000` (or equivalent), open `http://localhost:5000/random-legendary-llm/` in a browser, open DevTools → Application → Manifest and confirm the manifest is fetched successfully with no errors; open Application → Service Workers and confirm the worker is registered with scope `/random-legendary-llm/`
- [ ] QC (Automated): After `npm run build`, run `grep 'rel="manifest"' dist/index.html` and assert the output contains `href="/random-legendary-llm/manifest.webmanifest"`; run `node -e "const s=require('fs').readFileSync('dist/sw.js','utf8'); if(!s.includes('/random-legendary-llm/manifest.webmanifest')) process.exit(1);"` to assert the manifest URL is in the precache list

---

## Story 50.3 — Validate the repair with a Lighthouse PWA audit confirming installability criteria pass

- [ ] Run `npm run build` to produce a fresh `dist/` with the repaired manifest link
- [ ] Serve the `dist/` directory locally at a path that mirrors the GitHub Pages base: `npx serve dist -l 5000` then navigate to `http://localhost:5000/` (or use `npx http-server dist -p 5000`) — note that Lighthouse can audit `localhost`
- [ ] Open Chrome DevTools on the served app, go to Lighthouse → Progressive Web App, run the audit, and confirm the "Installable" section shows all criteria passing with no blocking errors
- [ ] Record the Lighthouse PWA score and the specific "Installable" checklist result (pass/fail per item) and append the findings to `documentation/planning/epic/approved/epic-50.md` under a "Validation" heading
- [ ] Confirm in DevTools → Application → Manifest that `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`, and both icon entries (192×192 and 512×512) are all parsed and shown without errors
- [ ] Confirm in DevTools → Application → Service Workers that the worker is active and the scope matches `/random-legendary-llm/` (or `http://localhost:5000/` for the local serve test)
- [ ] Disable network throttling and reload with the network panel open; confirm a `beforeinstallprompt` event fires (visible in the Console with `window.addEventListener('beforeinstallprompt', e => console.log('installable', e))`) or that the browser address bar shows an install icon
- [ ] Test: On Chrome with network connectivity, navigate to the deployed GitHub Pages URL, open DevTools Console, add `window.addEventListener('beforeinstallprompt', e => console.log('PWA install prompt fired'))`, reload, and confirm the message appears; alternatively confirm the install button appears in the Chrome omnibar
- [ ] QC (Automated): Run `npm run lint` and confirm exit code 0; run `npm run build` and assert `dist/index.html` contains `href="/random-legendary-llm/manifest.webmanifest"` and `dist/sw.js` is non-empty and contains `legendary-v` in its cache name string
