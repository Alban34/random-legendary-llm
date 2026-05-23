## Epic 100 — Hank Pym, Yellowjacket Forced Lead Data Bug Fix

**Objective**
Investigate and correct the mastermind data entry for "Hank Pym, Yellowjacket", which currently carries a forced lead of "Black Order Guards" that a player reported as incorrect, and add a regression test to prevent recurrence.

**Background**
A user reported that a 2-player game was generated with "Hank Pym, Yellowjacket" as mastermind and the app displayed a forced lead of "Black Order Guards". The player believes Hank Pym can lead any villain group (no forced lead). The investigation should cross-reference the physical Marvel Studios' What If…? expansion rulebook (or canonical BGG reference) to determine the correct rule, then correct the data and add a regression test.

**In scope**
- Cross-referencing the Marvel Studios' What If…? expansion rulebook (or canonical BGG reference) to determine whether "Hank Pym, Yellowjacket" has a mandated forced lead villain group
- Correcting the canonical game data entry to match verified rules (either removing the forced lead fields or updating them to the correct group)
- Adding a targeted unit test that asserts the corrected mastermind entry generates a setup without a forced villain group slot (or with the correct one)

**Out of scope**
- Changes to the forced-lead resolution logic in setup-generator unless the investigation uncovers a code-level defect beyond the data entry
- Audit of other mastermind entries for similar data errors (that belongs in a separate data-quality epic)

**Stories**
1. **Reproduce the reported setup and verify the correct forced-lead rule for "Hank Pym, Yellowjacket" against authoritative sources**
2. **Correct the canonical game data entry to match the verified rule**
3. **Add a regression test that asserts the corrected mastermind entry produces the expected forced-lead behaviour**

**Acceptance Criteria**
- Story 1: A written note appended to this epic file documents the verified rule for "Hank Pym, Yellowjacket" and cites the source consulted (rulebook page, BGG reference, or equivalent); the decision on whether to remove or update the forced lead fields is recorded.
- Story 2: The canonical game data entry for "Hank Pym, Yellowjacket" matches the verified rule; `npm run build` completes without error after the change.
- Story 3: A unit test exists that asserts the mastermind produces the expected forced-lead behaviour; the test passes; the full unit test suite continues to pass.
