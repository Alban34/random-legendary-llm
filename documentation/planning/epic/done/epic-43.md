## Epic 43 — Expansion Attribution in History


**Objective**
Display the source expansion name next to each card entity in a history record so a player can see at a glance which sets were involved in a past game, without having to look anything up externally.

**In scope**
- showing a short expansion label alongside each hero, mastermind, villain group, henchman group, and scheme in every history record
- deriving the expansion name from the app's existing canonical game-data via each entity's `setId` — no changes to the stored history record format
- applying a visually subordinate typographic treatment to the label so it does not compete with the card name

**Out of scope**
- changing the data model or storage format of history records
- adding expansion labels to the live setup generator output (only the History tab view)
- filtering, grouping, or searching history by expansion
- adding any new fields to the canonical game-data schema

**Stories**
1. **Extend the history record renderer to resolve and display each entity's source expansion name**
2. **Apply a visually subordinate typographic style to the expansion label within the history card**
3. **Verify that expansion attribution renders correctly for all entity types across all stored history records**

**Acceptance Criteria**
- Story 1: Every entity in a rendered history record (mastermind, scheme, hero, villain group, henchman group) shows its source expansion name; the name is looked up from the canonical game-data using the entity's `setId`; the stored history record object is not modified.
- Story 2: The expansion label is visually distinguishable from the card name — achieved through a smaller font size, reduced opacity, or equivalent muted style — and the existing layout and vertical rhythm of the history entry is preserved.
- Story 3: History records already persisted in localStorage render expansion labels without any migration step; all five entity types display a non-empty, correct expansion name; no entity shows an undefined, null, or "unknown" label for any expansion present in the catalog.
