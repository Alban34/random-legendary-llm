## Epic 7 — New Game Setup Experience

### Story 7.1 — Render player-count and Advanced Solo controls
- [x] Add player-count selector buttons
- [x] Add Advanced Solo toggle
- [x] Disable Advanced Solo outside 1-player mode
- [x] **Test:** verify controls update state correctly and Advanced Solo is blocked outside 1-player mode
- [x] **QC (Automated):** automate QC coverage for button states and toggle affordance

### Story 7.2 — Display setup requirements for the current selection
- [x] Show required heroes count
- [x] Show required villain-group count
- [x] Show required henchman-group count
- [x] Show wound count
- [x] **Test:** verify displayed requirements match the active template for all player modes
- [x] **QC (Automated):** automate QC coverage to compare displayed numbers with `documentation/architecture/setup-rules.md`

### Story 7.3 — Generate and render a full setup result
- [x] Render mastermind card
- [x] Render scheme card
- [x] Render hero cards/grid
- [x] Render villain-group list
- [x] Render henchman-group list
- [x] **Test:** verify a generated setup renders every selected category correctly
- [x] **QC (Automated):** automate QC coverage for the layout and readability of a full result panel

### Story 7.4 — Show Scheme notes and forced-group badges clearly
- [x] Mark forced groups visually
- [x] Render scheme rule notes
- [x] Render mastermind lead information clearly
- [x] **Test:** verify forced-group indicators and notes appear on appropriate setups
- [x] **QC (Automated):** automate QC coverage for at least 3 setups with special rules or forced groups

### Story 7.5 — Allow Regenerate without consuming state
- [x] Add Regenerate action
- [x] Replace only ephemeral current result
- [x] Leave usage stats unchanged
- [x] **Test:** verify Regenerate changes the result without mutating history or usage stats
- [x] **QC (Automated):** automate QC coverage for UI and storage before and after the regenerate flow

### Story 7.6 — Accept and log the setup into persistent state
- [x] Add Accept & Log action
- [x] Update usage stats on accept
- [x] Append history record on accept
- [x] Refresh History tab data after accept
- [x] **Test:** verify Accept & Log mutates state exactly once and records the correct snapshot
- [x] **QC (Automated):** automate QC coverage to accept a setup and confirm History and Usage views update immediately

---
