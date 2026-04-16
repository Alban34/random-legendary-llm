## Epic 34 — History Grouping Expansion

**Status: Approved**

**Objective**
Replace the current limited grouping options with the five user-requested dimensions — mastermind, scheme, heroes, villains, and player mode — so every game record is explorable from the angles that matter most at the table.

**In scope**
- five supported grouping modes: mastermind, scheme, heroes, villains, and player mode
- derivation of scheme, hero, and villain group keys from `setupSnapshot` fields (`schemeId`, `heroIds`, `villainGroupIds`)
- multi-value grouping behavior for heroes and villains: a single record appears under each hero it contains and under each villain group it contains
- removal of the `player-count` grouping mode
- removal of the `none` (ungrouped) mode; mastermind becomes the default grouping
- localization of all five grouping mode labels in English and French
- grouping is a presentation-only concern — no modification to the persisted history model

**Stories**
1. **Define the five-mode grouping contract including multi-value semantics for heroes and villains**
2. **Add scheme, hero, and villain grouping derivations to `history-utils.mjs` and remove `player-count` and `none` modes**
3. **Update the History grouping UI controls to expose exactly the five new modes**
4. **Localize all five grouping mode labels in English and French**
5. **Verify all five grouping modes render correctly for existing records, including multi-group membership for heroes and villains**

**Acceptance Criteria**
- Story 1: A written contract specifies the group key derivation for each of the five modes, documents that heroes and villains produce one group entry per entity, and declares mastermind as the default mode replacing the removed `none` option.
- Story 2: `history-utils.mjs` derives correct group keys for all five modes from `setupSnapshot`; `player-count` and `none` are removed; the persisted history model is unchanged.
- Story 3: The grouping control in the History tab presents exactly five mode options; selecting any mode updates the displayed groups immediately; `player-count` and ungroup options are unreachable.
- Story 4: All five grouping mode labels render in English and French without falling back to the alternate locale; no untranslated string is visible in either supported locale.
- Story 5: Each mode groups all existing records correctly; a record with three heroes appears under all three hero groups; a record with two villain groups appears under both; no record is silently omitted from a group it belongs to.

---
