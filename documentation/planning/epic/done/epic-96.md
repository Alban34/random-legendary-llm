## Epic 96 — SonarCloud Code Quality Remediation (Round 2)

**Objective**
Resolve all 18 open SonarCloud code-quality findings so the project's Maintainability quality gate is clean and no new issues accumulate from the code shipped since Epic 28.

**Background**
Epic 28 cleared 61 SonarCloud findings across the original codebase. Subsequent work (epics 29–95) introduced new source files and logic, producing 18 new open findings that are now blocking the quality gate. All 18 are Maintainability / Minor or Major code smells. No security or reliability findings are present.

**SonarCloud project**: `Alban34_random-legendary-llm` — last analysed 2026-05-06.

---

### Issue Inventory

#### Story 96.1 — Remove redundant type assertions (9 occurrences)

All flagged by Sonar rule: *"This assertion is unnecessary since it does not change the type of the expression."*

| File | Line | Pattern to remove |
|------|------|-------------------|
| `src/app/game-data-normalizer.ts` | 237 | Redundant `as` cast |
| `src/app/new-game-utils.ts` | 57 | Redundant `as` cast |
| `src/app/result-utils.ts` | 181 | `recovered as boolean` — `recovered` is already inferred as `boolean` |
| `src/app/setup-generator.ts` | 277 | Redundant `as` cast |
| `src/app/setup-generator.ts` | 281 | Redundant `as` cast |
| `src/app/setup-generator.ts` | 286 | Redundant `as` cast |
| `src/app/setup-generator.ts` | 289 | Redundant `as` cast (appears twice → could be a single expression) |
| `src/app/setup-validator.ts` | 94 | Redundant `as` cast |
| `src/app/setup-validator.ts` | 104 | Redundant `as` cast |

**Fix**: Remove the `as Type` assertion at each location. If TypeScript then reports a type error, the correct fix is to narrow the type properly (e.g. a type guard or explicit return-type annotation) — not to leave the cast in place.

**Test**: Run `npm run lint` and `npm run build` (TypeScript compilation) after each file to confirm no type errors are introduced.

---

#### Story 96.2 — Fix unsafe object-to-string conversions (5 occurrences)

All flagged by Sonar rule: *"'X' may use Object's default stringification format '[object Object]' when stringified."*

| File | Line | Expression flagged |
|------|------|--------------------|
| `src/app/history-utils.ts` | 132 | `result.score` (typed as `unknown` or union with object type) |
| `src/app/localization-utils.ts` | 27 | `value` (typed as `unknown` or loose union) |
| `src/app/result-utils.ts` | 281 | `result.score` used in a template literal or string context |
| `src/app/state-sanitizer.ts` | 113 | `` `${String(r.id ?? 'unknown')}` `` — `r.id` is `unknown`, so `r.id ?? 'unknown'` is still `unknown` before `String()` |
| `src/app/state-sanitizer.ts` | 129 | Same pattern as L113 |

**Fix guidelines**:
- `state-sanitizer.ts` (both lines): replace `r.id ?? 'unknown'` inside the `String()` call with an explicit string-narrowing guard, e.g. `typeof r.id === 'string' ? r.id : 'unknown'`, so the type passed to `String()` is guaranteed to be `string`. The `String()` wrapper is then redundant and can be dropped.
- `result-utils.ts` L281: if `result.score` is already narrowed to a numeric type at that point, confirm the narrowing is visible to TypeScript; if not, add an explicit check before using it in string context.
- `history-utils.ts` L132 and `localization-utils.ts` L27: apply the same pattern — either narrow the type before stringification or use `JSON.stringify` if the value is intentionally object-typed.
- Do **not** mask the issue by adding a blanket `String()` wrapper around an `unknown` value; that would still trigger the rule.

**Test**: After each fix, verify `npm run lint` passes and that existing unit tests for the affected file still pass.

---

#### Story 96.3 — Simplify negated conditions (2 occurrences)

Flagged by Sonar rule: *"Unexpected negated condition."*

| File | Lines |
|------|-------|
| `src/app/result-utils.ts` | 88 |
| `src/app/result-utils.ts` | 274 |

**Fix**: Sonar's "Unexpected negated condition" fires when the true-branch of an `if (!condition)` could be rewritten as `if (condition)` by swapping the branches, improving readability. At each location, invert the condition and swap the `if`/`else` branches so the positive case comes first. If the negated condition is an early-return guard (no `else` branch), consider whether an alternative structure (e.g. a positive-branch predicate) is clearer; if the early-return is the clearest form, annotate with an inline suppression comment and document the reasoning.

**Test**: `npm run lint` passes; existing `result-utils` unit tests still pass unchanged.

---

#### Story 96.4 — Reduce `buildCategorySelection` parameter count (1 occurrence)

Flagged by Sonar rule: *"Function 'buildCategorySelection' has too many parameters (8). Maximum allowed is 7."*

**File**: `src/app/setup-category-selector.ts` — `buildCategorySelection` at line 139.

**Current signature** (8 parameters):
```typescript
export function buildCategorySelection(
  pools: GamePool,
  requirements: SchemeRequirements,
  scheme: SchemeRuntime,
  mastermind: MastermindRuntime,
  usageBucket: UsageState,
  random: () => number,
  forcedPicks: ForcedPicks,
  opts: { template: SetupTemplate; preferredExpansionId?: string | null }
): CategorySelectionResult
```

**Recommended fix**: Fold `random` and `forcedPicks` into the existing `opts` parameter object, reducing the count to 6:
```typescript
export function buildCategorySelection(
  pools: GamePool,
  requirements: SchemeRequirements,
  scheme: SchemeRuntime,
  mastermind: MastermindRuntime,
  usageBucket: UsageState,
  opts: {
    template: SetupTemplate;
    preferredExpansionId?: string | null;
    random: () => number;
    forcedPicks: ForcedPicks;
  }
): CategorySelectionResult
```
Update every call site of `buildCategorySelection` in the codebase to pass `random` and `forcedPicks` inside the `opts` object. The single known call site is inside `setup-generator.ts`; search for any additional call sites with `grep`.

**Test**: `npm run lint` passes; `npm run build` compiles without type errors; all existing `setup-category-selector` and `setup-generator` unit tests pass.

---

**In Scope**
- Exactly the 18 findings listed above, in exactly the files and at exactly the lines listed.
- TypeScript compilation must remain error-free after each fix.

**Out of Scope**
- Architectural refactors beyond what is required to satisfy the Sonar rules.
- Any new features, new tests, or behavioural changes. This epic is purely remediation.
- The 3 unreviewed Security Hotspots (separate concern, separate tracking).

**Acceptance Criteria**
- `npm run lint` exits 0 with no new errors after all fixes are applied.
- `npm run build` (TypeScript compilation) succeeds with zero type errors.
- All existing unit tests (`npm test`) continue to pass unchanged — no test modifications are allowed except to update call sites of `buildCategorySelection` if any test directly calls that function.
- SonarCloud re-analysis after the branch is merged to `main` shows 0 open issues for the files listed above.
