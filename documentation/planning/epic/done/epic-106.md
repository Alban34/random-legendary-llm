# Epic 106 — Scheme Rules Alignment: Notes, Empty Data, and OCR Cleanup

## Objective
Fill in missing human-readable `notes` for every scheme in `src/data/canonical-game-data.json` whose setup rules are documented in `documentation/my-inputs/special-schemes.md` but whose `notes` array is currently empty or was rolled back. Also restore two Epic 104 notes entries that were lost in the rollback, and clean up OCR artifacts in existing note strings where they visibly corrupt the displayed rule.

## Background
After applying Epic 105's machine-readable modifier corrections, some schemes will still be missing the `notes` strings that communicate the full setup rule to users and future maintainers. Two specific cases were identified as partial rollbacks from Epic 104:
- **Infiltrate the Lair with Spies** — Epic 104 Story 104.12 added a note; that note is now absent.
- **Graduation at Xavier's X-Academy** — Epic 104 Story 104.13 added a note; that note is now absent.

Beyond those rollbacks, comparing `documentation/my-inputs/special-schemes.md` against `rawCardData.schemes` reveals schemes that are completely empty (no `modifiers`, no `notes`) and whose card rules are known from the card-extraction table. A notes entry is the minimum data that must exist for every scheme with special rules, even when no machine-readable modifier is applicable.

## Source material
- `documentation/my-inputs/special-schemes.md` — authoritative card-text extractions. Use the "Setup" column for note content, normalised for clarity.
- `src/data/canonical-game-data.json` — the file to be modified.

## Scope note
This epic is **notes-only**. It does not add or change any `modifiers` or `forcedGroups` entries — those are covered by Epic 105. Stories 106.1–106.3 may be implemented in any order.

---

## Stories

### Story 106.1 — Restore rolled-back Epic 104 notes

#### Infiltrate the Lair with Spies (`Villains`)
**Current state:** `notes: []`
**Intended note (from Epic 104):** `"Place 21 Bystanders next to this Scheme as Infiltrating Spies."`
**Change:** Add that note to `notes`.

#### Graduation at Xavier's X-Academy (`Villains`)
**Current state:** `notes: []`
**Intended note (from Epic 104):** `"Place 8 Bystanders next to this Scheme as Young Mutants."`
**Change:** Add that note to `notes`.

**Acceptance criteria:**
- Both schemes have the expected note string in `notes`.
- `npm run lint` passes.

---

### Story 106.2 — Fill notes for empty schemes present in `special-schemes.md`

