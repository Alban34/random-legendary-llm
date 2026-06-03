# Epic 102 — Initialise the v2.1.4 development cycle — Task List

## Story 102.1 — Bump the version field in `package.json` to `2.1.4`
- [x] Update `version` property in `package.json` from `2.1.3` to `2.1.4`
- [x] Test: Verify `package.json` contains `"version": "2.1.4"` and no other fields changed
- [x] QC (Automated): N/A — no automated test suite covers version fields

## Story 102.2 — Update `sonar-project.properties` project version to `2.1.4`
- [x] Update `sonar.projectVersion` in `sonar-project.properties` from `2.1.3` to `2.1.4`
- [x] Test: Verify file contains `sonar.projectVersion=2.1.4` and no other settings changed
- [x] QC (Automated): N/A — no automated test suite covers SonarCloud config

## Story 102.3 — Create the v2.1.4 release notes scaffold file
- [x] Read `documentation/release-notes/v2.1.3-release-notes.md` to understand the standard heading structure and disclaimer preamble
- [x] Create `documentation/release-notes/v2.1.4-release-notes.md` with the same heading structure and disclaimer preamble, title reading `# Legendary: Marvel Randomizer — v2.1.4 Release Notes`, with the "What's in v2.1.4" section body left empty
- [x] Test: Verify file exists, title heading is correct, standard preamble is present
- [x] QC (Automated): N/A — documentation file, no automated checks apply
