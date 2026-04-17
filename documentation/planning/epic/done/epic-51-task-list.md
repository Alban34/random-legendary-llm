# Epic 51 Task List — Game Catalog Data Audit & Correction

All edits target `src/data/canonical-game-data.json`.

**Schema reference (verified from file):**
- `setCatalog[]` → `name` (string), `year` (int), `type` ("base" | "small-expansion" | "large-expansion"), `aliases` (string[])
- `rawCardData.heroes[]` → `name`, `setName`, `aliases`, `teams` (string[]), `cardCount` (int)
- `rawCardData.masterminds[]` → `name`, `setName`, `aliases`, `leadName` (string | null), `leadCategory` ("villains" | "henchmen" | null), `notes` (string[])
- `rawCardData.villainGroups[]` → `name`, `setName`, `aliases`, `cardCount` (int)
- `rawCardData.henchmanGroups[]` → `name`, `setName`, `aliases`, `cardCount` (int)
- `rawCardData.schemes[]` → `name`, `setName`, `aliases`, `constraints: { minimumPlayerCount }`, `forcedGroups` (array), `modifiers` (array), `notes` (string[])

---

## Story 1 — Audit and gap report

- [x] Audit all existing `setCatalog` expansion entries against BGG and the Legendary wiki.
- [x] Identify all Marvel Legendary expansions missing from `rawCardData` and `setCatalog`.
- [x] Record card details (heroes, masterminds, villain groups, henchman groups, schemes) for each missing expansion.
- [x] Identify all `year` values in `setCatalog` that differ from the BGG first-release date (audit flagged as pending; to be completed in Story 3).
- [x] Produce the gap report — embedded in the epic file (`documentation/planning/epics.md`, Epic 51 section).

---

## Story 2 — Add missing expansions

> Insert all new `setCatalog` entries in ascending chronological order within their year group.  
> Insert all new `rawCardData.*` entries in alphabetical order by `name` within each array.  
> Use the short subtitle as `name` (e.g. `"Midnight Sons"`, not the full "Legendary: A Marvel Deck Building Game – Midnight Sons" prefix).

---

### Midnight Sons (2023)

- [x] **Task 2.1 — setCatalog entry**: Add the following object to `setCatalog` after the last 2022-year entry and before any 2024 entries:
  ```json
  { "name": "Midnight Sons", "year": 2023, "type": "small-expansion", "aliases": [] }
  ```

- [x] **Task 2.2 — heroes**: Add 5 entries to `rawCardData.heroes`, each with `"setName": "Midnight Sons"`, `"aliases": []`, `"cardCount": 14`, and `"teams": ["Marvel Knights"]`:
  - `"name": "Blade, Daywalker"`
  - `"name": "Elsa Bloodstone"`
  - `"name": "Morbius"`
  - `"name": "Werewolf by Night"`
  - `"name": "Wong, Master of the Mystic Arts"`

- [x] **Task 2.3 — masterminds**: Add 2 entries to `rawCardData.masterminds` with `"setName": "Midnight Sons"`, `"aliases": []`, `"leadCategory": "villains"`, `"notes": ["Epic Mastermind."]`. Cross-reference BGG to confirm the correct `leadName` for each:
  - `"name": "Lilith, Mother of Demons"` — expected `leadName`: `"Lilin"`
  - `"name": "Zarathos"` — expected `leadName`: `"Fallen"`

- [x] **Task 2.4 — villainGroups**: Add 2 entries to `rawCardData.villainGroups` with `"setName": "Midnight Sons"`, `"aliases": []`, `"cardCount": 8`:
  - `"name": "Fallen"`
  - `"name": "Lilin"`

- [x] **Task 2.5 — schemes**: Add 4 entries to `rawCardData.schemes` with `"setName": "Midnight Sons"`, `"aliases": []`, `"constraints": { "minimumPlayerCount": null }`, `"forcedGroups": []`, `"modifiers": []`, `"notes": []`. The dual-phase scheme name must include both phase names separated by ` // `:
  - `"name": "Midnight Massacre"`
  - `"name": "Ritual Sacrifice To Summon Chthon // Great Old One Chthon"`
  - `"name": "Sire Vampires at the Blood Bank"`
  - `"name": "Wager at Blackjack For Heroes' Souls"`

