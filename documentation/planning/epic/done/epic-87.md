## Epic 87 — Expansion Usage Percentage in Game History

**Objective**
The History tab displays how many times each expansion was selected but does not express that count as a share of total games played. This epic adds a percentage-of-use figure alongside the raw count for every expansion listed in the history statistics, giving players immediate insight into which expansions dominate their sessions.

**In scope**
- Implement a pure utility function that computes expansion usage percentage (count ÷ total games × 100, rounded)
- Display the computed percentage alongside the existing count in the expansion list in the History tab
- Localise the percentage display across all six supported locales
- Cover the calculation and the updated UI with automated tests

**Stories**

### Story 87.1 — Implement a pure utility function that calculates expansion usage percentage from history data
**Acceptance Criteria**
The utility is a pure function accepting `(count: number, total: number)`; it returns `Math.round((count / total) * 100)`; when `total` is `0` it returns `0` (not `NaN`); it has no side effects and no UI imports.

### Story 87.2 — Display the expansion usage percentage alongside the count in the History tab expansion list
**Acceptance Criteria**
Each expansion row in the History statistics section shows both the raw count and the rounded percentage (e.g. "12 (60%)"); when total games played is 0, the percentage is not displayed or shows "—"; the layout uses design-system tokens.

### Story 87.3 — Localise the percentage label and format across all six locale files
**Acceptance Criteria**
The percentage label format string (e.g. `"{count} ({percent}%)"`) is defined in the locale system; the required key(s) are present in `en`, `fr`, `de`, `ja`, `ko`, and `es` locale files; no hardcoded strings appear in component code.

### Story 87.4 — Test: percentage utility and History tab integration
**Acceptance Criteria**
`npm run lint` and `npm test` pass; the percentage utility has at least four unit-test cases (normal case, zero total, 100% usage, fractional rounding); at least one History tab integration test asserts that a percentage figure is rendered for an expansion.

### Story 87.5 — QC (Automated)
Run `npm run lint` then `npm test`; all checks pass with no regressions.
