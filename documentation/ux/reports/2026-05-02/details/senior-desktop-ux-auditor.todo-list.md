## Reporter
Senior Desktop UX Auditor

## Scope
Live review of the application at `http://127.0.0.1:5173/` on 2026-05-02. Desktop review conducted at the effective viewport of 733×664px (the maximum available in the browser tool). This is below the 768px desktop breakpoint so the mobile tab-bar navigation was active. Desktop tab-bar in header was confirmed to exist in DOM (display: none at this width). Core layout, flow, and interactions were reviewed.

## Review checklist
- [x] First-run onboarding and welcome experience
- [x] Browse tab information architecture, summary content, filters, and About entry point
- [x] Collection tab totals, capacity messaging, storage feedback, and reset affordance
- [x] New Game flow including player count, play mode, forced picks, and Generate/Accept & Log
- [x] Forced Picks panel: scheme, mastermind, hero, villain, henchman, preferred expansion, forced team, epic mastermind
- [x] Active Expansions collapsed behavior (Epic 72)
- [x] History grouping controls, record scanability, and insights placement
- [x] Backup tab: export/import entry points, card tracking accordion, and full-reset danger zone
- [x] Theme switching behavior (dark/light) and focus restoration
- [x] Locale switching behavior and toast confirmation
- [x] Locale key rendering - confirmed raw key bugs in New Game and header

## Status notes
- Completed on 2026-05-02 using the running local server at `http://127.0.0.1:5173/`.
- Two critical defects confirmed in live app: raw locale key visible in Forced Picks panel and broken aria-label on locale selector.
- Prior "must change" items reviewed: theme switch focus is resolved; backup structure (3-section) is resolved; header chrome is now compact.
- Active Expansions section (Epic 72) not visible without owned expansions — could not test collapsed/expanded behavior.
- Epic Mastermind mode controls (Epic 71) not visible — requires owned expansions with X-Men set.

## Findings summary
- [must-desktop-forced-team-raw-locale-key-visible.md](must-desktop-forced-team-raw-locale-key-visible.md)
- [must-desktop-locale-selector-aria-label-raw-key.md](must-desktop-locale-selector-aria-label-raw-key.md)
- [should-desktop-forced-picks-panel-cognitive-overload.md](should-desktop-forced-picks-panel-cognitive-overload.md)
- [should-desktop-history-epic-mastermind-grouping-overflow.md](should-desktop-history-epic-mastermind-grouping-overflow.md)
- [nice-desktop-new-game-status-cards-take-excessive-vertical-space.md](nice-desktop-new-game-status-cards-take-excessive-vertical-space.md)
