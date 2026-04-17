# Epic 53 Task List — Solo Mode Scheme Eligibility Constraints

## Story 1 — Model scheme–mode incompatibility in the data layer and randomizer

- [x] **Task 1 — Add `incompatiblePlayModes` to the three target scheme entries in `src/data/canonical-game-data.json`:**
  In each of the three scheme objects listed below, add `"incompatiblePlayModes": ["standard-solo"]` inside the existing `"constraints"` object (alongside the existing `"minimumPlayerCount"` field):
  - `"name": "Super Hero Civil War"` with `"setName": "Core Set"` (around line 5692) — runtime id: `core-set-super-hero-civil-war`
  - `"name": "Super Hero Civil War"` with `"setName": "Marvel Studios, Phase 1"` (around line 5679) — runtime id: `marvel-studios-phase-1-super-hero-civil-war`
  - `"name": "Negative Zone Prison Breakout"` with `"setName": "Core Set"` (around line 5180) — runtime id: `core-set-negative-zone-prison-breakout`

  After this task the `constraints` object for "Negative Zone Prison Breakout" should read:
  ```json
  "constraints": {
    "minimumPlayerCount": null,
    "incompatiblePlayModes": ["standard-solo"]
  }
  ```
  And for both "Super Hero Civil War" entries:
  ```json
  "constraints": {
    "minimumPlayerCount": 2,
    "incompatiblePlayModes": ["standard-solo"]
  }
  ```
  No other changes to `src/data/canonical-game-data.json` are needed. The data pipeline in `src/app/game-data-pipeline.mjs` passes `constraints: item.constraints || { minimumPlayerCount: null }` through as-is, so `incompatiblePlayModes` will flow into runtime scheme objects automatically without any pipeline change.

- [x] **Task 2 — Rename and extend `isSchemeEligibleForPlayerCount` in `src/app/setup-generator.mjs`:**
  The function currently lives at line 252:
  ```js
  function isSchemeEligibleForPlayerCount(scheme, playerCount) {
    return !scheme.constraints?.minimumPlayerCount || scheme.constraints.minimumPlayerCount <= playerCount;
  }
  ```
  Rename it to `isSchemeEligibleForTemplate(scheme, template)` and extend it to also reject schemes whose `constraints.incompatiblePlayModes` contains the effective solo-mode key. The effective key for "standard solo" is `'standard-solo'`, derived when `template.playMode === 'standard' && template.playerCount === 1`. The updated function should be:
  ```js
  function isSchemeEligibleForTemplate(scheme, template) {
    if (scheme.constraints?.minimumPlayerCount && scheme.constraints.minimumPlayerCount > template.playerCount) {
      return false;
    }
    const effectiveModeKey = template.playMode === 'standard' && template.playerCount === 1
      ? 'standard-solo'
      : template.playMode;
    if (scheme.constraints?.incompatiblePlayModes?.includes(effectiveModeKey)) {
      return false;
    }
    return true;
  }
  ```
  This design is extensible: any future scheme can declare additional entries in `incompatiblePlayModes`, and any future play-mode key mapping can be added to the derivation logic without touching the caller.

- [x] **Task 3 — Update the call site in `validateSetupLegality` in `src/app/setup-generator.mjs`:**
  At line 297, the current call is:
  ```js
  const eligibleSchemes = pools.schemes.filter((scheme) => isSchemeEligibleForPlayerCount(scheme, template.playerCount));
  ```
  Replace it with:
  ```js
  const eligibleSchemes = pools.schemes.filter((scheme) => isSchemeEligibleForTemplate(scheme, template));
  ```
  This is the only call site of `isSchemeEligibleForPlayerCount` in `setup-generator.mjs`. Once renamed the old function name must not exist in the file.

- [x] **Task 4 — Update the forced-pick validation error message in `src/app/setup-generator.mjs`:**
  In `validateForcedPickAvailability` (starting at line 165), locate the message:
  ```js
  reasons.push(`Forced Scheme is not legal for the selected player count: ${schemesById[forcedPicks.schemeId]?.name || forcedPicks.schemeId}.`);
  ```
  Change it to:
  ```js
  reasons.push(`Forced Scheme is not legal for the selected play mode: ${schemesById[forcedPicks.schemeId]?.name || forcedPicks.schemeId}.`);
  ```
  This ensures the error message is accurate for both player-count constraints and play-mode constraints, since `eligibleSchemes` now captures both kinds of ineligibility.

