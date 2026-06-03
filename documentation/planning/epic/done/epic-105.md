# Epic 105 — Scheme Rules Alignment: Machine-Readable Modifiers and Forced Groups

## Objective
Correct all missing, incorrect, and partially-rolled-back machine-readable modifier and `forcedGroups` entries in `src/data/canonical-game-data.json`, and introduce a new `conditional-add-hero` modifier type in `src/app/setup-scheme-modifiers.ts`, so the setup generator produces legally correct hero counts, villain-group counts, henchman-group counts, and forced-group selections for every scheme whose rules are documented in `documentation/my-inputs/special-schemes.md`.

## Background
The user extracted setup rules directly from physical card text and recorded them in `documentation/my-inputs/special-schemes.md`. Comparing that authoritative source against the current database reveals three categories of problems.

**Category 1 — Incorrect data (wrong values):**
- **Age of Ultron** carries a `conditional-add-villain-group` modifier scoped to `playerCounts:[4,5]`, but the card text states "4–5 players: Add another Hero." The modifier type is wrong and causes the generator to over-count villain groups instead of heroes for 4–5 player games.
- **Secret Invasion of the Skrull Shapeshifters** has `set-min-heroes: 5`, but the card text states "6 Heroes." Epic 104 corrected the value from 6 to 5 based on screenshots; the authoritative card text confirms 6 is correct and the correction must be reverted.

**Category 2 — Partial rollback of Epic 104 work:**
Two schemes had their `add-hero` modifier and `set-min-heroes` entries partially rolled back or not applied in Epic 104:
- Secret Invasion: `add-hero: 12` (12 random heroes shuffled into the Villain Deck from an extra Hero) is missing.
- Enslave Minds with the Chitauri Scepter: `set-min-heroes: 6` and `add-hero: 12` are missing (the `forcedGroups` entry for Chitauri from Epic 104 is present and correct).

**Category 3 — Machine-readable rules exist only as prose notes (or are absent entirely):**
Many schemes have their setup rules captured in the human-readable `notes` array but no corresponding `modifiers` or `forcedGroups` entries, meaning the generator silently ignores those rules. The source file `documentation/my-inputs/special-schemes.md` provides the authoritative text for all affected schemes.

## Source material
- `documentation/my-inputs/special-schemes.md` — authoritative card-text extractions for all schemes with special setup rules.
- `src/data/canonical-game-data.json` — the canonical data file to be modified.
- `src/app/setup-scheme-modifiers.ts` — the modifier-application engine; needs one new case.

## Data structure reference
Relevant per-scheme fields in `rawCardData.schemes[]`:
- `forcedGroups` — `Array<{category: "villains"|"henchmen", name: string}>` for required groups.
- `modifiers` — array of modifier objects; see known types in `documentation/data/data-model.md`.
- `constraints.minimumPlayerCount` — minimum player count for the scheme to be legal.
- `notes` — human-readable strings; update to match applied modifiers.

---

## Stories

### Story 105.1 — Introduce `conditional-add-hero` modifier type; fix Age of Ultron

**Current state — Age of Ultron (`Ant-Man`):**
```json
"modifiers": [{ "type": "conditional-add-villain-group", "amount": 1, "playerCounts": [4, 5] }],
"notes": ["For 4 or 5 players, add 1 extra Hero."]
```

**Card rule (from `special-schemes.md`):** "11 Twists. 4–5 players: Add another Hero."

**Changes:**
1. Add a `conditional-add-hero` case to the `applyModifier` switch in `src/app/setup-scheme-modifiers.ts`:
   ```typescript
   case 'conditional-add-hero':
     if ((modifier.playerCounts || []).includes(playerCount)) {
       requirements.heroCount += modifier.amount || 0;
     }
     break;
   ```
2. In `canonical-game-data.json`, change Age of Ultron's modifier from `conditional-add-villain-group` to `conditional-add-hero`. The `playerCounts` and `amount` remain `[4,5]` and `1`.
3. Update `documentation/data/data-model.md` to document `conditional-add-hero` in the known modifier types table.

**Acceptance criteria:**
- `applyModifier` with type `conditional-add-hero`, `playerCounts:[4,5]`, `amount:1` and `playerCount:4` increments `heroCount` by 1; with `playerCount:3` it does not.
- Age of Ultron's modifier type is `conditional-add-hero` in the JSON.
- `npm run lint` and `npm test` pass.

---

