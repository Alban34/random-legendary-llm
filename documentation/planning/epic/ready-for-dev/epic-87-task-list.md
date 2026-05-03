# Epic 87 Task List

## Epic 87 — Expansion Usage Percentage in Game History

**Objective:** The History tab displays how many times each expansion was selected but does not express that count as a share of total games played. This epic adds a percentage-of-use figure alongside the raw count for every expansion listed in the history statistics.

---

### Story 87.1 — Implement a pure utility function that calculates expansion usage percentage from history data

**Acceptance Criteria:**
- The utility is a pure function accepting `(count: number, total: number)`
- It returns `Math.round((count / total) * 100)`
- When `total` is `0` it returns `0` (not `NaN`)
- It has no side effects and no UI imports

**Tasks:**

- [ ] In `src/app/stats-utils.ts`, add and export a pure function `computeExpansionUsagePercent(count: number, total: number): number` that returns `total === 0 ? 0 : Math.round((count / total) * 100)`
- [ ] Confirm the function has no imports from UI or component modules and no observable side effects

**Test:**
- [ ] See Story 87.4 for unit-test coverage of this function

---

### Story 87.2 — Display the expansion usage percentage alongside the count in the History tab expansion list

**Acceptance Criteria:**
- Each expansion row in the History statistics section shows both the raw count and the rounded percentage (e.g. "12 (60%)")
- When total games played is 0, the percentage is not displayed or shows "—"
- The layout uses design-system tokens

**Tasks:**

- [ ] In `src/components/HistoryTab.svelte`, import `computeExpansionUsagePercent` from `../app/stats-utils.ts`
- [ ] In the `mostPlayed` list template (`.insight-ranking-item` inside the `{#each usage as category}` block), replace the plain `locale.formatPlayCount(entry.plays)` pill with a formatted string that uses the new locale key `history.insights.playCountWithPercent` when `outcome.totalGames > 0`, passing `count` as `locale.formatPlayCount(entry.plays)` and `percent` as `computeExpansionUsagePercent(entry.plays, outcome.totalGames)`; fall back to `locale.formatPlayCount(entry.plays)` (or "—") when `outcome.totalGames === 0`
- [ ] Apply the same change to the `leastPlayed` list template (the second `.insight-ranking-item` block in the same `stats-category-body` section)
- [ ] Verify the pill element continues to use existing design-system token classes (e.g. `class="pill"`) with no inline styles added

**Test:**
- [ ] See Story 87.4 for the History tab integration test

---

### Story 87.3 — Localise the percentage label and format across all six locale files

**Acceptance Criteria:**
- The percentage label format string (e.g. `"{count} ({percent}%)"`) is defined in the locale system
- The required key(s) are present in `en`, `fr`, `de`, `ja`, `ko`, and `es` locale files
- No hardcoded strings appear in component code

**Tasks:**

- [ ] In `src/app/locales/en.ts`, add the key `'history.insights.playCountWithPercent': '{count} ({percent}%)'` near the existing `history.insights.*` block
- [ ] In `src/app/locales/fr.ts`, add the equivalent translated value for `'history.insights.playCountWithPercent'`
- [ ] In `src/app/locales/de.ts`, add the equivalent translated value for `'history.insights.playCountWithPercent'`
- [ ] In `src/app/locales/ja.ts`, add the equivalent translated value for `'history.insights.playCountWithPercent'`
- [ ] In `src/app/locales/ko.ts`, add the equivalent translated value for `'history.insights.playCountWithPercent'`
- [ ] In `src/app/locales/es.ts`, add the equivalent translated value for `'history.insights.playCountWithPercent'`
- [ ] Confirm `src/app/locales/locales.test.ts` (key-coverage suite) passes for the new key — no hardcoded format strings remain in `src/components/HistoryTab.svelte` for this feature

**Test:**
- [ ] The existing locale key-coverage test in `src/app/locales/locales.test.ts` must pass with the new key present in all six files

---

### Story 87.4 — Test: percentage utility and History tab integration

**Acceptance Criteria:**
- `npm run lint` and `npm test` pass
- The percentage utility has at least four unit-test cases (normal case, zero total, 100% usage, fractional rounding)
- At least one History tab integration test asserts that a percentage figure is rendered for an expansion

**Tasks:**

- [ ] In `src/app/stats-utils.test.ts`, add a test group for `computeExpansionUsagePercent` with the following cases:
  - Normal case: `computeExpansionUsagePercent(12, 20)` → `60`
  - Zero total: `computeExpansionUsagePercent(0, 0)` → `0` (not `NaN`)
  - 100% usage: `computeExpansionUsagePercent(5, 5)` → `100`
  - Fractional rounding: `computeExpansionUsagePercent(1, 3)` → `33` (i.e. `Math.round(33.33…)`)
- [ ] In `src/components/HistoryTab.test.ts`, add an integration test that asserts the rendered source of `HistoryTab.svelte` contains a reference to `computeExpansionUsagePercent` and the locale key `history.insights.playCountWithPercent`, confirming the percentage is wired into the expansion list

**Test:**
- [ ] Run `npm run lint` — must pass with no errors
- [ ] Run `npm test` — all new and existing tests must pass

---

### Story 87.5 — QC (Automated)

**Acceptance Criteria:**
- Run `npm run lint` then `npm test`; all checks pass with no regressions

**Tasks:**

- [ ] **QC gate:** Run `npm run lint` — must exit with code 0, no lint errors
- [ ] **QC gate:** Run `npm test` — all unit and integration tests pass, including the four new utility tests and the new History tab integration test; no pre-existing tests may regress
