## Epic 110 — Update All Project Dependencies

**Objective**
Update the project’s declared and resolved package dependencies to current releases that remain compatible with the project, while preserving existing behavior. Inventory and assess the dependencies before making changes; do not assume any dependency is currently outdated.

**In scope**
- Inventory direct dependencies and resolved transitive dependencies recorded by the project’s package manifest and lockfile, and assess available updates
- Update dependency declarations and lockfile resolutions, including transitive dependencies where supported by the package manager
- Evaluate major-version updates and address compatibility changes required by selected updates
- Record any dependency that cannot be safely updated, with the reason and any remaining compatibility risk
- Verify installation and run the project’s existing lint, test, and build checks
- Limit changes to dependency updates and compatibility work they require; exclude unrelated feature work and platform or infrastructure upgrades not represented as project dependencies

**Stories**
1. **Inventory project dependencies and assess available updates**
2. **Evaluate compatibility and breaking changes for dependency updates**
3. **Update dependency declarations and lockfile resolutions**
4. **Address compatibility changes caused by dependency updates**
5. **Validate the updated dependencies and document any blocked updates**

**Acceptance Criteria**
- Story 1: An inventory identifies the project’s declared direct dependencies and lockfile-resolved transitive dependencies, and records which have available updates without asserting outdated status before the assessment.
- Story 2: Available updates are assessed for compatibility, including major-version changes; required migration work and any updates that cannot be safely applied are documented with reasons.
- Story 3: Dependency declarations and lockfile resolutions are updated for the selected updates, and the package manager can install from the resulting manifest and lockfile.
- Story 4: Compatibility changes required by the selected updates are implemented; no unrelated feature changes are included.
- Story 5: The project’s existing lint, test, and build checks are run and their results recorded. Any dependency left unchanged is explicitly listed with its reason; no update is represented as completed if it remains blocked.
