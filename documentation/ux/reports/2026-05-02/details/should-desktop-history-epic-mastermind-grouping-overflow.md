## Title
"Epic Mastermind" history grouping button overflows to a second row, appearing detached from the other grouping pills

## Severity
Should change

## Affects
Both

## Source
Senior Desktop UX Auditor (review on 2026-05-02)

## Where it appears
History tab → grouping button row, below "Game history" heading.

## Evidence
Live review confirmed that the 6 grouping buttons (Mastermind, Scheme, Heroes, Villains, Player Mode, Epic Mastermind) render in a wrapping flex row. At 733px width, the first 5 fill one row and "Epic Mastermind" wraps to a second row standing alone. The visual result is that "Epic Mastermind" appears separate from the other grouping options, as if it is a different class of control.

Screenshot confirmed: row 1 shows "Mastermind Scheme Heroes Villains Player Mode"; row 2 shows "Epic Mastermind" alone.

## Why it matters
Users scanning the grouping options see "Epic Mastermind" isolated on its own line and may interpret it as a filter, action, or mode toggle rather than another grouping option in the same family. The visual separation reduces discoverability and makes the grouping system look inconsistent.

## Recommended change
Use a scrollable horizontal pill row (overflow: auto, no wrapping) so all 6 grouping options remain in a single visual row at all viewport widths, scrollable horizontally on narrow viewports. Alternatively, use a compact `<select>` or segmented control that collapses gracefully at narrow widths. If a wrapping layout is kept, ensure a minimum of 2–3 buttons appear on the last row to avoid orphan pills.

## Expected UX improvement
All grouping options will appear as a coherent family at any viewport width, and "Epic Mastermind" will no longer visually appear to be a different class of control.
