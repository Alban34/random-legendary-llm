# Epic 85 — My Collection: Remove Noise and Restore Storage Error Notice

**Objective**
The "My Collection" tab shows a "latest action" info line and an always-visible storage notice that add noise under normal conditions. This epic removes those elements from the default view and re-introduces the storage notice exclusively as a conditional error message, keeping the UI clean while still surfacing genuine storage problems.

---

## Epic 85 Task List

### Story 85.1 — Remove the "latest action" information element from the My Collection view

**Acceptance Criteria:** The "latest action" text element is absent from the rendered My Collection view under all application states.

- [x] In `src/components/CollectionTab.svelte`, delete the `{#if lastActionNotice}` block (lines ~98–100) that renders `locale.t('collection.latestAction')` and the `lastActionNotice` value inside the `.summary-card` div.
- [x] In `src/components/CollectionTab.svelte`, remove the `lastActionNotice` prop declaration from the `$props()` destructuring (line ~14) and its corresponding TypeScript type annotation (line ~27) since the prop is no longer consumed.
- [x] In `src/components/App.svelte`, remove the `lastActionNotice={ui.lastActionNotice}` attribute from the `<CollectionTab>` usage (line ~758) to eliminate the now-unused prop pass-through.
- [x] **Test:** Verify that `src/components/CollectionTab.svelte` no longer contains any reference to `lastActionNotice` or `collection.latestAction`, and that `src/components/App.svelte` no longer passes `lastActionNotice` to `<CollectionTab>`.

---

### Story 85.2 — Remove the always-visible storage notice from the My Collection view

**Acceptance Criteria:** The storage notice element is absent from the My Collection view under normal (no-error) conditions.

- [x] In `src/components/CollectionTab.svelte`, delete the `.summary-card` wrapper `<div>` (lines ~94–101) that unconditionally renders and contains the `{#if !persistence.storageAvailable}` / `collection.storage.unavailable` block alongside the now-removed `lastActionNotice` block. If the wrapping `.summary-card` div was shared with other content, ensure only the storage-notice-related markup is removed.
- [x] Confirm that no other always-rendered storage status text (e.g. referencing `collection.storage`, `collection.storage.unavailable`, `collection.storage.available`) remains in `src/components/CollectionTab.svelte` outside a conditional `{#if}` guard.
- [x] **Test:** Verify that `src/components/CollectionTab.svelte` no longer contains an unconditionally rendered reference to `collection.storage.unavailable` outside of a conditional `{#if}` block.

---

### Story 85.3 — Introduce a conditional storage-error notice that renders only on detected storage errors

**Acceptance Criteria:** When a storage error occurs (e.g. quota exceeded or write failure), the storage-error notice is displayed with an appropriate user-facing message; when no error exists, the element is not rendered; any new user-facing strings are added to all six locale files.

- [x] Add a new locale key `'collection.storage.error'` to `src/app/locales/en.ts` with an appropriate English user-facing message (e.g. `'Storage unavailable — changes will not be saved.'`), positioned near the existing `collection.storage.*` keys (around line 91–97).
- [x] Add the equivalent translated string for `'collection.storage.error'` to `src/app/locales/de.ts`.
- [x] Add the equivalent translated string for `'collection.storage.error'` to `src/app/locales/es.ts`.
- [x] Add the equivalent translated string for `'collection.storage.error'` to `src/app/locales/fr.ts`.
- [x] Add the equivalent translated string for `'collection.storage.error'` to `src/app/locales/ja.ts`.
- [x] Add the equivalent translated string for `'collection.storage.error'` to `src/app/locales/ko.ts`.
- [x] In `src/components/CollectionTab.svelte`, add a new conditional block — `{#if !persistence.storageAvailable}` — that renders a notice element (e.g. `<div class="notice warning" data-storage-error-notice>`) containing `locale.t('collection.storage.error')`. This element must be absent from the DOM when `persistence.storageAvailable` is `true`.
- [x] **Test:** Verify (by source inspection in `src/components/CollectionTab.test.ts`) that `src/components/CollectionTab.svelte` contains a `{#if !persistence.storageAvailable}` guard wrapping a `data-storage-error-notice` element and that `collection.storage.error` is referenced within that guard; also verify all six locale files contain the `collection.storage.error` key.

---

### Story 85.4 — Test: conditional storage-error notice visibility

**Acceptance Criteria:** `npm run lint` and `npm test` pass; the conditional visibility is covered by at least two unit tests — one for the no-error (hidden) state and one for the error (visible) state — using mocked storage states.

- [x] In `src/components/CollectionTab.test.ts`, add a test (e.g. `'CollectionTab storage-error notice is absent when storageAvailable is true'`) that reads `src/components/CollectionTab.svelte` source and asserts the `{#if !persistence.storageAvailable}` guard is present (confirming the element is conditionally rendered, not always rendered) and that no unconditional `data-storage-error-notice` appears outside that guard.
- [x] In `src/components/CollectionTab.test.ts`, add a test (e.g. `'CollectionTab storage-error notice is present when storageAvailable is false'`) that asserts the template inside the `{#if !persistence.storageAvailable}` block contains `data-storage-error-notice` and references the `collection.storage.error` locale key.
- [x] In `src/components/CollectionTab.test.ts`, add a test (e.g. `'CollectionTab does not render lastActionNotice element'`) that asserts `src/components/CollectionTab.svelte` does not contain a reference to `lastActionNotice` or `collection.latestAction`.
- [x] Ensure all existing tests in `src/components/CollectionTab.test.ts` still pass without modification (no regressions to existing assertions such as `data-collection-reset-section` and `collection.resetSelections.consequence` checks).
- [ ] **Test:** `npm run lint` passes with no errors; `npm test` passes with no failing test suites, including the updated `src/components/CollectionTab.test.ts`.

---

### Story 85.5 — QC (Automated)

**Acceptance Criteria:** `npm run lint` then `npm test`; all checks pass with no regressions.

- [ ] **QC (Automated):** Run `npm run lint`; confirm zero lint errors or warnings introduced by this epic across all changed files (`src/components/CollectionTab.svelte`, `src/components/App.svelte`, `src/app/locales/en.ts`, `src/app/locales/de.ts`, `src/app/locales/es.ts`, `src/app/locales/fr.ts`, `src/app/locales/ja.ts`, `src/app/locales/ko.ts`, `src/components/CollectionTab.test.ts`).
- [ ] **QC (Automated):** Run `npm test`; confirm all test suites pass including `src/components/CollectionTab.test.ts` (new and existing tests) and `src/app/locales/locales.test.ts` (locale key parity check across all six locale files).
- [ ] **QC (Automated):** Confirm no regressions in `src/components/App.test.ts`, `src/app/state-store.test.ts`, or any other test file that previously referenced `lastActionNotice` in its assertions.
