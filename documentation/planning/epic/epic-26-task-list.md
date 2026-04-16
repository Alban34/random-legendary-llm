## Epic 26 — Remaining Set Classification Data Corrections

**Status: Approved**

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 26 work complete

### Story 26.1 — Audit all base-game, small-expansion, and large-expansion assignments against the published Legendary ruleset

**Status: Approved**

- [x] Read all set entries in the catalog data source and list their current type assignments
- [x] Cross-reference each assignment against the published Legendary ruleset definition of base game, small expansion, and large expansion
- [x] Produce a written correction manifest that names every set whose current classification differs from the target
- [x] Group the manifest by correction category (base-game, small-expansion, large-expansion) so follow-on stories can consume it directly
- [x] **Test:** verify the correction manifest accounts for every set in the catalog and that no set is listed under more than one correction category
- [x] **QC (Automated):** add a QC check that confirms the correction manifest file exists and is non-empty before Story 26.2 work begins

### Story 26.2 — Reclassify Core and Villains as base games throughout the catalog data

**Status: Approved**

- [x] Locate all catalog data entries for Core and Villains and update their type field to the base-game value
- [x] Confirm no other set is unintentionally changed by the same edit
- [x] Verify Core and Villains appear under the base-game group in Browse and Collection surfaces after the change
- [x] Remove or update any hardcoded label or filter assumption that treated Core or Villains as expansions
- [x] **Test:** verify Core and Villains render under the base-game category in every surface that groups by set type
- [x] **QC (Automated):** automate QC coverage that asserts Core and Villains are visible under the base-game group and absent from expansion groups in Browse and Collection

### Story 26.3 — Correct remaining small- and large-expansion misassignments identified by the audit

**Status: Approved**

- [x] Work through each entry in the Story 26.1 correction manifest that is classified as a small- or large-expansion correction
- [x] Update each affected catalog entry's type field to the correct target value
- [x] Confirm no set from the manifest remains uncorrected after changes are applied
- [x] Verify the corrected sets appear in the expected Browse and Collection groups
- [x] **Test:** verify every set flagged in the correction manifest now carries the target classification and renders in the correct Browse and Collection group
- [x] **QC (Automated):** automate QC coverage that iterates the correction manifest and asserts each set appears only under its corrected category in Browse

### Story 26.4 — Fix the Revelations entry to reflect it is a small expansion with no standalone mode

**Status: Approved**

- [x] Locate the Revelations catalog entry and update its type to small expansion
- [x] Remove any standalone-mode flag or row for Revelations from the catalog data
- [x] Confirm no Browse or Collection surface renders a standalone row for Revelations after the change
- [x] Verify Revelations appears correctly grouped as a small expansion in all affected surfaces
- [x] **Test:** verify Revelations shows as a small expansion with no standalone entry in Browse and Collection
- [x] **QC (Automated):** automate QC coverage asserting Revelations is present under small expansions and that no standalone Revelations row appears in any rendered surface

### Story 26.5 — Verify corrected classifications display accurately across Browse and Collection surfaces

**Status: Approved**

- [x] Run through all corrected sets in Browse and confirm each appears in the expected category group
- [x] Run through all corrected sets in Collection and confirm each appears in the expected category group
- [x] Check that alphabetical ordering and filtering show no regressions after the reclassification changes
- [x] Document any edge cases found during the verification pass and confirm they are resolved or logged
- [x] **Test:** verify all corrected sets appear in the right Browse and Collection groups with correct alphabetical order and no stale category assignments
- [x] **QC (Automated):** automate QC coverage for Browse and Collection rendering after the full reclassification, asserting no set appears under an incorrect group

---
