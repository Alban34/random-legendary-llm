## Epic 97 — Test Coverage Uplift to 80 %

**Objective**
Raise the overall SonarCloud code coverage from its current 76.2 % to ≥ 80 % by adding targeted unit tests for the most under-covered pure-logic modules, without touching files that are inherently untestable in the vitest/Node environment (Svelte VM files, service worker, browser entry points).

**Background**
As of 2026-05-06, the SonarCloud quality gate is failing on coverage (76.2 % overall; gate requires ≥ 80 %). The coverage audit produced in Story 95.1 (`documentation/planning/epic/epic-95-coverage-audit.md`) identified which files are zero-coverage due to browser/Svelte constraints vs. which files are simply under-tested. This epic targets only the latter — files where vitest unit tests are both feasible and high-yield.

**Coverage baseline (SonarCloud, 2026-05-06)**
| Metric | Value |
|--------|-------|
| Overall coverage | 76.2 % |
| Lines to cover | 2,062 |
| Uncovered lines | 494 |
| Line coverage | 76.0 % |
| Conditions to cover | 1,460 |
| Uncovered conditions | 344 |
| Condition coverage | 76.4 % |

To cross 80 %, approximately 80 additional lines and 70 additional conditions need to be covered.

**Files explicitly excluded** (confirmed untestable in vitest/Node — do not add tests):
- All `*.svelte.ts` VM files (`backup-vm`, `browse-vm`, `history-vm`, `import-vm`, `new-game-vm`, `state-store.svelte.ts`)
- `src/sw.ts` (service worker)
- `src/app/app-init.ts`, `src/app/app-renderer.ts`, `src/app/browser-entry.ts` (browser bootstrappers)
- `src/app/focus-utils.ts`, `src/app/modal-utils.ts` (live DOM dependency)
- `src/app/collection-actions.ts`, `src/app/feedback-utils.ts` (Svelte/toast side-effects)

---

### Story 97.1 — Extend `setup-hero-selector.ts` unit tests (52.3 % → ≥ 90 %)

**File**: `src/app/setup-hero-selector.ts`
**Existing test file**: check for a `setup-hero-selector.test.ts`; create it if absent.

The file exports:
- `canSatisfyHeroRequirements(heroes, requirements)` — checks hero name requirements and count
- `selectHeroes(heroes, requirements, usageBucket, random, forcedHeroIds, preferredExpansionId, forcedTeam)` — returns a `HeroSelectionResult`

**Uncovered paths to target**:
- `canSatisfyHeroRequirements`: scenarios where `heroNameRequirements` is non-empty, where `matchingHeroes.length < requirement.value`, where `nonMatchingHeroes.length < requirements.heroCount - requirement.value`, and where `heroes.length < requirements.heroCount`
- `selectHeroes`: forced-hero unavailability early-return; forced-hero count exceeding available slots; `forcedTeam` path (team-first then general-pool filler); team path where general filler falls short; path where a `preferredExpansionId` is supplied
- All paths that return `reason: ...` strings

**Test approach**: pure unit tests with hand-crafted `HeroRuntime` stubs; no mocking needed. The function accepts plain arrays and a `random` callback.

---

### Story 97.2 — Extend `state-io.ts` unit tests (82.1 % → ≥ 95 %)

**File**: `src/app/state-io.ts`
**Existing test file**: locate `state-io.test.ts` or equivalent.

Add tests for the branches currently uncovered, focusing on:
- Error recovery paths during state load
- Version migration edge cases (if any)
- Empty/null input handling

---

### Story 97.3 — Extend `setup-generator.ts` unit tests (82.9 % → ≥ 92 %)

**File**: `src/app/setup-generator.ts`
**Existing test file**: locate the generator test file.

From the coverage audit (epic-95), the gaps are in "complex combinatorial logic" and "many edge-case branches". Add tests for:
- Epic Mastermind flag when `epicPool` is empty (should throw `newGame.epicMastermind.noCardsError`)
- `hasConstraintSelections` path with `constraintFailureReasons` populated
- The `throw new Error('No legal setup could be generated…')` terminal path
- Any scheme-iteration branches that currently fall through without being hit

---

### Story 97.4 — Extend `state-store.ts` unit tests (83.2 % → ≥ 92 %)

**File**: `src/app/state-store.ts`
**Existing test file**: locate the state-store test file.

Target the persistence and recovery branches identified in the coverage audit:
- Branches in collection ownership state transitions
- Edge cases in the state-store action reducers that are not yet exercised

---

### Story 97.5 — Close gaps in `result-utils.ts` and `state-sanitizer.ts` (84–87 % → ≥ 95 %)

**Files**:
- `src/app/result-utils.ts` (84.7 %)
- `src/app/state-sanitizer.ts` (86.4 %)
- `src/app/history-utils.ts` (86.7 %)

**For `result-utils.ts`**:
- `formatGameResultStatus`: edge case where `result.score` is a non-null number but the locale formatting produces an unusual output
- `normalizeGameResultDraft`: multiplayer path + edge cases in the solo path
- Any negated-condition branches (lines 88 and 274, also targeted by Epic 96 Story 96.3 — coordinate so tests are not duplicated)

**For `state-sanitizer.ts`**:
- The `r.id`-based notice generation paths at lines 113 and 129 (also affected by Epic 96 Story 96.2 — after those fixes land, update tests to match the fixed code)
- Any sanitizer paths that currently return `null` early without being tested

**For `history-utils.ts`**:
- Grouping edge cases and history manipulation branches identified in the coverage audit

**Dependency note**: Stories 97.5 should be scheduled **after** Epic 96 lands, so the tests are written against the corrected source code rather than the code with redundant assertions or unsafe stringification.

---

### Story 97.6 — QC and coverage gate verification

After all unit-test stories are implemented:
- Run the full `npm run test:coverage` report and confirm overall line + condition coverage is ≥ 80 % as measured by SonarCloud after the next main-branch push.
- If coverage is between 79 % and 80 %, identify the next highest-yield untested functions from the coverage report and add focused tests until the threshold is crossed.
- Confirm `npm run lint` exits 0 after all new test files are added.

---

**In Scope**
- Adding new test cases to existing `*.test.ts` files or creating new `*.test.ts` files for the target modules listed above.
- Only pure-function or dependency-injectable modules (no DOM, no Svelte runes, no browser APIs required).

**Out of Scope**
- Svelte VM files, service worker, browser bootstrappers (excluded from testable scope per coverage audit).
- Playwright end-to-end tests (separate concern; the QC agent runs these independently).
- Modifying source files to improve testability (only Epic 96 may touch source files).
- Raising any individual file to 100 % — the goal is to bring the aggregate SonarCloud figure to ≥ 80 %.

**Dependency**
Story 97.5 should be scheduled after Epic 96 is merged, as the sanitizer and result-utils source changes (epic-96 stories 96.2 and 96.3) affect the expected behaviour that the new tests will verify.

**Acceptance Criteria**
- `npm run lint` exits 0 after all test additions.
- `npm test` passes with all new tests green and no existing tests broken.
- After the branch is merged to `main` and SonarCloud analyses it, the Overall Coverage metric is ≥ 80.0 %.
