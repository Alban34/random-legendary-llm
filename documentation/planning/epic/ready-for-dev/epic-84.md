## Epic 84 — Category Grouping Fieldsets in Browse Cards

**Objective**
The "Browse Cards" view in the Collection tab presents all cards in a flat list, making it hard to navigate by category. This epic introduces the same grouping-fieldset pattern already used in the Game History view so that cards are visually organised by their category.

**In scope**
- Identify the category field in the card data model and define the client-side grouping logic
- Wrap each category group in a fieldset (or equivalent design-system component) consistent with the History tab layout
- Localise category labels across all supported locale files
- Cover the grouping logic and the updated view with automated tests

**Stories**

### Story 84.1 — Identify the card category field and implement a grouping utility function
**Acceptance Criteria**
The grouping key is the existing category field from the card data model; the utility is a pure function; the choice is recorded in a code comment or in this epic file.

### Story 84.2 — Render a labelled fieldset group for each card category in the Browse Cards view
**Acceptance Criteria**
Each category is visually wrapped in a fieldset/group element whose styling matches the History tab groupings; no hardcoded colours or spacing values are introduced.

### Story 84.3 — Add or update locale keys for category group labels in all six locale files
**Acceptance Criteria**
All category label strings are sourced from the locale system; the required keys are present in `en`, `fr`, `de`, `ja`, `ko`, and `es` locale files; `npm run lint` passes.

### Story 84.4 — Test: grouping utility and Browse Cards integration
**Acceptance Criteria**
`npm run lint` and `npm test` pass; the grouping utility has unit-test coverage for at least three category configurations; at least one Browse Cards integration test asserts that category group headings are rendered.

### Story 84.5 — QC (Automated)
Run `npm run lint` then `npm test`; all checks pass with no regressions.
