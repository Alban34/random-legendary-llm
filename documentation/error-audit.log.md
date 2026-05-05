[F-008] [2026-05-04] Epic: Epic 89 — Browse Card Grouping Consistency and Default Expanded State
File: documentation/planning/epic/ready-for-dev/epic-89.md, documentation/planning/epic/ready-for-dev/epic-89-task-list.md
Finding: Epic 89 has been fully implemented but `epic-89.md` and `epic-89-task-list.md` remain in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`.
Suggested action: Move `epic-89.md` and `epic-89-task-list.md` from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to match the lifecycle convention used by all prior completed epics.
---
[F-009] [2026-05-04] Epic: Epic 90 — Fix History Grouping Filter Button Hover Clipping
File: documentation/planning/epic/ready-for-dev/epic-90.md, documentation/planning/epic/ready-for-dev/epic-90-task-list.md
Finding: Epic 90 has been fully implemented but `epic-90.md` and `epic-90-task-list.md` remain in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`.
Suggested action: Move `epic-90.md` and `epic-90-task-list.md` from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to match the lifecycle convention used by all prior completed epics.
---
[F-010] [2026-05-04] Epic: Epic 89, Epic 90
File: documentation/release-notes/ (no file exists for the version containing these epics)
Finding: No release notes file exists for the version that ships Epics 89 and 90. The latest file is `v2.1.0-release-notes.md`, which covers Epics 75, 76, 78, and 80. The browse card grouping improvements (Epic 89) and the hover-clipping CSS fix (Epic 90) have not been documented in any release notes.
Suggested action: Create a release notes file for the next version (e.g. `v2.1.1-release-notes.md` or `v2.2.0-release-notes.md`) and add entries for: (1) all Browse Cards groups now expand by default in both "By Category" and "By Expansion" views; (2) By Expansion view now uses collapsible `<details class="history-group">` groups matching the Category view; (3) hover/focus outline clipping on History grouping buttons is fixed by `padding-top: 4px` on `.button-row-scroll`.
---
[F-001] [FIXED 2026-05-03] Epic: Epic 81 — Eliminate All .js Source Files
File: documentation/planning/epic/ready-for-dev/epic-81.md, documentation/planning/epic/ready-for-dev/epic-81-task-list.md
Finding: Epic 81 has been fully implemented (all implementation tasks marked [x] in the task list) but the epic spec and task-list files remain in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`. The tech-writer agent cannot move files (no delete/move tool available), so the relocation is logged here.
Suggested action: Move `epic-81.md` and `epic-81-task-list.md` from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to keep the lifecycle folders consistent with all prior completed epics.
Resolution (2026-05-03): Confirmed — `epic-81.md` and `epic-81-task-list.md` are present in `documentation/planning/epic/done/`. The `ready-for-dev/` folder is empty.
---
[F-002] [FIXED 2026-05-03] Epic: Epic 82 — Co-locate Unit Tests with Their Source Modules
File: documentation/planning/epic/ready-for-dev/epic-82.md, documentation/planning/epic/ready-for-dev/epic-82-task-list.md
Finding: Epic 82 has been fully implemented (all implementation tasks marked [x] in the task list) but the epic spec and task-list files remain in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`. The tech-writer agent cannot move files (no delete/move tool available), so the relocation is logged here.
Suggested action: Move `epic-82.md` and `epic-82-task-list.md` from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to keep the lifecycle folders consistent with all prior completed epics.
Resolution (2026-05-03): Confirmed — `epic-82.md` and `epic-82-task-list.md` are present in `documentation/planning/epic/done/`. The `ready-for-dev/` folder is empty.
---
[F-003] [FIXED 2026-04-14] Epic: Epics 29–33 (Svelte 5 Migration)
File: README.md
Finding: The root README is stale in four ways after the Svelte 5 migration:
  1. "Project state" section says "Epic 1 through Epic 20 implementation" — Epics 29–33 have been implemented but are not mentioned.
  2. The "fully static" paragraph says "no framework build step" — this is now false; the app uses Vite + @sveltejs/vite-plugin-svelte as a build step.
  3. The entry-point list includes "`src/app/browser-entry.mjs` — browser bootstrap entry" without noting that it now only calls Svelte 5 mount() rather than bootstrapping the full app.
  4. The entry-point list includes "`src/app/app-renderer.mjs` — browser rendering for the current foundation screen" — app-renderer.mjs is now a transitional module used only via {@html} blocks inside Svelte tab components, not the primary rendering layer.
Suggested action: Update README.md to mention Epics 29–33 are implemented, replace "no framework build step" with a note about the Vite + Svelte 5 build pipeline, and update the entry-point descriptions for browser-entry.mjs and app-renderer.mjs to reflect their post-migration roles.
---
[Resolution → F-003] [2026-04-14] Resolution: All four stale items from the 2026-04-13 README.md finding have been corrected:
  1. Epic coverage updated to Epics 1–28 + migration Epics 29–33.
  2. "No framework build step" replaced with accurate Vite + Svelte 5 build note.
  3. browser-entry.mjs description updated to reflect Svelte 5 mount() role.
  4. app-renderer.mjs description updated to reflect transitional {@html} helper role.
  Additional corrections applied in the same pass: locale list expanded to all 6 shipped locales, history grouping modes updated to current shipped modes, state-store.svelte.js and App.svelte added to entry-point list.
