## Epic 2 — State Management and Persistence

### Story 2.1 — Create a storage manager for versioned root state
- [x] Define `legendary_state_v1` shape in code
- [x] Implement default-state factory
- [x] Implement safe load with fallback to defaults
- [x] Implement save/update helpers for the root state object
- [x] **Test:** verify save/load roundtrip preserves the root state shape
- [x] **QC (Automated):** automate QC coverage for stored browser data after state writes

### Story 2.2 — Persist and hydrate owned collection state
- [x] Store owned set IDs
- [x] Hydrate collection state on load
- [x] Validate stored set IDs against runtime indexes
- [x] Remove invalid stored references safely
- [x] **Test:** verify owned-set changes persist across reloads and invalid set IDs are handled safely
- [x] **QC (Automated):** automate QC coverage to toggle several owned sets, reload, and confirm consistency

### Story 2.3 — Persist and update usage statistics (`plays`, `lastPlayedAt`)
- [x] Define per-category usage-stat containers
- [x] Implement usage-stat increment helper
- [x] Update `plays` on Accept & Log
- [x] Update `lastPlayedAt` on Accept & Log
- [x] **Test:** verify usage stats update only on accepted setups and store both `plays` and `lastPlayedAt`
- [x] **QC (Automated):** automate QC coverage to accept multiple setups and inspect freshness ordering behavior

### Story 2.4 — Persist and retrieve accepted game history
- [x] Define `GameRecord` creation helper
- [x] Append accepted setups to history
- [x] Load history on startup
- [x] Sort or render history newest-first
- [x] **Test:** verify accepted setups create stable ID-based history records in newest-first order
- [x] **QC (Automated):** automate QC coverage to compare rendered history against accepted setup output

### Story 2.5 — Support per-category and full reset operations
- [x] Reset hero usage stats
- [x] Reset mastermind usage stats
- [x] Reset villain-group usage stats
- [x] Reset henchman usage stats
- [x] Reset scheme usage stats
- [x] Reset the entire root state safely
- [x] **Test:** verify per-category reset only affects the intended category and full reset clears all slices
- [x] **QC (Automated):** automate QC coverage for each reset action and visible state update

### Story 2.6 — Handle corrupted or missing browser state gracefully
- [x] Detect invalid JSON/state shape
- [x] Recover with default state
- [x] Notify the user when recovery occurs
- [x] **Test:** simulate corrupted saved state and verify safe recovery
- [x] **QC (Automated):** automate QC coverage to confirm the recovery message is visible and understandable

---
