## Epic 35 — v1.0.1 Release Polish

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 35 work complete

### Story 35.1 — Audit and correct French locale strings
- [x] Identify the French locale file path in `src/`
- [x] Find all strings with missing apostrophes or incorrect/missing accented characters
- [x] Correct each such string inline (apostrophes, accented characters)
- [x] Replace "Non posee actuellement." with "Non possédée actuellement." in the French locale file
- [x] **Test:** verify the French locale file contains correct apostrophes and accented characters throughout; verify "Non possédée actuellement." appears wherever collection-ownership absence is communicated in French
- [x] **QC (Automated):** automate QC coverage that renders key French strings in the UI and confirms apostrophes and accented characters are present and not replaced by ASCII substitutes

### Story 35.2 — Audit other supported locales for encoding and quality issues
- [x] Identify all locale files in the project other than the French locale file
- [x] Check each locale file for missing apostrophes, encoding errors, or obvious translation quality mistakes
- [x] Correct any issues found; add a brief comment inside the locale file if no issues are found, recording the audit result
- [x] **Test:** verify all non-French locale files have been reviewed; any issues found have been corrected; files with no issues carry an audit comment
- [x] **QC (Automated):** automate QC coverage that switches the UI to at least one non-French locale and confirms rendered strings display correct encoding (no garbled or ASCII-fallback characters)

### Story 35.3 — Supply translations for every missing user-facing string
- [x] Audit all supported locale files for missing or untranslated keys (keys absent from a locale file, causing fallback to another locale or display of a raw key)
- [x] Add a translated string for every missing key in each supported locale
- [x] Verify no tab or panel falls back to English or shows a raw translation key in any supported locale
- [x] **Test:** verify every locale file defines every required translation key; switching to each supported locale in the running app shows no untranslated or raw-key string in any tab or panel
- [x] **QC (Automated):** automate QC coverage that switches to each supported locale and confirms no untranslated key or raw key is visible in any tab

### Story 35.4 — Fix score input keyboard focus retention
- [x] Locate the score input field component and its `change`/`input` event handler in `src/`
- [x] Identify why keyboard focus leaves the input field after a single digit is entered
- [x] Fix the handler so focus remains in the input field after each keystroke
- [x] Verify successive digits can be typed without the user needing to re-click the field between digits
- [x] **Test:** verify entering multiple successive digits in the score input never moves focus away from the field; no re-click is required between digits
- [x] **QC (Automated):** automate QC coverage for keyboard-only score entry, confirming that after each digit keystroke the score input field retains focus and the cursor does not leave the field

### Story 35.5 — Bump application version to 1.0.1
- [x] Update the `version` field in `package.json` from `"1.0.0"` to `"1.0.1"`
- [x] Locate every UI surface in `src/` that displays the application version string
- [x] Update each UI surface to display `"1.0.1"` instead of `"1.0.0"`
- [x] Confirm no reference to `"1.0.0"` remains visible on any production UI surface
- [x] **Test:** verify `package.json` contains `"version": "1.0.1"`; verify all UI version surfaces render `"1.0.1"`; verify no `"1.0.0"` string is visible in the UI
- [x] **QC (Automated):** automate QC coverage asserting the version string `"1.0.1"` is visible in the UI and no `"1.0.0"` reference appears on any rendered surface

---
