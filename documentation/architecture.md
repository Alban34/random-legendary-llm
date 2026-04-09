# Architecture Specification

STATUS: Approved

## Purpose

This document defines the **runtime architecture** for the project.

It explains how the application should transform the source-backed game data into a format that is:
- easy to render in a single-page app,
- safe to persist in browser storage,
- robust against duplicate display names,
- and extensible for future sets and game rules.

---

## Architectural principles

### 1. Single-file implementation, multi-layer design
The final app will be implemented in a single `index.html`, but the internal design must still be layered.

Recommended conceptual layers:
1. **Source Data Layer** — embedded canonical game data
2. **Normalization Layer** — resolves source strings into stable IDs and references
3. **Runtime Index Layer** — flattened lookup maps for fast access
4. **Application State Layer** — persisted user collection, usage stats, history, preferences
5. **UI Layer** — renders tabs, forms, setup results, and history

Even though all of these live in one file, they should remain logically separate.

---

## Canonical vs derived data

### Canonical embedded data
The app should embed one canonical source-backed constant:

```text
const SOURCE_GAME_DATA = {
  sets: Set[]
};
```

This canonical data remains nested by set because that matches:
- the source project structure,
- the browsing UI,
- and the natural product organization.

### Derived runtime data
At startup, the app should derive a normalized runtime model:

```text
const RUNTIME_DATA = normalizeGameData(SOURCE_GAME_DATA);
```

This layer should not be persisted. It is rebuilt whenever the page loads.

---

## Normalization pipeline

The normalization step should do the following:

1. assign stable **set-scoped IDs** to all entities,
2. keep source display names exactly as provided,
3. resolve source references like `alwaysLead` into actual runtime IDs,
4. convert scheme setup information into a structured rule model,
5. build flattened indexes for fast lookup,
6. validate cross-references and report errors early.

### Example
Source-like entry:

```text
{
  name: "Dr. Doom",
  alwaysLead: "Doombot Legion",
  alwaysLeadCategory: "henchmen"
}
```

Normalized runtime entry:

```text
{
  id: "core-set-dr-doom",
  setId: "core-set",
  name: "Dr. Doom",
  lead: {
    category: "henchmen",
    id: "core-set-doombot-legion"
  }
}
```

---

## Runtime indexes

The canonical `sets[]` structure should be preserved, but the app should also generate flattened indexes.

Recommended runtime structure:

```text
{
  sets: Set[],
  indexes: {
    setsById: Record<string, Set>,
    heroesById: Record<string, Hero>,
    mastermindsById: Record<string, Mastermind>,
    villainGroupsById: Record<string, VillainGroup>,
    henchmanGroupsById: Record<string, HenchmanGroup>,
    schemesById: Record<string, Scheme>,
    allHeroes: Hero[],
    allMasterminds: Mastermind[],
    allVillainGroups: VillainGroup[],
    allHenchmanGroups: HenchmanGroup[],
    allSchemes: Scheme[]
  }
}
```

### Why both layers are needed

#### Keep `sets[]`
Needed for:
- browse-by-expansion UI,
- collection management,
- human readability,
- source fidelity.

#### Add indexes
Needed for:
- generator logic,
- ID lookups,
- display-name resolution,
- history rendering,
- validation.

The app should therefore use:
- **nested canonical data for structure**, and
- **flattened derived indexes for behavior**.

---

## Persistence architecture

The app should persist **one versioned root state object** in browser storage.

Recommended key:

```text
legendary_state_v1
```

Recommended shape:

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

### Why one root object is preferred
- easier schema migration,
- simpler reset behavior,
- less risk of partial writes,
- easier export/import later,
- clearer mental model.

---

## Usage tracking model

The app should not store only “used vs unused”.

It should track lightweight per-item usage stats:

```text
UsageStat {
  plays: number,
  lastPlayedAt: string | null
}
```

### Selection priority
For each category:
1. prefer never-played items,
2. then prefer lowest `plays`,
3. then prefer oldest `lastPlayedAt`,
4. then break remaining ties randomly.

This is the recommended runtime policy behind the approved “reuse the least-played cards” rule.

---

## ID strategy

All runtime references should use IDs, not display names.

### Rules
- Display names remain source-accurate
- Runtime references are always by ID
- Duplicate names are allowed across sets
- History stores IDs, not names
- UI resolves IDs back to labels through indexes

### Example
Instead of storing:

```js
{ mastermind: "Dr. Doom" }
```

store:

```text
{ mastermindId: "core-set-dr-doom" }
```

---

## Rule modeling for schemes and setup effects

The source data includes multiple forms of setup behavior.

To stay extensible, the runtime model should not use many unrelated one-off fields.

Recommended structure:

```text
Scheme {
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
  modifiers: Array<{
    type: string,
    value?: number,
    amount?: number
  }>,
  notes: string[]
}
```

### Examples of modifier types
- `add-hero`
- `add-villain-group`
- `add-henchman-group`
- `set-bystanders`
- `set-min-heroes`
- `replace-villain-group-with-specific-group`

The exact modifier vocabulary can stay small in V1 and expand later.

---

## Validation responsibilities

The normalization layer should validate:
- all set IDs are unique,
- all entity IDs are unique,
- all resolved lead references exist,
- all forced scheme groups exist,
- all persisted IDs from storage still resolve,
- and all categories required for setup can be checked before generation.

The generator should validate:
- the owned collection can legally support the selected setup,
- Advanced Solo is only used with 1 player,
- the forced Mastermind lead is counted in the correct category,
- the least-played fallback only occurs after legality is established.

---

## Final recommendation

### Canonical data
Keep it nested by set.

### Runtime behavior
Operate on normalized, ID-resolved, indexed data.

### Persistence
Store one versioned root state object.

### Usage tracking
Store `plays + lastPlayedAt`, not only counts or booleans.

### Rules
Model scheme effects as structured rules plus human-readable notes.

This is the recommended architecture for implementation.
