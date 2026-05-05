# Epic 95 — Coverage Audit (Story 95.1)

Generated: 2026-05-04  
Coverage provider: v8 (vitest)  
Coverage scope: `src/**/*.ts` (as configured in `vitest.config.ts`)  
Total test files: 33 | Total tests: 467 | All passing

---

## Overall Coverage Summary

| Metric | Current |
|--------|---------|
| Statements | 63.3% |
| Branches | 60.0% |
| Functions | 66.1% |

Overall coverage is well below the 80% target threshold. The primary drags are zero-coverage VM files, browser entry points, and several under-tested utility modules.

---

## Coverage Scope Note

`src/components/` contains only `.svelte` files (no `.ts` source files). These are excluded from v8 coverage because the `include` pattern in `vitest.config.ts` is `src/**/*.ts`. The component tests (`App.test.ts`, `NewGameTab.test.ts`, etc.) exercise Svelte components indirectly through rendered HTML snapshots but the component source itself cannot be measured with the current config.

`src/data/` contains only `canonical-game-data.json` (no `.ts` source), so it also produces no coverage entries.

---

## All Under-Covered Modules (< 80% on any metric)

> Files with N/A branch/function coverage are skipped (no branches/functions to measure).

### `src/app/` — Under-Covered

| File | Stmt % | Branch % | Func % | Gap Type | Notes |
|------|--------|----------|--------|----------|-------|
| `src/app/localization-utils.ts` | 32.1% | 19.8% | 24.4% | partial tests | Large locale-switching and interpolation logic; most paths untested |
| `src/app/forced-picks-utils.ts` | 34.4% | 76.5% | 58.3% | partial tests | Only the most common forced-pick paths exercised; error branches skipped |
| `src/app/setup-generator.ts` | 79.2% | 72.1% | 87.2% | partial tests | Complex combinatorial logic; many edge-case branches uncovered |
| `src/app/backup-utils.ts` | 82.5% | 65.7% | 100% | partial tests | Import/export error paths and edge cases not tested |
| `src/app/collection-utils.ts` | 100% | 66.7% | 100% | partial tests | Branch coverage low — conditional ownership logic not fully exercised |
| `src/app/app-tabs.ts` | 100% | 73.3% | 100% | partial tests | Branch gaps in keyboard wrap logic (lines 60–67) |
| `src/app/stats-utils.ts` | 98.2% | 71.6% | 100% | partial tests | Branch gaps in edge-case stat aggregation paths (lines 96, 113) |
| `src/app/game-data-pipeline.ts` | 96.1% | 67.3% | 100% | partial tests | Multiple conditional branches in normalization pipeline uncovered |
| `src/app/history-utils.ts` | 85.4% | 70.3% | 93.1% | partial tests | Grouping edge cases and some history manipulation branches untested |
| `src/app/result-utils.ts` | 86.6% | 75.7% | 100% | partial tests | Result display formatting edge cases not covered |
| `src/app/state-store.ts` | 85.2% | 77.2% | 89.5% | partial tests | Persistence and recovery branches partially covered |
| `src/app/theme-utils.ts` | 83.3% | 62.5% | 83.3% | partial tests | Theme fallback/recovery branches not fully exercised |
| `src/app/new-game-utils.ts` | 83.3% | 78.6% | 85.7% | partial tests | Near-threshold; player-count edge cases missing |

---

## Zero-Coverage Files

### Zero Coverage — No Tests Exist

| File | Stmt % | Branch % | Func % | Category | Notes |
|------|--------|----------|--------|----------|-------|
| `src/app/collection-actions.ts` | 0% | 0% | 0% | no tests | ✓ Confirmed as expected. Svelte action handlers — require DOM/browser environment |
| `src/app/feedback-utils.ts` | 0% | 0% | 0% | no tests | ✓ Confirmed as expected. Toast/notification side-effects — browser-DOM-dependent |
| `src/app/modal-utils.ts` | 0% | 0% | 0% | no tests | ✓ Confirmed as expected. Modal lifecycle — requires browser DOM |
| `src/app/focus-utils.ts` | 0% | 0% | 0% | no tests | Focus management utilities — requires live DOM element refs |
| `src/app/preferences-actions.ts` | 0% | 0% | 0% | no tests | Has a `preferences-actions.test.ts` file (3 tests) but those tests exercise side-effects through the state store without importing this module directly |
| `src/app/app-init.ts` | 0% | 0% | 0% | no tests | Browser-only bootstrapper — mounts Svelte app to DOM |
| `src/app/app-renderer.ts` | 0% | 0% | 0% | no tests | Browser-only renderer entry point |
| `src/app/browser-entry.ts` | 0% | 0% | N/A | no tests | Pure entry point — no functions, only side-effect imports; inherently difficult to unit test |
| `src/sw.ts` | 0% | 0% | 0% | no tests | Service worker — runs in SW context, not testable in vitest node environment |
| `src/app/backup-vm.svelte.ts` | 0% | 0% | 0% | no tests | Svelte reactive VM — depends on `$state` runes and Svelte lifecycle |
| `src/app/browse-vm.svelte.ts` | 0% | 0% | 0% | no tests | Svelte reactive VM — depends on Svelte reactivity |
| `src/app/history-vm.svelte.ts` | 0% | 0% | 0% | no tests | Svelte reactive VM — depends on Svelte reactivity |
| `src/app/import-vm.svelte.ts` | 0% | 0% | 0% | no tests | Svelte reactive VM — depends on Svelte reactivity |
| `src/app/new-game-vm.svelte.ts` | 0% | 0% | 0% | no tests | Svelte reactive VM — depends on Svelte reactivity |
| `src/app/state-store.svelte.ts` | 0% | N/A | 0% | no tests | Svelte reactive store — depends on `$state` runes |

