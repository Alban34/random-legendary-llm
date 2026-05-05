# Epic 94 — Code Duplication Inventory

**Date:** 2026-05-04  
**Baseline:** 929 duplicated lines / ~26,500 total lines = **3.5% density**  
**Target:** < 1% (≤ 265 duplicated lines)  
**Lines to eliminate:** ≥ 664

---

## Priority Table

| Priority | File | Blocks | Dup Lines | Density | Pattern Type |
|----------|------|--------|-----------|---------|--------------|
| **HIGH** | `src/app/setup-generator.test.ts` | 33 | 334 | 32.4% | In-file: repeated solo-leads setup block (~9×), repeated teamNames computation (4×), repeated simpleScheme/simpleMastermind lookup (5×) |
| **HIGH** | `src/app/setup-rules.test.ts` | 3 | 126 | 59.2% | Exact duplicate test blocks (3 tests copied verbatim under "From epic3" and "From epic11" section comments) |
| **HIGH** | `src/app/myludo-import-utils.test.ts` | 4 | 93 | 38.3% | Cross-file: `mergeOwnedSets` tests duplicated between this file and `bgg-import-utils.test.ts` |
| **HIGH** | `src/components/BrowseTab.test.ts` | 2 | 64 | 48.5% | Exact duplicate test blocks (4 tests copied under "From epic78-ui-layout-polish" section comment) |
| **MEDIUM** | `src/app/bgg-import-utils.test.ts` | 2 | 45 | 13.5% | Cross-file: `mergeOwnedSets` tests duplicated with `myludo-import-utils.test.ts` |
| **MEDIUM** | `src/components/BackupTab.test.ts` | 2 | 39 | 11.7% | In-file: EN/FR disclosure `localizationSource` extraction block repeated across 6+ disclosure-body tests |
| **MEDIUM** | `src/app/result-utils.test.ts` | 2 | 34 | 5.3% | Cross-file: `createMemoryStorage` function identical to 4 other test files |
| **MEDIUM** | `src/app/state-store.test.ts` | 2 | 34 | 6.1% | Cross-file: `createMemoryStorage` function (slight variant with `dump()`) identical to 4 other test files |
| **LOW** | `src/app/localization-utils.test.ts` | 1 | 25 | 25.5% | Cross-file: `createMemoryStorage` + `minimalIndexes` shared with `app-tabs.test.ts` and `theme-utils.test.ts` |
| **LOW** | `src/app/app-tabs.test.ts` | 1 | 25 | 30.5% | Cross-file: `createMemoryStorage` + `minimalIndexes` shared with `localization-utils.test.ts` and `theme-utils.test.ts` |
| **LOW** | `src/app/theme-utils.test.ts` | 1 | 25 | 31.3% | Cross-file: `createMemoryStorage` + `minimalIndexes` shared above; also in-file: last test duplicates first test assertions |
| **LOW** | `src/app/backup-utils.test.ts` | 1 | 16 | 9.5% | Cross-file: `createSampleSetup` body near-identical to `result-utils.test.ts` and `state-store.test.ts` |
| **LOW** | `src/app/forced-picks-utils.test.ts` | 1 | 23 | 6.7% | Cross-file: `createAllOwnedState` + `beforeAll` block identical to `setup-rules.test.ts` |
| **LOW** | `src/app/history-utils.test.ts` | 1 | 23 | 3.5% | Cross-file: `createMemoryStorage` + `createAllOwnedState` shared with multiple files |
| **LOW** | `src/app/stats-utils.test.ts` | 1 | 23 | 10.3% | Cross-file: `createAllOwnedState` + `createSampleSnapshot` identical to `history-utils.test.ts` |

---

## Detailed Analysis

### 1. `setup-generator.test.ts` — 334 duplicated lines (HIGH)

**Pattern A — Solo-leads mastermind setup block (~10 lines, repeated 9 times):**
```typescript
const allMasterminds = bundle.runtime.indexes.allMasterminds;
allMasterminds.forEach((m, index) => {
  if (m.id !== leadMastermind.id) {
    state.usage.masterminds[m.id] = {
      plays: 1,
      lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
    };
  }
});
```
Appears in: Story 1 (advanced-solo, two-handed-solo, standard-solo-v2, non-solo regression) + Story 2 (standard, advanced-solo, two-handed-solo, standard-solo-v2, non-solo regression) = 9 tests.  
**Extraction:** Helper `markAllMastermindsExceptLead(state, bundle, leadMastermind)` at top of file.

