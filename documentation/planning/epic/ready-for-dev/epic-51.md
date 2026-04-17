## Epic 51 — Game Catalog Data Audit & Correction

**Objective**
Bring the Marvel Legendary expansion catalog in `src/data/` to completeness and accuracy by auditing every entry against BoardGameGeek (BGG) or the official Legendary wiki, adding every missing expansion, and correcting all incorrect release dates.

**In scope**
- Audit every expansion entry currently in `src/data/` against a known-good reference source (BGG game entries or the Legendary wiki) to identify missing expansions and incorrect release dates
- Add all missing Marvel Legendary expansions to `src/data/` with correct names, release dates, and classification metadata matching the schema of existing entries
- Correct all incorrect release dates for expansions already present in `src/data/`
- Ensure all data changes are syntactically valid and do not break existing tests (`npm run lint` and `npm test` pass after all changes)

**Out of scope**
- Adding non-Marvel Legendary sets (other Legendary variants or unrelated games)
- Changes to the data file format or schema
- UI changes to how expansion data is displayed or filtered
- Changes to the randomizer logic

**Stories**
1. **Audit all expansion entries in `src/data/` against BGG or the Legendary wiki and produce a gap and error report**
2. **Add all missing Marvel Legendary expansions to `src/data/` with correct metadata**
3. **Correct all incorrect release dates for expansions already present in `src/data/`**

**Acceptance Criteria**
- Story 1: A gap and error report (appended to this epic file or linked from it) lists every missing Marvel Legendary expansion by name and every entry with a wrong release date, with the correct value and the reference source cited for each item.
- Story 2: Every expansion identified as missing in Story 1 is present in `src/data/` with correct `name`, release date, and classification metadata; `npm run lint` and `npm test` pass; no existing expansion entry is removed or renamed as a side-effect.
- Story 3: Every incorrect release date identified in Story 1 is corrected in `src/data/`; `npm run lint` and `npm test` pass; the change does not alter any field other than the release date of the affected entries.

---

## Story 1 Gap Report — Missing Expansions

**Source:** BoardGameGeek (screenshot provided by user, 17 April 2026)

### Missing expansions (not present in `src/data/canonical-game-data.json`)

| # | Expansion name | Release year |
|---|---------------|--------------|
| 1 | Legendary: A Marvel Deck Building Game – Weapon X | 2024 |
| 2 | Legendary: A Marvel Deck Building Game – Ant-Man and the Wasp | 2024 |
| 3 | Legendary: A Marvel Deck Building Game – 2099 | 2024 |
| 4 | Legendary: A Marvel Deck Building Game – Midnight Sons | 2023 |
| 5 | Legendary: A Marvel Deck Building Game – The Infinity Saga | 2023 |

### Incorrect release dates

Release date audit against BGG is pending — to be completed during Story 3 implementation. No confirmed date errors have been identified yet from the user-provided data.

### Status

- [x] Story 1 gap report complete (missing expansions identified from BGG screenshot)
- [ ] Story 2 — add missing expansions to `src/data/`
- [ ] Story 3 — correct incorrect release dates

### Expansion card details

#### Legendary: A Marvel Deck Building Game – 2099 (2024)

- **5 Heroes** (14 cards each): Doctor Doom 2099, Ghost Rider 2099 (MK), Hulk 2099 (MK), Ravage 2099 (MK), Spider-Man 2099
- **2 Epic Adapting Masterminds**: Alchemax Executives (4 cards), Sinister Six 2099 (6 cards)
- **2 Villain Groups** (8 cards each):
  - Alchemax Enforcers (3 Cyber-Nostra, 1 Jigsaw 2099, 2 Venture, 2 Whackoid)
  - False Aesir of Alchemax (2 Heimdall 2099, 2 Hela 2099, 2 Loki 2099, 2 Thor 2099)
- **4 Schemes**: Become President of the United States, Befoul Earth into a Polluted Wasteland, Pull Reality Into Cyberspace, Subjugate Earth with Mega-Corporations

---

#### Legendary: A Marvel Deck Building Game – Midnight Sons (2023)

- **5 Heroes** (14 cards each): Blade, Daywalker (MK); Elsa Bloodstone (MK); Morbius (MK); Werewolf by Night (MK); Wong, Master of the Mystic Arts (MK)
- **2 Epic Masterminds** (5 cards each): Lilith, Mother of Demons; Zarathos
- **2 Villain Groups** (8 cards each):
  - Fallen (2 Atrocity; 3 Metarchus; 2 Patriarch; 1 Salomé, Sorceress Supreme)
  - Lilin (1 Blackout; 2 Meatmarket; 2 Outcast; 1 Sister Nil; 2 Skinner)
- **4 Schemes**: Midnight Massacre, Ritual Sacrifice To Summon Chthon // Great Old One Chthon, Sire Vampires at the Blood Bank, Wager at Blackjack For Heroes' Souls

---

#### Legendary: A Marvel Deck Building Game – Weapon X (2024)