### Story 105.2 — Restore Epic 104 partial rollbacks: Secret Invasion and Enslave Minds with the Chitauri Scepter

#### Secret Invasion of the Skrull Shapeshifters (`Core Set`)

**Current state:**
```json
"modifiers": [{ "type": "set-min-heroes", "value": 5 }],
"forcedGroups": [{ "category": "villains", "name": "Skrulls" }],
"notes": ["Force the Skrulls Villain Group and use at least 5 Heroes in the setup."]
```

**Card rule (from `special-schemes.md`):** "8 Twists. 6 Heroes. Skrull Villain Group required. Shuffle 12 random Heroes from the Hero Deck into the Villain Deck."

**Changes:**
1. Correct `set-min-heroes` value from `5` to `6`.
2. Add `{ "type": "add-hero", "amount": 1 }` to `modifiers` — representing the one extra Hero group (14 cards) whose random cards are shuffled into the Villain Deck. (The `add-hero` modifier increases `heroCount` to ensure that extra hero group is selected; the note records the shuffle-into-villain-deck semantics.)
3. Update `notes` to: `["Force the Skrulls Villain Group and use at least 6 Heroes in the setup.", "Shuffle 12 random Heroes from the Hero Deck into the Villain Deck."]`

> **Implementation note:** The `add-hero` modifier here semantically encodes "an additional Hero group is required for setup" — the generator selects it; physical setup then shuffles 12 of those cards into the Villain Deck. This matches the existing pattern for Marvel Zombies and X-Cutioner's Song.

#### Enslave Minds with the Chitauri Scepter (`Marvel Studios, Phase 1`)

**Current state:**
```json
"modifiers": [],
"forcedGroups": [{ "category": "villains", "name": "Chitauri" }],
"notes": ["Always include Chitauri Villain Group."]
```

**Card rule (from `special-schemes.md`):** "8 Twists. 6 Heroes. Chitauri Villain Group required. Shuffle 12 random Heroes from the Hero Deck into the Villain Deck."

**Changes:**
1. Add `{ "type": "set-min-heroes", "value": 6 }` to `modifiers`.
2. Add `{ "type": "add-hero", "amount": 1 }` to `modifiers`.
3. Update `notes` to: `["Always include Chitauri Villain Group.", "Use at least 6 Heroes in the setup.", "Shuffle 12 random Heroes from the Hero Deck into the Villain Deck."]`

**Acceptance criteria for both:**
- `set-min-heroes` has `value:6`; `add-hero` has `amount:1` for both schemes.
- Notes contain the stated strings.
- `npm run lint` and `npm test` pass.

---

### Story 105.3 — Add missing `add-villain-group` modifiers

The following schemes have "Add an extra Villain Group" (or equivalent) in their card rules but no corresponding `add-villain-group` modifier in `modifiers`. All names are as they appear in `rawCardData.schemes[].name`; the implementer must verify exact names against the JSON.

| Scheme (approximate name) | Source set | Amount | Notes |
|---|---|---|---|
| Fragmented Realities | ? | +1 | "Add an extra Villain Group." |
| Change the Outcome of WWII | ? | +1 | "Add an extra Villain Group." |
| Five Families of Crime | ? | +2 | "Add two extra Villain Groups." |
| Predict Future Crime | ? | +1 | "Add an extra Villain Group." |
| Provoke the Sovereign War Fleet | ? | +1 | "Add an extra Villain Group." |
| Smash Two Dimensions Together | ? | +1 | "Add an extra Villain Group." |
| Superhuman Baseball Game | ? | +1 | "Add an extra Villain Group." |
| Symbiotic Absorption | ? | +1 | "Add its 'Always Leads' Villains as an extra Villain Group." |
| War for the Dream Dimension | ? | +1 | "Add an extra Villain Group." |
| Earthquake Drains the Ocean | ? | +1 | "Add an extra Villain Group." |
| Deadlands Hordes Charge the Wall | ? | +1 | "Add an extra Villain Group." |
| Cursed Pages of the Darkhold Tome | ? | +1 | "Add an extra Villain Group." |

**Change per scheme:** Add `{ "type": "add-villain-group", "amount": N }` to `modifiers`. Ensure the existing `notes` entry reflects the rule; add a note if `notes` is currently empty.

> **Note on Ritual Sacrifice to Summon Chthon:** This scheme also adds an extra villain group ("Add Lilin as an extra Villain Group"), but it additionally requires Lilin as a forced group. It is handled separately in Story 105.6 because of the `forcedGroups` change.

