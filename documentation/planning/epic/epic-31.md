## Epic 31 — UI Shell and Navigation Migration to Svelte Components

**Status: Approved**

**Objective**
Convert the application shell, tab navigation, and shared UI primitives from DOM-manipulation modules into Svelte 5 components so the component hierarchy mirrors the rendered page structure.

**In scope**
- convert `app-renderer.mjs` shell and mount logic to a root Svelte component
- convert tab navigation to a Svelte component backed by reactive active-tab state
- convert shared UI primitives (buttons, cards, badges, toasts) to Svelte components
- preserve all existing visual design tokens and CSS without modification
- ensure the app is visually and behaviorally identical to the pre-migration shell at this epic boundary

**Stories**
1. **Create a root `App.svelte` component and mount it via the Vite entry point**
2. **Convert tab navigation to a `TabNav.svelte` component with reactive active-tab state**
3. **Convert shared UI primitives (buttons, cards, badges) to individual Svelte component files**
4. **Convert the toast notification system to a `ToastStack.svelte` component**
5. **Verify the app shell is visually and behaviorally identical to the pre-migration version**

**Acceptance Criteria**
- Story 1: The app mounts from a single `App.svelte` root component; `app-renderer.mjs` is removed or reduced to the Vite entry bootstrap only; the page renders correctly in the browser.
- Story 2: Tab switching is driven by a reactive `$state` variable inside `TabNav.svelte`; active-tab persistence and keyboard navigation continue to work exactly as before.
- Story 3: Buttons, cards, and badges are individually importable `.svelte` files; each matches the visual output of its DOM-manipulation predecessor without CSS changes.
- Story 4: Toasts appear and dismiss correctly via `ToastStack.svelte`; auto-dismiss timing and ARIA attributes are preserved.
- Story 5: A side-by-side visual comparison confirms no layout, color, or typography regression; existing Playwright shell navigation tests pass unchanged.

---
