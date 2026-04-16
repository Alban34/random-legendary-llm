## Epic 33 — Test Suite Alignment for Svelte 5

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 33 work complete

### Story 33.1 — Audit test files for removed DOM-manipulation module imports
- [x] List every test file that imports a module removed or renamed during the migration
- [x] Record which test assertions depend on DOM structure that only the vanilla JS renderer produced
- [x] **Test:** verify the audit document is complete and every affected test file is identified
- [x] **QC (Automated):** no automated check for the audit document; verify manually before proceeding to Story 33.2

### Story 33.2 — Update or replace unit tests for migrated modules
- [x] For each test file identified in Story 33.1, update imports to reference the replacement Svelte component equivalents
- [x] Mount components in a test environment if needed; ensure all original assertions still pass
- [x] Verify total test count does not decrease from the pre-migration baseline
- [x] **Test:** verify all updated test files pass under `npm test` and the total test count is preserved
- [ ] **QC (Automated):** run `npm test` and assert zero failures and no reduction in total test count

### Story 33.3 — Verify Playwright specs target Svelte-rendered DOM
- [x] Audit Playwright selectors for any that rely on DOM structure produced only by the old vanilla JS renderer
- [x] Update those selectors to target the Svelte-rendered DOM equivalents
- [x] **Test:** verify all updated Playwright specs select elements that actually exist in the Svelte-rendered DOM
- [ ] **QC (Automated):** run `npx playwright test` and assert zero failures after the selector updates

### Story 33.4 — Confirm `npm test` exits with zero failures and no uncovered epic boundary
- [x] Run the full Node unit test suite
- [x] Confirm every epic boundary (epic1–epic34) has at least one test file exercising it
- [x] **Test:** verify `npm test` exits with zero failures; no epic boundary is silently uncovered
- [ ] **QC (Automated):** run `npm test` and assert exit code 0 and full coverage across all registered epic boundaries

### Story 33.5 — Document the updated test strategy for Svelte component testing
- [x] Update `documentation/testing/strategy.md` to describe how unit tests interact with Svelte components
- [x] Explain how Playwright exercises the compiled component output vs the old DOM-manipulation output
- [x] **Test:** verify `documentation/testing/strategy.md` mentions Svelte component test mounting and compiled-output QC
- [ ] **QC (Automated):** extend documentation checks to confirm testing-qc-strategy.md is updated if the project uses doc-contract checks
