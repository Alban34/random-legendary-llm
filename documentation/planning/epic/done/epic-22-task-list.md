## Epic 22 — Set Catalog Ordering and Taxonomy Cleanup

**Status**
Approved

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 22 work complete

### Story 22.1 — Define the corrected set taxonomy and ordering contract
- [x] Audit the current set ordering rules across Browse, Collection, and any set-selection controls
- [x] Define the authoritative alphabetical ordering behavior, including tie-breaking and locale-safe sorting assumptions
- [x] Confirm the corrected taxonomy, including treating Core and Villains as base games
- [x] Capture unresolved classification corrections that need source-review or user-provided clarification before implementation
- [x] Add any required documentation-update follow-up for the revised taxonomy and sorting contract
- [x] **Test:** verify the documented ordering and taxonomy rules stay internally consistent across planning references
- [x] **QC (Automated):** add planning coverage that fails if set-ordering and taxonomy assumptions drift across docs

### Story 22.2 — Apply alphabetical ordering consistently across set-driven surfaces
- [x] Identify every user-facing set list that should follow the shared alphabetical ordering contract
- [x] Apply the chosen ordering consistently to Browse set grids, collection checklists, and set-picking controls where relevant
- [x] Preserve any intentional non-alphabetical grouping only where it clearly improves usability and is explicitly documented
- [x] Verify the new ordering does not destabilize selection, filtering, or persisted ownership behavior
- [x] **Test:** verify representative set lists render in the documented alphabetical order
- [x] **QC (Automated):** automate QC coverage for alphabetized set ordering in at least Browse and Collection surfaces

### Story 22.3 — Reclassify sets into the corrected base-game and expansion groupings
- [x] Review the current set-type assignments against the agreed corrected taxonomy
- [x] Reclassify Core and Villains into the shared base-game grouping
- [x] Correct any mistaken small-expansion and large-expansion assignments in the shipped catalog model
- [x] Verify category totals, filters, and badges still behave coherently after the reclassification
- [x] **Test:** verify representative sets resolve to the corrected base-game, small-expansion, or large-expansion grouping
- [x] **QC (Automated):** automate QC coverage for the corrected grouping labels in Browse and Collection views

### Story 22.4 — Verify taxonomy and ordering remain clear across Browse and Collection experiences
- [x] Review Browse filters, grouping labels, and helper copy after the taxonomy and ordering changes
- [x] Review Collection grouping, counts, and empty states for clarity after the reclassification
- [x] Remove or rewrite any wording that still reflects superseded classification rules
- [x] Add any required follow-up documentation tasks if taxonomy decisions affect user guidance or reference docs
- [x] **Test:** verify Browse and Collection contracts remain understandable after the catalog cleanup
- [x] **QC (Automated):** automate QC coverage for taxonomy-aware Browse and Collection interactions after the cleanup

### Story 22.5 — Update supporting documentation and QA expectations for the revised catalog contract
- [x] Update planning or UX documentation that describes set ordering or grouping behavior
- [x] Update any data-reference or design documentation that names the old classification model
- [x] Align regression and QC expectations with the corrected ordering and taxonomy behavior
- [x] Record any remaining manual-review items if final expansion classifications still need external confirmation
- [x] **Test:** verify planning and UX docs reference Epic 22 consistently and do not conflict on taxonomy or ordering
- [x] **QC (Automated):** automate documentation-consistency checks for the revised catalog contract
