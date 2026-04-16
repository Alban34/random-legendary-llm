## Epic 33 — Test Suite Alignment for Svelte 5

**Status: Approved**

**Objective**
Update the Node unit test suite and Playwright end-to-end specs to correctly exercise the Svelte 5 component hierarchy so coverage remains meaningful and no test is silently bypassed by the migration.

**In scope**
- audit which unit tests target DOM-manipulation modules replaced by Svelte components
- replace or update unit tests that imported removed vanilla JS rendering modules
- confirm Playwright specs exercise the correct component-rendered DOM
- ensure `node --test` and `npx playwright test` both exit cleanly with no skipped or failing tests
- no new features are tested — coverage scope must match the pre-migration baseline

**Stories**
1. **Audit all existing test files to identify tests that target removed DOM-manipulation modules**
2. **Update or replace unit tests that imported vanilla JS rendering modules with component-equivalent tests**
3. **Verify Playwright specs select the correct DOM elements produced by Svelte-rendered components**
4. **Confirm `node --test` exits with zero failures and no uncovered epic boundary**
5. **Document the updated test strategy reflecting the Svelte component test model**

**Acceptance Criteria**
- Story 1: A written audit lists every test file that imports a module removed or renamed during the migration; no test file is silently broken without being identified.
- Story 2: All listed tests are updated to import or mount the replacement Svelte components; total test count does not decrease across any epic boundary.
- Story 3: Playwright selectors target rendered DOM from Svelte components; no selector relies on DOM structure that only the old vanilla JS renderer produced.
- Story 4: `node --test` exits with zero failures and zero skipped tests on the fully migrated codebase.
- Story 5: `documentation/testing/strategy.md` is updated to describe how unit tests interact with Svelte components and how Playwright exercises the compiled output.

---
