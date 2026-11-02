## Epic 108 — Initialise the v2.3.0 Release Cycle

**Objective**
Start the v2.3.0 release cycle by updating the repository’s canonical project-version references and creating the standard release-notes scaffold.

**In scope**
- Update the `package.json` version from `2.2.0` to `2.3.0`
- Update `sonar-project.properties` `sonar.projectVersion` to `2.3.0`
- Create `documentation/release-notes/v2.3.0-release-notes.md` using the repository’s standard release-notes structure

**Stories**
1. **Bump the `package.json` version to `2.3.0`**
2. **Update the SonarCloud project version to `2.3.0`**
3. **Create the v2.3.0 release-notes scaffold**

**Acceptance Criteria**
- Story 1: `package.json` contains `"version": "2.3.0"`; no unrelated package fields are changed; the existing version injection displays `2.3.0` in the application version badge after a build.
- Story 2: `sonar-project.properties` contains `sonar.projectVersion=2.3.0`; no unrelated SonarCloud settings are changed.
- Story 3: `documentation/release-notes/v2.3.0-release-notes.md` exists, follows the heading and disclaimer/intro structure of the existing release notes, and has a `What's in v2.3.0` section ready for release entries.
