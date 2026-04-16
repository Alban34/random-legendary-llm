## Epic 12 — Score Logging and Results History

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 12 work complete

### Story 12.1 — Define a post-game result model that extends the existing game record safely
- [x] Define fields for score, outcome, completion state, and optional notes
- [x] Decide whether result data is stored in the same record or a linked structure
- [x] Define validation rules for incomplete, partial, or corrected results
- [x] Preserve compatibility with history entries created before score support exists
- [x] **Test:** verify the result model accepts valid states and rejects invalid combinations
- [x] **QC (Automated):** automate QC coverage for representative valid and invalid result-entry states

### Story 12.2 — Add score and outcome entry to the accepted game workflow
- [x] Add UI for recording win/loss and score after a setup is accepted or completed
- [x] Decide whether result entry is immediate, deferred, or both
- [x] Prevent invalid score submission and incomplete required fields
- [x] Keep the flow understandable when users skip result entry intentionally
- [x] **Test:** verify the result-entry flow supports save, skip, and cancel paths correctly
- [x] **QC (Automated):** automate QC coverage for keyboard-only score entry and validation messaging

### Story 12.3 — Persist score history alongside setup history without breaking existing saved state
- [x] Extend storage loading and saving for result data
- [x] Add migration or fallback handling for saved states without score fields
- [x] Keep corruption recovery behavior safe if result data is malformed
- [x] Ensure result persistence does not mutate unrelated state slices
- [x] **Test:** verify save/load roundtrips for records with and without result data
- [x] **QC (Automated):** automate QC coverage for upgrading an older saved state into the richer history model

### Story 12.4 — Render score and outcome summaries in the History experience
- [x] Display outcome state clearly in each game record
- [x] Display score information consistently when present
- [x] Distinguish pending-result records from completed-result records
- [x] Preserve readability for long history lists and compact layouts
- [x] **Test:** verify history rendering for win, loss, pending, and corrected-result records
- [x] **QC (Automated):** automate QC coverage for mixed history entries across desktop and mobile layouts

### Story 12.5 — Support editing or correcting a logged result after the initial save
- [x] Add edit affordances for previously logged results
- [x] Preserve audit-safe behavior for corrected values without duplicating records unintentionally
- [x] Recompute derived views after a result edit
- [x] Confirm destructive or overwriting edits appropriately if needed
- [x] **Test:** verify editing a result updates the stored record and derived views without duplication
- [x] **QC (Automated):** automate QC coverage for correcting a result and seeing the update reflected immediately in history

---
