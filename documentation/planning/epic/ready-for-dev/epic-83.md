## Epic 83 — Setup Tab: Forced Picks Layout Fix and Dropdown UX Improvement

**Objective**
Two UX problems in the Setup tab degrade the experience: expanding "Forced Picks" breaks the page layout, and the dropdown component lacks visual polish. This epic fixes the layout regression and improves the dropdown's appearance following a UX-expert consultation.

**In scope**
- Diagnose and patch the CSS/layout regression triggered when the "Forced Picks" section is expanded
- Consult a UX expert agent to produce documented design recommendations for the dropdown
- Implement the approved dropdown improvements using design-system CSS tokens
- Cover the fixes with automated tests

**Stories**

### Story 83.1 — Diagnose and fix the layout break caused by expanding the "Forced Picks" section
**Acceptance Criteria**
Expanding "Forced Picks" no longer causes any visible layout overflow, clipping, or misalignment in the Setup tab at any supported viewport width; the fix uses design-system tokens and does not introduce hardcoded sizes or colours.

### Story 83.2 — Consult a UX expert agent and document dropdown improvement recommendations
**Acceptance Criteria**
A written UX recommendation note (inline in this epic file or a linked document under `documentation/`) lists the proposed dropdown improvements, the rationale, and any rejected alternatives before implementation begins.

### Story 83.3 — Implement the approved dropdown UX improvements with design-system tokens
**Acceptance Criteria**
The dropdown matches the agreed UX design; all style values reference design-system CSS tokens; no hardcoded colour, border, or spacing values are introduced.

### Story 83.4 — Test: layout fix and dropdown styles
**Acceptance Criteria**
`npm run lint` passes; existing unit and integration tests pass; at least one new test (unit, integration, or visual regression) verifies the Forced Picks layout is stable when expanded, and at least one test checks the dropdown renders with the updated styles.

### Story 83.5 — QC (Automated)
Run `npm run lint` then `npm test`; all checks pass with no regressions.
