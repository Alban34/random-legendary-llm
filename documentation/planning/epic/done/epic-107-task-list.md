# Epic 107 — Mastermind Always-Leads Data Corrections: Task List

## Story 107.1 — Fix Omega Red: wrong fixed lead

1. - [x] In `src/data/canonical-game-data.json`, locate the `"Omega Red"` mastermind entry and set `leadName` to `null`
2. - [x] In `src/data/canonical-game-data.json`, set `leadCategory` to `null` for the `"Omega Red"` entry
3. - [x] Test: write/update unit tests covering the acceptance criteria — assert that the Omega Red `MastermindRuntime` object resolved by the normalizer has `lead === null`
4. - [x] QC (Automated): run lint + unit tests for this story

---

## Story 107.2 — Fix Sinister Six 2099: categorical lead (schema extension required)

### 107.2a — Extend `MastermindCard` type

1. - [x] In `src/app/types-game-data.ts`, add the optional `leadNameFilter?: string[]` field to the `MastermindCard` interface

### 107.2b — Extend `MastermindRuntime` type

2. - [x] In `src/app/types-game-data.ts`, add the optional `leadCandidates?: Array<{ category: string; id: string }>` field to the `MastermindRuntime` interface

### 107.2c — Update the normalizer

3. - [x] In `src/app/game-data-normalizer.ts`, read `leadNameFilter` from the raw JSON entry alongside `leadName` during mastermind normalisation
4. - [x] In `src/app/game-data-normalizer.ts`, when `leadNameFilter` is non-empty, populate `leadCandidates` on `MastermindRuntime` with all villain group runtime objects from the global villain group index whose `name` contains any of the filter strings (case-insensitive substring match)
5. - [x] In `src/app/game-data-normalizer.ts`, ensure `lead` remains `null` for masterminds that use `leadNameFilter`

### 107.2d — Update the generator

6. - [x] In `src/app/setup-generator.ts`, in `tryMastermindForScheme`, add a branch that fires when `mastermind.lead === null` and `mastermind.leadCandidates?.length > 0`
7. - [x] In `src/app/setup-generator.ts`, filter `leadCandidates` to only those present in the current owned pool (by villain group id)
8. - [x] In `src/app/setup-generator.ts`, return `null` (record a constraint reason) when no candidates remain after filtering
9. - [x] In `src/app/setup-generator.ts`, otherwise pick one candidate at random using the existing `random` function and inject its id into the forced villain group pick before passing to `buildCategorySelection`

### 107.2e — Update seed data

10. - [x] In `src/data/canonical-game-data.json`, locate the `"Sinister Six 2099"` entry (set `"2099"`) and set `leadName` to `null`
11. - [x] In `src/data/canonical-game-data.json`, set `leadCategory` to `null` for `"Sinister Six 2099"`
12. - [x] In `src/data/canonical-game-data.json`, add `leadNameFilter: ["Alchemax", "Sinister"]` to the `"Sinister Six 2099"` entry
13. - [x] Test: write/update unit tests covering the acceptance criteria:
    - Assert normalizer resolves Sinister Six 2099 to `lead === null` and `leadCandidates` is an array of at least two items, each with `category === "villains"`
    - Assert generator produces a setup with Sinister Six 2099 whose sole villain group name contains `"Alchemax"` or `"Sinister"`
    - Assert generator skips Sinister Six 2099 (does not produce an invalid setup) when the owned collection contains no Alchemax or Sinister villain groups
14. - [x] QC (Automated): run lint + unit tests for this story

---

## Story 107.3 — Fix Emperor Vulcan of the Shi'Ar: missing lead

1. - [x] In `src/data/canonical-game-data.json`, locate the `"Emperor Vulcan of the Shi'Ar"` mastermind entry and set `leadName` to `"Shi'Ar Imperial Elite"`
2. - [x] Verify `leadCategory` is already `"villains"` for `"Emperor Vulcan of the Shi'Ar"` in `src/data/canonical-game-data.json` (no change required if correct)
3. - [x] Test: write/update unit tests covering the acceptance criteria — assert that the Emperor Vulcan of the Shi'Ar `MastermindRuntime` object resolved by the normalizer has `lead.id` resolving to the `"Shi'Ar Imperial Elite"` villain group
4. - [x] QC (Automated): run lint + unit tests for this story
