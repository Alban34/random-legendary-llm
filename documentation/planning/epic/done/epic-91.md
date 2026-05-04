## Epic 91 — Per-Expansion Usage Breakdown in History Insights

**Objective**
Add a ranked per-expansion usage section to the History Insights dashboard so the player can see what percentage of their games each expansion appeared in.

**Background**
The History Insights dashboard already tracks per-card-type rankings (most/least played heroes, masterminds, etc.) and shows `(X%)` relative to total games. However, there is no expansion-level breakdown.

The user's original request — _"In history, we lack the percentage of use per expansions"_ — was closed against Epic 87 which only added `computeExpansionUsagePercent` as a helper and applied it to per-card-type pills. The expansion-level view was never built.

Each `HistoryRecord.setupSnapshot` contains `mastermindId`, `schemeId`, `heroIds`, `villainGroupIds`, and `henchmanGroupIds`. Every entity has a `setId` that resolves to a `GameSet` via `runtime.indexes.setsById`. A game "involves" an expansion if at least one picked entity (of any card type) belongs to that expansion's set.

**In scope**
- New `buildExpansionUsageInsights(runtime, history, totalGames)` function in `src/app/stats-utils.ts`:
  - Iterates all history records
  - For each record, collects the **distinct** set IDs touched across all entity types (mastermind, scheme, heroes, villain groups, henchman groups) — the base set is included like any other
  - Builds a `Record<setId, number>` count of games per set
  - Returns an array sorted by game count descending, then set name ascending: `{ id: string; name: string; games: number; percent: number }[]`
  - `percent` = `computeExpansionUsagePercent(games, totalGames)` (reuse existing helper)
- Include `expansionUsage` in the object returned by `buildInsightsDashboard`
- New `<details>` panel "Expansion Usage" in `src/components/HistoryTab.svelte`, rendered inside `.stats-category-panels`, after the existing per-card-type panels:
  - Summary line (muted): "X of Y expansions appeared in your games" (all sets in `runtime.sets`, not just owned)
  - Ranked list showing all expansions that appeared at least once, each row: expansion name on the left, pill showing `{games} games ({percent}%)` on the right
  - Empty state paragraph when `totalGames === 0`
- New locale keys in all 6 locale files (`en`, `fr`, `de`, `es`, `ja`, `ko`):
  - `history.insights.expansionUsage` — panel heading ("Expansion Usage")
  - `history.insights.expansionUsageSummary` — `{used} of {total} expansions` appeared in your games
  - `history.insights.expansionUsageGames` — pill text: `{games} games ({percent}%)`
  - `history.insights.noExpansionData` — empty state: "Play some games to see expansion usage"
- Unit tests in `src/app/stats-utils.test.ts` covering `buildExpansionUsageInsights`:
  - Empty history → empty array
  - Single record touching two sets → both sets counted at 100%
  - Two records sharing one set → shared set counted as 2 games (100%), unique sets as 1 game (50%)
  - Duplicate set IDs within one record (same expansion for multiple card types) counted only once per game
- Structural test in `src/components/HistoryTab.test.ts` confirming the new locale keys are referenced

**Out of scope**
- Filtering or sorting controls on the expansion list (future enhancement)
- Separating base-set vs. expansion-only sets in the list
- Adding any new route, page, or tab

**Stories**
1. **Add `buildExpansionUsageInsights` to `stats-utils.ts` and include its output in `buildInsightsDashboard`**
2. **Add locale keys for the expansion usage panel to all 6 locale files**
3. **Render the expansion usage `<details>` panel in `HistoryTab.svelte`**
4. **Write unit tests for `buildExpansionUsageInsights` and structural test for locale key references**

**Acceptance Criteria**
- Story 1: `buildExpansionUsageInsights` returns a correctly sorted array with accurate game counts and percentages; `buildInsightsDashboard` includes `expansionUsage` in its return value; edge cases (empty history, zero total) are handled without NaN or runtime errors.
- Story 2: All 6 locale files define `history.insights.expansionUsage`, `history.insights.expansionUsageSummary`, `history.insights.expansionUsageGames`, and `history.insights.noExpansionData`.
- Story 3: The History Insights section contains a collapsible "Expansion Usage" panel after the existing card-type panels; each expansion that appeared in at least one game is listed with its game count and percentage; the panel shows an empty state when no games have been logged.
- Story 4: All new unit tests pass; the structural test confirms the four locale keys are referenced in `HistoryTab.svelte`.
