## Title
Expanded Forced Picks panel requires multiple full-viewport scrolls on mobile to reach the bottom

## Severity
Should change

## Affects
Mobile

## Source
Senior Mobile UX Auditor (review on 2026-05-02)

## Where it appears
New Game tab → Forced picks accordion (when expanded). At 733×664px viewport.

## Evidence
The Forced Picks accordion, when expanded, contains approximately 9 stacked content blocks (heading + explanation, Scheme, Mastermind, Hero, Villain Group, Henchman Group, Preferred Expansion message, Forced Team message, Active Constraints). The total scroll distance to reach "Active Constraints" from the panel opening point requires approximately 3 full viewport scrolls in the left column at this width.

On a phone-sized viewport (e.g. 390×844), the same content would require even more scrolling since the column is narrower and each label/input/button combination occupies more vertical space.

The Generate Setup button and Accept & Log button are above the Forced Picks accordion in the DOM, meaning users must scroll past the entire expanded panel to return to the primary action if they opened it and want to generate.

## Why it matters
On mobile, users are most likely to open Forced Picks to set one specific constraint (e.g. force a particular hero). The current layout requires them to scroll past all other constraint types they are not using. If the user wants to return to Generate Setup after setting a forced pick, they must scroll back up past the entire expanded section.

## Recommended change
1. Keep the most commonly used forced-pick types (Hero, Scheme, Mastermind) near the top of the expanded panel.
2. Place "Preferred Expansion" and "Forced Team" in a secondary sub-section that expands separately.
3. Move Active Constraints summary above the Forced Picks accordion so users can see what is forced without opening the panel.
4. Consider a two-column layout for scheme/mastermind/hero/villain/henchman controls on wider mobile viewports (≥480px) to reduce vertical length.

## Expected UX improvement
Users can open Forced Picks, set their constraint, and return to Generate Setup with fewer scroll steps. The most commonly used controls will be immediately visible without additional scrolling.
