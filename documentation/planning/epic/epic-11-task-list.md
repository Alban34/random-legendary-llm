## Epic 11 — Alternate Solo and Multiplayer Modes

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 11 work complete

### Story 11.1 — Define the rules and UX contract for two-handed solo mode
- [x] Confirm the exact card-count and slot rules for two-handed solo mode
- [x] Document whether two-handed solo behaves as a 2-player setup, a custom setup, or a separate ruleset
- [x] Define the user-facing label, description, and control placement for the mode
- [x] Identify any history, scoring, or stats implications of the new mode metadata
- [x] **Test:** verify the documented rules and control contract stay aligned with generator assumptions
- [x] **QC (Automated):** automate QC coverage to confirm the new mode messaging is visible and understandable in the New Game flow

### Story 11.2 — Extend setup templates and validation for alternate play modes
- [x] Add setup-template support for two-handed solo mode
- [x] Update legality validation to evaluate collection sufficiency for the new mode
- [x] Ensure scheme and mastermind rule modifiers still apply correctly under the new template
- [x] Keep unsupported mode combinations blocked with clear reasons
- [x] **Test:** verify legal and illegal collections behave correctly for all supported mode combinations
- [x] **QC (Automated):** automate QC coverage for generating setups in standard solo, advanced solo, and two-handed solo modes

### Story 11.3 — Render play-mode selection and explain its impact in the New Game flow
- [x] Add UI controls for selecting the supported play mode
- [x] Update setup-requirements messaging to reflect the chosen mode
- [x] Show mode-specific notes when the selected mode changes the rules materially
- [x] Preserve accessible control labels and keyboard interaction
- [x] **Test:** verify the selected mode updates requirements, generation behavior, and labels consistently
- [x] **QC (Automated):** automate QC coverage for mode selection on desktop and mobile viewports

### Story 11.4 — Persist accepted setups with explicit play-mode metadata
- [x] Extend the game-record shape to include normalized play-mode metadata
- [x] Ensure accepted setups store the chosen mode in history
- [x] Preserve backward compatibility for existing history records without play-mode metadata
- [x] Update renderers to display mode information when present
- [x] **Test:** verify mixed old/new history records load safely and render correctly
- [x] **QC (Automated):** automate QC coverage for accepted setups that differ only by play mode

### Story 11.5 — Verify history, stats, and export payloads remain compatible with the new mode model
- [x] Audit all history readers for assumptions about player-count-only records
- [x] Update any stats derivations to account for play mode explicitly
- [x] Reserve a stable export representation for play-mode metadata
- [x] Document any fallback behavior for legacy records
- [x] **Test:** verify history, analytics inputs, and exported payloads remain valid after mode support is introduced
- [x] **QC (Automated):** automate QC coverage for one imported or restored record set containing legacy and mode-aware entries

---
