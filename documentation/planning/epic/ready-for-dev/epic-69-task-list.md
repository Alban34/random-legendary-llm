# Epic 69 — svelte-sonner Toast Migration

Replace the custom toast system with [svelte-sonner](https://svelte-sonner.vercel.app/) to gain stacked/spring-animated visuals, built-in timer management, and a polished default appearance.

---

## Phase 1 — Install

- [x] **T-1** Run `npm install svelte-sonner` and verify it resolves against the project's Svelte 5 version (peerDependencies check).

---

## Phase 2 — Production code (App.svelte)

- [x] **T-2** Replace `<ToastStack>` mount with `<Toaster>`
  - Remove the `<section id="toast-region">` block from `src/components/App.svelte` (~lines 1457–1469).
  - Add a single `<Toaster>` as a direct child of the component root with:
    - `position="bottom-center"`
    - `offset` set to clear the mobile bottom nav (equivalent to `calc(80px + env(safe-area-inset-bottom))`)
    - `expand={true}` for the stacked/overlapping visual
    - `richColors={true}` for variant-coloured toasts
    - `duration={4000}` to match the current transient timeout

- [x] **T-3** Replace all `enqueueToast()` call sites (~20) in `src/components/App.svelte` with direct `toast.*()` calls:
  - `enqueueToast({ variant: 'success', message })` → `toast.success(message)`
  - `enqueueToast({ variant: 'info', message })` → `toast.info(message)`
  - `enqueueToast({ variant: 'warning', message })` → `toast.warning(message)`
  - `enqueueToast({ variant: 'error', message })` → `toast.error(message)`
  - `enqueueToast({ variant: 'error', message, behavior: 'persistent' })` → `toast.error(message, { duration: Infinity })`
  - `enqueueToast({ variant: 'warning', message, behavior: 'persistent' })` → `toast.warning(message, { duration: Infinity })`
  - The two `persistent` calls are on lines ~841 and ~953.

- [x] **T-4** Remove the manual timer management block from `src/components/App.svelte`:
  - `toastTimers` Map declaration (~line 147)
  - `clearToastTimer()` function (~lines 299–303)
  - `scheduleToastDismissal()` (~lines 306–311)
  - `pauseToastDismissal()` (~lines 313–319)
  - `resumeToastDismissal()` (~lines 322–327)
  - `enqueueToast()` function (~lines 342–351)
  - `dismissToast()` function (~lines 330–341)
  - `pauseToastDismissal` / `resumeToastDismissal` entries in the UI actions object (~lines 548, 584–585)

- [x] **T-5** Remove `toasts` from the `ui` state object in `src/components/App.svelte`:
  - Remove `toasts: ToastRecord[]` from the state type (~line 124)
  - Remove `toasts: []` from the initial value (~line 135)
  - Remove the `__TOASTS__` debug assignment (~line 235)
  - Remove the `ToastStack` import (line 3)
  - Remove the `ToastRecord` and `feedback-utils.ts` imports (line 12)

---

## Phase 3 — Delete / prune source files

- [x] **T-6** Delete `src/components/ToastStack.svelte` (entire file becomes dead code).

- [x] **T-7** Delete `src/app/feedback-utils.ts` — all exports (`createToastRecord`, `pushToast`, `removeToast`, `shouldAutoDismissToast`, `TOAST_VARIANTS`, `TOAST_BEHAVIORS`) are unused after T-3/T-5. ⚠️ Update tests (T-13, T-14, T-15) before deleting.

- [x] **T-8** Remove toast CSS from `src/app/app-shell.css` (~lines 1228–1325):
  - `#toast-region` block
  - `@keyframes toast-enter`
  - `.toast-stack`
  - `.toast`
  - `.toast-persistent` and `.toast-persistent .toast-dismiss`
  - `.toast-success`, `.toast-info`, `.toast-warning`, `.toast-error`
  - `.toast-copy`, `.toast-title`, `.toast-meta`, `.toast-dismiss`
  - `.toast-dismiss:focus-visible` rule (~line 1056) — remove if it targets nothing else.
  - Sonner ships its own stylesheet; no replacement needed.

- [x] **T-9** Remove the 8 `toast.*` locale keys from all 6 locale files (`src/app/locales/en.ts`, `es.ts`, `fr.ts`, `de.ts`, `ko.ts`, `ja.ts`):
  - `toast.region`
  - `toast.persistent`
  - `toast.dismiss`
  - `toast.acknowledge`
  - `toast.variant.success`
  - `toast.variant.info`
  - `toast.variant.warning`
  - `toast.variant.error`

- [x] **T-10** Remove `getToastVariantLabel` from `src/app/localization-utils.ts`. Confirm no remaining callers exist before deleting.

- [x] **T-11** Remove `declare var __TOASTS__: unknown;` from `src/app/env.d.ts` (~line 19).

---

## Phase 4 — Theming

- [x] **T-12** Style the `<Toaster>` to match the design system using Sonner's CSS custom properties (`--normal-bg`, `--normal-border`, `--normal-text`, `--success-bg`, etc.). Map to existing tokens (`--panel-2`, `--border`, `--success-border-soft`, etc.). Pass `theme="system"` (or drive from the app's active theme state) so dark/light modes are respected.

---

## Phase 5 — Tests

- [x] **T-13** Rewrite `test/epic9-notifications-accessibility.test.mjs`:
  - Remove the `ToastStack.svelte` file read and all assertions against `toastStackSource`.
  - Remove the `createToastRecord / pushToast / removeToast / shouldAutoDismissToast` imports and the toast-helpers test block.
  - Keep all unrelated assertions.

- [x] **T-14** Rewrite `test/epic16-notification-refinements.test.mjs`:
  - Remove the `ToastStack.svelte` file read and the `data-toast-auto-dismiss` assertion.
  - Remove the `createToastRecord / pushToast / shouldAutoDismissToast` imports and their test blocks (stack-trimming logic is now inside Sonner).
  - Keep all unrelated assertions.

- [x] **T-15** Rewrite `test/epic24-toast-behavior.test.mjs`:
  - Remove assertions on `#toast-region` CSS, `@keyframes toast-enter`, `.toast { animation }`, and the `prefers-reduced-motion` media query (all deleted in T-8).
  - Remove the `ToastStack.svelte` aria attribute assertions.
  - Remove the `feedback-utils.ts` persistent behavior assertion.
  - Replace the `enqueueToast` call-site assertions (setLocale/setTheme tests) with equivalent assertions that check for `toast.info` / `toast.success` patterns in `App.svelte` source.
  - Keep the intent: "setTheme must not trigger a toast".

---

## Phase 6 — QA

- [ ] **T-16** Run `npm run lint` — verify zero new lint errors across all changed files.
- [ ] **T-17** Manual smoke test: trigger each toast variant (success, info, warning, error, persistent error, persistent warning) and verify stacked appearance, auto-dismiss, hover-pause, and dark/light theme rendering.
