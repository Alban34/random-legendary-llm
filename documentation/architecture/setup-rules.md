# Setup Rules Reference

STATUS: Approved

## Purpose

This document describes the **setup behavior** the app must implement.

It focuses on:
- player-count setup requirements,
- mandatory Mastermind leads,
- structured Scheme effects,
- legality checks,
- and selection priority rules.

The shipped implementation resolves these templates through `resolveSetupTemplate(playerCount, { advancedSolo, playMode })` and applies them inside `generateSetup(...)` before any usage or history state is mutated.

---

## Player Count Setup Table

| Players | Mode | Heroes | Villain Groups | Henchman Groups | Wounds |
|---|---|---:|---:|---:|---:|
| 1 | Standard Solo | 3 | 1 | 1 | 25 |
| 1 | Advanced Solo | 3 | 1 | 1 | 25 |
| 1 | Two-Handed Solo | 5 | 2 | 1 | 30 |
| 2 | Standard | 5 | 2 | 1 | 30 |
| 3 | Standard | 5 | 3 | 1 | 30 |
| 4 | Standard | 6 | 3 | 2 | 35 |
| 5 | Standard | 6 | 4 | 2 | 35 |

---

## Core setup sequence

1. determine the requested setup template from `SETUP_RULES`
2. resolve the active pool: `state.collection.activeSetIds ?? null` is computed first; if the result is `null`, call `buildOwnedPools(runtime, ownedSetIds)` — this is the "Use all expansions" state (`activeSetIds === null`), where all owned-expansion checkboxes appear checked; if the result is an array (empty or non-empty), call `buildOwnedPools(runtime, activeSetIds)` directly — a non-empty array is an active expansion subset, while `[]` is the "Clear selection" state (all checkboxes unchecked, `deactivateAllSets` action) which produces an empty pool that always fails legality and disables the Generate button; only `null` falls through to the full owned collection
3. validate that the resolved active pool can legally support the requested setup
4. choose a Scheme
5. choose a Mastermind
6. apply forced groups from the Scheme and Mastermind
7. fill remaining Villain Group and Henchman Group slots
8. choose Heroes
9. present the setup result to the user
10. only on acceptance, update usage stats and append to history

---

## Legality before freshness

The app must validate legality **before** applying freshness / least-played logic.

Both `validateSetupLegality` and `generateSetup` resolve the active pool identically (see Core setup sequence step 2). When an active expansion filter is set, legality is checked against that filtered subset, not the full owned collection. This means the New Game tab can surface a pre-generation feasibility warning when the active filter's card pool is too small.

Examples of legality checks:
- enough total Heroes exist for the requested game
- enough total Villain Groups exist after accounting for forced groups
- enough total Henchman Groups exist after accounting for forced groups
- the selected Scheme is legal for the selected player count
- the selected Scheme is not marked incompatible with the active play mode (e.g. `incompatiblePlayModes` does not contain the resolved mode key)
- Advanced Solo is only available in 1-player mode
- Two-Handed Solo is only available in 1-player mode

If the resolved active pool is not legally sufficient, the app must fail with a clear message.

Two-Handed Solo uses the standard 2-player setup counts while keeping accepted history records labeled as a solo mode.

---

## Mastermind lead rule

Every Mastermind may define a mandatory lead group.

Runtime model:

```text
lead: {
  category: "villains" | "henchmen",
  id: string
} | null
```

### Behavior
- the lead is mandatory and cannot be skipped
- if the lead is a Villain Group, it consumes one villain-group slot
- if the lead is a Henchman Group, it consumes one henchman slot
- the lead is still tracked in usage stats when the setup is accepted

### Examples from the approved source data
- `Red Skull` → `HYDRA` (`villains`)
- `Dr. Doom` → `Doombot Legion` (`henchmen`)
- `Spider Queen` → `Spider-Infected` (`henchmen`)

---

## Scheme rule model

Schemes should be interpreted through a structured rule model.

Recommended runtime shape:

```text
{
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

### Supported rule categories for V1
- minimum player count
- forced villain or henchman group
- increase hero requirement
- increase villain-group requirement
- increase henchman-group requirement
- set bystander count

### Examples
- `Secret Invasion of the Skrull Shapeshifters` forces `Skrulls`
- `Negative Zone Prison Breakout` adds one henchman group
- `Midtown Bank Robbery` changes bystander count
- `Super Hero Civil War` has a minimum player count in the source data

---

## Selection priority rule

Once legality is established, each category uses the following selection priority:

1. items never used in an accepted game
2. items with the lowest `plays`
3. items with the oldest `lastPlayedAt`
4. random tie-break between remaining equals

This priority applies independently to:
- Heroes
- Masterminds
- Villain Groups
- Henchman Groups
- Schemes

### Example
If a 5-player setup requires 6 heroes and the owned pool contains:
- 3 never-played heroes,
- 5 heroes played once,
- 4 heroes played twice,

then the generator should:
1. take the 3 never-played heroes,
2. fill the remaining 3 slots from the heroes with `plays = 1`,
3. prefer the oldest `lastPlayedAt` among those ties,
4. then randomize any final tie.

---

## Acceptance vs regeneration

### Generate / Regenerate
- does **not** update usage stats
- does **not** create a history record
- may be repeated freely

### Accept & Log
- updates usage stats for every selected category
- records `lastPlayedAt`
- appends a `GameRecord` to history
- opens immediate result entry in History while still allowing the game result to stay pending for later completion

### Result logging
- accepted setups start with a pending result state
- completed results require a win/loss outcome
- wins require a non-negative whole-number score
- losses may omit the score entirely, but any entered loss score must still be a non-negative whole number
- optional notes may be added to a completed result
- result edits update the existing history record instead of creating a duplicate entry

---

## Guided setup constraints

The generator also supports optional user-selected forced picks.

Supported categories:
- one forced Scheme
- one forced Mastermind
- zero or more forced Heroes
- zero or more forced Villain Groups
- zero or more forced Henchman Groups

Behavior:
- forced picks are applied before random slot-filling begins
- forced picks may overlap with mandatory Scheme groups or Mastermind leads without duplicating the selected entity
- if forced picks plus mandatory groups exceed the available slots, generation must fail with a specific reason
- forced picks are a one-shot UI constraint: they stay active for Generate and Regenerate, then clear after a successful Accept & Log or a reload
- forced picks are not written into accepted history snapshots

---
