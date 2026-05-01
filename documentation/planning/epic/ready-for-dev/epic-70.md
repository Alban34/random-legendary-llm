## Epic 70 — Preferred Expansion Priority

**Objective**
Allow players to designate one owned expansion as "forced" so the setup generator prefers cards from that expansion when filling unclaimed card slots, while respecting the existing play-count fairness system and ensuring individually forced cards always take absolute priority.

**Background**
Epic 15 introduced forced picks for individual card types stored in the `ForcedPicks` interface (`src/app/forced-picks-utils.ts`). This epic extends that data structure and the generator (`src/app/setup-generator.ts`) with a new expansion-level preference layer.

The preferred expansion is a **tiebreaker within play-count tiers**, not an override of the fairness system. The generator already draws from the lowest available play-count tier first; this epic adds the rule that, within any given tier, cards from the preferred expansion are drawn before cards from other expansions. A card from the preferred expansion with a higher play count is never preferred over a card from another expansion with a lower play count.

**Concrete examples of the intended behaviour:**
- If every card in the preferred expansion has been played at least once, but another expansion has unplayed cards, the preferred expansion preference is bypassed and the unplayed cards from the other expansion are drawn first.
- If cards from expansion A (preferred) and expansion B each have a play count of 1 and there are no unplayed cards anywhere, expansion A's cards are drawn before expansion B's cards.

The full priority order is therefore: (1) individually forced cards (absolute, regardless of play count); (2) within each play-count tier, cards from the preferred expansion before cards from other expansions; (3) random draw among cards of the same play-count tier and same expansion origin. No changes are needed to how the existing individually forced cards work; this epic adds a new orthogonal preference that sits below them.

**In scope**
- new `preferredExpansionId` field (or equivalent) on the `ForcedPicks` interface
- updates to `createEmptyForcedPicks`, `normalizeForcedPicks`, `hasForcedPicks`, and related utilities in `forced-picks-utils.ts`
- generator changes in `setup-generator.ts` to prefer cards from the preferred expansion within each play-count tier for slots not claimed by an individually forced card
- graceful fallback within the same tier to the general pool when the preferred expansion cannot supply enough cards for a given slot type
- UI controls under the existing "Forced picks" section in the new game tab: pick, display, and clear the preferred expansion
- locale strings for all new UI copy in all six supported locales (en, fr, de, es, ja, ko)
- automated tests for the priority rules and generator behaviour edge cases

**Out of scope**
- forcing multiple expansions simultaneously
- changes to the existing individually forced cards logic beyond the priority interaction described above
- changes to the collection ownership model or expansion data schema

**Stories**

### Story 70.1 — Extend the ForcedPicks data model and related utilities
Extend the `ForcedPicks` interface in `src/app/forced-picks-utils.ts` with a `preferredExpansionId: string | null` field. Update `createEmptyForcedPicks` to return `null` for this field. Update `normalizeForcedPicks` to safely normalise the new field from raw/unknown input. Update `hasForcedPicks` to return `true` when the field is non-null. All existing tests must continue to pass.

**Test:** Existing unit tests pass. New unit tests cover `createEmptyForcedPicks`, `normalizeForcedPicks` (valid, null, missing, and invalid values), and `hasForcedPicks` with and without the new field.

**QC (Automated):** `npm run lint` passes; `npm test` exits 0.

---

### Story 70.2 — Update the setup generator for preferred expansion fill
Update `src/app/setup-generator.ts` to apply the preferred expansion preference as a tiebreaker within each play-count tier. For every slot not already claimed by an individually forced card, the generator must:
1. Identify the lowest available play-count tier across all eligible cards for that slot type.
2. Within that tier, draw from the preferred expansion's cards first.
3. If the preferred expansion has no cards in that tier for the slot type (either because it has no owned cards of that type at all, or because all its cards of that type have a higher play count than the current tier minimum), draw from the general pool of that tier without error.
4. Never draw a card with a higher play count in preference to a card with a lower play count, even if the higher-play-count card belongs to the preferred expansion.

