## Title
Mobile Backup turns routine maintenance into a long, high-friction danger stack.

## Severity
Should change

## Affects
Mobile

## Source
Senior Mobile UX Auditor

## Where it appears
Backup tab on mobile, especially after the export/import card and throughout the used-card reset section.

## Evidence
In the live mobile review, the Backup tab stacked export/import, five per-category reset controls, explanatory copy about least-play reuse, a reset preview, and the `Full Reset - Clear all data` action in one long vertical sequence. The mobile evidence dump counted six destructive or reset-oriented buttons on the screen (`Reset Heroes`, `Reset Masterminds`, `Reset Villain Groups`, `Reset Henchman Groups`, `Reset Schemes`, and `Full Reset - Clear all data`). The screenshot shows that reaching the full reset action requires scrolling through repeated maintenance cards while the large shared header and bottom navigation continue to consume screen space.

## Why it matters
This screen mixes safe maintenance, backup portability, and the most destructive action in the app without enough pacing for a phone-sized display. The result is cognitively heavy, harder to scan, and more likely to cause hesitation or mistakes because each reset option looks structurally similar.

## Recommended change
Separate Backup into clearer mobile sections. Keep export/import prominent near the top, collapse per-category usage resets into an accordion or secondary maintenance area, and move full reset into a distinct danger zone with stronger spacing and visual separation from routine actions.

## Expected UX improvement
Users can back up or restore data more confidently, routine maintenance feels lighter, and the destructive reset path becomes easier to find without making the whole screen feel risky.