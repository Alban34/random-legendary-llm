// src/app/history-vm.svelte.ts
// Svelte 5 reactive view-model for the History tab.

import { toast } from 'svelte-sonner';
import { DEFAULT_HISTORY_GROUPING_MODE, HISTORY_GROUPING_MODES } from './history-utils.ts';
import { createPerPlayerScoreArray, validateGameResultDraft, isCompletedGameResult, normalizeGameResultDraft } from './result-utils.ts';
import { resetUsageCategory as resetUsageCategoryStore, updateGameResult } from './state-store.ts';
import type { AppState, LocaleTools, GameOutcome } from './types.ts';

export type HistoryGroupingMode = 'mastermind' | 'scheme' | 'heroes' | 'villains' | 'play-mode';

export interface PerPlayerScoreEntry {
  playerName: string;
  score: string;
}

export interface ResultDraft {
  outcome: string;
  score?: string;
  notes: string;
  playerScores?: PerPlayerScoreEntry[];
}

export const historyVm = $state<{
  expandedRecordId: string | null;
  insightsExpanded: boolean;
  groupingMode: HistoryGroupingMode;
  outcomeFilter: GameOutcome | 'all';
  resultEditorRecordId: string | null;
  resultEditorReturnFocusSelector: string | null;
  resultDraft: ResultDraft;
  resultFormError: string | null;
  resultInvalidFields: string[];
}>({
  expandedRecordId: null,
  insightsExpanded: false,
  groupingMode: DEFAULT_HISTORY_GROUPING_MODE,
  outcomeFilter: 'all',
  resultEditorRecordId: null,
  resultEditorReturnFocusSelector: null,
  resultDraft: { outcome: '', score: '', notes: '' },
  resultFormError: null,
  resultInvalidFields: []
});

export function toggleHistoryInsights(): void {
  historyVm.insightsExpanded = !historyVm.insightsExpanded;
}

export function resetHistoryGroupingMode(): void {
  historyVm.groupingMode = DEFAULT_HISTORY_GROUPING_MODE;
}

export function resetHistoryOutcomeFilter(): void {
  historyVm.outcomeFilter = 'all';
}

export function resetResultDraft(): void {
  historyVm.resultDraft = { outcome: '', score: '', notes: '' };
}

export function resetResultDraftForPlayerCount(playerCount: number): void {
  if (playerCount >= 2) {
    historyVm.resultDraft = {
      outcome: '',
      playerScores: createPerPlayerScoreArray(playerCount).map(() => ({ playerName: '', score: '' })),
      notes: ''
    };
  } else {
    historyVm.resultDraft = { outcome: '', score: '', notes: '' };
  }
}

export function setResultPlayerScore(index: number, value: string): void {
  if (!Array.isArray(historyVm.resultDraft.playerScores) || index < 0 || index >= historyVm.resultDraft.playerScores.length) return;
  historyVm.resultDraft = {
    ...historyVm.resultDraft,
    playerScores: historyVm.resultDraft.playerScores.map((entry, i) =>
      i === index ? { ...entry, score: value } : entry
    )
  };
}

export function setResultPlayerName(index: number, value: string): void {
  if (!Array.isArray(historyVm.resultDraft.playerScores) || index < 0 || index >= historyVm.resultDraft.playerScores.length) return;
  historyVm.resultDraft = {
    ...historyVm.resultDraft,
    playerScores: historyVm.resultDraft.playerScores.map((entry, i) =>
      i === index ? { ...entry, playerName: typeof value === 'string' ? value.trim() : '' } : entry
    )
  };
}

// ---------------------------------------------------------------------------
// Standalone result editor helpers (also used by syncUiFromPersistedState)
// ---------------------------------------------------------------------------

export function openResultEditor(appState: AppState, recordId: string, options: { returnFocusSelector?: string } = {}): boolean {
  const record = appState.history.find((entry) => entry.id === recordId);
  if (!record) return false;
  historyVm.resultEditorRecordId = recordId;
  historyVm.resultEditorReturnFocusSelector =
    options.returnFocusSelector ??
    `[data-action="edit-game-result"][data-record-id="${recordId}"]`;
  if (record.playerCount >= 2) {
    if (isCompletedGameResult(record.result)) {
      historyVm.resultDraft = normalizeGameResultDraft(record.result, record.playerCount);
    } else {
      resetResultDraftForPlayerCount(record.playerCount);
    }
  } else {
    historyVm.resultDraft = normalizeGameResultDraft(record.result);
  }
  historyVm.resultFormError = null;
  historyVm.resultInvalidFields = [];
  historyVm.expandedRecordId = recordId;
  return true;
}

export function closeResultEditor(): string | null {
  const returnFocusSelector = historyVm.resultEditorReturnFocusSelector;
  historyVm.resultEditorRecordId = null;
  historyVm.resultEditorReturnFocusSelector = null;
  resetResultDraft();
  historyVm.resultFormError = null;
  historyVm.resultInvalidFields = [];
  return returnFocusSelector;
}

// ---------------------------------------------------------------------------
// Action factory
// ---------------------------------------------------------------------------

interface HistoryActionDeps {
  getLocale: () => LocaleTools;
  getAppState: () => AppState;
  applyStateUpdate: (updater: (s: AppState) => AppState, notice: string) => void;
  openResultEditor: (id: string, opts?: { returnFocusSelector?: string }) => boolean;
  closeResultEditor: () => string | null;
  focusSelector: (sel: string) => void;
  ui: { lastActionNotice: string | null; confirmResetAllState: boolean };
}

