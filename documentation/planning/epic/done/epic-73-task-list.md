# Epic 73 — Solo Mode "Always Leads" Rule Suppression

## Important Codebase Note: Standard Solo Representation

`'standard-solo'` is **not** a member of the `PlayMode` union (`src/app/types.ts` line 140 defines `PlayMode = 'standard' | 'advanced-solo' | 'two-handed-solo' | 'standard-solo-v2'`). Standard solo is encoded as `playMode === 'standard'` combined with `playerCount === 1`. An `effectiveModeKey` helper pattern already exists in the codebase (`src/app/setup-generator.ts` line 476). The four fully-solo scenarios are therefore:

| Scenario | playMode value | playerCount |
|---|---|---|
| Standard Solo v1 | `'standard'` | 1 |
| Advanced Solo | `'advanced-solo'` | any |
| Two-Handed Solo | `'two-handed-solo'` | any |
| Standard Solo v2 | `'standard-solo-v2'` | any |

---

## Story 1 — Suppress the "Always Leads" villain group assignment in the generator

- [x] **Add helper `isSoloMode(template)`** (`src/app/setup-generator.ts`, near line 427) — extract an exported or module-scoped function `isSoloMode(template: SetupTemplate): boolean` that returns true when `SOLO_PLAY_MODES.has(template.playMode)` **or** `(template.playMode === 'standard' && template.playerCount === 1)`. The existing `SOLO_PLAY_MODES` set at line 427 (`new Set(['advanced-solo', 'two-handed-solo', 'standard-solo-v2'])`) may be retained as the base; the helper wraps it with the standard-solo edge case.

- [x] **Update `resolveForcedCollections`** (`src/app/setup-generator.ts`, line ~454) — change the guard:
  ```
  // Before:
  if (mastermind.lead && !SOLO_PLAY_MODES.has(template.playMode)) {
  // After:
  if (mastermind.lead && !isSoloMode(template)) {
  ```
  This ensures the `alwaysLeads` villain/henchman group is not pushed to the forced-collections map for any solo play mode.

- [x] **Update `validateForcedPickAvailability` slot counting** (`src/app/setup-generator.ts`, lines ~403–420) — the mastermind lead is currently counted toward villain/henchman group slot limits unconditionally. Since the lead is no longer forced in solo mode, update both the `mastermindLeadVillainGroupCount` and `mastermindLeadHenchmanGroupCount` calculations to evaluate to `0` when `isSoloMode(template)` is true. Without this change `generateSetup` will throw a spurious legality error when a user forces a villain group alongside a lead-bearing mastermind in standard solo.

- [x] **Update `tryMastermindForScheme` for `leadEntity`** (`src/app/setup-generator.ts`, line ~894) — `resolveLeadEntity(mastermind, runtime)` is called unconditionally and returns a non-null entity whenever `mastermind.lead` is set, regardless of play mode. This means Story 2 is **not automatically satisfied by Story 1**; a separate change is required here (see Story 2).

- [x] **Update test: `test/epic3-setup-generator.test.mjs` lines 127–139** — The test `'Mastermind leads consume the correct villain or henchman slot'` calls `generateSetup` with `playerCount: 1, advancedSolo: false` (= standard solo). After Story 1 the mastermind lead is suppressed in solo mode, so `redSkullSetup.villainGroups.some((group) => group.name === 'HYDRA' && group.forced)` will be false and the test will fail. **Change `playerCount` to `2`** (or supply an explicit non-solo `playMode`) in both the Red Skull and Dr. Doom sub-tests to keep them testing the non-solo forced-slot behaviour.

- [x] **Update test: `test/epic53-solo-scheme-eligibility.test.mjs` lines 148–170 and 209–231** — Two tests assert `legality.ok === false` when a solo user forces a villain/henchman group alongside a lead-bearing mastermind (mastermind lead counted as a second slot). After the slot-counting fix the lead is no longer counted in solo mode, so one forced group fits within one slot → `ok` becomes `true`. Update both assertions from `assert.equal(legality.ok, false)` to `assert.equal(legality.ok, true)` and remove or rephrase the associated `legality.reasons` assertion.

- [x] **Test — Write `test/epic73-solo-always-leads.test.mjs` Story 1 cases:**
  - Standard solo (`playMode: 'standard'`, `playerCount: 1`) with a lead-bearing mastermind → `villainGroups` (or `henchmanGroups`) does **not** contain the lead entity as a `forced` entry; the lead entity appears in the respective group array via random selection.
  - `advanced-solo`, `two-handed-solo`, and `standard-solo-v2` modes with the same mastermind → same assertion.
  - `standard` mode with `playerCount: 2` → the lead entity **is** present as a forced entry (non-solo regression).

- [x] **QC (Automated)** — Run `npm run lint` then `npm test -- --testPathPattern="epic73|epic3-setup-generator|epic53-solo-scheme-eligibility"` to verify generator suppression and confirm no regressions.

---

## Story 2 — Remove the "Always Leads" label from the result view in solo mode

> **Story 2 is NOT automatically satisfied by Story 1.**
>
> `resolveLeadEntity` (`src/app/setup-generator.ts` line ~860–874) is called at line ~894 in `tryMastermindForScheme` without checking play mode. It returns the resolved villain/henchman entity whenever `mastermind.lead` is non-null, independent of the generator's forced-collection suppression. Therefore `currentSetup.mastermind.leadEntity` is still non-null in solo mode after Story 1, and the result view still shows "Always leads: [name]". A separate code change is required.