---

## Notable Finding: `object-utils.ts`

The task list anticipated `src/app/object-utils.ts` would be a zero-coverage file. **This is incorrect** — it is currently at **100% stmt / 100% branch / 100% func**. It is fully covered and requires no action.

---

## Agreed Coverage Target Threshold

**Target: ≥ 80% line (statement) coverage AND ≥ 80% branch coverage per module**

### Reasoning

- The 80% floor is the industry-standard minimum for well-maintained utility code.
- Function coverage at 80% is achievable for all non-entry-point, non-VM `.ts` files.
- Branch coverage at 80% is appropriate for utility modules but should be applied only to testable files (i.e., not entry points, service workers, or Svelte `.svelte.ts` reactive VMs, which require a live Svelte/browser context).
- Several modules (`collection-actions.ts`, `feedback-utils.ts`, `modal-utils.ts`, `focus-utils.ts`, browser entry points, `sw.ts`, and all `*-vm.svelte.ts` files) are **explicitly excluded** from the 80% target because they require a browser or Svelte reactivity context not available in the vitest/node environment. These should be covered by Playwright E2E tests instead.

### Applicable Threshold Files (must reach ≥ 80% stmt and branch)

The following files are in scope for the 80% threshold and are currently below it:

| File | Current Stmt | Current Branch | Gap |
|------|-------------|----------------|-----|
| `src/app/localization-utils.ts` | 32.1% | 19.8% | Critical |
| `src/app/forced-picks-utils.ts` | 34.4% | 76.5% | Critical (stmt) |
| `src/app/setup-generator.ts` | 79.2% | 72.1% | Near-miss |
| `src/app/backup-utils.ts` | 82.5% | 65.7% | Branch gap |
| `src/app/collection-utils.ts` | 100% | 66.7% | Branch gap |
| `src/app/game-data-pipeline.ts` | 96.1% | 67.3% | Branch gap |
| `src/app/history-utils.ts` | 85.4% | 70.3% | Branch gap |
| `src/app/stats-utils.ts` | 98.2% | 71.6% | Branch gap |
| `src/app/app-tabs.ts` | 100% | 73.3% | Branch gap |
| `src/app/result-utils.ts` | 86.6% | 75.7% | Branch gap |
| `src/app/state-store.ts` | 85.2% | 77.2% | Branch gap |
| `src/app/theme-utils.ts` | 83.3% | 62.5% | Branch gap |
| `src/app/new-game-utils.ts` | 83.3% | 78.6% | Near-miss |

---

## Files Excluded from 80% Target (by category)

| Category | Files |
|----------|-------|
| Browser/SW entry points | `src/sw.ts`, `src/app/app-init.ts`, `src/app/app-renderer.ts`, `src/app/browser-entry.ts` |
| DOM-dependent utilities | `src/app/collection-actions.ts`, `src/app/feedback-utils.ts`, `src/app/modal-utils.ts`, `src/app/focus-utils.ts` |
| Svelte reactive VMs | `src/app/backup-vm.svelte.ts`, `src/app/browse-vm.svelte.ts`, `src/app/history-vm.svelte.ts`, `src/app/import-vm.svelte.ts`, `src/app/new-game-vm.svelte.ts`, `src/app/new-game-vm.svelte.ts`, `src/app/state-store.svelte.ts` |
| Type-only / data-only | `src/app/env.d.ts`, `src/app/types.ts`, `src/data/canonical-game-data.json` |
| Svelte components (not `.ts`) | All files in `src/components/*.svelte` — outside the `src/**/*.ts` coverage scope |

---

## Story 95.1 Completion

- [x] Coverage command run successfully (`npm test -- --coverage`)
- [x] All under-covered files identified (< 80% stmt or branch)
- [x] Zero-coverage files confirmed
- [x] Expected zero-coverage files verified: `collection-actions.ts` ✓, `feedback-utils.ts` ✓, `modal-utils.ts` ✓
- [x] **Correction**: `object-utils.ts` is **NOT** zero-coverage — it is at 100%
- [x] Target threshold documented: ≥ 80% stmt + branch per testable module
- [x] Exclusion categories documented
