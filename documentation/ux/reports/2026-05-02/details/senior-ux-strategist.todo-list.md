## Reporter
Senior UX Strategist

## Scope
Documentation-first UX review of epics 69-74 (completed since 2026-04-10): toast migration (E69), preferred expansion (E70), epic mastermind (E71), active expansions collapsed (E72), solo always-leads suppression (E73), and forced hero team (E74). Review focused on whether documentation reflects shipped features, identifies ambiguity, and records live-validation hypotheses.

## Review checklist
- [x] Reviewed Epic 69 (svelte-sonner) task list — no UX contract changes required
- [x] Reviewed Epic 70 (Preferred Expansion) task list and ui-design.md coverage
- [x] Reviewed Epic 71 (Epic Mastermind) task list and ui-design.md coverage
- [x] Reviewed Epic 72 (Active Expansions) task list and ui-design.md coverage
- [x] Reviewed Epic 73 (Solo Always Leads) task list and ui-design.md coverage
- [x] Reviewed Epic 74 (Forced Hero Team) task list and ui-design.md coverage
- [x] Cross-checked README.md for product framing updates
- [x] Compared ui-design.md New Game section against implemented features
- [x] Compared ui-design.md History section against implemented features
- [x] Verified prior "must" and "should" findings remain in scope
- [x] Identified documentation gaps and live-validation hypotheses

## Status notes
- Completed documentation-first strategist pass on 2026-05-02.
- ui-design.md has been partially updated to include new features (E70–E74) but lacks clarity on result-view behavior changes introduced by Epic 73 (solo mode "Always Leads" suppression).
- README.md is significantly outdated and omits all 5 game-facing epics completed since 2026-04-10.
- Prior "must" accessibility findings (header focus, result-entry error announcement) remain unresolved per source code review and should be re-validated by desktop and mobile auditors in the live app.
- Active Expansions collapse (E72) and Epic Mastermind opt-in (E71) add new interaction surface that has not been previously audited.

## Live-validation hypotheses for desktop and mobile auditors
- Forced Picks panel (New Game) may now feel dense: preferred expansion + forced heroes + forced villain groups + forced team + Epic Mastermind mode toggle in one accordion — check hierarchy and cognitive load.
- Active Expansions section collapsed by default: confirm the toggle button's label and `aria-expanded` clearly communicate the section exists and can be opened; check discoverability.
- Epic Mastermind mode toggle: confirm visible only when eligible expansions are in the collection; confirm error case when selected but pool empty is communicated clearly.
- Forced Hero Team selector: confirm team names are readable at both desktop and mobile widths; check "unavailable" state message is visible when no hero has team affiliation.
- Solo mode result view: confirm "Always leads" label/indicator is absent in solo modes after E73; confirm it still appears in multiplayer mode.
- svelte-sonner toast behavior (E69): confirm toasts appear at bottom-center, clear the mobile bottom nav, and display rich colors for success/info/warning/error.

## Findings summary
- [must-strategist-readme-omits-5-new-game-features.md](must-strategist-readme-omits-5-new-game-features.md)
- [should-strategist-ui-design-lacks-clarity-on-always-leads-solo-suppression.md](should-strategist-ui-design-lacks-clarity-on-always-leads-solo-suppression.md)
