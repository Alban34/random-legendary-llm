# Epic 104 — Apply scheme special setup rules from screenshot review

## Objective
Apply the special card-count setup rules visible in the four scheme-card screenshots to `src/data/canonical-game-data.json`, so the generator produces correct villain-deck compositions and forced-group selections for each affected scheme.

## Source material
Four PNG screenshots in `documentation/my-inputs/scheme-screenshots/` (captured 2026-05-27).  
All data changes are scoped to the thirteen schemes identified below. No other scheme entries may be modified.

## Data structure reference
Relevant fields per scheme entry in `rawCardData.schemes[]`:
- `forcedGroups` — array of `{category, name}` objects for required villain or hero groups
- `modifiers` — array of modifier objects; known types: `add-henchman-group`, `add-hero`, `add-villain-group`, `conditional-add-villain-group`, `conditional-set-min-heroes`, `replace-villain-group-with-specific-group`, `require-hero-name-match-count`, `set-bystanders`, `set-min-heroes`
- `notes` — human-readable strings summarising the rule for display

---

## Stories

### Story 104.1 — Replace Earth's Leaders with Killbots [Core Set]: add 18 bystanders
**Current state:** `modifiers: []`, `notes: []`  
**Card rule:** Setup places 18 Bystanders in the Villain Deck.  
**Change:** Add `{"type":"set-bystanders","value":18}` to `modifiers`. Add note `"Set Bystanders to 18."`.

### Story 104.2 — Secret Invasion of the Skrull Shapeshifters [Core Set]: add hero-to-villain-deck modifier and fix min-heroes
**Current state:** `forcedGroups: [{category:"villains",name:"Skrulls"}]`, `modifiers: [{type:"set-min-heroes",value:6}]`  
**Card rule:** Setup uses 5 Heroes (not 6). 12 random Heroes are shuffled from the Hero Deck into the Villain Deck.  
**Changes:**
1. Correct `set-min-heroes` value from `6` to `5`.
2. Add an `add-hero` modifier encoding 12 Heroes shuffled into the Villain Deck (use the appropriate modifier shape for heroes added to the villain deck).
3. Update `notes` to reflect both rules.

### Story 104.3 — Asgard Under Siege [Marvel Studios, Phase 1]: add extra Henchman Group
**Current state:** `modifiers: []`, `notes: []`  
**Card rule:** Setup adds 1 extra Henchman Group to the Villain Deck.  
**Change:** Add `{"type":"add-henchman-group","amount":1}` to `modifiers`. Add note `"Add 1 extra Henchman Group."`.

### Story 104.4 — Destroy the Cities of Earth! [Marvel Studios, Phase 1]: add 12 bystanders
**Current state:** `modifiers: []`, `notes: []`  
**Card rule:** Setup places 12 Bystanders in the Villain Deck.  
**Change:** Add `{"type":"set-bystanders","value":12}` to `modifiers`. Add note `"Set Bystanders to 12."`.

### Story 104.5 — Enslave Minds with the Chitauri Scepter [Marvel Studios, Phase 1]: force Chitauri group and add heroes to villain deck
**Current state:** `forcedGroups: []`, `modifiers: []`, `notes: []`  
**Card rule:** Setup requires the Chitauri Villain Group. 12 random Heroes are shuffled from the Hero Deck into the Villain Deck.  
**Changes:**
1. Add `{category:"villains",name:"Chitauri"}` to `forcedGroups`.
2. Add an `add-hero` modifier encoding 12 Heroes shuffled into the Villain Deck.
3. Add notes describing both requirements.

### Story 104.6 — Super Hero Civil War [Marvel Studios, Phase 1]: add player-count conditional hero-count modifier
**Current state:** `constraints: {minimumPlayerCount:2}`, `modifiers: []`  
**Card rule:** For 2 players, use only 4 Heroes in the Hero Deck. The player-count-dependent hero count is not currently stored.  
**Change:** Add a `conditional-set-min-heroes` modifier (or equivalent) that sets the Hero count to 4 when `playerCount === 2`. Update `notes` to document the rule.

### Story 104.7 — Replace Earth's Leaders with HYDRA [Marvel Studios, Phase 1]: add 18 bystanders
**Current state:** `modifiers: []`, `notes: []`  
**Card rule:** Setup places 18 Bystanders in the Villain Deck.  
**Change:** Add `{"type":"set-bystanders","value":18}` to `modifiers`. Add note `"Set Bystanders to 18."`.

