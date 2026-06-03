# Epic 105 Task List — Scheme Rules Alignment: Machine-Readable Modifiers and Forced Groups

## Story 105.1 — Introduce `conditional-add-hero` modifier type; fix Age of Ultron

- [x] In `src/app/setup-scheme-modifiers.ts`, add a `conditional-add-hero` case to the `applyModifier` switch that increments `requirements.heroCount` by `modifier.amount` when `modifier.playerCounts` includes the current `playerCount`
- [x] In `src/data/canonical-game-data.json`, change Age of Ultron's modifier type from `conditional-add-villain-group` to `conditional-add-hero` (keep `playerCounts:[4,5]` and `amount:1` unchanged)
- [x] In `documentation/data/data-model.md`, add `conditional-add-hero` to the known modifier types table
- [x] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 105.2 — Restore Epic 104 partial rollbacks: Secret Invasion and Enslave Minds with the Chitauri Scepter

- [x] In `src/data/canonical-game-data.json`, correct Secret Invasion of the Skrull Shapeshifters' `set-min-heroes` value from `5` to `6`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to Secret Invasion of the Skrull Shapeshifters' `modifiers` array
- [x] In `src/data/canonical-game-data.json`, update Secret Invasion of the Skrull Shapeshifters' `notes` to `["Force the Skrulls Villain Group and use at least 6 Heroes in the setup.", "Shuffle 12 random Heroes from the Hero Deck into the Villain Deck."]`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "set-min-heroes", "value": 6 }` to Enslave Minds with the Chitauri Scepter's `modifiers` array
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to Enslave Minds with the Chitauri Scepter's `modifiers` array
- [x] In `src/data/canonical-game-data.json`, update Enslave Minds with the Chitauri Scepter's `notes` to `["Always include Chitauri Villain Group.", "Use at least 6 Heroes in the setup.", "Shuffle 12 random Heroes from the Hero Deck into the Villain Deck."]`
- [x] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 105.3 — Add missing `add-villain-group` modifiers

- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Fragmented Realities' `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Change the Outcome of WWII's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 2 }` to Five Families of Crime's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Predict Future Crime's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Provoke the Sovereign War Fleet's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Smash Two Dimensions Together's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Superhuman Baseball Game's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Symbiotic Absorption's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to War for the Dream Dimension's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Earthquake Drains the Ocean's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Deadlands Hordes Charge the Wall's `modifiers`; add a `notes` entry if currently empty
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-villain-group", "amount": 1 }` to Cursed Pages of the Darkhold Tome's `modifiers`; add a `notes` entry if currently empty
- [x] Verify exact scheme names in `rawCardData.schemes` against the approximate names above before committing any edit
- [x] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 105.4 — Add missing `add-henchman-group` modifiers

- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-henchman-group", "amount": 1 }` to Alien Brood Encounters' `modifiers`
- [x] In `src/data/canonical-game-data.json`, verify the exact henchman group name for Brood in `rawCardData.henchmanGroups`, then add `{ "category": "henchmen", "name": "<exact-name>" }` to Alien Brood Encounters' `forcedGroups`
- [x] In `src/data/canonical-game-data.json`, update Alien Brood Encounters' `notes` to reflect all applied rules
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-henchman-group", "amount": 1 }` to Devolve with Xerogen Crystals' `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-henchman-group", "amount": 1 }` to Mutant-Hunting Super Sentinels' `modifiers`
- [x] In `src/data/canonical-game-data.json`, verify the exact henchman group name for Sentinels in `rawCardData.henchmanGroups`, then add `{ "category": "henchmen", "name": "<exact-name>" }` to Mutant-Hunting Super Sentinels' `forcedGroups`
- [x] In `src/data/canonical-game-data.json`, update Mutant-Hunting Super Sentinels' `notes` to reflect all applied rules
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-henchman-group", "amount": 1 }` to Scavenge Alien Weaponry's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-henchman-group", "amount": 1 }` to Sire Vampires at the Blood Bank's `modifiers`; update `notes`
- [x] Verify exact scheme names in `rawCardData.schemes` against the approximate names above before committing any edit
- [x] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 105.5 — Add missing `add-hero` modifiers

- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to The Contest of Champions' `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 2 }` to Wager at Blackjack for Heroes' Souls' `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to Befoul Earth into a Polluted Wasteland's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to Go After Heroes' Loved Ones' `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 2 }` to Ruin the Perfect Wedding's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to Secret Empire of Betrayal's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to Shoot Hulk into Space's `modifiers`; update `notes` (the `require-hero-name-match-count` modifier is added in Story 105.6)
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to Subjugate Earth with Mega-Corporations' `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to The Mark of Khonshu's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to X-Cutioner's Song's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "set-bystanders", "value": 0 }` to X-Cutioner's Song's `modifiers` if not already present
- [x] Verify exact scheme names in `rawCardData.schemes` against the approximate names above before committing any edit
- [x] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 105.6 — Add missing `set-min-heroes` modifiers; `require-hero-name-match-count` additions

- [x] In `src/data/canonical-game-data.json`, add `{ "type": "set-min-heroes", "value": 7 }` to Reveal Heroes' Secret Identities' `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "set-min-heroes", "value": 6 }` to Frame Heroes for Murder's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "set-min-heroes", "value": 7 }` to Star-Lord's Awesome Mix Tape's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, verify the exact hero-count rule for House of M from the physical card; if the full rule can be confirmed add the appropriate `set-min-heroes` modifier, otherwise leave as `notes` only with a `TODO` comment
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "require-hero-name-match-count", "pattern": "wolverine|logan", "value": 1 }` to Condition Logan into Weapon X's `modifiers`; update `notes`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "require-hero-name-match-count", "pattern": "hulk", "value": 1 }` to Shoot Hulk into Space's `modifiers`; update `notes`
- [x] Verify exact scheme names in `rawCardData.schemes` against the approximate names above before committing any edit
- [x] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 105.7 — Add missing `forcedGroups` entries

- [x] In `src/data/canonical-game-data.json`, verify the exact villain group name for Hellfire Club in `rawCardData.villainGroups`, then add `{ "category": "villains", "name": "<exact-name>" }` to The Dark Phoenix Saga's `forcedGroups`
- [x] In `src/data/canonical-game-data.json`, add `{ "type": "add-hero", "amount": 1 }` to The Dark Phoenix Saga's `modifiers` (for the 14 Jean Grey cards shuffled into the Villain Deck); update `notes`
- [x] In `src/data/canonical-game-data.json`, verify the exact villain group names for Kree Starforce and Skrull in `rawCardData.villainGroups`, then add both `forcedGroups` entries to The Kree-Skrull War; update `notes`
- [x] In `src/data/canonical-game-data.json`, verify the exact villain group name for Lilin in `rawCardData.villainGroups`, then add `{ "category": "villains", "name": "<exact-name>" }` to Ritual Sacrifice to Summon Chthon's `forcedGroups`; also add `{ "type": "add-villain-group", "amount": 1 }` to its `modifiers` (coordinates with Story 105.3); update `notes`
- [x] In `src/data/canonical-game-data.json`, verify the exact henchman group name for Khonshu Guardians in `rawCardData.henchmanGroups`, then add `{ "category": "henchmen", "name": "<exact-name>" }` to The Mark of Khonshu's `forcedGroups`; update `notes`
- [x] Verify exact scheme names in `rawCardData.schemes` against the approximate names above before committing any edit
- [x] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 105.8 — Data validation and documentation update

- [x] Run all tests in `src/data/canonical-game-data.test.ts` and confirm they pass after all edits in Stories 105.1–105.7
- [x] Run `npm run lint` and verify zero new lint errors
- [x] In `documentation/data/data-model.md`, add `conditional-add-hero` to the known modifier types table (if not already added in Story 105.1)
- [x] In `documentation/data/data-model.md`, update any "Not yet implemented" notes for modifier types that are now implemented
- [x] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story