---

### The Infinity Saga (2023)

- [x] **Task 2.6 — setCatalog entry**: Add the following object to `setCatalog` (2023, after Midnight Sons):
  ```json
  { "name": "The Infinity Saga", "year": 2023, "type": "small-expansion", "aliases": [] }
  ```

- [x] **Task 2.7 — heroes**: Add 5 entries to `rawCardData.heroes` with `"setName": "The Infinity Saga"`, `"aliases": []`, `"cardCount": 14`. Verify `teams` values against BGG; add `"notes": ["Non-standard card distribution: 1/2/2/3/3/3."]` to each entry to document the deck composition:
  - `"name": "Black Panther"` — verify `teams`
  - `"name": "Bruce Banner"` — verify `teams`
  - `"name": "Captain Marvel"` — verify `teams`
  - `"name": "Doctor Strange"` — verify `teams`
  - `"name": "Wanda & Vision"` — verify `teams`

- [x] **Task 2.8 — masterminds**: Add 2 entries to `rawCardData.masterminds` with `"setName": "The Infinity Saga"`, `"aliases": []`, `"leadCategory": "villains"`, `"notes": ["Epic Mastermind."]`. Cross-reference BGG to confirm `leadName`:
  - `"name": "Ebony Maw"` — expected `leadName`: `"Children of Thanos"`
  - `"name": "Thanos"` — expected `leadName`: `"Infinity Stones"`

- [x] **Task 2.9 — villainGroups**: Add 2 entries to `rawCardData.villainGroups` with `"setName": "The Infinity Saga"`, `"aliases": []`, `"cardCount": 8`:
  - `"name": "Children of Thanos"`
  - `"name": "Infinity Stones"`

- [x] **Task 2.10 — schemes**: Add 4 entries to `rawCardData.schemes` with `"setName": "The Infinity Saga"`, `"aliases": []`, `"constraints": { "minimumPlayerCount": null }`, `"forcedGroups": []`, `"modifiers": []`, `"notes": []`:
  - `"name": "Halve All Life in the Universe"`
  - `"name": "Sacrifice for the Soul Stone"`
  - `"name": "The Time Heist"`
  - `"name": "Warp Reality into a TV Show"`

---

### Weapon X (2024)

- [x] **Task 2.11 — setCatalog entry**: Add the following object to `setCatalog` (2024 group):
  ```json
  { "name": "Weapon X", "year": 2024, "type": "small-expansion", "aliases": [] }
  ```

- [x] **Task 2.12 — heroes**: Add 4 entries to `rawCardData.heroes` with `"setName": "Weapon X"`, `"aliases": []`, `"cardCount": 14`. Verify `teams` for each against BGG; expected values shown for entries noted in the spec:
  - `"name": "Fantomex"` — expected `teams`: `["X-Men"]`
  - `"name": "Marrow"` — expected `teams`: `["X-Men"]`
  - `"name": "Weapon H"` — verify `teams`
  - `"name": "Weapon X (Wolverine)"` — expected `teams`: `["Marvel Knights"]` — verify against BGG

- [x] **Task 2.13 — masterminds**: Add 3 entries to `rawCardData.masterminds` with `"setName": "Weapon X"`, `"aliases": []`, `"leadCategory": "villains"`, `"notes": ["Epic Mastermind.", "Expansion includes 10 Enraging Wounds (special wound variant)."]`. Cross-reference BGG to confirm each `leadName`:
  - `"name": "Omega Red"` — verify `leadName`
  - `"name": "Romulus"` — verify `leadName`
  - `"name": "Sabretooth"` — verify `leadName`

- [x] **Task 2.14 — villainGroups**: Add 2 entries to `rawCardData.villainGroups` with `"setName": "Weapon X"`, `"aliases": []`, `"cardCount": 8`:
  - `"name": "Berserkers"`
  - `"name": "Weapon Plus"`