**Acceptance criteria:**
- Each listed scheme has `add-villain-group` (with the correct `amount`) in `modifiers`.
- `npm run lint` and `npm test` pass.

---

### Story 105.4 — Add missing `add-henchman-group` modifiers

The following schemes require an extra henchman group but have no `add-henchman-group` modifier:

| Scheme (approximate name) | Source set | Notes |
|---|---|---|
| Alien Brood Encounters | X-Men | "Add 10 Brood as extra Henchmen. No Bystanders in Villain Deck." Also requires `set-bystanders: 0` (already present). Also needs `forcedGroups` entry for Brood. |
| Devolve with Xerogen Crystals | ? | "Add an extra Henchman Group of 10 cards as 'Xerogen Experiments.'" |
| Mutant-Hunting Super Sentinels | ? | "Include 10 Sentinels as extra Henchmen." Also needs `forcedGroups` entry for Sentinels henchman group. |
| Scavenge Alien Weaponry | ? | "Add an extra Henchmen Group of 10 cards as 'Smugglers.'" |
| Sire Vampires at the Blood Bank | ? | "Add an extra Henchman Group of 10 cards as 'Vampire Neonates.'" |

**Change per scheme:**
1. Add `{ "type": "add-henchman-group", "amount": 1 }` to `modifiers`.
2. Where a specific named henchman group is required (Brood for Alien Brood Encounters, Sentinels for Mutant-Hunting Super Sentinels), add a `forcedGroups` entry `{ "category": "henchmen", "name": "<exact-name-in-DB>" }`. Verify the exact henchman group name in `rawCardData.henchmanGroups` before adding.
3. Update `notes` to reflect all applied rules.

**Acceptance criteria:**
- Each scheme has `add-henchman-group` with `amount:1`.
- Alien Brood Encounters and Mutant-Hunting Super Sentinels have the correct `forcedGroups` entry.
- `npm run lint` and `npm test` pass.

---

### Story 105.5 — Add missing `add-hero` modifiers

The following schemes require an extra hero for setup (beyond the standard count) but have no `add-hero` modifier:

| Scheme (approximate name) | Source set | Amount | Card rule summary |
|---|---|---|---|
| The Contest of Champions | ? | +1 | "Add an extra Hero. Put 11 random cards from the Hero Deck face up in a Contest Row." |
| Wager at Blackjack for Heroes' Souls | ? | +2 | "Add two extra Heroes." |
| Befoul Earth into a Polluted Wasteland | ? | +1 | "Add an extra Hero." |
| Go After Heroes' Loved Ones | ? | +1 | "Add an extra Hero." |
| Ruin the Perfect Wedding | ? | +2 | "Set aside two extra Heroes to get married." |
| Secret Empire of Betrayal | ? | +1 | "Randomly pick 5 cards from an additional Hero." |
| Shoot Hulk into Space | ? | +1 | "Take 14 cards from an extra Hero with 'Hulk' in its Hero Name." Also needs `require-hero-name-match-count` (see Story 105.6). |
| Subjugate Earth with Mega-Corporations | ? | +1 | "Add an extra Hero." |
| The Mark of Khonshu | ? | +1 | "Add all fourteen cards for an extra Hero to the Villain Deck." |
| X-Cutioner's Song | ? | +1 | "Villain Deck includes 14 cards for an extra Hero and no Bystanders." Also needs `set-bystanders: 0`. |

**Change per scheme:** Add `{ "type": "add-hero", "amount": N }` to `modifiers`. Update `notes` accordingly.

> For X-Cutioner's Song: also add `{ "type": "set-bystanders", "value": 0 }` if not already present, since "no Bystanders" is also specified.

**Acceptance criteria:**
- Each scheme has `add-hero` with the stated `amount`.
- X-Cutioner's Song has `set-bystanders: 0`.
- `npm run lint` and `npm test` pass.

---

### Story 105.6 — Add missing `set-min-heroes` modifiers; `require-hero-name-match-count` additions

#### `set-min-heroes` — schemes with an explicit hero count in their card text

| Scheme (approximate name) | Hero count | Card rule excerpt |
|---|---|---|
| Reveal Heroes' Secret Identities | 7 | "6 Twists. 7 Heroes in Hero Deck." |
| Frame Heroes for Murder | 6 | "7 Twists. 6 Heroes." |
| Star-Lord's Awesome Mix Tape | 7 | "7 Twists. Use 7 Heroes…" |

