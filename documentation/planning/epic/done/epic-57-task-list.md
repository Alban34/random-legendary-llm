# Epic 57 — Solo Mode Rules Reference Panel: Task List

> **DEPENDENCY: Requires Epic 56 to be fully implemented before this epic can begin.**
> Epic 56 introduces the `standard-solo-v2` play mode (the "Standard v2" button in the 1-player mode selector, the `resolvePlayMode`/`resolveSetupTemplate` support, and the six locale string keys `common.playMode.standard-solo-v2` and `common.playMode.standard-solo-v2Description`). Epic 57 references `standard-solo-v2` as one of the three eligible modes for the rules panel. Do not begin any story in this epic until Epic 56 passes QC.

---

## Background

The authoritative rules content source is `documentation/my-inputs/solo-modes-rules.md`. The three solo modes with rule changes are:

| Mode key | Source section |
|---|---|
| `standard` (1P) | Mode 1 — Original Solo Mode |
| `advanced-solo` | Mode 2 — Advanced Solo Mode |
| `standard-solo-v2` | Mode 3 — Second Edition Solo Mode |

Two-Handed Solo (`two-handed-solo`) is **excluded** — it has no solo-specific rule changes.

The rules panel is rendered only inside the generated setup result area in `src/components/NewGameTab.svelte`, only when `currentSetup` is non-null and the active play mode is one of the three eligible modes above.

---

## Story 1 — Define the rules content model

Map each eligible solo mode to its ordered list of rule-change items as locale string keys and a structured JS constant.

### Tasks

- [x] **Read `documentation/my-inputs/solo-modes-rules.md` in full** to confirm the exact rule items for each of the three modes before writing any code.

- [x] **Create `src/app/solo-rules.mjs`** — a new module that exports a constant `SOLO_RULES_PANEL_MODES` (a `Set` of eligible play mode strings) and a helper `getSoloRulesItems(playMode)` that returns an ordered array of locale string keys for that mode, or `null` if the mode is not eligible (i.e. `two-handed-solo` or any multiplayer mode).

  Structure example (key names are authoritative for this epic — do not rename them):

  ```js
  // src/app/solo-rules.mjs

  export const SOLO_RULES_PANEL_MODES = new Set(['standard', 'advanced-solo', 'standard-solo-v2']);

  // Returns an ordered array of locale key strings, or null for ineligible modes.
  export function getSoloRulesItems(playMode) { … }
  ```

  The locale key arrays for each mode must cover **at minimum** the following items in this order:

  **`standard` (Mode 1 — Original Solo Mode)**
  1. `newGame.soloRules.standard.villainDeck` — villain deck composition (1 Master Strike, 3 Henchman cards from same group, 1 Bystander, normal Scheme Twists)
  2. `newGame.soloRules.standard.schemeTwist` — scheme twist effect: KO a Hero from the HQ that costs 6 or less
  3. `newGame.soloRules.standard.eachOtherPlayer` — "each other player" does NOT apply; no instruction redirected to the solo player
  4. `newGame.soloRules.standard.alwaysLeads` — ignore the Mastermind's "Always Leads" ability

  **`advanced-solo` (Mode 2 — Advanced Solo Mode)**
  1. `newGame.soloRules.advancedSolo.villainDeck` — villain deck composition (5 Master Strikes, 3 Henchman cards from same group, 1 Bystander, normal Scheme Twists)
  2. `newGame.soloRules.advancedSolo.masterStrike` — when a Master Strike fires, immediately play another card from the Villain Deck
  3. `newGame.soloRules.advancedSolo.schemeTwist` — scheme twist effect: tuck a Hero costing 6 or less from the HQ to the bottom of the Hero Deck
  4. `newGame.soloRules.advancedSolo.eachOtherPlayer` — "each other player" instructions apply to the solo player
  5. `newGame.soloRules.advancedSolo.alwaysLeads` — ignore the Mastermind's "Always Leads" ability

  **`standard-solo-v2` (Mode 3 — Second Edition Solo Mode)**
  1. `newGame.soloRules.standardV2.villainDeck` — villain deck composition: 1 Villain Group, 2 Henchman cards (in deck), 2 Henchman cards (set aside — enter city at start of turn 1, one at a time), 1 Bystander, 5 Master Strikes, normal Scheme Twists
  2. `newGame.soloRules.standardV2.firstTurnHenchmen` — the 2 set-aside Henchmen enter the city at the very start of your first turn, one at a time, before the normal Villain Deck card
  3. `newGame.soloRules.standardV2.schemeTwist` — scheme twist effect: tuck one Hero costing 6 or less to the bottom of the Hero Deck; only one tuck per turn regardless of how many Twists fire
  4. `newGame.soloRules.standardV2.eachOtherPlayer` — "each other player" Villain/Mastermind/Tactic instructions apply to you; does NOT apply to Hero cards
  5. `newGame.soloRules.standardV2.mastermindAbility` — Mastermind abilities tied to their normal Villain Group transfer to whichever Villain Group or Henchman Group you are actually using
  6. `newGame.soloRules.standardV2.alwaysLeads` — ignore the Mastermind's "Always Leads" ability

