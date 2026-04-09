# Legendary: Marvel Randomizer

STATUS: Approved

## Project state

This repository is currently in the **specification and architecture phase** for a single-page web application that will support setup generation for **Legendary: A Marvel Deck Building Game**.

> Implementation has **not** started yet.
>
> Per the project rules, coding begins only after the documentation is reviewed and approved.

---

## Planned application goals

The future app will:
- run as a single `index.html` file,
- use embedded JavaScript and CSS only,
- require no server-side code,
- allow users to browse supported Legendary: Marvel sets,
- let users select the sets they own,
- generate randomized setups for **1 to 5 players**,
- support **Advanced Solo** mode,
- track heroes, masterminds, villain groups, henchman groups, and schemes across accepted games,
- prefer **never-played** options first,
- and reuse the **least-played** options when there are not enough fresh choices.

---

## Documentation index

The current project work lives in `documentation/`.

- `documentation/create-project.md` — original brief and constraints
- `documentation/sources.md` — authoritative external reference sources
- `documentation/architecture.md` — runtime architecture and normalization model
- `documentation/roadmap.md` — implementation roadmap
- `documentation/data-model.md` — data and local storage specification
- `documentation/setup-rules.md` — setup rules and randomization rules
- `documentation/ui-design.md` — visual design and user flows
- `documentation/game-data.md` — human-readable data scope summary
- `documentation/game-data-normalized.md` — BGG-derived normalized inventory
- `documentation/clarifications.md` — clarification record and final decisions
- `documentation/epics.md` — implementation epics and stories
- `documentation/task-list.md` — checkable implementation tracker
- `documentation/testing-qc-strategy.md` — testing and quality-control policy

---

## Current documentation decisions

Approved specification decisions currently reflected in the docs:

- include everything found on the approved BoardGameGeek references for Legendary: Marvel,
- treat the two BoardGameGeek reference pages as the authoritative source set,
- normalize source data once at startup into resolved runtime entities and indexes,
- use set-scoped internal IDs for duplicate names,
- document scheme setup rules as both structured data and human-readable notes,
- allow all approved sets in collection browsing,
- persist a versioned root browser state object,
- and fall back to the **least-played** items when there are not enough **unplayed** items in a category.

---

## Next step

The next step is **documentation review and approval**.

Once the docs are approved, the implementation phase can begin.
