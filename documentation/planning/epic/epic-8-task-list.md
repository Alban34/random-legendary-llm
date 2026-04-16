## Epic 8 — History, Usage, and Reset Experience

### Story 8.1 — Render per-category freshness and usage indicators
- [x] Show never-played counts per category
- [x] Show clear labels for reset actions
- [x] Explain least-played fallback in the UI
- [x] **Test:** verify indicators reflect actual usage stats from persisted state
- [x] **QC (Automated):** automate QC coverage for indicator changes after several accepted games

### Story 8.2 — Render accepted game history in newest-first order
- [x] Render summary rows for history records
- [x] Resolve IDs back to display names
- [x] Show player count and mode metadata
- [x] **Test:** verify history ordering, label resolution, and summary metadata
- [x] **QC (Automated):** automate QC coverage for history readability with multiple accepted games

### Story 8.3 — Expand and collapse history records
- [x] Add expandable history item behavior
- [x] Show full setup details inside expanded items
- [x] **Test:** verify expand/collapse works correctly for multiple history entries
- [x] **QC (Automated):** automate QC coverage for one collapsed and one expanded entry on mobile and desktop widths

### Story 8.4 — Reset a single category of usage stats
- [x] Add reset button for heroes
- [x] Add reset button for masterminds
- [x] Add reset button for villain groups
- [x] Add reset button for henchman groups
- [x] Add reset button for schemes
- [x] **Test:** verify each category reset affects only its own usage stats and indicators
- [x] **QC (Automated):** automate QC coverage for at least two category resets after accepted games exist

### Story 8.5 — Reset the full application state with confirmation
- [x] Add full reset action
- [x] Show confirmation modal
- [x] Clear collection, usage, history, and preferences on confirm
- [x] **Test:** verify full reset clears all persisted state only after confirmation
- [x] **QC (Automated):** automate QC coverage to confirm the app returns to a clean initial state after reset

---