### Story 104.8 — Trash Earth with Hugest Party Ever [Marvel Studios' What If...?]: force Party Thor hero and Intergalactic Party Animals villain group
**Current state:** `forcedGroups: []`, `modifiers: []`, `notes: []`  
**Card rule:** Setup always includes the Intergalactic Party Animals Villain Group and the Party Thor Hero.  
**Changes:**
1. Add `{category:"villains",name:"Intergalactic Party Animals"}` to `forcedGroups` (verify exact group name against DB).
2. Add a `require-hero-name-match-count` modifier (or equivalent forced-hero entry) for Party Thor (verify exact hero name against DB).
3. Add notes describing both requirements.

### Story 104.9 — Breach the Nexus of All Realities [Marvel Studios' What If...?]: add conditional extra Villain Group for 1-2 players
**Current state:** `modifiers: []`, `notes: []`  
**Card rule:** For 1-2 players, the setup uses 3 Villain Groups instead of the standard 2.  
**Change:** Add a `conditional-add-villain-group` modifier with `amount:1` scoped to `playerCounts:[1,2]`. Add note `"For 1–2 players, use 3 Villain Groups."`.

### Story 104.10 — Marvel Zombies [Marvel Studios' What If...?]: force zombie villain group, add heroes to villain deck, conditional bystanders for 1-2 players
**Current state:** `forcedGroups: []`, `modifiers: []`, `notes: []`  
**Card rule:** Setup requires exactly one Villain Group that contains "Rise of the Living Dead" (verify the exact group name in the DB). 8 random Hero cards from an extra Hero are added to the Villain Deck. For 1-2 players, 3 extra Bystanders are added to the Villain Deck.  
**Changes:**
1. Add the required villain group to `forcedGroups` (verify exact name).
2. Add an `add-hero` modifier for 8 Hero cards added to the Villain Deck.
3. Add a `conditional-add-bystanders` modifier (or equivalent) for `playerCounts:[1,2]` with `amount:3` — if this modifier type does not yet exist, add a note and leave a `TODO` comment for the implementer to define the new modifier type.
4. Add notes describing all three rules.

### Story 104.11 — Mass Produce War Machine Armor [Villains]: force S.H.I.E.L.D. Assault Squads henchman group
**Current state:** `modifiers: []`, `notes: []`  
**Card rule:** Setup always includes the S.H.I.E.L.D. Assault Squads as one of the Henchman Groups.  
**Change:** Add an entry forcing the S.H.I.E.L.D. Assault Squads Henchman Group (verify exact group name in DB; use `forcedGroups` with `category:"henchmen"` if supported, otherwise add a new forced-henchman modifier type). Add note `"Always include S.H.I.E.L.D. Assault Squads as a Henchman Group."`.

### Story 104.12 — Infiltrate the Lair with Spies [Villains]: record 21-bystander side-stack count
**Current state:** `modifiers: []`, `notes: []`  
**Card rule:** Setup places 21 Bystanders next to this Scheme as "Infiltrating Spies" (a side stack, not in the Villain Deck).  
**Change:** Add a note `"Place 21 Bystanders next to this Scheme as Infiltrating Spies."`. If a `set-side-bystanders` modifier type exists or is introduced, use it; otherwise the note is sufficient.

### Story 104.13 — Graduation at Xavier's X-Academy [Villains]: record 8-bystander side-stack count
**Current state:** `modifiers: []`, `notes: []`  
**Card rule:** Setup places 8 Bystanders next to this Scheme as "Young Mutants" (a side stack, not in the Villain Deck).  
**Change:** Add a note `"Place 8 Bystanders next to this Scheme as Young Mutants."`. If a `set-side-bystanders` modifier type exists or is introduced, use it; otherwise the note is sufficient.

### Story 104.14 — Validate all changes pass data integrity checks
After all edits in Stories 104.1–104.13, run any existing JSON schema validation or data-integrity test suite against `canonical-game-data.json` to confirm the file is structurally valid and no existing tests regress. Lint must also pass.

## Acceptance Criteria
- Each scheme named in Stories 104.1–104.13 has the specified `modifiers`, `forcedGroups`, and/or `notes` additions applied.
- No scheme entries outside the thirteen listed are modified.
- `canonical-game-data.json` parses without errors.
- All data-related tests and lint pass.