- [x] **Task 5 — Create `test/epic53-solo-scheme-eligibility.test.mjs` with unit tests for the randomizer logic:**
  Model the file after `test/epic15-forced-picks.test.mjs`. Use `createEpic1Bundle` from `src/app/game-data-pipeline.mjs` and `createDefaultState` + `validateSetupLegality` + `generateSetup` from `src/app/setup-generator.mjs` and `src/app/state-store.mjs`. Assert all of the following:
  - `validateSetupLegality({ playerCount: 1, playMode: 'standard', ... })` returns `eligibleSchemes` that does **not** contain any scheme with id `core-set-super-hero-civil-war`, `marvel-studios-phase-1-super-hero-civil-war`, or `core-set-negative-zone-prison-breakout`.
  - `validateSetupLegality({ playerCount: 1, playMode: 'advanced-solo', ... })` returns `eligibleSchemes` that **does** contain `core-set-negative-zone-prison-breakout` (it is only incompatible with standard solo, not advanced-solo).
  - `validateSetupLegality({ playerCount: 1, playMode: 'two-handed-solo', ... })` returns `eligibleSchemes` that **does** contain `core-set-negative-zone-prison-breakout`.
  - `validateSetupLegality({ playerCount: 2, playMode: 'standard', ... })` returns `eligibleSchemes` that **does** contain `core-set-negative-zone-prison-breakout` (multi-player standard mode is unaffected).
  - Over 50 calls to `generateSetup({ playerCount: 1, playMode: 'standard', ... })` with a fixed seed or `Math.random`, none of the returned setups has `scheme.id` equal to `core-set-super-hero-civil-war`, `marvel-studios-phase-1-super-hero-civil-war`, or `core-set-negative-zone-prison-breakout`.
  - `validateSetupLegality({ playerCount: 1, playMode: 'standard', forcedPicks: { schemeId: 'core-set-negative-zone-prison-breakout', ... }, ... })` returns `ok: false` and `reasons` contains a string matching `"not legal for the selected play mode"`.
  - `validateSetupLegality({ playerCount: 1, playMode: 'advanced-solo', forcedPicks: { schemeId: 'core-set-negative-zone-prison-breakout', ... }, ... })` returns `ok: true` (forcing the scheme in a compatible mode must succeed).

- [x] **Test (Story 1):** Run `npm run lint` and `npm test` and confirm all pass.

---

## Story 2 — Enforce the constraint in the forced-selection UI for standard solo mode

- [x] **Task 1 — Add a `modeIneligibleSchemeIds` derived value in `src/components/NewGameTab.svelte`:**
  In the `<script>` block, after the existing `ownedForcedPickOptions` derived value, add:
  ```js
  let modeIneligibleSchemeIds = $derived.by(() => {
    if (selectedPlayMode !== 'standard' || selectedPlayerCount !== 1) return new Set();
    return new Set(
      ownedForcedPickOptions.schemeId
        .filter((s) => s.constraints?.incompatiblePlayModes?.includes('standard-solo'))
        .map((s) => s.id)
    );
  });
  ```
  This is reactive: it recomputes whenever `selectedPlayMode` or `selectedPlayerCount` changes, producing an empty set for any mode other than standard solo, and a set of the two ineligible scheme IDs when standard solo is active.

- [x] **Task 2 — Filter ineligible schemes from the scheme `<select>` in `getAvailableOptions` in `src/components/NewGameTab.svelte`:**
  The current `getAvailableOptions` function is:
  ```js
  function getAvailableOptions(config) {
    const opts = ownedForcedPickOptions[config.field];
    return config.multi ? opts.filter((e) => !getActiveIds(config).includes(e.id)) : opts;
  }
  ```
  Update it to exclude mode-ineligible schemes when the field is `schemeId`:
  ```js
  function getAvailableOptions(config) {
    let opts = ownedForcedPickOptions[config.field];
    if (config.field === 'schemeId') {
      opts = opts.filter((e) => !modeIneligibleSchemeIds.has(e.id));
    }
    return config.multi ? opts.filter((e) => !getActiveIds(config).includes(e.id)) : opts;
  }
  ```
  After this change, "Super Hero Civil War" (both editions) and "Negative Zone Prison Breakout" will not appear in the scheme `<select>` dropdown when standard solo is active. Switching to any other play mode or player count will restore their presence because `modeIneligibleSchemeIds` becomes an empty set.