The following schemes currently have no `modifiers` and no `notes` but appear in `special-schemes.md` with a known rule. Add a concise, clean `notes` entry for each, derived from the card-extraction text (clean up any OCR symbols such as `@`, `\`, `©`, and truncation artefacts before committing).

| Scheme (approximate name) | Source set | Card rule summary (from `special-schemes.md`) |
|---|---|---|
| House of M / No More Mutants | Revelations | "8 Twists. Hero Deck is 4 Heroes of one team and [N Heroes of another team]." (Verify exact composition from card before writing the note.) |
| Ritual Sacrifice to Summon Chthon // Great Old One Chthon | Midnight Sons | "6 Twists, plus 1 per player. Add Lilin as an extra Villain Group. If using Lilith: use 1 Twist total (and still use an extra Villain Group)." |
| The Kree-Skrull War | Guardians of the Galaxy | "8 Twists. Always include Kree Starforce and Skrull Villain Groups." |
| The Time Heist | The Infinity Saga | "Use 4 Heroes. 4 extra Heroes form a 'Past Hero Deck.' Special Rules: play on an alternate city called 'The Past.'" (Verify exact composition from card; OCR extraction is incomplete.) |
| The Traitor | Fear Itself | "2+ players only. 8 Twists. Shuffle a 'Betrayal Deck' of 3 [cards] into the Villain Deck." (Verify from card; extraction is truncated.) |
| Secret HYDRA Corruption / Open HYDRA Revolution | Revelations | "30 Officers in the S.H.I.E.L.D. Officer stack. 1 player: 7 Twists. 2–3 players: 9 Twists. 4–5 players: 11 Twists." |
| Hire Singularity Investigations to / Reveal Heroes' Evil Clones | Messiah Complex | "9 Twists." |
| Hack Cerebro to / Manipulate the Mutant Messiah | Messiah Complex | "10 Twists." |
| Drain Mutants' Powers to / Open Rifts to Future Timelines | Messiah Complex | "11 Twists." |
| Raid Gene Bank to / Unleash an Anti-Mutant Bioweapon | Messiah Complex | "8 Twists. Twist 1–3: If there is a Villain in the Bank, stack this Twist next to the Mastermind as a 'Mutant Genome.' Otherwise, move a Villain from another city space to the Bank. Twist 4: This Scheme Transforms into a random [scheme]." |
| Deadpool Writes a Scheme | Deadpool | "Use the Deadpool Hero. Add 6 Twists." |
| The Korvac Saga / Korvac Revealed | Revelations | "8 Twists." |
| Earthquake Drains the Ocean / Tsunami Crushes the Coast | Revelations | "11 Twists. Add an extra Villain Group." |

> **Implementation note:** For schemes whose extracted text contains unresolvable OCR artefacts or truncation (e.g. House of M, The Time Heist, The Traitor), the implementer should attempt to match against the raw note text already present in similar schemes or consult a secondary reference. If the full rule cannot be confirmed, add a partial note with a `TODO` comment rather than guessing.

**Acceptance criteria:**
- Each listed scheme has at least one non-empty `notes` entry.
- Notes are free of OCR symbols (`@`, `\4`, `©`, `*`, unexplained numeric sequences).
- `npm run lint` passes.

---

### Story 106.3 — Clean up OCR artefacts in existing notes

Several existing `notes` strings contain OCR corruption inherited from card-text scanning. Review every `notes` entry across all 186 schemes and correct artefacts. Common patterns to fix:

| Artefact pattern | Likely original | Example scheme |
|---|---|---|
| `@)` or `@` as a symbol | Recruit cost icon (¤) or similar | Enthrone the Barons of Battleworld |
| `\4` or `#2` | Attack or similar icon | Enthrone the Barons of Battleworld |
| `fist` instead of `Twist` | "Twist" (OCR misread) | Pull Earth Into Medieval Times |
| `Iwists` instead of `Twists` | "Twists" | Safeguard Dark Secrets |
| `S.H.!.E.L.0.` or `S.H.1.E.L.D.` | "S.H.I.E.L.D." | Destroy the Nova Corps, others |
| Truncated strings ending mid-word | Full sentence | Master of Tyrants (notes end at "Choose 3 other Masterminds,") |

**Process:**
1. Scan all `notes` entries in `canonical-game-data.json` for OCR-pattern artefacts.
2. Cross-reference against `documentation/my-inputs/special-schemes.md` to obtain the clean text.
3. Where `special-schemes.md` itself is truncated or artefact-ridden, add a `TODO` comment and leave the existing text unchanged rather than guessing.

**Acceptance criteria:**
- No `notes` entry contains known OCR artefact patterns listed above (or any obviously corrupted symbol sequences).
- `npm run lint` passes.
- No functional data (`modifiers`, `forcedGroups`, `constraints`) is changed.

---

### Story 106.4 — Validate

After all note edits:
1. Confirm `canonical-game-data.json` remains valid JSON (`JSON.parse` passes).
2. Run `src/data/canonical-game-data.test.ts` — all tests pass.
3. Run `npm run lint` — zero errors.

---

## Out of scope
- Changes to `modifiers` or `forcedGroups` (Epic 105).
- Adding `notes` to schemes with no entry in `documentation/my-inputs/special-schemes.md` — those schemes may have no special rules.
- Adding a `numTwists` machine-readable field.
- Schemes in `rawCardData.schemes` that are not present in `special-schemes.md`.

## Acceptance Criteria (Epic Level)
- All schemes listed in Story 106.2 have at least one non-empty `notes` entry.
- Infiltrate the Lair with Spies and Graduation at Xavier's X-Academy have the restored Epic 104 notes.
- No `notes` entry across the full dataset contains the OCR artefact patterns listed in Story 106.3.
- `src/data/canonical-game-data.test.ts` and `npm run lint` pass cleanly.
