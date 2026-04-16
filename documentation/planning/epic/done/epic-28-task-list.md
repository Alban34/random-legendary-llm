## Epic 28 — SonarCloud Code Quality Remediation

### Story 28.1 — Mechanical Code Modernization
- [x] Replace `JSON.parse(JSON.stringify())` with `structuredClone()` in backup-utils.mjs, game-data-pipeline.mjs, setup-generator.mjs, state-store.mjs, and browser-entry.mjs
- [x] Replace `String#replace()` with `String#replaceAll()` in game-data-pipeline.mjs and localization-utils.mjs
- [x] Replace `arr[arr.length - n]` with `arr.at(-n)` in app-renderer.mjs and app-tabs.mjs
- [x] Replace `window.*` references with `globalThis.*` in browser-entry.mjs
- [x] Replace `.find()` used as existence check with `.some()` in app-renderer.mjs
- [x] Replace logical-AND guard chains with optional chaining (`?.`) in app-renderer.mjs, game-data-pipeline.mjs, localization-utils.mjs, and new-game-utils.mjs
- [x] **Test:** verify all mechanical replacements are functionally equivalent in the running application
- [x] **QC (Automated):** run the full regression suite to confirm no regressions

### Story 28.2 — Readability and Intentionality Fixes
- [x] Extract nested ternary operations in app-renderer.mjs (L261, L293, L537, L728, L897, L1265, L1280) into named variables or if/else blocks
- [x] Extract nested ternary operations in history-utils.mjs (L115, L124, L126) into named variables or if/else blocks
- [x] Extract nested ternary operation in setup-generator.mjs (L599) into a named variable
- [x] Extract nested ternary operation in setup-rules.mjs (L81) into a named variable
- [x] Invert negated conditions in browser-entry.mjs (L898) and app-renderer.mjs (L897) to put the positive branch first
- [x] Replace nested template literal in app-renderer.mjs (L1280) with an intermediate variable
- [x] Provide a meaningful error message in setup-generator.mjs (L648) where `throw new Error('')` uses an empty string
- [x] Convert promise-chain boot pattern in browser-entry.mjs to top-level await
- [x] **Test:** verify all structural changes preserve the same runtime output
- [x] **QC (Automated):** run the full regression suite to confirm no regressions

### Story 28.3 — Structural Refactors and Bug Fixes
- [x] Refactor `generateSetup` in setup-generator.mjs to reduce cognitive complexity from 44 to ≤15 by extracting helper functions
- [x] Refactor the history grouping function in history-utils.mjs to reduce cognitive complexity from 19 to ≤15
- [x] Refactor `sanitizePreferences` in state-store.mjs to reduce cognitive complexity from 16 to ≤15
- [x] Fix Bug in game-data-pipeline.mjs L140: collapse the three-branch ternary for `searchOrder` to two branches (the 'villains' and default branches were identical)
- [x] Fix Blocker in state-store.mjs: `updateGameResult` should return the original `state` unchanged when no matching record is found, rather than a needless deep clone
- [x] **Test:** verify all refactored functions produce identical runtime output to their predecessors
- [x] **QC (Automated):** run the full regression suite to confirm no regressions

---
