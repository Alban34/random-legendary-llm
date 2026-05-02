## Title
Collection tab "Reset All Selections" button is the first interactive element, appearing before content controls

## Severity
Nice to change

## Affects
Both

## Source
Senior Mobile UX Auditor (review on 2026-05-02)

## Where it appears
Collection tab → directly below "My Collection" heading, before the view toggle (Sets / Browse Cards) and set list.

## Evidence
Live review confirmed that "Reset All Selections" is the first interactive element after the page heading, appearing above:
- The Sets / Browse Cards view toggle
- The "Owned sets: 0" summary card
- The set ownership list

This means a new user arriving at Collection for the first time sees a destructive action button before they see any actionable content.

## Why it matters
Destructive actions benefit from lower visual prominence and placement near the content they affect. Positioning "Reset All Selections" before the content it resets inverts this convention. While it requires a confirmation step, the prominent early placement increases the risk of accidental interaction, especially on mobile where fat-finger taps are more common.

## Expected benefit
Moving "Reset All Selections" to below the set list (at the bottom of the Sets view) would place the destructive action in direct proximity to what it affects, follow the convention of "dangerous actions at the bottom", and reduce the chance of accidental activation during normal browsing.

## Recommended change
Move the "Reset All Selections" button to the bottom of the Sets view, below the expansion checklist. Add a brief consequence reminder in the button label area ("This clears all owned set selections."). Keep the existing confirmation dialog.
