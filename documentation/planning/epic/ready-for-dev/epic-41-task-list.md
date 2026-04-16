# Epic 41 — Translation Data Model Migration: Task List

## Story 41.1 — Scaffold `src/app/locales/` and extract the English message catalog

- [ ] Create the `src/app/locales/` directory under `src/app/`
- [ ] Create `src/app/locales/en.mjs` exporting a named constant `EN_MESSAGES` — an object literal containing every translation key currently defined inline in `localization-utils.mjs` (all 416 keys spanning namespaces: `app.*`, `header.*`, `tabs.*`, `theme.*`, `browse.*`, `collection.*`, `newGame.*`, `history.*`, `backup.*`, `stats.*`, `onboarding.*`, `common.*`, `actions.*`, `persistence.*`, `validation.*`)
- [ ] Ensure the export name is exactly `EN_MESSAGES` (no default export, no alias)
- [ ] Add a one-line file-header comment identifying this file as the canonical key schema for all other locale files
- [ ] Confirm no key is lost, renamed, or reordered relative to the source inline constant in `localization-utils.mjs`
- [ ] Test: open `src/app/locales/en.mjs` and count exported keys; assert the count matches the number of keys in the original inline `EN_MESSAGES` constant in `localization-utils.mjs`; spot-check at least five keys from distinct namespaces (`app.title`, `tabs.browse.label`, `onboarding.stepPrefix`, `persistence.invalidPrefs`, `validation.scoreWholeNumber`) to confirm their values are verbatim
- [ ] QC (Automated): run `node --test test/epic19-localization.test.mjs` after Story 41.3 wiring is complete and confirm the English locale assertions pass with no fallback key warnings

---

## Story 41.2 — Extract the five remaining locale message catalogs

- [ ] Create `src/app/locales/fr.mjs` exporting `FR_MESSAGES` — a partial object containing every key that differs from English in the French locale; preserve all ICU-style placeholders (`{count}`, `{current}`, `{total}`, `{date}`, `{mode}`, `{score}`, `{players}`, `{label}`) verbatim; leave brand names (Legendary, Mastermind, S.H.I.E.L.D., Marvel, Hydra) untranslated
- [ ] Create `src/app/locales/de.mjs` exporting `DE_MESSAGES` — same constraints as `FR_MESSAGES`; verify that German-specific keys present in the source inline constant (e.g. `browse.hero.manageCollection`, `onboarding.titleEyebrow`, `onboarding.stepPrefix`, `onboarding.step1.title`, `onboarding.step5.title`) are included
- [ ] Create `src/app/locales/ja.mjs` exporting `JA_MESSAGES` — same constraints; verify Japanese-script strings are encoded as UTF-8 and no ASCII lookalike characters substitute any Unicode character
- [ ] Create `src/app/locales/ko.mjs` exporting `KO_MESSAGES` — same constraints; verify Hangul strings are encoded as UTF-8 without ASCII lookalikes
- [ ] Create `src/app/locales/es.mjs` exporting `ES_MESSAGES` — same constraints; verify that keys such as `newGame.acceptLog`, `onboarding.titleEyebrow`, `onboarding.stepPrefix`, `onboarding.step1.title`, `onboarding.step5.title` are present with correct Spanish translations
- [ ] For each locale file, confirm the export name matches the pattern `<LANG>_MESSAGES` (e.g. `FR_MESSAGES`, `DE_MESSAGES`, `JA_MESSAGES`, `KO_MESSAGES`, `ES_MESSAGES`); no default export
- [ ] For each locale file, add the same one-line encoding audit comment used in `en.mjs`
- [ ] Test: for each of the five locale files, open the file and spot-check at least three ICU placeholder strings; confirm each `{placeholder}` token is present verbatim and not translated; confirm brand names (Legendary, Marvel) are untranslated; confirm the file parses without syntax error by running `node --input-type=module < src/app/locales/<locale>.mjs`
- [ ] QC (Automated): run `node --test test/epic19-localization.test.mjs` (specifically the `'Epic 19 locale helpers expose the six production locales and translated UI copy'` test block) and confirm all per-locale `t()` assertions pass for French, German, Japanese, Korean, and Spanish

---

## Story 41.3 — Rewire `localization-utils.mjs` to import from all six locale files

- [ ] Add six static ES module imports at the top of `localization-utils.mjs`:
  - `import { EN_MESSAGES } from './locales/en.mjs';`
  - `import { FR_MESSAGES } from './locales/fr.mjs';`
  - `import { DE_MESSAGES } from './locales/de.mjs';`
  - `import { JA_MESSAGES } from './locales/ja.mjs';`
  - `import { KO_MESSAGES } from './locales/ko.mjs';`
  - `import { ES_MESSAGES } from './locales/es.mjs';`
- [ ] Remove the inline `EN_MESSAGES`, `FR_MESSAGES`, `DE_MESSAGES`, `JA_MESSAGES`, `KO_MESSAGES`, and `ES_MESSAGES` object literals from `localization-utils.mjs`; the file must contain no remaining `const *_MESSAGES = {` declarations after removal
- [ ] Verify the `getMessagesForLocale()` internal function still merges locale-specific overrides over the English base (e.g. `{ ...EN_MESSAGES, ...FR_MESSAGES }`) for all five non-English locales and returns `EN_MESSAGES` for the English default — no change to merge logic
- [ ] Confirm the following public exports are signature-identical to the pre-migration version:
  - `export const DEFAULT_LOCALE_ID` — string `'en-US'`
  - `export function normalizeLocaleId(localeId)` — accepts one string argument
  - `export function getSelectableLocales()` — no arguments, returns array of six locale objects
  - `export function getLocaleOption(localeId)` — accepts one string argument
  - `export function createLocaleTools(localeId)` — accepts one string argument; returned object must include `t()`, `getPlayModeLabel()`, `hasFallbacks`, `formatPlayerLabel()`, `formatDate()`, `formatDateTime()`, `formatNumber()`, `formatList()`
- [ ] Confirm no file outside `localization-utils.mjs` required modification (run `git diff --name-only` and verify only `localization-utils.mjs` and the six new locale files appear)
- [ ] Test: manually import `localization-utils.mjs` in a scratch Node script and call `createLocaleTools('fr-FR').t('app.title')`; assert the return value is `'Randomiseur Legendary: Marvel'`; call `createLocaleTools('de-DE').t('browse.hero.manageCollection')`; assert the return value is `'Sammlung verwalten'`
- [ ] Test: grep `localization-utils.mjs` for the pattern `const [A-Z]+_MESSAGES = {` and confirm zero matches
- [ ] QC (Automated): run `node --test test/epic19-localization.test.mjs` and confirm both test blocks pass with zero failures; run `npm run lint` first and confirm no lint errors before test execution

---

## Epic-wide validation gate

- [ ] After all three stories are complete, confirm `git diff --name-only` lists only `src/app/localization-utils.mjs` and the six files under `src/app/locales/` — no consumer components, no test files, no other `src/app/` modules
- [ ] QC (Automated): hand off to the QC agent with instruction to run `npm run lint` (blocking) then `node --test test/epic19-localization.test.mjs` (Story 41.3 gate) and `npm test` (full regression gate); confirm all pass before marking Epic 41 complete
