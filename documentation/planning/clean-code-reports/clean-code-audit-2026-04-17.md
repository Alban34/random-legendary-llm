# Clean Code Audit — 17 April 2026

> **Re-audit pass 6 completed 17 April 2026.** All previous passes updated below. Resolved items marked ✅; remaining open items updated in the Open Items table at the end.

## Summary (original pass)

- **Files reviewed:** 25 (`src/app/*.mjs`, `src/app/*.svelte.js`, `src/components/*.svelte`, `eslint.config.mjs`, `src/app/browser-entry.mjs`)
- 🔴 **Blocking:** 1  |  🟠 **Major:** 5  |  🟡 **Minor:** 8
- **Fixes applied:** 0 *(report-only mode — see each issue for fix proposal)*
- **Fixes proposed (manual):** 14

## Summary (re-audit pass 2)

- **Files reviewed:** 28 (all `src/app/` modules + all `src/components/` components)
- 🔴 **Blocking:** 0 (↓1 — all blocking issues resolved)  |  🟠 **Major:** 1 (↓4)  |  🟡 **Minor:** 4 (↓4, +3 new)
- **Fixes applied this pass:** 1 (`CollectionTab.svelte` — `{#if false}` blocks replaced with named feature flags)
- **Fixes proposed (manual):** 4

## Summary (re-audit pass 3 — 17 April 2026)

- **Files reviewed:** 30 (all previous + `test/epic1.test.mjs`, `test/playwright/epic40-qc.spec.mjs`)
- 🔴 **Blocking:** 0  |  🟠 **Major:** 1 (unchanged)  |  🟡 **Minor:** 2 (↓2: 4 resolved, +1 new from import actions i18n gap, `epic40-qc` now resolved)
- **Fixes applied this pass:** 0 *(all remaining open issues require design decisions or cross-file locale changes)*
- **Fixes proposed (manual):** 2

## Summary (re-audit pass 4 — 17 April 2026)

- **Files reviewed:** 8 (`src/components/App.svelte`, `src/components/ModalRoot.svelte`, `src/components/CollectionTab.svelte`, `src/components/NewGameTab.svelte`, `src/components/HistoryTab.svelte`, `src/components/BackupTab.svelte`, `src/components/OnboardingShell.svelte`, locale files ×6)
- 🔴 **Blocking:** 0  |  🟠 **Major:** 0 (↓1)  |  🟡 **Minor:** 0 (↓1)
- **All open items resolved.**
- **Lint:** Clean. **Tests:** All 293 pass.

## Summary (re-audit pass 5 — 17 April 2026)

- **Files reviewed:** 27 (all `src/app/` modules + all `src/components/` components — full exhaustive re-read)
- 🔴 **Blocking:** 1 (new) → **fixed this session**  |  🟠 **Major:** 1 (new) → **fixed this session**  |  🟡 **Minor:** 2 (new, proposed)
- **Fixes applied this pass:** 2
- **Fixes proposed (manual):** 2

## Summary (re-audit pass 6 — 17 April 2026)

- **Files reviewed:** 27 (all `src/app/` modules + all `src/components/` components — full exhaustive re-read)
- 🔴 **Blocking:** 0  |  🟠 **Major:** 0  |  🟡 **Minor:** 1 (new) → **fixed this session** + 3 (new, proposed)
- **Fixes applied this pass:** 1 (`HistoryTab.svelte` — inline game-count pluralization replaced with `locale.formatGameCount`)
- **Fixes proposed (manual):** 3

### Items resolved this pass (pass 5)

| # | File | Issue | Resolution |
|---|---|---|---|
| 🔴1 | `NewGameTab.svelte` | "Clear All" button called `clearActiveSetIds` (selects all) instead of `setActiveSetIds([])` (deselects all) — silent logic inversion | Fixed: `onclick` changed to `() => gameActions.setActiveSetIds([])` ✅ |
| 🟠2 | `App.svelte` | Icon-only theme toggle buttons lacked `aria-label`; `title` alone is not reliably announced by screen readers | Fixed: `aria-label={locale.getThemeLabel(theme.id)}` added alongside `title` ✅ |

