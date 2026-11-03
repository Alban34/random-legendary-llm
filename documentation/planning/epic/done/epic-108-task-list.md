# Epic 108 Task List — Initialise the v2.3.0 Release Cycle

## Story 108.1 — Bump the `package.json` version to `2.3.0`

1. - [x] In `package.json`, change only the `version` field from `2.2.0` to `2.3.0`
2. - [x] Remove the package-version test that pins the current release number
3. - [x] Test: preserve generic checks that Vite injects `pkg.version` as `__APP_VERSION__` and that the badge renders the injected value; checking the bumped value is a delivery review/QC responsibility
4. - [x] In `package-lock.json`, update only the root `version` and `packages[""].version` metadata to `2.3.0`; verify no other lockfile fields changed
5. - [x] QC (Automated): run the locale tests, generic app-version injection/badge checks, and `npm run build`

---

## Story 108.2 — Update the SonarCloud project version to `2.3.0`

1. - [x] In `sonar-project.properties`, change only `sonar.projectVersion` to `2.3.0`
2. - [x] Do not add a test that pins the current `sonar.projectVersion`; checking the bumped value is a delivery review/QC responsibility
3. - [x] Review the diff to confirm no other SonarCloud settings changed
4. - [x] QC (Review): verify the `sonar.projectVersion` bump value and confirm no unrelated SonarCloud settings changed

---

## Story 108.3 — Create the v2.3.0 release-notes scaffold

1. - [x] Create `documentation/release-notes/v2.3.0-release-notes.md` using the heading, disclaimer, and introductory structure of the existing release notes (for example, `v2.2.0-release-notes.md`)
2. - [x] Add the `What's in v2.3.0` section, ready for release entries; do not add release content not specified by this epic
3. - [x] Test: check the versioned release-notes file and its heading, disclaimer/intro structure, and versioned release-entry section without pinning a specific version in runtime assertions
4. - [x] QC (Automated): run the targeted release-notes structure test
