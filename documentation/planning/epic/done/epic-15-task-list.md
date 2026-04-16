## Epic 15 — Guided Setup Constraints and Forced Picks

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 15 work complete

### Story 15.1 — Define which entity categories can be forced into a generated setup
- [x] Decide which entity types are eligible for forced inclusion in v1 of the feature
- [x] Define legal combinations of forced picks across categories
- [x] Document collision rules when forced picks overlap with mandatory scheme or mastermind constraints
- [x] Define unsupported combinations and the user-facing error strategy
- [x] **Test:** verify the supported forced-pick matrix stays aligned with generator assumptions
- [x] **QC (Automated):** automate QC coverage for the user-facing explanation of supported forced-pick categories

### Story 15.2 — Add UI controls for selecting, reviewing, and clearing forced picks
- [x] Add controls for choosing forced picks from eligible entities
- [x] Display active constraints clearly before generation
- [x] Allow removing individual forced picks and clearing all constraints
- [x] Keep the selection UI usable with large owned collections
- [x] **Test:** verify adding, removing, and clearing constraints updates the pending generation state correctly
- [x] **QC (Automated):** automate QC coverage for forced-pick selection flows across at least two entity categories

### Story 15.3 — Update generator logic to satisfy forced picks when a legal setup exists
- [x] Apply forced picks before random slot-filling begins
- [x] Prevent duplicate-selection conflicts with forced scheme or mastermind effects
- [x] Keep legality-first behavior when the available pool is tight
- [x] Preserve deterministic handling when multiple forced rules interact
- [x] **Test:** verify legal forced-pick setups generate correctly across representative constraint combinations
- [x] **QC (Automated):** automate QC coverage for a setup that combines forced picks with mandatory mastermind or scheme groups

### Story 15.4 — Explain clearly when a forced pick makes the setup impossible for the current collection or player mode
- [x] Detect unsatisfied forced-pick constraints before or during generation
- [x] Surface actionable error messaging that explains the failure reason
- [x] Distinguish impossible constraints from temporary randomization retries
- [x] Preserve existing insufficiency messaging where it still applies
- [x] **Test:** verify impossible constraints fail with specific and correct reasons
- [x] **QC (Automated):** automate QC coverage for several impossible forced-pick combinations and the resulting UI feedback

### Story 15.5 — Persist or intentionally scope forced-pick preferences based on the final UX decision
- [x] Decide whether forced picks are one-shot, session-scoped, or persisted in preferences
- [x] Implement the chosen persistence or reset behavior consistently
- [x] Keep accepted-history snapshots free of stale UI-only constraint state
- [x] Document the final lifecycle of forced-pick selections in the UX copy or docs
- [x] **Test:** verify forced-pick lifecycle behavior across reloads and repeated generations
- [x] **QC (Automated):** automate QC coverage for persistence behavior after reload and after successful accept flows

---
