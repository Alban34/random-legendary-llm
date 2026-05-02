## Reporter
Senior Mobile UX Auditor

## Scope
Review the live mobile application at `http://127.0.0.1:8000/` against the intended experience documented in `README.md`, `documentation/ui-design.md`, `documentation/roadmap.md`, and `documentation/epics.md`, with focus on responsive behavior, content prioritization, tap ergonomics, scrolling friction, readability, task completion, and mobile-specific clarity.

## Review checklist
- [x] Reviewed: Representative mobile viewport selected as `390x844` because it matches a modern phone-size review target and exposes the fixed bottom navigation and stacked mobile layouts.
- [x] Reviewed: First-run onboarding and welcome experience.
- [x] Reviewed: Browse landing hierarchy, content depth, and access to the set catalog.
- [x] Reviewed: Collection tab layout and capacity summary behavior.
- [x] Reviewed: New Game flow including player count, play mode, forced picks, generate/regenerate, and Accept & Log actions.
- [x] Reviewed: History grouping, record visibility, and insights density on phone.
- [x] Reviewed: Backup export/import, per-category reset controls, and full reset discoverability.
- [x] Reviewed: Shared header controls, language switching, theme switching, and bottom navigation.
- [x] Reviewed: One destructive flow via the mobile Backup/reset surface.

## Status notes
- Completed on 2026-04-10 using the running local server at `http://127.0.0.1:8000/`.
- Evidence was gathered through live Playwright interaction, DOM measurements, and mobile screenshots captured at `390x844`.
- No mobile review areas were blocked in this pass.

## Findings summary
- [should-mobile-shell-chrome-consumes-too-much-viewport-height.md](./should-mobile-shell-chrome-consumes-too-much-viewport-height.md)
- [should-mobile-browse-catalog-starts-too-far-below-the-fold.md](./should-mobile-browse-catalog-starts-too-far-below-the-fold.md)
- [should-mobile-history-insights-outweigh-record-review.md](./should-mobile-history-insights-outweigh-record-review.md)
- [should-mobile-backup-screen-turns-routine-maintenance-into-a-long-danger-stack.md](./should-mobile-backup-screen-turns-routine-maintenance-into-a-long-danger-stack.md)
