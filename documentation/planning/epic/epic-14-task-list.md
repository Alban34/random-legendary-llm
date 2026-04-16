## Epic 14 — Insights and Statistics Dashboard

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 14 work complete

### Story 14.1 — Define the derived metrics that can be computed from history and usage state
- [x] Define the initial metrics set for counts, outcomes, freshness, and score trends
- [x] Identify which metrics require score data and which can rely on usage data alone
- [x] Define calculation windows and empty-state behavior
- [x] Document tie-breaking and ranking rules for repeated entities
- [x] **Test:** verify metric definitions produce stable expected outputs for representative sample histories
- [x] **QC (Automated):** automate QC coverage for edge cases such as no history, one game, and partial score coverage

### Story 14.2 — Compute summary statistics for games played, outcomes, and scores
- [x] Implement selectors or helpers for total games, wins, losses, and score aggregates
- [x] Compute ratios and averages safely without divide-by-zero behavior
- [x] Keep derived metrics deterministic and independent of presentation order
- [x] Recompute summaries when history or results change
- [x] **Test:** verify summary statistics across mixed win/loss and scored/unscored histories
- [x] **QC (Automated):** automate QC coverage for summary cards updating after a new result is logged

### Story 14.3 — Surface most-played and least-played cards or groups across categories
- [x] Define which categories appear in ranking views
- [x] Build ranking helpers from usage stats and accepted history
- [x] Handle ties and low-sample-size displays sensibly
- [x] Show enough context for duplicate display names from different sets
- [x] **Test:** verify rankings are correct and stable for duplicate names and tied play counts
- [x] **QC (Automated):** automate QC coverage for rankings containing duplicate-name entities from different sets

### Story 14.4 — Add a dedicated stats presentation in History or a new insights view
- [x] Decide whether stats live in the History tab or in a separate section
- [x] Add summary cards, charts, or ranked lists consistent with the app design system
- [x] Preserve responsive layout and accessibility for data-heavy content
- [x] Keep stats understandable without requiring a large play history
- [x] **Test:** verify the stats UI renders correctly for empty, light, and heavy datasets
- [x] **QC (Automated):** automate QC coverage for the stats layout on mobile and desktop viewports

### Story 14.5 — Handle sparse or partial data gracefully so early users still see useful feedback
- [x] Add empty states and explanatory helper text for thin datasets
- [x] Hide or soften metrics that would otherwise mislead users with too little data
- [x] Distinguish unavailable data from a true zero result
- [x] Preserve a useful first impression after only one or two logged games
- [x] **Test:** verify sparse-data states render helpful messaging instead of broken or misleading metrics
- [x] **QC (Automated):** automate QC coverage for a fresh install and a minimally populated history state

---
