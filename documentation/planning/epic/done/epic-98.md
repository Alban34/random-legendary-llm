## Epic 98 — v2.1.3 Release Preparation

**Objective**
Advance the project to the 2.1.3 version milestone by updating all version-bearing files, authoring the release notes, and confirming the full CI pipeline passes cleanly on the updated codebase.

**In scope**
- Bump the version string in `package.json` (and any other file that embeds the version number, e.g. `sonar-project.properties`, `manifest.webmanifest`)
- Author the `documentation/release-notes/v2.1.3-release-notes.md` file following the established format
- Verify the CI pipeline (lint, unit tests, build, E2E smoke) passes on the bumped version before the milestone is declared open

**Stories**
1. **Bump the version to 2.1.3 in package.json and all version-bearing configuration files**
2. **Draft the v2.1.3 release notes document in the established release-notes format**
3. **Confirm the CI pipeline passes cleanly against the updated version**

**Acceptance Criteria**
- Story 1: `package.json` `version` field reads `2.1.3`; every other file that embeds the version string is updated to match; `npm run build` completes without error.
- Story 2: `documentation/release-notes/v2.1.3-release-notes.md` exists and follows the same structure as prior release note files; it lists at minimum the features and defect fixes delivered in this version.
- Story 3: The CI pipeline (lint → unit tests → build → E2E smoke) exits green with no new failures on the version-bumped branch.
