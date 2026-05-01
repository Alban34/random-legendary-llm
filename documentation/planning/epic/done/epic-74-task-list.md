# Epic 74 — Forced Hero Team: Task List

## Story 1 — Derive and expose the sorted list of active hero team names from the owned collection

- [x] In `src/components/NewGameTab.svelte`: add a new `$derived` reactive variable `activeHeroTeamNames: string[]` that reads from `buildOwnedPools(bundle.runtime, effectiveSetIds)` (using `activeSetIds` if set, else `ownedSetIds`, matching the same logic used by `filterFeasibility`), collects every non-empty entry from each hero's `teams` array across `pools.heroes`, deduplicates, and sorts the result alphabetically using `localeCompare`.
- [x] Ensure the derived value recomputes reactively whenever `appState.collection.activeSetIds` or `appState.collection.ownedSetIds` changes (it will do so automatically because it derives from `appState`).
- [x] Test: verify that `activeHeroTeamNames` contains only team names present on at least one hero in the active pool, is sorted, deduplicated, and contains no empty strings.
- [x] QC (Automated): run story-1 targeted tests in `test/epic74-forced-hero-team.test.mjs`

## Story 2 — Add a forced team selector to the forced-picks panel

- [x] In `src/app/locales/en.mjs`: add the following keys after the last `newGame.forcedPicks.preferredExpansion.*` key:
  - `'newGame.forcedPicks.forcedTeam.label'`: `'Forced team'`
  - `'newGame.forcedPicks.forcedTeam.placeholder'`: `'None (all teams eligible)'`
  - `'newGame.forcedPicks.forcedTeam.active'`: `'Forced team: {name}'`
  - `'newGame.forcedPicks.forcedTeam.clear'`: `'Clear forced team'`
  - `'newGame.forcedPicks.forcedTeam.unavailable'`: `'No heroes in the active collection have a team affiliation'`
- [x] In `src/app/locales/fr.mjs`: add translated values for all five `newGame.forcedPicks.forcedTeam.*` keys (French translator agent).
- [x] In `src/app/locales/de.mjs`: add translated values for all five `newGame.forcedPicks.forcedTeam.*` keys (German translator agent).
- [x] In `src/app/locales/ja.mjs`: add translated values for all five `newGame.forcedPicks.forcedTeam.*` keys (Japanese translator agent).
- [x] In `src/app/locales/ko.mjs`: add translated values for all five `newGame.forcedPicks.forcedTeam.*` keys (Korean translator agent).
- [x] In `src/app/locales/es.mjs`: add translated values for all five `newGame.forcedPicks.forcedTeam.*` keys (Spanish translator agent).
- [x] In `src/components/App.svelte`: add `setForcedTeam: (team: string | null) => void` to the `actions` object (alongside `setPreferredExpansion`). The implementation should call `setForcedPicks({ ...getForcedPicks(), forcedTeam: team })` and then call `clearGeneratedSetup()`.
- [x] In `src/components/App.svelte`: expose `setForcedTeam` in the `gameActions` object passed to `NewGameTab`.
- [x] In `src/components/App.svelte`: add `setForcedTeam: (team: string | null) => void` to the `gameActions` type annotation near line 519.
- [x] In `src/components/NewGameTab.svelte`: add `setForcedTeam: (team: string | null) => void` to the `gameActions` prop type (alongside `setPreferredExpansion`).
- [x] In `src/components/NewGameTab.svelte`: inside the forced-picks panel `<section>`, after the `preferredExpansion` block and before the `modeIneligibleSchemeIds` notice, add a "Forced team" control block:
  - When `activeHeroTeamNames.length > 0`: render a `<div class="stack gap-sm" data-forced-team-section>` containing a `<label>` for `'forced-team-select'`, a `<select id="forced-team-select" data-forced-team-select>` whose `value` is `forcedPicks.forcedTeam ?? ''`, with an empty placeholder option (`locale.t('newGame.forcedPicks.forcedTeam.placeholder')`) and one `<option>` per team name; `onchange` calls `gameActions.setForcedTeam(e.target.value || null)`; when `forcedPicks.forcedTeam` is non-null, show an active row with `data-forced-team-active` displaying `locale.t('newGame.forcedPicks.forcedTeam.active', { name: forcedPicks.forcedTeam })` and a clear button calling `gameActions.setForcedTeam(null)`.
  - When `activeHeroTeamNames.length === 0`: render `<p class="muted" data-forced-team-unavailable>{locale.t('newGame.forcedPicks.forcedTeam.unavailable')}</p>`.
