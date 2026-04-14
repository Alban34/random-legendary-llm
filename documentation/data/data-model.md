# Data Model Specification

STATUS: Approved

## Purpose

This document defines the **data structures** used by the project.

It distinguishes between:
- **canonical client-shipped game data** owned by the project,
- **normalized runtime data** used by the app,
- and **persisted application state** stored in the browser.

The BoardGameGeek pages remain the verification source during documentation and maintenance, but the application itself should run on its own clean canonical format.

## Current shipped implementation snapshot

The current release builds a bundle with `createEpic1Bundle(seed)` and persists exactly one browser-state object under `legendary_state_v1`.

Persisted slices in V1:
- `collection` — owned set IDs
- `usage` — per-category `plays` and `lastPlayedAt`
- `history` — accepted game records stored with IDs only plus optional result data
- `preferences` — last player count, legacy Advanced Solo flag, normalized play mode, selected tab, onboarding completion, the active theme ID, and the active locale ID

### `ThemeId`

```text
"dark" | "light"
```

The default selection rule is `dark` so the current shipped visual identity stays stable for existing users. Legacy stored values `midnight` and `newsprint` normalize safely to `dark` and `light`, and invalid or missing stored theme values recover safely to the default.

### `LocaleId`

```text
"en-US" | "fr-FR" | "de-DE" | "ja-JP" | "ko-KR" | "es-ES"
```

The user-visible locale selector exposes six locales: `en-US` (English), `fr-FR` (French), `de-DE` (German), `ja-JP` (Japanese), `ko-KR` (Korean), and `es-ES` (Spanish). The default is `en-US`.

Ephemeral UI-only state such as the current generated setup, active toast notifications, open confirmation modal, and transient recovery notices is intentionally kept out of persisted browser state.

Two-Handed Solo is now modeled as a first-class play mode. It is still recorded as a solo game in history, but the setup template uses the standard 2-player counts.

### `PlayMode`

```text
"standard" | "advanced-solo" | "two-handed-solo"
```

`advancedSolo` remains in persisted state and history for backward compatibility with earlier saved data, but new runtime logic resolves `playMode` as the normalized source of truth.

---

## 1. Canonical client-shipped seed data

The app should ship one canonical project-owned data asset, verified from the authoritative references listed in `documentation/data/sources.md`:

```text
src/data/canonical-game-data.json
```

At startup, the app builds the nested canonical source object used by the runtime:

```text
const SOURCE_GAME_DATA = buildCanonicalSourceData(SEED_GAME_DATA);
```

That canonical source remains nested by set.

### `Set`

```text
{
  id: string,
  name: string,
  year: number,
  type: "base" | "large-expansion" | "small-expansion" | "standalone",
  aliases: string[],
  heroes: Hero[],
  masterminds: Mastermind[],
  villainGroups: VillainGroup[],
  henchmanGroups: HenchmanGroup[],
  schemes: Scheme[]
}
```

> **Epic 22 taxonomy update:** `Villains` was reclassified from `"standalone"` to `"base"`. Both `Core Set` and `Villains` are now base games. `"standalone"` remains a valid type for `Revelations`.

### `Hero`

```text
{
  id: string,
  setId: string,
  name: string,
  aliases: string[],
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
  aliases: string[],
  leadName: string | null,
  leadCategory: "villains" | "henchmen" | null,
  notes: string[]
}
```

### `VillainGroup`

```text
{
  id: string,
  setId: string,
  name: string,
  aliases: string[],
  cardCount: number
}
```

### `HenchmanGroup`

```text
{
  id: string,
  setId: string,
  name: string,
  aliases: string[],
  cardCount: number
}
```

### `Scheme`

```text
{
  id: string,
  setId: string,
  name: string,
  aliases: string[],
  constraints: {
    minimumPlayerCount: number | null
  },
  forcedGroups: Array<{
    category: "villains" | "henchmen",
    name: string
  }>,
  modifiers: RuleModifier[],
  notes: string[]
}
```

---

## 2. Normalized runtime data

At startup, the app should derive a normalized runtime model from the canonical source object:

```text
const RUNTIME_DATA = normalizeGameData(SOURCE_GAME_DATA);
```

This runtime data is **not persisted**. It is rebuilt on load.

The shipped runtime bundle shape is:

```text
{
  source,
  runtime,
  counts,
  tests
}
```

### Runtime shape

```text
{
  sets: Set[],
  indexes: {
    setsById: Record<string, Set>,
    heroesById: Record<string, Hero>,
    mastermindsById: Record<string, NormalizedMastermind>,
    villainGroupsById: Record<string, VillainGroup>,
    henchmanGroupsById: Record<string, HenchmanGroup>,
    schemesById: Record<string, NormalizedScheme>,
    allHeroes: Hero[],
    allMasterminds: NormalizedMastermind[],
    allVillainGroups: VillainGroup[],
    allHenchmanGroups: HenchmanGroup[],
    allSchemes: NormalizedScheme[]
  }
}
```

### `NormalizedMastermind`

```text
{
  id: string,
  setId: string,
  name: string,
  aliases: string[],
  lead: {
    category: "villains" | "henchmen",
    id: string
  } | null,
  notes: string[]
}
```

### `NormalizedScheme`

```text
{
  id: string,
  setId: string,
  name: string,
  aliases: string[],
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

### Why both canonical and normalized layers exist

- canonical data remains human-manageable and set-oriented
- normalized data converts name-based references into runtime-safe ID-based structures
- the app stays simple at runtime without carrying import-phase metadata forever

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
    lastPlayMode: PlayMode,
    selectedTab: string | null,
    onboardingCompleted: boolean,
    themeId: ThemeId
  }
}
```

### Why a root object is preferred

- simpler migration,
- safer writes,
- easier reset,
- easier export/import later,
- fewer cross-key consistency problems.

### Hydration expectations for Epic 2

When the app starts, persisted state should be hydrated only after runtime indexes are available.

Hydration rules:
- invalid JSON or invalid root shape falls back to a fresh default state
- stored `ownedSetIds` must be revalidated against `RUNTIME_DATA.indexes.setsById`
- invalid stored entity references should be removed safely rather than crashing startup
- any recovery notice shown to the user should be treated as ephemeral UI state, not as persisted root-state data
- if browser storage is unavailable entirely, the app should keep running in-memory for the current session and surface a degraded-mode warning

Forced-pick selections from Epic 15 are also ephemeral UI-only state. They intentionally do not persist in browser storage and do not appear in accepted `GameRecord` snapshots.

The active theme is persisted, but the startup script in `index.html` applies it before the main app boot completes so first paint stays aligned with the stored preference.

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

This is the concrete implementation form of the approved "reuse the least-played cards" rule.

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
  playMode: PlayMode,
  setupSnapshot: {
    mastermindId: string,
    schemeId: string,
    heroIds: string[],
    villainGroupIds: string[],
    henchmanGroupIds: string[]
  },
  result: GameResult
}
```

### `GameResult`

```text
{
  status: "pending" | "completed",
  outcome: "win" | "loss" | null,
  score: number | null,
  notes: string,
  updatedAt: string | null
  }
}
```

For completed results, `score` is required for wins and optional for losses.

### Why IDs only

- avoids ambiguity with duplicate names,
- keeps history stable if display formatting changes,
- lets the UI resolve current labels from runtime indexes,
- and allows result data to evolve without duplicating the underlying accepted setup snapshot.

Accepted setups now create `GameRecord`s immediately with a pending `GameResult`. Result entry is supported both immediately after acceptance and later from History.
