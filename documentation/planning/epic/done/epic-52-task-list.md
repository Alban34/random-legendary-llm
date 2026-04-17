# Epic 52 — Translation Coverage Audit & Completion: Task List

## Story 52.1 — Audit all keys in `en.mjs` against each of the five locale files and produce a per-locale gap report

- [x] Run the following Node.js audit command from the project root to enumerate, for each locale, every key whose value is identical to the English source string (indicating an untranslated placeholder):
  ```
  node --input-type=module << 'AUDIT'
  import { EN_MESSAGES } from './src/app/locales/en.mjs';
  import { FR_MESSAGES } from './src/app/locales/fr.mjs';
  import { DE_MESSAGES } from './src/app/locales/de.mjs';
  import { JA_MESSAGES } from './src/app/locales/ja.mjs';
  import { KO_MESSAGES } from './src/app/locales/ko.mjs';
  import { ES_MESSAGES } from './src/app/locales/es.mjs';
  const enKeys = Object.keys(EN_MESSAGES);
  const locales = { fr: FR_MESSAGES, de: DE_MESSAGES, ja: JA_MESSAGES, ko: KO_MESSAGES, es: ES_MESSAGES };
  for (const [code, msgs] of Object.entries(locales)) {
    const missing = enKeys.filter(k => !(k in msgs));
    const sameAsEn = enKeys.filter(k => k in msgs && msgs[k] === EN_MESSAGES[k]);
    console.log(`\n### ${code}.mjs — missing: ${missing.length}, untranslated (same as EN): ${sameAsEn.length}`);
    if (missing.length) missing.forEach(k => console.log(`  MISSING  ${k}: "${EN_MESSAGES[k]}"`));
    sameAsEn.forEach(k => console.log(`  UNTRANSLATED  ${k}: "${EN_MESSAGES[k]}"`));
  }
  AUDIT
  ```
- [x] Verify the audit confirms **zero structurally missing keys** across all five locale files (all 435 keys from `EN_MESSAGES` are present in each file).
- [x] Record the per-locale counts of untranslated keys returned by the audit; confirm they match the known baseline: FR ≥ 19, DE ≥ 16, KO ≥ 7, ES ≥ 10, JA ≥ 2.
- [x] Append the full gap report output (verbatim audit output, formatted as a fenced code block) to `documentation/planning/epic/ready-for-dev/epic-52.md` under a new `## Gap Report` heading at the end of the file.
- [x] Test: manually inspect the appended gap report in `epic-52.md`; confirm every listed key is present in `en.mjs` and that its English source string is shown alongside it; spot-check three keys per locale by reading the corresponding locale file to confirm the value is indeed identical to the English string.
- [ ] QC (Automated): re-run the audit script and assert its exit code is 0; assert the output contains exactly five locale sections (`fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, `es.mjs`); assert "MISSING" does not appear in the output (all keys are structurally present).

---

## Story 52.2 — Write complete translations for every missing or placeholder key in `fr.mjs` and `de.mjs`

- [x] In `src/app/locales/fr.mjs`, replace the English-value entries for all 19 untranslated keys with accurate French translations. The keys to translate are:
  - `tabs.collection.label`
  - `tabs.collection.shortLabel`
  - `newGame.result.mastermind`
  - `newGame.forcedPicks.field.mastermindId`
  - `history.group.mastermind`
  - `history.resultEditor.score`
  - `history.resultEditor.notes`
  - `history.insights.playCount`
  - `toast.region`
  - `toast.variant.info`
  - `common.masterminds`
  - `common.mode`
  - `common.mastermind`
  - `common.mastermindTitle`
  - `common.mastermindsLower`
  - `collection.group.base`
  - `common.score`
  - `result.scoreLabel`
  - `common.playMode.standard`
- [x] Preserve all ICU-style placeholders (`{count}`, `{date}`, `{mode}`, etc.) verbatim in every French translation; do not alter untranslated brand names (`Legendary`, `Mastermind`, `S.H.I.E.L.D.`).
- [x] In `src/app/locales/de.mjs`, replace the English-value entries for all 16 untranslated keys with accurate German translations. The keys to translate are:
  - `tabs.backup.label`
  - `tabs.backup.shortLabel`
  - `collection.feasibility.legal`
  - `collection.viewToggle.sets`
  - `newGame.result.mastermind`
  - `newGame.forcedPicks.field.mastermindId`
  - `history.group.mastermind`
  - `history.resultEditor.optional`
  - `history.insights.playCount`
  - `toast.variant.info`
  - `common.masterminds`
  - `common.mastermindTitle`
  - `common.playMode.standard`
  - `common.playMode.standardSolo`
  - `common.playMode.advanced-solo`
  - `common.playMode.two-handed-solo`
- [x] Preserve all ICU-style placeholders verbatim in every German translation; do not alter brand names.
- [x] Confirm `fr.mjs` exports `FR_MESSAGES` as a valid ESM named export and that the object literal is syntactically correct (no trailing commas on the final entry before `}`; all string values properly quoted).
- [x] Confirm `de.mjs` exports `DE_MESSAGES` as a valid ESM named export and that the object literal is syntactically correct.
- [x] Run `npm run lint -- src/app/locales/fr.mjs src/app/locales/de.mjs` and resolve all reported errors before proceeding.
- [x] Test: switch the app locale to French in a running dev build (`npm run dev`) and navigate to the Collection tab, New Game result screen, History screen, and toast area; confirm none of the 19 previously-English strings are displayed in English; repeat with German locale for the 16 DE keys.
- [x] QC (Automated): re-run the audit script from Story 52.1 and assert the `fr.mjs` section reports `untranslated: 0` and the `de.mjs` section reports `untranslated: 0`; assert `npm run lint src/app/locales/fr.mjs src/app/locales/de.mjs` exits with code 0.

---

## Story 52.3 — Write complete translations for every missing or placeholder key in `ja.mjs`, `ko.mjs`, and `es.mjs`

- [x] In `src/app/locales/ja.mjs`, replace the English-value entries for all 2 untranslated keys with accurate Japanese translations. The keys to translate are:
  - `history.insights.playCount`
  - `common.format.persistedPlayMode`
- [x] In `src/app/locales/ko.mjs`, replace the English-value entries for all 7 untranslated keys with accurate Korean translations. The keys to translate are:
  - `newGame.result.mastermind`
  - `newGame.forcedPicks.field.mastermindId`
  - `history.group.mastermind`
  - `history.insights.playCount`
  - `common.mastermindTitle`
  - `common.playMode.advanced-solo`
  - `common.playMode.two-handed-solo`
- [x] In `src/app/locales/es.mjs`, replace the English-value entries for all 10 untranslated keys with accurate Spanish translations. The keys to translate are:
  - `collection.feasibility.legal`
  - `newGame.result.mastermind`
  - `newGame.forcedPicks.field.mastermindId`
  - `history.group.mastermind`
  - `history.insights.playCount`
  - `toast.variant.error`
  - `common.mastermindTitle`
  - `collection.group.base`
  - `common.playMode.advanced-solo`
  - `common.playMode.two-handed-solo`
- [x] Preserve all ICU-style placeholders verbatim in every Japanese, Korean, and Spanish translation; do not alter brand names (`Legendary`, `Mastermind`, `S.H.I.E.L.D.`).
- [x] Confirm `ja.mjs` exports `JA_MESSAGES`, `ko.mjs` exports `KO_MESSAGES`, and `es.mjs` exports `ES_MESSAGES`, each as syntactically valid ESM named exports.
- [x] Run `npm run lint -- src/app/locales/ja.mjs src/app/locales/ko.mjs src/app/locales/es.mjs` and resolve all reported errors before proceeding.
- [x] Test: switch the app locale to Japanese in a running dev build and verify `history.insights.playCount` and `common.format.persistedPlayMode` render in Japanese; switch to Korean and verify all 7 KO keys render in Korean; switch to Spanish and verify all 10 ES keys render in Spanish; confirm no English fallback text is visible for those keys in any of the three locales.
- [x] QC (Automated): re-run the audit script from Story 52.1 and assert the `ja.mjs`, `ko.mjs`, and `es.mjs` sections each report `untranslated: 0`; assert `npm run lint src/app/locales/ja.mjs src/app/locales/ko.mjs src/app/locales/es.mjs` exits with code 0.

---

## Story 52.4 — Validate that all five locale files are syntactically correct and fully cover every key in `en.mjs`

- [x] Run the full audit script from Story 52.1 and assert the combined output contains **no `MISSING` entries and no `UNTRANSLATED` entries** across all five locale sections.
- [x] Run `npm run lint -- src/app/locales/fr.mjs src/app/locales/de.mjs src/app/locales/ja.mjs src/app/locales/ko.mjs src/app/locales/es.mjs` and assert exit code is 0 with zero errors reported for all five files.
- [x] Confirm the total key count in each locale file matches `en.mjs` by running:
  ```
  node --input-type=module << 'CHECK'
  import { EN_MESSAGES } from './src/app/locales/en.mjs';
  import { FR_MESSAGES } from './src/app/locales/fr.mjs';
  import { DE_MESSAGES } from './src/app/locales/de.mjs';
  import { JA_MESSAGES } from './src/app/locales/ja.mjs';
  import { KO_MESSAGES } from './src/app/locales/ko.mjs';
  import { ES_MESSAGES } from './src/app/locales/es.mjs';
  const enCount = Object.keys(EN_MESSAGES).length;
  const pass = [FR_MESSAGES, DE_MESSAGES, JA_MESSAGES, KO_MESSAGES, ES_MESSAGES]
    .every(m => Object.keys(m).length === enCount);
  console.log(`EN key count: ${enCount}. All locales match: ${pass}`);
  if (!pass) process.exit(1);
  CHECK
  ```
  Assert the script exits with code 0 and prints `All locales match: true`.
- [x] Confirm that `localization-utils.mjs` imports from all six locale files and that its public API (`t()`, `getLocale()`, `getPlayModeLabel()`, `SELECTABLE_LOCALES`) has not been modified during this epic.
- [x] Update the gap report section in `documentation/planning/epic/ready-for-dev/epic-52.md` with a final "Post-fix audit" output confirming zero gaps remain.
- [x] Test: launch the app with `npm run dev`, cycle through all five non-English locales (`fr`, `de`, `ja`, `ko`, `es`) using the language switcher, and confirm every visible UI string — including tab labels, backup/collection labels, game result fields, history group headers, play mode labels, toast variants, and score labels — is rendered in the selected language with no English fallback text visible.
- [x] QC (Automated): run `npm run lint` (full project lint, not scoped) and assert exit code 0; re-run the audit script and assert its output contains zero `UNTRANSLATED` lines and zero `MISSING` lines across all five locale sections.
