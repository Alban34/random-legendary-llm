## Epic 71 — Epic Mastermind Difficulty Mode

**Objective**
Introduce "Epic Mastermind" as a selectable difficulty variant for supported expansions (starting with X-Men), surface it as an opt-in control during game setup, store the flag in game history records, display it as a visual indicator on history entries, and add a dedicated grouping mode so players can review all their Epic Mastermind games at a glance.

**Background**
The X-Men expansion (2017) introduced Epic Masterminds — a separate pool of harder mastermind cards that raise the overall difficulty of a game. Future expansions may also include Epic Masterminds. The feature must be gated so it only appears when the player owns at least one supporting expansion. History records are stored as `HistoryRecord` objects in `AppState.history` (`src/app/types.ts`); the history view uses `HISTORY_GROUPING_MODES` in `src/app/history-utils.ts` to organise entries. Locale keys for grouping labels follow the `history.group.*` naming convention.

**In scope**
- typed registry of expansion names that support Epic Mastermind (e.g. `EPIC_MASTERMIND_SUPPORTED_SETS`), with `"X-Men"` as the first entry
- `epicMastermind?: boolean` flag on `HistoryRecord`; the `sanitizeGameRecord` normaliser treats absence as `false`
- generator changes in `src/app/setup-generator.ts` to draw the mastermind exclusively from the Epic Mastermind card pool when the mode is active
- opt-in UI control in the setup view, visible only when the player owns at least one supporting expansion
- visual indicator on history list entries where `epicMastermind` is `true`
- new `{ id: 'epic-mastermind', label: 'Epic Mastermind' }` entry in `HISTORY_GROUPING_MODES` that groups entries into Epic Mastermind and standard games
- locale strings for all new UI copy in all six supported locales (en, fr, de, es, ja, ko)

**Out of scope**
- retroactively tagging pre-existing history records as Epic Mastermind
- combining Epic Mastermind mode with a simultaneously forced individual mastermind pick (may be addressed in a follow-up)
- defining which specific card entries are Epic Masterminds in `canonical-game-data.json` (belongs to the data/catalogue epic for the X-Men expansion)
- changes to scoring or outcome logic

**Stories**

### Story 71.1 — Define the Epic Mastermind variant in the data model
Create a typed constant `EPIC_MASTERMIND_SUPPORTED_SETS` listing expansion names that contain Epic Mastermind cards, with `"X-Men"` as the initial entry and a comment noting how to extend it for future expansions. Add `epicMastermind?: boolean` to the `HistoryRecord` type in `src/app/types.ts`. Update `sanitizeGameRecord` so a missing or invalid value is treated as `false` without corrupting an existing record.

**Test:** Unit tests cover: `sanitizeGameRecord` with `epicMastermind: true`, `false`, `undefined`, and an invalid value; no existing records are altered.

**QC (Automated):** `npm run lint` passes; `npm test` exits 0.

---

### Story 71.2 — Update the setup generator for Epic Mastermind mode
Update `src/app/setup-generator.ts` to draw the mastermind exclusively from the Epic Mastermind card pool within the player's owned supporting expansions when Epic Mastermind mode is active. If no Epic Mastermind card is available (e.g. supporting expansion cards are not yet catalogued), the generator must surface a clear, localised error rather than silently falling back to a standard mastermind.

**Test:** Unit tests cover: Epic Mastermind mode draws only from the Epic pool; error is raised (not swallowed) when no Epic Mastermind card exists; standard mode is unaffected.

**QC (Automated):** `npm run lint` passes; `npm test` exits 0.

---

### Story 71.3 — Add the Epic Mastermind opt-in UI control to setup view
Add an opt-in toggle or selector for Epic Mastermind mode in the setup view. The control is visible only when the player owns at least one expansion in `EPIC_MASTERMIND_SUPPORTED_SETS`. It is absent when no supporting expansion is owned. Enabling the mode is reflected in the next generated setup. Toggling it off restores standard mastermind selection.

**Test:** Playwright tests cover: control visible when supporting expansion owned; control absent when no supporting expansion owned; enabling and disabling the mode changes the generated mastermind type; state survives page reload.

**QC (Automated):** `npm run lint` passes; `npx playwright test` exits 0.

---

### Story 71.4 — Persist and safely read the epicMastermind flag in history records
Ensure every `HistoryRecord` written after this story ships includes the `epicMastermind` boolean. A record written before this feature (without the field) must read back as `epicMastermind: false` without error. No existing history data is altered.

**Test:** Integration tests: write a record with Epic Mastermind enabled; read it back and confirm flag is `true`. Load a legacy record without the field; confirm it reads as `false`. Confirm existing records are untouched.

**QC (Automated):** `npm run lint` passes; `npm test` exits 0.

---

### Story 71.5 — Display Epic Mastermind indicator and history grouping mode
Show a distinct visual indicator (badge, icon, or label) on history list entries where `epicMastermind` is `true`. Add `{ id: 'epic-mastermind', label: 'Epic Mastermind' }` to `HISTORY_GROUPING_MODES` in `src/app/history-utils.ts`. Ensure `normalizeHistoryGroupingMode('epic-mastermind')` returns `'epic-mastermind'`. Selecting this mode in the history view produces at least two groups (Epic Mastermind games and standard games).

**Test:** Playwright tests cover: Epic Mastermind indicator visible on tagged entries and absent on untagged entries; grouping mode present in the sort dropdown; selecting it produces the expected two-group layout.

**QC (Automated):** `npm run lint` passes; `npx playwright test` exits 0.

---

### Story 71.6 — Add and translate locale strings for Epic Mastermind UI
Add all new locale keys for Stories 71.2–71.5 to `src/app/locales/en.mjs`. Keys must cover at minimum: setup toggle label, `history.group.epic-mastermind` grouping label, history entry indicator label, and error message shown when no Epic Mastermind card is available. Translate all new keys into all five other locale files (fr, de, es, ja, ko).

**Test:** No missing-key lint warnings; all six locale files contain every new key.

**QC (Automated):** `npm run lint` passes.

**Acceptance Criteria**
- Story 71.1: `EPIC_MASTERMIND_SUPPORTED_SETS` exists with `"X-Men"` as initial entry; `HistoryRecord` has `epicMastermind?: boolean`; `sanitizeGameRecord` normalises absence to `false` and never corrupts records.
- Story 71.2: Generator draws only from Epic Mastermind pool when mode is active; raises a localised error (does not silently fall back) when no Epic Mastermind card is available.
- Story 71.3: Setup toggle present when supporting expansion owned; absent otherwise; mode change is reflected in the generated setup; state persists.
- Story 71.4: Records written after this story include the boolean; legacy records without the field read as `false`; no data corruption.
- Story 71.5: Indicator visible on `epicMastermind: true` entries; `HISTORY_GROUPING_MODES` includes `epic-mastermind`; grouping mode produces two-group layout.
- Story 71.6: All new locale keys in all six locale files; no missing-key warnings; `npm run lint` passes.
