# Architecture Specification

STATUS: Approved

## Purpose

This document defines the **runtime architecture** for the project.

It explains how the application should use a project-owned canonical data format, initially verified from the two BoardGameGeek reference sources listed in `documentation/data/sources.md`, in a way that is:
- easy to render in a single-page app,
- safe to persist in browser storage,
- robust against duplicate display names,
- transparent about rule interpretation,
- and extensible for future sets and game rules.

## Current shipped implementation snapshot

The current release keeps the architecture described below and implements it with these primary runtime entry points:

- `index.html` — app mount point containing `<div id="app"></div>` and the Vite entry script
- `src/app/backup-utils.mjs` — versioned backup serialization, parsing, validation, and merge helpers
- `src/app/localization-utils.mjs` — locale metadata, translation lookup, fallback handling, and locale-aware formatting helpers
- `src/app/theme-utils.mjs` — supported theme metadata and theme-ID normalization helpers
- `src/app/browser-entry.mjs` — mounts the root `App.svelte` component via Svelte 5 `mount()`
- `src/app/game-data-pipeline.mjs` — builds the Epic 1 bundle through `createEpic1Bundle(seed)`
- `src/app/state-store.mjs` — owns the versioned root state persisted under `legendary_state_v1`
- `src/app/state-store.svelte.js` — Svelte 5 reactive wrapper; `_appState` backed by `$state`
- `src/app/setup-rules.mjs` and `src/app/setup-generator.mjs` — resolve templates and produce legal setups
- `src/app/app-renderer.mjs` — transitional render functions used via `{@html}` blocks in Svelte tab components
- `src/app/browse-vm.svelte.js` — browse tab view-model; owns browse-specific reactive state
- `src/app/new-game-vm.svelte.js` — new-game tab view-model; owns new-game-specific reactive state
- `src/app/history-vm.svelte.js` — history tab view-model; owns history-specific reactive state
- `src/app/backup-vm.svelte.js` — backup tab view-model; owns backup-specific reactive state
- `src/components/App.svelte` — root Svelte 5 component; orchestrates routing and persistence; tab-specific state is delegated to per-tab view-model modules
- `src/components/TabNav.svelte` — Svelte 5 tab navigation component
- `src/components/ToastStack.svelte` — Svelte 5 toast stack component
- `src/components/BrowseTab.svelte`, `CollectionTab.svelte`, `NewGameTab.svelte`, `HistoryTab.svelte`, `BackupTab.svelte` — thin `{@html}` wrapper components for each feature tab

The shipped runtime bundle created by `createEpic1Bundle(seed)` exposes project-owned canonical source data, normalized runtime data, summary counts, and validation test results for the browser shell.

The shipped shell currently exposes five primary tab panels with IDs that match the persisted preference and renderer contracts:
- `browse`
- `collection`
- `new-game`
- `history`
- `backup`

The shell also now applies persisted `data-theme` and `lang` values on `document.documentElement` before the module bootstrap finishes so theme and locale preference stay aligned with first paint.

---

## Architectural principles

### 1. Static-served single-page implementation, multi-file design
The final app should remain a **single-page application**, but it no longer needs to be a single physical file.

It should be served by a **static HTTP server** using project-owned HTML, CSS, JavaScript modules, and data assets.

Recommended conceptual layers:
1. **Canonical Client Data Layer** — project-owned static game data asset
2. **Normalization Layer** — resolves canonical data into runtime-safe IDs and indexes
3. **Runtime Index Layer** — flattened lookup maps for fast access
4. **Application State Layer** — persisted user collection, usage stats, history, preferences
5. **UI Layer** — renders tabs, forms, setup results, and history

Recommended physical split:
- `index.html` — app mount point
- `src/app/*.mjs` — runtime modules
- `src/app/*.svelte.js` — Svelte 5 reactive module wrappers
- `src/app/*.css` — styles
- `src/components/*.svelte` — Svelte 5 UI components
- `src/data/*` — project-owned static data assets

Even though these now live in separate files, they should remain logically separate as layers.

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

### Canonical client-shipped data
The app should ship one canonical project-local data asset that is loaded entirely on the client:

```text
src/data/canonical-game-data.json
```

