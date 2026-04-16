## Epic 37 — v1.0.2 Small Improvement Release

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 37 work complete

### Story 37.1 — Complete translations for all supported locales
- [x] Read all keys in `EN_MESSAGES` in `src/app/localization-utils.mjs` and produce a complete list of keys
- [x] For `de-DE`: add a genuine German translation for every key present in `EN_MESSAGES` that is missing or still using an English fallback in `DE_MESSAGES`
- [x] For `ja-JP`: add a genuine Japanese translation for every key present in `EN_MESSAGES` that is missing or still using an English fallback in `JA_MESSAGES`
- [x] For `ko-KR`: add a genuine Korean translation for every key present in `EN_MESSAGES` that is missing or still using an English fallback in `KO_MESSAGES`
- [x] For `es-ES`: add a genuine Spanish translation for every key present in `EN_MESSAGES` that is missing or still using an English fallback in `ES_MESSAGES`
- [x] For `fr-FR`: audit `FR_MESSAGES` against `EN_MESSAGES` and add any missing translations; correct any string that contains a raw English fallback
- [x] Verify the `header.locale.fallbackNotice` key is present and translated in all non-English locales
- [x] **Test:** verify that switching the app locale to each of the six supported locales results in no English-fallback strings for any key defined in `EN_MESSAGES`; cover at least the Browse, Collection, New Game, History, and Backup tab strings
- [x] **QC (Automated):** add or extend browser QC to switch to each non-English locale and assert that representative translated strings (title, a tab description, at least one action label) render in the expected language rather than English

### Story 37.2 — Make score display locale-aware
- [x] Add a new localization key `result.scoreLabel` (e.g. `'Score'`) to `EN_MESSAGES` and provide translations for all five non-English locales
- [x] Replace the hardcoded `Score ${result.score}` template literal in `src/app/result-utils.mjs` with a call that retrieves the label from the localization system and formats the number using `Intl.NumberFormat` (or a shared locale-aware helper) for the active locale
- [x] Ensure the formatting function receives the active locale identifier so number separators match locale conventions
- [x] Verify the formatted score string is correct for `en-US` (e.g. `Score 1,000`) and for a European locale such as `de-DE` (e.g. `Ergebnis 1.000`)
- [x] **Test:** add unit-test coverage asserting the formatted score output matches the expected locale-aware string for at least `en-US` and `de-DE`; verify the label changes when the locale changes
- [x] **QC (Automated):** add or extend browser QC to verify that a history record with a logged score displays the score label and number in the active locale's conventions on the History tab

### Story 37.3 — Remove the stale `test:epic10` script from `package.json`
- [x] Remove the `"test:epic10"` key from the `scripts` section of `package.json`
- [x] Confirm `"test:qc:epic10"` remains untouched (the Playwright spec at `test/playwright/epic10-qc.spec.mjs` exists and should stay)
- [x] Confirm the wildcard `npm test` command (`node --test ./test/*.test.mjs`) is unaffected since the file never existed
- [x] **Test:** verify `npm run test:epic10` now produces a "missing script: test:epic10" error from npm rather than a file-not-found Node.js error
- [x] **QC (Automated):** no browser QC required for this housekeeping story; the npm script verification above is sufficient

### Story 37.4 — Bump version to 1.0.2
- [x] Update the `version` field in `package.json` from `"1.0.1"` to `"1.0.2"`
- [x] Verify the running application header displays `1.0.2` after a build (relying on the Vite define injection from Epic 36)
- [x] **Test:** verify the version string asserted in `test/epic36-version-storage-disclosure.test.mjs` (or an equivalent test) passes against the new `1.0.2` value; update any hardcoded version string in tests if needed
- [x] **QC (Automated):** verify the existing browser QC for the version badge still passes and reports `1.0.2`

### Story 37.5 — Fix five-player setup to use 5 Villain Groups
- [x] Open `src/app/setup-rules.mjs` and locate the `SETUP_RULES` entry for player count 5
- [x] Change `villainGroupCount` from `4` to `5` for the 5-player template
- [x] Verify all other player-count templates (1, 2, 3, 4 players) remain unchanged
- [x] **Test:** add or update a unit test in the setup-rules or setup-generator test file asserting that a 5-player setup requires exactly 5 Villain Groups; confirm the test passes after the fix
- [x] **QC (Automated):** add or extend browser QC to generate a 5-player setup and assert that 5 villain group slots are present in the result display

---