- [x] **Task 3 — Add an explanatory inline notice in the forced picks panel when schemes are excluded by mode in `src/components/NewGameTab.svelte`:**
  Inside the forced picks `<section class="result-card" data-forced-picks-panel>`, after the `{#each FORCED_PICK_FIELD_CONFIGS as config}` block that renders the per-field selects, add a conditionally-rendered notice block:
  ```svelte
  {#if modeIneligibleSchemeIds.size > 0}
    <p class="muted" data-scheme-mode-ineligibility-notice>
      {locale.t('newGame.forcedPicks.schemesModeIneligible', {
        count: modeIneligibleSchemeIds.size,
        mode: locale.getPlayModeLabel(selectedPlayMode, selectedPlayerCount)
      })}
    </p>
  {/if}
  ```
  The `data-scheme-mode-ineligibility-notice` attribute is the Playwright-stable selector used in Story 2 QC. The notice is invisible when `modeIneligibleSchemeIds.size === 0` (all modes except standard solo, or player count > 1).

- [x] **Task 4 — Add the `newGame.forcedPicks.schemesModeIneligible` localization key to all six locale files:**
  In `src/app/locales/en.mjs`, inside the `newGame.forcedPicks` key group, add:
  ```js
  schemesModeIneligible: '{count} scheme(s) are unavailable in {mode} mode and have been removed from the selection list.'
  ```
  Then add the same key (translated) to `src/app/locales/fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, and `es.mjs`. Preserve the `{count}` and `{mode}` ICU-style placeholders verbatim in every locale file.

- [x] **Task 5 — Create `test/playwright/epic53-qc.spec.mjs` with Playwright QC checks for the forced-selection UI:**
  Model the file after `test/playwright/epic15-qc.spec.mjs`. Use the `gotoApp`, `seedAllOwnedState`, `selectTab`, and `getRuntimeSnapshot` helpers from `./helpers/app-fixture.mjs`. Assert all of the following:
  - After seeding all-owned state and navigating to the New Game tab with `playerCount = 1` and `playMode = 'standard'` (the defaults), open the Forced Picks panel (`[data-forced-picks-panel]` inside its `<details>`).
  - The scheme `<select data-forced-pick-select="schemeId">` must contain **no** `<option>` whose value is `core-set-super-hero-civil-war`, `marvel-studios-phase-1-super-hero-civil-war`, or `core-set-negative-zone-prison-breakout`.
  - The element `[data-scheme-mode-ineligibility-notice]` must be visible and have non-empty text content.
  - Click the "Advanced Solo" play mode button (`[data-action="set-play-mode"][data-play-mode="advanced-solo"]`). The scheme `<select>` must now contain an `<option>` with value `core-set-negative-zone-prison-breakout`.
  - The element `[data-scheme-mode-ineligibility-notice]` must no longer be visible (or must not exist in the DOM).
  - Click back to "Standard Solo" (`[data-play-mode="standard"]`). Confirm `core-set-negative-zone-prison-breakout` disappears from the scheme `<select>` again and the notice reappears.

- [x] **Test (Story 2):** Run `npm run lint` and confirm it passes.
- [x] **QC (Automated — Story 2):** Run `test/playwright/epic53-qc.spec.mjs` and verify: in the forced-selection panel the two ineligible schemes are absent from the scheme `<select>` when standard solo is active; the `[data-scheme-mode-ineligibility-notice]` element is visible; switching to Advanced Solo or Two-Handed Solo restores "Negative Zone Prison Breakout" in the scheme `<select>` and removes the notice; switching back to Standard Solo re-applies the constraint.
