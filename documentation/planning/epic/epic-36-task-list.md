## Epic 36 — Version Source and Storage Disclosure

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 36 work complete

### Story 36.1 — Version from package.json
- [x] Import `package.json` in `vite.config.js` using `createRequire` or a JSON import and add `define: { __APP_VERSION__: JSON.stringify(pkg.version) }` to the Vite config
- [x] Remove the hardcoded `const APP_VERSION = '1.0.1'` from `src/components/App.svelte`
- [x] Replace all usages of `APP_VERSION` in `App.svelte` with the injected global `__APP_VERSION__`
- [x] Add a `/* global __APP_VERSION__ */` comment in `App.svelte` so linters understand the injected global
- [x] Verify the version string displayed in the UI matches the value in `package.json` without any other code changes
- [x] **Test:** verify the version rendered in the UI equals `npm pkg get version` (the value from package.json) and that no hardcoded version string remains in the source
- [x] **QC (Automated):** automate QC coverage asserting the UI version string matches the package.json version after a build

### Story 36.2 — localStorage disclosure
- [x] Decide on the appropriate placement for the disclosure (Backup tab "Danger zone" area, Collection tab storage section, or a dedicated footer note)
- [x] Add a localizable disclosure string to EN_MESSAGES in `src/app/localization-utils.mjs` (keys `storage.disclosureTitle` and `storage.disclosureBody`)
- [x] Add the French translation for the same keys to FR_MESSAGES
- [x] Render the disclosure text in the chosen UI surface
- [x] Ensure the disclosure accurately states: localStorage is used (not cookies); what is stored (collection ownership, game history, user preferences); data stays on the device and is never transmitted
- [x] Ensure the word "cookie" or "cookies" does not appear in the disclosure copy
- [x] **Test:** verify the disclosure text is visible in the UI, contains accurate descriptions of localStorage usage, and does not mention cookies
- [x] **QC (Automated):** automate QC coverage asserting the localStorage disclosure is visible in English and French without mentioning cookies

### Story 36.3 — GitHub repository link in the header
- [x] Choose the exact slot in the header template (next to the `<span class="app-version">` element) for the icon link
- [x] Add an inline GitHub SVG icon (the standard GitHub mark — a simple 24×24 or 16×16 Octicon-style silhouette) as a Svelte component or inline SVG in `App.svelte`
- [x] Render an `<a>` element wrapping the icon with `href="https://github.com/Alban34/random-legendary-llm"`, `target="_blank"`, `rel="noopener noreferrer"`, and `aria-label="View source on GitHub"`
- [x] Style the icon link so it blends with the header (same muted color as the version badge, hover state consistent with other header interactive elements)
- [x] Verify the link appears in both the loaded and loading-shell header variants where an app-version badge is rendered
- [x] **Test:** verify the anchor element exists in the header, has the correct href, and carries the required accessibility label
- [x] **QC (Automated):** automate QC coverage asserting the GitHub link is present and has the correct href and rel attributes

### Story 36.4 — Fix Vite base path for local dev vs. GitHub Pages
- [x] Change the `defineConfig(...)` call in `vite.config.js` to use the callback form `defineConfig(({ command }) => ({ ... }))` so the `command` argument is available
- [x] Set `base` conditionally: `command === 'build' ? '/random-legendary-llm/' : '/'`
- [x] Verify `npm run dev` serves the app at the root path with no console 404 errors
- [x] Verify `npm run build` still prefixes asset paths with `/random-legendary-llm/` in the output
- [x] **Test:** confirm no import or asset path regression exists in the built output (check `dist/index.html` references)
- [x] **QC (Automated):** add a QC assertion confirming the built `dist/index.html` contains `/random-legendary-llm/` prefixed asset references

### Story 36.5 — Compact desktop preference controls
- [x] Remove the `.theme-switcher-copy` wrapper div (containing `.theme-switcher-label` and `.theme-switcher-caption` spans) from the desktop locale section in `App.svelte` (`#header-locale-controls`)
- [x] Remove the `.theme-switcher-copy` wrapper div from the desktop theme section in `App.svelte` (`#header-theme-controls`)
- [x] Verify the `<section>` for each control already has an `aria-label` and that the `<select>` has `aria-label` — add any missing ones
- [x] Do not touch the mobile preferences panel (toggle button + expandable panel) — it is already compact
- [x] **Test:** verify `.theme-switcher-copy` no longer appears in the desktop preference control HTML
- [x] **QC (Automated):** automate QC coverage asserting no `.theme-switcher-label` text is rendered in the preference controls on desktop

### Story 36.6 — GitHub icon in far-right header controls
- [x] Remove the `<a class="github-link">` element from `.header-copy` in both the loaded header variant and the loading-shell header variant of `App.svelte`
- [x] Remove the `<a class="github-link">` from the loading-shell header (`{:else}` branch) in `App.svelte`
- [x] Add `<a class="github-link">` inside `<div class="header-icon-strip">` within `<div class="header-right">` in the loaded-state header — alongside the locale and theme controls
- [x] Remove `tabindex="-1"` from the new anchor so it is keyboard-focusable
- [x] Remove the `.github-link { display: none; }` rule from the `@media (max-width: 900px)` block in `src/app/app-shell.css` so the icon is visible on mobile too
- [x] Update the `.github-link` CSS positioning: remove `position: absolute`, `right`, `top`, `transform` — instead use the flex layout of `header-icon-strip`; size the icon to 20×20 or 24×24 for better visibility
- [x] Update the unit test in `test/epic36-version-storage-disclosure.test.mjs` that checks github-link appears immediately after `.app-version` span — change it to assert the github-link appears inside `.header-icon-strip` inside `.header-right` instead
- [x] Update `.header-copy` CSS to remove `position: relative` if that was added solely for the github-link anchor (check `src/app/app-shell.css`)
- [x] **Test:** verify the github-link anchor appears inside `header-icon-strip` inside `header-right`, not inside `header-copy` or `header-controls`
- [x] **QC (Automated):** automate QC coverage asserting the github-link is inside `header-icon-strip` within `header-right`

---
