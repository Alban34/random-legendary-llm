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

---

## Player Count Setup Table

| Players | Mode | Heroes | Villain Groups | Henchman Groups | Wounds |
|---|---|---:|---:|---:|---:|
| 1 | Standard Solo | 3 | 1 | 1 | 25 |
| 1 | Advanced Solo | 4 | 2 | 1 | 25 |
| 2 | Standard | 5 | 2 | 1 | 30 |
| 3 | Standard | 5 | 3 | 1 | 30 |
| 4 | Standard | 6 | 3 | 2 | 35 |
| 5 | Standard | 6 | 4 | 2 | 35 |

---

## Core setup sequence

1. determine the requested setup template from `SETUP_RULES`
2. build owned pools from the selected collection
3. validate that the owned collection can legally support the requested setup
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

Examples of legality checks:
- enough total Heroes exist for the requested game
- enough total Villain Groups exist after accounting for forced groups
- enough total Henchman Groups exist after accounting for forced groups
- the selected Scheme is legal for the selected player count
- Advanced Solo is only available in 1-player mode

If the owned pool is not legally sufficient, the app must fail with a clear message.

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

---

## Hero deck abstraction

For V1, the app tracks heroes at the **deck unit** level.

That means:
- one Hero selection represents that entire hero deck,
- the app does not track individual cards within a hero deck,
- future card-level tracking remains possible but is out of scope.

---

## Out of scope for V1

The app sets up games but does not simulate gameplay.

Not included in V1:
- HQ management during play
- turn flow
- combat resolution
- win/loss tracking
- Mastermind tactic progression
