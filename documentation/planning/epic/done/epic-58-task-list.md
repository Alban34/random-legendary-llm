# Epic 58 — Per-Player Scores in Multiplayer: Task List

> **SERIALIZATION NOTE**: Epic 58 must be fully implemented and merged before Epic 59 begins.
> Both epics touch `result-utils.mjs`, `HistoryTab.svelte`, and `history-vm.svelte.js`.
> Concurrent work on these files across epics will produce merge conflicts.

---

## Background / Data Shape Contract

For games with `playerCount = 1` (solo / advanced-solo), `result.score` stays `number | null` — **no change**.

For games with `playerCount ≥ 2` (multiplayer), `result.score` becomes an **array** of objects:

```js
[
  { playerName: string, score: number | null },
  // … one entry per player
]
```

- `playerName` is optional (empty string is valid); display falls back to "Player N" when blank.
- `score` per entry may be `null` (not yet entered or a loss with no score).
- The game-level `outcome` (`win`/`loss`) is unaffected by this change.

---

## Story 1 — Extend the result data shape and update `result-utils.mjs`

**Files:** `src/app/result-utils.mjs`, `test/epic12-score-history.test.mjs`

### Tasks

- [ ] **1.1 — Add `createPlayerScoreEntry()` helper in `result-utils.mjs`**
  - Add a new exported helper:
    ```js
    export function createPlayerScoreEntry({ playerName = '', score = null } = {}) { … }
    ```
  - `playerName` is trimmed and stored as a string (empty string allowed).
  - `score` is validated with the existing `normalizeScore()` helper; invalid values fall back to `null`.

- [ ] **1.2 — Add `createPerPlayerScoreArray(playerCount)` helper in `result-utils.mjs`**
  - Accepts an integer `playerCount ≥ 2`.
  - Returns an array of `playerCount` objects, each `{ playerName: '', score: null }`.
  - Used as the default `score` value when initialising a new pending result for a multiplayer game.

- [ ] **1.3 — Update `createCompletedGameResult()` to handle per-player score arrays**
  - Signature change: add `playerCount` parameter (default `1`).
  - When `playerCount ≥ 2` and `score` is an array:
    - Each entry is normalised through `createPlayerScoreEntry()`.
    - For `outcome === 'win'`, throw if every entry's `score` is `null` (at least one player must have a score).
    - For `outcome === 'loss'`, allow all `score` values to be `null`.
  - When `playerCount ≥ 2` and `score` is **not** an array, throw:
    `'Per-player score array is required for multiplayer games.'`
  - When `playerCount = 1`, existing behaviour is unchanged (score is `number | null`).

- [ ] **1.4 — Update `sanitizeStoredGameResult()` to validate per-player score shape**
  - After the existing status/outcome checks, inspect `candidate.score`:
    - If the record's `playerCount ≥ 2` and `candidate.score` is not an array → set `recovered: true`, return a pending result.
    - If `playerCount ≥ 2` and `candidate.score` is an array, sanitize each entry through `createPlayerScoreEntry()`; entries with unrecognisable shapes are reset to `{ playerName: '', score: null }`.
    - If `playerCount = 1`, existing `normalizeScore()` path is unchanged.
  - Pass `playerCount` through to `createCompletedGameResult()`.

- [ ] **1.5 — Update `normalizeGameResultDraft()` to produce per-player draft array**
  - Add `playerCount` parameter (default `1`).
  - When `playerCount ≥ 2` and `result.score` is an array:
    - Return `{ outcome, playerScores: result.score.map(e => ({ playerName: e.playerName, score: e.score !== null ? String(e.score) : '' })), notes }`.
  - When `playerCount = 1`, return the existing `{ outcome, score, notes }` shape unchanged.

- [ ] **1.6 — Update `validateGameResultDraft()` to validate per-player draft array**
  - Add `playerCount` parameter (default `1`).
  - When `playerCount ≥ 2`:
    - Expect `draft.playerScores` to be an array of length `playerCount`.
    - Each entry's `score` string is validated as a non-negative integer or empty.
    - For `outcome === 'win'`, at least one entry must have a non-empty score string; push an error if all are empty.
    - On success, call `createCompletedGameResult()` with the mapped `{ playerName, score }` array and `playerCount`.
  - When `playerCount = 1`, existing path is unchanged.

