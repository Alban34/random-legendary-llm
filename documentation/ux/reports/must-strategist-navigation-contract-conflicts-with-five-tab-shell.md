## Title
Navigation contract still conflicts with the shipped five-tab shell

## Severity
Must change

## Affects
Both

## Source
Senior UX Strategist

## Where it appears
`documentation/ui-design.md`, `documentation/roadmap.md`, and `documentation/task-list.md`, compared against `README.md` and `documentation/architecture.md`

## Evidence
`README.md` describes the current product flow across five tabs: Browse, Collection, New Game, History, and Backup.

`documentation/architecture.md` says the shipped shell exposes five primary tab panels with IDs `browse`, `collection`, `new-game`, `history`, and `backup`.

`documentation/ui-design.md` says mobile navigation is a fixed bottom tab bar with four equal-width items, which conflicts with the same document later defining Tab 5 as Backup & Data Management.

`documentation/roadmap.md` still defines the UI shell deliverable as four section panels: Browse, Collection, New Game, and History.

`documentation/task-list.md` still marks Epic 4 Story 4.1 complete with the task Add four main tab panels.

## Why it matters
This leaves the repo with no single trustworthy shell information-architecture baseline. Anyone using the docs to reason about navigation, responsive behavior, onboarding placement, or QC coverage can start from the wrong surface model. On mobile in particular, a four-item bottom-bar assumption drives materially different affordance, spacing, and discoverability decisions than a five-tab product.

## Recommended change
Promote one canonical current-shell contract across the documentation set and archive or explicitly label older four-panel wording as historical. Update the shell diagram, responsive-navigation guidance, roadmap snapshot, and implementation/task references so they all describe the same five-tab product. The mobile section should also state the intended treatment for five primary destinations instead of implying a four-item bar.

## Expected UX improvement
Future UX work, QA, and product discussions will evaluate the same navigation model, reducing avoidable design drift and making mobile-information-architecture tradeoffs explicit instead of accidental.