- [x] **Task 2.15 — schemes**: Add 3 entries to `rawCardData.schemes` with `"setName": "Weapon X"`, `"aliases": []`, `"constraints": { "minimumPlayerCount": null }`, `"forcedGroups": []`, `"modifiers": []`, `"notes": []`:
  - `"name": "Condition Logan into Weapon X"`
  - `"name": "Go After Heroes' Loved Ones"`
  - `"name": "Wipe Heroes' Memories"`

---

### 2099 (2024)

- [x] **Task 2.16 — setCatalog entry**: Add the following object to `setCatalog` (2024 group):
  ```json
  { "name": "2099", "year": 2024, "type": "small-expansion", "aliases": [] }
  ```

- [x] **Task 2.17 — heroes**: Add 5 entries to `rawCardData.heroes` with `"setName": "2099"`, `"aliases": []`, `"cardCount": 14`. Verify `teams` for each against BGG; expected team for spec-noted entries:
  - `"name": "Doctor Doom 2099"` — verify `teams`
  - `"name": "Ghost Rider 2099"` — expected `teams`: `["Marvel Knights"]`
  - `"name": "Hulk 2099"` — expected `teams`: `["Marvel Knights"]`
  - `"name": "Ravage 2099"` — expected `teams`: `["Marvel Knights"]`
  - `"name": "Spider-Man 2099"` — verify `teams`

- [x] **Task 2.18 — masterminds**: Add 2 entries to `rawCardData.masterminds` with `"setName": "2099"`, `"aliases": []`, `"leadCategory": "villains"`. These are Epic Adapting Masterminds with non-standard card counts; capture this in `notes` and confirm `leadName` values against BGG:
  - `"name": "Alchemax Executives"` — expected `leadName`: `"Alchemax Enforcers"`, `"notes": ["Epic Adapting Mastermind. Card count: 4."]`
  - `"name": "Sinister Six 2099"` — expected `leadName`: `"False Aesir of Alchemax"`, `"notes": ["Epic Adapting Mastermind. Card count: 6."]`

- [x] **Task 2.19 — villainGroups**: Add 2 entries to `rawCardData.villainGroups` with `"setName": "2099"`, `"aliases": []`, `"cardCount": 8`:
  - `"name": "Alchemax Enforcers"`
  - `"name": "False Aesir of Alchemax"`

- [x] **Task 2.20 — schemes**: Add 4 entries to `rawCardData.schemes` with `"setName": "2099"`, `"aliases": []`, `"constraints": { "minimumPlayerCount": null }`, `"forcedGroups": []`, `"modifiers": []`, `"notes": []`:
  - `"name": "Become President of the United States"`
  - `"name": "Befoul Earth into a Polluted Wasteland"`
  - `"name": "Pull Reality Into Cyberspace"`
  - `"name": "Subjugate Earth with Mega-Corporations"`

---

### Ant-Man and the Wasp (2024)

- [x] **Task 2.21 — setCatalog entry**: Add the following object to `setCatalog` (2024 group). Verify `type` against BGG — the content volume (8 heroes, 3 masterminds, 4 villain groups, 3 henchman groups) may qualify this as `"large-expansion"`:
  ```json
  { "name": "Ant-Man and the Wasp", "year": 2024, "type": "small-expansion", "aliases": [] }
  ```
  _(Update `type` to `"large-expansion"` if BGG classification confirms it.)_

- [x] **Task 2.22 — heroes**: Add 8 entries to `rawCardData.heroes` with `"setName": "Ant-Man and the Wasp"`, `"aliases": []`, `"cardCount": 14`. Verify `teams` for each against BGG. Note: `"Ant-Man"` is a duplicate name; `setName` distinguishes it from the entry with `setName: "Ant-Man"`:
  - `"name": "Ant Army"` — verify `teams`
  - `"name": "Ant-Man"` — verify `teams`
  - `"name": "Cassie Lang"` — verify `teams`
  - `"name": "Freedom Fighters"` — verify `teams`
  - `"name": "Janet Van Dyne"` — verify `teams`
  - `"name": "Jentorra"` — verify `teams`
  - `"name": "Scott Lang Cat Burglar"` — verify `teams`
  - `"name": "Wasp"` — verify `teams`

