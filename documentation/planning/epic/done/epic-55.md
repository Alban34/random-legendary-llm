## Epic 55 — Remove Internal Terminology from User-Facing Strings

**Objective**
Replace every occurrence of internal development labels (e.g. "Epic 1", "Epic 3", "Epic 1–10") in user-visible locale strings with plain, meaningful language that makes sense to an end user who has no knowledge of the project's development history.

**Background**
The localization files under `src/app/locales/` contain at least four string keys that reference "Epic N" labels drawn from the project's internal planning workflow. These labels are visible to end users in the setup-preview notice and the About panel. The affected keys, present across all six locale files (en, fr, de, es, ja, ko), are: `newGame.generator.previewNotice`, `about.testResults`, `about.failedInit`, and `about.loadedOk`.

**In scope**
- Audit every locale file in `src/app/locales/` and catalogue all strings that contain "Epic" followed by a number or number range
- Rewrite each affected string in all six locale files (en, fr, de, es, ja, ko) using plain language that conveys the same information without exposing internal planning labels
- Verify no "Epic N" pattern remains visible in the rendered UI: the setup-generator preview notice and the About panel are the primary surfaces to check

**Out of scope**
- Renaming or restructuring locale string keys
- Changes to strings that do not contain internal development terminology
- Rewording strings for tone or style beyond removing the "Epic N" labels
- Audit of `.svelte` component templates (the "Epic N" strings live exclusively in locale files)

**Stories**
1. **Audit all six locale files and produce a complete list of strings containing internal Epic labels**
2. **Rewrite each affected string in all six locale files with plain user-facing language**
3. **Verify the setup-preview notice and About panel render no internal terminology in any supported locale**

**Acceptance Criteria**
- Story 1: A complete list of affected string keys and their current values is documented (inline in this file or in a linked note); no key is missed across any of the six locale files.
- Story 2: None of the six locale files contain the pattern `Epic \d` or `Epic-\d` in any string value; each rewritten string conveys the same intent as the original without referencing project-internal labels; a native speaker or translator review note confirms the rewrites are natural in each language.
- Story 3: Loading the app in each supported locale and navigating to (a) the New Game tab with a generated setup and (b) the About panel shows no "Epic" label in any rendered text; `npm run lint` passes.