**Pattern B — buildOwnedPools + teamNames computation (~10 lines, repeated 4 times):**
```typescript
const effectiveSetIds = state.collection.activeSetIds ?? state.collection.ownedSetIds;
const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
const teamSet = new Set<string>();
for (const hero of pools.heroes) {
  for (const team of hero.teams) {
    if (team) teamSet.add(team);
  }
}
const activeHeroTeamNames = [...teamSet].sort((a, b) => a.localeCompare(b));
```
Appears in 4 consecutive `activeHeroTeamNames` tests.  
**Extraction:** Helper `computeActiveHeroTeamNames(state, bundle)` at top of file.

**Pattern C — simpleScheme + simpleMastermind lookup (~4 lines, repeated 5 times):**
```typescript
const simpleScheme = bundle.runtime.indexes.allSchemes.find(
  (entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount
);
const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
```
Appears in all 5 forcedTeam tests.  
**Extraction:** Helper `findSimpleSchemeAndMastermind(bundle)` at top of file.

---

### 2. `setup-rules.test.ts` — 126 duplicated lines (HIGH)

**Pattern:** Three tests appear verbatim twice in the file:
- `'Resolves setup templates for all supported player modes including Advanced Solo'` — appears at line ~35 and again under `// ── From epic3-setup-generator` comment (~line 155)
- `'Hero counts match official Legendary rules for each player count'` — appears at line ~53 and again under the same section comment
- `'Resolves two-handed solo as a solo mode that uses the 2-player setup counts'` — appears at line ~80 and again under `// ── From epic11-play-modes` comment (~line 190)

**Fix:** Delete the second copy of each test (the "From epicXX" section at the bottom of the file).

---

### 3. `myludo-import-utils.test.ts` + `bgg-import-utils.test.ts` — 93 + 45 duplicated lines (HIGH + MEDIUM)

**Pattern (cross-file):** Both files contain `mergeOwnedSets` test suites testing the same `mergeOwnedSets` function from `collection-utils.ts`.

`myludo-import-utils.test.ts` lines 192–242: 6 `mergeOwnedSets` tests  
`bgg-import-utils.test.ts` lines 243–286: 5 `mergeOwnedSets` tests (superset minus idempotent test)

**Fix:** Move all `mergeOwnedSets` tests (union of both sets — 6 tests including the idempotent one) to `collection-utils.test.ts`, and remove the sections from both source files.

---

### 4. `BrowseTab.test.ts` — 64 duplicated lines (HIGH)

**Pattern:** Four tests under `// ── From epic78-ui-layout-polish` comment are verbatim copies of tests defined earlier in the file:
- `'BrowseTab help-walkthrough-action is inside browse-help-disclosure'`
- `'BrowseTab help-walkthrough-action contains start-onboarding button'`
- `'BrowseTab contains [data-browse-footer]'`
- `'BrowseTab footer contains toggle-about-panel button-link'`

**Fix:** Delete the "From epic78" section at the bottom.

---

### 5. `BackupTab.test.ts` — 39 duplicated lines (MEDIUM)

**Pattern:** Six EN disclosure body tests each re-compute the same `enBlock` + `bodyCtx` extraction:
```typescript
const enStart = localizationSource.indexOf('const EN_MESSAGES');
const enEnd = localizationSource.indexOf('\nconst ', enStart + 10);
const enBlock = localizationSource.slice(enStart, enEnd > -1 ? enEnd : undefined);
const keyIdx = enBlock.indexOf("'storage.disclosureBody'");
const bodyCtx = enBlock.slice(keyIdx, keyIdx + 400).toLowerCase();
```
Two FR tests also share a similar 5-line FR extraction.

**Fix:** Extract `getEnDisclosureBody(src)` and `getFrDisclosureBody(src)` helpers inside the file.

---

### 6. Cross-file `createMemoryStorage` — ~40 duplicated lines (MEDIUM)

**Pattern:** Identical 10–11 line function in 5+ test files:
- `localization-utils.test.ts`
- `app-tabs.test.ts`
- `theme-utils.test.ts`
- `result-utils.test.ts`
- `history-utils.test.ts`
- (variant with `dump()` in `state-store.test.ts`)

**Fix:** Extract to `src/app/test-utils.ts` shared helper, update imports in all files.

---

### 7. Cross-file `minimalIndexes` — ~16 duplicated lines (LOW)

