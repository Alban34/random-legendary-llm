# Epic 70 — Preferred Expansion Priority

Allow players to designate one owned expansion as "preferred" so the setup generator draws that expansion's cards first within each play-count tier for unclaimed slots, without overriding the fairness system or individually forced picks.

---

## Story 70.1 — Extend the ForcedPicks data model and related utilities

- [ ] **T-1** Add `preferredExpansionId: string | null` to the `ForcedPicks` interface in `src/app/forced-picks-utils.ts`.
  - Insert the field after `henchmanGroupIds` to keep the existing field order stable.

- [ ] **T-2** Update `createEmptyForcedPicks` in `src/app/forced-picks-utils.ts` to include `preferredExpansionId: null` in the returned object.

- [ ] **T-3** Update `normalizeForcedPicks` in `src/app/forced-picks-utils.ts` to normalise the new field:
  - Accept a non-empty string → pass through as-is.
  - `null`, `undefined`, missing key, empty string, or any non-string value → coerce to `null`.

- [ ] **T-4** Update `hasForcedPicks` in `src/app/forced-picks-utils.ts` to return `true` when `normalized.preferredExpansionId` is non-null.

- [ ] **T-5** Test: Add or extend unit tests in `test/epic70-preferred-expansion.test.mjs` (created in full under Story 70.6) to cover Story 70.1 obligations:
  - `createEmptyForcedPicks` returns `preferredExpansionId: null`.
  - `normalizeForcedPicks` with a valid string id preserves the value.
  - `normalizeForcedPicks` with `null`, `undefined`, missing key, empty string, and a non-string value each produce `null`.
  - `hasForcedPicks` returns `false` when only `preferredExpansionId` is `null` and all other fields are empty.
  - `hasForcedPicks` returns `true` when `preferredExpansionId` is a non-empty string and all other fields are empty.

- [ ] **T-6** QC (Automated): Run `npm run lint` (must pass with zero errors), then run `npm test` (must exit 0).

---

## Story 70.2 — Update the setup generator for preferred expansion fill

- [ ] **T-7** Read `src/app/setup-generator.ts` lines covering the per-slot draw logic to locate where the lowest available play-count tier is selected and cards are drawn for each slot type (heroes, villain groups, henchman groups, scheme, mastermind).

- [ ] **T-8** Update `src/app/setup-generator.ts` to apply the preferred-expansion tiebreaker within each play-count tier for every slot not already claimed by an individually forced card:
  - After identifying the minimum play count across eligible cards for a given slot type, partition the tier into two sub-lists: cards whose expansion matches `forcedPicks.preferredExpansionId` and the remainder.
  - Draw from the preferred-expansion sub-list first (randomly within it), then draw from the remainder (randomly within it) if more cards are needed to fill the slot.
  - When `preferredExpansionId` is `null` or the preferred expansion has no owned cards of the required type in the current tier, skip silently and draw from the full tier pool as before.
  - Never draw a card with a higher play count than the current tier minimum, regardless of whether it belongs to the preferred expansion.

- [ ] **T-9** Test: Add unit tests in `test/epic70-preferred-expansion.test.mjs` to cover Story 70.2 obligations:
  - (a) Cards from the preferred expansion are drawn first when they share the minimum play count with cards from other expansions.
  - (b) Cards from the preferred expansion are skipped when all their owned copies of a slot type have a higher play count than cards from other expansions — the lower-play-count cards from other expansions are drawn instead.
  - (c) The preferred expansion has no owned cards for a given slot type — generator falls back silently to the full general pool with no error.
  - (d) The preferred expansion's cards in the current tier are exhausted before the slot is fully filled — generator falls back to the remaining cards in the same tier.

- [ ] **T-10** QC (Automated): Run `npm run lint` (must pass with zero errors), then run `npm test` (must exit 0).

---

## Story 70.3 — Verify individually forced cards take absolute priority

- [ ] **T-11** Add unit tests in `test/epic70-preferred-expansion.test.mjs` to cover Story 70.3 obligations:
  - (a) Individually forced mastermind + preferred expansion set: mastermind slot resolves to the forced mastermind; preferred expansion tiebreaker applies only to remaining unclaimed slots.
  - (b) Individually forced scheme + preferred expansion set: scheme slot resolves to the forced scheme; preferred expansion tiebreaker applies only to remaining unclaimed slots.
  - (c) All individually forced types active simultaneously (scheme, mastermind, one hero, one villain group, one henchman group) + preferred expansion set: every forced card resolves first in its slot; preferred expansion preference applies only to the unclaimed slots within their play-count tiers.

- [ ] **T-12** QC (Automated): Run `npm run lint` (must pass with zero errors), then run `npm test` (must exit 0).

---

## Story 70.4 — Add UI controls for preferred expansion in the forced-picks panel

