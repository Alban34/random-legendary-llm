# Epic 107 — Mastermind Always-Leads Data Corrections

## Objective

Correct three confirmed `leadName` / `leadCategory` errors in `src/data/canonical-game-data.json` that were identified by cross-referencing the canonical card list in `documentation/my-inputs/special-mastermind.md` against the live seed data.

The errors cause the randomizer to either lock a mastermind to a wrong fixed villain group, silently exclude eligible villain groups, or leave a fixed lead blank when a specific group is required.

---

## Background

Each mastermind record in `canonical-game-data.json` carries:
- `leadName` — name of the villain/henchman group that must be included when this mastermind is selected, or `null` when the mastermind can pair with any villain group.
- `leadCategory` — `"villains"` | `"henchmen"` | `null`.

The normalizer resolves `leadName` to `MastermindRuntime.lead: { category, id } | null`. The category selector (`resolveForcedCollections`) then forces that single resolved group into every generated setup.

A `null` leadName tells the generator to pick any villain group freely. A non-null leadName forces exactly that specific group. The wrong value in either direction produces incorrect randomizer output.

---

## In Scope

### Story 107.1 — Fix Omega Red: wrong fixed lead

**File:** `src/data/canonical-game-data.json`

| Field | Current value | Correct value |
|---|---|---|
| `leadName` | `"Berserkers"` | `null` |
| `leadCategory` | `"villains"` | `null` |

**Rationale:** The card text reads "Always Leads: Any Villain Group." Sabretooth (same set) leads Berserkers — Omega Red does not. The current data incorrectly inherits Berserkers from Sabretooth. Modelling parity: Ego, The Living Planet and Hank Pym, Yellowjacket both use `leadName: null` for the same "Any Villain Group" rule.

**Files changed:** `src/data/canonical-game-data.json` only.

**Test:** Add a unit test asserting that the Omega Red `MastermindRuntime` object resolved by the normalizer has `lead === null`.

---

### Story 107.2 — Fix Sinister Six 2099: categorical lead (schema extension required)

**Card text:** "Always Leads: Any 'Alchemax' or 'Sinister' Villain Group."

This is a **categorical** rule — not a fixed single group, but not free-choice either. The randomizer must pick exactly one villain group at random from the subset of groups whose names contain `"Alchemax"` or `"Sinister"`. Setting `leadName: null` would incorrectly allow any villain group.

The current schema has no mechanism for this; a new optional field is required.

#### 107.2a — Extend `MastermindCard` type

**File:** `src/app/types-game-data.ts`

Add an optional `leadNameFilter` field to `MastermindCard`:

```typescript
export interface MastermindCard {
  // ...existing fields...
  leadNameFilter?: string[];   // NEW: if present, lead is sampled from villain groups whose name includes any of these strings
}
```

#### 107.2b — Extend `MastermindRuntime` type

**File:** `src/app/types-game-data.ts`

Add an optional `leadCandidates` field to `MastermindRuntime`:

```typescript
export interface MastermindRuntime {
  // ...existing fields...
  leadCandidates?: Array<{ category: string; id: string }>;  // NEW: pre-resolved candidate pool for categorical leads
}
```

#### 107.2c — Update the normalizer

**File:** `src/app/game-data-normalizer.ts`

1. Read `leadNameFilter` from the raw JSON entry alongside `leadName`.
2. When normalizing to `MastermindRuntime`, if `leadNameFilter` is non-empty, populate `leadCandidates` with all villain group runtime objects (across the **global** villain group index) whose `name` contains any of the filter strings (case-insensitive substring match).
3. `lead` remains `null` for these masterminds — the generator picks the live candidate at generation time.

#### 107.2d — Update the generator

**File:** `src/app/setup-generator.ts`

In `tryMastermindForScheme`, before calling `buildCategorySelection`, add:

