## Epic 31 — UI Shell and Navigation Migration to Svelte Components

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 31 work complete

### Story 31.1 — Create root `App.svelte` and mount via Vite entry
- [x] Create `src/components/App.svelte` as the root component rendering the full app shell
- [x] Update the Vite entry point (`src/browser-entry.mjs` or equivalent) to mount `App.svelte` instead of calling DOM-manipulation functions
- [x] Remove or archive the shell-rendering code from `app-renderer.mjs` once replaced
- [x] **Test:** verify the app mounts from `App.svelte`; the rendered HTML matches the pre-migration shell structure
- [x] **QC (Automated):** run a Playwright smoke test confirming the page loads and the main shell is present in the DOM

### Story 31.2 — Convert tab navigation to `TabNav.svelte`
- [x] Create `src/components/TabNav.svelte` with `$state` reactive active-tab tracking
- [x] Preserve active-tab persistence and keyboard navigation behavior exactly
- [x] Remove the tab-rendering code from `app-renderer.mjs` once replaced
- [x] **Test:** verify tab switching works correctly and active-tab state persists across reloads in the browser
- [x] **QC (Automated):** run existing Playwright tab-navigation tests and confirm zero failures

### Story 31.3 — Convert shared UI primitives to individual Svelte components
- [x] Create individual `.svelte` files for buttons, cards, badges, and any other shared primitives
- [x] Match the visual output of each to its DOM-manipulation predecessor without CSS changes
- [x] **Test:** verify each primitive component renders the same HTML structure as the function it replaces
- [x] **QC (Automated):** run visual regression or snapshot comparison on shared primitives in browser QC

### Story 31.4 — Convert toast notification system to `ToastStack.svelte`
- [x] Create `src/components/ToastStack.svelte`
- [x] Preserve auto-dismiss timing, manual dismissal, ARIA roles, and stacking behavior
- [x] **Test:** verify toasts appear, stack, auto-dismiss, and can be dismissed manually in both themes
- [x] **QC (Automated):** run existing Playwright toast tests and confirm zero failures

### Story 31.5 — Verify the app shell is visually and behaviorally identical post-migration
- [x] Run side-by-side visual comparison of pre- and post-migration shell
- [x] Run the full `npx playwright test` suite and confirm zero failures
- [x] Document any minor cosmetic differences that are acceptable and intentional
- [x] **Test:** verify zero style or layout regressions are present after the shell migration
- [x] **QC (Automated):** run `npm test` and `npx playwright test` and confirm all pass at this epic boundary

---
