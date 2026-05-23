## Epic 101 — Eliminate SonarCloud Code Smell Issues

**Objective**
Resolve all 18 open SonarCloud code-smell issues across the app source files by removing redundant TypeScript type assertions and replacing logical-AND guard expressions with optional chain expressions. Completing this epic brings the SonarCloud quality gate to zero open code smells.

**In scope**
- Remove the 16 redundant `as X` type assertion casts flagged in `bgg-import-utils.ts`, `game-data-indexes.ts`, `history-vm.svelte.ts`, `localization-utils.ts`, `result-utils.ts`, `setup-generator.ts`, and `setup-rules.ts`
- Replace the two `obj && obj.property` logical-AND guard expressions at lines 94 and 104 of `setup-validator.ts` with optional chain (`?.`) equivalents
- Confirm TypeScript compilation (`tsc --noEmit`), lint, and all existing tests still pass after each batch of changes

**Stories**
1. **Remove redundant type assertion casts from all flagged app source files**
2. **Replace logical-AND guard expressions with optional chain expressions in `setup-validator.ts`**

**Acceptance Criteria**
- Story 1: All 16 redundant `as X` casts are removed from `bgg-import-utils.ts` (L73, L93), `game-data-indexes.ts` (L52, L53, L61, L62, L65, L66), `history-vm.svelte.ts` (L37, L51), `localization-utils.ts` (L27), `result-utils.ts` (L130, L164, L190), `setup-generator.ts` (L220), and `setup-rules.ts` (L125); `tsc --noEmit` and `npm run lint` report no new errors or warnings.
- Story 2: Lines 94 and 104 of `setup-validator.ts` use optional chain expressions in place of the logical-AND guards; `tsc --noEmit` and `npm run lint` pass cleanly; a SonarCloud scan (or equivalent local analysis) shows zero remaining open code-smell issues across the project.
