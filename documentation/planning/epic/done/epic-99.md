## Epic 99 — Replay from History

**Objective**
Allow a user to replay any previously accepted game from the History tab using the exact same cards, routing the reconstructed setup through the standard New Game acceptance flow so no new randomisation is applied.

**In scope**
- Auditing the stored history snapshot schema to confirm all card IDs required for a full setup reconstruction are already persisted
- A "Replay" action on each history entry in the History tab UI
- A replay reconstruction function that converts a history snapshot into a complete, non-randomised Setup object
- Routing the reconstructed setup through the existing New Game acceptance flow (confirm → accept → log)
- Locale strings for all new UI copy in all six supported locale files (en, fr, de, es, ja, ko)

**Out of scope**
- Partial replay (e.g. keeping only some cards from a past game)
- Editing or modifying the replayed setup before acceptance
- Displaying a diff between the replayed setup and the current randomised setup

**Stories**
1. **Audit the history snapshot schema and confirm it retains every card ID needed to reconstruct a full setup**
2. **Add a "Replay this setup" action to each history entry in the History tab UI**
3. **Implement the replay reconstruction function that converts a history snapshot into a complete non-randomised Setup object**
4. **Route the reconstructed Setup through the existing New Game acceptance flow without triggering re-randomisation**
5. **Add and translate all replay-related UI strings across all six locale files**

**Acceptance Criteria**
- Story 1: A written audit note confirms which snapshot fields are present and sufficient; if any field is missing, a schema migration plan is documented before implementation proceeds.
- Story 2: Each history entry in the History tab displays a "Replay" action; the action is reachable by keyboard and meets the app's existing accessibility conventions; no visual regression is introduced on entries without the action.
- Story 3: The reconstruction function accepts a history snapshot and returns a Setup object whose card selections exactly match the snapshot; it is covered by unit tests with at least one positive case and one case where the snapshot references a card that no longer exists in the current data (graceful failure path).
- Story 4: Triggering "Replay" from the History tab navigates the user to the New Game tab pre-populated with the reconstructed setup; accepting it logs the replay as a new history entry; the original history entry is unchanged.
- Story 5: All new UI strings are present in all six locale files (en, fr, de, es, ja, ko); `npm run lint` passes with no missing-key warnings; no locale file has untranslated placeholder strings left in place.
