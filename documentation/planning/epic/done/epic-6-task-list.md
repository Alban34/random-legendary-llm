## Epic 6 — Collection Management Experience

### Story 6.1 — Render the collection view grouped by set type
- [x] Group sets into Base / Large / Small / Standalone
- [x] Render checklist rows for each set
- [x] **Test:** verify groupings and checklist rendering against normalized type metadata
- [x] **QC (Automated):** automate QC coverage for grouping order and readability

### Story 6.2 — Mirror ownership toggles between Browse and Collection tabs
- [x] Share the same ownership state source across Browse and Collection
- [x] Re-render Browse on Collection changes
- [x] Re-render Collection on Browse changes
- [x] **Test:** verify ownership changes propagate across both tabs immediately
- [x] **QC (Automated):** automate QC coverage for toggling from both tabs and confirming synchronization

### Story 6.3 — Compute category totals from the selected collection
- [x] Count owned heroes
- [x] Count owned masterminds
- [x] Count owned villain groups
- [x] Count owned henchman groups
- [x] Count owned schemes
- [x] **Test:** verify totals update correctly as collection ownership changes
- [x] **QC (Automated):** automate QC coverage to cross-check totals with a small custom collection

### Story 6.4 — Display player-count feasibility indicators
- [x] Compute feasibility for Standard Solo
- [x] Compute feasibility for Advanced Solo
- [x] Compute feasibility for 2–5 players
- [x] Show warning states clearly
- [x] **Test:** verify feasibility indicators reflect legality rules for multiple collection combinations
- [x] **QC (Automated):** automate QC coverage for at least one legal and one illegal collection scenario

### Story 6.5 — Support clearing the owned collection with confirmation
- [x] Add collection reset action
- [x] Add confirmation flow
- [x] Persist cleared collection state
- [x] **Test:** verify collection reset clears only ownership state and requires confirmation
- [x] **QC (Automated):** automate QC coverage for post-reset UI consistency in Browse and Collection tabs

---
