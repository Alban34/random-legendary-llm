## Reporter
Senior Accessibility and Interaction Auditor

## Scope
Cross-platform (both desktop at 733px and simulated mobile) review of accessibility, keyboard operability, ARIA semantics, focus management, interaction patterns, and status visibility. Review conducted 2026-05-02.

## Review checklist
- [x] Skip navigation link — checked, not present
- [x] Heading hierarchy — checked, valid H1→H2 structure on reviewed tabs
- [x] Landmark regions — main exists, tabs use role="tablist" with labels
- [x] All buttons have accessible names — confirmed (no unnamed buttons found)
- [x] Locale selector accessible name — confirmed broken (raw key)
- [x] Theme switch focus behavior — confirmed focus returns to triggering button (resolved)
- [x] Locale change confirmation — confirmed toast displays on locale switch (resolved)
- [x] Image alt text — no img elements found in current DOM (icons are emoji or CSS)
- [x] Focus order in header — locale select → dark → light → GitHub → main content
- [x] Tab navigation in header (desktop) — hidden at 733px, correct
- [x] ARIA roles on tab lists — aria-label "Primary" and "Primary mobile" (acceptable)
- [x] Theme group ARIA — role="group" with aria-label="Choose theme" (correct)
- [x] Forced Picks panel — accordion toggle, all form controls have labels
- [x] Toast announcements — sonner toast uses [aria-live] region
- [x] Raw locale key in aria-label — confirmed and documented

## Status notes
- Completed 2026-05-02.
- Prior "must change" findings:
  - Header preference focus restoration → RESOLVED: theme button focus returns correctly; locale toast confirmed.
  - Result entry focus on open → UNVALIDATED: no history in this session; requires live testing with history records.
  - Onboarding focus progression → UNVALIDATED: testing completed with "Skip for now" only.
- New critical defect found: locale selector aria-label uses broken key `header.locale!.groupLabel` — affects all users on all locales (documented in desktop auditor findings).
- No skip navigation link present. Not a severe issue given the short header focus sequence (4 items), but worth noting for users who primarily use keyboard navigation.
- `forcedTeam.*` keys missing from runtime produce raw key text for assistive technologies when they announce the Forced Team section — already covered by desktop auditor finding.

## Findings summary
- [should-accessibility-no-skip-navigation-link.md](should-accessibility-no-skip-navigation-link.md)
- Raw locale key findings deferred to must-desktop-forced-team-raw-locale-key-visible.md and must-desktop-locale-selector-aria-label-raw-key.md (authored by Desktop Auditor).
