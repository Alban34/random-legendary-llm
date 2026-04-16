## Epic 37 — v1.0.2 Small Improvement Release

**Status: Approved**

**Objective**
Close the remaining localization gaps across all six supported locales, make score display locale-aware, remove a stale test script, and ship as v1.0.2.

**In scope**
- completing translations for de-DE, ja-JP, ko-KR, and es-ES, and auditing fr-FR, so every key in `EN_MESSAGES` has a proper per-locale translation with no English fallback
- replacing the hardcoded English `"Score {n}"` pattern in `result-utils.mjs` with a localized label and locale-aware number formatting
- removing the stale `test:epic10` npm script that references a unit test file which does not exist
- bumping the `package.json` version field from `1.0.1` to `1.0.2`
- fixing the five-player setup template in `src/app/setup-rules.mjs` to require 5 Villain Groups instead of 4

**Stories**
1. **Complete translations for all supported locales**
2. **Make score display locale-aware**
3. **Remove the stale `test:epic10` script from `package.json`**
4. **Bump version to 1.0.2**
5. **Fix five-player setup to use 5 Villain Groups**

**Acceptance Criteria**
- Story 1: Every key present in the `EN_MESSAGES` object is also present in the de-DE, ja-JP, ko-KR, es-ES, and fr-FR locale message objects with a genuine translation (not an English fallback string); no locale falls back to English for strings added in Epics 5–27; the `header.locale.fallbackNotice` key is retained in all locales.
- Story 2: The score string in `result-utils.mjs` no longer uses a hardcoded English `"Score"` label; the label is sourced from the localization system and rendered in the active locale; the score number is formatted using locale-aware numeric conventions (e.g. `Intl.NumberFormat` or equivalent); the formatted output is verified for at least two locales (e.g. `en-US` and `de-DE`) in the unit test suite.
- Story 3: The `test:epic10` key is absent from the `scripts` section of `package.json`; the `test:qc:epic10` Playwright script remains untouched; running `npm run test:epic10` produces a "missing script" error rather than a file-not-found failure.
- Story 4: The `version` field in `package.json` reads `"1.0.2"`; the running application displays `1.0.2` in the UI version badge without any additional code changes, relying on the Vite build-time injection introduced in Epic 36.
- Story 5: A 5-player game setup requires exactly 5 Villain Groups, consistent with the official Legendary printed rules; the change is made in `src/app/setup-rules.mjs`; all other player-count templates (1–4 players) remain unchanged.

---
