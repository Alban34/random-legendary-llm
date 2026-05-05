# Epic 93 — v2.1.1 Release Initialization and SonarCloud Issue Resolution

## Story 93.1 — Bump the project version to 2.1.1 in all version-bearing files

- [x] Search `package.json` for the current version string and update it to `2.1.1`
- [x] Search `README.md` for any version references and update them to `2.1.1`
- [x] Search `sonar-project.properties` for the version property and update it to `2.1.1`
- [x] Search all files under `documentation/release-notes/` for version references and confirm they are consistent (prior release notes are historical; add a stub entry for v2.1.1 if one does not exist)
- [x] Search `index.html` and `public/manifest.webmanifest` for any hardcoded version strings and update them to `2.1.1`
- [x] Run a workspace-wide search for the old version string to catch any remaining references in source files, config files, or documentation
- [x] Update any remaining files identified by the workspace-wide search
- [x] Test: verify `npm run lint` passes with no errors
- [x] QC (Automated): `npm run lint`

---

## Story 93.2 — Fix all Blocker and Critical severity SonarCloud issues

> **Note:** Browse the SonarCloud dashboard for this project and filter by severity **Blocker** and **Critical**. Add one task per issue identified, then implement each fix. The tasks below are placeholders to be filled in based on the live SonarCloud report.

- [x] Browse SonarCloud and list all open Blocker-severity issues
- [x] Browse SonarCloud and list all open Critical-severity issues
- [x] [Placeholder] Fix Blocker/Critical issue #1 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Fix Blocker/Critical issue #2 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Fix Blocker/Critical issue #3 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Add further tasks here for each additional Blocker/Critical issue found
- [x] Confirm no new Blocker or Critical issues are introduced by the fixes (re-check SonarCloud or local analysis)
- [x] Test: verify `npm run lint` and `npm test` pass with no errors
- [x] QC (Automated): `npm run lint` then `npm test`

---

## Story 93.3 — Fix all Major severity SonarCloud issues

> **Note:** Browse the SonarCloud dashboard for this project and filter by severity **Major**. Add one task per issue identified, then implement each fix. The tasks below are placeholders to be filled in based on the live SonarCloud report.

- [x] Browse SonarCloud and list all open Major-severity issues
- [x] [Placeholder] Fix Major issue #1 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Fix Major issue #2 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Fix Major issue #3 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Add further tasks here for each additional Major issue found
- [x] Confirm no new Major issues are introduced by the fixes (re-check SonarCloud or local analysis)
- [x] Test: verify `npm run lint` and `npm test` pass with no errors
- [x] QC (Automated): `npm run lint` then `npm test`

---

## Story 93.4 — Fix all Minor and Info severity SonarCloud issues

> **Note:** Browse the SonarCloud dashboard for this project and filter by severity **Minor** and **Info**. Add one task per issue identified, then implement each fix. The tasks below are placeholders to be filled in based on the live SonarCloud report.

- [x] Browse SonarCloud and list all open Minor-severity issues
- [x] Browse SonarCloud and list all open Info-severity issues
- [x] [Placeholder] Fix Minor/Info issue #1 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Fix Minor/Info issue #2 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Fix Minor/Info issue #3 — (fill in rule + file + description from SonarCloud)
- [x] [Placeholder] Add further tasks here for each additional Minor/Info issue found
- [x] Confirm no new Minor or Info issues are introduced by the fixes (re-check SonarCloud or local analysis)
- [x] Test: verify `npm run lint` and `npm test` pass with no errors
- [x] QC (Automated): `npm run lint` then `npm test`

---

## Story 93.5 — Verify the SonarCloud open-issue count reaches zero after all fixes land

> **Note:** This is a verification-only story. No implementation tasks. All tasks are QC/verification steps.

- [x] Confirm all Story 93.2, 93.3, and 93.4 tasks are checked off before proceeding
- [x] Trigger a SonarCloud analysis scan (via CI pipeline or local `sonar-scanner` run)
- [x] Verify the SonarCloud dashboard shows **0 open issues** across all severities (Blocker, Critical, Major, Minor, Info)
- [x] Verify the SonarCloud dashboard shows **0 open bugs**, **0 vulnerabilities**, and **0 code smells**
- [x] Run the full Vitest suite and confirm no regressions: `npm test`
- [x] Run the full Playwright suite and confirm no regressions: `npx playwright test`
- [x] QC (Automated): `npm run lint` + `npm test` + `npx playwright test`
- [x] QC (Manual): SonarCloud dashboard review — confirm zero open issues