- [ ] **1.7 — Update `formatGameResultStatus()` to format per-player scores for display**
  - When `result.score` is an array (multiplayer), produce a string of the form:
    `"Win · Alice: 42 · Bob: 35"` (or `"Player 1: 42 · Player 2: 35"` for unnamed players).
  - Fallback label for a blank `playerName` is `"Player N"` where N is the 1-based index.
  - When `result.score` is `null` or a number, existing path is unchanged.

- [ ] **Test: Add unit tests in `test/epic12-score-history.test.mjs`**
  - `createCompletedGameResult()` with `playerCount: 2` and a valid score array produces `score` as an array.
  - `createCompletedGameResult()` with `playerCount: 2` and a non-array `score` throws.
  - `createCompletedGameResult()` with `playerCount: 2`, `outcome: 'win'`, and all `score: null` entries throws.
  - `createCompletedGameResult()` with `playerCount: 2`, `outcome: 'loss'`, and all `score: null` succeeds.
  - `sanitizeStoredGameResult()` with a stored record where `playerCount: 2` and `score` is a number returns a pending result with `recovered: true`.
  - `sanitizeStoredGameResult()` with a valid per-player array round-trips correctly.
  - All existing solo result tests continue to pass without modification.
  - `normalizeGameResultDraft()` with `playerCount: 2` produces `playerScores` array.
  - `validateGameResultDraft()` with `playerCount: 2` validates each player entry independently.
  - `formatGameResultStatus()` with a per-player score array renders the expected "Outcome · Name: Score" string.

- [ ] **QC (Automated): run `npm run lint && npm test` and confirm all pass**

---

## Story 2 — Update `state-store.mjs` to persist and retrieve the per-player score shape

**Files:** `src/app/state-store.mjs`, `test/epic12-score-history.test.mjs`

### Tasks

- [ ] **2.1 — Update `updateGameResult()` signature to accept `playerCount`**
  - Current signature: `updateGameResult(state, { recordId, outcome, score, notes, updatedAt })`
  - New signature: `updateGameResult(state, { recordId, outcome, score, notes, updatedAt, playerCount })`
  - Derive `playerCount` from the target record's `playerCount` field (fall back to the passed parameter if provided, then default `1`).
  - Pass `playerCount` to `createCompletedGameResult()` so multiplayer records receive an array and solo records receive a number.

- [ ] **2.2 — Update `sanitizeGameRecord()` (private) to pass `playerCount` to `sanitizeStoredGameResult()`**
  - `sanitizeStoredGameResult()` now requires `playerCount` context so it can validate the score shape.
  - Pass `record.playerCount` when calling `sanitizeStoredGameResult(record.result, record.playerCount)`.
  - Adjust `sanitizeStoredGameResult()` signature in `result-utils.mjs` (Story 1.4) accordingly — or pass `playerCount` as a second argument.

- [ ] **2.3 — Ensure `createGameRecord()` initialises a per-player `score` array for multiplayer pending records**
  - `createPendingGameResult()` currently returns `score: null`.
  - When `createGameRecord()` is called with `playerCount ≥ 2`, override the pending result's `score` to `createPerPlayerScoreArray(playerCount)` from `result-utils.mjs`.
  - Solo records (`playerCount = 1`) are unaffected.

- [ ] **2.4 — Verify round-trip serialisation via `loadState` / `saveState`**
  - A multiplayer game record with a per-player score array must survive JSON serialise → deserialise → `sanitizeStateCandidate()` without triggering a recovery notice.
  - A solo game record must continue to survive the same round-trip unchanged.

- [ ] **Test: Add integration tests in `test/epic12-score-history.test.mjs`**
  - Call `updateGameResult()` on a 2-player record with a per-player score array; assert the stored record's `result.score` is an array of length 2.
  - Call `updateGameResult()` on a solo record with a number score; assert `result.score` remains a number.
  - Call `loadState()` with a serialised state containing a 3-player record with a valid per-player array; assert no recovery notices and score is an array of length 3.
  - Call `loadState()` with a serialised state containing a 2-player record with `score: 42` (invalid for multiplayer); assert recovery notice is emitted and score is reset to pending.
  - All pre-existing solo round-trip tests pass without modification.

