## Epic 57 — Solo Mode Rules Reference Panel

**Objective**
After a solo setup is generated, surface a concise, mode-specific rules summary so the player can configure the physical villain deck correctly and apply the right special rules — without consulting the rulebook.

**Background**
The generator picks heroes, mastermind, scheme, villain group, and henchman group, but it does not tell the player how to assemble the villain deck or which special rules apply. Solo modes differ significantly in villain deck composition (master strike count, henchman card count in the deck, set-aside henchmen for the first-turn rule), scheme twist effects, the "each other player" scope, and other mode-specific instructions. The authoritative source for this content is `documentation/my-inputs/solo-modes-rules.md`. Two-Handed Solo is excluded from the rules panel because it has no solo-specific rule changes — its only difference is the card count template, which is already shown in the setup requirements card.

**In scope**
- A "Solo rules" section rendered inside the generated setup result area (below the picked cards or as a `<details>`/`<summary>` collapsible element), visible only when a solo mode with rule changes is active (Standard Solo, Advanced Solo, or Standard v2) and a setup has been generated
- The section is hidden for Two-Handed Solo and for all multiplayer modes
- The section is hidden before a setup has been generated
- Content per mode derived from `documentation/my-inputs/solo-modes-rules.md` and covering at minimum:
  - Villain deck composition: master strike count, henchman cards in the villain deck, set-aside henchmen (if any) and when they enter play
  - Scheme twist effect (what happens when a scheme twist fires)
  - "Each other player" scope (whether and how it applies to the solo player)
  - Any other mode-specific special rules (e.g. Master Strike cascade for Advanced Solo, mastermind ability transfer for Standard v2, the one-tuck-per-turn cap for Standard v2)
- Locale strings for all rules content in all six locale files (en, fr, de, es, ja, ko)
- The collapsible section defaults to open (expanded) so the rules are immediately visible; experienced players can collapse it

**Out of scope**
- Scoring penalty calculator or penalty display
- Rules display before a setup has been generated
- Rules display in the History tab, Stats tab, or any tab other than New Game
- Rules display for multiplayer modes
- Full rulebook reproduction — this is a mode-specific summary, not a comprehensive rules reference
- Changes to the mode selector help text (`getPlayModeHelpText`) — that is a separate surface

**Stories**
1. **Define the rules content model: map each eligible solo mode to its ordered list of rule-change items**
2. **Render the collapsible solo rules section in the generated setup result area, with mode-aware content**
3. **Add locale strings for all rules content across all six locale files**

**Acceptance Criteria**
- Story 1: A content structure (locale string keys, a typed JS constant, or a structured data mapping) exists that maps `standard`, `advanced-solo`, and `standard-solo-v2` each to an ordered list of rule items; items cover at minimum: villain deck composition (master strikes, henchman cards in villain deck, set-aside henchmen), scheme twist effect, and "each other player" scope; the structure for `standard-solo-v2` reflects the one-tuck-per-turn cap and the mastermind ability transfer rule; `npm run lint` passes.
- Story 2: When a setup has been generated and the active play mode is Standard Solo, Advanced Solo, or Standard v2, a rules section (labelled e.g. "Solo rules" or "Rules for this mode") is rendered below the setup picks; the section is a `<details>`/`<summary>` collapsible that defaults to open; switching to Two-Handed Solo or a multiplayer count hides the section; no rules section appears before the Generate button is pressed; content rendered in the section matches the active mode — Standard Solo content does not appear when Advanced Solo is selected and vice versa; `npm run lint` passes.
- Story 3: All six locale files contain translated strings for every rule item across the three modes with rule content; no string falls back to a raw locale key in any locale when the solo rules section is rendered; `npm run lint` passes.
