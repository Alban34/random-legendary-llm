# Epic 71 — Epic Mastermind Difficulty Mode

Introduce "Epic Mastermind" as a selectable difficulty variant for supported expansions (starting with X-Men), surface it as an opt-in control during game setup, store the flag in history records, display it as a visual indicator on history entries, and add a dedicated grouping mode so players can review all their Epic Mastermind games at a glance.

---

## Story 71.1 — Define the Epic Mastermind variant in the data model

- [x] **T-1** Add a typed constant `EPIC_MASTERMIND_SUPPORTED_SETS` to `src/app/types.ts` (or a dedicated `src/app/epic-mastermind.ts` constants file) listing the expansion names that contain Epic Mastermind cards.
  - Initial value: `["X-Men"]` (as `readonly string[]` or `as const` tuple).
  - Include an inline comment: `// Add future expansion names here when their Epic Mastermind cards are catalogued.`

- [x] **T-2** Add `epicMastermind?: boolean` to the `HistoryRecord` interface in `src/app/types.ts`.

- [x] **T-3** Update `sanitizeGameRecord` in `src/app/state-store.ts` to normalise the new field.
  - Read the raw value; if it is strictly `true`, output `epicMastermind: true`.
  - For any other value (missing, `undefined`, `null`, non-boolean), output `epicMastermind: false`.
  - Must not alter any other field on the record.

- [x] **T-4** Test: Add unit tests to `test/epic71-epic-mastermind.test.mjs` covering:
  - `sanitizeGameRecord` with `epicMastermind: true` → output has `epicMastermind: true`.
  - `sanitizeGameRecord` with `epicMastermind: false` → output has `epicMastermind: false`.
  - `sanitizeGameRecord` with `epicMastermind` absent → output has `epicMastermind: false`.
  - `sanitizeGameRecord` with `epicMastermind: "yes"` (invalid type) → output has `epicMastermind: false`.
  - A full existing-record round-trip: all other fields on the record are untouched.

- [x] **T-5** QC (Automated): `npm run lint` passes; `npm test` exits 0.

---

## Story 71.2 — Update the setup generator for Epic Mastermind mode

- [x] **T-6** Add `epicMastermind?: boolean` to the `GenerateSetupOptions` interface in `src/app/setup-generator.ts`.

- [x] **T-7** Filter the mastermind pool in `generateSetup` within `src/app/setup-generator.ts`: when `epicMastermind` is `true`, restrict the mastermind pool to cards whose owning set name is in `EPIC_MASTERMIND_SUPPORTED_SETS` **and** that carry the Epic Mastermind designation (use whatever card-level boolean/tag is appropriate in `MastermindRuntime`; add the field if absent).
  - The standard path (no flag or `epicMastermind: false`) must be completely unaffected.

- [x] **T-8** Add an explicit error path in `generateSetup` in `src/app/setup-generator.ts`: if `epicMastermind` is `true` but the filtered Epic pool is empty, throw a descriptive, localised error (using the locale key `newGame.epicMastermind.noCardsError`) rather than silently falling back to a standard mastermind.

- [x] **T-9** Test: Add unit tests to `test/epic71-epic-mastermind.test.mjs` covering:
  - When Epic Mastermind mode is active, `generateSetup` returns a mastermind that belongs only to the Epic pool (its set is in `EPIC_MASTERMIND_SUPPORTED_SETS` and is tagged as epic).
  - When Epic Mastermind mode is active but no owned expansion contains Epic Mastermind cards, `generateSetup` throws (error is not swallowed).
  - With `epicMastermind: false` or omitted, `generateSetup` behaves identically to the pre-epic-71 path.

- [x] **T-10** QC (Automated): `npm run lint` passes; `npm test` exits 0.

---

## Story 71.3 — Add the Epic Mastermind opt-in UI control to setup view

- [x] **T-11** Add a toggle/checkbox control for Epic Mastermind mode inside `src/components/NewGameTab.svelte`.
  - Render the control **only** when at least one set in `EPIC_MASTERMIND_SUPPORTED_SETS` is present in `state.collection.ownedSetIds` (by set name lookup).
  - When the owning condition is not met the control must be completely absent from the DOM (not just hidden with CSS).
  - Bind the toggle value to a reactive state variable (e.g. `epicMastermindEnabled`).
  - Pass `epicMastermind: epicMastermindEnabled` into the `generateSetup` call.

- [x] **T-12** Persist the toggle value so it survives a page reload.
  - Add `lastEpicMastermind?: boolean` to the `Preferences` interface in `src/app/types.ts`.
  - Read the persisted value as the toggle's initial state in `src/components/NewGameTab.svelte` (or `src/app/state-store.ts`).
  - Write it back on toggle change via the normal preferences update path in `src/app/state-store.ts`.

- [x] **T-13** Test: Add Playwright tests to `test/epic71-epic-mastermind.test.mjs` (or a dedicated `test/epic71-epic-mastermind-e2e.test.mjs`) covering:
  - Control is visible in the setup view when the player owns a supporting expansion (e.g. "X-Men").
  - Control is absent from the DOM when no supporting expansion is owned.
  - Enabling the control and generating a setup produces a mastermind drawn from the Epic pool.
  - Disabling the control and regenerating produces a standard mastermind.
  - The toggle state survives a page reload (localStorage persistence).

