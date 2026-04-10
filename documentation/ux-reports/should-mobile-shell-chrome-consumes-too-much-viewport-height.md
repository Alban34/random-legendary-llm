## Title
Mobile shell chrome consumes too much of the phone viewport before the user reaches task content.

## Severity
Should change

## Affects
Mobile

## Source
Senior Mobile UX Auditor

## Where it appears
First-run mobile view and repeated across task screens that keep the shared header controls and fixed bottom navigation visible.

## Evidence
In the live mobile review at `390x844`, the shared header measured about `367px` tall and the fixed bottom navigation measured about `119px` tall, leaving roughly `358px` of unobstructed vertical space for task content. On first launch, the onboarding shell extended to about `1009px` before the Browse hero even began at about `1033px`, so the user lands inside chrome and orientation material instead of directly on a primary action. The screenshots also show the same large header block competing with New Game and Backup content on phone-sized screens.

## Why it matters
The mobile shell asks the user to spend scarce vertical space on persistent branding, preference controls, and navigation before the actual task can breathe. That weakens focus, increases scrolling, and makes already dense flows feel heavier than they need to.

## Recommended change
Compress the mobile shell aggressively. Collapse the descriptive app blurb after first run, reduce the footprint of the language and theme controls behind a single preferences entry point or drawer, and trim the visual height of the mobile navigation. Keep the user on task by reserving most of the phone viewport for the active panel.

## Expected UX improvement
Primary actions appear sooner, the app feels faster and less crowded on phone screens, and every tab gains more usable room for its actual workflow.