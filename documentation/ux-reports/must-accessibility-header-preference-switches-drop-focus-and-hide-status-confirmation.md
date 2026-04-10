## Title
Header preference switches drop focus and provide no dependable confirmation outside Collection

## Severity
Must

## Affects
- Desktop header theme switching
- Desktop header locale switching
- Mobile header theme and locale switching
- All tabs except Collection, where the only visible status line currently appears

## Source
- README.md shared-header preference flow
- documentation/post-v1-roadmap.md Milestone 4 acceptance criteria for legible, accessible theme behavior
- Runtime audit with Playwright on 2026-04-10
- Source inspection in src/app/browser-entry.mjs and src/app/app-renderer.mjs

## Where it appears
- Shared header theme buttons
- Shared header locale select

## Evidence
- The header actions set success copy through ui.lastActionNotice, but the visible Latest action line is rendered only in the Collection panel.
- In src/app/browser-entry.mjs, setTheme() and setLocale() both call applyStateUpdate(...) and rerender the shell without restoring focus to the triggering control.
- Runtime check after activating the Light theme returned activeTag BODY while the theme changed successfully.
- Runtime check after selecting fr-FR returned activeTag BODY while the document language and title updated successfully.

## Why it matters
Keyboard, switch, and screen-reader users lose their place immediately after changing a core preference. The change technically succeeds, but the interaction does not provide a stable focus target or a dependable status message in the same area where the change was made. That weakens confidence for a high-frequency global control and makes repeated adjustments unnecessarily disorienting.

## Recommended change
- Restore focus to the activated theme button after rerender.
- Restore focus to the locale select after rerender.
- Add a header-adjacent status message or success toast for theme and locale changes so confirmation is available from any tab, not only Collection.
- Keep the confirmation channel polite rather than assertive because these are user-initiated preference changes.

## Expected UX improvement
Header preference changes will feel reliable and reversible: keyboard users stay anchored in the control group, assistive technology users receive a clear confirmation, and users on non-Collection tabs no longer have to infer whether the change persisted.