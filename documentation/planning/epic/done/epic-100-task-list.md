# Epic 100 — Hank Pym, Yellowjacket Forced Lead Data Bug Fix Task List

## Story 1: Investigate and verify

- [x] Locate the "Hank Pym, Yellowjacket" entry in `src/data/canonical-game-data.json` (line 3180) and confirm it currently carries `"leadName": "Black Order Guards"` and `"leadCategory": "villains"`.
- [x] Cross-reference the "Marvel Studios' What If...?" expansion rulebook or an authoritative secondary source (e.g., the official card text) to confirm that Hank Pym, Yellowjacket has **no** forced villain group lead.
- [x] Verify that the bug is reproducible: generate a setup with Hank Pym, Yellowjacket selected as mastermind and observe that "Black Order Guards" always appears as a forced villain group in the output.
- [x] Confirm that removing `leadName`/`leadCategory` from the JSON entry is the correct fix, consistent with how other no-forced-lead masterminds are stored (i.e., the `lead` field is absent from their `MastermindRuntime` representation, causing `resolveLeadEntity` in `src/app/setup-generator.ts` lines 172–182 to return `null`).
- [x] Document investigation outcome as a comment in the pull request or story notes; no source files are changed in this story.

## Story 2: Data correction

- [x] In `src/data/canonical-game-data.json` at line 3180, delete the `"leadName": "Black Order Guards"` field from the "Hank Pym, Yellowjacket" mastermind entry.
- [x] In the same entry, delete the `"leadCategory": "villains"` field so the entry is left as:
  ```json
  {
    "name": "Hank Pym, Yellowjacket",
    "setName": "Marvel Studios' What If...?",
    "aliases": [],
    "notes": ["Epic Mastermind."]
  }
  ```
- [x] Verify no other mastermind entry in `src/data/canonical-game-data.json` references "Black Order Guards" as a lead in a way that should also be corrected (i.e., confirm "Black Order Guards" remains a valid villain group entry for normal selection).
- [x] **Test (manual):** Generate a setup with Hank Pym, Yellowjacket targeted and confirm "Black Order Guards" no longer appears as a forced villain group in the generated setup output.
- [x] **QC (Automated):** Run lint, then run the full unit-test suite (`vitest`). Confirm no existing tests in `src/app/setup-generator.test.ts` or `src/app/setup-validator.test.ts` break as a result of the data change.

## Story 3: Regression test

- [x] In `src/app/setup-generator.test.ts`, add a new test case inside the `'Mastermind leads consume the correct villain or henchman slot'` test block (after line 122), or as a separate `test(...)` immediately following it, using `makeTargetedState` with `mastermindName: 'Hank Pym, Yellowjacket'` as the model (same pattern as the Red Skull / Dr. Doom assertions on lines 103–122).
- [x] The test should assert:
  1. `setup.mastermind.name === 'Hank Pym, Yellowjacket'`
  2. `setup.villainGroups` contains **no** entry with `forced === true` that has `name === 'Black Order Guards'` — i.e., the group is not force-included.
  3. `setup.villainGroups.length === setup.requirements.villainGroupCount` (no extra slot consumed by a forced lead).
- [x] Confirm the new test passes with the corrected data and would fail if `"leadName": "Black Order Guards"` were reintroduced to the JSON entry.
- [x] **QC (Automated):** Run lint, then run `vitest` scoped to `src/app/setup-generator.test.ts` and confirm the new test passes. Then run the full unit-test suite to confirm no regressions.
