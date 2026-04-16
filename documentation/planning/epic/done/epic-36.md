## Epic 36 — Version Source and Storage Disclosure

**Status: Approved**

**Objective**
Ensure the displayed application version is always derived from a single authoritative source (`package.json`) so version bumps never require manual code edits, add an accurate browser-storage disclosure so users understand what data the app persists locally and why, and surface a GitHub repository link in the header for transparency, and ensure the Vite development server works correctly when serving locally without breaking the GitHub Pages production deployment.

**In scope**
- injecting the `package.json` version as a Vite build-time constant and consuming it in `App.svelte`
- adding a concise, accurate disclosure stating that the app uses browser `localStorage` (not cookies), what categories of data are stored (collection state, game history, preferences), and that the data is local to the device and browser
- adding a GitHub icon link in the header area (near the version badge) pointing to the project repository, opening in a new tab
- ensuring the Vite `base` path is `/random-legendary-llm/` only for production builds, and `/` for the local dev server, so both environments work without configuration changes
- reducing the vertical footprint of the desktop header preference controls by removing redundant label/caption copy and relying solely on aria-label for accessibility
- moving the GitHub icon link into `header-icon-strip` inside the `header-right` column, visible on all viewports

**Stories**
1. **Inject the `package.json` version into the Vite build and replace the hardcoded constant in `App.svelte`** *(done)*
2. **Add a localStorage disclosure note to the appropriate UI surface explaining what data is stored and its local scope** *(done)*
3. **Add a GitHub repository icon link in the header near the version badge** *(done)*
4. **Fix the Vite base path so the local dev server works without 404 errors while keeping GitHub Pages production builds intact** *(done)*
5. **Remove the verbose label/caption blocks from the desktop locale and theme controls, keeping only the functional controls with proper aria-label**
6. **Relocate the GitHub repository icon into `header-icon-strip` inside `header-right` so it is prominently visible on all viewports**

**Acceptance Criteria**
- Story 1: `vite.config.js` reads `version` from `package.json` and exposes it via `define` as `__APP_VERSION__`; the hardcoded `APP_VERSION = '1.0.1'` constant is removed from `App.svelte` and replaced with the injected value; incrementing the version in `package.json` alone causes the updated string to appear in the running UI without any further code changes.
- Story 2: A visible disclosure is present in the UI (Backup tab, About section, or equivalent surface) stating clearly that the app uses browser `localStorage` — not cookies — to persist data; the notice names the categories of stored data (collection ownership, game history, user preferences); the notice confirms the data remains on the user's device and browser and is never transmitted; the word "cookie" or "cookies" does not appear in the disclosure.
- Story 3: A GitHub SVG icon link is rendered in the header area near the version badge, pointing to `https://github.com/Alban34/random-legendary-llm`; the link carries an accessible label (e.g. `aria-label="View source on GitHub"`); the link opens in a new tab via `target="_blank"` with `rel="noopener noreferrer"`; the icon is visually consistent with the header's existing style and does not dominate the layout.
- Story 4: Running `npm run dev` serves the app correctly at `http://127.0.0.1:5173/` with no 404 errors in the browser console; running `npm run build` still produces a dist bundle with all asset paths prefixed by `/random-legendary-llm/` so GitHub Pages hosting is unaffected; no environment variables, .env files, or manual toggles are needed to switch between the two modes.
- Story 5: On desktop viewports, the locale and theme preference controls in the header show no visible label text or caption text — only the select dropdown and theme toggle buttons are visible; all accessibility labels are preserved via aria-label and title attributes; the controls retain their full functionality.
- Story 6: The GitHub icon link appears inside `header-icon-strip` within `header-right`, alongside the locale and theme controls; it is visible on both desktop and mobile viewports; it is keyboard-focusable (no tabindex="-1"); the version badge (`app-version` span) is rendered inside `header-right`, below the icon strip, not inside `header-copy`.

---
