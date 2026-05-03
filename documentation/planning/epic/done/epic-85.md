## Epic 85 — My Collection: Remove Noise and Restore Storage Error Notice

**Objective**
The "My Collection" tab shows a "latest action" info line and an always-visible storage notice that add noise under normal conditions. This epic removes those elements from the default view and re-introduces the storage notice exclusively as a conditional error message, keeping the UI clean while still surfacing genuine storage problems.

**In scope**
- Remove the "latest action" information line from the My Collection view
- Remove the always-visible storage notice from the My Collection view
- Add a conditional storage-error notice that appears only when a storage error is detected
- Cover the conditional visibility with automated unit tests

**Stories**

### Story 85.1 — Remove the "latest action" information element from the My Collection view
**Acceptance Criteria**
The "latest action" text element is absent from the rendered My Collection view under all application states.

### Story 85.2 — Remove the always-visible storage notice from the My Collection view
**Acceptance Criteria**
The storage notice element is absent from the My Collection view under normal (no-error) conditions.

### Story 85.3 — Introduce a conditional storage-error notice that renders only on detected storage errors
**Acceptance Criteria**
When a storage error occurs (e.g. quota exceeded or write failure), the storage-error notice is displayed with an appropriate user-facing message; when no error exists, the element is not rendered; any new user-facing strings are added to all six locale files.

### Story 85.4 — Test: conditional storage-error notice visibility
**Acceptance Criteria**
`npm run lint` and `npm test` pass; the conditional visibility is covered by at least two unit tests — one for the no-error (hidden) state and one for the error (visible) state — using mocked storage states.

### Story 85.5 — QC (Automated)
Run `npm run lint` then `npm test`; all checks pass with no regressions.