**Pattern:** Identical 8-line object in 3 test files:
- `localization-utils.test.ts`
- `app-tabs.test.ts`
- `theme-utils.test.ts`

**Fix:** Add to `src/app/test-utils.ts` shared helper.

---

### 8. Cross-file `createAllOwnedState` — ~16 duplicated lines (LOW)

**Pattern:** Identical 4-line function in 5 test files:
- `setup-generator.test.ts`
- `setup-rules.test.ts`
- `forced-picks-utils.test.ts`
- `history-utils.test.ts`
- `stats-utils.test.ts`

**Fix:** Add `createAllOwnedState(bundle)` to `src/app/test-utils.ts` shared helper.

---

### 9. Cross-file `createSampleSnapshot` — ~8 duplicated lines (LOW)

**Pattern:** Identical 8-line function in 2 test files:
- `history-utils.test.ts`
- `stats-utils.test.ts`

**Fix:** Add `createSampleSnapshot(bundle, offset)` to `src/app/test-utils.ts` shared helper.

---

### 10. `theme-utils.test.ts` — in-file duplicate (LOW)

**Pattern:** Last test `'Keeps the canonical theme contract and legacy theme normalization aligned'` repeats assertions already present in the first test `'Theme utilities normalize supported IDs and expose stable theme metadata'`.

**Fix:** Delete the duplicate test at the bottom.

---

## Proposed Extraction Map

| Shared Artifact | Location | Files Updated |
|----------------|----------|---------------|
| `createMemoryStorage()` | `src/app/test-utils.ts` | `localization-utils.test.ts`, `app-tabs.test.ts`, `theme-utils.test.ts`, `result-utils.test.ts`, `history-utils.test.ts`, `state-store.test.ts` |
| `minimalIndexes` | `src/app/test-utils.ts` | `localization-utils.test.ts`, `app-tabs.test.ts`, `theme-utils.test.ts` |
| `createAllOwnedState(bundle)` | `src/app/test-utils.ts` | `setup-rules.test.ts`, `forced-picks-utils.test.ts`, `history-utils.test.ts`, `stats-utils.test.ts` |
| `createSampleSnapshot(bundle, offset)` | `src/app/test-utils.ts` | `history-utils.test.ts`, `stats-utils.test.ts` |
| `markAllMastermindsExceptLead(state, bundle, lead)` | inline helper in `setup-generator.test.ts` | `setup-generator.test.ts` only |
| `computeActiveHeroTeamNames(state, bundle)` | inline helper in `setup-generator.test.ts` | `setup-generator.test.ts` only |
| `findSimpleSchemeAndMastermind(bundle)` | inline helper in `setup-generator.test.ts` | `setup-generator.test.ts` only |
| `getEnDisclosureBody(src)` | inline helper in `BackupTab.test.ts` | `BackupTab.test.ts` only |
| `getFrDisclosureBody(src)` | inline helper in `BackupTab.test.ts` | `BackupTab.test.ts` only |
| `mergeOwnedSets` tests | moved to `collection-utils.test.ts` | Removed from `bgg-import-utils.test.ts` and `myludo-import-utils.test.ts` |

---

## Estimated Line Savings

| Extraction | Estimated Lines Removed |
|-----------|------------------------|
| `setup-rules.test.ts` exact duplicates | ~54 |
| `BrowseTab.test.ts` exact duplicates | ~32 |
| `theme-utils.test.ts` in-file duplicate | ~8 |
| `setup-generator.test.ts` solo-leads helper | ~81 |
| `setup-generator.test.ts` teamNames helper | ~30 |
| `setup-generator.test.ts` simpleScheme helper | ~16 |
| `createMemoryStorage` cross-file | ~44 |
| `minimalIndexes` cross-file | ~16 |
| `createAllOwnedState` cross-file | ~16 |
| `createSampleSnapshot` cross-file | ~8 |
| `mergeOwnedSets` cross-file consolidation | ~46 |
| `BackupTab.test.ts` disclosure helpers | ~28 |
| **Total estimated** | **~379** |

> Note: SonarCloud's deduplication metric counts both the original and copy of a block. Extracting to a helper eliminates both from the count, so the actual metric improvement may be higher (up to 2× the lines extracted in some cases). The goal of dropping below 1% should be achievable with these extractions.

---

## SonarCloud Verification Note

Final density verification requires a CI push to trigger SonarCloud analysis. This is tracked as Story 94.4 and is pending CI.
