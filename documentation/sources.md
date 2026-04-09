# Source References

STATUS: Approved

## Purpose

This document defines the external reference sources that the project documentation and future implementation must follow.

These references supersede the older assumption that a previous local implementation file is the canonical source.

---

## Authoritative reference sources

### 1. Complete card list
- **URL:** https://boardgamegeek.com/wiki/page/Legendary_Marvel_Complete_Card_List
- **Role in this project:** authoritative reference for
  - set inventory,
  - product coverage,
  - heroes,
  - masterminds,
  - villain groups,
  - henchman groups,
  - schemes,
  - and card/category presence by set.

### 2. Complete card text
- **URL:** https://boardgamegeek.com/wiki/page/Legendary_Marvel_Complete_Card_Text
- **Role in this project:** authoritative reference for
  - setup-affecting card text,
  - Mastermind lead behavior,
  - Scheme setup rules,
  - minimum player restrictions,
  - extra-group requirements,
  - bystander changes,
  - and other rule details needed for generation logic.

---

## Source-of-truth policy

The project should use the two BoardGameGeek pages together as the canonical reference set:

- the **card list** page is the authority for inventory coverage,
- the **card text** page is the authority for setup and rule interpretation,
- and project-local normalization metadata may be added only to make implementation safer and clearer.

Examples of allowed project-local metadata:
- normalized IDs,
- UI type classification (`base`, `small-expansion`, etc.),
- resolved ID references,
- derived runtime indexes,
- structured rule modifiers,
- usage statistics fields.

Project-local metadata must **not** silently contradict the BoardGameGeek references.

---

## How these sources are used in the documentation

| Document | How it should use the sources |
|---|---|
| `documentation/game-data.md` | human-readable summary of scope and product coverage based on the card list page |
| `documentation/game-data-normalized.md` | normalized implementation-facing inventory derived from the card list page, with BGG-backed review checkpoints |
| `documentation/setup-rules.md` | setup logic and Scheme/Mastermind rule behavior aligned with the card text page |
| `documentation/data-model.md` | implementation-safe schema that preserves BGG-backed rule semantics |
| `documentation/architecture.md` | runtime design for normalizing BGG-sourced data into app-safe structures |
| `documentation/testing-qc-strategy.md` | requires implementation verification against the two BGG sources before story completion |

---

## Practical interpretation rule

When there is a conflict between:
- an older local implementation,
- project-local assumptions,
- and the BoardGameGeek references,

the project must treat the **BoardGameGeek references as authoritative for documentation review**.

Any remaining ambiguity should be called out explicitly in the documentation rather than silently resolved.
