## Title
Browse welcome area has four CTAs competing for attention in the hero section

## Severity
Nice to change

## Affects
Mobile

## Source
Senior Mobile UX Auditor (review on 2026-05-02)

## Where it appears
Browse tab welcome/hero area, immediately visible on first load after onboarding is dismissed.

## Evidence
After skipping onboarding, the Browse tab shows:
- Heading: "Plan the next Legendary session without the clutter"
- CTA buttons: "Generate a Game" (primary/orange), "Manage Collection", "Replay Walkthrough", "About this project"

Four buttons are presented with equal visual treatment (similar size, same row), though "Generate a Game" has the orange primary style. "Replay Walkthrough" and "About this project" are utility/secondary actions that returning users will rarely use; they compete visually with the primary action on every visit to Browse.

## Why it matters
Multiple competing CTAs increase decision load. On mobile, where space is tight, four buttons make the welcome area feel like a navigation menu rather than a single clear prompt. "Replay Walkthrough" and "About this project" are rarely needed but always visible, adding visual weight that dilutes the primary message.

## Expected benefit
Reducing the welcome area to 1–2 CTAs ("Generate a Game" primary, "Manage Collection" secondary) with "Replay Walkthrough" and "About" moved to a collapsed "About / Help" disclosure would make the welcome area feel decisive and uncluttered. Returning users would reach the primary action faster.

## Recommended change
Move "Replay Walkthrough" into the "▶ Start here" disclosure already present on Browse. Move "About this project" into a footer area or behind a small icon button in the header. Keep only the two action-oriented CTAs ("Generate a Game" and "Manage Collection") in the primary hero area.
