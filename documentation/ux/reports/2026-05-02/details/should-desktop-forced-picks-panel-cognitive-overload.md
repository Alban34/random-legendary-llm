## Title
Forced Picks panel stacks too many controls in one accordion, creating significant vertical scroll and cognitive load

## Severity
Should change

## Affects
Both

## Source
Senior Desktop UX Auditor (review on 2026-05-02)

## Where it appears
New Game tab → "Forced picks" accordion (collapsed by default, expanded on click). Observed at 733×664px viewport.

## Evidence
Live review of the expanded Forced Picks accordion confirmed that the section stacks the following in a single vertical column:
1. "Forced picks" heading (H3) + explanation paragraph
2. Scheme: dropdown + "Set Scheme" button (horizontal pair)
3. Mastermind: dropdown + "Set Mastermind" button (vertical pair)
4. Hero: dropdown + "Add Hero" button (vertical pair)
5. Villain Group: dropdown + "Add Villain Group" button (vertical pair)
6. Henchman Group: dropdown + "Add Henchman Group" button (vertical pair)
7. Preferred Expansion: text-only message "Own at least 2 expansions…"
8. Forced Team: raw locale key paragraph (confirmed bug)
9. Active constraints: "Active constraints" heading + "Clear all" button + "No forced picks are active" paragraph

The layout inconsistency between item #2 (Scheme: horizontal) and items #3–6 (vertical) adds unnecessary irregularity. The section heading "Forced picks" is duplicated — once in the accordion toggle label and once as an H3 inside the expanded content.

On a 664px tall viewport, reaching the bottom of the expanded section requires approximately 3 full screen scrolls through the left column.

## Why it matters
Users seeking to force a specific hero or scheme must scroll past all other forced-pick types to find their target. The visual weight of 8+ stacked items with no visual grouping makes it harder to locate the control you need. The duplicate heading wastes space. The button layout inconsistency (Scheme vs others) reduces visual predictability.

## Recommended change
1. Remove the duplicated "Forced picks" H3 from inside the accordion body — the toggle label already names the section.
2. Normalize the button layout: either all pairs horizontal (label + dropdown + action button in one row) or all vertical — but consistently.
3. Consider grouping forced picks under two visual clusters: "Card types" (scheme, mastermind, hero, villain group, henchman group) and "Session settings" (preferred expansion, forced team), each with a smaller sub-heading or divider.
4. Move "Active constraints" to a persistent summary area visible above the Generate Setup button, independent of the accordion, so users always see what is forced without opening the panel.

## Expected UX improvement
The Forced Picks panel will scan faster, the layout will be internally consistent, and users will find their target control in fewer scrolling steps. Surfacing active constraints outside the accordion removes the need to open the panel just to see what is currently forced.