### Items resolved since pass 3

| # | File | Issue | Resolution |
|---|---|---|---|
| 🟠1 | `App.svelte` | Complete decomposition — extract `ModalRoot.svelte`, split `actions` | `ModalRoot.svelte` created; domain-scoped action slices defined (`collectionActions`, `gameActions`, `historyActions`, `backupActions`, `onboardingActions`) ✅ |
| 🟡2 | `App.svelte` | Hardcoded English action notices (lines 1107 & 1135) | i18n keys added to all 6 locales; `locale.t(…)` used ✅ |

### Items resolved since pass 2

| # | File | Issue | Resolution |
|---|---|---|---|
| 🟡1 | `game-data-pipeline.mjs` | `clone` exported — duplicated `deepClone` | `export` removed; `test/epic1.test.mjs` migrated to `deepClone` from `object-utils.mjs` ✅ |
| 🟡2 | `BrowseTab.svelte` | Magic string array in `formatDuplicateEntries` | `KNOWN_DUPLICATE_ENTITY_NAMES` constant extracted ✅ |
| 🟡3 | `test/playwright/epic40-qc.spec.mjs` | Three `test.skip` calls | All `test.skip` removed; production-only tests split into `epic40-production.spec.mjs` ✅ |
| 🟡4 | `history-utils.mjs` | Play-mode magic strings in `buildGroupConfig` | Replaced with `PLAY_MODE_OPTIONS[summary.playMode]?.label ?? summary.modeLabel` ✅ |

### Items resolved since original audit

| # | File | Issue | Resolution |
|---|---|---|---|
| 🔴1 | `browser-entry.mjs` | Floating Promise — SW registration | `.catch()` added ✅ |
| 🟠2 | Multiple files | `deepClone`/`isPlainObject` duplicated | Extracted to `object-utils.mjs` ✅ |
| 🟠3 | `history-utils.mjs` | Duplicate `heroLabels`/`villainGroupLabels` fields | Removed ✅ |
| 🟠4 | `App.svelte` | `JSON.stringify` equality check | Replaced with structural comparison ✅ |
| 🟠5 | `App.svelte` | BGG/MyLudo import state in App | Extracted to `import-vm.svelte.js` ✅ |
| 🟡6 | `bgg-import-utils.mjs` | `while (true)` retry loop | Replaced with bounded `for` loop ✅ |
| 🟡7 | `bgg-import-utils.mjs` | String concatenation in error message | Template literal used ✅ |
| 🟡8 | `localization-utils.mjs` | `collectFallbackKeys` stub | Removed ✅ |
| 🟡9 | `localization-utils.mjs` | Redundant `LOCALE_OPTIONS` copy | Removed ✅ |
| 🟡10 | `App.svelte` | Debug helpers without `DEV` guard | Wrapped in `import.meta.env.DEV` guard ✅ |
| 🟡11 | `history-utils.mjs`, `stats-utils.mjs` | Hardcoded English category labels | Replaced with i18n key strings ✅ |
| 🟡12 | `App.svelte` | Stale `{@html}` comment | Removed ✅ |

---

## src/app/browser-entry.mjs

### ✅ ~~🔴 Floating Promise from Service Worker registration — Line 6~~ — **RESOLVED**

**Standard:** All async operations must be awaited; floating Promises are a bug.

**Was:** `register()` called with no `.catch()` — unhandled Promise rejection on failure.

**Fix applied by team:** `.catch((err) => console.warn('[SW] Registration failed:', err))` added.

---

## src/app/state-store.mjs & src/app/backup-utils.mjs & src/app/setup-generator.mjs

### ✅ ~~🟠 `deepClone` and `isPlainObject` duplicated across three files~~ — **RESOLVED**

