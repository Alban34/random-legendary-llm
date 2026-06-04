// src/app/new-game-vm.svelte.ts
// Svelte 5 reactive view-model for the New Game tab.

import { toast } from 'svelte-sonner';
import { createEmptyForcedPicks, hasForcedPicks, addForcedPick as addForcedPickUtil, removeForcedPick as removeForcedPickUtil } from './forced-picks-utils.ts';
import type { ForcedPicks } from './forced-picks-utils.ts';
import { buildHistoryReadySetupSnapshot, generateSetup as generateSetupFn } from './setup-generator.ts';
import { resolvePlayMode } from './setup-rules.ts';
import { acceptGameSetup, createGameRecordId, createDefaultState } from './state-store.ts';
import type { PlayMode, GeneratedSetup, AppState, LocaleTools, GeneratorNotice } from './types.ts';
import type { Epic1Bundle } from './game-data-pipeline.ts';
import { reconstructSetupFromRecord } from './replay-utils.ts';

export const newGameVm = $state<{
  currentSetup: GeneratedSetup | null;
  generatorError: string | null;
  generatorNotices: GeneratorNotice[];
  selectedPlayerCount: number;
  selectedPlayMode: PlayMode;
  advancedSolo: boolean;
  forcedPicks: ForcedPicks;
}>({
  currentSetup: null,
  generatorError: null,
  generatorNotices: [],
  selectedPlayerCount: 1,
  selectedPlayMode: 'standard',
  advancedSolo: false,
  forcedPicks: createEmptyForcedPicks()
});

export function resetForcedPicks(): void {
  newGameVm.forcedPicks = createEmptyForcedPicks();
}

export function resetNewGame(): void {
  newGameVm.generatorError = null;
  newGameVm.generatorNotices = [];
  newGameVm.currentSetup = null;
}

// ---------------------------------------------------------------------------
// Action factory
// ---------------------------------------------------------------------------

interface NewGameActionDeps {
  getLocale: () => LocaleTools;
  getBundle: () => Epic1Bundle;
  getAppState: () => AppState;
  applyStateUpdate: (updater: (s: AppState) => AppState, notice: string) => void;
  clearGeneratedSetup: () => void;
  clearForcedPicksState: () => void;
  closeResultEditor: () => string | null;
  focusSelector: (sel: string) => void;
  openResultEditor: (id: string, opts?: { returnFocusSelector?: string }) => boolean;
  ui: { selectedTab: string; lastActionNotice: string | null };
}

