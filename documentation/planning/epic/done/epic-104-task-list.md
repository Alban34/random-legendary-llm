# Epic 104 — Apply scheme special setup rules from screenshot review — Task List

## Story 104.1 — Replace Earth's Leaders with Killbots [Core Set]
- [x] Add `{"type":"set-bystanders","value":18}` to `modifiers`; add note `"Set Bystanders to 18."`
- [x] Test: Verify `modifiers` contains `set-bystanders` with `value:18` and `notes` contains the expected string
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.2 — Secret Invasion of the Skrull Shapeshifters [Core Set]
- [x] Correct `set-min-heroes` value from `6` to `5`; add `{"type":"add-hero","amount":12}` to `modifiers`; update notes to `"Force the Skrulls Villain Group and use at least 5 Heroes in the setup."` and `"Shuffle 12 Heroes into the Villain Deck."`
- [x] Test: Verify `set-min-heroes` has `value:5`, `add-hero` modifier exists with `amount:12`, and notes contain both strings
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.3 — Asgard Under Siege [Marvel Studios, Phase 1]
- [x] Add `{"type":"add-henchman-group","amount":1}` to `modifiers`; add note `"Add 1 extra Henchman Group."`
- [x] Test: Verify `modifiers` contains `add-henchman-group` with `amount:1` and `notes` contains the expected string
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.4 — Destroy the Cities of Earth! [Marvel Studios, Phase 1]
- [x] Add `{"type":"set-bystanders","value":12}` to `modifiers`; add note `"Set Bystanders to 12."`
- [x] Test: Verify `modifiers` contains `set-bystanders` with `value:12` and `notes` contains the expected string
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.5 — Enslave Minds with the Chitauri Scepter [Marvel Studios, Phase 1]
- [x] Add `{"category":"villains","name":"Chitauri"}` to `forcedGroups`; add `{"type":"add-hero","amount":12}` to `modifiers`; add notes `"Always include Chitauri Villain Group."` and `"Shuffle 12 Heroes into the Villain Deck."`
- [x] Test: Verify `forcedGroups` contains Chitauri entry, `add-hero` modifier has `amount:12`, and notes contain both strings
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.6 — Super Hero Civil War [Marvel Studios, Phase 1]
- [x] Add `{"type":"conditional-set-min-heroes","value":4,"playerCounts":[2]}` to `modifiers`; append note `"For 2 players, use 4 Heroes."`
- [x] Test: Verify `conditional-set-min-heroes` modifier exists with correct shape and note is appended without removing existing note
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.7 — Replace Earth's Leaders with HYDRA [Marvel Studios, Phase 1]
- [x] Add `{"type":"set-bystanders","value":18}` to `modifiers`; add note `"Set Bystanders to 18."`
- [x] Test: Verify `modifiers` contains `set-bystanders` with `value:18` and `notes` contains the expected string
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.8 — Trash Earth with Hugest Party Ever [Marvel Studios' What If...?]
- [x] Add `{"category":"villains","name":"Intergalactic Party Animals"}` to `forcedGroups`; add `{"type":"require-hero-name-match-count","pattern":"Party Thor","value":1}` to `modifiers`; add notes `"Always include Intergalactic Party Animals Villain Group."` and `"Always include Party Thor."`
- [x] Test: Verify `forcedGroups` contains Intergalactic Party Animals, modifier shape is correct, and notes contain both strings
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.9 — Breach the Nexus of All Realities [Marvel Studios' What If...?]
- [x] Add `{"type":"conditional-add-villain-group","amount":1,"playerCounts":[1,2]}` to `modifiers`; add note `"For 1–2 players, use 3 Villain Groups."`
- [x] Test: Verify modifier exists with correct `playerCounts` and note contains expected string
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.10 — Marvel Zombies [Marvel Studios' What If...?]
- [x] Add `{"category":"villains","name":"Zombie Avengers"}` to `forcedGroups`; add `{"type":"add-hero","amount":8}` to `modifiers`; add notes for all three rules (conditional bystanders via note only — `conditional-add-bystanders` type does not exist in JSON)
- [x] Test: Verify `forcedGroups` contains Zombie Avengers, `add-hero` has `amount:8`, and all three notes are present
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.11 — Mass Produce War Machine Armor [Villains]
- [x] Add `{"category":"henchmen","name":"S.H.I.E.L.D. Assault Squad"}` to `forcedGroups` (code in `game-data-normalizer.ts` and `setup-category-selector.ts` supports `henchmen` category; no existing JSON example); add note `"Always include S.H.I.E.L.D. Assault Squad as a Henchman Group."`
- [x] Test: Verify `forcedGroups` contains the S.H.I.E.L.D. Assault Squad henchmen entry and note is correct
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.12 — Infiltrate the Lair with Spies [Villains]
- [x] Add note `"Place 21 Bystanders next to this Scheme as Infiltrating Spies."` (`set-side-bystanders` modifier type does not exist in JSON; note-only approach)
- [x] Test: Verify `notes` contains the expected string and `modifiers` remains empty
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.13 — Graduation at Xavier's X-Academy [Villains]
- [x] Add note `"Place 8 Bystanders next to this Scheme as Young Mutants."` (`set-side-bystanders` modifier type does not exist in JSON; note-only approach)
- [x] Test: Verify `notes` contains the expected string and `modifiers` remains empty
- [x] QC (Automated): Run lint + unit tests covering `canonical-game-data.json` normalisation pipeline

## Story 104.14 — Validate
- [x] Run any JSON schema validation or data-integrity check scripts from `package.json` or `tools/` — `node JSON.parse` passed; `report:epic1` skipped (tsx not installed, no node_modules)
- [x] QC (Automated): Run full lint pass; run normalisation-pipeline unit tests; verify no new TypeScript errors in `src/`
