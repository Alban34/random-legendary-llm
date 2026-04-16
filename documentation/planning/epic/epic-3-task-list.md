## Epic 3 — Setup Generation Engine

### Story 3.1 — Implement player-count setup templates
- [x] Add `SETUP_RULES` constant for 1–5 players
- [x] Add Advanced Solo template
- [x] Expose helper for resolving the active template
- [x] **Test:** verify required counts for all supported player modes including Advanced Solo
- [x] **QC (Automated):** automate QC coverage to review displayed setup requirements against the approved rules table

### Story 3.2 — Validate owned collection legality before generation
- [x] Validate hero sufficiency
- [x] Validate villain-group sufficiency
- [x] Validate henchman-group sufficiency
- [x] Validate scheme availability for the chosen player count
- [x] Validate Advanced Solo only for 1 player
- [x] **Test:** verify illegal collections fail with correct reasons and legal collections proceed
- [x] **QC (Automated):** automate QC coverage for thin collections such as `Dimensions`-heavy or low-henchman selections

### Story 3.3 — Select a legal Scheme and apply its rule effects
- [x] Filter schemes by legality constraints
- [x] Select a scheme using freshness priority
- [x] Apply scheme forced groups
- [x] Apply scheme rule modifiers to required slot counts
- [x] Capture scheme notes for result rendering
- [x] **Test:** verify scheme constraints, forced groups, and modifiers alter setup correctly
- [x] **QC (Automated):** automate QC coverage for at least 3 scheme edge cases with special setup rules

### Story 3.4 — Select a legal Mastermind and account for mandatory leads
- [x] Select a mastermind using freshness priority
- [x] Apply resolved mastermind lead to the setup
- [x] Account for villain vs henchman lead categories correctly
- [x] **Test:** verify villain-led and henchman-led masterminds consume the correct slot type
- [x] **QC (Automated):** automate QC coverage for `Red Skull`, `Dr. Doom`, and one additional edge case

### Story 3.5 — Fill Villain Group and Henchman Group slots correctly
- [x] Prevent duplicate forced/random group collisions
- [x] Fill remaining villain-group slots legally
- [x] Fill remaining henchman-group slots legally
- [x] Preserve deterministic forced groups in the final result
- [x] **Test:** verify slot-filling logic with and without forced groups and with reduced pool sizes
- [x] **QC (Automated):** automate QC coverage for a 5-player setup where multiple categories are tight

### Story 3.6 — Select Heroes using freshness and least-played priority
- [x] Build eligible hero pool from owned sets
- [x] Prefer never-played heroes first
- [x] Fall back to least-played heroes when needed
- [x] Break ties by oldest `lastPlayedAt`, then random
- [x] **Test:** verify freshness ordering and least-played fallback with deterministic sample usage stats
- [x] **QC (Automated):** automate QC coverage for fallback messaging and result freshness behavior

### Story 3.7 — Keep Generate/Regenerate ephemeral until Accept & Log
- [x] Ensure Generate does not mutate persisted state
- [x] Ensure Regenerate does not mutate persisted state
- [x] Keep current generated setup in ephemeral UI state only
- [x] **Test:** verify repeated Generate/Regenerate leaves usage stats and history unchanged until accept
- [x] **QC (Automated):** automate QC coverage for storage before and after Regenerate cycles

### Story 3.8 — Produce history-ready setup snapshots using IDs only
- [x] Build setup snapshot with entity IDs only
- [x] Include player count and Advanced Solo flag
- [x] Include accepted timestamp
- [x] **Test:** verify history records store IDs only and still render correct labels through lookup indexes
- [x] **QC (Automated):** automate QC coverage for one stored record containing duplicate-name entities

---
