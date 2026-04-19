## Epic 59 — Draw Outcome

**Objective**
Add a third game outcome — "draw" — so players can record when the mastermind's scheme completes but all players survive, representing a partial defeat that is mechanically distinct from a loss.

**Background**
The current result shape in `result-utils.mjs` recognises only `'win'` and `'loss'` as valid outcome identifiers. In the Legendary card game, a draw occurs when the villain's scheme triggers its final effect but no player is eliminated — a scenario that is neither a standard win nor a standard loss. There is currently no way to record this outcome; players must mislabel it as a loss. A draw should follow the same score rule as a loss (score is optional and may be null or ≥ 0), because not all table groups track scores on a partial defeat. The change requires extending the outcome constant list, updating sanitisation, adding a UI option to the outcome selector in `HistoryTab.svelte`, handling it in `history-vm.svelte.js` reactive state, displaying it correctly in History tab cards, and adding locale strings to all six supported locale files.

**In scope**
- Add `'draw'` to the valid outcome constants (`GAME_OUTCOME_OPTIONS` / `OUTCOMES`) in `result-utils.mjs`
- Update `sanitizeResult()` to accept `outcome: 'draw'` and apply the same score validation rule as `'loss'` (score is optional: `null` or `≥ 0`)
- Add a "Draw" option to the outcome `<select>` in `HistoryTab.svelte`, alongside Win and Loss
- Update `history-vm.svelte.js` to handle `'draw'` in the reactive editor state: selecting Draw sets the score field to optional (same UX as Loss)
- Display draw outcomes in History tab game cards with a distinct label (e.g. "Draw") rather than "Win" or "Loss"
- Add locale strings for the draw outcome label in all six locale files (`en.mjs`, `fr.mjs`, `de.mjs`, `es.mjs`, `ja.mjs`, `ko.mjs`) under a consistent key

**Out of scope**
- Treating draw differently from loss in score calculation, statistics, or the Stats tab
- A draw-specific scoring rule or separate score field
- Restricting the draw outcome to multiplayer-only — draw may be recorded for any player count
- Changes to the win or loss outcome logic

**Stories**
1. **Add `draw` as a valid outcome constant and update result sanitisation to accept and validate it**
2. **Render the Draw option in the outcome selector and handle it in the result editor reactive state**
3. **Display draw outcomes in History tab game cards and add locale strings for the draw label across all six locale files**

**Acceptance Criteria**
- Story 1: The outcome constants in `result-utils.mjs` include `'draw'`; `sanitizeResult()` with `{ outcome: 'draw', score: null }` produces a valid result object; `sanitizeResult()` with `{ outcome: 'draw', score: -1 }` throws a validation error; existing win and loss sanitisation behaviour is unaffected; `npm run lint` and `npm test` pass.
- Story 2: The outcome selector in `HistoryTab.svelte` renders a "Draw" option alongside Win and Loss; selecting Draw sets `outcome` in the editor state to `'draw'` and renders the score input as optional (same UX as Loss — no "required" constraint); selecting Draw and saving persists `result.outcome` as `'draw'` in the game record; `npm run lint` passes.
- Story 3: History tab game cards with `result.outcome === 'draw'` display a distinct "Draw" label (not "Win" or "Loss"); all six locale files contain a non-empty translation for the draw outcome label under a consistent key; no raw locale key appears in the UI when a draw game card is rendered; `npm run lint` passes.