- [x] **Add a section heading locale key** `newGame.soloRules.sectionTitle` for the collapsible panel label (value: "Rules for this mode").

- [x] **Verify `npm run lint` passes** on `src/app/solo-rules.mjs` before committing.

- [x] **Test:** Write `test/epic57-solo-rules-panel.test.mjs`. In Story 1, add unit tests that:
  - assert `getSoloRulesItems('standard')` returns an array of exactly 4 locale keys starting with `newGame.soloRules.standard.`
  - assert `getSoloRulesItems('advanced-solo')` returns an array of exactly 5 locale keys starting with `newGame.soloRules.advancedSolo.`
  - assert `getSoloRulesItems('standard-solo-v2')` returns an array of exactly 6 locale keys starting with `newGame.soloRules.standardV2.`
  - assert `getSoloRulesItems('two-handed-solo')` returns `null`
  - assert `getSoloRulesItems('standard')` returns `null` (or an empty/null result) when `SOLO_RULES_PANEL_MODES` does not include it — **actually**: assert that `SOLO_RULES_PANEL_MODES.has('two-handed-solo')` is `false` and `SOLO_RULES_PANEL_MODES.has('standard')` is `true`

- [x] **QC (Automated):** run `npm run lint && npm test` and confirm all pass.

---

## Story 2 — Render the collapsible solo rules section in `NewGameTab.svelte`

Add the rules panel to the setup result area, visible only when `currentSetup` is non-null and the active play mode is `standard`, `advanced-solo`, or `standard-solo-v2`.

### Tasks

- [x] **Import `getSoloRulesItems` and `SOLO_RULES_PANEL_MODES`** from `../app/solo-rules.mjs` at the top of `src/components/NewGameTab.svelte`.

- [x] **Add a `$derived` reactive variable** `soloRulesItems` in the `<script>` block of `NewGameTab.svelte`:

  ```js
  let soloRulesItems = $derived(
    currentSetup && SOLO_RULES_PANEL_MODES.has(selectedPlayMode)
      ? getSoloRulesItems(selectedPlayMode)
      : null
  );
  ```

