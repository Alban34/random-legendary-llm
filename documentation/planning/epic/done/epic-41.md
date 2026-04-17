## Epic 41 — Translation Data Model Migration


**Objective**
Restructure the localization layer so each supported language lives in its own dedicated file under `src/app/locales/`, giving every translator agent a single, clearly bounded file to own; the runtime API exposed by `localization-utils.mjs` remains fully backward-compatible and no consumer code outside that module requires changes.

**In scope**
- six per-locale files (`en.mjs`, `fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, `es.mjs`) under `src/app/locales/`, each exporting its respective message object
- removal of all inline `*_MESSAGES` constants from `localization-utils.mjs` and replacement with import statements from the new locale files
- preservation of all ICU-style placeholders (`{count}`, `{date}`, `{mode}`, etc.) and untranslated brand names verbatim through the migration
- verification that the public API (`t()`, `getLocale()`, `getPlayModeLabel()`, `SELECTABLE_LOCALES`) is unchanged after the refactor

**Out of scope**
- adding new translation keys or updating existing translation strings
- changing the `getLocale()` factory logic or the fallback-to-English behaviour
- modifying any consumer component or module that calls `localization-utils.mjs`

**Stories**
1. **Scaffold the `src/app/locales/` directory and extract the English message catalog as the canonical key schema**
2. **Extract the five remaining locale message catalogs into their own dedicated files**
3. **Rewire `localization-utils.mjs` to import from all six per-locale files and confirm the public API is unchanged**

**Acceptance Criteria**
- Story 1: `src/app/locales/en.mjs` exists and exports `EN_MESSAGES` containing every key that was previously defined inline in `localization-utils.mjs`; the file is treated as the reference key schema for all other locale files; no keys are lost or renamed.
- Story 2: `src/app/locales/fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, and `es.mjs` each export their respective message object; every ICU-style placeholder present in the source file is preserved verbatim; brand names (Legendary, Mastermind, S.H.I.E.L.D., etc.) remain untranslated; no translation string is altered in content.
- Story 3: `localization-utils.mjs` contains no inline `*_MESSAGES` object literals; it imports from all six locale files; the exports `t()`, `getLocale()`, `getPlayModeLabel()`, and `SELECTABLE_LOCALES` are signature-identical to the pre-migration version; no file outside `localization-utils.mjs` required modification; all existing automated tests pass without change.
