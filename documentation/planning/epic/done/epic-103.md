# Epic 103 — Fix: multiplayer game result stuck at pending status

## Objective
Resolve the critical defect where history records with two or more players (`playerCount >= 2`) never have their `result.status` updated from `pending` to `completed` after a game result is saved.

## In scope
- Identify the exact code path in `result-utils.ts`, `history-vm.svelte.ts`, and/or `state-store.ts` that prevents the status transition for `playerCount >= 2`
- Apply the minimal targeted fix with no changes to unrelated logic
- Add failing-first unit tests that reproduce the bug and confirm the fix
- Verify all three outcomes (win, loss, draw) work correctly for 2-player and 3-player records after the fix

## Stories

### Story 103.1 — Add a failing unit test that reproduces the multiplayer pending bug
Write a unit test that drives a complete result-save path for a record with `playerCount = 2`, selects a valid outcome, and asserts that the resulting record's `result.status` equals `'completed'`. The test must fail when run against the unfixed code so it serves as a regression guard.

### Story 103.2 — Identify and fix the root cause of the status not transitioning to `completed`
Trace the execution path from `validateGameResultDraft` through `updateGameResult` and `createCompletedGameResult` for a multiplayer record. Apply the minimal change required so that saving a result for any record with `playerCount >= 2` produces `result.status === 'completed'` with the correct `outcome` value. No unrelated logic should change.

### Story 103.3 — Extend test coverage for win, loss, and draw outcomes in multiplayer records
Add or expand unit tests to assert that all three outcome values (`win`, `loss`, `draw`) produce a `completed` result for 2-player records, plus at least one test with `playerCount = 3`. Include the edge case where no scores are entered for a `loss` or `draw` outcome (scores are optional for those two outcomes).

### Story 103.4 — Confirm all pre-existing result-related tests still pass after the fix
Run the full unit test suite for the result pipeline (`result-utils.test.ts`, `state-store` result paths) and confirm no existing test regresses. Lint must also pass.

## Acceptance Criteria
- Story 103.1: A new failing test exists in the appropriate test file, names the regression clearly, and fails before the fix is applied.
- Story 103.2: After the fix, saving a result for any `playerCount >= 2` record persists `result.status === 'completed'` and the correct `outcome`. No test that existed before this epic regresses.
- Story 103.3: Tests exist for `win`, `loss`, and `draw` with `playerCount = 2`, and at least one test uses `playerCount = 3`. All pass.
- Story 103.4: The full unit test suite and lint pass with no modifications to any pre-existing test.