export function createNewGameActions(deps: NewGameActionDeps) {
  function localPersistPreferences(playerCount: number, playMode: string, actionNotice: string) {
    const normalizedPlayMode = resolvePlayMode(playerCount, { playMode });
    const advancedSolo = normalizedPlayMode === 'advanced-solo';
    newGameVm.selectedPlayerCount = playerCount;
    newGameVm.selectedPlayMode = normalizedPlayMode;
    newGameVm.advancedSolo = advancedSolo;
    deps.clearGeneratedSetup();
    deps.applyStateUpdate((s: AppState) => ({
      ...s,
      preferences: {
        ...s.preferences,
        lastPlayerCount: playerCount,
        lastAdvancedSolo: advancedSolo,
        lastPlayMode: normalizedPlayMode
      }
    }), actionNotice);
  }

  return {
    setPlayerCount(playerCount: number) {
      const playMode = playerCount === 1 ? newGameVm.selectedPlayMode : 'standard';
      localPersistPreferences(
        playerCount,
        playMode,
        deps.getLocale().t('actions.selectedPlayerMode', {
          count: deps.getLocale().formatNumber(playerCount),
          playerWord: playerCount === 1 ? 'player' : 'players'
        })
      );
    },

    setPlayMode(playMode: string) {
      if (newGameVm.selectedPlayerCount !== 1 && playMode !== 'standard') {
        deps.ui.lastActionNotice = deps.getLocale().t('actions.invalidSoloMode');
        toast.warning(deps.getLocale().t('actions.invalidSoloMode'));
        return;
      }
      localPersistPreferences(
        newGameVm.selectedPlayerCount,
        playMode,
        deps.getLocale().t('actions.selectedPlayMode', {
          mode: deps.getLocale().getPlayModeLabel(playMode, newGameVm.selectedPlayerCount)
        })
      );
    },

    setEpicMastermind(enabled: boolean) {
      deps.applyStateUpdate((s: AppState) => ({
        ...s,
        preferences: { ...s.preferences, lastEpicMastermind: enabled }
      }), deps.getLocale().t('newGame.epicMastermind'));
    },

    generateSetup() {
      try {
        const setup = generateSetupFn({
          runtime: deps.getBundle().runtime,
          state: deps.getAppState(),
          playerCount: newGameVm.selectedPlayerCount,
          advancedSolo: newGameVm.advancedSolo,
          playMode: newGameVm.selectedPlayMode,
          forcedPicks: newGameVm.forcedPicks,
          epicMastermind: deps.getAppState().preferences.lastEpicMastermind ?? false
        });
        newGameVm.currentSetup = setup;
        newGameVm.generatorError = null;
        newGameVm.generatorNotices = setup.notices;
        deps.ui.lastActionNotice = deps.getLocale().t('actions.generatedSetup');
      } catch (error: unknown) {
        const locale = deps.getLocale();
        const rawMessage = error instanceof Error ? error.message : String(error);
        // Generator/epic throws are locale KEYS; resolve for display. t() returns
        // the key unchanged for unknown keys, so fall back to the raw message then.
        const resolved = locale.t(rawMessage as Parameters<typeof locale.t>[0]);
        const displayMessage = resolved === rawMessage ? rawMessage : resolved;
        newGameVm.currentSetup = null;
        newGameVm.generatorNotices = [];
        newGameVm.generatorError = displayMessage;
        deps.ui.lastActionNotice = locale.t('actions.failedSetup');
        toast.error(displayMessage, { duration: Infinity });
      }
    },

    acceptCurrentSetup() {
      if (!newGameVm.currentSetup) {
        deps.ui.lastActionNotice = deps.getLocale().t('actions.acceptBeforeLog');
        toast.warning(deps.getLocale().t('actions.acceptBeforeLog'));
        return;
      }
      const acceptedRecordId = createGameRecordId();
      const acceptedAt = new Date().toISOString();
      deps.applyStateUpdate((s: AppState) => {
        const nextState = acceptGameSetup(s, {
          id: acceptedRecordId,
          createdAt: acceptedAt,
          playerCount: newGameVm.selectedPlayerCount,
          advancedSolo: newGameVm.advancedSolo,
          playMode: newGameVm.selectedPlayMode,
          epicMastermind: deps.getAppState().preferences.lastEpicMastermind ?? false,
          setupSnapshot: buildHistoryReadySetupSnapshot($state.snapshot(newGameVm.currentSetup!))
        });
        return {
          ...nextState,
          preferences: { ...nextState.preferences, selectedTab: 'history' }
        };
      }, hasForcedPicks(newGameVm.forcedPicks)
        ? deps.getLocale().t('actions.acceptedLoggedForced')
        : deps.getLocale().t('actions.acceptedLogged'));
      deps.ui.selectedTab = 'history';
      deps.openResultEditor(acceptedRecordId, {
        returnFocusSelector: `[data-action="edit-game-result"][data-record-id="${acceptedRecordId}"]`
      });
      deps.clearForcedPicksState();
      deps.clearGeneratedSetup();
      deps.focusSelector('[data-result-field="outcome"]');
      toast.success(deps.getLocale().t('actions.acceptedToast'));
    },

    addForcedPick(field: string, value: string) {
      if (!value) {
        deps.ui.lastActionNotice = deps.getLocale().t('actions.chooseForcedPick');
        return;
      }
      const nextForcedPicks = addForcedPickUtil(newGameVm.forcedPicks, field, value);
      const prev = newGameVm.forcedPicks;
      const changed =
        nextForcedPicks.schemeId !== prev.schemeId ||
        nextForcedPicks.mastermindId !== prev.mastermindId ||
        nextForcedPicks.heroIds.join() !== prev.heroIds.join() ||
        nextForcedPicks.villainGroupIds.join() !== prev.villainGroupIds.join() ||
        nextForcedPicks.henchmanGroupIds.join() !== prev.henchmanGroupIds.join();
      newGameVm.forcedPicks = nextForcedPicks;
      deps.clearGeneratedSetup();
      deps.ui.lastActionNotice = changed
        ? deps.getLocale().t('actions.updatedForcedPicks')
        : deps.getLocale().t('actions.duplicateForcedPick');
    },

    removeForcedPick(field: string, value: string) {
      newGameVm.forcedPicks = removeForcedPickUtil(newGameVm.forcedPicks, field, value);
      deps.clearGeneratedSetup();
      deps.ui.lastActionNotice = deps.getLocale().t('actions.removedForcedPick');
    },

    setPreferredExpansion(id: string | null) {
      newGameVm.forcedPicks = { ...newGameVm.forcedPicks, preferredExpansionId: id };
      deps.clearGeneratedSetup();
      deps.ui.lastActionNotice = deps.getLocale().t('actions.updatedForcedPicks');
    },

    setForcedTeam(team: string | null) {
      newGameVm.forcedPicks = { ...newGameVm.forcedPicks, forcedTeam: team };
      deps.clearGeneratedSetup();
    },

    clearForcedPicks() {
      deps.clearForcedPicksState();
      deps.clearGeneratedSetup();
      deps.ui.lastActionNotice = deps.getLocale().t('actions.clearedForcedPicks');
    },

    clearToDefaults() {
      const defaultState = createDefaultState();
      newGameVm.selectedPlayerCount = defaultState.preferences.lastPlayerCount;
      newGameVm.selectedPlayMode = defaultState.preferences.lastPlayMode;
      newGameVm.advancedSolo = defaultState.preferences.lastAdvancedSolo;
      deps.clearForcedPicksState();
      deps.closeResultEditor();
      deps.clearGeneratedSetup();
      deps.ui.lastActionNotice = deps.getLocale().t('actions.clearDefaults');
      toast.info(deps.getLocale().t('actions.clearDefaults'));
    },

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
        newGameVm.forcedPicks = reconstructed.forcedPicks as unknown as ForcedPicks;
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
    }
  };
}
