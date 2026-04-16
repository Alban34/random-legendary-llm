## Epic 1 — Data Foundation and Normalization

### Story 1.1 — Ship canonical game data with the client application
- [x] Create the canonical client data asset used by the app
- [x] Import or transcribe approved set inventory into the client-shipped data asset
- [x] Preserve source display names exactly as approved
- [x] **Test:** verify all included sets from `documentation/data/game-data-normalized.md` are present in the client-shipped data and aligned with `documentation/data/sources.md`
- [x] **QC (Automated):** automate QC coverage to spot-check at least 5 sets against the approved data docs

### Story 1.2 — Normalize source entities into set-scoped runtime IDs
- [x] Implement a slug/ID helper for set-scoped entity IDs
- [x] Generate stable IDs for sets
- [x] Generate stable IDs for heroes, masterminds, villain groups, henchman groups, and schemes
- [x] Ensure duplicate display names remain distinct via set-scoped IDs
- [x] **Test:** verify IDs are unique and duplicate display names remain distinct
- [x] **QC (Automated):** automate QC coverage for duplicate-name examples like `Black Widow`, `Loki`, and `Thor`

### Story 1.3 — Resolve cross-references for Masterminds and Schemes
- [x] Resolve `alwaysLead` + category into runtime lead references
- [x] Resolve forced Scheme groups into runtime IDs
- [x] Convert known scheme setup behavior into structured rule modifiers
- [x] Preserve human-readable rule notes for display
- [x] **Test:** verify all resolved references exist and match the approved docs plus the BoardGameGeek references listed in `documentation/data/sources.md`
- [x] **QC (Automated):** automate QC coverage for edge cases like `Dr. Doom` and `Secret Invasion of the Skrull Shapeshifters`

### Story 1.4 — Build flattened runtime indexes for all entity types
- [x] Build `setsById`
- [x] Build `heroesById`
- [x] Build `mastermindsById`
- [x] Build `villainGroupsById`
- [x] Build `henchmanGroupsById`
- [x] Build `schemesById`
- [x] Build flat arrays for each entity category
- [x] **Test:** verify index counts match canonical counts and each indexed ID resolves correctly
- [x] **QC (Automated):** automate QC coverage for runtime index samples in browser diagnostics or debug output

### Story 1.5 — Validate normalized data and surface initialization errors
- [x] Validate unique set IDs
- [x] Validate unique entity IDs
- [x] Validate Mastermind lead references
- [x] Validate Scheme forced-group references
- [x] Surface initialization failures clearly in the UI
- [x] **Test:** trigger representative invalid-reference cases in a test harness and verify failure reporting
- [x] **QC (Automated):** automate QC coverage to confirm errors are understandable and non-technical enough for review

---
