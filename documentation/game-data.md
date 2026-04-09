# Legendary: Marvel — Game Data Summary

STATUS: Approved

## Purpose

This file is the **human-readable summary** of the project game data scope.

Its authoritative external references are defined in:

- `documentation/sources.md`

The **machine-facing, source-backed inventory** now lives in:

- `documentation/game-data-normalized.md`

That split follows the approved decision from `Q7: C`.

---

## Final scope decisions

The documentation and future implementation will use the following rules:

- **Scope:** include **everything found on the approved BoardGameGeek references** for Legendary: Marvel.
- **Source of truth:** the two BoardGameGeek reference pages listed in `documentation/sources.md` are the authoritative source set.
- **Duplicates / variants:** duplicate display names are allowed; all internal IDs are **set-scoped**.
- **Special setup rules:** modeled as **both structured fields and human-readable notes**.
- **Small / uneven sets:** all approved sets remain selectable, even if they do not form a balanced pool by themselves.
- **Fallback rule:** if there are not enough **never-played** cards to build a setup, the generator reuses the cards that have been played the **least**.

---

## Included product lines

### Core heroic line
- `Core Set`
- `Dark City`
- `Fantastic Four`
- `Paint the Town Red`
- `Guardians of the Galaxy`
- `Fear Itself`
- `Secret Wars, Volume 1`
- `Secret Wars, Volume 2`
- `Captain America 75th Anniversary`
- `Civil War`
- `Deadpool`
- `Champions`
- `World War Hulk`
- `S.H.I.E.L.D.`
- `Ant-Man`
- `Dimensions`
- `Into the Cosmos`
- `Realm of Kings`
- `Heroes of Asgard`
- `Black Widow`
- `Black Panther`
- `Doctor Strange and the Shadows of Nightmare`
- `Annihilation`
- `Venom`
- `The New Mutants`
- `X-Men`
- `Revelations`
- `Messiah Complex`
- `Marvel Noir`
- `Spider-Man Homecoming`

### MCU-branded sets included in scope
- `Marvel Studios, Phase 1`
- `Marvel Studios' Guardians of the Galaxy`

### Additional product lines included in scope
- `Villains`

---

## Human summary of the included data set

| Set Family | Included Sets | Notes |
|------------|---------------|-------|
| Base Game | 1 | `Core Set` is the starting collection anchor |
| Large Expansions | 8 | Includes `Dark City`, `Civil War`, `World War Hulk`, `X-Men`, `Venom`, and others classified as large in this project |
| Small Expansions | 22 | Includes both comic-themed and MCU-branded small boxes / decks |
| Standalone-Compatible | 2 | Includes `Revelations` and `Villains` |

> Classification in this project is a planning metadata layer for the UI and collection filters. The authoritative inventory and rule references come from the BoardGameGeek sources listed in `documentation/sources.md`.

---

## Important source-backed data realities

The authoritative external references are not necessarily organized in the same way as UI-facing product categories. The project therefore preserves the reference content while adding local normalization metadata for implementation safety.

Examples:
- `Fear Itself` contains **6 heroes**, **1 mastermind**, **1 villain group**, **0 henchmen**, and **3 schemes** in the source.
- `Dimensions` contains **heroes**, **1 mastermind**, **2 henchman groups**, and **0 villain groups / 0 schemes** in the source.
- `S.H.I.E.L.D.` contains **4 heroes** in the source.
- Some Masterminds force a **henchman** instead of a villain group.
- Some schemes include structured setup constraints such as extra heroes, minimum player count, or forced groups.

These are not treated as errors. They are part of the accepted source of truth.

---

## Generator behavior implied by this summary

Because all approved sets remain selectable:

- the collection UI must allow users to own any included set,
- the generator must validate whether the current owned pool can build a legal setup,
- if the collection is too small in a category, the app must fail clearly,
- if the collection is legal but there are not enough **never-played** options, the app must reuse the **least-played** options.

---

## Where the detailed inventory lives

See `documentation/game-data-normalized.md` for:

- exact included set names,
- normalized set IDs,
- category counts per set,
- source mapping notes,
- and the final inventory used to drive implementation.
