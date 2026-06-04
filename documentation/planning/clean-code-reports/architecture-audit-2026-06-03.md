# Architecture Audit — 3 June 2026

> Clean Code Architect review of `src/app` and `src/components` against 2026 engineering standards.
> Report-only: no source files were modified during this audit.

## Summary

- **Files reviewed:** ~95 source files across [src/app](../../../src/app) and [src/components](../../../src/components) (central/largest modules plus every Svelte component)
- 🔴 Blocking: 0  |  🟠 Major: 4  |  🟡 Minor: 4
- Fixes applied: 0 (report-only)  |  Fixes proposed (manual): 8

**Overall the codebase is in excellent shape.** No `var`, no `eval`/`new Function`, no `innerHTML` with user data, no `JSON.parse(JSON.stringify())` (uses `structuredClone`), no `on:` directives or `export let` (clean Svelte 5 runes throughout), no leftover `.only`/`.skip` in tests, no `setTimeout`-based waits in tests, and consistent `$state`/`$derived`/`$effect` usage. The findings below are refinements, not firefighting.

## Priority Ranking

| Rank | Severity | Finding | File(s) | Type |
|------|----------|---------|---------|------|
| P1 | 🟠 Major | `any`-typed params defeat type safety | `collection-utils.ts` | Mechanical |
| P2 | 🟠 Major | Generator notices hardcoded in English | `setup-generator.ts` → `SetupResultCard.svelte` | Localization |
| P3 | 🟠 Major | Inconsistent error-message contract (locale-key vs prose) | `setup-generator.ts` | Localization |
| P4 | 🟠 Major | Type system suppressed via `@ts-expect-error` at normalization boundary | `game-data-normalizer.ts`, `game-data-indexes.ts`, `game-data-pipeline.ts` | Design decision |
| P5 | 🟡 Minor | `any` params in shared test helper | `test-utils.ts` | Mechanical |
| P6 | 🟡 Minor | Hardcoded English UI labels in data constants | `collection-utils.ts` | Localization |
| P7 | 🟡 Minor | Architecture doc describes removed `{@html}` approach | `documentation/architecture/overview.md` | Docs drift |
| P8 | 🟡 Minor | Dense positional context objects at orchestration call sites | `setup-generator.ts` | Readability |

---

## P1 — 🟠 Major: `any`-typed parameters defeat type safety

**File:** [src/app/collection-utils.ts](../../../src/app/collection-utils.ts) — Lines 61, 70, 122, 143
**Standard:** ESM/JS — "No `any`-equivalent patterns; annotate with precise types."

**Found:** `getCardsByCategory(pools: any)`, `getCardsByExpansion(pools: any)`, `summarizeOwnedCollection(runtime: any, …)`, `getCollectionFeasibility(runtime: any, …)` — each carrying an `eslint-disable @typescript-eslint/no-explicit-any`.

**Proposed:** The concrete types already exist — `GamePool` (from `setup-pool-builder.ts`) for `pools`, and `GameRuntime` for `runtime`. Replace `any` with those imports and drop the four eslint-disable comments. `buildOwnedPools`/`validateSetupLegality` already consume `GameRuntime`, so this is mechanical with zero behavior change.

## P2 — 🟠 Major: User-facing generator notices are hardcoded English

**File:** [src/app/setup-generator.ts](../../../src/app/setup-generator.ts) — Lines 78–93
**Standard:** Localization consistency (untranslated user-visible strings).

**Found:** `createGeneratorNotices` pushes literals like `Least-played fallback used for Scheme selection: …` and `Applied forced picks: …`. These are rendered verbatim in [SetupResultCard.svelte](../../../src/components/SetupResultCard.svelte) (`<div class="notice info">{notice}</div>`), while every other notice in that component uses `locale.t(...)`. Non-English users see English here.

**Proposed:** Return structured notice descriptors (key + interpolation values) and resolve with `locale.t()` at the component boundary, consistent with `newGame.generator.previewNotice` / `freshNotice` already in the same card.

## P3 — 🟠 Major: Inconsistent error-message contract

**File:** [src/app/setup-generator.ts](../../../src/app/setup-generator.ts) — Lines 308, 323, 326
**Standard:** Clean Code — consistent abstractions; localization consistency.

**Found:** Some throws use locale keys (`throw new Error('newGame.epicMastermind.noCardsError')`), while sibling throws use raw English (`'No legal setup could be generated from the current owned collection…'`). Callers cannot reliably decide whether to pass the message through `locale.t()`.

**Proposed:** Standardize on locale-key error messages for all user-reachable throws in this module, and add the missing keys to the locale catalogs.

## P4 — 🟠 Major: Type system suppressed at normalization boundaries

