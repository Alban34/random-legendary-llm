## Title
`ui-design.md` result-view "Always leads" indicator lacks explicit solo-mode suppression caveat

## Severity
Should change

## Affects
Both

## Source
Senior UX Strategist (review on 2026-05-02)

## Where it appears
`documentation/ux/ui-design.md` Tab 3 — New Game result-view section and interactions list, compared against Epic 73 task list (Story 2).

## Evidence
Epic 73 Story 2 task list confirms that in solo modes (Standard Solo, Advanced Solo, Standard Solo v2) `leadEntity` is suppressed in the result view and `locale.t('common.noMandatoryLead')` is shown instead of "Always leads: [name]". The "Mandatory Lead" pill and ★ marker are hidden.

`documentation/ux/ui-design.md` line 433 states: "★ marks the forced Mastermind villain group" without clarifying:
1. When the mark appears (multiplayer and Two-Handed Solo only).
2. What is shown instead in Standard/Advanced/v2 Solo modes.
3. That behavior differs by play mode.

The Epic 73 design rationale paragraph in ui-design.md mentions the generator suppression but is buried in a design-rationale narrative, not in the main spec table where auditors and developers will look.

## Why it matters
QA and future contributors reading the result-view spec in isolation may assume "★ Mandatory Lead" always appears for any mastermind with a lead property, and not test solo-mode suppression. Accidental regressions are more likely when the contract is not explicit in the primary spec location.

## Recommended change
Expand the relevant interactions line in Tab 3 result-view section to read:
> "★ marks the forced Mastermind villain group in multiplayer and Two-Handed Solo modes. In Standard Solo, Advanced Solo, and Standard Solo v2 modes the mastermind lead is not forced — the label is suppressed and no ★ mark is shown."

Optionally add a two-state diagram showing the result view with and without the Mandatory Lead label.

## Expected UX improvement
The specification will unambiguously describe when the "Always leads" indicator appears, reducing accidental regressions and making future QA/development clearer about the solo-mode contract.