- [x] Test: verify dropdown renders with team options when heroes have teams; verify selecting a team writes `forcedPicks.forcedTeam`; verify clear button resets to `null`; verify unavailable notice appears when no heroes have team affiliations; verify `npm run lint` passes.
- [x] QC (Automated): run story-2 targeted tests in `test/epic74-forced-hero-team.test.mjs`

## Story 3 — Extend the hero selection step in the generator to always pick heroes from the forced team first

- [x] In `src/app/setup-generator.ts`: update the `selectHeroes` function signature to accept a new parameter `forcedTeam: string | null = null` after `preferredExpansionId`.
- [x] In `src/app/setup-generator.ts` inside `selectHeroes`: after the `selected = [...forcedHeroes]` / `selectedIds` initialisation (and before the `heroNameRequirements` branch), insert the forced-team step:
  1. If `forcedTeam` is a non-empty string, partition the remaining hero pool (excluding `selectedIds`) into `teamPool` (heroes whose `teams` array includes `forcedTeam`) and `generalPool` (all others).
  2. Sort `teamPool` by freshness using `selectFreshItems(teamPool, teamPool.length, usageBucket, random)` — draw as many as needed to fill remaining slots (up to `requirements.heroCount - selected.length`).
  3. After exhausting the team pool, fill any leftover slots from `generalPool` using the same `selectFreshItems` call with `preferredExpansionId`.
  4. When `forcedTeam` is null or empty, leave the existing flow unchanged.
- [x] In `src/app/setup-generator.ts`: update the call to `selectHeroes` inside `tryMastermindForScheme` (around line 884) to pass `normalizedForcedPicks.forcedTeam` as the new last argument.
- [x] Test: verify that when `forcedTeam` is set, heroes from that team are always included before non-team heroes; verify least-played team heroes are drawn first within the team pool; verify that when the team pool is smaller than `heroCount`, remaining slots fill from the general pool without error; verify that forced `heroIds` still take priority and are not displaced; verify that villain groups, henchman groups, schemes, and masterminds are unaffected.
- [x] QC (Automated): run story-3 targeted tests in `test/epic74-forced-hero-team.test.mjs`

## Story 4 — Persist the forced team within the ForcedPicks state and backup payload

- [x] In `src/app/forced-picks-utils.ts`: add `forcedTeam: string | null` to the `ForcedPicks` interface (line 1–7 region).
- [x] In `src/app/forced-picks-utils.ts`: add `forcedTeam: null` to the object returned by `createEmptyForcedPicks()`.
- [x] In `src/app/forced-picks-utils.ts`: add a `forcedTeam` line to `normalizeForcedPicks()` that coerces `undefined`, `null`, non-string, and empty-string values to `null` — using the same pattern as `preferredExpansionId`: `typeof candidate.forcedTeam === 'string' && candidate.forcedTeam ? candidate.forcedTeam : null`.
- [x] In `src/app/forced-picks-utils.ts`: update `hasForcedPicks()` to also return `true` when `normalized.forcedTeam` is a non-empty string (add `|| normalized.forcedTeam` to the boolean expression).
- [x] In `src/app/types.ts`: add `forcedTeam: string | null` to the `forcedPicks` shape inside `GeneratedSetup` (lines 261–270 region) so the stored snapshot carries the value.
- [x] Test: verify `createEmptyForcedPicks().forcedTeam === null`; verify `normalizeForcedPicks({ forcedTeam: 'X-Men' }).forcedTeam === 'X-Men'`; verify each of `undefined`, `null`, `''`, `42`, `[]` all normalise to `null`; verify `hasForcedPicks({ ...createEmptyForcedPicks(), forcedTeam: 'X-Men' }) === true`; verify `hasForcedPicks(createEmptyForcedPicks()) === false`; verify a backup exported with `forcedTeam: 'X-Men'` and re-imported restores the same value.
- [x] QC (Automated): run story-4 targeted tests in `test/epic74-forced-hero-team.test.mjs`

## Story 5 — Show the active forced team as a badge in the generated setup result view

- [x] In `src/components/NewGameTab.svelte`: inside the `data-result-section="heroes"` result card, immediately after the `<h3>` tag and before the `<div class="new-game-hero-grid">`, add a conditional block: `{#if currentSetup.forcedPicks.forcedTeam}<div class="pill" data-forced-team-badge>{locale.t('newGame.forcedPicks.forcedTeam.active', { name: currentSetup.forcedPicks.forcedTeam })}</div>{/if}`.
- [x] Test: verify that a generated setup with `forcedPicks.forcedTeam` set to a non-null string renders the `data-forced-team-badge` element containing the team name; verify that a setup generated without a forced team renders no `data-forced-team-badge` element; verify that no existing result-view snapshot or integration test regresses.
- [x] QC (Automated): run story-5 targeted tests in `test/epic74-forced-hero-team.test.mjs`
