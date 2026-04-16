## Epic 28 — SonarCloud Code Quality Remediation

**Status: Approved**

**Objective:** Address all 61 SonarCloud open findings to restore clean code quality gates. No functional behaviour changes are intended except where a finding identifies an actual bug.

**In scope:**
- Story 28.1 — Mechanical Code Modernization: Replace `JSON.parse(JSON.stringify())` with `structuredClone()`, `String#replace` with `String#replaceAll()`, array notation `[arr.length - 1]` with `.at(-1)`, `window` globals with `globalThis`, `.find()` used as existence check with `.some()`, and logical AND chains with optional chaining (`?.`).
- Story 28.2 — Readability and Intentionality Fixes: Extract nested ternary operations into named variables or if-statements; invert negated conditions to put the positive branch first; replace nested template literals with intermediate variables; provide a meaningful message for empty `Error()` throws; convert a promise chain boot call to top-level await.
- Story 28.3 — Structural Refactors and Bug Fixes: Reduce cognitive complexity of three functions (setup-generator.mjs `generateSetup`, history-utils.mjs grouping function, state-store.mjs `sanitizePreferences`) from above 15 to within the allowed limit by extracting helper functions; fix genuine bug in game-data-pipeline.mjs where a conditional ternary always evaluates to the same value; fix Blocker in state-store.mjs where `updateGameResult` always returns a cloned state even when no record was found (should return original state unchanged on the not-found path).

**Out of scope:** No new features, no UI redesign, no test-file modifications beyond fixing lint-equivalent patterns inside existing test assertions.

---
