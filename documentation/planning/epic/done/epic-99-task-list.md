# Epic 99 — Replay from History Task List

## Story 1: Schema audit

- [x] Read `HistoryRecord` in `src/app/types-app-state.ts` (lines 53–67) and `GeneratedSetup` in `src/app/types-setup.ts` (lines 9–63); confirm every field required by `reconstructSetupFromRecord` (Story 3) is present
- [x] Confirm `setupSnapshot.{mastermindId, schemeId, heroIds, villainGroupIds, henchmanGroupIds}` covers all entity ID fields of `GeneratedSetup.setupSnapshot` — these are identical structures; ✓ confirmed
- [x] Confirm `HistoryRecord.{playerCount, advancedSolo, playMode}` are sufficient inputs to `resolveSetupTemplate()` in `src/app/setup-rules.ts` — ✓ confirmed
- [x] Confirm `HistoryRecord.epicMastermind` is present (optional `boolean`, treat absent as `false`) — ✓ confirmed; no new fields are needed on `HistoryRecord`
- [x] Record audit outcome as a comment block at the top of the new `src/app/replay-utils.ts` created in Story 3

No source file changes required for this story.

---

## Story 2: History tab "Replay" UI

- [x] In `src/components/HistoryTab.svelte`, add `replaySetup: (recordId: string) => void` to the local `HistoryActions` type (after the `cancelResultEntry` entry, around line 31)
- [x] In `src/components/HistoryTab.svelte`, add a "Replay this setup" button inside the `.button-row.history-result-actions` div for each record entry, after the existing "Edit/Add result" button (around line 234):
  ```html
  <button
    type="button"
    class="button button-secondary"
    data-action="replay-setup"
    data-record-id={summary.id}
    onclick={() => historyActions.replaySetup(summary.id)}
  >{locale.t('history.replaySetup')}</button>
  ```
- [x] In `src/components/App.svelte`, add `replaySetup: (recordId: string) => void` to `ActionsShape` (after `acceptCurrentSetup`, around line 413)
- [x] In `src/components/App.svelte`, add `replaySetup: actions.replaySetup` to the `historyActions` slice (after `editGameResult`, around line 508)

**Test:**
- [x] Add a test case in `src/app/new-game-vm.test.ts` (source-text assertion pattern) that `createNewGameActions` returns an object whose source includes `replaySetup`; add a second case asserting `App.svelte` source includes `replaySetup: actions.replaySetup`

**QC (Automated):**
- [x] `npx vitest run src/app/new-game-vm.test.ts`
- [x] `npx playwright test test/playwright/replay-from-history.spec.ts` (created in Story 4)

---

## Story 3: Reconstruction function

- [x] Create `src/app/replay-utils.ts`; add a comment block at the top documenting the Story 1 audit findings
- [x] In `src/app/replay-utils.ts`, import the following:
  - `HistoryRecord`, `GeneratedSetup`, `HeroRuntime`, `MastermindRuntime`, `VillainGroupRuntime`, `HenchmanGroupRuntime` from `./types.ts`
  - `GameRuntime` from `./setup-pool-builder.ts`
  - `resolveSetupTemplate`, `summarizeSetupTemplate` from `./setup-rules.ts`
  - `applySchemeModifiersToTemplate` from `./setup-scheme-modifiers.ts`
  - `isSoloMode` from `./setup-validator.ts`
