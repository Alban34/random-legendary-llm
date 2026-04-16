## Epic 39 — Epic Mastermind Variant

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 39 work complete

### Story 39.1 — Define the Epic Mastermind rules contract and data model
- [ ] Research the official Epic Mastermind rules from the Legendary rulebook or BoardGameGeek references and document how two masterminds interact (combined forced leads, shared villain group demand, victory condition)
- [ ] Determine whether any official pairing restrictions exist (e.g. certain masterminds cannot be combined) and document them
- [ ] Define the data model extension needed to store the Epic Mastermind flag in setup records and history entries (e.g. a second `mastermindsId` field or an `epicMastermind: boolean` flag alongside the existing mastermind slot)
- [ ] Document the contract in `documentation/data/` or a relevant spec file before implementation begins
- [ ] **Test:** no code changes in this story; verify the documented contract is consistent with the official rules and that the proposed data model extension does not break the existing history schema
- [ ] **QC (Automated):** no browser QC required for this research and design story

### Story 39.2 — Add an Epic Mastermind toggle to the New Game setup controls
- [ ] Add a clearly labeled toggle or checkbox control for Epic Mastermind mode in the New Game tab, near the existing play-mode and player-count controls
- [ ] Add a brief description explaining what the variant does (face two masterminds instead of one for a harder challenge)
- [ ] Ensure the toggle is keyboard-accessible, screen-reader-labeled, and consistent with the existing design system control patterns
- [ ] Persist the Epic Mastermind preference using the same preferences storage path as other setup preferences
- [ ] Ensure enabling the toggle does not affect the current generated setup until the user regenerates
- [ ] **Test:** verify the toggle renders, is keyboard-operable, persists across page reloads, and does not interfere with existing player-count and play-mode controls
- [ ] **QC (Automated):** add browser QC asserting the Epic Mastermind toggle is visible, focusable, and preserves its state after a reload

### Story 39.3 — Extend setup generation to select two masterminds when the variant is enabled
- [ ] Update `src/app/setup-generator.mjs` to select two distinct masterminds from the owned collection when the Epic Mastermind flag is active
- [ ] Account for the combined forced-lead requirements of both selected masterminds when filling villain group and henchman group slots
- [ ] If the owned collection cannot legally satisfy two masterminds (e.g. only one mastermind available), fall back to a single mastermind and emit an informational notice explaining the fallback
- [ ] Ensure the standard single-mastermind generation path is completely unchanged when Epic Mastermind is disabled
- [ ] **Test:** add unit test coverage asserting two distinct masterminds are selected when the flag is active; verify combined forced-lead accounting works correctly; verify the single-mastermind fallback fires when the collection has only one mastermind
- [ ] **QC (Automated):** add browser QC that enables Epic Mastermind, generates a setup, and asserts two masterminds appear in the result

### Story 39.4 — Display both masterminds clearly in the setup result and history record
- [ ] Update the setup result card in the New Game tab to display both mastermind slots clearly when Epic Mastermind is active, using the existing design-system card patterns
- [ ] Add a visual label or badge indicating the setup was generated in Epic Mastermind mode
- [ ] Update the history record view to show both mastermind identities for setups that used the Epic Mastermind variant
- [ ] Ensure existing single-mastermind history records display exactly as before
- [ ] **Test:** verify the result card shows two mastermind entries when Epic Mastermind is active and one entry when it is not; verify history records preserve both masterminds across page reloads
- [ ] **QC (Automated):** add browser QC for Epic Mastermind setup result display and verify the history list correctly reflects both masterminds for an accepted Epic Mastermind setup

### Story 39.5 — Persist the Epic Mastermind preference and localize all new strings
- [ ] Confirm the Epic Mastermind preference is persisted in the app state preferences object and survives backup/restore cycles
- [ ] Add localization keys for all new user-facing strings: toggle label, toggle description, result badge label, and fallback notice for insufficient masterminds
- [ ] Provide translations for all six supported locales (en-US, fr-FR, de-DE, ja-JP, ko-KR, es-ES)
- [ ] Verify that the Epic Mastermind toggle and result labels render correctly in each locale without layout breakage
- [ ] **Test:** verify the preference persists across reloads; verify all new localization keys are present and non-empty in all six locales
- [ ] **QC (Automated):** add or extend browser QC to switch to at least two non-English locales and confirm the Epic Mastermind toggle label and result badge render in the expected language
