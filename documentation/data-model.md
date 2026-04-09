# Data Model Specification

STATUS: Approved

## Purpose

This document defines the **data structures** used by the project.

It distinguishes between:
- **canonical embedded data**,
- **derived runtime data**,
- and **persisted application state**.

This distinction is intentional and is part of the final architecture direction.

---

## 1. Canonical embedded game data

The app should embed a canonical source-backed constant:

```text
const SOURCE_GAME_DATA = {
  sets: Set[]
};
```

This canonical data remains **nested by set**.

### `Set`

```text
{
  id: string,
  name: string,
  year: number,
  type: "base" | "large-expansion" | "small-expansion" | "standalone",
  heroes: Hero[],
  masterminds: Mastermind[],
  villainGroups: VillainGroup[],
  henchmanGroups: HenchmanGroup[],
  schemes: SourceScheme[]
}
```

### `Hero`

```text
{
  id: string,
  setId: string,
  name: string,
  teams: string[],
  cardCount: number
}
```

### `Mastermind`

```text
{
  id: string,
  setId: string,
  name: string,
  lead: {
    category: "villains" | "henchmen",
    id: string
  } | null,
  specialLead: string | null,
  epicVariant: boolean
}
```

### `VillainGroup`

```text
{
  id: string,
  setId: string,
  name: string,
  cardCount: number
}
```

### `HenchmanGroup`

```text
{
  id: string,
  setId: string,
  name: string,
  cardCount: number
}
```

### `SourceScheme`

This is the canonical source-backed scheme shape before the generator interprets it.

```text
{
  id: string,
  setId: string,
  name: string,
  constraints: {
    minimumPlayerCount: number | null
  },
  forcedGroups: Array<{
    category: "villains" | "henchmen",
    id: string
  }>,
  modifiers: RuleModifier[],
  notes: string[]
}
```

### `RuleModifier`

```text
{
  type: string,
  value?: number,
  amount?: number,
  category?: "heroes" | "villainGroups" | "henchmanGroups" | "schemes" | "bystanders"
}
```

Examples:
- `{ type: "set-bystanders", value: 12 }`
- `{ type: "add-villain-group", amount: 1 }`
- `{ type: "set-min-heroes", value: 6 }`

---

## 2. Runtime normalized data

At startup, the app should derive a normalized runtime model:

```text
const RUNTIME_DATA = normalizeGameData(SOURCE_GAME_DATA);
```

This runtime data is **not persisted**. It is rebuilt on load.

### Runtime shape

```text
{
  sets: Set[],
  indexes: {
    setsById: Record<string, Set>,
    heroesById: Record<string, Hero>,
    mastermindsById: Record<string, Mastermind>,
    villainGroupsById: Record<string, VillainGroup>,
    henchmanGroupsById: Record<string, HenchmanGroup>,
    schemesById: Record<string, SourceScheme>,
    allHeroes: Hero[],
    allMasterminds: Mastermind[],
    allVillainGroups: VillainGroup[],
    allHenchmanGroups: HenchmanGroup[],
    allSchemes: SourceScheme[]
  }
}
```

### Why both nested and flat layers exist

- `sets[]` supports browsing and collection organization
- flattened indexes support:
  - setup generation,
  - fast ID lookup,
  - history rendering,
  - validation,
  - duplicate-name safety

---

## 3. Persisted browser state

The app should persist **one versioned root state object**.

### Storage key

```text
"legendary_state_v1"
```

### Persisted root shape

```text
{
  schemaVersion: 1,
  collection: {
    ownedSetIds: string[]
  },
  usage: {
    heroes: Record<string, UsageStat>,
    masterminds: Record<string, UsageStat>,
    villainGroups: Record<string, UsageStat>,
    henchmanGroups: Record<string, UsageStat>,
    schemes: Record<string, UsageStat>
  },
  history: GameRecord[],
  preferences: {
    lastPlayerCount: number,
    lastAdvancedSolo: boolean,
    selectedTab: string | null
  }
}
```

### Why a root object is preferred

- simpler migration,
- safer writes,
- easier reset,
- easier export/import later,
- fewer cross-key consistency problems.

---

## 4. Usage tracking

The app should track lightweight usage statistics rather than only booleans or count arrays.

### `UsageStat`

```text
{
  plays: number,
  lastPlayedAt: string | null
}
```

### Selection priority

For each category:
1. prefer never-played items,
2. then prefer lowest `plays`,
3. then prefer oldest `lastPlayedAt`,
4. then break ties randomly.

This is the concrete implementation form of the approved “reuse the least-played cards” rule.

---

## 5. History model

Accepted setups should be stored using IDs only.

### `GameRecord`

```text
{
  id: string,
  createdAt: string,
  playerCount: 1 | 2 | 3 | 4 | 5,
  advancedSolo: boolean,
  setupSnapshot: {
    mastermindId: string,
    schemeId: string,
    heroIds: string[],
    villainGroupIds: string[],
    henchmanGroupIds: string[]
  }
}
```

### Why IDs only

- avoids ambiguity with duplicate names,
- keeps history stable if display formatting changes,
- lets the UI resolve current labels from runtime indexes.

---

## 6. Derived in-memory collections

These are computed from `RUNTIME_DATA` plus persisted state:

| Variable | Description |
|---|---|
| `ownedSets` | all sets selected by the user |
| `ownedHeroes` | all heroes from owned sets |
| `ownedMasterminds` | all masterminds from owned sets |
| `ownedVillainGroups` | all villain groups from owned sets |
| `ownedHenchmanGroups` | all henchman groups from owned sets |
| `ownedSchemes` | all schemes from owned sets |
| `state` | hydrated persisted root state |

---

## 7. Setup rules constant

```js
const SETUP_RULES = {
  1: { heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 },
  "1-advanced": { heroCount: 4, villainGroupCount: 2, henchmanGroupCount: 1, wounds: 25 },
  2: { heroCount: 5, villainGroupCount: 2, henchmanGroupCount: 1, wounds: 30 },
  3: { heroCount: 5, villainGroupCount: 3, henchmanGroupCount: 1, wounds: 30 },
  4: { heroCount: 6, villainGroupCount: 3, henchmanGroupCount: 2, wounds: 35 },
  5: { heroCount: 6, villainGroupCount: 4, henchmanGroupCount: 2, wounds: 35 }
};
```

---

## 8. Validation expectations

The normalization layer should validate:
- unique set IDs,
- unique entity IDs,
- valid mastermind lead references,
- valid scheme forced-group references,
- valid persisted IDs when hydrating state.

The generator should validate:
- selected collection legality,
- player-count legality,
- Advanced Solo eligibility,
- forced-group slot accounting,
- least-played fallback only after legality is confirmed.

---

## 9. Extensibility notes

- new sets should be addable by inserting a new `Set` object in the canonical data
- new scheme behaviors should be expressible by adding new `RuleModifier.type` values
- UI labels can evolve without changing persisted history because history stores IDs
- future export/import can serialize the entire root state object directly
- if needed later, the same architecture can support additional game modes without replacing the data layer
