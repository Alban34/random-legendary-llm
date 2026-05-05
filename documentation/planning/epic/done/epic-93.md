# Epic 93 — v2.1.1 Release Initialization and SonarCloud Issue Resolution

**Objective**
Kick off the v2.1.1 clean-code release by updating all version references, then eliminate every open SonarCloud issue so the project carries zero reported bugs, vulnerabilities, and code smells going into the release.

**In scope**
- Bump the project version to 2.1.1 in `package.json` and any other files that carry the version string
- Resolve all 99 open SonarCloud issues tracked at https://sonarcloud.io/project/issues?issueStatuses=OPEN&id=Alban34_random-legendary-llm
- Issues are prioritized by SonarCloud severity: Blocker/Critical first, then Major, then Minor/Info
- No new user-facing features may be introduced as part of this epic

**Stories**

### Story 93.1 — Bump the project version to 2.1.1 in all version-bearing files
**Acceptance criteria:**
- `package.json` reports version `2.1.1`
- Any other file that previously referenced the old version number is updated consistently
- `npm run lint` passes

### Story 93.2 — Fix all Blocker and Critical severity SonarCloud issues
**Acceptance criteria:**
- Every issue tagged Blocker or Critical in the SonarCloud issue list is resolved (status Closed or Won't Fix with documented rationale)
- `npm run lint` and `npm test` pass

### Story 93.3 — Fix all Major severity SonarCloud issues
**Acceptance criteria:**
- Every issue tagged Major in the SonarCloud issue list is resolved
- `npm run lint` and `npm test` pass

### Story 93.4 — Fix all Minor and Info severity SonarCloud issues
**Acceptance criteria:**
- Every issue tagged Minor or Info in the SonarCloud issue list is resolved
- `npm run lint` and `npm test` pass

### Story 93.5 — Verify the SonarCloud open-issue count reaches zero after all fixes land
**Acceptance criteria:**
- The SonarCloud dashboard for `Alban34_random-legendary-llm` shows 0 open issues
- No regression is introduced in any Playwright or Vitest test suite
