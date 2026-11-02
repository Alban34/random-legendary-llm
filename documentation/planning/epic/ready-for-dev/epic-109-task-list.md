# Epic 109 Task List — Display Hero Team Affiliations in the Collection Card Browser

## Story 109.1 — Expose each hero’s existing team affiliation to the Collection Heroes list

1. - [x] In `src/app/collection-utils.ts`, preserve the existing `teams` values on hero card entries returned for the Collection card browser without changing the card data or the other category entries
2. - [x] Test: add or update collection utility coverage confirming hero entries retain their existing team-affiliation values
3. - [ ] QC (Automated): run the targeted `src/app/collection-utils.test.ts` tests

---

## Story 109.2 — Display each hero’s team name in the specified format

1. - [x] In `src/components/CardBrowserByCategory.svelte`, display each available hero team name after the hero’s name, enclosed in parentheses, in italics, and in a smaller text size than the hero’s name
2. - [x] Test: add or update component coverage verifying that available team names render after hero names in parentheses, italics, and a smaller text size
3. - [ ] QC (Automated): run the targeted `src/components/CardBrowserByCategory.test.ts` and `src/app/collection-utils.test.ts` tests

---

## Story 109.3 — Handle heroes without a team and preserve other category displays

1. - [x] In `src/components/CardBrowserByCategory.svelte`, omit the team name for a hero when no team is available in the data; do not render an empty value or invent a team
2. - [x] Keep the Masterminds, Villain Groups, Henchman Groups, and Schemes entry content and presentation unchanged, and do not change History display logic
3. - [x] Test: add or update coverage confirming heroes without a team show no team value and the four non-Hero lists retain their existing content and presentation
4. - [ ] QC (Automated): run the targeted `src/components/CardBrowserByCategory.test.ts`, `src/components/CollectionTab.test.ts`, and `src/app/collection-utils.test.ts` tests
