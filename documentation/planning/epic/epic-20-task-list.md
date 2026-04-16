## Epic 20 — History Grouping and Organization

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 20 work complete

### Story 20.1 — Define the grouping model and user-facing history contract
- [x] Decide which grouping modes are supported initially, such as mastermind, player count, play mode, or time period
- [x] Define the default grouping behavior and whether users can switch or disable grouping
- [x] Document how pending and completed results should appear inside grouped sections
- [x] Preserve clarity for duplicate mastermind names, legacy records, and sparse histories
- [x] **Test:** verify grouping definitions remain stable for representative mixed-history datasets
- [x] **QC (Automated):** automate QC coverage for the chosen default grouping on desktop and mobile

### Story 20.2 — Build grouped history derivations without breaking existing records
- [x] Add selectors or helpers that transform the flat newest-first history list into grouped sections
- [x] Keep within-group ordering deterministic and preserve the current record detail model
- [x] Ensure legacy records without newer metadata still group safely
- [x] Avoid duplicating records across groups unless explicitly designed
- [x] **Test:** verify grouped history derivations for mixed play modes, results, and legacy records
- [x] **QC (Automated):** automate QC coverage for one restored or legacy dataset rendered through the grouped view

### Story 20.3 — Render grouped history sections with clear navigation and collapse behavior
- [x] Add grouped section headers, counts, and collapse or expand affordances where appropriate
- [x] Keep individual game records readable within each group
- [x] Preserve responsive layout and keyboard accessibility for nested history interactions
- [x] Keep the ungrouped experience understandable if grouping is optional
- [x] **Test:** verify grouped rendering and expand-collapse behavior for short and long histories
- [x] **QC (Automated):** automate QC coverage for grouped history interaction on desktop and mobile viewports

### Story 20.4 — Support regrouping or filtering without breaking history actions
- [x] Add the chosen grouping or sorting controls to the History experience
- [x] Ensure result editing, record expansion, and navigation still target the correct game inside grouped views
- [x] Preserve newest-first expectations within the active grouping mode unless intentionally overridden
- [x] Keep controls understandable when the history is empty or lightly populated
- [x] **Test:** verify regrouping or filtering updates the rendered sections without breaking record actions
- [x] **QC (Automated):** automate QC coverage for changing grouping modes and editing a result inside a grouped section

### Story 20.5 — Keep grouped history compatible with insights, backup, and future exports
- [x] Confirm insights continue to derive from the underlying flat data rather than presentation-only grouping state
- [x] Keep backup and restore flows free of grouped UI-only state unless persistence is explicitly chosen
- [x] Document how grouping interacts with duplicate names, play modes, and localization-ready labels
- [x] Reserve room for future history filters without redesigning the grouped data model
- [x] **Test:** verify grouping state does not mutate persisted history records or backup payloads unintentionally
- [x] **QC (Automated):** automate QC coverage for grouped history after reload and after backup restore