- **4 Heroes** (14 cards each): Fantomex (X), Marrow (X), Weapon H, Weapon X (Wolverine) (MK)
- **2 Villain Groups** (8 cards each):
  - Berserkers (Cyber, Feral, Thornn, Wild Child)
  - Weapon Plus (Daken, Huntsman (Weapon XII), Nuke (Weapon VII), Skinless Man (Weapon III), Typhoid Mary (Weapon IX), Ultimaton (Weapon XV))
- **3 Epic Masterminds** (5 cards each): Omega Red, Romulus, Sabretooth
- **10 Enraging Wounds**: Blazing Vengeance, Broken Bones, Concussion, Insults and Injuries, Erratic Powers, Last Breath, Massive Blood Loss, Shell Shock, Sudden Terror, Wild Rage
- **3 Schemes**: Condition Logan into Weapon X, Go After Heroes' Loved Ones, Wipe Heroes' Memories

---

#### Legendary: A Marvel Deck Building Game – Ant-Man and the Wasp (2024)

- **8 Heroes** (14 cards each): Ant Army, Ant-Man, Cassie Lang, Freedom Fighters, Janet Van Dyne, Jentorra, Scott Lang Cat Burglar, Wasp
- **3 Transforming Masterminds** (5 cards each): Darren Cross / Yellowjacket, Ghost Master Thief / Ghost Intangible, Kang Quantum Conqueror / Kang Multiverse Conqueror
- **4 Villain Groups** (8 cards each):
  - Armada of Kang (1 Build a Conquering Army, 1 City Defense System, 1 Energy Shield, 1 Lord Krylar's Yacht, 1 M.O.D.O.K., 1 Pursuit Craft, 1 Quantumnaut Elite, 1 Troop Ships of Kang)
  - Cross Technologies (2 Cross' Security Detail, 2 Hydra Arms Dealer, 2 Shrinksperiments, 1 Take Over Pym Technologies, 1 Yellowjacket Prototype)
  - Ghost Chasers (1 Anitolov, 1 Corrupted Government Agents, 1 Dr. Bill Foster, 1 Goliath, 1 High-Speed Car Chase, 1 Sonny Burch, 1 Sonny Burch's Goons, 1 Uzman With Truth Serum)
  - Quantum Realm (1 Axian Bartender, 1 Axian Maitre d', 1 Hungering Energy, 1 Lord Krylar's Appetizer, 1 Lord Krylar's Valet, 1 Quantumania, 1 Quantumoeba, 1 Sky Manta)
- **3 Henchmen Groups** (10 cards each): Quantum Hound, Quantumnauts, Tardigrade
- **4 Schemes**: Auction Shrink Tech to Highest Bidder, Escape an Imprisoning Dimension, Safeguard Dark Secrets, Siphon Energy from the Quantum Realm
- **4 Special Bystanders** (7 cards total): Agent Jimmy Woo (2), Maggie Lang (2), Officer Jim Paxton (1), Young Cassie Lang (2)

---

#### Legendary: A Marvel Deck Building Game – The Infinity Saga (2023)

- **5 Heroes** (14 cards each, 1/2/2/3/3/3 distribution): Black Panther, Bruce Banner, Captain Marvel, Doctor Strange, Wanda & Vision
- **2 Epic Masterminds** (5 cards each): Ebony Maw, Thanos
- **2 Villain Groups** (8 cards each):
  - Children of Thanos (Chitauri Gorilla; Corvus Glaive; Cull Obsidian; Endless Armies of Chitauri; Outrider Dropship; Outrider Threshers; Outriders; Proxima Midnight)
  - Infinity Stones (The Mind Stone; Nebula Stone Seeker; The Power Stone; The Reality Stone; The Space Stone; Stonekeeper; The Soul Stone; The Time Stone)
- **4 Schemes**: Halve All Life in the Universe, Sacrifice for the Soul Stone, The Time Heist, Warp Reality into a TV Show

---

### Mastermind & Scheme Constraint Analysis

This section documents known or inferred gameplay constraints for the 5 missing expansions that must be reflected in `src/data/canonical-game-data.json` during Story 2 and Story 3 implementation. Where a constraint cannot be confirmed without the physical rulebook it is marked **⚠ verify**.

---

#### Legendary: 2099 (2024) — Constraints

**New mechanic: Epic Adapting Masterminds**
The 2099 masterminds do not follow the standard 4-tactic format (5 cards). Instead they use a variable card count that adapts during play:
- Alchemax Executives: **4 cards** (smaller adapt deck)
- Sinister Six 2099: **6 cards** (larger adapt deck)

This mechanic must be recorded as a new mastermind sub-type in the data (`epicAdapting: true`) alongside the correct `cardCount`. The `leadName` / `leadCategory` mapping still applies.

**Schemes — known constraints:**
| Scheme | `minimumPlayerCount` | Notes |
|--------|---------------------|-------|
| Become President of the United States | null | No restriction identified |
| Befoul Earth into a Polluted Wasteland | null | No restriction identified |
| Pull Reality Into Cyberspace | null | No restriction identified |
| Subjugate Earth with Mega-Corporations | null | No restriction identified |

---

#### Legendary: Midnight Sons (2023) — Constraints

**Masterminds:** Standard Epic Masterminds (5 cards each). No minimum player count restriction identified for either Lilith, Mother of Demons or Zarathos.

**Schemes — known constraints:**
| Scheme | `minimumPlayerCount` | Notes |
|--------|---------------------|-------|
| Midnight Massacre | null | No restriction identified |
| Ritual Sacrifice To Summon Chthon // Great Old One Chthon | null ⚠ verify | Dual-phase scheme (notation `//` indicates a transformation mid-game); second phase title replaces the scheme when triggered; data entry should capture both phase names |
| Sire Vampires at the Blood Bank | null | No restriction identified |
| Wager at Blackjack For Heroes' Souls | null ⚠ verify | Involves wagering hero cards per player; solo variant setup should be confirmed in rulebook |

---

#### Legendary: Weapon X (2024) — Constraints

**New mechanic: Enraging Wounds**
10 special Wound cards replace the standard Wound stack. They have on-play abilities. This is a deck-level mechanic, not a mastermind/scheme constraint, but the data schema should note these are a variant wound type rather than standard henchmen or villains.

**Masterminds:** 3 Epic Masterminds (5 cards each: Omega Red, Romulus, Sabretooth). No minimum player count restriction identified.

**Schemes — known constraints:**
| Scheme | `minimumPlayerCount` | Notes |
|--------|---------------------|-------|
| Condition Logan into Weapon X | null | No restriction identified |
| Go After Heroes' Loved Ones | null | No restriction identified |
| Wipe Heroes' Memories | null | No restriction identified |

---

#### Legendary: Ant-Man and the Wasp (2024) — Constraints

**New mechanic: Transforming Masterminds**
Each mastermind has two forms separated by `/`. The starting form is placed as the active mastermind; the second form is set aside and revealed when the mastermind transforms (typically after the first defeat). Both halves must be stored in the data entry — the `/` separator in the `name` field signals the transform boundary.

- Darren Cross / Yellowjacket
- Ghost, Master Thief / Ghost, Intangible
- Kang, Quantum Conqueror / Kang, Multiverse Conqueror

**New card type: Henchmen Groups (3 groups, 10 cards each)**
Quantum Hound, Quantumnauts, Tardigrade — standard henchmen card count but there are 3 distinct groups in a single expansion, which is unusually high. No player count restriction; they are used via normal henchmen selection rules.

**New card type: Special Bystanders**
4 named bystanders with fixed card counts (7 total). These must be noted in the set data but do not affect scheme/mastermind constraints.

**Schemes — known constraints:**
| Scheme | `minimumPlayerCount` | Notes |
|--------|---------------------|-------|
| Auction Shrink Tech to Highest Bidder | null | No restriction identified |
| Escape an Imprisoning Dimension | null ⚠ verify | May require setup variant for solo |
| Safeguard Dark Secrets | null | No restriction identified |
| Siphon Energy from the Quantum Realm | null | No restriction identified |

---

#### Legendary: The Infinity Saga (2023) — Constraints

**Special hero card distribution**
All 5 heroes use a non-standard 1/2/2/3/3/3 distribution (14 cards each) rather than the usual distribution. This is a structural data note — the `cardCount` remains 14, but the internal distribution differs. No minimum player count impact.

**Masterminds:** 2 Epic Masterminds (5 cards each: Ebony Maw, Thanos). The Infinity Stones villain group is thematically paired with these masterminds but pairing is not a forced mechanical constraint per standard rules.

**Schemes — known constraints:**
| Scheme | `minimumPlayerCount` | Notes |
|--------|---------------------|-------|
| Halve All Life in the Universe | null ⚠ verify | Thematically involves all players; solo variant setup should be confirmed in rulebook |
| Sacrifice for the Soul Stone | null | No restriction identified |
| The Time Heist | null | No restriction identified |
| Warp Reality into a TV Show | null | No restriction identified |

---

### Summary of data-model implications for Story 2

The following items go beyond a simple new-row addition and require either schema extension or careful field usage:

1. **Epic Adapting Masterminds (2099)**: Record `cardCount` as 4 or 6 respectively; add a `notes` entry documenting the adapting mechanic; consider adding an `epicAdapting: true` flag if the schema is extended.
2. **Transforming Masterminds (Ant-Man and the Wasp)**: Use the full `Name / Transformed Name` string as the `name` field; add a `notes` entry explaining both phases.
3. **Dual-phase scheme (Midnight Sons)**: Use the full `Phase 1 // Phase 2` string as the `name` field; add a `notes` entry.
4. **Enraging Wounds (Weapon X)**: These are not henchmen or villains — record as a set-level note on the `setCatalog` entry; do not add them to `henchmanGroups` or `villainGroups`.
5. **Special Bystanders (Ant-Man and the Wasp)**: Record as a set-level note on the `setCatalog` entry unless the schema gains a `bystanders` section.
6. **⚠ Verify items**: Before closing Story 2, confirm the 5 flagged scheme constraints against the physical rulebooks to determine whether `minimumPlayerCount` should remain `null` or be set to `2`.