- [ ] **QC (Automated): run `npm run lint && npm test` and confirm all pass**

---

## Story 3 — Render per-player score entry rows in the result editor

**Files:** `src/app/history-vm.svelte.js`, `src/components/HistoryTab.svelte`

### Tasks

- [ ] **3.1 — Extend `_resultDraft` state in `history-vm.svelte.js` to hold `playerScores`**
  - Current shape: `{ outcome: '', score: '', notes: '' }`
  - New shape for multiplayer drafts: `{ outcome: '', playerScores: [{ playerName: '', score: '' }, …], notes: '' }`
  - `resetResultDraft()` continues to reset to `{ outcome: '', score: '', notes: '' }` (solo default).
  - Add `resetResultDraftForPlayerCount(playerCount)`: if `playerCount ≥ 2`, resets with `playerScores` array of length `playerCount`; if `playerCount = 1`, resets with `score: ''`.

- [ ] **3.2 — Add `setResultPlayerScore(index, value)` and `setResultPlayerName(index, value)` exports in `history-vm.svelte.js`**
  - `setResultPlayerScore(index, value)`: updates `_resultDraft.playerScores[index].score` to the provided string value; other entries are unchanged.
  - `setResultPlayerName(index, value)`: updates `_resultDraft.playerScores[index].playerName` to the trimmed string; other entries are unchanged.
  - Both functions are no-ops if `_resultDraft.playerScores` is not an array or the index is out of range.

- [ ] **3.3 — Wire `resetResultDraftForPlayerCount()` into `editGameResult` action in `HistoryTab.svelte`**
  - When the result editor opens for a record (`historyActions.editGameResult(recordId)`), determine the record's `playerCount`.
  - Call `resetResultDraftForPlayerCount(playerCount)` (or `normalizeGameResultDraft(result, playerCount)`) to pre-populate the draft with the existing result data or an empty array for a new multiplayer result.

- [ ] **3.4 — Conditionally render per-player rows instead of the single score input in `HistoryTab.svelte`**
  - The existing single-score `<input>` block (lines ~217–230, `data-result-field="score"`) must only render when `summary.playerCount === 1`.
  - When `summary.playerCount ≥ 2`, render an `{#each resultDraft.playerScores as entry, i}` block instead, with one row per player containing:
    - A `<label>` reading `locale.t('history.resultEditor.playerName', { n: i + 1 })` (or fallback `"Player {n}"` until locale key is wired).
    - A `<input type="text">` for the player name, `placeholder="Player {i+1}"`, bound to `historyActions.setResultPlayerName(i, e.target.value)`.
    - A `<input type="number" min="0" step="1" inputmode="numeric">` for the player score, bound to `historyActions.setResultPlayerScore(i, e.target.value)`.
  - `data-result-field="player-score-{i}"` and `data-result-field="player-name-{i}"` attributes must be present on the respective inputs for Playwright selectors.

- [ ] **3.5 — Ensure validation error display works for per-player rows**
  - `resultInvalidFields` may now contain entries like `'player-score-0'`, `'player-score-1'`, etc.
  - `aria-invalid` must be set on the corresponding player score input when its field name appears in `resultInvalidFields`.
  - The existing `scoreInvalid` local variable and single-score `aria-invalid` binding are removed or guarded behind `playerCount === 1`.

- [ ] **3.6 — Update `historyActions.saveGameResult` call path to pass `playerCount`**
  - When `validateGameResultDraft()` is called on save, pass `playerCount: summary.playerCount` so the per-player validation path is triggered for multiplayer games.

- [ ] **Test: Add a Playwright test (or update `test/epic7-new-game-experience.test.mjs` / `epic12`) for Story 3 UI contract**
  - Open the result editor for a 2-player history record.
  - Assert two player name inputs and two player score inputs are rendered.
  - Assert the single-score `<input>` with `data-result-field="score"` is **not** present.
  - Enter a name and score for each player; save; assert the record in state has `result.score` as a 2-entry array.
  - Open the result editor for a solo record; assert the single-score input is present and no per-player rows exist.

