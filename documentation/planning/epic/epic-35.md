## Epic 35 — v1.0.1 Release Polish

**Status: Approved**

**Objective**
Correct all translation quality issues across every supported locale, fix a score-input focus regression that prevents fluid digit entry, and advance the application version to 1.0.1.

**In scope**
- correction of all French locale strings for missing apostrophes and accented characters, including the specific mistranslation "Non posee actuellement." → "Non possédée actuellement."
- audit and correction of all other supported locales for equivalent character encoding and translation quality problems
- identification and addition of translations for every user-facing string not yet localised in any supported locale
- fix to the score input field to retain keyboard focus between successive keystrokes during score entry
- version bump to 1.0.1 in `package.json` and in every UI surface that displays the application version

**Stories**
1. **Audit and correct all French locale strings for missing apostrophes, accented characters, and the mistranslation of "Non posee actuellement."**
2. **Audit all other supported locales for equivalent character encoding and translation quality issues**
3. **Identify and supply translations for every user-facing string missing a localised equivalent in any supported locale**
4. **Fix the score input field to retain keyboard focus after each keystroke during score entry**
5. **Bump the application version to 1.0.1 in `package.json` and in every UI surface that displays it**

**Acceptance Criteria**
- Story 1: All French locale strings containing apostrophes or accented characters render correctly in the UI; the phrase "Non possédée actuellement." appears in the French locale resource and displays wherever collection-ownership absence is communicated; no raw ASCII substitutes remain visible in French.
- Story 2: Every supported locale other than French is audited; any apostrophe, encoding, or obvious quality error found is corrected; if no issues are found, a brief comment in the locale file records the audit result.
- Story 3: No user-facing string in any tab or panel falls back to an alternate locale or renders a raw translation key; every string in the English and French locales resolves to a visible, human-readable translation.
- Story 4: Entering a score digit in the score input field does not move keyboard focus away from the field; successive digits can be typed without the user needing to click the field between keystrokes.
- Story 5: The version string "1.0.1" is present in `package.json` and is rendered wherever the application version is displayed in the UI; no reference to "1.0.0" remains visible on any production surface.