- [x] **T-14** QC (Automated): `npm run lint` passes; `npx playwright test` exits 0.

---

## Story 71.4 — Persist and safely read the epicMastermind flag in history records

- [x] **T-15** Update the "Accept & Log" path in `src/components/NewGameTab.svelte` (and/or the record-creation helper in `src/app/state-store.ts`) to write `epicMastermind: epicMastermindEnabled` (the current toggle value as a boolean) onto every new `HistoryRecord`.

- [x] **T-16** Confirm that `sanitizeGameRecord` in `src/app/state-store.ts` already handles legacy records without the field (normalising to `false`) per T-3; no additional change needed if T-3 is complete.

- [x] **T-17** Test: Add integration tests to `test/epic71-epic-mastermind.test.mjs` covering:
  - Write a `HistoryRecord` with `epicMastermind: true`, serialise/deserialise through `sanitizeGameRecord`, and confirm the flag is `true` on read-back.
  - Load a legacy record object that has no `epicMastermind` field; confirm it reads as `epicMastermind: false` without throwing.
  - Confirm all other fields on existing records are byte-for-byte identical after the round-trip.

- [x] **T-18** QC (Automated): `npm run lint` passes; `npm test` exits 0.

---

## Story 71.5 — Display Epic Mastermind indicator and history grouping mode

- [x] **T-19** Add a visual indicator (badge, icon, or label) to the history list item template in `src/components/HistoryTab.svelte`.
  - Render it **only** when the entry's `epicMastermind` is `true`; it must be completely absent for standard entries.
  - Use the locale key `history.epicMastermind.indicator` for the accessible label/text.
  - Follow the established visual language for supplementary badges on history entries.

- [x] **T-20** Add `{ id: 'epic-mastermind', label: 'history.group.epic-mastermind' }` to the `HISTORY_GROUPING_MODES` array in `src/app/history-utils.ts`.

- [x] **T-21** Implement the `'epic-mastermind'` branch inside the `groupHistoryBy` (or equivalent) function in `src/app/history-utils.ts`:
  - Group 1: entries where `epicMastermind === true`.
  - Group 2: entries where `epicMastermind !== true`.
  - Use locale keys for the group header labels (`history.group.epic-mastermind.epicGames` and `history.group.epic-mastermind.standardGames`).

- [x] **T-22** Verify that `normalizeHistoryGroupingMode('epic-mastermind')` returns `'epic-mastermind'` in `src/app/history-utils.ts` (no change needed if the function already validates against `HISTORY_GROUPING_MODES`; add a targeted assertion in tests).

- [x] **T-23** Test: Add Playwright tests covering:
  - The Epic Mastermind indicator is visible on history entries tagged `epicMastermind: true` and absent on untagged entries.
  - `'epic-mastermind'` is present in the group-by dropdown in the history view.
  - Selecting the grouping mode produces exactly two group headings (Epic Mastermind games and standard games).
  - Add a unit-test assertion: `normalizeHistoryGroupingMode('epic-mastermind') === 'epic-mastermind'`.

- [x] **T-24** QC (Automated): `npm run lint` passes; `npx playwright test` exits 0.

---

## Story 71.6 — Add and translate locale strings for Epic Mastermind UI

- [x] **T-25** Add all new locale keys to `src/app/locales/en.ts`:
  - `'newGame.epicMastermind'` — setup toggle label (e.g. `'Epic Mastermind'`)
  - `'newGame.epicMastermind.help'` — short description shown near the toggle (e.g. `'Draw the mastermind exclusively from the harder Epic Mastermind card pool.'`)
  - `'newGame.epicMastermind.noCardsError'` — error when no Epic Mastermind card is available (e.g. `'No Epic Mastermind cards are available in your collection.'`)
  - `'history.group.epic-mastermind'` — grouping mode label in dropdown (e.g. `'Epic Mastermind'`)
  - `'history.group.epic-mastermind.epicGames'` — group header for Epic Mastermind entries (e.g. `'Epic Mastermind'`)
  - `'history.group.epic-mastermind.standardGames'` — group header for standard entries (e.g. `'Standard'`)
  - `'history.epicMastermind.indicator'` — accessible label on the history entry badge (e.g. `'Epic Mastermind'`)

- [x] **T-26** Copy all seven keys into `src/app/locales/fr.ts` with French translations.

- [x] **T-27** Copy all seven keys into `src/app/locales/de.ts` with German translations.

- [x] **T-28** Copy all seven keys into `src/app/locales/es.ts` with Spanish translations.

- [x] **T-29** Copy all seven keys into `src/app/locales/ja.ts` with Japanese translations.

- [x] **T-30** Copy all seven keys into `src/app/locales/ko.ts` with Korean translations.

- [x] **T-31** Test: Verify no missing-key lint warnings by confirming each locale file's key set is a superset of `en.ts` (use the existing locale-completeness check if present, or add a targeted assertion to `test/epic71-epic-mastermind.test.mjs`).

- [x] **T-32** QC (Automated): `npm run lint` passes.
