## Epic 13 — Data Portability and Backup

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 13 work complete

### Story 13.1 — Define a versioned import/export schema for collection, preferences, history, and scores
- [x] Define the exported root object shape and version marker
- [x] Include collection, preferences, history, score data, and future-safe metadata blocks
- [x] Define compatibility behavior for unknown or missing fields
- [x] Document the difference between internal runtime state and portable backup schema
- [x] **Test:** verify schema serialization and validation against representative sample payloads
- [x] **QC (Automated):** automate QC coverage for versioned backup fixtures with current and legacy-compatible fields

### Story 13.2 — Export app data as a downloadable JSON file
- [x] Add an export action in the UI with clear scope messaging
- [x] Serialize the portable schema from the current saved state
- [x] Trigger a browser-safe JSON download with a useful filename
- [x] Avoid exporting transient UI-only state
- [x] **Test:** verify exported JSON contains the expected persistent data and excludes ephemeral state
- [x] **QC (Automated):** automate QC coverage to trigger export and validate the downloaded payload structure

### Story 13.3 — Import previously exported JSON data through the UI
- [x] Add an import entry point and file-selection flow
- [x] Read JSON files safely in the browser
- [x] Parse and stage imported data before applying it
- [x] Keep the import flow accessible and recoverable after user mistakes
- [x] **Test:** verify valid exported files can be imported successfully into a clean or populated app state
- [x] **QC (Automated):** automate QC coverage for importing a valid backup and seeing the restored state rendered correctly

### Story 13.4 — Validate imported payloads and show actionable recovery errors
- [x] Validate schema version, required sections, and key field types
- [x] Surface clear errors for unsupported, corrupted, or partial payloads
- [x] Prevent destructive writes when validation fails
- [x] Keep error messages specific enough for recovery without exposing internals unnecessarily
- [x] **Test:** verify malformed and unsupported payloads fail safely without changing saved state
- [x] **QC (Automated):** automate QC coverage for representative import failure cases and visible error messaging

### Story 13.5 — Offer safe restore modes for replacing or merging existing local data
- [x] Define replace vs merge semantics for each persistent state slice
- [x] Add confirmation UX before applying destructive restore actions
- [x] Implement merge behavior that avoids duplicate history records where possible
- [x] Preserve user trust by previewing the chosen restore action clearly
- [x] **Test:** verify replace and merge paths update only the intended state slices
- [x] **QC (Automated):** automate QC coverage for both restore modes with overlapping history and collection data

---
