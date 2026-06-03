# Epic 106 Task List — Scheme Rules Alignment: Notes, Empty Data, and OCR Cleanup

## Story 106.1 — Restore rolled-back Epic 104 notes

- [x] In `src/data/canonical-game-data.json`, locate the scheme **Infiltrate the Lair with Spies** (set: `Villains`) and add `"Place 21 Bystanders next to this Scheme as Infiltrating Spies."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate the scheme **Graduation at Xavier's X-Academy** (set: `Villains`) and add `"Place 8 Bystanders next to this Scheme as Young Mutants."` to its `notes` array
- [x] Verify both schemes now have exactly one non-empty `notes` entry matching the Epic 104 intended strings
- [ ] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 106.2 — Fill notes for empty schemes present in `special-schemes.md`

- [x] In `src/data/canonical-game-data.json`, locate **House of M / No More Mutants** (set: `Revelations`) and add a `notes` entry derived from `documentation/my-inputs/special-schemes.md`; if OCR artefacts make the hero-deck composition unresolvable, add a partial note with a `TODO` comment
- [x] In `src/data/canonical-game-data.json`, locate **Ritual Sacrifice to Summon Chthon // Great Old One Chthon** (set: `Midnight Sons`) and add `"6 Twists, plus 1 per player. Add Lilin as an extra Villain Group. If using Lilith: use 1 Twist total (and still use an extra Villain Group)."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **The Kree-Skrull War** (set: `Guardians of the Galaxy`) and add `"8 Twists. Always include Kree Starforce and Skrull Villain Groups."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **The Time Heist** (set: `The Infinity Saga`) and add a `notes` entry derived from `documentation/my-inputs/special-schemes.md`; if OCR artefacts make the Past Hero Deck composition unresolvable, add a partial note with a `TODO` comment
- [x] In `src/data/canonical-game-data.json`, locate **The Traitor** (set: `Fear Itself`) and add a `notes` entry derived from `documentation/my-inputs/special-schemes.md`; if the Betrayal Deck composition is truncated and unresolvable, add a partial note with a `TODO` comment
- [x] In `src/data/canonical-game-data.json`, locate **Secret HYDRA Corruption / Open HYDRA Revolution** (set: `Revelations`) and add `"30 Officers in the S.H.I.E.L.D. Officer stack. 1 player: 7 Twists. 2–3 players: 9 Twists. 4–5 players: 11 Twists."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **Hire Singularity Investigations to / Reveal Heroes' Evil Clones** (set: `Messiah Complex`) and add `"9 Twists."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **Hack Cerebro to / Manipulate the Mutant Messiah** (set: `Messiah Complex`) and add `"10 Twists."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **Drain Mutants' Powers to / Open Rifts to Future Timelines** (set: `Messiah Complex`) and add `"11 Twists."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **Raid Gene Bank to / Unleash an Anti-Mutant Bioweapon** (set: `Messiah Complex`) and add the full Twist-sequence note derived from `documentation/my-inputs/special-schemes.md` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **Deadpool Writes a Scheme** (set: `Deadpool`) and add `"Use the Deadpool Hero. Add 6 Twists."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **The Korvac Saga / Korvac Revealed** (set: `Revelations`) and add `"8 Twists."` to its `notes` array
- [x] In `src/data/canonical-game-data.json`, locate **Earthquake Drains the Ocean / Tsunami Crushes the Coast** (set: `Revelations`) and add `"11 Twists. Add an extra Villain Group."` to its `notes` array
- [x] Confirm no `modifiers` or `forcedGroups` entries were added or changed as a side-effect of the above edits
- [ ] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 106.3 — Clean up OCR artefacts in existing notes

- [x] Scan every `notes` entry in `src/data/canonical-game-data.json` and identify strings containing `@)`, standalone `@`, `\4`, `#2`, `fist` (where "Twist" is intended), `Iwists`, `S.H.!.E.L.0.`, `S.H.1.E.L.D.`, or other obviously corrupted symbol sequences
- [x] For each artefact found, cross-reference the clean text in `documentation/my-inputs/special-schemes.md` and replace the corrupted string with the correct text
- [x] Fix `@)` / `@` → correct recruit-cost notation in **Enthrone the Barons of Battleworld** and any other affected schemes (all already fixed in prior epic; none found)
- [x] Fix `\4` / `#2` → correct attack notation in **Enthrone the Barons of Battleworld** and any other affected schemes (all already fixed in prior epic; none found)
- [x] Fix `fist` → `Twist` in **Pull Earth Into Medieval Times** and any other affected schemes (all already fixed in prior epic; none found)
- [x] Fix `Iwists` → `Twists` in **Safeguard Dark Secrets** and any other affected schemes (all already fixed in prior epic; none found)
- [x] Fix `S.H.!.E.L.0.` / `S.H.1.E.L.D.` → `S.H.I.E.L.D.` in **Destroy the Nova Corps** and any other affected schemes (all already fixed in prior epic; none found)
- [x] For any truncated string (e.g. **Master of Tyrants** notes ending mid-sentence) where `special-schemes.md` provides the full text, complete the string; if `special-schemes.md` is itself truncated, add a `TODO` comment and leave existing text unchanged — added TODO to 15 schemes (see implementation report)
- [x] Confirm no `modifiers`, `forcedGroups`, or `constraints` entries were changed as a side-effect
- [ ] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story

---

## Story 106.4 — Validate

- [x] Confirm `src/data/canonical-game-data.json` is valid JSON by running `JSON.parse` against the file (e.g. `node -e "JSON.parse(require('fs').readFileSync('src/data/canonical-game-data.json','utf8'))"`) — PASS
- [x] Run `src/data/canonical-game-data.test.ts` and confirm all tests pass
- [x] Run `npm run lint` and confirm zero errors
- [ ] Test: write/update unit tests covering the acceptance criteria
- [x] QC (Automated): run lint + unit tests for this story
