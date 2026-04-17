## Epic 52 — Translation Coverage Audit & Completion

**Objective**
Achieve full translation coverage across all five supported non-English locales (`fr`, `de`, `ja`, `ko`, `es`) by auditing every key in `src/app/locales/en.mjs` against each locale file, identifying every gap or placeholder value, and providing complete, accurate translations for all missing keys so no user-facing string falls back to English.

**In scope**
- Audit all keys in `en.mjs` against `fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, and `es.mjs` to produce a per-locale gap report identifying keys that are absent or still hold placeholder or English-language values
- Write complete, non-placeholder translations for every missing key in each of the five locale files
- Ensure all locale files remain syntactically valid ESM modules after changes
- Confirm `npm run lint` passes on all modified locale files

**Out of scope**
- Adding new locales beyond the five already listed
- Changes to the locale-loading or locale-switching infrastructure
- Updating `en.mjs` with new keys — only keys already present in `en.mjs` are in scope; new keys belong to the feature epic that introduces them
- Translation of keys that do not yet exist in `en.mjs`

**Stories**
1. **Audit all keys in `en.mjs` against each of the five locale files and produce a per-locale gap report**
2. **Write complete translations for every missing or placeholder key in `fr.mjs` and `de.mjs`**
3. **Write complete translations for every missing or placeholder key in `ja.mjs`, `ko.mjs`, and `es.mjs`**
4. **Validate that all five locale files are syntactically correct and fully cover every key in `en.mjs`**

**Acceptance Criteria**
- Story 1: A per-locale gap report (appended to this epic file or linked from it) lists, for each of the five locale files, every key that is absent or contains a placeholder or English-text value, with the English source string shown for reference.
- Story 2: `fr.mjs` and `de.mjs` contain entries for every key present in `en.mjs` with non-placeholder, non-English values; `npm run lint` passes on both files.
- Story 3: `ja.mjs`, `ko.mjs`, and `es.mjs` contain entries for every key present in `en.mjs` with non-placeholder values; `npm run lint` passes on all three files.
- Story 4: A diff or automated check confirms zero keys in `en.mjs` are absent from any of the five locale files; the app displays no English-language fallback text when any supported non-English locale is active.
