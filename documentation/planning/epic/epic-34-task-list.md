## Epic 34 — History Grouping Expansion

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 34 work complete

### Story 34.1 — Define the five-mode grouping contract
- [x] Write the group key derivation rules for all five modes: mastermind (mastermindId), scheme (schemeId), heroes (each heroId), villains (each villainGroupId), player mode (play-mode label)
- [x] Document that heroes and villains produce one group entry per entity (multi-group membership)
- [x] Declare mastermind as the default grouping mode, replacing the removed `none` default
- [x] **Test:** verify the contract document specifies derivation rules for all five modes and multi-group semantics
- [x] **QC (Automated):** no automated check for documentation; confirm manually before Story 34.2 starts

### Story 34.2 — Add new grouping derivations to `history-utils.mjs`
- [x] Add `scheme` grouping: derive key from `record.setupSnapshot.schemeId`, resolve display name from the data bundle indexes
- [x] Add `heroes` grouping: derive one group entry per `heroId` in `setupSnapshot.heroIds`, resolve each display name
- [x] Add `villains` grouping: derive one group entry per `villainGroupId` in `setupSnapshot.villainGroupIds`, resolve each display name
- [x] Remove `player-count` from `HISTORY_GROUPING_MODES`
- [x] Remove `none` from `HISTORY_GROUPING_MODES`
- [x] Update `DEFAULT_HISTORY_GROUPING_MODE` to remain `'mastermind'`
- [x] **Test:** verify all five modes produce correct group keys; records with multiple heroes appear in multiple hero groups; records with multiple villain groups appear in multiple villain groups; `player-count` and `none` are no longer valid modes
- [x] **QC (Automated):** automate QC coverage that exercises all five grouping derivations with representative history records and asserts correct group membership

### Story 34.3 — Update History grouping UI controls
- [x] Update the grouping control in the History tab to present exactly five mode buttons: Mastermind, Scheme, Heroes, Villains, Player Mode
- [x] Remove any button or option for `player-count` or `none` from the rendered grouping UI
- [x] Verify selecting any mode immediately updates the displayed groups
- [x] **Test:** verify the rendered grouping control exposes exactly five modes and no others; selecting each mode changes the displayed content
- [x] **QC (Automated):** add browser QC that opens History, verifies five and only five grouping mode controls, and selects each mode to confirm a grouped view renders

### Story 34.4 — Localize all five grouping mode labels
- [x] Add or update localization keys in English for all five modes: Mastermind, Scheme, Heroes, Villains, Player Mode (`history.groupBy.mastermind`, `history.groupBy.scheme`, `history.groupBy.heroes`, `history.groupBy.villains`, `history.groupBy.playMode`)
- [x] Add or update the same keys in French
- [x] Remove or archive localization keys for `player-count` and `none` grouping modes if they existed
- [x] **Test:** verify all five grouping labels render in English and French without falling back; no untranslated string is visible in either locale
- [x] **QC (Automated):** add locale-switching QC that opens History in both locales and verifies all five grouping mode buttons display their translated labels

### Story 34.5 — Verify all five grouping modes with existing records
- [x] Test all five modes against real or representative history records
- [x] Confirm a record with three heroes appears in all three hero groups
- [x] Confirm a record with two villain groups appears in both groups
- [x] Confirm no record is silently omitted from a group it belongs to under any mode
- [x] **Test:** verify all five modes produce correct groupings for diverse representative setups; multi-entity records appear under all applicable groups
- [x] **QC (Automated):** run Playwright History tab QC exercising all five grouping modes with seeded data; assert correct group headings and record distribution

---
