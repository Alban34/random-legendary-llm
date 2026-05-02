## Epic 82 — Co-locate Unit Tests with Their Source Modules

**Objective**
Test files are currently named after epics (e.g. `epic3-setup-generator.test.ts`) rather than after the source modules they exercise. This epic refactors the test organisation so every source module has a clearly named counterpart test file (e.g. `browse-utils.ts` → `browse-utils.test.ts`), making coverage gaps immediately visible and removing the dependency on epic numbering for navigating tests.

**In Scope**
- Story 82.1: Audit all existing test files and produce a mapping from each current file to the source module(s) it covers and its target file name.
- Story 82.2: Rename all epic-keyed test files to module-keyed names matching the source module they primarily test.
- Story 82.3: Split any test file that covers more than one primary source module into separate, module-keyed test files.
- Story 82.4: Update the Vitest configuration include/exclude globs to discover tests at their new locations and names.
- Story 82.5: Verify the complete test suite passes after the reorganisation with no test count regression.

**Acceptance Criteria**
- Story 82.1: A documented mapping lists every current test file, the source module(s) it covers, and its target file name before renaming begins.
- Story 82.2: No test files named after epics remain (e.g. no `epic3-*.test.ts`); all test files use module-keyed names.
- Story 82.3: No single test file is the primary test file for more than one source module; shared test helpers are exempt.
- Story 82.4: `npm test` discovers and runs all renamed test files without manual path adjustments.
- Story 82.5: All tests pass with `npm test` after the reorganisation and the passing test count equals the pre-refactor count.
