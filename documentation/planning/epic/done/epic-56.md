## Epic 56 — Standard v2 Solo Mode (Second Edition)

**Objective**
Add the Second Edition solo mode ("Standard v2") as a selectable play mode in the generator so that players using the Second Edition rulebook can generate correctly configured solo setups, and correct the inaccurate Advanced Solo description that currently appears in both the play-mode list and the locale files.

**Background**
The app currently offers two edition-specific solo modes: "Standard Solo" (v1 Base Game, Mode 1) and "Advanced Solo" (v1 Dark City expansion, Mode 2). The Second Edition rulebook defines a third mode — Second Edition Solo (Mode 3, called "Standard v2" here) — that overrides earlier solo rules. Mode 3 differs from Mode 2 primarily in villain deck henchman card count (2 cards in the villain deck, not 3; 2 additional cards set aside for the first-turn rule), a mastermind ability transfer rule, a "one tuck per turn" cap on the scheme twist effect, and a slightly different scoring structure. The generator currently has no representation of Mode 3. Additionally, `new-game-utils.mjs` and the locale files describe Advanced Solo as using "4 Heroes and 2 Villain Groups," which is wrong — Advanced Solo uses 3 heroes and 1 villain group. This error must be corrected as part of this epic.

**In scope**
- Add a new play mode key (`standard-solo-v2`) to `PLAY_MODE_OPTIONS` in `setup-rules.mjs` with label "Standard v2" and a correct description
- Add the corresponding setup template under a new key (e.g. `1-standard-v2`) in `SETUP_RULES`: heroCount 3, villainGroupCount 1, henchmanGroupCount 1, wounds 25
- Extend `resolvePlayMode` and `resolveSetupTemplate` to recognise and validate `standard-solo-v2`; it is only available for 1-player games
- Fix the incorrect Advanced Solo description in `getAvailablePlayModes` in `new-game-utils.mjs` (currently "4 Heroes and 2 Villain Groups")
- Add the new mode to `getAvailablePlayModes` for 1-player games, alongside the existing three modes
- Update `getPlayModeHelpText` and `getPlayModeLabel` to handle the new mode key correctly
- Fix the incorrect `common.playMode.advanced-soloDescription` locale string in all six locale files (en, fr, de, es, ja, ko)
- Add locale strings for the new mode label (`common.playMode.standard-solo-v2`) and description (`common.playMode.standard-solo-v2Description`) in all six locale files
- Update `common.playMode.chooseSolo` in all six locale files to reference the new mode alongside the existing three
- Explicitly verify that `standard-solo-v2` does not inherit the scheme eligibility restrictions applied to `standard` mode by Epic 53 — Mode 3 has no excluded schemes

**Out of scope**
- Villain deck composition counters, set-aside henchman indicators, or first-turn henchman instructions in the generated setup result (covered by Epic 57)
- The in-app solo rules reference panel (covered by Epic 57)
- Scoring penalty calculator or penalty display
- Changes to Advanced Solo gameplay behaviour beyond correcting its description
- Scheme exclusion rules for the new mode (Mode 3 has none; verification only)

**Stories**
1. **Add the Standard v2 play mode to the data layer and extend mode resolution and template logic**
2. **Fix the Advanced Solo description and expose the Standard v2 mode in the mode selector UI**
3. **Update all six locale files with the corrected Advanced Solo description, the new mode label, the new mode description, and the updated solo-mode chooser string**

**Acceptance Criteria**
- Story 1: `PLAY_MODE_OPTIONS` in `setup-rules.mjs` includes a `standard-solo-v2` entry with a non-empty label and description; `resolveSetupTemplate` for that mode returns `{ heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 }`; `resolvePlayMode` with `standard-solo-v2` and a player count other than 1 throws a validation error; the scheme eligibility restriction from Epic 53 (which applies only to `standard` mode) does not apply to `standard-solo-v2`; `npm run lint` and `npm test` pass.
- Story 2: The Advanced Solo entry in the mode selector no longer references "4 Heroes" or "2 Villain Groups" in either its label or its tooltip/description; a Standard v2 mode button is rendered in the 1-player mode selector alongside Standard Solo, Advanced Solo, and Two-Handed Solo; selecting Standard v2 updates `selectedPlayMode` to `standard-solo-v2` and the setup requirements summary reflects heroCount 3, villainGroupCount 1, henchmanGroupCount 1; the button is absent when player count is 2 or more; `npm run lint` passes.
- Story 3: None of the six locale files retain the text "4 Heroes and 2 Villain Groups" in `common.playMode.advanced-soloDescription`; all six locale files contain a `common.playMode.standard-solo-v2` key and a `common.playMode.standard-solo-v2Description` key with non-empty translated values; `common.playMode.chooseSolo` in all six files references the new mode; no locale file falls back to a raw key string when Standard v2 is the active mode; `npm run lint` passes.