---
[F-004] [FIXED 2026-04-16] Epic: Epic 43 — Expansion Attribution in History
File: src/components/HistoryTab.svelte
Finding: The architecture/overview.md description of BrowseTab.svelte, CollectionTab.svelte, NewGameTab.svelte, HistoryTab.svelte, and BackupTab.svelte as "thin {@html} wrapper components" was stale before Epic 43 and was fixed in-scope during this audit. HistoryTab.svelte contains no {@html} blocks; it is a full Svelte 5 component with $props(), $derived(), {#each} loops, and direct template markup. The "thin {@html} wrapper" characterisation was almost certainly left over from the pre-Svelte-5-migration state and should have been corrected during the Epics 29–33 alignment pass. No action required on the source file itself.
Suggested action: No code change required. The documentation/architecture/overview.md description has been corrected in this audit pass. Future migration alignment audits should verify tab-component descriptions whenever a tab component is substantially changed.
---
[F-005] [FIXED 2026-04-16] Epic: Epic 42 — BGG Collection Import
File: src/app/bgg-import-utils.mjs (implementation summary)
Finding: The Epic 42 implementation summary provided to the tech-writer states that `src/app/bgg-import-utils.mjs` exports `mergeOwnedSets`. Source inspection shows `mergeOwnedSets` lives in `src/app/collection-utils.mjs` and `App.svelte` imports it from there; `bgg-import-utils.mjs` only exports `fetchBggCollection` and `matchBggNamesToSets`. The implementation summary was inaccurate. The architecture documentation has been updated to reflect the actual source layout; no corrective change is needed to the source files.
Suggested action: No code change required. Future implementation summaries should be verified against actual source exports before being passed to the tech-writer to avoid misleading audit trails.
---
[F-006] [OBSOLETE 2026-04-17] Epic: Epic 46 — Active Expansion Filter ("Play Set")
File: documentation/planning/epic/done/epic-46-task-list.md (Story 46.3 task 5)
Finding: The task list states "Add a 'Clear all' affordance that calls `clearActiveSetIds()` (implementation sentinel is `null`=all-owned, so both Select all and Clear all restore the all-owned state)." The shipped implementation introduces a distinct `deactivateAllSets()` action (exported from `src/app/state-store.mjs`) that sets `activeSetIds` to `[]` (empty array, not null). "Clear all" calls `deactivateAllSets()` while "Use all expansions" calls `clearActiveSetIds()`. The two buttons have different runtime effects: `null` is the all-owned fallback (checkboxes all checked), while `[]` is the explicitly-deselected state (all unchecked, pool empty, Generate disabled). The task list note is therefore incorrect about the shipped behavior of "Clear all".
Suggested action: The task list is a historical planning artifact in the `done/` folder and should not be retroactively edited. However, future readers should be aware the shipped behavior diverges from the task description. The corrected behavior is reflected in `documentation/architecture/setup-rules.md` and `documentation/architecture/overview.md` as of this audit pass.
---
[F-007] [FIXED 2026-04-19] Epic: Epic 57 — Solo Mode Rules Reference Panel
File: documentation/ux/ui-design.md (Tab 3 — New Game mock diagram and interactions)
Finding: The New Game tab mock diagram shows only three 1-player play-mode buttons: `[Standard Solo] [Advanced Solo] [Two-Handed]`. Epic 56 (dependency of Epic 57) introduced a fourth 1-player mode, `standard-solo-v2` ("Standard v2"). The diagram and the interaction bullet "1-player mode exposes Standard Solo, Advanced Solo, and Two-Handed Solo" are both missing `Standard v2`. This is a pre-existing documentation gap from Epic 56, not Epic 57.
Suggested action: Update the Tab 3 mock diagram and the interactions bullet in `documentation/ux/ui-design.md` to add `[Standard v2]` to the play-mode button row and include "Standard v2" in the list of 1-player modes. Edit scope: within `/documentation`.
---
[Resolution → F-007] [2026-04-19] Resolution: Epic 57 finding resolved. Updated documentation/ux/ui-design.md Tab 3 mock diagram to add [Standard v2] button and updated the 1-player mode interactions bullet to include "Standard v2".
---
[F-008] [2026-04-21] Epic: Epic 64 — Migrate Core Game Engine to TypeScript
File: documentation/planning/defects-v2.0.0.md
Finding: Line 10–11 reference `src/app/setup-generator.mjs` in a closed (✓) defect record describing a past fix. The file has since been renamed to `setup-generator.ts` by Epic 64. The statement is a historical past-tense record; editing it would misrepresent when the fix occurred.
Suggested action: No change required — the entry is an accurate historical record. If the team adopts a convention of updating past defect log entries to reflect current file names, a human should update lines 10–11 to `src/app/setup-generator.ts`.
---
[F-009] [2026-04-21] Epic: Epic 65 — Migrate App Services & Integrations to TypeScript
File: src/app/state-store.svelte.js
Finding: Lines 4, 16, and 39 still reference `state-store.mjs`. Line 4 has "Node unit tests must import from state-store.mjs directly". Line 16 has "via hydrateState / loadState from state-store.mjs". Line 39 has a JSDoc `@param` typed as `import('./state-store.mjs').createDefaultState`. All three should read `state-store.ts` after Epic 65 renamed the module.
Suggested action: Update the three comment/JSDoc references in `src/app/state-store.svelte.js` to use `state-store.ts`.
---
[F-010] [2026-04-21] Epic: Epic 65 — Migrate App Services & Integrations to TypeScript
File: src/components/App.svelte
Finding: Line 165 contains the comment "// Debug globals (mirrors syncDebugGlobals from browser-entry.mjs)" which should read `browser-entry.ts` after Epic 65 renamed the module.
Suggested action: Update the comment on line 165 of `src/components/App.svelte` to reference `browser-entry.ts`.
---
[F-011] [2026-04-21] Epic: Epic 66 — Migrate Svelte Reactive View Models to TypeScript
File: src/app/state-store.svelte.ts
Finding: The prior Epic 65 finding (above) was filed against `src/app/state-store.svelte.js` and noted stale `state-store.mjs` comment/JSDoc references at lines 4, 16, and 39. Epic 66 renamed that file to `state-store.svelte.ts`. It is unknown whether the stale comments were resolved during the TypeScript migration or whether they persist in the renamed file.
Suggested action: Check `src/app/state-store.svelte.ts` lines 4, 16, and 39 to confirm whether the `state-store.mjs` comment/JSDoc references were corrected. If they remain, update them to `state-store.ts`.
---
[F-012] [2026-04-22] Epic: Epic 68 — Test Runner Upgrade, Type Coverage & 2.0.0 Release
File: src/components/App.svelte, src/components/TabNav.svelte, src/components/ToastStack.svelte
Finding: The QC verification task for Epic 68 Stories 1 and 2 (`npm run lint`) is marked `[x]` complete in `epic-68-task-list.md` but also annotated `BLOCKED: pre-existing no-unused-vars errors in App.svelte, TabNav.svelte, ToastStack.svelte (introduced in Epics 61–67)`. The lint gate was not cleared; `npm run lint` does not exit 0. The `svelte-check` type-coverage gate added to the lint script (Epic 68 Story 1) cannot be confirmed as passing against the component layer until these lint errors are resolved.
Suggested action: An Epic Frontend Expert pass is required to resolve the `no-unused-vars` lint errors in `src/components/App.svelte`, `src/components/TabNav.svelte`, and `src/components/ToastStack.svelte`. Once fixed, re-run `npm run lint` and confirm exit 0 before considering Epic 68 Stories 1 and 2 fully signed off.
---
[F-013] [FIXED 2026-04-22] Epic: Epic 41 — Translation Data Model Migration
File: test/epic-ux6-backup-safety.test.mjs, test/epic16-notification-refinements.test.mjs, test/epic17-onboarding-information-architecture.test.mjs, test/epic36-version-storage-disclosure.test.mjs
Finding: The Epic 41 spec (story 41.3 acceptance criteria and the epic-wide validation gate in epic-41-task-list.md) states that "no file outside localization-utils.mjs required modification" and that git diff should list only localization-utils.mjs and the six locale files. The delivered implementation summary reports that four test files were also modified ("updated to read from locale files"). The validation gate checkbox is marked [x] done despite this deviation. The root cause is likely that these tests previously imported *_MESSAGES constants inline from localization-utils.mjs and had to be updated to import from the per-locale files directly after the inline constants were removed — making the spec's "no consumer changes" claim inaccurate for test code.
Resolution (2026-04-22): This is the intended architecture. localization-utils.mjs is a dispatcher only; tests that need locale-specific strings should import directly from the relevant locale file. Confirmed: none of the four test files import from localization-utils.mjs. The spec's "no consumer changes" claim was overly strict and does not reflect an API surface break — it reflects the correct separation of concerns.
---
[F-014] [FIXED 2026-04-22] Epic: Epic 42 — BGG Collection Import
File: documentation/planning/epic/ready-for-dev/epic-42.md, documentation/planning/epic/ready-for-dev/epic-42-task-list.md
Finding: Epic 42 is fully implemented and QC-approved but its spec file and task list remain in the `ready-for-dev/` folder instead of `done/`. All other completed epics keep their spec and task-list files in `done/`.
Suggested action: Move `documentation/planning/epic/ready-for-dev/epic-42.md` and `documentation/planning/epic/ready-for-dev/epic-42-task-list.md` to `documentation/planning/epic/done/`. This is a filesystem operation (`mv`) that falls outside the tech-writer's file-edit scope.
---
[F-015] [FIXED 2026-04-22] Epic: Epic 44 — Card Browser by Category or Expansion in Collection
File: documentation/planning/epic/ready-for-dev/epic-44.md, documentation/planning/epic/ready-for-dev/epic-44-task-list.md
Finding: Epic 44 is fully implemented and QC-approved but its spec file and task list remain in the `ready-for-dev/` folder instead of `done/`. All other completed epics keep their spec and task-list files in `done/`.
Suggested action: Move `documentation/planning/epic/ready-for-dev/epic-44.md` and `documentation/planning/epic/ready-for-dev/epic-44-task-list.md` to `documentation/planning/epic/done/`. This is a filesystem operation (`mv`) that falls outside the tech-writer's file-edit scope.
---
[F-016] [FIXED 2026-04-22] Epic: Clean Code Fix Pass — 17 April 2026
File: test/playwright/epic40-qc.spec.mjs (lines 38, 71, 92)
Finding: The clean-code audit (documentation/planning/clean-code-reports/clean-code-audit-2026-04-17.md, 🟡 issue 14) flagged three `test.skip` calls: two production-only environment guards and one unconditional `test.skip(true, …)`. The fix pass did not address this issue — it is not listed among the shipped changes. The unconditional skip permanently prevents the SW-control assertion from running in any environment.
Suggested action: Replace the unconditional `test.skip(true, …)` with `test.fixme` and add a tracking comment. For the two `!isProduction` guards, consider extracting them into a separate production-only spec file to make the skip intent explicit at the file level. This requires changes to test files outside `/documentation`.
---
[F-017] [FIXED 2026-04-22] Epic: Epic 51 — Game Catalog Data Audit & Correction
File: documentation/ux/reports/should-desktop-browse-entry-overload.md
Finding: The UX audit report cites a `Visible sets 33 of 33` counter as evidence of Browse-screen clutter. After Epic 51 added 5 expansions (Midnight Sons, The Infinity Saga, Weapon X, 2099, Ant-Man and the Wasp), the live counter will display `38 of 38` (or filtered equivalent). The report is a historical audit record documenting what was observed at review time; the `33 of 33` figure was accurate then and should not be retroactively changed. However, future UX reviewers reading the report may be confused by the stale count.
Suggested action: A UX team member should append a note to the report (e.g., "Note: Catalog has grown to 38 sets as of Epic 51; the `Visible sets` count will reflect the current total.") to prevent confusion without altering the historical evidence.
---
[F-018] [FIXED 2026-04-22] Epic: Epic 46 — Active Expansion Filter ("Play Set")
File: documentation/planning/epic/ready-for-dev/epic-46-task-list.md
Finding: A copy of `epic-46-task-list.md` exists in both `documentation/planning/epic/done/` and `documentation/planning/epic/ready-for-dev/`. The canonical completed copy should live only in `done/`. The `ready-for-dev/` copy is a stale duplicate.
Suggested action: Delete `documentation/planning/epic/ready-for-dev/epic-46-task-list.md`. File deletion falls outside the tech-writer's edit scope.
---
[F-019] [FIXED 2026-04-22] Epic: Epic 50 — PWA Installability Repair
File: documentation/planning/epic/ready-for-dev/epic-50-task-list.md (Story 50.1 task 12, Story 50.3)
Finding: Several tasks in the Epic 50 task list reference `documentation/planning/epic/approved/epic-50.md` as the target for the diagnosis note, but the file lives at `documentation/planning/epic/ready-for-dev/epic-50.md`. The `approved/` folder exists but is empty. The diagnosis and automated validation notes were correctly appended to the `ready-for-dev/` copy, so the content is accurate; only the path cited in the task list is stale.
Suggested action: No content change required — the notes are in the correct file. The path discrepancy in the task list is a historical planning artefact. Epic 50's spec and task list should be moved to `done/` once the manual Lighthouse validation tasks (Story 50.3) are completed.
---
[F-020] [FIXED 2026-04-22] Epic: Epic 61 — TypeScript Toolchain Foundation
File: documentation/planning/epic/ready-for-dev/epic-61-task-list.md (Story 5, task 3)
Finding: Story 5 of the task list has one unchecked verification task: "Start `npm run dev` and confirm the dev server starts without TypeScript-related errors in the terminal output." The Confirmation block in Story 5 is marked [x] and documents that `npm run build`, `npm run lint`, and `npx tsc --noEmit` all passed, but makes no mention of `npm run dev`. The implementation summary provided to the tech-writer also omits any reference to dev-server verification. It is therefore unclear whether this check was performed before the epic was closed.
Suggested action: A developer should start the dev server with `npm run dev` and confirm it starts cleanly with no TypeScript-related errors, then check this task box in `documentation/planning/epic/ready-for-dev/epic-61-task-list.md`. If the server does not start cleanly, any errors should be triaged as defects for Epic 62 or earlier.
---
[Resolution → F-012] [2026-05-01] Resolution note for Epic 68 finding above:
The lint errors in App.svelte, TabNav.svelte, ToastStack.svelte were fully resolved during the Epic 67/68 implementation session. `npm run lint` (ESLint + svelte-check) now exits 0 with 0 errors and 0 warnings. `npm test` passes 359/359. The [2026-04-22] finding above is superseded by this resolution.
---
[F-021] [FIXED 2026-05-01] Epic: Epic 70 — Preferred Expansion Priority
File: documentation/planning/epic/ready-for-dev/epic-70.md, documentation/planning/epic/ready-for-dev/epic-70-task-list.md
Finding: Epic 70 has been fully implemented (all story tasks marked [x] in the task list) but the epic spec and task-list files remain in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`. The tech-writer agent cannot move files (no delete tool available), so the relocation is logged here.
Suggested action: Move `epic-70.md` and `epic-70-task-list.md` from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to keep the lifecycle folders consistent with all prior epics.
Resolution (2026-05-03): Confirmed — `epic-70.md` and `epic-70-task-list.md` are present in `documentation/planning/epic/done/`. The `ready-for-dev/` folder is empty.
---
[F-022] [FIXED 2026-05-02] Epic: Epic 75 — Locale File Sync and Accessibility Defect Fixes
File: documentation/planning/epic/ready-for-dev/epic-75.md, documentation/planning/epic/ready-for-dev/epic-75-task-list.md
Finding: Epic 75 has been fully implemented (all story tasks marked [x] in the task list) but the epic spec and task-list files remain in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`. The tech-writer agent cannot move files (no delete tool available), so the relocation is logged here.
Suggested action: Move `epic-75.md` and `epic-75-task-list.md` from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to keep the lifecycle folders consistent with all prior completed epics.
Resolution (2026-05-03): Confirmed — `epic-75.md` and `epic-75-task-list.md` are present in `documentation/planning/epic/done/`. The `ready-for-dev/` folder is empty.
---
[F-023] [FIXED 2026-05-03] Epic: Epic 76 — Forced Picks Panel Cognitive Load Reduction
File: test/playwright/epic15-qc.spec.mjs
Finding: Story 4 moved the `[data-active-constraints]` block from inside the Forced Picks `<details>` accordion body to a persistent position above the Generate Setup button. The implementation summary states that selectors in `test/playwright/epic15-qc.spec.mjs` were updated accordingly. This file lives outside `/documentation` and cannot be verified or edited by the tech-writer agent.
Suggested action: Confirm that all `[data-active-constraints]` selectors in `test/playwright/epic15-qc.spec.mjs` now target the element in its new persistent position (outside the accordion, above the Generate Setup button) and that no selectors still assume the element is inside the `<details>` accordion body. Re-run the Playwright QC suite to verify no regressions.
Resolution (2026-05-03): Confirmed — the spec file was renamed from `epic15-qc.spec.mjs` to `test/playwright/forced-picks.spec.ts` during the Epic 79/81 rename pass. All four `[data-active-constraints]` selectors in the renamed file (lines 41, 50, 95, 105) directly target `[data-active-constraints]` without assuming the element is inside the accordion. The element is placed persistently in `NewGameTab.svelte` outside the `<details>` block (line 243), confirming the correct DOM position. No selector corrections were required.
---
[F-024] [FIXED 2026-05-02] Epic: Epic 76 — Forced Picks Panel Cognitive Load Reduction
File: documentation/planning/epic/ready-for-dev/epic-76.md
Finding: Epic 76 has been fully implemented but the epic spec file remains in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`. The tech-writer agent cannot move files (no delete tool available), so the relocation is logged here.
Suggested action: Move `epic-76.md` from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to keep the lifecycle folders consistent with all prior completed epics.
Resolution (2026-05-03): Confirmed — `epic-76.md` and `epic-76-task-list.md` are present in `documentation/planning/epic/done/`. The `ready-for-dev/` folder is empty.
---
[F-025] [2026-05-02] Epic: Epic 79 — Eliminate .mjs Files
File: test/epic10-documentation-release-readiness.test.ts
Finding: Epic 79 renamed 48 unit test files from `.test.mjs` → `.test.ts`. `documentation/testing/strategy.md` references `test/epic10-documentation-release-readiness.test.mjs` (now updated to `.test.ts`), but no file matching `test/epic10-documentation-release-readiness.test.ts` exists in the workspace. The file may have been deleted in a prior epic or omitted from the rename batch.
Suggested action: Confirm whether `test/epic10-documentation-release-readiness.test.ts` was intentionally deleted or if it was missed during the Epic 79 rename. If deleted, remove the reference from `documentation/testing/strategy.md` (Epic 10 section). If it should exist, restore or recreate it.
---
---
[F-026] [FIXED 2026-05-02] Epic: Epics 65, 66 — TypeScript migration
File: src/components/App.svelte (line 213), src/app/state-store.svelte.js (lines 4, 16, 39), src/app/state-store.svelte.ts (lines 4, 16, 39)
Finding: Stale references to `browser-entry.mjs` and `state-store.mjs` in comments/JSDoc.
Resolution: App.svelte line 213 comment updated from `browser-entry.mjs` → `browser-entry.ts`. state-store.svelte.js (the old JS wrapper, now dead code superseded by state-store.svelte.ts) had all `state-store.mjs` references updated to `state-store.ts`. state-store.svelte.ts was already correct.
---
[F-027] [FIXED 2026-05-02] Epic: Epic 79 — Eliminate .mjs Files
File: documentation/testing/strategy.md (Epic 10 section)
Finding: Stale `Automated verification: test/epic10-documentation-release-readiness.test.ts` reference to a deleted test file.
Resolution: Removed the stale reference from documentation/testing/strategy.md. The browser QC spec (test/playwright/epic10-qc.spec.ts) and the npm command still exist and are intact.
---
[F-028] [FIXED 2026-05-02] Code Review 2026-05-02 — F-05 through F-08
File: src/components/App.svelte, src/app/localization-utils.ts, src/app/theme-utils.ts, src/app/modal-utils.ts
Finding: F-05 in-place mutation in applyStateUpdate updaters; F-06 getLocaleFlag/getThemeIcon private to App.svelte; F-07 setTimeout magic number 50; F-08 computeModalConfig hidden reactive deps.
Resolution: F-05: All 7 applyStateUpdate updaters converted to immutable spread pattern. F-06: getLocaleFlag moved to localization-utils.ts and getThemeIcon moved to theme-utils.ts as named exports. F-07: TOAST_DISMISS_FOCUS_DELAY_MS = 50 constant added. F-08: computeModalConfig refactored to accept explicit ModalConfigParams object (locale, appState, confirmResetOwnedCollection, confirmResetAllState, confirmBackupRestoreMode, stagedBackup) — extracted to src/app/modal-utils.ts. Lint: 0 errors. All 179 Playwright + 440 Vitest pass.
---
[F-029] [FIXED 2026-05-02] Code Review 2026-05-02 — F-03
File: src/app/browse-vm.svelte.ts, src/app/new-game-vm.svelte.ts, src/app/history-vm.svelte.ts, src/app/backup-vm.svelte.ts, src/app/import-vm.svelte.ts, src/components/BrowseTab.svelte, src/components/HistoryTab.svelte, src/components/App.svelte
Finding: F-03 Module-level $state singletons with boilerplate getter/setter pairs.
Resolution: All 5 VM files replaced individual atom + getter/setter exports with single exported reactive $state objects: browseVm, newGameVm, historyVm, backupVm, importVm. Non-trivial setter functions (toggleHistoryInsights, resetResultDraftForPlayerCount, setResultPlayerScore, setResultPlayerName, etc.) kept as exported functions that mutate the state object. All 3 consumers updated (App.svelte, BrowseTab.svelte, HistoryTab.svelte). Lint: 0. All 179+440 pass.
---
[F-030] [FIXED 2026-05-02] Code Review 2026-05-02 — F-02
File: src/components/App.svelte (1,290 → 857 lines), src/app/app-init.ts (new), src/app/modal-utils.ts (new), src/app/collection-actions.ts (new), src/app/preferences-actions.ts (new), plus action factories added to all 5 VM files.
Finding: F-02 App.svelte God Component (~1,290 lines) owning all initialization, all actions, modal config, and the template.
Resolution: (1) src/app/app-init.ts extracts async initialization (loadSeed, createEpic1Bundle, createStorageAdapter, hydrateState) returning AppInitResult. (2) src/app/modal-utils.ts extracts pure computeModalConfig(ModalConfigParams). (3) Each VM file gained a create*Actions(deps) factory: createBrowseActions, createNewGameActions, createHistoryActions, createBackupActions, createImportActions. (4) src/app/collection-actions.ts and src/app/preferences-actions.ts created for collection/reset and theme/locale/onboarding actions. (5) App.svelte actions object replaced with spreads of 7 factory instances. App.svelte reduced to 857 lines. Three Vitest structural-assertion tests updated to reference new file locations. Lint: 0. All 179+440 pass.
---
[F-031] [FIXED 2026-05-02] E2E test failures (epic17, epic4)
File: test/playwright/epic17-qc.spec.ts, test/playwright/epic4-qc.spec.ts
Finding: 3 Playwright tests failing — epic17 (walkthrough on first launch + mobile progression) and epic4 (keyboard focus traversal).
Resolution: epic4 failure — A skip-link was added to the header in Epic 75 for accessibility. The Tab traversal test now correctly validates the skip-link as the first Tab target (with solid outline). epic17 failure — The "Replay walkthrough" button was inside a closed <details> element; both failing tests now click the <details> summary to open it before clicking [data-action="start-onboarding"]. All 3 previously-failing tests now pass.
---
[F-032] [FIXED 2026-05-03] Epic: Epic 82 — Co-locate Unit Tests with Their Source Modules
File: README.md (workspace root, line 85)
Finding: The "For developers and contributors" section says `Run story-level tests with \`npm run test:epic10\`.` The `test:epic10` script has never existed in `package.json` (confirmed by epic-37 docs). After Epic 82, all `test/epic*.test.ts` files have been deleted and replaced with co-located `src/**/*.test.ts` files; the correct command to run all Vitest unit tests is now `npm test` (mapped to `vitest run` with `include: ['src/**/*.test.ts']`).
Suggested action: Update the sentence in README.md (root) to replace `npm run test:epic10` with `npm test` (runs all 31 co-located Vitest unit tests). The adjacent `npm run test:qc:epic10` Playwright reference remains valid and does not need changing.
Resolution (2026-05-03): Confirmed — the README "For developers and contributors" section currently reads "Run the full unit test suite with `npm test`. Run browser QC with `npm run test:qc`." No `npm run test:epic10` reference exists. The correct wording was already present when this finding was filed; Epic 37 Story 37.3 had already removed the stale reference before Epic 82 ran.
---
[F-033] [FIXED 2026-05-03] Epic: Epic 82 — Co-locate Unit Tests with Their Source Modules
File: package.json (scripts section)
Finding: The `package.json` `scripts` block still contains per-epic Vitest commands (`test:epic1`, `test:epic2`, `test:epic3`, `test:epic4`, `test:epic5`, `test:epic6`, `test:epic7`, `test:epic8`, `test:epic9`, `test:epic12`, `test:epic13`, `test:epic14`, `test:epic18`, `test:epic19`, `test:epic20`) that point to `test/epic*.test.ts` paths. All of these files were deleted by Epic 82 (Stories 82.2 and 82.3). Running any of these scripts will now fail with a Vitest "No test files found" error.
Suggested action: Remove all `test:epicN` Vitest script entries from `package.json` that reference `test/epic*.test.ts` paths. The `test:qc:epicN` Playwright scripts (which target `test/playwright/*.spec.ts`) are unaffected by Epic 82 and should not be removed.
Resolution (2026-05-03): Confirmed — `package.json` contains no `test:epicN` Vitest script entries. All per-epic Vitest scripts were removed during Epic 37 / Epic 82 clean-up. The `test:qc:epicN` Playwright scripts remain intact and were not affected.
---
[F-034] [2026-05-03] Epic: Epics 83, 84, 85, 86, 87, 88
File: documentation/planning/epic/ready-for-dev/epic-83.md, epic-83-task-list.md, epic-84.md, epic-84-task-list.md, epic-85.md, epic-85-task-list.md, epic-86.md, epic-86-task-list.md, epic-87.md, epic-87-task-list.md, epic-88.md, epic-88-task-list.md
Finding: Epics 83–88 have all been fully implemented but their spec and task-list files remain in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`. The tech-writer agent cannot move files (no delete/move tool available), so the relocation is logged here.
Suggested action: Move all twelve files (epic-83 through epic-88, spec and task-list for each) from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to keep the lifecycle folders consistent with all prior completed epics.
---
[Resolution → F-034] [FIXED 2026-05-03] Epic: Epics 83, 84, 85, 86, 87, 88
File: documentation/planning/epic/ready-for-dev/epic-83.md through epic-88-task-list.md
Resolution: All twelve files (epic-83 through epic-88, spec and task-list for each) moved from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` via `mv` commands in the dispatcher session.
---
[F-035] [FIXED 2026-05-03] PWA/SW Playwright e2e failures — dev-server exclusion and production spec organisation
File: playwright.config.ts, playwright.prod.config.ts, test/playwright/pwa-installability.spec.ts, test/playwright/pwa-installability-production.spec.ts
Finding: Epic 88 renamed `epic40-production.spec.ts` to `pwa-installability-production.spec.ts` but did not update the `testIgnore` glob in `playwright.config.ts` or the `testMatch` glob in `playwright.prod.config.ts`. As a result the three production-only tests (icon content-type, offline cache, and SW registration) ran against the Vite dev server where they cannot pass. Additionally, the SW registration test lived in the dev-suite spec with no dev-mode guard.
Resolution: (1) `playwright.config.ts` `testIgnore` updated from `**/epic40-production.spec.ts` to `**/pwa-installability-production.spec.ts`. (2) `playwright.prod.config.ts` `testMatch` updated to match. (3) SW registration test removed from `pwa-installability.spec.ts` and added to `pwa-installability-production.spec.ts`. Dev e2e suite now shows 178 passed, 0 failed.

---
[F-036] [2026-05-04] Epic: Epic 95 — Test Coverage Improvement
File: documentation/planning/epic/ready-for-dev/epic-95.md
Finding: Epic 95 has been fully implemented (Stories 95.1–95.5 complete, 587 tests in 42 test files, 74.2% stmt / 75.1% branch) but the epic spec file remains in `documentation/planning/epic/ready-for-dev/` rather than `documentation/planning/epic/done/`. The tech-writer agent cannot move files (no delete/move tool available), so the relocation is logged here.
Suggested action: Move `epic-95.md` from `documentation/planning/epic/ready-for-dev/` to `documentation/planning/epic/done/` to keep the lifecycle folders consistent with all prior completed epics.
---

## Summary Table

| ID | Summary | Status | Found | Fixed |
|---|---|---|---|---|
| F-001 | Epic 81 spec files not moved to `done/` | FIXED | 2026-05-03 | 2026-05-03 |
| F-002 | Epic 82 spec files not moved to `done/` | FIXED | 2026-05-03 | 2026-05-03 |
| F-003 | Epics 29–33: README stale (missing epics, no-framework claim, entry-point descriptions) | FIXED | 2026-04-13 | 2026-04-14 |
| F-004 | Epic 43: "thin `{@html}` wrapper" description stale in `architecture/overview.md` | FIXED | 2026-04-16 | 2026-04-16 |
| F-005 | Epic 42: `mergeOwnedSets` wrongly attributed to `bgg-import-utils.mjs` in implementation summary | FIXED | 2026-04-16 | 2026-04-16 |
| F-006 | Epic 46: "Clear all" behavior described incorrectly in task list (OBSOLETE — historical artefact) | OBSOLETE | 2026-04-17 | — |
| F-007 | Epic 57: `[Standard v2]` play-mode button missing from `ui-design.md` Tab 3 diagram | FIXED | 2026-04-19 | 2026-04-19 |
| F-008 | Epic 64: Stale `setup-generator.mjs` reference in `defects-v2.0.0.md` (historical record, no action) | NO ACTION | 2026-04-21 | — |
| F-009 | Epic 65: Stale `state-store.mjs` refs in comments/JSDoc of `state-store.svelte.js` | FIXED | 2026-04-21 | 2026-05-02 |
| F-010 | Epic 65: Stale `browser-entry.mjs` comment in `App.svelte` | FIXED | 2026-04-21 | 2026-05-02 |
| F-011 | Epic 66: Unknown whether F-009 stale refs persisted after rename to `state-store.svelte.ts` | FIXED | 2026-04-21 | 2026-05-02 |
| F-012 | Epic 68: `no-unused-vars` lint errors in `App.svelte`, `TabNav.svelte`, `ToastStack.svelte` blocked lint gate | FIXED | 2026-04-22 | 2026-05-01 |
| F-013 | Epic 41: Spec "no consumer changes" claim inaccurate — four test files also modified | FIXED | 2026-04-22 | 2026-04-22 |
| F-014 | Epic 42: Spec files left in `ready-for-dev/` after QC approval | FIXED | 2026-04-22 | 2026-04-22 |
| F-015 | Epic 44: Spec files left in `ready-for-dev/` after QC approval | FIXED | 2026-04-22 | 2026-04-22 |
| F-016 | Clean Code: Unconditional `test.skip(true, …)` permanently skipping SW-control assertion | FIXED | 2026-04-22 | 2026-04-22 |
| F-017 | Epic 51: Stale "33 of 33" expansion count in UX audit report | FIXED | 2026-04-22 | 2026-04-22 |
| F-018 | Epic 46: Duplicate `epic-46-task-list.md` stale copy in `ready-for-dev/` | FIXED | 2026-04-22 | 2026-04-22 |
| F-019 | Epic 50: Wrong path (`approved/epic-50.md`) cited in task list — file lives in `ready-for-dev/` | FIXED | 2026-04-22 | 2026-04-22 |
| F-020 | Epic 61: `npm run dev` verification task left unchecked in task list | FIXED | 2026-04-22 | 2026-04-22 |
| F-021 | Epic 70 spec files not moved to `done/` | FIXED | 2026-05-01 | 2026-05-03 |
| F-022 | Epic 75 spec files not moved to `done/` | FIXED | 2026-05-02 | 2026-05-03 |
| F-023 | Epic 76: `[data-active-constraints]` selectors in `epic15-qc.spec.mjs` may target wrong DOM position | FIXED | 2026-05-02 | 2026-05-03 |
| F-024 | Epic 76 spec file not moved to `done/` | FIXED | 2026-05-02 | 2026-05-03 |
| F-025 | Epic 79: `test/epic10-documentation-release-readiness.test.ts` missing — deleted or rename gap | FIXED | 2026-05-02 | 2026-05-02 |
| F-026 | Epics 65/66: Stale `.mjs` references in comments/JSDoc across `App.svelte` and `state-store` files | FIXED | 2026-04-21 | 2026-05-02 |
| F-027 | Epic 79: Stale deleted-test reference in `documentation/testing/strategy.md` | FIXED | 2026-05-02 | 2026-05-02 |
| F-028 | Code Review F-05–F-08: In-place mutation, private helpers, magic number, hidden reactive deps | FIXED | 2026-05-02 | 2026-05-02 |
| F-029 | Code Review F-03: Module-level `$state` singletons with boilerplate getter/setter pairs | FIXED | 2026-05-02 | 2026-05-02 |
| F-030 | Code Review F-02: `App.svelte` God Component (~1,290 lines) owning all logic | FIXED | 2026-05-02 | 2026-05-02 |
| F-031 | E2E failures: epic17 walkthrough tests and epic4 keyboard-focus traversal test | FIXED | 2026-05-02 | 2026-05-02 |
| F-032 | Epic 82: README references non-existent `npm run test:epic10` command | FIXED | 2026-05-03 | 2026-05-03 |
| F-033 | Epic 82: `package.json` contains stale `test:epicN` Vitest scripts pointing to deleted files | FIXED | 2026-05-03 | 2026-05-03 |
| F-034 | Epics 83–88 spec files not moved to `done/` | FIXED | 2026-05-03 | 2026-05-03 |
| F-035 | PWA/SW: Production spec excluded from wrong runner; SW test in wrong spec file | FIXED | 2026-05-03 | 2026-05-03 |
| F-036 | Epic 95 spec file not moved to `done/` after full implementation | OPEN | 2026-05-04 | — |
