## Title
Desktop Browse entry stacks too many competing starting points before the user takes a first action.

## Severity
Should change

## Affects
Desktop

## Source
Senior Desktop UX Auditor

## Where it appears
Browse tab on first launch and the default Browse state after onboarding is dismissed.

## Evidence
In the live desktop review at `1440x900`, first launch shows a full-width onboarding shell above the existing Browse welcome content. The same default screen also includes a welcome panel with multiple CTA buttons, a separate "Start here" checklist, summary metric tiles, and the full multi-row set catalog. After onboarding is skipped, the Browse screen still opens with the welcome panel, three CTA buttons, three top-level metrics, the checklist, the filter/search controls, and a `Visible sets 33 of 33` counter before the user interacts with the catalog. The post-v1 roadmap and epic notes set a clearer target: the default welcome experience should emphasize primary actions and remove low-value Browse summary metrics from the main flow.

## Why it matters
The desktop landing surface is usable, but it is not disciplined. New users have to parse onboarding, orientation content, metrics, and the full catalog at once, which weakens hierarchy and slows the first meaningful step. Returning users inherit the same clutter even after onboarding is complete.

## Recommended change
Turn the desktop Browse landing state into a more staged experience. When onboarding is visible, suppress or collapse secondary welcome content and keep the catalog clearly downstream of a single transition point. After onboarding is completed, reduce the hero area to one concise intro plus one primary action, remove low-value summary tiles from Browse, and hide the `Visible sets` counter unless a filter materially changes the list.

## Expected UX improvement
The first-run experience becomes easier to understand, the main Browse action becomes more obvious, and desktop users spend less time scanning decorative or redundant content before they can act.

---

> **Catalog count note (added after Epic 51):** The `Visible sets 33 of 33` figure above was accurate at the time of this audit. As of Epic 51 (Game Catalog Data Audit & Correction), five additional expansions were added (Midnight Sons, The Infinity Saga, Weapon X, 2099, Ant-Man and the Wasp), so the live counter now reads `38 of 38` under the default unfiltered state. The UX observation about clutter remains valid regardless of the exact count.