- [x] **Task 2.23 — masterminds**: Add 3 Transforming Mastermind entries to `rawCardData.masterminds` with `"setName": "Ant-Man and the Wasp"`, `"aliases": []`, `"leadCategory": "villains"`, `"notes": ["Transforming Mastermind."]`. Use the `/` separator in `name` for the two-form name (matching the existing convention used by e.g. `"General \"Thunderbolt\" Ross / Red Hulk"`). Cross-reference BGG to confirm each `leadName`:
  - `"name": "Darren Cross / Yellowjacket"` — verify `leadName`
  - `"name": "Ghost Master Thief / Ghost Intangible"` — verify `leadName`
  - `"name": "Kang Quantum Conqueror / Kang Multiverse Conqueror"` — verify `leadName`

- [x] **Task 2.24 — villainGroups**: Add 4 entries to `rawCardData.villainGroups` with `"setName": "Ant-Man and the Wasp"`, `"aliases": []`, `"cardCount": 8`:
  - `"name": "Armada of Kang"`
  - `"name": "Cross Technologies"`
  - `"name": "Ghost Chasers"`
  - `"name": "Quantum Realm"`

- [x] **Task 2.25 — henchmanGroups**: Add 3 entries to `rawCardData.henchmanGroups` with `"setName": "Ant-Man and the Wasp"`, `"aliases": []`, `"cardCount": 10`:
  - `"name": "Quantum Hound"`
  - `"name": "Quantumnauts"`
  - `"name": "Tardigrade"`

- [x] **Task 2.26 — schemes**: Add 4 entries to `rawCardData.schemes` with `"setName": "Ant-Man and the Wasp"`, `"aliases": []`, `"constraints": { "minimumPlayerCount": null }`, `"forcedGroups": []`, `"modifiers": []`. Add bystander notes where relevant (Special Bystanders: Agent Jimmy Woo ×2, Maggie Lang ×2, Officer Jim Paxton ×1, Young Cassie Lang ×2; verify per-scheme placement against BGG):
  - `"name": "Auction Shrink Tech to Highest Bidder"`
  - `"name": "Escape an Imprisoning Dimension"`
  - `"name": "Safeguard Dark Secrets"`
  - `"name": "Siphon Energy from the Quantum Realm"`

---

### Story 2 validation

- [x] **Test (Story 2)**: Run `npm run lint` and `npm test` and confirm all pass.
- [x] **QC (Automated — Story 2)**: Verify the following against `canonical-game-data.json`:
  - `setCatalog` contains all 5 new entries: `"Midnight Sons"`, `"The Infinity Saga"`, `"Weapon X"`, `"2099"`, `"Ant-Man and the Wasp"`.
  - Total `setCatalog` length increased by exactly 5.
  - No previously-existing `setCatalog` entry was removed, renamed, or had its `type` or `aliases` changed.
  - No previously-existing hero, mastermind, villainGroup, henchmanGroup, or scheme entry was removed or had its `name` changed.

---

## Story 3 — Correct incorrect release dates

> Only the `year` field of `setCatalog` entries may be changed. No `name`, `type`, `aliases`, or `rawCardData` field may be modified in this story.

- [x] **Task 3.1 — date audit**: For every entry in `setCatalog`, record its current `year` value and cross-reference it against the BGG listing for that expansion (search by exact `name`; use the "Year Published" field on BGG, or the official Legendary wiki as a secondary source). Produce a local list of every entry where the recorded `year` does not match the verified first-release year.

- [x] **Task 3.2 — apply corrections**: For each entry identified in Task 3.1, update its `year` field in `setCatalog` to the verified release year. Change only the `year` field; leave `name`, `type`, and `aliases` untouched.

- [x] **Test (Story 3)**: Run `npm run lint` and `npm test` and confirm all pass.
- [x] **QC (Automated — Story 3)**: Verify the following against the pre- and post-edit snapshots of `canonical-game-data.json`:
  - Only `year` fields changed for any modified `setCatalog` entry.
  - No `name`, `type`, or `aliases` value was altered on any entry.
  - No entry was added to or removed from `setCatalog`.
  - No `rawCardData` array (`heroes`, `masterminds`, `villainGroups`, `henchmanGroups`, `schemes`) was modified.