- [x] Export `reconstructSetupFromRecord(record: HistoryRecord, runtime: GameRuntime): GeneratedSetup`:
  1. Look up `mastermind` from `runtime.indexes.mastermindsById[record.setupSnapshot.mastermindId]`; throw `Error('Replay failed: mastermind ID not found: <id>')` if missing
  2. Look up `scheme` from `runtime.indexes.schemesById[record.setupSnapshot.schemeId]`; throw on missing
  3. Look up each `heroId` from `runtime.indexes.heroesById`; throw on any missing ID
  4. Look up each `villainGroupId` from `runtime.indexes.villainGroupsById`; throw on any missing ID
  5. Look up each `henchmanGroupId` from `runtime.indexes.henchmanGroupsById`; throw on any missing ID
  6. Call `resolveSetupTemplate(record.playerCount, { advancedSolo: record.advancedSolo, playMode: record.playMode })` to derive `template`
  7. Call `applySchemeModifiersToTemplate(template, scheme)` to derive `effectiveRequirements`
  8. Resolve `leadEntity`: if `mastermind.lead` is absent or `isSoloMode(template)` is true, use `null`; otherwise look up from `runtime.indexes.villainGroupsById` or `runtime.indexes.henchmanGroupsById` based on `mastermind.lead.category`
  9. Return a `GeneratedSetup` with:
     - `template`: `summarizeSetupTemplate(template)`
     - `requirements`: spread of `summarizeSetupTemplate(template)` merged with `effectiveRequirements` fields (`heroCount`, `villainGroupCount`, `henchmanGroupCount`, `wounds`, `bystanders`)
     - `scheme`: spread of resolved scheme runtime object (with `notes` array cloned)
     - `mastermind`: spread of resolved mastermind runtime with `leadEntity` attached
     - `heroes`, `villainGroups`, `henchmanGroups`: resolved runtime arrays
     - `setupSnapshot`: shallow copy of `record.setupSnapshot`
     - `forcedPicks`: `{ schemeId: record.setupSnapshot.schemeId, mastermindId: record.setupSnapshot.mastermindId, heroIds: [...record.setupSnapshot.heroIds], villainGroupIds: [...record.setupSnapshot.villainGroupIds], henchmanGroupIds: [...record.setupSnapshot.henchmanGroupIds], forcedTeam: null, preferredExpansionId: null }`
     - `notices: []`, `fallbackUsed: false`, `legalSchemesCount: 0`
- [x] Create `src/app/replay-utils.test.ts`:
  - `beforeAll`: load `canonical-game-data.json` and call `createEpic1Bundle` (same pattern as `history-utils.test.ts`)
  - Test: `reconstructSetupFromRecord` returns a `GeneratedSetup` whose `setupSnapshot` exactly matches the input `HistoryRecord.setupSnapshot` when all IDs are present
  - Test: `reconstructSetupFromRecord` returns resolved entity names (`mastermind.name`, `scheme.name`, `heroes[*].name`) that are non-empty strings
  - Test: `reconstructSetupFromRecord` sets `forcedPicks.schemeId` to `record.setupSnapshot.schemeId` and `forcedPicks.heroIds` to the same array contents as `record.setupSnapshot.heroIds`
  - Test: `reconstructSetupFromRecord` throws an `Error` containing the unknown ID when given a `HistoryRecord` with a non-existent `mastermindId`

**Test:**
- [x] `npx vitest run src/app/replay-utils.test.ts`

**QC (Automated):**
- [x] `npx vitest run src/app/replay-utils.test.ts`

---

## Story 4: Acceptance flow integration

- [x] In `src/app/new-game-vm.svelte.ts`, add `import { reconstructSetupFromRecord } from './replay-utils.ts'` at the top of the imports block
- [x] In `src/app/new-game-vm.svelte.ts`, add a `replaySetup(recordId: string)` method to the object returned by `createNewGameActions(deps)`, after `acceptCurrentSetup`:
  ```typescript
  replaySetup(recordId: string) {
    const record = deps.getAppState().history.find((r) => r.id === recordId);
    if (!record) {
      deps.ui.lastActionNotice = deps.getLocale().t('actions.replayNotFound');
      return;
    }
    try {
      const reconstructed = reconstructSetupFromRecord(record, deps.getBundle().runtime);
      newGameVm.currentSetup = reconstructed;
      newGameVm.generatorError = null;
      newGameVm.generatorNotices = [];
      newGameVm.selectedPlayerCount = record.playerCount;
      const resolvedMode = resolvePlayMode(record.playerCount, {
        advancedSolo: record.advancedSolo,
        playMode: record.playMode
      });
      newGameVm.selectedPlayMode = resolvedMode;
      newGameVm.advancedSolo = record.advancedSolo;
      newGameVm.forcedPicks = reconstructed.forcedPicks as ForcedPicks;
      deps.applyStateUpdate(
        (s: AppState) => ({
          ...s,
          preferences: {
            ...s.preferences,
            lastEpicMastermind: record.epicMastermind ?? false
          }
        }),
        deps.getLocale().t('actions.replayedSetup')
      );
      deps.ui.selectedTab = 'new-game';
      toast.success(deps.getLocale().t('actions.replayedSetupToast'));
    } catch (error: unknown) {
      newGameVm.currentSetup = null;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.replayFailed');
      toast.error(error instanceof Error ? error.message : String(error), { duration: Infinity });
    }
  },
  ```