**Files:**
- [src/app/game-data-normalizer.ts](../../../src/app/game-data-normalizer.ts) — Lines 119, 234, 265
- [src/app/game-data-indexes.ts](../../../src/app/game-data-indexes.ts) — Lines 55, 68
- [src/app/game-data-pipeline.ts](../../../src/app/game-data-pipeline.ts) — Line 96

**Standard:** ESM/JS — precise typing; avoid `any`-equivalent escapes.

**Found:** Six `@ts-expect-error` comments where typed arrays (e.g. `MastermindCard[]`) are mutated in place into runtime-shaped objects (`MastermindRuntime[]`).

**Proposed (requires design decision — not mechanical):** The in-place mutation of `Card[]` → `Runtime[]` is what forces the suppressions. Introduce an explicit transform that returns a new, correctly-typed structure (e.g. `normalizeMasterminds(cards): MastermindRuntime[]`) rather than reassigning into the source-typed array. This removes all six suppressions and makes the normalization boundary type-safe end-to-end.

## P5 — 🟡 Minor: `any` parameters in shared test helper

**File:** [src/app/test-utils.ts](../../../src/app/test-utils.ts) — Lines 48, 51, 61, 67
**Standard:** Test hygiene / precise typing.

**Found:** `createAllOwnedState(bundle: any)`, `createSampleSnapshot(bundle: any, …)`, with `set: any` / `entity: any` callbacks.

**Proposed:** Type `bundle` as `Epic1Bundle` (exported from `game-data-pipeline.ts`); the `.map` callbacks then infer correctly and the inline `any`s disappear. Low risk, mechanical.

## P6 — 🟡 Minor: Hardcoded English UI labels in data constants

**File:** [src/app/collection-utils.ts](../../../src/app/collection-utils.ts) — Lines 89–110
**Standard:** Clean Code — magic strings / localization consistency.

**Found:** `COLLECTION_TYPE_GROUPS` (`label: 'Base'`, `'Large Expansions'`…) and `COLLECTION_FEASIBILITY_MODES` (`label: 'Standard Solo (1P)'`…) embed English literals in modules that otherwise feed a fully localized UI.

**Proposed:** Store `labelKey` (locale string keys) instead of literal `label`, mirroring the existing `CARD_CATEGORIES` pattern in the same file, and resolve via `locale.t()` at render time. Verify against the i18n architecture before changing, since these may be intentional fallbacks.

## P7 — 🟡 Minor: Architecture doc describes a removed `{@html}` approach

**File:** [documentation/architecture/overview.md](../../architecture/overview.md)
**Standard:** Docs accuracy (repo convention: keep docs synced with implementation).

**Found:** `overview.md` states `app-renderer.ts` exposes "transitional render functions used via `{@html}` blocks in Svelte tab components." A workspace-wide search finds **zero** `{@html}` usages, and [app-renderer.ts](../../../src/app/app-renderer.ts) now builds DOM via `document.createElement(...)` (the safer approach).

**Proposed:** Update the `app-renderer.ts` and `App.svelte` bullets to reflect DOM-API rendering and drop the `{@html}` references.

## P8 — 🟡 Minor: Dense positional context objects at orchestration call sites

**File:** [src/app/setup-generator.ts](../../../src/app/setup-generator.ts) — Lines ~313, 315
**Standard:** Clean Code — readability of large argument objects.

**Found:** `trySchemeForSetup`/`selectScheme` call sites pass large inline context objects with many `foo: foo` / `foo!: foo!` pairs. Functional and well-typed, but dense.

**Proposed (low priority):** Minor readability win from shorthand properties and hoisting the non-null assertions to locals (e.g. `const tmpl = template!`). Not worth churn unless touched for other reasons.

---

## Accessibility / Security spot-check — PASS

- All interactive `<button>`/`<select>` elements carry visible localized text or `aria-label` (e.g. [HistoryTab.svelte](../../../src/components/HistoryTab.svelte), [ForcedPicksPanel.svelte](../../../src/components/ForcedPicksPanel.svelte)). Decorative `<hr aria-hidden="true">` is correct.
- All `tabindex` values are `0` or `-1` (roving tabindex pattern in [TabNav.svelte](../../../src/components/TabNav.svelte)) — none `> 0`.
- No secrets, no `eval`, no dynamic `import()` of user paths. `localStorage` access goes through the sanitizing [state-sanitizer.ts](../../../src/app/state-sanitizer.ts) / [state-io.ts](../../../src/app/state-io.ts) layer. SW registration failure is handled.

## Recommended remediation order

1. **P1, P5** — `any` → concrete-type fixes (pure mechanical, zero behavior change).
2. **P7** — doc correction.
3. **P2, P3, P6** — localization of generator notices, error messages, and data-constant labels (touches locale catalogs).
4. **P4** — normalization type-safety redesign (needs sign-off on the transform approach).

## Lint Result

Not run — no edits were applied in this report-only pass, so there is no regression to verify. Per the QC workflow, lint/tests remain the QC agent's responsibility.
