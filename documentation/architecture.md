# Architecture Specification

STATUS: Approved

## Purpose

This document defines the **runtime architecture** for the project.

It explains how the application should use a project-owned canonical data format, initially verified from the two BoardGameGeek reference sources listed in `documentation/sources.md`, in a way that is:
- easy to render in a single-page app,
- safe to persist in browser storage,
- robust against duplicate display names,
- transparent about rule interpretation,
- and extensible for future sets and game rules.

---

## Architectural principles

### 1. Single-file implementation, multi-layer design
The final app will be implemented in a single `index.html`, but the internal design must still be layered.

Recommended conceptual layers:
1. **Canonical Embedded Data Layer** — project-owned embedded game data
2. **Normalization Layer** — resolves canonical data into runtime-safe IDs and indexes
3. **Runtime Index Layer** — flattened lookup maps for fast access
4. **Application State Layer** — persisted user collection, usage stats, history, preferences
5. **UI Layer** — renders tabs, forms, setup results, and history

Even though all of these live in one file, they should remain logically separate.

---

## Why BGG still matters, but not in the runtime model

The BoardGameGeek references remain important for documentation review and data verification.

However, once the game data has been verified and stored in the project's own canonical format, the runtime architecture does **not** need to behave like an import pipeline.

The app should therefore:
- use BGG as the verification source for the documentation phase,
- store the final dataset in a clean project-owned format,
- and run only on that project-owned format during implementation and maintenance.

---

## Canonical vs derived data

### Canonical embedded data
The app should embed one canonical project-local constant:

```text
const SOURCE_GAME_DATA = {
  sets: Set[]
};
```

This canonical data remains nested by set because that matches:
- the product-oriented structure of the game line,
- the browsing UI,
- and the natural collection-building flow.

### Derived runtime data
At startup, the app should derive a normalized runtime model:

```text
const RUNTIME_DATA = normalizeGameData(SOURCE_GAME_DATA);
```

This runtime layer is not persisted. It is rebuilt whenever the page loads.

## Data flow

### Level 1 — Canonical embedded data
This is the application's own maintained data format.

Examples of fields that belong here:
- display names
- set membership
- aliases if they help search or consistency
- structured setup notes and rule fields

### Level 2 — Normalized runtime layer
This layer converts canonical data into app-safe structures.

Examples of fields that belong here:
- stable IDs
- resolved mastermind lead IDs
- resolved scheme forced-group IDs
- runtime indexes

### Level 3 — Persisted user state
This layer contains only user/application state.

Examples:
- owned set IDs
- usage stats
- history
- preferences

---

## Normalization pipeline

The normalization step should do the following:

1. assign stable **set-scoped IDs** to all entities,
2. preserve source display names exactly,
3. resolve canonical references into runtime IDs,
4. validate setup-bearing rule fields,
5. build flattened indexes for fast lookup,
6. validate cross-references and report errors early.

### Example flow
Canonical embedded fact:

```text
name: "Dr. Doom"
leadName: "Doombot Legion"
leadCategory: "henchmen"
```

Normalized runtime entity:

```text
id: "core-set-dr-doom"
setId: "core-set"
name: "Dr. Doom"
lead: { category: "henchmen", id: "core-set-doombot-legion" }
```

---

## Runtime indexes

The canonical `sets[]` structure should be preserved, but the app should also generate flattened indexes.

Recommended runtime structure:

```text
RUNTIME_DATA = {
  sets: Set[],
  indexes: {
    setsById,
    heroesById,
    mastermindsById,
    villainGroupsById,
    henchmanGroupsById,
    schemesById,
    allHeroes,
    allMasterminds,
    allVillainGroups,
    allHenchmanGroups,
    allSchemes
  }
}
```

### Why both layers are needed

#### Keep `sets[]`
Needed for:
- browse-by-expansion UI,
- collection management,
- human readability,
- canonical data fidelity.

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
UsageStat = {
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

This remains the recommended runtime policy behind the approved “reuse the least-played cards” rule.

---

## ID strategy

All runtime references should use IDs, not display names.

### Rules
- Display names remain source-accurate
- Runtime references are always by ID
- Duplicate names are allowed across sets
- History stores IDs, not names
- UI resolves IDs back to labels through indexes
- aliases may exist in canonical data, but runtime logic still works only with IDs

### Example
Instead of storing:

```text
{ mastermind: "Dr. Doom" }
```

store:

```text
{ mastermindId: "core-set-dr-doom" }
```

---

## Rule modeling for schemes and setup effects

The external references include multiple forms of setup behavior.

To stay extensible, the runtime model should not use many unrelated one-off fields.

Recommended normalized structure:

```text
Scheme = {
  id,
  setId,
  name,
  constraints,
  forcedGroups,
  modifiers,
  notes
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
- all imported source references required for review are present where expected,
- and all categories required for setup can be checked before generation.

The generator should validate:
- the owned collection can legally support the selected setup,
- Advanced Solo is only used with 1 player,
- the forced Mastermind lead is counted in the correct category,
- the least-played fallback only occurs after legality is established.

---

## Final recommendation

### Canonical imported data
Preserve BGG-derived facts and provenance.

### Runtime behavior
Operate on normalized, ID-resolved, indexed data.

### Persistence
Store one versioned root state object.

### Usage tracking
Store `plays + lastPlayedAt`, not only counts or booleans.

### Rules
Model setup-affecting behavior as structured rules plus human-readable notes.

This is the recommended simplified architecture for implementation: BGG-verified, but project-owned at runtime.