- [x] **Add the collapsible rules section** to the setup result panel in `NewGameTab.svelte`, immediately after the `data-result-section="henchman-groups"`` `<div>` and before the closing `{/if}` of the `{#if currentSetup}` block:

  ```svelte
  {#if soloRulesItems}
    <details class="result-card" data-result-section="solo-rules" open>
      <summary><strong>{locale.t('newGame.soloRules.sectionTitle')}</strong></summary>
      <ul class="clean result-list" style="margin-top: var(--space-sm)">
        {#each soloRulesItems as key (key)}
          <li>{locale.t(key)}</li>
        {/each}
      </ul>
    </details>
  {/if}
  ```

  Requirements for this block:
  - `open` attribute is present so the panel defaults to expanded
  - `data-result-section="solo-rules"` attribute is on the `<details>` element (used by QC selectors)
  - The section is absent (`soloRulesItems` is `null`) when `selectedPlayMode` is `two-handed-solo` or a multiplayer mode
  - The section is absent when `currentSetup` is `null` (no setup generated yet)

- [x] **Verify mode-switching behavior manually** (to document for QC):
  - 1P Standard Solo → panel visible with 4 items
  - 1P Advanced Solo → panel visible with 5 items
  - 1P Standard v2 → panel visible with 6 items
  - 1P Two-Handed Solo → panel absent
  - 2P Standard → panel absent
  - Before generate is pressed → panel absent

- [x] **Verify `npm run lint` passes** on `src/components/NewGameTab.svelte` after the change.

- [x] **Test:** Extend `test/epic57-solo-rules-panel.test.mjs` with Playwright-style or DOM-level tests (matching the existing test conventions in `test/epic11-play-modes.test.mjs` and `test/epic15-forced-picks.test.mjs`) that assert:
  - `[data-result-section="solo-rules"]` is not present in the DOM before "Generate Setup" is clicked
  - After generating with 1P Standard Solo, `[data-result-section="solo-rules"]` exists and is `open`
  - After generating with 1P Advanced Solo, `[data-result-section="solo-rules"]` exists
  - After generating with 1P Standard v2, `[data-result-section="solo-rules"]` exists
  - After switching to Two-Handed Solo (with or without a setup), `[data-result-section="solo-rules"]` is absent
  - After switching to 2P Standard, `[data-result-section="solo-rules"]` is absent
  - The content rendered for Standard Solo does not contain any Advanced Solo or Standard v2 locale-key text
  - The content rendered for Advanced Solo includes a list item referencing the Master Strike cascade rule

- [x] **QC (Automated):** run `npm run lint && npm test` and confirm all pass.

---

## Story 3 — Add locale strings for all rules content across all six locale files

Every rule item key defined in Story 1 must be present in all six locale files. No key may fall back to a raw key string in any locale.

### Locale key reference (all keys to add)

**Section title (all files):**
- `newGame.soloRules.sectionTitle`

**Standard Solo (Mode 1) — 4 keys:**
- `newGame.soloRules.standard.villainDeck`
- `newGame.soloRules.standard.schemeTwist`
- `newGame.soloRules.standard.eachOtherPlayer`
- `newGame.soloRules.standard.alwaysLeads`

**Advanced Solo (Mode 2) — 5 keys:**
- `newGame.soloRules.advancedSolo.villainDeck`
- `newGame.soloRules.advancedSolo.masterStrike`
- `newGame.soloRules.advancedSolo.schemeTwist`
- `newGame.soloRules.advancedSolo.eachOtherPlayer`
- `newGame.soloRules.advancedSolo.alwaysLeads`

**Standard v2 (Mode 3) — 6 keys:**
- `newGame.soloRules.standardV2.villainDeck`
- `newGame.soloRules.standardV2.firstTurnHenchmen`
- `newGame.soloRules.standardV2.schemeTwist`
- `newGame.soloRules.standardV2.eachOtherPlayer`
- `newGame.soloRules.standardV2.mastermindAbility`
- `newGame.soloRules.standardV2.alwaysLeads`

**Total: 16 keys × 6 locale files = 96 locale string additions.**

### Per-locale tasks

- [x] **`src/app/locales/en.mjs` (English — canonical):** Add all 16 keys to `EN_MESSAGES`. Use the rules text from `documentation/my-inputs/solo-modes-rules.md` verbatim or closely paraphrased. This file is the reference; all other files must mirror the same key structure.

  Suggested English values (derive final text from the source doc):
  - `newGame.soloRules.sectionTitle`: `'Rules for this mode'`
  - `newGame.soloRules.standard.villainDeck`: `'Villain Deck: 1 Villain Group · 3 Henchman cards (same group) · 1 Bystander · 1 Master Strike · normal Scheme Twists'`
  - `newGame.soloRules.standard.schemeTwist`: `'Scheme Twist: KO a Hero from the HQ that costs 6 or less.'`
  - `newGame.soloRules.standard.eachOtherPlayer`: `'"Each other player" instructions do not apply — ignore them.'`
  - `newGame.soloRules.standard.alwaysLeads`: `'Ignore the Mastermind\'s "Always Leads" ability.'`
  - `newGame.soloRules.advancedSolo.villainDeck`: `'Villain Deck: 1 Villain Group · 3 Henchman cards (same group) · 1 Bystander · 5 Master Strikes · normal Scheme Twists'`
  - `newGame.soloRules.advancedSolo.masterStrike`: `'Master Strike: whenever one fires, immediately play another card from the Villain Deck.'`
  - `newGame.soloRules.advancedSolo.schemeTwist`: `'Scheme Twist: tuck a Hero costing 6 or less from the HQ to the bottom of the Hero Deck.'`
  - `newGame.soloRules.advancedSolo.eachOtherPlayer`: `'"Each other player" Villain or Mastermind instructions apply to you.'`
  - `newGame.soloRules.advancedSolo.alwaysLeads`: `'Ignore the Mastermind\'s "Always Leads" ability.'`
  - `newGame.soloRules.standardV2.villainDeck`: `'Villain Deck: 1 Villain Group · 2 Henchman cards (in deck) + 2 set aside · 1 Bystander · 5 Master Strikes · normal Scheme Twists'`
  - `newGame.soloRules.standardV2.firstTurnHenchmen`: `'First turn: the 2 set-aside Henchmen enter the city one at a time before you play your normal Villain Deck card.'`
  - `newGame.soloRules.standardV2.schemeTwist`: `'Scheme Twist: tuck one Hero costing 6 or less to the bottom of the Hero Deck. Only one tuck per turn, no matter how many Twists fire.'`
  - `newGame.soloRules.standardV2.eachOtherPlayer`: `'"Each other player" Villain, Mastermind, or Tactic instructions apply to you. Does not apply to Hero cards.'`
  - `newGame.soloRules.standardV2.mastermindAbility`: `'Mastermind abilities tied to their normal Villain Group transfer to whichever Villain or Henchman Group you are actually using.'`
  - `newGame.soloRules.standardV2.alwaysLeads`: `'Ignore the Mastermind\'s "Always Leads" ability.'`

- [x] **`src/app/locales/fr.mjs` (French):** Add all 16 keys to `FR_MESSAGES` with French translations. Preserve brand names (Legendary, Mastermind, S.H.I.E.L.D., Villain Deck, Master Strike, Scheme Twist, HQ) untranslated or in their established French form as used elsewhere in this file. Do not alter any existing key.

- [x] **`src/app/locales/de.mjs` (German):** Add all 16 keys to `DE_MESSAGES` with German translations. Same brand-name preservation rules as above.

- [x] **`src/app/locales/es.mjs` (Spanish):** Add all 16 keys to `ES_MESSAGES` with Spanish translations. Same brand-name preservation rules as above.

- [x] **`src/app/locales/ja.mjs` (Japanese):** Add all 16 keys to `JA_MESSAGES` with Japanese translations. Same brand-name preservation rules as above.

- [x] **`src/app/locales/ko.mjs` (Korean):** Add all 16 keys to `KO_MESSAGES` with Korean translations. Same brand-name preservation rules as above.

- [x] **Verify key completeness:** After all six files are updated, confirm that every key present in `en.mjs` under `newGame.soloRules.*` also exists in `fr.mjs`, `de.mjs`, `es.mjs`, `ja.mjs`, and `ko.mjs`. No file should be missing any of the 16 keys.

- [x] **Verify `npm run lint` passes** across all six locale files.

- [x] **Test:** Extend `test/epic57-solo-rules-panel.test.mjs` with assertions that:
  - For each of the 6 locales, switching the app locale and generating a 1P Standard Solo setup causes the `[data-result-section="solo-rules"]` panel to contain non-empty text (i.e. no raw key strings such as `newGame.soloRules.standard.villainDeck` appear literally in the rendered output)
  - For each of the 6 locales, generating a 1P Advanced Solo setup renders the `advancedSolo.masterStrike` content visibly (non-empty, non-key string)
  - For each of the 6 locales, generating a 1P Standard v2 setup renders the `standardV2.firstTurnHenchmen` content visibly

- [x] **QC (Automated):** run `npm run lint && npm test` and confirm all pass.

---

## QC handoff summary

### Files changed
- `src/app/solo-rules.mjs` — new file (Story 1)
- `src/components/NewGameTab.svelte` — import + `$derived` variable + `<details>` block in result panel (Story 2)
- `src/app/locales/en.mjs` — 16 new keys (Story 3)
- `src/app/locales/fr.mjs` — 16 new keys (Story 3)
- `src/app/locales/de.mjs` — 16 new keys (Story 3)
- `src/app/locales/es.mjs` — 16 new keys (Story 3)
- `src/app/locales/ja.mjs` — 16 new keys (Story 3)
- `src/app/locales/ko.mjs` — 16 new keys (Story 3)
- `test/epic57-solo-rules-panel.test.mjs` — new test file (Stories 1–3)

### Story-specific QC checks
- Run `npm run lint` first; lint failures are blocking.
- Run `npm test` targeting `test/epic57-solo-rules-panel.test.mjs`.
- Manually verify the `<details open>` panel renders correctly in each of the three eligible modes.
- Manually verify the panel is absent for Two-Handed Solo and 2P Standard.
- Manually verify the panel is absent before the Generate button is pressed.
- Switch the locale to each of the 6 languages while a solo setup is displayed and confirm no raw key strings appear.

### Epic-end regression
Yes — after all three stories pass QC, this epic should flow into full regression (`npx playwright test`) to confirm no regressions in the New Game tab, History tab, or locale switching.

### UX / accessibility risks
- The `<details open>` element is natively keyboard accessible and screen-reader compatible; no additional ARIA role is needed.
- The section heading (`<summary>`) must have sufficient contrast in both dark and light themes — verify against the existing `.result-card` styling.
- If rule text is long in certain locales (Japanese, Korean), the list items may wrap awkwardly inside the `result-card` container — verify on a narrow viewport.
- Two-Handed Solo exclusion is intentional per spec; confirm the mode label is still "Two-Handed Solo" post–Epic 56 before finalising the hide condition.
