## Title
Desktop History prioritizes analytics ahead of the actual record list.

## Severity
Should change

## Affects
Desktop

## Source
Senior Desktop UX Auditor

## Where it appears
History tab after at least one setup has been accepted and logged.

## Evidence
In the live desktop review at `1440x900`, the History screen opens with grouping controls and then immediately spends most of the first viewport on KPI tiles, coverage summaries, and category insight cards. The actual grouped history records are pushed below the analytics stack. This is at odds with the documented product flow in `README.md`, which tells users to review accepted games in History, regroup them, and inspect insights below the grouped history list.

## Why it matters
Users come to History first to find, scan, and edit past games. When analytics dominate the first screen, the tab feels like a dashboard instead of a history tool. That slows retrieval, weakens confidence that edits are nearby, and makes the primary task compete with secondary reporting.

## Recommended change
On desktop, place the grouped history records directly under the grouping controls and move insights below the record list, or collapse them behind an explicit `Show insights` control until enough history exists to justify analysis. If analytics need to remain visible, treat them as a right-rail or lower-page companion rather than the top priority.

## Expected UX improvement
History becomes faster to scan, easier to treat as a logbook, and more aligned with the documented task flow, while still preserving the value of the insights layer.