- If `mastermind.lead === null` and `mastermind.leadCandidates?.length > 0`:
  - Filter `leadCandidates` to only those present in the current owned pool (villain groups or henchmen by id).
  - If no candidates remain after filtering, return `null` (setup attempt fails, a constraint reason is recorded).
  - Otherwise, pick one candidate at random using the existing `random` function.
  - Inject the picked candidate's id into `normalizedForcedPicks.villainGroupIds` (or a locally-scoped override) before passing to `buildCategorySelection`, so the category selector treats it as a forced villain group by mastermind.

#### 107.2e — Update seed data

**File:** `src/data/canonical-game-data.json`

For the `"Sinister Six 2099"` entry (set `"2099"`):

| Field | Current value | Correct value |
|---|---|---|
| `leadName` | `"False Aesir of Alchemax"` | `null` |
| `leadCategory` | `"villains"` | `null` |
| `leadNameFilter` | _(absent)_ | `["Alchemax", "Sinister"]` |
| `notes` | `["Epic Adapting Mastermind. Card count: 6."]` | unchanged |

**Tests:**
- Unit test: normalizer resolves Sinister Six 2099 to `lead === null` and `leadCandidates` is an array of at least two items, each with `category === "villains"`.
- Unit test: generator produces a setup with Sinister Six 2099 whose sole villain group name contains `"Alchemax"` or `"Sinister"`.
- Unit test: when the owned collection contains no Alchemax or Sinister villain groups, the generator skips Sinister Six 2099 and does not produce an invalid setup.

---

### Story 107.3 — Fix Emperor Vulcan of the Shi'Ar: missing lead

**File:** `src/data/canonical-game-data.json`

| Field | Current value | Correct value |
|---|---|---|
| `leadName` | `null` | `"Shi'Ar Imperial Elite"` |
| `leadCategory` | `"villains"` (already correct) | `"villains"` (no change) |

**Rationale:** The card text reads "Always Leads: Shi'ar Imperial Elite." The villain group `"Shi'Ar Imperial Elite"` already exists in `canonical-game-data.json` from the same set (Realm of Kings). The current `null` leadName causes the randomizer to generate this mastermind without its mandatory villain group, producing an invalid setup.

**Files changed:** `src/data/canonical-game-data.json` only.

**Test:** Add a unit test asserting that the Emperor Vulcan of the Shi'Ar `MastermindRuntime` object resolved by the normalizer has `lead.id` resolving to the `"Shi'Ar Imperial Elite"` villain group.

---

## Out of Scope

- No changes to UI components or localisation strings.
- No changes to `SchemeRuntime`, `VillainGroupRuntime`, or any other runtime types.
- No changes to the category selector (`setup-category-selector.ts`) — the injection approach in 107.2d keeps forced-group logic inside the generator.
- Epic Mastermind variant modelling is a separate concern and is not addressed here.

---

## Acceptance Criteria

1. `Omega Red` entry in `canonical-game-data.json` has `leadName: null, leadCategory: null`.
2. `Sinister Six 2099` entry has `leadName: null, leadCategory: null, leadNameFilter: ["Alchemax", "Sinister"]`.
3. `Emperor Vulcan of the Shi'Ar` entry has `leadName: "Shi'Ar Imperial Elite", leadCategory: "villains"`.
4. `MastermindCard` type declares `leadNameFilter?: string[]`.
5. `MastermindRuntime` type declares `leadCandidates?: Array<{ category: string; id: string }>`.
6. The normalizer populates `leadCandidates` for Sinister Six 2099 with all globally-known villain groups matching the filter, and leaves `lead === null`.
7. The generator, when Sinister Six 2099 is selected, forces exactly one villain group randomly chosen from `leadCandidates` that is present in the owned collection.
8. The generator returns `null` (skips the mastermind) when no lead candidate is available in the owned pool.
9. The normalizer resolves Emperor Vulcan of the Shi'Ar to `lead.id` pointing to `"Shi'Ar Imperial Elite"` without error.
10. All story-level unit tests pass.
11. Full regression suite (lint + unit + integration) passes without new failures.
