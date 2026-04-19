# Epic 59 — Draw Outcome: Task List

**Dependency notice:** Epic 59 must be implemented after Epic 58 completes. Both epics touch `result-utils.mjs`, `HistoryTab.svelte`, and `history-vm.svelte.js`. Do not begin implementation until Epic 58 is merged.

---

## Story 1 — Add `draw` as a valid outcome constant and update result sanitisation to accept and validate it

**Files:** `src/app/result-utils.mjs`, `test/epic12-score-history.test.mjs` (or nearest result/history test file)

- [x] In `result-utils.mjs`, locate `GAME_OUTCOME_OPTIONS` (and/or `OUTCOMES`) and add `'draw'` as a valid entry alongside `'win'` and `'loss'`.
- [x] In `sanitizeResult()` in `result-utils.mjs`, extend the outcome validation branch that handles `'loss'` to also handle `'draw'`: score is optional — `null` is accepted, and any integer `≥ 0` is accepted; a negative score must throw a validation error.
- [x] Confirm that the existing `'win'` validation path (score required and `≥ 0`) is not affected by the change.
- [x] Confirm that the existing `'loss'` validation path (score optional: `null` or `≥ 0`) is not affected by the change.
- [x] Verify that calling `sanitizeResult({ outcome: 'draw', score: null })` returns a valid result object with `outcome === 'draw'` and `score === null`.
- [x] Verify that calling `sanitizeResult({ outcome: 'draw', score: 5 })` returns a valid result object with `outcome === 'draw'` and `score === 5`.
- [x] Verify that calling `sanitizeResult({ outcome: 'draw', score: -1 })` throws a validation error (same behaviour as `'loss'` with a negative score).
- [x] Verify that calling `sanitizeResult({ outcome: 'invalidvalue' })` still throws a validation error (unrecognised outcome remains rejected).
- [x] Test: Add unit test cases to `test/epic12-score-history.test.mjs` (or equivalent) covering: (a) `sanitizeResult` accepts `draw` + `null` score, (b) accepts `draw` + `score ≥ 0`, (c) rejects `draw` + negative score, and (d) `GAME_OUTCOME_OPTIONS`/`OUTCOMES` includes `'draw'`.
- [x] QC (Automated): run `npm run lint && npm test` and confirm all pass.

---

## Story 2 — Render the Draw option in the outcome selector and handle it in the result editor reactive state

**Files:** `src/components/HistoryTab.svelte`, `src/app/history-vm.svelte.js`

- [x] In `HistoryTab.svelte`, locate the outcome `<select>` element that contains the Win and Loss `<option>` elements.
- [x] Add a third `<option value="draw">Draw</option>` inside that `<select>`, positioned after Loss (or in the order Win / Loss / Draw — match whatever order existing options follow).
- [x] Confirm the `<option>` value string is exactly `'draw'` (lowercase) to match the constant added in Story 1.
- [x] In `history-vm.svelte.js`, locate the reactive logic that handles the editor state when `outcome` changes (e.g. the section that decides whether the score input is required or optional).
- [x] Extend that logic so that when `outcome === 'draw'` the score field is treated as optional (same UX behaviour as `outcome === 'loss'`): the score input must not carry a `required` attribute or equivalent reactive constraint.
- [x] Verify in `HistoryTab.svelte` that the score input's `required` binding (or equivalent reactive expression) covers `'draw'` in the same branch as `'loss'` — i.e. score is only required when `outcome === 'win'`.
- [x] Confirm that selecting "Draw" in the outcome selector and saving the record persists `result.outcome === 'draw'` in the stored game record (trace through the save handler in `history-vm.svelte.js` to confirm `outcome` value is passed through `sanitizeResult` and stored without transformation).
- [x] Confirm that switching from Draw to Win correctly reinstates the score-required constraint in the editor UI.
- [x] Test: Manually trace through the state transitions (Win → Draw → Loss → Win) in `history-vm.svelte.js` and verify the score-optional flag is correct at each step; document the trace in a code comment or a dedicated test assertion covering the `isScoreOptional` (or equivalent) computed value for all three outcomes.
- [x] QC (Automated): run `npm run lint` and confirm it passes (no lint errors introduced in `HistoryTab.svelte` or `history-vm.svelte.js`).

---

## Story 3 — Display draw outcomes in History tab game cards and add locale strings for the draw label across all six locale files

**Files:** `src/components/HistoryTab.svelte`, `src/app/locales/en.mjs`, `src/app/locales/fr.mjs`, `src/app/locales/de.mjs`, `src/app/locales/es.mjs`, `src/app/locales/ja.mjs`, `src/app/locales/ko.mjs`

### 3a — Game card display

- [x] In `HistoryTab.svelte`, locate the game card template that renders the outcome label for a saved game (the element that currently shows "Win" or "Loss").
- [x] Extend the outcome-label logic to include a third branch: when `result.outcome === 'draw'`, render the draw label retrieved from the active locale via the `t()` helper (e.g. `t('outcome_draw')` — use the same key chosen in 3b below).
- [x] Confirm that game cards with `result.outcome === 'win'` still show the win label and cards with `result.outcome === 'loss'` still show the loss label — no regression.
- [x] Confirm that a raw locale key (e.g. `outcome_draw`) never appears as visible text in the UI; if the `t()` call falls back to the key itself, there is a missing locale entry that must be fixed before the story is marked done.

### 3b — English locale file (canonical key schema)

- [x] In `src/app/locales/en.mjs`, add a new entry to `EN_MESSAGES` with key `outcome_draw` and value `'Draw'`.
- [x] Confirm the key name `outcome_draw` is consistent with any existing outcome label keys in `EN_MESSAGES` (e.g. `outcome_win`, `outcome_loss`); if existing keys use a different naming pattern, align `outcome_draw` to that pattern and update all locale tasks below accordingly.

### 3c — French locale file

- [x] In `src/app/locales/fr.mjs`, add the same key `outcome_draw` with an appropriate French translation (e.g. `'Égalité'` or `'Nul'`).
- [x] Confirm no ICU-style placeholders are needed for this key (it is a plain label).

### 3d — German locale file

- [x] In `src/app/locales/de.mjs`, add key `outcome_draw` with an appropriate German translation (e.g. `'Unentschieden'`).

### 3e — Spanish locale file

- [x] In `src/app/locales/es.mjs`, add key `outcome_draw` with an appropriate Spanish translation (e.g. `'Empate'`).

### 3f — Japanese locale file

- [x] In `src/app/locales/ja.mjs`, add key `outcome_draw` with an appropriate Japanese translation (e.g. `'引き分け'`).

### 3g — Korean locale file

- [x] In `src/app/locales/ko.mjs`, add key `outcome_draw` with an appropriate Korean translation (e.g. `'무승부'`).

### 3h — Verification

- [x] Confirm all six locale files (`en`, `fr`, `de`, `es`, `ja`, `ko`) contain a non-empty string value for `outcome_draw`.
- [x] Confirm the key name is spelled identically in all six files.
- [x] Confirm that the `t('outcome_draw')` call in `HistoryTab.svelte` resolves to a non-empty string in every supported locale.
- [x] Test: Add test assertions (in `test/epic12-score-history.test.mjs` or the nearest locale/history test file) confirming: (a) a rendered game card with `outcome === 'draw'` contains the localised draw label (not the raw key), (b) all six locale message objects include the `outcome_draw` key with a non-empty value.
- [x] QC (Automated): run `npm run lint && npm test` and confirm all pass.
