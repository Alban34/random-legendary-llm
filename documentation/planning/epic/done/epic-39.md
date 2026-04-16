## Epic 39 — Epic Mastermind Variant

**Status: Approved**

**Objective**
Add support for the Epic Mastermind optional variant so players who want a harder challenge can enable it before generating a setup; when enabled, the generator selects two compatible masterminds and treats both as active antagonists in the setup display and in the history record.

**In scope**
- a user-facing toggle or option to enable the Epic Mastermind variant in the New Game flow
- setup generator logic that selects two masterminds when Epic Mastermind is enabled, accounting for forced leads and legality
- display of both masterminds in the generated setup result card
- persisting the Epic Mastermind preference alongside other setup preferences
- history records that reflect both masterminds when the variant was active
- localization of all new user-facing strings

**Out of scope**
- Epic Mastermind stacking rules that require specific mastermind pairings (unless the official rules document such restrictions)
- changes to the scoring or stats model beyond recording both masterminds in history

**Stories**
1. **Define the Epic Mastermind rules contract and data model**
2. **Add an Epic Mastermind toggle to the New Game setup controls**
3. **Extend setup generation to select two masterminds when the variant is enabled**
4. **Display both masterminds clearly in the setup result and history record**
5. **Persist the Epic Mastermind preference and localize all new strings**

**Acceptance Criteria**
- Story 1: The Epic Mastermind variant rules are documented (what it means, how two masterminds interact, whether any official pairing restrictions apply); the data model extension needed to store the variant flag in setup records is defined before implementation begins.
- Story 2: The New Game tab shows a clearly labeled toggle or option for Epic Mastermind; the control is accessible, keyboard-operable, and explained with a brief description of what the variant does; enabling it does not break the standard single-mastermind flow.
- Story 3: When Epic Mastermind is enabled, the generator selects two distinct masterminds from the owned collection accounting for their combined forced-lead requirements; if the collection cannot legally satisfy two masterminds, the generator falls back gracefully and explains why.
- Story 4: The setup result card shows both masterminds clearly when Epic Mastermind is active; history records created with the variant preserve both mastermind identities and display them in the history view; existing single-mastermind history records are unaffected.
- Story 5: The Epic Mastermind preference persists across sessions; all new UI strings (toggle label, description, result display labels) are translated across all six supported locales; disabling the variant restores single-mastermind behavior without requiring a reset.

---
