## Epic 86 — UI Polish: Button Spacing, Preview Pane Label, Focus Ring, and Card Separators

**Objective**
Four small but visible UI inconsistencies accumulate across the app: buttons with insufficient spacing below them, a redundant "Selected mode" label in the Setup preview pane, an unwanted focus ring on history items when clicked with a pointer, and unnecessary per-card separators in the Browse "Show details" panel. This epic addresses all four in a single coordinated pass.

**In scope**
- Add bottom spacing below buttons in every view where they sit flush against the content below, using design-system tokens
- Remove the "Selected mode" label from the Setup engine preview pane
- Remove the focus ring that appears on game items in the History tab when activated via pointer (click/tap), while preserving keyboard-focus accessibility
- Remove the per-card separator in the Browse "Show details" panel, keeping only the category-level separator
- Validate all changes with lint and automated tests

**Stories**

### Story 86.1 — Add correct bottom spacing below buttons across all views where they are flush against content below
**Acceptance Criteria**
No button in any view has zero spacing between itself and the next content element; all spacing values reference design-system tokens; no hardcoded pixel values are introduced.

### Story 86.2 — Remove the "Selected mode" label from the Setup engine preview pane
**Acceptance Criteria**
The "Selected mode" label/element is absent from the Setup engine preview pane in all rendering states.

### Story 86.3 — Remove the pointer-triggered focus ring from game items in the History tab
**Acceptance Criteria**
Clicking or tapping a game item in the History tab does not produce a visible focus ring; keyboard-navigated focus (via Tab key) still shows a visible focus indicator, preserving WCAG 2.4.7 compliance.

### Story 86.4 — Remove per-card separators from the Browse "Show details" panel, keeping category separators
**Acceptance Criteria**
The "Show details" panel in the Browse tab renders exactly one separator per category group and zero separators between individual cards within a group.

### Story 86.5 — Test: all four UI polish changes
**Acceptance Criteria**
`npm run lint` and `npm test` pass with no regressions; each of the four changes is covered by at least one unit or integration test assertion.

### Story 86.6 — QC (Automated)
Run `npm run lint` then `npm test`; all checks pass with no regressions.
