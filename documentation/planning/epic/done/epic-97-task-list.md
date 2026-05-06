# Epic 97 — Test Coverage Uplift to 80% — Task List

**Objective**: Raise overall SonarCloud code coverage from 76.2% to ≥ 80% by adding targeted unit tests for under-covered pure-logic modules.
**Constraint**: No source files may be modified. Only test files (`*.test.ts`) may be added or extended.

---

## Story 97.1 — Extend `setup-hero-selector.ts` unit tests (52.3% → ≥ 90%)

**Source file**: `src/app/setup-hero-selector.ts`

- [x] Check whether `src/app/setup-hero-selector.test.ts` exists; create it if absent
- [x] Read `src/app/setup-hero-selector.ts` in full to understand all exported signatures and internal branches
- [x] Add test: `canSatisfyHeroRequirements` — `heroNameRequirements` is non-empty and all name requirements are satisfiable (passing case)
- [x] Add test: `canSatisfyHeroRequirements` — `matchingHeroes.length < requirement.value` (returns failure with `reason`)
- [x] Add test: `canSatisfyHeroRequirements` — `nonMatchingHeroes.length < requirements.heroCount - requirement.value` (returns failure with `reason`)
- [x] Add test: `canSatisfyHeroRequirements` — `heroes.length < requirements.heroCount` (returns failure with `reason`)
- [x] Add test: `selectHeroes` — forced-hero unavailability early-return path (returns result with `reason`)
- [x] Add test: `selectHeroes` — forced-hero count exceeds available slots (returns result with `reason`)
- [x] Add test: `selectHeroes` — `forcedTeam` path: team-first selection then general-pool filler completes the count
- [x] Add test: `selectHeroes` — `forcedTeam` path where general-pool filler falls short (returns result with `reason`)
- [x] Add test: `selectHeroes` — `preferredExpansionId` supplied; preferred heroes are selected ahead of others
- [x] Verify every `reason: ...` string path is exercised by at least one test
- [x] Test: run `npm test -- setup-hero-selector` and confirm all new tests pass with no regressions
- [x] QC (Automated): confirm `npm run lint` exits 0 after test file changes

---

## Story 97.2 — Extend `state-io.ts` unit tests (82.1% → ≥ 95%)

**Source file**: `src/app/state-io.ts`

- [x] Locate the existing test file for `state-io.ts` (search for `state-io.test.ts` or equivalent)
- [x] Read `src/app/state-io.ts` in full to map uncovered branches
- [x] Read the existing test file to understand current coverage and avoid duplicating tests
- [x] Add test: error recovery path during state load — corrupt/unparseable stored data is handled gracefully
- [x] Add test: error recovery path during state load — storage read throws an exception
- [x] Add test: version migration edge case — input at the lowest supported version migrates correctly to current
- [x] Add test: version migration edge case — input at an unrecognised/future version is handled without throwing
- [x] Add test: empty input (empty string or `null`) passed to the load function returns a safe default
- [x] Test: run `npm test -- state-io` and confirm all new tests pass with no regressions
- [x] QC (Automated): confirm `npm run lint` exits 0 after test file changes

---

## Story 97.3 — Extend `setup-generator.ts` unit tests (82.9% → ≥ 92%)

**Source file**: `src/app/setup-generator.ts`

- [x] Locate the existing test file for `setup-generator.ts`
- [x] Read `src/app/setup-generator.ts` in full to map uncovered branches
- [x] Read the existing test file to understand current coverage and avoid duplicating tests
- [x] Add test: Epic Mastermind flag is set but `epicPool` is empty — generator throws error matching `newGame.epicMastermind.noCardsError` (already covered by existing epic-71 tests)
- [x] Add test: `hasConstraintSelections` path with `constraintFailureReasons` populated — forced heroIds + scheme hero overflow triggers `trySchemeForSetup` branch that adds specific forced-hero reason
- [x] Add test: terminal throw path — no legal setup can be generated, resulting in `'No legal setup could be generated from the current owned collection for the selected play mode.'`
- [x] Add tests for any scheme-iteration branches identified in the source that are not currently exercised — added test for `tryMastermindForScheme` `heroSelection.reason` path via hero-name-requirements conflict
- [x] Test: run `npm test -- setup-generator` and confirm all new tests pass with no regressions
- [x] QC (Automated): confirm `npm run lint` exits 0 after test file changes

