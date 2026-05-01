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

> **TypeScript types (Epic 62):** All domain type declarations described in this document are now defined as named exports in `src/app/types.ts`. That file is the authoritative TypeScript source for all shapes listed below.

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

Ephemeral UI-only state such as the current generated setup, active toast notifications, open confirmation modal, and transient recovery notices is intentionally kept out of persisted browser state. Generate/Regenerate remain ephemeral — each new setup is discarded unless the user explicitly accepts it via Accept & Log.

Two-Handed Solo is now modeled as a first-class play mode. It is still recorded as a solo game in history, but the setup template uses the standard 2-player counts.

### `PlayMode`

```text
"standard" | "advanced-solo" | "two-handed-solo" | "standard-solo-v2"
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
    minimumPlayerCount: number | null,
    incompatiblePlayModes: string[]
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
    minimumPlayerCount: number | null,
    incompatiblePlayModes: string[]
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
    ownedSetIds: string[],
    activeSetIds: string[] | null   // null = all owned (no filter); [] = none selected; non-empty = active expansion subset
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
    themeId: ThemeId,
    localeId: LocaleId
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

Forced-pick selections (introduced in Epic 15, extended in Epic 70) are also ephemeral UI-only state. They intentionally do not persist in browser storage and do not appear in accepted `GameRecord` snapshots.

### `ForcedPicks`

```text
{
  schemeId: string | null,
  mastermindId: string | null,
  heroIds: string[],
  villainGroupIds: string[],
  henchmanGroupIds: string[],
  preferredExpansionId: string | null   // Epic 70: preferred expansion tiebreaker
}
```

`createEmptyForcedPicks()` initialises all singular fields to `null` and all array fields to `[]`. `normalizeForcedPicks(raw)` coerces every field from untrusted input: each singular string field passes through as-is when it is a non-empty string, and falls back to `null` for any other value (null, undefined, missing, empty string, non-string); each array field is rebuilt as a filtered array of non-empty strings. `hasForcedPicks(fp)` returns `true` when any singular field is non-null or any array field is non-empty, including when `preferredExpansionId` is non-null.

`preferredExpansionId` names one owned expansion whose cards the generator should prefer within each play-count tier for all unclaimed slots. It is a tiebreaker below the play-count fairness system, not an override of it; see `documentation/architecture/setup-rules.md` for the full priority order.

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

### `GameRecord` / `HistoryRecord`

> **TypeScript name:** The TypeScript interface in `src/app/types.ts` is exported as `HistoryRecord`. The conceptual name `GameRecord` is used throughout this document for readability.

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

### `PlayerScoreEntry`

```text
{
  playerName: string,
  score: number | null
}
```

Represents one player's name and score within a multiplayer result. `playerName` defaults to an empty string (the UI renders `"Player N"` as a placeholder when it is empty). `score` is `null` when not yet entered or intentionally omitted for a loss.

### `GameResult`

```text
{
  status: "pending" | "completed",
  outcome: "win" | "loss" | "draw" | null,
  score: number | null | PlayerScoreEntry[],
  notes: string,
  updatedAt: string | null
}
```

`score` is polymorphic by player count:

- **Solo (`playerCount === 1`):** `number | null`. For a win, a non-negative integer is required. For a loss or draw it is optional (`null` or `≥ 0`).
- **Multiplayer (`playerCount >= 2`):** `PlayerScoreEntry[]` — one entry per player. For a win, at least one entry must have a non-null score. For a loss or draw all scores may be `null`.

A pending result always has `score: null` for solo, and `score: PlayerScoreEntry[]` (all `score: null` entries) for multiplayer. `createGameRecord()` seeds the per-player array automatically when `playerCount >= 2`.

### Why IDs only

- avoids ambiguity with duplicate names,
- keeps history stable if display formatting changes,
- lets the UI resolve current labels from runtime indexes,
- and allows result data to evolve without duplicating the underlying accepted setup snapshot.

Accepted setups now create `GameRecord`s immediately with a pending `GameResult`. Result entry is supported both immediately after acceptance and later from History.
