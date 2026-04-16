## Epic UX1 — Documentation and UX Contract Alignment

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX1 work complete

### Story UX1.1 — Align the primary shell documentation with the shipped five-tab product
- [x] Audit every UX-facing document that still describes a four-tab or otherwise outdated shell
- [x] Update the canonical shell description to reflect Browse, Collection, New Game, History, and Backup as the shipped primary destinations
- [x] Align shell diagrams, tab labels, and responsive-navigation language across the documentation set
- [x] Remove or reframe any wording that implies Backup is secondary or absent from the primary navigation contract
- [x] **Test:** verify all documentation references to the shell now describe the same five-tab information architecture
- [x] **QC (Automated):** extend documentation-readiness coverage to detect regressions in the five-tab shell contract

### Story UX1.2 — Document the shared header theme and locale controls plus their responsive behavior
- [x] Document the shared header control group as part of the baseline product experience rather than optional polish
- [x] Define desktop and mobile placement rules for theme and locale controls
- [x] Document the expected confirmation, persistence, and focus behavior of header preference changes
- [x] Clarify how the shared header behaves when the active tab changes or when onboarding is visible
- [x] **Test:** verify the header documentation matches the shipped preference model and persisted state fields
- [x] **QC (Automated):** add documentation-contract coverage for shared header controls and their responsive placement rules

### Story UX1.3 — Document the current first-run onboarding, replay, and About-entry behavior
- [x] Document when onboarding appears on first launch and when it does not reappear automatically
- [x] Define the skip, next, previous, replay, and completion paths in the UX documentation
- [x] Document the intended relationship between onboarding, Browse, and the About entry point
- [x] Clarify reset behavior that restores first-run onboarding visibility
- [x] **Test:** verify the documented onboarding lifecycle matches stored preference behavior and current runtime expectations
- [x] **QC (Automated):** add documentation-readiness checks for onboarding visibility, replay, and About-surface wording

### Story UX1.4 — Rewrite the primary New Game and History UI specs to match the shipped flows
- [x] Expand the New Game documentation to cover play modes, forced picks, result-entry follow-up, and clear/regen behavior
- [x] Expand the History documentation to cover pending versus completed results, result editing, grouping modes, and insights placement
- [x] Align UI-spec terminology with the runtime data model and current tests for result states and grouping behavior
- [x] Document the intended empty, sparse-data, and high-data UX states for History
- [x] **Test:** verify New Game and History docs describe the same behavior enforced by runtime tests and browser QC
- [x] **QC (Automated):** add documentation-contract coverage for the shipped New Game and History UX flows

### Story UX1.5 — Mark outdated four-tab or pre-alignment planning language as historical and non-authoritative
- [x] Identify roadmap, task-list, and planning references that still describe superseded shell or flow assumptions
- [x] Reframe those references clearly as historical or archival where they are intentionally retained
- [x] Remove ambiguity about which documentation file is authoritative for current UX behavior
- [x] Ensure the UX-alignment docs are linked from relevant planning references so future work starts from the right baseline
- [x] **Test:** verify no retained historical planning doc can be misread as the current UX contract without an explicit archival framing
- [x] **QC (Automated):** add checks that fail when superseded planning files present themselves as current shipped behavior

---
