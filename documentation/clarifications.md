# Clarifications Log

**Status:** Resolved

This file records the clarification decisions that were needed before the documentation could move to review.

> **Historical note:** this file is retained as an archival record of pre-implementation decisions. The documentation set is approved and the application has already been implemented; any workflow language below should be read as historical context rather than a current blocker.

---

## Final decisions

### Q1 — Scope of expansions to include in the final specs
**Answer:** superseded by later scope update

Current scope: include **everything found on the approved BoardGameGeek references** for Legendary: Marvel, including `Villains`.

---

### Q2 — Source of truth when the docs and `card-database.ts` conflict
**Answer:** `A`

`card-database.ts` is the final source of truth **exactly as-is**.

**Superseded note:**
This earlier decision has now been replaced by the source policy in `documentation/sources.md`.
The project should now use the two BoardGameGeek reference pages as the authoritative source set for documentation review.

---

### Q3 — How to handle duplicate or variant character names across sets
**Answer:** `A`

Track each card pool entry with a **set-specific internal ID**, while keeping display names intact.

---

### Q4 — README location
**Answer:** `C`

Create only a root `README.md`.

---

### Q5 — Scheme special rules modeling depth for the specification
**Answer:** `C`

Document scheme setup rules as **both structured fields and human-readable notes**.

---

### Q6 — Sets with unusual or partial category coverage
**Answer:** `A`

Include all sets in browsing and collection exactly as they exist.

**Additional approved rule:**
When there are not enough **unplayed** items to build a setup in a category, the app must reuse the items that have been played the **least**.

---

### Q7 — Completion standard for `game-data.md`
**Answer:** `C`

Split the data documentation into:
- a **human-readable summary**, and
- a **machine-facing normalized specification**.

---

### Q8 — Documentation status workflow
**Answer:** `A`

Once a spec file is complete, it should be changed from `Draft` to `In Review`.

---

## Resulting documentation changes

These decisions are now reflected in:

- `README.md`
- `documentation/sources.md`
- `documentation/architecture.md`
- `documentation/data-model.md`
- `documentation/setup-rules.md`
- `documentation/ui-design.md`
- `documentation/roadmap.md`
- `documentation/game-data.md`
- `documentation/game-data-normalized.md`

---

## Historical outcome

The clarification decisions above were incorporated into the approved documentation set and the shipped implementation.

This file now remains for provenance only.
