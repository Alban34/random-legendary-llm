## Epic 49 — Clear Selection Regression Fix & E2E Guard

**Objective**
Restore the correct behaviour of the "Clear Selection" button in the setup/generator flow so that activating it reliably unchecks every selected checkbox, and introduce a dedicated Playwright end-to-end test that reproduces the regression and prevents it from recurring.

**In scope**
- Identify the root cause of the Clear Selection regression in the relevant Svelte component(s)
- Fix the Clear Selection handler so it reliably resets all selected checkboxes in the setup/generator flow
- Author a Playwright E2E test that: selects several items, clicks Clear Selection, and asserts that every checkbox is unchecked
- Confirm all existing tests continue to pass after the fix

**Out of scope**
- Changes to the randomizer/generator logic unrelated to selection state
- UI redesign or relabelling of the Clear Selection control
- Changes to any other flow that does not use the setup/generator selection model

**Stories**
1. **Identify and fix the Clear Selection regression in the setup/generator component**
2. **Author a Playwright E2E test that reproduces the regression and guards against recurrence**

**Acceptance Criteria**
- Story 1: Clicking the Clear Selection button in the setup/generator flow unchecks every selected checkbox with no exceptions; the fix is verified by inspecting component state; `npm run lint` passes.
- Story 2: A new Playwright test exists in the e2e test folder that (a) navigates to the setup/generator view, (b) selects at least three items, (c) clicks Clear Selection, and (d) asserts that every previously-selected checkbox is now unchecked; the test passes in `npx playwright test`.
