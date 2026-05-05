# Epic 94 — Code Duplication Reduction

**Objective**
Drive the SonarCloud duplicated-lines density from the current 3.5% down to below 1% by extracting repeated logic and markup patterns into shared utilities and components, without changing any observable application behavior.

**In scope**
- All duplicate code blocks reported in the SonarCloud duplication measure at https://sonarcloud.io/component_measures?id=Alban34_random-legendary-llm&metric=duplicated_lines_density&view=list
- Extraction of repeated TypeScript logic into shared utility or helper functions
- Extraction of repeated Svelte markup and style patterns into reusable components or shared CSS
- No new user-facing features may be introduced as part of this epic

**Out of scope**
- Refactors that change component interfaces or public API contracts

**Stories**

### Story 94.1 — Audit all files flagged by SonarCloud and produce a prioritized deduplication inventory
**Acceptance criteria:**
- A written inventory lists every duplicated block by file and priority
- No code changes are made in this story

### Story 94.2 — Extract repeated TypeScript logic into shared utility or helper functions
**Acceptance criteria:**
- All TypeScript-level duplications identified in the inventory are eliminated
- Extracted helpers are covered by existing or new unit tests
- `npm run lint` and `npm test` pass

### Story 94.3 — Refactor repeated Svelte markup and style patterns into reusable components or shared CSS
**Acceptance criteria:**
- All Svelte markup/style duplications are eliminated via shared components or CSS
- `npm run lint` and `npm test` pass
- Visual output is unchanged

### Story 94.4 — Confirm SonarCloud duplication density falls below 1% after all refactors land
**Acceptance criteria:**
- The SonarCloud measure for `duplicated_lines_density` reads below 1%
- No regression in any test suite