- [ ] **T-13** Locate the "Forced picks" panel markup in `src/components/App.svelte` (search for `newGame.forcedPicks.title`). Add a preferred-expansion selector sub-section below the existing per-card-type pickers:
  - Render a labelled `<select>` (or equivalent accessible control) populated with the player's owned expansion names.
  - Bind the selected value to the `preferredExpansionId` field in the current forced picks state.
  - Hide or disable the entire sub-section when the player owns fewer than two expansions.

- [ ] **T-14** Display the currently active preferred expansion inline when `preferredExpansionId` is non-null in `src/components/App.svelte`:
  - Show the expansion name using the locale key `newGame.forcedPicks.preferredExpansion.active` (added in T-19).
  - Render a one-tap clear button labelled with `newGame.forcedPicks.preferredExpansion.clear` that sets `preferredExpansionId` back to `null`.

- [ ] **T-15** Wire the set and clear interactions to the app state in `src/components/App.svelte`:
  - On selection change: call `setForcedPicks` with the updated `preferredExpansionId`.
  - On clear button tap: call `setForcedPicks` with `preferredExpansionId: null`.
  - Ensure `resetForcedPicks` (called after Accept & Log or reload) clears `preferredExpansionId` as part of the existing reset flow — this should be automatic once `createEmptyForcedPicks` is updated in T-2.

- [ ] **T-16** Test: Write Playwright tests covering Story 70.4 obligations:
  - Control is visible and interactive when the player owns ≥ 2 expansions.
  - Control is absent or disabled when the player owns fewer than 2 expansions.
  - Selecting an expansion persists `preferredExpansionId` in the forced picks state.
  - Tapping the clear button removes the preferred expansion (field returns to `null`).
  - State survives a page reload.

- [ ] **T-17** QC (Automated): Run `npm run lint` (must pass with zero errors), then run `npx playwright test` (must exit 0).

---

## Story 70.5 — Add and translate locale strings for preferred expansion UI

- [ ] **T-18** Add all new locale keys to `src/app/locales/en.mjs` under the `newGame.forcedPicks.*` namespace, following the existing key naming conventions:
  - `'newGame.forcedPicks.preferredExpansion.label'` — section label for the preferred expansion selector.
  - `'newGame.forcedPicks.preferredExpansion.placeholder'` — default placeholder text when no expansion is selected.
  - `'newGame.forcedPicks.preferredExpansion.active'` — inline display string for the active preferred expansion (e.g. `'Preferred expansion: {name}'`).
  - `'newGame.forcedPicks.preferredExpansion.clear'` — accessible label for the clear button.
  - `'newGame.forcedPicks.preferredExpansion.unavailable'` — message shown when fewer than two expansions are owned and the control is suppressed.

- [ ] **T-19** Translate all five new keys added in T-18 into each of the five remaining locale files:
  - `src/app/locales/fr.mjs`
  - `src/app/locales/de.mjs`
  - `src/app/locales/es.mjs`
  - `src/app/locales/ja.mjs`
  - `src/app/locales/ko.mjs`
  - Maintain the same key names; translate only the string values.

- [ ] **T-20** Test: Verify no missing-key lint warnings by confirming each of the five new keys appears in all six locale files. A quick `grep` across `src/app/locales/*.mjs` for each key name is sufficient evidence.

- [ ] **T-21** QC (Automated): Run `npm run lint` (must pass with zero errors, including any locale-completeness lint rules).

---

## Story 70.6 — Automated regression tests for preferred expansion end-to-end

- [ ] **T-22** Create `test/epic70-preferred-expansion.test.mjs`. The file must contain test cases for all six regression scenarios listed in the epic spec:
  - Preferred expansion cards drawn first when play counts are tied with other expansions' cards.
  - Preferred expansion skipped when all its cards have a higher play count than cards from other expansions — unplayed cards from other expansions win.
  - Fallback within a tier when the preferred expansion pool is exhausted before the slot is filled.
  - Individually forced card takes absolute priority; preferred expansion preference applies only to unclaimed slots.
  - Clearing `preferredExpansionId` (setting to `null`) restores standard play-count-ordered random draw with no preferred-expansion bias.
  - Normalisation round-trip: valid expansion id, `null`, missing field, and an invalid (non-string) value each serialise and deserialise correctly through `normalizeForcedPicks`.
  - Sub-bullets: story 70.1 unit tests (T-5), story 70.2 unit tests (T-9), and story 70.3 unit tests (T-11) all live in this file; T-22 consolidates any remaining cases not already covered by those tasks.

- [ ] **T-23** QC (Automated): Run `npm run lint` (must pass with zero errors), then run `npm test` (must exit 0 with all cases in `test/epic70-preferred-expansion.test.mjs` green).
