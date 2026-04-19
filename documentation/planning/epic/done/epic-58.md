## Epic 58 — Per-Player Scores in Multiplayer

**Objective**
Allow players to record an individual score and optional name for each participant in a multiplayer game, so that the history log reflects who scored what, while keeping the single game-level win/loss outcome entry unchanged.

**Background**
The current result data shape stores `score` as a single integer regardless of player count. In multiplayer games (2–5 players), Legendary scoring is personal — each player accumulates their own VP total. The `playerCount` field in the game record already captures the number of participants as an integer, but no per-player data exists beyond that count. Extending `score` to an array of `{ playerName, score }` objects for multiplayer games (while keeping it a single number for solo) requires coordinated changes across `result-utils.mjs`, `state-store.mjs`, `history-vm.svelte.js`, `HistoryTab.svelte`, and the history display. The outcome (`win`/`loss`) remains a single game-level judgment and is not affected.

**In scope**
- Extend the result data shape: for games with `playerCount ≥ 2`, `score` becomes an array of `{ playerName: string, score: number | null }` objects (one entry per player); for `playerCount = 1`, `score` remains `number | null` — no change
- Update `createResult()` and `sanitizeResult()` in `result-utils.mjs` to produce and validate the per-player score array for multiplayer; a non-array `score` for `playerCount ≥ 2` must be treated as invalid
- Update `updateGameResult()` in `state-store.mjs` to persist and retrieve the new shape correctly; solo game records must be unaffected
- Render a per-player score entry panel in the result editor (`HistoryTab.svelte`): one row per player, each containing a name text input (placeholder "Player N") and a score number input; the panel replaces the single-score input only when `playerCount ≥ 2`
- Player names are optional; an empty name field falls back silently to the "Player N" placeholder label for display purposes
- Display per-player scores in History tab game cards for multiplayer games (e.g. "Alice: 42 · Bob: 35"); solo game cards continue to show a single score value
- Update `history-vm.svelte.js` reactive editor state to manage per-player score arrays

**Out of scope**
- Sorting players by score or automatically determining a winner from per-player scores
- Per-player score aggregation or display in the Stats tab
- Score-based leaderboards or persistent player-name profiles across sessions
- Changes to the win/loss outcome entry — that remains a single game-level field
- Locale changes beyond labels required for the per-player score row UI (e.g. "Player N" placeholder)

**Stories**
1. **Extend the result data shape and update `result-utils.mjs` to produce and validate per-player score arrays for multiplayer games**
2. **Update `state-store.mjs` to persist and retrieve the per-player score shape for multiplayer game records**
3. **Render the per-player score entry rows in the result editor for multiplayer games**
4. **Display per-player scores in the History tab game cards**

**Acceptance Criteria**
- Story 1: `createResult()` called with `playerCount ≥ 2` produces a `score` value that is an array of `{ playerName: string, score: number | null }` objects with length equal to `playerCount`; `sanitizeResult()` rejects a non-array `score` for `playerCount ≥ 2` and a non-numeric (non-null for loss) `score` for `playerCount = 1`; existing solo result tests are unaffected; `npm run lint` passes.
- Story 2: Calling `updateGameResult()` with a per-player score array for a multiplayer game persists the array and returns it correctly on subsequent reads; solo game records continue to store and retrieve a single `number | null` score; `npm run lint` and `npm test` pass.
- Story 3: When `playerCount ≥ 2` and the result editor is open, the score section renders one row per player, each with a name text input and a score number input; changing a name or score in any row updates only the corresponding entry in the editor state; the single-score input is not rendered for multiplayer games; `npm run lint` passes.
- Story 4: History tab game cards for multiplayer games display each player's name (or the "Player N" fallback) alongside their score; solo game cards are unaffected and continue to display a single score value; `npm run lint` passes.
