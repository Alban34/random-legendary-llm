# Legendary: Marvel — Normalized Game Data Specification

STATUS: Approved

## Purpose

This file is the **machine-facing game-data specification** derived from `card-database.ts`.

It defines:
- the exact included source sets,
- the normalized set IDs,
- the category counts that must be preserved,
- and the normalization expectations for runtime use.

> Per approved decision `Q2: A`, `card-database.ts` is the source of truth **exactly as-is** for names and content.

---

## Normalization goals

The implementation must normalize source data into runtime-safe entities that:
- keep display names exactly as sourced,
- use stable set-scoped IDs,
- resolve cross-references to IDs,
- preserve category membership exactly,
- and support flattened indexes in memory.

---

## Included scope

Included:
- all heroic-line Marvel sets found in `card-database.ts`
- MCU-branded Marvel sets found in `card-database.ts`

Excluded:
- `Villains`

---

## Normalization rules

### 1. Display names vs internal IDs
- display names remain exactly as they appear in `card-database.ts`
- internal IDs are normalized as kebab-case and set-scoped
- duplicate names across sets remain separate entries

### 2. Category preservation
The implementation must preserve source category membership exactly:
- `heroes`
- `masterminds`
- `villains`
- `henchmen`
- `schemes`

### 3. Reference resolution
All source name-based references must be converted into resolved runtime references.

Examples:
- `alwaysLead + alwaysLeadCategory` → `lead: { category, id }`
- scheme-forced groups → `forcedGroups[]`
- scheme setup logic → `modifiers[] + notes[]`

### 4. Runtime indexing requirement
The normalized result must support flattened runtime indexes such as:
- `setsById`
- `heroesById`
- `mastermindsById`
- `villainGroupsById`
- `henchmanGroupsById`
- `schemesById`

---

## Included set inventory

| Source Extension Name | Planned Set ID | Year | Type | Heroes | Masterminds | Villains | Henchmen | Schemes |
|---|---|---:|---|---:|---:|---:|---:|---:|
| `Core Set` | `core-set` | 2012 | `base` | 15 | 4 | 7 | 4 | 8 |
| `Dark City` | `dark-city` | 2013 | `large-expansion` | 17 | 5 | 6 | 2 | 8 |
| `Fantastic Four` | `fantastic-four` | 2014 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Paint the Town Red` | `paint-the-town-red` | 2014 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Guardians of the Galaxy` | `guardians-of-the-galaxy` | 2014 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Fear Itself` | `fear-itself` | 2015 | `small-expansion` | 6 | 1 | 1 | 0 | 3 |
| `Secret Wars, Volume 1` | `secret-wars-volume-1` | 2015 | `large-expansion` | 14 | 4 | 6 | 3 | 8 |
| `Secret Wars, Volume 2` | `secret-wars-volume-2` | 2015 | `large-expansion` | 16 | 4 | 6 | 3 | 8 |
| `Captain America 75th Anniversary` | `captain-america-75th-anniversary` | 2016 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Civil War` | `civil-war` | 2016 | `large-expansion` | 16 | 5 | 7 | 2 | 8 |
| `Deadpool` | `deadpool` | 2017 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Champions` | `champions` | 2018 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Marvel Studios, Phase 1` | `marvel-studios-phase-1` | 2019 | `small-expansion` | 7 | 3 | 5 | 4 | 8 |
| `Marvel Studios' Guardians of the Galaxy` | `marvel-studios-guardians-of-the-galaxy` | 2019 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `World War Hulk` | `world-war-hulk` | 2019 | `large-expansion` | 15 | 6 | 7 | 3 | 8 |
| `S.H.I.E.L.D.` | `shield` | 2019 | `large-expansion` | 4 | 2 | 2 | 0 | 4 |
| `Ant-Man` | `ant-man` | 2019 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Dimensions` | `dimensions` | 2019 | `small-expansion` | 5 | 1 | 0 | 2 | 0 |
| `Into the Cosmos` | `into-the-cosmos` | 2020 | `small-expansion` | 9 | 3 | 4 | 2 | 4 |
| `Realm of Kings` | `realm-of-kings` | 2020 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Heroes of Asgard` | `heroes-of-asgard` | 2020 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Black Widow` | `black-widow` | 2020 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Black Panther` | `black-panther` | 2021 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Doctor Strange and the Shadows of Nightmare` | `doctor-strange-and-the-shadows-of-nightmare` | 2021 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Annihilation` | `annihilation` | 2021 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Venom` | `venom` | 2021 | `large-expansion` | 5 | 2 | 2 | 0 | 4 |
| `The New Mutants` | `the-new-mutants` | 2021 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `X-Men` | `x-men` | 2022 | `large-expansion` | 15 | 6 | 7 | 5 | 8 |
| `Revelations` | `revelations` | 2022 | `standalone` | 9 | 3 | 4 | 2 | 4 |
| `Messiah Complex` | `messiah-complex` | 2023 | `small-expansion` | 8 | 3 | 4 | 2 | 4 |
| `Marvel Noir` | `marvel-noir` | 2023 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |
| `Spider-Man Homecoming` | `spider-man-homecoming` | 2024 | `small-expansion` | 5 | 2 | 2 | 0 | 4 |

---

## Explicitly excluded inventory

| Source Extension Name | Reason |
|---|---|
| `Villains` | excluded by approved scope decision `Q1: B` |

---

## Runtime entity expectations

### Masterminds
Mastermind runtime entities must carry a resolved lead reference:

```js
{
  id: string,
  setId: string,
  name: string,
  lead: {
    category: "villains" | "henchmen",
    id: string
  } | null
}
```

### Schemes
Scheme runtime entities must carry structured setup rules:

```js
{
  id: string,
  setId: string,
  name: string,
  constraints: { minimumPlayerCount: number | null },
  forcedGroups: Array<{ category: "villains" | "henchmen", id: string }>,
  modifiers: RuleModifier[],
  notes: string[]
}
```

---

## Source-backed edge cases that implementation must support

### Masterminds can force a henchman group
Examples from the source data:
- `Dr. Doom` → `Doombot Legion` (`henchmen`)
- `J. Jonah Jameson` → `Spider-Slayer` (`henchmen`)
- `Spider Queen` → `Spider-Infected` (`henchmen`)

### Some sets have no entries in some categories
Examples:
- `Dimensions` has `0 villains` and `0 schemes`
- many small expansions have `0 henchmen`

### Some sets have non-standard counts
Examples:
- `Fear Itself` has `6 heroes` and `3 schemes`
- `S.H.I.E.L.D.` has `4 heroes`
- `Into the Cosmos` and `Revelations` have larger-than-usual hero counts for their UI classifications

### Some schemes carry structured setup restrictions
Examples from the source data:
- `Super Hero Civil War` has `minimumPlayerCount: 2` in `Core Set`
- `Secret Invasion of the Skrull Shapeshifters` forces `Skrulls`
- `Negative Zone Prison Breakout` adds a henchman group
- `Midtown Bank Robbery` changes the bystander count

---

## Freshness and reuse rule

Per approved clarification `Q6: A` with the added rule:
- all included sets remain selectable in Browse / Collection
- setup generation must validate legality against the owned pool first
- when the owned pool is legal but there are not enough **never-played** items in a category, selection falls back to the **least-played** eligible items
- tie-breaking between equally least-played items should use oldest `lastPlayedAt`, then random selection

This rule applies independently to heroes, masterminds, villain groups, henchman groups, and schemes.