**Standard:** DRY — duplicated logic appearing in more than one place must be extracted.

**Fix applied by team:** `src/app/object-utils.mjs` now exports both `deepClone` and `isPlainObject`. All modules import from there; no local copies remain.

> **Residual note (🟡 Minor):** `game-data-pipeline.mjs` still exports a local `clone` function (a thin alias over `structuredClone`) that is identical to `deepClone`. It cannot be removed yet because `test/epic1.test.mjs` imports it directly. Once that test is updated to import `deepClone` from `object-utils.mjs`, the export can be removed. See [New Findings](#new-findings) below.

---

## src/app/history-utils.mjs

### ✅ ~~🟠 `heroNames`/`heroLabels` and `villainGroupNames`/`villainGroupLabels` are identical duplicate fields~~ — **RESOLVED**

**Standard:** DRY — duplicated logic appearing in more than one place must be extracted.

**Fix applied by team:** `heroLabels` and `villainGroupLabels` fields removed from `formatHistorySummary`. All consumers now use `heroNames` and `villainGroupNames` exclusively.

---

## src/components/App.svelte

### ✅ ~~🟠 `JSON.stringify` used for object equality check~~ — **RESOLVED**

**Standard:** Avoid fragile `JSON.stringify` equality patterns.

**Fix applied by team:** Replaced with field-by-field structural comparison:
```js
const prev = getForcedPicks();
const changed =
  nextForcedPicks.schemeId !== prev.schemeId ||
  nextForcedPicks.mastermindId !== prev.mastermindId ||
  nextForcedPicks.heroIds.join() !== prev.heroIds.join() ||
  nextForcedPicks.villainGroupIds.join() !== prev.villainGroupIds.join() ||
  nextForcedPicks.henchmanGroupIds.join() !== prev.henchmanGroupIds.join();
```

### ✅ ~~🟠 BGG and MyLudo import state kept as local `$state` in App.svelte~~ — **RESOLVED**

**Standard:** Each module has a single clear responsibility.

**Fix applied by team:** `src/app/import-vm.svelte.js` created. All six import-related `$state` variables have been migrated there; `App.svelte` now imports getter/setter pairs from that module.

### ✅ ~~🟠 App.svelte is ~1 550 lines long — single-responsibility violation (partially addressed)~~ — **RESOLVED (pass 4)**

**Standard:** Functions do one thing; flag functions longer than ~30 meaningful lines for decomposition. Each module has a single clear responsibility.

**Progress since original audit:** Two extraction tasks were completed — `src/app/focus-utils.mjs` now owns all focus helpers, and `src/app/import-vm.svelte.js` owns import state. These reduced the file by roughly 100 lines.

**Fix applied (pass 4):** `src/components/ModalRoot.svelte` created — owns `handleModalKeydown` (Escape, Enter, Tab cycling keyboard trap) and the `<div id="modal-root">` markup with all modal ARIA attributes; accepts `modalConfig` and `locale` as `$props()`. `App.svelte` template updated to `<ModalRoot {modalConfig} {locale} />`. Five domain-scoped action slice constants (`collectionActions`, `gameActions`, `historyActions`, `backupActions`, `onboardingActions`) extracted immediately after the monolithic `actions` object and passed as separate props to each respective tab component.

---

## src/app/bgg-import-utils.mjs

### ✅ ~~🟡 `while (true)` retry loop~~ — **RESOLVED**

**Fix applied by team:** Replaced with `for (let attempt = 0; attempt <= maxRetries; attempt++)` bounded loop. Guard condition and unreachable `return` placed cleanly after the loop.

### ✅ ~~🟡 String concatenation instead of template literal~~ — **RESOLVED**

**Fix applied by team:** Template literal used throughout: `` `BGG denied access (HTTP ${response.status})…` ``.

---

## src/app/localization-utils.mjs

### ✅ ~~🟡 `collectFallbackKeys` is a permanently empty stub~~ — **RESOLVED**

**Fix applied by team:** Function and all references removed. The `fallbackKeys` property no longer appears in the locale tools object.

### ✅ ~~🟡 `LOCALE_OPTIONS` is a redundant copy of `SELECTABLE_LOCALES`~~ — **RESOLVED**

**Fix applied by team:** `LOCALE_OPTIONS` removed. All internal references now use `SELECTABLE_LOCALES` directly.

---

## src/components/App.svelte (minor issues)

### ✅ ~~🟡 Stale comment references `{@html}`~~ — **RESOLVED**

**Fix applied by team:** Comment block removed.

### ✅ ~~🟡 Debug mutation helpers without `DEV` guard~~ — **RESOLVED**

**Fix applied by team:** Both `corruptSavedState` and `injectInvalidOwnedSet` are now inside `...(import.meta.env.DEV ? { … } : {})`, so they are tree-shaken out of production builds.

---

## src/app/history-utils.mjs & src/app/stats-utils.mjs

### ✅ ~~🟡 Hardcoded English category label constants bypass the localization system~~ — **RESOLVED**

**Fix applied by team:** Both `HISTORY_USAGE_LABELS` and `INSIGHT_CATEGORY_LABELS` now hold i18n key strings (`'common.heroes'`, `'common.masterminds'`, etc.). Call-sites resolve display text via `locale.t(key)`, consistent with the `CARD_CATEGORIES` pattern in `collection-utils.mjs`.

---

## Test files

### 🟡 `test.skip` calls in committed playwright spec — `test/playwright/epic40-qc.spec.mjs:38,71,92` *(not re-audited)*

**Standard:** No `.skip` or `.only` left in committed test files.

**Status:** This file was not re-read during the re-audit pass. The three `test.skip` calls flagged in the original report may still be present.

**Proposed fix (unchanged):** Reclassify the unconditional `test.skip(true, …)` as `test.fixme`. For the production-only guards, consider extracting those tests into a dedicated `epic40-production.spec.mjs` suite.

---

## Lint Result (re-audit pass)

No errors found across all files. IDE language server reports zero diagnostics project-wide after the `CollectionTab.svelte` fix applied in this session.

---

## New Findings (re-audit pass)

### src/components/CollectionTab.svelte

#### 🟠 Two `{#if false}` dead-code blocks — Lines 102 & 219 *(Fixed this session)*

**Standard:** No commented-out code blocks.

**Found:** Both the BGG import panel and the MyLudo import panel were wrapped in `{#if false}` — always-false conditions with no explanatory name.

**Fix applied:** Two named constants introduced in the `<script>` block; both `{#if false}` replaced:
```js
// Feature flags — set to true when each import panel is ready for release
const FEATURE_BGG_IMPORT = false;
const FEATURE_MYLUDO_IMPORT = false;
```
```svelte
{#if FEATURE_BGG_IMPORT}…{/if}
{#if FEATURE_MYLUDO_IMPORT}…{/if}
```
Enabling either panel now requires a single-line change with clear intent.

---

### src/app/game-data-pipeline.mjs

#### 🟡 `clone` is a named export that duplicates `deepClone` from `object-utils.mjs` — Line 12

**Standard:** DRY — duplicated logic must be extracted.

**Found:**
```js
export function clone(value) {
  return structuredClone(value);
}
```
`deepClone` in `object-utils.mjs` is byte-for-byte identical. `clone` is used internally at lines 161 and 386 of the same file and is also imported by `test/epic1.test.mjs`.

**Proposed fix:** Update `test/epic1.test.mjs` to import `deepClone` from `object-utils.mjs` instead, then remove the `export` keyword from `clone` (keeping it as a private module-local alias until all internal call-sites can be migrated). No action taken — requires updating the test file.

---

### src/components/BrowseTab.svelte

#### ✅ ~~🟡 Magic string array in `formatDuplicateEntries` — Line ~42~~ — **RESOLVED (pass 3)**

**Standard:** Magic strings must be named constants.

**Fix applied by team:** `KNOWN_DUPLICATE_ENTITY_NAMES` constant extracted at the top of the `<script>` block. `formatDuplicateEntries` now references it directly.

---

### src/app/history-utils.mjs

#### ✅ ~~🟡 Play-mode label strings in `buildGroupConfig` are magic constants — Lines 134–148~~ — **RESOLVED (pass 3)**

**Standard:** Magic strings must be named constants.

**Fix applied by team:** The four-branch if/else block was removed. `buildGroupConfig` now derives the group label via `PLAY_MODE_OPTIONS[summary.playMode]?.label ?? summary.modeLabel`, pulling from the already-defined options map and falling back to the computed `modeLabel`. No hardcoded English strings remain.

---

### src/app/game-data-pipeline.mjs

#### ✅ ~~🟡 `clone` is a named export that duplicates `deepClone` from `object-utils.mjs`~~ — **RESOLVED (pass 3)**

**Fix applied by team:** `export` keyword removed from `clone`; it is now a private module-local alias. `test/epic1.test.mjs` updated to import `deepClone` from `object-utils.mjs` directly.

---

### test/playwright/epic40-qc.spec.mjs

#### ✅ ~~🟡 `test.skip` calls in committed playwright spec — Lines 38, 71, 92~~ — **RESOLVED (pass 3)**

**Fix applied by team:** All three `test.skip` calls removed. Production-only tests extracted into the new dedicated `test/playwright/epic40-production.spec.mjs` suite, keeping the standard QC spec lean and always-runnable.

---

## New Findings (pass 3)

### src/components/App.svelte

#### ✅ ~~🟡 Hardcoded English action notice strings in `importMyludoFile` and `importBggCollection` — Lines 1107 & 1135~~ — **RESOLVED (pass 4)**

**Standard:** Magic strings must be named constants; all user-visible strings should use the i18n system.

**Found:**
```js
applyStateUpdate(
  (currentState) => mergeOwnedSets(currentState, matchedSetIds),
  'Updated collection from MyLudo import'   // line 1107
);
// …
applyStateUpdate(
  (currentState) => mergeOwnedSets(currentState, matchedSetIds),
  'Updated collection from BGG import'      // line 1135
);
```
Both strings are hardcoded English and bypass `locale.t(…)`. All other `applyStateUpdate` call-sites in the file use locale keys.

**Proposed fix:** Add `'actions.importedMyludoCollection'` and `'actions.importedBggCollection'` keys to all six locale files (`en`, `de`, `es`, `fr`, `ja`, `ko`), then replace the literal strings:
```js
applyStateUpdate(
  (currentState) => mergeOwnedSets(currentState, matchedSetIds),
  locale.t('actions.importedMyludoCollection')
);
// …
applyStateUpdate(
  (currentState) => mergeOwnedSets(currentState, matchedSetIds),
  locale.t('actions.importedBggCollection')
);
```
**Fix applied (pass 4):** `'actions.importedMyludoCollection'` and `'actions.importedBggCollection'` keys added to all six locale files (`en.mjs`, `fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, `es.mjs`). Literal strings at lines 1107 and 1135 of `App.svelte` replaced with `locale.t('actions.importedMyludoCollection')` and `locale.t('actions.importedBggCollection')` respectively.

---

## Open Items — Prioritised

| Priority | File(s) | Issue | Status |
|---|---|---|---|
| ✅ | `stats-utils.mjs`, `HistoryTab.svelte` | Magic number `5` for recent-score window | Resolved (pass 6) |
| ✅ | `HistoryTab.svelte` | Outcome filter labels hardcoded English | Resolved (pass 6) |

---

## New Findings (pass 5)

### src/components/NewGameTab.svelte

#### ✅ ~~🔴 "Clear All" active-filter button was a logic inversion — Line 143~~ — **FIXED THIS SESSION**

**Standard:** Clean Code — Correctness; functions must do what their name says.

**Found:** Both "Select All" (`active-filter-select-all`) and "Clear All" (`active-filter-clear-all`) called `onclick={gameActions.clearActiveSetIds}`. `clearActiveSetIds` sets `activeSetIds = null`, which means *all* sets active — the exact opposite of clearing.

**Fix applied:** `onclick` on the "Clear All" button changed to `() => gameActions.setActiveSetIds([])`, which sets `activeSetIds = []` (no sets active).

---

### src/components/App.svelte

#### ✅ ~~🟠 Icon-only theme buttons lack `aria-label` — Line 1302~~ — **FIXED THIS SESSION**

**Standard:** Accessibility — Interactive elements must have reliable accessible names; `title` is not consistently announced by screen reader / browser pairs.

**Found:** The 🌙/☀️ theme toggle buttons used only `title={locale.getThemeDescription(…)}` for their accessible name:
```svelte
<button … title={locale.getThemeDescription(theme.id)} …>
  {getThemeIcon(theme.id)}
</button>
```

**Fix applied:** `aria-label={locale.getThemeLabel(theme.id)}` added alongside the retained `title` tooltip:
```svelte
<button … aria-label={locale.getThemeLabel(theme.id)} title={locale.getThemeDescription(theme.id)} …>
  {getThemeIcon(theme.id)}
</button>
```

---

### src/app/stats-utils.mjs & src/components/HistoryTab.svelte

#### ✅ ~~🟡 Magic number `5` for the recent-score window — `stats-utils.mjs` Line 148, `HistoryTab.svelte` Line 39~~ — **RESOLVED (pass 6)**

**Standard:** Clean Code — magic numbers must be named constants.

**Fix applied by team:** `export const RECENT_SCORE_WINDOW = 5;` added to `stats-utils.mjs`. `HistoryTab.svelte` now imports and uses `RECENT_SCORE_WINDOW` from `'../app/stats-utils.mjs'` in `getHelperCopy`.

---

### src/components/HistoryTab.svelte

#### ✅ ~~🟡 Outcome filter option labels are hardcoded English strings — Lines 97–102~~ — **RESOLVED (pass 6)**

**Standard:** Clean Code — no magic strings; all user-visible text should flow through the i18n system.

**Fix applied by team:** Locale keys `history.filter.all`, `history.filter.win`, `history.filter.loss`, `history.filter.pending` added to all six locale files. Filter option objects now use `locale.t('history.filter.*')` calls.

---

## Lint Result (pass 5)

No errors found across all files. IDE language server reports zero diagnostics project-wide after the two fixes applied this session.

---

## New Findings (pass 6)

### src/components/HistoryTab.svelte

#### ✅ ~~🟡 Inline game-count pluralization bypasses `locale.formatGameCount` — Line 109~~ — **FIXED THIS SESSION**

**Standard:** Clean Code — no magic strings; pluralization logic must go through the i18n system.

**Found:**
```svelte
<p class="muted" data-outcome-filter-count>{filteredCount} {filteredCount === 1 ? 'game' : 'games'}</p>
```
`locale.formatGameCount` already exists and resolves the exact same pluralization via `common.game` / `common.games` locale keys. The inline ternary duplicates that logic with hardcoded English strings.

**Fix applied:** Replaced with:
```svelte
<p class="muted" data-outcome-filter-count>{locale.formatGameCount(filteredCount)}</p>
```

---

#### 🟡 Outcome-filter empty-state messages are hardcoded English — Lines 115–120

**Standard:** Clean Code — no magic strings; all user-visible text should flow through the i18n system.

**Found:**
```svelte
{#if getHistoryOutcomeFilter() === 'win'}No won games yet
{:else if getHistoryOutcomeFilter() === 'loss'}No lost games yet
{:else}No pending games yet{/if}
```
All other empty-state strings in the same component use `locale.t(…)`.

**Proposed fix:** Add locale keys to all six locale files and replace the literals:
```
'history.filter.emptyWin': 'No won games yet.'
'history.filter.emptyLoss': 'No lost games yet.'
'history.filter.emptyPending': 'No pending games yet.'
```
Then:
```svelte
{#if getHistoryOutcomeFilter() === 'win'}{locale.t('history.filter.emptyWin')}
{:else if getHistoryOutcomeFilter() === 'loss'}{locale.t('history.filter.emptyLoss')}
{:else}{locale.t('history.filter.emptyPending')}{/if}
```

---

### src/components/BackupTab.svelte

#### 🟡 Backup-preview usage lines use hardcoded English category labels — Lines ~63–68

**Standard:** Clean Code — no magic strings; all user-visible text should flow through the i18n system.

**Found:** The `usageLines` `@const` inside the backup preview block uses hardcoded English labels:
```svelte
{@const usageLines = [
  ['Heroes', summary.usageCounts.heroes],
  ['Masterminds', summary.usageCounts.masterminds],
  ['Villain Groups', summary.usageCounts.villainGroups],
  ['Henchman Groups', summary.usageCounts.henchmanGroups],
  ['Schemes', summary.usageCounts.schemes]
]}
```
These feed directly into the `backup.summary.usageEntries` locale key value parameter as English-only text.

**Proposed fix:** Replace the hardcoded English labels with `locale.t(…)` calls using the existing `common.*` keys:
```svelte
{@const usageLines = [
  [locale.t('common.heroes'), summary.usageCounts.heroes],
  [locale.t('common.masterminds'), summary.usageCounts.masterminds],
  [locale.t('common.villainGroups'), summary.usageCounts.villainGroups],
  [locale.t('common.henchmanGroups'), summary.usageCounts.henchmanGroups],
  [locale.t('common.schemes'), summary.usageCounts.schemes]
]}
```
No new locale keys required; all `common.*` keys already exist in all six locale files.

---

### src/components/App.svelte

#### 🟡 `playerWord` parameter in `actions.selectedPlayerMode` notice is hardcoded English — Line ~637

**Standard:** Clean Code — no magic strings; all user-visible text should flow through the i18n system.

**Found:**
```js
persistPreferences(
  playerCount,
  playMode,
  locale.t('actions.selectedPlayerMode', {
    count: locale.formatNumber(playerCount),
    playerWord: playerCount === 1 ? 'player' : 'players'  // hardcoded English
  })
);
```
The `{playerWord}` interpolation slot in `actions.selectedPlayerMode` is filled with a raw English string. This is an action notice used for screen-reader announcements.

**Proposed fix:** Restructure the locale key to handle pluralization internally by splitting into two keys:
```
'actions.selectedPlayerMode.singular': 'Selected {count} player setup mode.'
'actions.selectedPlayerMode.plural': 'Selected {count} players setup mode.'
```
Or — simpler — use `locale.t(playerCount === 1 ? 'common.player' : 'common.players', { count: … })` to produce the already-localized player word before passing it in. Both approaches require updating all six locale files.

---

## Open Items — Prioritised (pass 6)

| Priority | File(s) | Issue | Status |
|---|---|---|---|
| 🟡 | `HistoryTab.svelte` | Outcome-filter empty-state messages hardcoded English (3 strings) | Open |
| 🟡 | `BackupTab.svelte` | Backup-preview `usageLines` labels hardcoded English (5 strings) | Open |
| 🟡 | `App.svelte` | `playerWord` in `actions.selectedPlayerMode` notice hardcoded English | Open |

---

## Lint Result (pass 6)

No errors found across all files. IDE language server reports zero diagnostics project-wide after the `HistoryTab.svelte` fix applied this session.
