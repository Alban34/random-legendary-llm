## Title
New Game status summary shows three separate cards for secondary metadata, consuming excess vertical space

## Severity
Nice to change

## Affects
Both

## Source
Senior Desktop UX Auditor (review on 2026-05-02)

## Where it appears
New Game tab → setup engine control column, between Play Mode buttons and Setup Requirements.

## Evidence
Live review confirmed three individual cards:
1. "Selected mode / Standard Solo v1"
2. "Owned sets / 0"
3. "Last persisted mode / 1P · Standard Solo v1"

Each card occupies its own rounded box spanning the full column width. These three items are secondary metadata (confirmatory status) rather than task-critical content. At 664px viewport height, they consume approximately 280px of the left column between the mode buttons and the Generate Setup button.

The "Last persisted mode" card is especially secondary — it reflects the saved state from the previous session, which most users rarely need to reference during active setup.

## Why it matters
The Generate Setup button and the Forced Picks accordion are the primary action controls. Secondary status metadata should not occupy more visual space than the controls that trigger action. Three separate cards add vertical distance between "choose your mode" and "generate", making the Generate button feel further away than necessary.

## Expected benefit
Consolidating these three status items into a single compact summary line ("1P · Standard Solo v1 · Owned sets: 0") or a single small card would free approximately 150–200px of vertical space in the left column, bringing the Generate Setup button and Forced Picks accordion closer to the player count and mode controls. The flow from "configure → generate" would feel faster and more direct.

## Recommended change
Collapse the three separate status cards into a single compact metadata row or a single small summary card. "Last persisted mode" can be removed from primary visibility and retained in a tooltip or omitted entirely if the current selection already communicates state sufficiently.
