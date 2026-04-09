# Clarifications Log

**Status:** Resolved

This file records the clarification decisions that were needed before the documentation could move to review.

---

## Final decisions

### Q1 — Scope of expansions to include in the final specs
**Answer:** `B`

Include everything from the heroic line **plus MCU-branded Marvel sets**, but exclude `Villains`.

---

### Q2 — Source of truth when the docs and `card-database.ts` conflict
**Answer:** `A`

`card-database.ts` is the final source of truth **exactly as-is**.

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
- `documentation/architecture.md`
- `documentation/data-model.md`
- `documentation/setup-rules.md`
- `documentation/ui-design.md`
- `documentation/roadmap.md`
- `documentation/game-data.md`
- `documentation/game-data-normalized.md`

---

## Next step

The project is now ready for **documentation review**.

No code implementation should begin until you approve the documentation set.
