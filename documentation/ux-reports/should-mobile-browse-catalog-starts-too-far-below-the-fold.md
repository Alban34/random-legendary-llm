## Title
Mobile Browse makes the actual set catalog arrive too far below the fold.

## Severity
Should change

## Affects
Mobile

## Source
Senior Mobile UX Auditor

## Where it appears
Browse tab after onboarding is skipped and in the default returning-user Browse state.

## Evidence
In the live mobile review at `390x844`, the Browse page still opens with a welcome card, CTA buttons, summary metrics, and a separate `Start here` checklist before the set catalog begins. DOM measurements showed the catalog panel starting at about `1216px`, immediately after the `Start here` block ended around `1200px`. The screenshot confirms the user must scroll through a long orientation stack before reaching the actual set-browsing surface that drives collection management.

## Why it matters
On mobile, vertical hierarchy is the product. When the catalog starts more than a full screen below the opening content, the app delays the first meaningful action and makes the Browse tab feel like marketing copy instead of a tool. Returning users pay that cost repeatedly.

## Recommended change
Reduce Browse to one short mobile intro and one primary CTA, then bring the set filters and catalog directly into view. Fold the secondary checklist into onboarding, collapse summary metrics behind an optional details expander, and let the catalog start much closer to the top of the mobile panel.

## Expected UX improvement
Users reach collection-building faster, the Browse tab feels more purposeful, and the mobile landing state becomes easier to scan and act on.