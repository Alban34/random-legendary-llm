# Epic 98 — v2.1.3 Release Preparation Task List

## Story 1: Version bump

- [x] In `package.json` (line 4), change `"version": "2.1.2"` → `"version": "2.1.3"`
- [x] In `sonar-project.properties` (line 9), change `sonar.projectVersion=2.1.1` → `sonar.projectVersion=2.1.3`
- [x] In `src/app/locales/locales.test.ts` (lines 71–73), update the version assertion: change `'2.1.2'` → `'2.1.3'` in the `'Package.json version is 2.1.2'` test (also update the test description string to `'Package.json version is 2.1.3'`)
- [x] Run `npm install --package-lock-only` (or `npm install`) to regenerate `package-lock.json` with the new version — do **not** manually edit `package-lock.json`
- [x] Verify `npm run build` completes without errors after all bumps are applied

**Test**
- [x] Confirm `src/app/locales/locales.test.ts` — the `'Package.json version is 2.1.3'` assertion passes with the updated version string

**QC (Automated)**
- [x] Run lint (`npm run lint`) — must pass with zero errors
- [x] Run unit tests (`npm run test`) — the version assertion test must pass; no regressions

---

## Story 2: Release notes

- [x] Create `documentation/release-notes/v2.1.3-release-notes.md` following the structure of `v2.1.2-release-notes.md`
  - Title: `# Legendary: Marvel Randomizer — v2.1.3 Release Notes`
  - Release date block: `**Released: May 2026**`
  - Disclaimer blockquote: `> Fan-made tool. Not affiliated with Marvel or Upper Deck Entertainment.`
  - "What is this?" section: copy standard boilerplate paragraph from v2.1.2
  - "What's in v2.1.3" section with intro sentence
  - Feature section: **Replay from History** — users can replay any previous game from the History tab with the exact same cards
  - Bug fix section: **Data fix: Hank Pym, Yellowjacket mastermind corrected** — the forced lead field was incorrect and has been corrected

---

## Story 3: CI gate (QC)

- [x] Confirm the lint step passes cleanly (`npm run lint`) on the version-bumped branch
- [x] Confirm all unit tests pass (`npm run test`) with no new failures
- [x] Confirm `npm run build` produces a clean production build
- [x] Confirm the E2E smoke suite passes (`npm run e2e` or equivalent Playwright config) with no new failures
- [x] Declare the v2.1.3 milestone open only after all CI stages exit green
