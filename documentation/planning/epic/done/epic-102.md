# Epic 102 — Initialise the v2.1.4 development cycle

## Objective
Bump the project version to 2.1.4 across every canonical version reference in the repository and create the empty release notes scaffold that will be filled as features land in this cycle.

## In scope
- Update `package.json` `version` field from `2.1.3` to `2.1.4`
- Update `sonar-project.properties` `sonar.projectVersion` from `2.1.3` to `2.1.4`
- Create `documentation/release-notes/v2.1.4-release-notes.md` with the standard header scaffold

## Stories

### Story 102.1 — Bump the version field in `package.json` to `2.1.4`
Update the `version` property in `package.json` from `2.1.3` to `2.1.4`. No other fields should be modified.

### Story 102.2 — Update `sonar-project.properties` project version to `2.1.4`
Change the `sonar.projectVersion` entry in `sonar-project.properties` from `2.1.3` to `2.1.4`. No other SonarCloud settings should be modified.

### Story 102.3 — Create the v2.1.4 release notes scaffold file
Create `documentation/release-notes/v2.1.4-release-notes.md` using the same heading structure and disclaimer preamble present in `v2.1.3-release-notes.md`. Leave the "What's in v2.1.4" section body empty — it will be filled as stories are completed.

## Acceptance Criteria
- Story 102.1: `package.json` contains `"version": "2.1.4"` and no other fields are altered.
- Story 102.2: `sonar-project.properties` contains `sonar.projectVersion=2.1.4`.
- Story 102.3: `documentation/release-notes/v2.1.4-release-notes.md` exists, its title heading reads `# Legendary: Marvel Randomizer — v2.1.4 Release Notes`, and the standard disclaimer/intro preamble is present.