- [ ] **QC (Automated): run `npm run lint && npm test` and confirm all pass**

---

## Story 4 — Display per-player scores in History tab game cards

**Files:** `src/app/history-utils.mjs`, `src/components/HistoryTab.svelte`

### Tasks

- [ ] **4.1 — Update `formatHistorySummary()` in `history-utils.mjs` to populate `perPlayerScoreLabel`**
  - Current: `scoreLabel` is a single string (`"Score 42"`) or `null`.
  - Add a new field `perPlayerScoreLabel: string | null` to the summary object:
    - When `record.playerCount ≥ 2` and `result.score` is an array with at least one non-null entry:
      - Map each entry to `"PlayerName: score"` (use `"Player N"` if `playerName` is blank); join with `" · "`.
      - Set `perPlayerScoreLabel` to the resulting string.
    - Otherwise, `perPlayerScoreLabel` is `null`.
  - Existing `scoreLabel` field continues to populate for solo (`playerCount = 1`) records; it is `null` for multiplayer records.

- [ ] **4.2 — Render `perPlayerScoreLabel` in the History tab game card in `HistoryTab.svelte`**
  - In the card body `<div class="history-meta">` block, after the existing result line:
    - When `summary.perPlayerScoreLabel` is truthy, render a `<div class="history-meta">` containing it (e.g., `<strong>Scores</strong> Alice: 42 · Bob: 35`).
  - This block must not render for solo records.
  - Use `data-history-per-player-scores` attribute on the element for Playwright selectors.

- [ ] **4.3 — Keep the result pill / `resultLabel` unchanged for multiplayer games**
  - `formatGameResultStatus()` (updated in Story 1.7) now returns a formatted string for multiplayer games.
  - Verify that the result pill still shows correctly in the card summary row (the `<summary>` element) using the updated `resultLabel` from `formatHistorySummary()`.
  - Confirm `formatHistorySummary()` calls `formatGameResultStatus(result)` (which already handles the per-player case after Story 1.7) — no additional changes needed here beyond passing the updated function.

- [ ] **4.4 — Keep solo game card display unchanged**
  - A solo game record must render a single `scoreLabel` line (if `score !== null`) and no `perPlayerScoreLabel` block.
  - Verify existing snapshot / DOM assertions in `test/epic12-score-history.test.mjs` still pass.

- [ ] **Test: Add assertions in `test/epic12-score-history.test.mjs` for Story 4 contract**
  - `formatHistorySummary()` called with a 2-player completed record with a 2-entry score array returns `perPlayerScoreLabel` as a `"Name: score · Name: score"` string.
  - `formatHistorySummary()` called with a 2-player completed record where all scores are `null` returns `perPlayerScoreLabel: null`.
  - `formatHistorySummary()` called with a 2-player record where one `playerName` is blank uses `"Player 1"` / `"Player 2"` fallback labels.
  - `formatHistorySummary()` called with a solo record returns `perPlayerScoreLabel: null` and an unchanged `scoreLabel`.
  - (Playwright) A 2-player history card with scored players shows a `[data-history-per-player-scores]` element with the expected text.
  - (Playwright) A solo history card does **not** show a `[data-history-per-player-scores]` element.

- [ ] **QC (Automated): run `npm run lint && npm test` and confirm all pass**

---

## Cross-cutting Reminders

- No locale keys are required to be translated in this epic beyond the "Player N" placeholder pattern used in the editor UI. If a locale key is added (e.g. `history.resultEditor.playerName`), add it to the English locale source only; other locales may fall back to English until Epic 41 / translator agents populate them.
- Do **not** sort players by score or derive a winner automatically — that is out of scope.
- Do **not** change anything in the Stats tab — per-player aggregation is out of scope.
- `win`/`loss` outcome selection remains a single dropdown — unchanged for all player counts.
- Epic 59 must not begin until this epic's changes are merged and all CI checks are green.
