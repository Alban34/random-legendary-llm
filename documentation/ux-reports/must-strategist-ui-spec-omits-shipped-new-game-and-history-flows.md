## Title
Primary UI spec omits shipped New Game and History flows that now define the core product journey

## Severity
Must change

## Affects
Both

## Source
Senior UX Strategist

## Where it appears
`documentation/ui-design.md`, compared against `documentation/setup-rules.md`, `documentation/data-model.md`, `documentation/post-v1-roadmap.md`, `documentation/testing-qc-strategy.md`, and the Epic 12, 14, 15, 19, and 20 test suites

## Evidence
`documentation/setup-rules.md` defines shipped play modes beyond Advanced Solo, including Two-Handed Solo, guided forced picks, and the rule that Accept & Log opens immediate result entry while still allowing later completion from History.

`documentation/data-model.md` defines pending and completed game results, editable result data, normalized `playMode`, and derived insights built from history and usage.

`documentation/testing-qc-strategy.md` documents browser and module coverage for immediate result entry, result editing, grouped history interactions, insights dashboards, forced-pick legality, and locale-aware history behavior.

The repository test suite confirms those behaviors are treated as shipped contracts, including `test/epic12-score-history.test.mjs`, `test/epic14-stats-dashboard.test.mjs`, `test/epic15-forced-picks.test.mjs`, `test/epic20-history-grouping.test.mjs`, and their Playwright QC counterparts.

`documentation/ui-design.md` still documents New Game primarily as player-count buttons plus an Advanced Solo checkbox and documents History primarily as grouped records. It does not define the current UX for play-mode selection, forced-pick selection and clearing, result-entry states, result editing, pending-versus-completed history distinctions, or the insights presentation that the rest of the repo treats as baseline behavior.

## Why it matters
New Game and History are the product’s highest-value recurring workflows. When the primary UI spec omits large parts of those flows, the documentation no longer supports coherent UX review, future refinement, or implementation alignment. Teams are forced to reverse-engineer behavior from tests and code instead of using an explicit UX contract.

## Recommended change
Update the UI specification so it describes the current shipped New Game and History experience end to end. At minimum, add the present contract for play-mode selection, forced-pick review and clearing, Accept-to-result-entry flow, skip-and-edit-later behavior, pending and completed history states, grouped-history interactions, and the insights area including sparse-data and empty-state expectations.

## Expected UX improvement
The repo regains a usable source of truth for the product’s primary task flows, making future UX decisions faster, less error-prone, and easier to validate against intended user experience rather than implementation archaeology.