---

## Story 97.4 — Extend `state-store.ts` unit tests (83.2% → ≥ 92%)

**Source file**: `src/app/state-store.ts`

- [x] Locate the existing test file for `state-store.ts`
- [x] Read `src/app/state-store.ts` in full to map uncovered branches
- [x] Read the existing test file to understand current coverage and avoid duplicating tests
- [x] Add tests for collection ownership state transition branches not yet exercised (identify exact transitions from source)
- [x] Add tests for edge cases in state-store action reducers not currently hit
- [x] Test: run `npm test -- state-store` and confirm all new tests pass with no regressions
- [x] QC (Automated): confirm `npm run lint` exits 0 after test file changes

---

## Story 97.5 — Close gaps in `result-utils.ts`, `state-sanitizer.ts`, `history-utils.ts` (84–87% → ≥ 95%)

> **Dependency**: This story must NOT be started until Epic 96 is fully merged to `main`. Epic 96 stories 96.2 and 96.3 modify `src/app/state-sanitizer.ts` and `src/app/result-utils.ts` respectively. All tests in this story must be written against the post-Epic-96 source code.

**Source files**:
- `src/app/result-utils.ts` (84.7%)
- `src/app/state-sanitizer.ts` (86.4%)
- `src/app/history-utils.ts` (86.7%)

- [x] **GATE**: Confirm Epic 96 is merged to `main` before starting any tasks in this story
- [x] Locate the existing test files for `result-utils.ts`, `state-sanitizer.ts`, and `history-utils.ts`
- [x] Read all three source files in full (post-Epic-96 versions) to map remaining uncovered branches
- [x] Read all three existing test files to understand current coverage and avoid duplicating tests

**`result-utils.ts`**:
- [x] Add test: `formatGameResultStatus` — `result.score` is a non-null number; confirm locale formatting produces the expected output string
- [x] Add test: `normalizeGameResultDraft` — multiplayer path (> 1 player)
- [x] Add test: `normalizeGameResultDraft` — solo path edge cases not yet covered
- [x] Add test: negated-condition branch at L88 (post-Epic-96-96.3 refactor; verify exact line before writing)
- [x] Add test: negated-condition branch at L274 (post-Epic-96-96.3 refactor; verify exact line before writing)

**`state-sanitizer.ts`**:
- [x] Add test: notice generation path at L113 (post-Epic-96-96.2 fix; verify exact line before writing)
- [x] Add test: notice generation path at L129 (post-Epic-96-96.2 fix; verify exact line before writing)
- [x] Add test: sanitizer path that returns `null` early — confirm null is returned under the triggering condition

**`history-utils.ts`**:
- [x] Add tests for grouping edge cases identified in the source (e.g. entries with identical dates, empty history)
- [x] Add tests for history manipulation branches not currently exercised

- [x] Test: run `npm test -- result-utils state-sanitizer history-utils` and confirm all new tests pass with no regressions
- [x] QC (Automated): confirm `npm run lint` exits 0 after test file changes

---

## Story 97.6 — QC and Coverage Gate Verification

- [x] Run `npm run test:coverage` and capture the full coverage report
- [x] Confirm overall line coverage ≥ 80% and condition coverage ≥ 80% in the local report
- [x] If overall coverage is between 79% and 80%, identify the next highest-yield untested functions from the coverage report and add focused tests until the threshold is crossed
- [x] Confirm `npm run lint` exits 0 across all test files added in stories 97.1–97.5
- [x] Push branch to `main` (or open PR) and confirm SonarCloud Overall Coverage is ≥ 80.0% after analysis completes
- [x] QC (Automated): run full `npm test` suite and confirm no regressions across the entire test suite
- [x] QC (Automated): run `npx playwright test` and confirm no end-to-end regressions

---

## Epic-Level Acceptance Checklist

- [x] `npm run lint` exits 0
- [x] `npm test` passes — all new tests green, no existing tests broken
- [x] SonarCloud Overall Coverage ≥ 80.0% on `main` after merge
- [x] No source files under `src/` were modified (only `*.test.ts` files added or extended)
- [x] Story 97.5 was implemented after Epic 96 was merged (dependency honoured)