**Test:** Unit tests cover: (a) preferred expansion cards drawn first when they share the minimum play count with other expansions' cards; (b) preferred expansion skipped when all its cards have a higher play count than cards from other expansions — lower-play-count cards from other expansions are drawn instead; (c) preferred expansion has no owned cards in a slot type — falls back silently to general pool; (d) preferred expansion pool exhausted within the current tier — falls back to other cards in the same tier.

**QC (Automated):** `npm run lint` passes; `npm test` exits 0.

---

### Story 70.3 — Verify individually forced cards take absolute priority
Confirm through automated tests that an individually forced card (scheme, mastermind, hero, villain group, henchman group) always resolves before the preferred expansion fills remaining slots, regardless of play counts. A combined test case with all slot types active at once must confirm the full priority chain.

**Test:** Test cases: (a) individually forced mastermind + preferred expansion — mastermind slot resolves first; (b) individually forced scheme + preferred expansion — scheme slot resolves first; (c) all individually forced types + preferred expansion — every forced card resolves, expansion preference applies only to unclaimed slots within their play-count tiers.

**QC (Automated):** `npm run lint` passes; `npm test` exits 0.

---

### Story 70.4 — Add UI controls for preferred expansion in the forced-picks panel
Add UI controls to the "Forced picks" panel in the new game tab. The player can select one of their owned expansions as the preferred expansion. The currently active preferred expansion is displayed with its name and a one-tap clear button. The control is hidden or disabled when the player owns fewer than two expansions. Clearing the preferred expansion resets the field to `null`.

**Test:** Playwright tests cover: control visible with ≥2 owned expansions; control absent/disabled with <2 expansions; selecting an expansion persists it; clear button removes it; state survives page reload.

**QC (Automated):** `npm run lint` passes; `npx playwright test` exits 0.

---

### Story 70.5 — Add and translate locale strings for preferred expansion UI
Add all new locale keys for Story 70.4 UI copy to `src/app/locales/en.mjs` following the `newGame.forcedPicks.*` naming convention. Translate all new keys into all five other locale files (fr, de, es, ja, ko).

**Test:** No missing-key lint warnings; all six locale files include every new key.

**QC (Automated):** `npm run lint` passes.

---

### Story 70.6 — Automated regression tests for preferred expansion end-to-end
Write a dedicated test file (`test/epic70-preferred-expansion.test.mjs`) covering:
- preferred expansion cards drawn first when play counts are tied with other expansions
- preferred expansion skipped when all its cards have a higher play count than cards from other expansions (unplayed cards from other expansions win)
- fallback within a tier when preferred expansion pool is exhausted
- individually forced card takes absolute priority; expansion preference fills only unclaimed slots
- clearing preferred expansion restores standard play-count-ordered random draw
- normalization of persisted state (valid id, null, missing, invalid values round-trip correctly)

**Test:** All cases in `test/epic70-preferred-expansion.test.mjs` pass.

**QC (Automated):** `npm run lint` passes; `npm test` exits 0.

**Acceptance Criteria**
- Story 70.1: `ForcedPicks` includes `preferredExpansionId: string | null`; `createEmptyForcedPicks` returns it as `null`; `normalizeForcedPicks` handles all input shapes; `hasForcedPicks` returns `true` when non-null; existing tests pass.
- Story 70.2: Generator draws from the preferred expansion first within each play-count tier; never draws a higher-play-count card from the preferred expansion ahead of a lower-play-count card from another expansion; graceful fallback within the same tier when the preferred expansion cannot supply cards; no errors when preferred expansion has no cards in a slot type.
- Story 70.3: Individually forced cards always resolve before expansion fill regardless of play counts; all-slot combined test confirms full priority chain.
- Story 70.4: Expansion selector present with ≥2 owned expansions; absent/disabled otherwise; selection and clearing work correctly; state persists.
- Story 70.5: All new `newGame.forcedPicks.*` keys present in all six locale files; no missing-key warnings.
- Story 70.6: `test/epic70-preferred-expansion.test.mjs` passes fully; `npm test` and `npm run lint` both exit 0.