- [x] In `src/components/App.svelte`, add `replaySetup: (recordId: string) => void` to `ActionsShape` (already detailed in Story 2)
- [x] In `src/components/App.svelte`, add `replaySetup: actions.replaySetup` to the `historyActions` slice (already detailed in Story 2)
- [x] Create `test/playwright/replay-from-history.spec.ts`:
  - `beforeEach`: call `gotoApp`, `seedAllOwnedState`, then accept two generated setups (reuse `acceptGeneratedSetup` helper pattern from `game-history-summaries.spec.ts`)
  - Store the first accepted setup's mastermind name as `originalMastermind` and scheme name as `originalScheme` from `window.__CURRENT_SETUP__`
  - Test — **navigation**: clicking `[data-action="replay-setup"]` on the first history entry switches to the New Game tab (`[aria-selected="true"]` tab = "New Game")
  - Test — **setup fidelity**: after replay the new-game panel contains `originalMastermind` and `originalScheme` (read from `[data-result-field]` elements or `window.__CURRENT_SETUP__`)
  - Test — **accept creates a new record**: after replay, clicking `[data-action="accept-current-setup"]` and switching to History results in 3 total history entries
  - Test — **no re-randomization**: `window.__CURRENT_SETUP__.setupSnapshot.mastermindId` after replay equals the original record's `setupSnapshot.mastermindId` (read via `window.__APP_STATE__.history[1].setupSnapshot.mastermindId`)

**Test:**
- [x] `npx vitest run src/app/new-game-vm.test.ts` (new assertion added in Story 2)
- [x] `npx playwright test test/playwright/replay-from-history.spec.ts`

**QC (Automated):**
- [x] `npx vitest run src/app/new-game-vm.test.ts`
- [x] `npx playwright test test/playwright/replay-from-history.spec.ts`
- [x] `npx playwright test test/playwright/game-history-summaries.spec.ts` (regression — history entry structure must be unchanged)

---

## Story 5: Localization

- [x] Add the following five keys to `src/app/locales/en.ts`:
  - In the `history.*` block (after `history.epicMastermind.indicator`): `'history.replaySetup': 'Replay this setup'`
  - In the `actions.*` block (after `actions.acceptedToast`): `'actions.replayedSetup': 'Replayed setup loaded in New Game — accept it to log a new game.'`
  - After `actions.replayedSetup`: `'actions.replayedSetupToast': 'Setup replayed — accept it in New Game to log a new record.'`
  - After `actions.replayedSetupToast`: `'actions.replayFailed': 'Could not reconstruct the setup — one or more cards are no longer in the active collection.'`
  - After `actions.replayFailed`: `'actions.replayNotFound': 'The selected history record could not be found.'`
- [x] Add the same five keys (with French translations) to `src/app/locales/fr.ts` at the matching positions
- [x] Add the same five keys (with German translations) to `src/app/locales/de.ts` at the matching positions
- [x] Add the same five keys (with Spanish translations) to `src/app/locales/es.ts` at the matching positions
- [x] Add the same five keys (with Japanese translations) to `src/app/locales/ja.ts` at the matching positions
- [x] Add the same five keys (with Korean translations) to `src/app/locales/ko.ts` at the matching positions
- [x] Confirm all six non-English locale files include the new keys in the same order as `en.ts`

**Test:**
- [x] `npx vitest run src/app/locales/locales.test.ts` — the existing key-parity test will catch any missing or extra keys in any locale file

**QC (Automated):**
- [x] `npx vitest run src/app/locales/locales.test.ts`
- [x] `npx playwright test test/playwright/localization.spec.ts` (regression — confirm no new untranslated fallback strings appear in non-English locales)
