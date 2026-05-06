# Epic 96 — SonarCloud Code Quality Remediation (Round 2) — Task List

**Objective**: Resolve all 18 open SonarCloud code-quality findings (all Maintainability code smells) in source files under `src/app/`.

---

## Story 96.1 — Remove Redundant Type Assertions (9 occurrences)

- [x] Read `src/app/game-data-normalizer.ts` around L237 and identify the redundant `as` cast; remove it.
- [x] Read `src/app/new-game-utils.ts` around L57 and identify the redundant `as` cast; remove it.
- [x] Read `src/app/result-utils.ts` around L181 and remove `as boolean` (type is already inferred as `boolean`).
- [x] Read `src/app/setup-generator.ts` around L277, L281, L286, and L289; remove all four redundant `as` casts.
- [x] Read `src/app/setup-validator.ts` around L94 and L104; remove both redundant `as` casts.
- [x] After each removal, verify TypeScript still compiles cleanly; if a type error surfaces, narrow the type with a type guard or explicit return-type annotation instead of re-adding the cast.
- [x] **Test 96.1**: Run `npm run lint` and `npm run build`; confirm both exit 0 and no existing unit tests are broken.

---

## Story 96.2 — Fix Unsafe Object-to-String Conversions (5 occurrences)

- [x] Read `src/app/state-sanitizer.ts` around L113; replace `String(r.id ?? 'unknown')` with `typeof r.id === 'string' ? r.id : 'unknown'` (drop the outer `String()` wrapper entirely).
- [x] Read `src/app/state-sanitizer.ts` around L129; apply the same fix as L113.
- [x] Read `src/app/result-utils.ts` around L281; confirm `result.score` is narrowed to a numeric type before string use; if not, add an explicit narrowing check before stringification.
- [x] Read `src/app/history-utils.ts` around L132; narrow the type of `result.score` before stringification, or use `JSON.stringify` if the value is intentionally object-typed. Do NOT mask with a blanket `String()` around an `unknown`.
- [x] Read `src/app/localization-utils.ts` around L27; narrow the type of `value` before stringification, or use `JSON.stringify` if intentionally object-typed. Do NOT mask with a blanket `String()` around an `unknown`.
- [x] **Test 96.2**: Run `npm run lint` and `npm run build`; confirm both exit 0 and no existing unit tests are broken.

---

## Story 96.3 — Simplify Negated Conditions (2 occurrences)

- [x] Read `src/app/result-utils.ts` around L88; invert the negated condition and swap the if/else branches so the positive case comes first. If it is a single-branch early-return guard and the inverted form is genuinely less clear, add an inline suppression comment and document the reasoning in a code comment.
- [x] Read `src/app/result-utils.ts` around L274; apply the same inversion fix.
- [x] **Test 96.3**: Run `npm run lint` and `npm run build`; confirm both exit 0 and no existing unit tests are broken.

---

## Story 96.4 — Reduce `buildCategorySelection` Parameter Count (1 occurrence)

- [x] Search for all call sites of `buildCategorySelection` across the codebase (primary call site expected in `src/app/setup-generator.ts`); record every file and line before making any changes.
- [x] Read the current signature of `buildCategorySelection` in `src/app/setup-category-selector.ts` at L139 to confirm the exact existing parameter list.
- [x] Refactor the signature: fold `random: () => number` and `forcedPicks: ForcedPicks` into the existing `opts` object parameter, producing a 6-parameter function:
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
- [x] Update the function body in `src/app/setup-category-selector.ts` to destructure `random` and `forcedPicks` from `opts`.
- [x] Update every call site found in the earlier search step: move the `random` and `forcedPicks` arguments into the `opts` object literal at each call site.
- [x] **Test 96.4**: Run `npm run lint` and `npm run build`; confirm both exit 0 and no existing unit tests are broken.

---

## Epic 96 — QC (Automated)

- [x] Run `npm run lint`; confirm exit code 0 with no warnings or errors introduced by the epic changes.
- [x] Run `npm run build`; confirm exit code 0 with no TypeScript compilation errors.
- [x] Confirm all existing unit tests pass (no regressions from the type-assertion removals, string-narrowing changes, condition inversions, or parameter-refactor).
- [x] Verify SonarCloud no longer reports any of the 18 original findings after the branch is merged to `main`.