- [x] **Suppress `leadEntity` in solo mode** (`src/app/setup-generator.ts`, line ~894) — change the `leadEntity` assignment in `tryMastermindForScheme` to return `null` when `isSoloMode(template)` is true (reuse the helper from Story 1):
  ```
  // Before:
  const leadEntity = resolveLeadEntity(mastermind, runtime);
  // After:
  const leadEntity = isSoloMode(template) ? null : resolveLeadEntity(mastermind, runtime);
  ```

- [x] **No change needed to `src/components/NewGameTab.svelte`** — The result view at line ~457 already branches on `currentSetup.mastermind.leadEntity`. Once `leadEntity` is null in solo mode, the view will automatically render `locale.t('common.noMandatoryLead')` and the `★ Mandatory Lead` pill (line ~459) will be hidden. No further Svelte edits are required.

- [x] **Test — Add Story 2 cases to `test/epic73-solo-always-leads.test.mjs`:**
  - For each solo mode with a lead-bearing mastermind: `generatedSetup.mastermind.leadEntity === null`.
  - Non-solo mode with the same mastermind: `generatedSetup.mastermind.leadEntity` is non-null and equals the expected entity.

- [x] **QC (Automated)** — Run `npm run lint` then `npm test -- --testPathPattern="epic73"` to validate leadEntity suppression.

---

## Story 3 — Remove per-mode "Always Leads" locale keys

### Source definitions

- [x] **`src/app/solo-rules.ts` line ~16** — Remove `'newGame.soloRules.standard.alwaysLeads'` from the `'standard'` case array. Array shrinks from 4 → 3 items.

- [x] **`src/app/solo-rules.ts` line ~24** — Remove `'newGame.soloRules.advancedSolo.alwaysLeads'` from the `'advanced-solo'` case array. Array shrinks from 5 → 4 items.

- [x] **`src/app/solo-rules.ts` line ~33** — Remove `'newGame.soloRules.standardV2.alwaysLeads'` from the `'standard-solo-v2'` case array. Array shrinks from 6 → 5 items.

### Locale files — remove the three keys from all 12 files

- [x] **`src/app/locales/en.ts`** — Remove lines for `newGame.soloRules.standard.alwaysLeads` (~line 454), `newGame.soloRules.advancedSolo.alwaysLeads` (~line 459), and `newGame.soloRules.standardV2.alwaysLeads` (~line 465).

- [x] **`src/app/locales/en.mjs`** — Same three keys, same line numbers.

- [x] **`src/app/locales/fr.ts`** — Remove the same three keys.

- [x] **`src/app/locales/fr.mjs`** — Remove the same three keys.

- [x] **`src/app/locales/de.ts`** — Remove the same three keys.

- [x] **`src/app/locales/de.mjs`** — Remove the same three keys.

- [x] **`src/app/locales/es.ts`** — Remove the same three keys.

- [x] **`src/app/locales/es.mjs`** — Remove the same three keys.

- [x] **`src/app/locales/ja.ts`** — Remove the same three keys.

- [x] **`src/app/locales/ja.mjs`** — Remove the same three keys.

- [x] **`src/app/locales/ko.ts`** — Remove the same three keys.

- [x] **`src/app/locales/ko.mjs`** — Remove the same three keys.

### Test updates — `test/epic57-solo-rules-panel.test.mjs`

This file has six assertions that will fail after the keys are removed:

- [x] **Line 66** — Remove `assert.equal(items[3], 'newGame.soloRules.standard.alwaysLeads')`. The `standard` array now ends at index 2 (`eachOtherPlayer`).

- [x] **Line 76** — Remove `assert.equal(items[4], 'newGame.soloRules.advancedSolo.alwaysLeads')`. The `advanced-solo` array now ends at index 3 (`eachOtherPlayer`).

- [x] **Line 87** — Remove `assert.equal(items[5], 'newGame.soloRules.standardV2.alwaysLeads')`. The `standard-solo-v2` array now ends at index 4 (`mastermindAbility`).

- [x] **Lines ~110–113** (`computeSoloRulesItems` length assertions) — Update:
  - `result.length, 4` → `result.length, 3` for the standard case.
  - `result.length, 5` → `result.length, 4` for the advanced-solo case.
  - `result.length, 6` → `result.length, 5` for the standard-v2 case.

- [x] **Lines ~168–210** (`EN_MESSAGES contains all 17 solo rules locale keys`) — Remove the three `alwaysLeads` keys from the `expectedKeys` array and update the test description from `'17 solo rules locale keys'` to `'14 solo rules locale keys'`.

- [x] **Test — Add Story 3 assertion to `test/epic73-solo-always-leads.test.mjs`:**
  - `getSoloRulesItems('standard')` does not include `'newGame.soloRules.standard.alwaysLeads'`.
  - `getSoloRulesItems('advanced-solo')` does not include `'newGame.soloRules.advancedSolo.alwaysLeads'`.
  - `getSoloRulesItems('standard-solo-v2')` does not include `'newGame.soloRules.standardV2.alwaysLeads'`.

- [x] **QC (Automated)** — Run `npm run lint` then `npm test -- --testPathPattern="epic73|epic57-solo-rules-panel"` to confirm key removal and no missing-key warnings.

---

## Cross-story QC checkpoint

After all three stories are implemented, the `Epic QC Agent` should run:
1. `npm run lint` — must pass before any test execution.
2. `npm test` (full suite) — confirms no regressions in `epic3-setup-generator`, `epic53-solo-scheme-eligibility`, `epic57-solo-rules-panel`, and the new `epic73-solo-always-leads` tests.
3. Full `npx playwright test` — only if the above passes, to validate the result-view story-2 behaviour end-to-end.

This epic qualifies for inclusion in the end-of-sprint full regression run.