That asset can be transformed at startup into the canonical nested runtime source model, which remains organized by set because that matches:
- the product-oriented structure of the game line,
- the browsing UI,
- and the natural collection-building flow.

### Derived runtime data
At startup, the app should derive a normalized runtime model:

```text
const EPIC1_BUNDLE = createEpic1Bundle(SEED_GAME_DATA);
const RUNTIME_DATA = EPIC1_BUNDLE.runtime;
```

This runtime layer is not persisted. It is rebuilt whenever the page loads.

## Data flow

### Level 1 — Canonical client data asset
This is the application's own maintained static data asset.

Examples of fields that belong here:
- display names
- set membership
- aliases if they help search or consistency
- structured setup notes and rule fields

### Level 2 — Canonical runtime source
At startup the client first builds the nested canonical source model used by the rest of the app.

Example:

```text
const SOURCE_GAME_DATA = buildCanonicalSourceData(SEED_GAME_DATA);
```

### Level 3 — Normalized runtime layer
This layer converts canonical data into app-safe structures.

Examples of fields that belong here:
- stable IDs
- resolved mastermind lead IDs
- resolved scheme forced-group IDs
- runtime indexes

### Level 4 — Persisted user state
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
Canonical source fact:

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

Current key:

```text
legendary_state_v1
```

Current shape:

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
    lastPlayMode: string,
    onboardingCompleted: boolean,
    themeId: string,
    selectedTab: string | null
  }
}
```

### Why one root object is preferred
- easier schema migration,
- simpler reset behavior,
- less risk of partial writes,
- easier mapping into a portable backup schema,
- clearer mental model.

### Epic 2 implementation boundary recommendation
Within the current static modular app, Epic 2 should keep persistence concerns separate from data normalization and rendering.

Current module responsibilities:
- `src/app/game-data-pipeline.mjs` — canonical data transformation, normalization, and runtime indexes only
- `src/app/browser-entry.mjs` — mounts `App.svelte` via Svelte 5 `mount()`; no longer owns ephemeral UI state or rendering
- `src/components/App.svelte` — root Svelte 5 component; owns viewModel `$state` and wires state into all child tab components
- a dedicated Epic 2 state/storage module under `src/app/` — default-state creation, load/save/update helpers, reset helpers, and storage availability handling
- renderer modules — transitional render functions consumed via `{@html}` in Svelte tab components; surface recovery or validation messages, notifications, and confirmation UI, but do not own persistence logic

Recommended hydration order:
1. load canonical game data and build `RUNTIME_DATA`
2. load persisted `legendary_state_v1`
3. validate stored IDs against runtime indexes
4. recover invalid/corrupted slices safely
5. render the app with runtime data plus hydrated user state

### Portable backup contract

The shipped Backup tab owns the data-management actions instead of mixing them into History. It exports a separate portable backup envelope instead of serializing the internal browser-storage object directly.

Current backup shape:

```text
{
  schemaId: "legendary-marvel-randomizer-backup",
  version: 1,
  exportedAt: string,
  metadata: {
    appId: "legendary-marvel-randomizer",
    storageKey: "legendary_state_v1",
    stateSchemaVersion: 1
  },
  data: {
    collection,
    usage,
    history,
    preferences
  }
}
```

Current restore behavior:
- import validation rejects malformed JSON, unsupported schema identifiers, unsupported versions, and partial payloads before any write occurs,
- accepted imports are re-sanitized through the same persisted-state validation path used during normal hydration,
- **Merge** unions collection/history, merges usage conservatively, and applies imported preferences,
- **Replace** swaps the full persisted state for the imported backup.

History grouping remains intentionally outside the persisted root state and backup schema. The active grouping mode is a presentation-only History-tab concern that resets to the default mode on reload and after backup restore.

---

## Usage tracking model

The app should not store only "used vs unused".

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

This remains the recommended runtime policy behind the approved "reuse the least-played cards" rule.

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

## Static hosting recommendation

The app should assume it is opened through a static HTTP server rather than directly via `file://`.

Why:
- ES module loading is straightforward and standards-based
- JSON/data asset loading stays simple
- the app remains deployable to GitHub Pages, Netlify static hosting, S3-style hosting, or a local `python3 -m http.server`
- Epic 2+ logic becomes much easier to test and maintain than in one monolithic HTML file

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