**Change:** Add `{ "type": "set-min-heroes", "value": N }` to `modifiers`. Update `notes`.

> **House of M** also specifies a non-standard hero composition ("Hero Deck is 4 [one team] Heroes and [4 from another team]"). The OCR extraction is incomplete. The implementer should verify the exact hero-count rule from the physical card before adding a `set-min-heroes` modifier; if the full rule can be confirmed, add the appropriate modifier; otherwise leave as `notes` only with a TODO comment.

#### `require-hero-name-match-count` — schemes requiring a hero by name

| Scheme (approximate name) | Pattern | Count | Card rule excerpt |
|---|---|---|---|
| Condition Logan into Weapon X | `wolverine\|logan` (case-insensitive) | 1 | "Include exactly 1 Hero with Wolverine or Logan in its name." |
| Shoot Hulk into Space (already has `add-hero` from Story 105.5) | `hulk` | 1 | "Take 14 cards from an extra Hero with 'Hulk' in its Hero Name." |

**Change:** Add `{ "type": "require-hero-name-match-count", "pattern": "<pattern>", "value": N }` to `modifiers`. Update `notes`.

**Acceptance criteria:**
- Each listed scheme has the correct `set-min-heroes` or `require-hero-name-match-count` modifier.
- `npm run lint` and `npm test` pass.

---

### Story 105.7 — Add missing `forcedGroups` entries

The following schemes require a specific group but have no (or incomplete) `forcedGroups`:

| Scheme (approximate name) | Source set | Forced group | Category | Notes |
|---|---|---|---|---|
| The Dark Phoenix Saga | ? | Hellfire Club | villains | "Include Hellfire Club as one of the Villain Groups." |
| The Kree-Skrull War | ? | Kree Starforce | villains | "Always include Kree Starforce and Skrull Villain Groups." |
| The Kree-Skrull War | ? | Skrull | villains | Same card rule — requires both groups. |
| Ritual Sacrifice to Summon Chthon | ? | Lilin | villains | "Add Lilin as an extra Villain Group." Also needs `add-villain-group: 1` (Story 105.3). |
| The Mark of Khonshu | ? | Khonshu Guardians | henchmen | "Always include Khonshu Guardians." |

Implementer must verify exact group names in `rawCardData.villainGroups` and `rawCardData.henchmanGroups` before adding.

**Additional — The Dark Phoenix Saga also needs `add-hero`:**
Card text: "Add 14 Jean Grey Hero cards to the Villain Deck." This requires `add-hero: 1` (one extra Hero — Jean Grey; the generator selects her; setup shuffles 14 of her cards into the Villain Deck). Add `{ "type": "add-hero", "amount": 1 }` alongside the `forcedGroups` entry.

**Change per scheme:** Add the `forcedGroups` entries listed above. Update `notes`.

**Acceptance criteria:**
- Each listed scheme has the specified `forcedGroups` entry.
- The Dark Phoenix Saga has `add-hero: 1`.
- `npm run lint` and `npm test` pass.

---

### Story 105.8 — Data validation and documentation update

1. After all edits in Stories 105.1–105.7, run the data integrity tests in `src/data/canonical-game-data.test.ts` and confirm they pass.
2. Run `npm run lint` and verify zero new lint errors.
3. Update `documentation/data/data-model.md`:
   - Add `conditional-add-hero` to the known modifier types table.
   - Update the "Not yet implemented" note if any previously-noted unimplemented types are now implemented.

**Acceptance criteria:**
- All tests in `src/data/canonical-game-data.test.ts` pass.
- `npm run lint` produces zero errors.
- `documentation/data/data-model.md` documents `conditional-add-hero`.

---

## Out of scope
- Notes-only cleanup for schemes with no modifier impact (covered by Epic 106).
- Adding a dedicated `numTwists` machine-readable field (no current feature uses it).
- UI changes to display scheme rules in the setup result.
- Schemes not present in `documentation/my-inputs/special-schemes.md`.
- The `Super Hero Civil War [Core Set]` (non-MCU) hero-count modifier — the MCU Phase 1 version already has `conditional-set-min-heroes:4 for [2]` from Epic 104; verify whether the Core Set version also requires it.

## Acceptance Criteria (Epic Level)
- All modifier-type changes in `setup-scheme-modifiers.ts` are covered by unit tests.
- Every scheme listed in the stories above has its modifiers and `forcedGroups` corrected.
- `npm run lint` and `npm test` pass cleanly.
- `documentation/data/data-model.md` is up to date.