export function createHistoryActions(deps: HistoryActionDeps) {
  return {
    setHistoryGrouping(mode: string) {
      historyVm.groupingMode = (HISTORY_GROUPING_MODES.some((entry) => entry.id === mode)
        ? mode
        : DEFAULT_HISTORY_GROUPING_MODE) as typeof historyVm.groupingMode;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.updatedHistoryGrouping', {
        mode: deps.getLocale().getHistoryGroupingLabel(historyVm.groupingMode)
      });
      deps.focusSelector(
        `[data-action="set-history-grouping"][data-history-grouping-mode="${historyVm.groupingMode}"]`
      );
    },

    editGameResult(recordId: string) {
      if (
        !deps.openResultEditor(recordId, {
          returnFocusSelector: `[data-action="edit-game-result"][data-record-id="${recordId}"]`
        })
      )
        return;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.openedResultEditor');
      deps.focusSelector('[data-result-field="outcome"]');
    },

    setResultOutcome(outcome: string) {
      historyVm.resultDraft = { ...historyVm.resultDraft, outcome };
      const hadValidationState = historyVm.resultFormError || historyVm.resultInvalidFields.length;
      historyVm.resultFormError = null;
      historyVm.resultInvalidFields = [];
      if (hadValidationState) deps.focusSelector('[data-result-field="outcome"]');
    },

    setResultScore(score: string) {
      historyVm.resultDraft = { ...historyVm.resultDraft, score };
      historyVm.resultFormError = null;
      historyVm.resultInvalidFields = [];
      deps.focusSelector('[data-result-field="score"]');
    },

    setResultNotes(notes: string) {
      historyVm.resultDraft = { ...historyVm.resultDraft, notes };
      const hadValidationState = historyVm.resultFormError || historyVm.resultInvalidFields.length;
      historyVm.resultFormError = null;
      historyVm.resultInvalidFields = [];
      if (hadValidationState) deps.focusSelector('[data-result-field="notes"]');
    },

    setResultPlayerScore(index: number, value: string) {
      setResultPlayerScore(index, value);
      historyVm.resultFormError = null;
      historyVm.resultInvalidFields = [];
    },

    setResultPlayerName(index: number, value: string) {
      setResultPlayerName(index, value);
    },

    skipGameResultEntry() {
      const returnFocusSelector = deps.closeResultEditor();
      deps.ui.lastActionNotice = deps.getLocale().t('actions.pendingResult');
      deps.focusSelector(returnFocusSelector ?? '');
      toast.info(deps.getLocale().t('actions.pendingResultToast'));
    },

    cancelResultEntry() {
      const returnFocusSelector = deps.closeResultEditor();
      deps.ui.lastActionNotice = deps.getLocale().t('actions.closedResultEditor');
      deps.focusSelector(returnFocusSelector ?? '');
    },

    saveGameResult() {
      if (!historyVm.resultEditorRecordId) return;
      const activeRecordId = historyVm.resultEditorRecordId;
      const record = deps.getAppState().history.find((r) => r.id === activeRecordId);
      const playerCount = record?.playerCount ?? 1;
      const validation = validateGameResultDraft(historyVm.resultDraft, playerCount);
      if (!validation.ok) {
        historyVm.resultFormError = validation.errors
          .map((message) => deps.getLocale().localizeValidationMessage(message))
          .join(' ');
        historyVm.resultInvalidFields = validation.errors.flatMap((message) => {
          if (message.includes('Win or Loss')) return ['outcome'];
          if (playerCount >= 2 && message.toLowerCase().includes('score')) {
            return Array.from({ length: playerCount }, (_, i) => `player-score-${i}`);
          }
          if (message.toLowerCase().includes('score')) return ['score'];
          return [];
        });
        deps.ui.lastActionNotice = deps.getLocale().t('actions.finishResultFields');
        deps.focusSelector('[data-result-form-error]');
        return;
      }
      const returnFocusSelector = historyVm.resultEditorReturnFocusSelector ?? '';
      const wasPending =
        deps.getAppState().history.find((r) => r.id === activeRecordId)?.result?.status !== 'completed';
      deps.applyStateUpdate(
        (currentState) =>
          updateGameResult(currentState, {
            recordId: activeRecordId,
            outcome: validation.result.outcome!,
            score: validation.result.score,
            notes: validation.result.notes ?? undefined,
            updatedAt: validation.result.updatedAt ?? new Date().toISOString(),
            playerCount
          }),
        wasPending
          ? deps.getLocale().t('actions.savedResult')
          : deps.getLocale().t('actions.savedCorrectedResult')
      );
      deps.closeResultEditor();
      deps.focusSelector(returnFocusSelector);
      toast.success(wasPending
        ? deps.getLocale().t('actions.savedResultToast')
        : deps.getLocale().t('actions.savedCorrectedResultToast'));
    },

    toggleHistoryInsights() {
      toggleHistoryInsights();
      deps.focusSelector('[data-action="toggle-history-insights"]');
    },

    resetUsageCategory(category: string) {
      deps.ui.confirmResetAllState = false;
      deps.closeResultEditor();
      const label = deps.getLocale().getUsageLabel(category);
      deps.applyStateUpdate(
        (currentState: AppState) => resetUsageCategoryStore(currentState, category),
        deps.getLocale().t('actions.resetUsageStats', { label })
      );
      toast.info(deps.getLocale().t('actions.resetUsageStats', { label }));
    }
  };
}
