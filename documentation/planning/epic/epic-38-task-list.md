## Epic 38 — Data Completeness: Missing Legendary Sets

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 38 work complete

### Story 38.1 — Audit and document all Legendary: Marvel sets missing from the current inventory
- [ ] Obtain the full set listing from master-strike.com and legendaryleagues.com and cross-reference it against the current 33 sets in `src/data/canonical-game-data.json`
- [ ] Produce a gap list naming every Legendary: Marvel expansion present in external databases but absent from the app
- [ ] For each missing set, classify it as base, large expansion, small expansion, or standalone using the same taxonomy as existing sets
- [ ] Mark each missing set as researchable (card inventory confirmable from approved references) or excluded (insufficient reliable data), with justification for any exclusion
- [ ] Document the gap list in `documentation/data/game-data-normalized.md` before any code changes are made
- [ ] **Test:** verify the gap list accounts for all known Legendary: Marvel sets by cross-referencing the documented sources; confirm no set already present in the 33-set inventory is incorrectly listed as missing
- [ ] **QC (Automated):** no browser QC required for this research story; the documented gap list review is the acceptance gate

### Story 38.2 — Compile card inventory for each missing set from approved reference sources
- [ ] For each researchable missing set, compile the full card inventory: heroes, masterminds, villain groups, henchman groups, and schemes
- [ ] Record mastermind always-lead group names and categories (villain group or henchman group) for each new mastermind
- [ ] Record scheme forced-group references where applicable
- [ ] Add the compiled inventory for each set to `documentation/data/game-data-normalized.md` following the existing table format
- [ ] Cross-check compiled inventory counts against master-strike.com and legendaryleagues.com to reduce data-entry errors
- [ ] **Test:** verify each compiled set's hero and mastermind counts are consistent with at least two external sources; flag any set where counts cannot be confirmed
- [ ] **QC (Automated):** no browser QC required for this research story; the cross-referenced documentation is the acceptance gate

### Story 38.3 — Add missing sets to the canonical data and validate all cross-references
- [ ] Add each researchable missing set as a new entry in `src/data/canonical-game-data.json` following the existing schema
- [ ] Assign stable, set-scoped IDs to each new hero, mastermind, villain group, henchman group, and scheme
- [ ] Set the `alwaysLead` field for each new mastermind with the correct group name and category
- [ ] Set forced-group references for each new scheme where applicable
- [ ] Run the runtime validation pass and confirm no cross-reference errors are reported for any new set
- [ ] Confirm the runtime indexes (`heroesById`, `mastermindsById`, etc.) build without errors after the additions
- [ ] **Test:** add test coverage asserting all new sets are present in the runtime indexes and that every new mastermind always-lead reference resolves to an existing group; verify new scheme forced-group references resolve correctly
- [ ] **QC (Automated):** add or extend browser QC to confirm the Browse tab renders the newly added sets and that their detailed card lists are correct

### Story 38.4 — Update normalized documentation to reflect the expanded inventory
- [ ] Update the inventory summary table in `documentation/data/game-data-normalized.md` to include all newly added sets
- [ ] Update the total hero and mastermind count figures in the documentation to match the new canonical data
- [ ] Ensure the documentation notes reflect the expanded set count and any taxonomy decisions made during the audit
- [ ] **Test:** verify the documented totals match the actual counts in `src/data/canonical-game-data.json` after the additions
- [ ] **QC (Automated):** no additional browser QC required beyond Story 38.3 coverage

---
