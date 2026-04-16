## Epic 44 — Card Browser by Category or Expansion in Collection


**Objective**
Add a card-browser mode to the Collection tab that lists every individual card from the user's owned expansions, grouped either by card category (Heroes, Masterminds, Villain Groups, Henchman Groups, Schemes) or by expansion, with cards sorted alphabetically within each group — giving players a quick reference to their full owned card pool.

**In scope**
- a mode toggle on the Collection tab to switch between the existing set-ownership view and the new card-browser view
- a grouping selector within the card browser offering two options: "by category" and "by expansion"
- all five card categories: Heroes, Masterminds, Villain Groups, Henchman Groups, Schemes
- cards drawn exclusively from the user's currently owned expansions
- alphabetical ordering of cards within every group
- hiding empty category or expansion sections (no owned cards of that type)

**Out of scope**
- cards from unowned expansions
- any card detail view, card image, or link to external resources
- filtering by card attributes beyond the two grouping modes
- changes to the existing set-ownership toggle UI or its behavior

**Stories**
1. **Add a mode toggle to the Collection tab to switch between the set-ownership view and the card-browser view**
2. **Build the card-browser data layer that aggregates owned-expansion cards and supports grouping by category or by expansion**
3. **Render the "by category" grouping with alphabetically sorted cards under each category heading**
4. **Render the "by expansion" grouping with alphabetically sorted cards under each expansion heading**
5. **Add a grouping selector within the card browser that persists the active grouping for the session**

**Acceptance Criteria**
- Story 1: The Collection tab exposes a control (e.g., segmented button or toggle) to switch between the set-ownership view and the card-browser view; switching modes does not alter the user's owned-expansion selections; the set-ownership view is visually and functionally unchanged.
- Story 2: The data layer accepts the current owned-expansion set and returns all cards across all five categories from those expansions only; cards from unowned expansions are excluded; the output can be grouped by category (five buckets) or by expansion (one bucket per owned set), with cards in ascending alphabetical order within each bucket.
- Story 3: When "by category" is active, five section headings appear (Heroes, Masterminds, Villain Groups, Henchman Groups, Schemes); each section lists only cards from owned expansions sorted A–Z by card name; sections with zero owned cards are not rendered.
- Story 4: When "by expansion" is active, one section per owned expansion appears; expansion sections are sorted A–Z by expansion name; within each section all cards regardless of category are listed A–Z by card name.
- Story 5: A grouping selector is visible inside the card-browser view; switching between "by category" and "by expansion" updates the list immediately without a page reload; the last-selected grouping is retained for the duration of the browser session.
