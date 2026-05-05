# Epic 95 — Test Coverage Improvement

**Objective**
Significantly raise the project's SonarCloud coverage metric by systematically adding unit and integration tests to the most under-tested modules, making the codebase resilient to future regressions.

**In scope**
- All files and modules identified as under-covered in the SonarCloud coverage measure at https://sonarcloud.io/component_measures?id=Alban34_random-legendary-llm&metric=coverage&view=list
- New Vitest unit tests for untested or partially tested utility and helper functions
- New Vitest unit tests for untested or partially tested Svelte components and view-models
- New Vitest unit tests for untested or partially tested stores and app-init logic
- No new user-facing features may be introduced as part of this epic

**Out of scope**
- New Playwright end-to-end tests (those are authored under their own epic)
- Changes to production code solely to make it easier to test (unless the change is also a quality improvement)

**Stories**

### Story 95.1 — Audit coverage gaps by module using the SonarCloud coverage report and define a target threshold
**Acceptance criteria:**
- A written coverage audit lists the lowest-covered modules and states a numeric coverage target (e.g. ≥ 80%)
- No test code is written in this story

### Story 95.2 — Add unit tests for untested or partially tested utility and helper functions
**Acceptance criteria:**
- Branch and line coverage for all utility and helper functions reaches or exceeds the agreed target
- `npm run lint` and `npm test` pass

### Story 95.3 — Add unit tests for untested or partially tested Svelte components and view-models
**Acceptance criteria:**
- Branch and line coverage for all Svelte components and view-models reaches or exceeds the agreed target
- `npm run lint` and `npm test` pass

### Story 95.4 — Add unit tests for untested or partially tested stores and app-init logic
**Acceptance criteria:**
- Branch and line coverage for all stores and app-init modules reaches or exceeds the agreed target
- `npm run lint` and `npm test` pass

### Story 95.5 — Verify overall SonarCloud coverage meets the agreed target threshold
**Acceptance criteria:**
- The SonarCloud `coverage` measure for `Alban34_random-legendary-llm` meets or exceeds the agreed target
- No regression in any test or lint check
