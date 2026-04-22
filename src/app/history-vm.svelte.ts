// src/app/history-vm.svelte.ts
// Svelte 5 reactive view-model for the History tab.

import { DEFAULT_HISTORY_GROUPING_MODE } from './history-utils.ts';
import { createPerPlayerScoreArray } from './result-utils.ts';
import type { GameOutcome } from './types.ts';

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

let _historyExpandedRecordId: string | null = $state<string | null>(null);
let _historyInsightsExpanded: boolean = $state<boolean>(false);
let _historyGroupingMode: HistoryGroupingMode = $state<HistoryGroupingMode>(DEFAULT_HISTORY_GROUPING_MODE as HistoryGroupingMode);
let _resultEditorRecordId: string | null = $state<string | null>(null);
let _resultEditorReturnFocusSelector: string | null = $state<string | null>(null);
let _resultDraft: ResultDraft = $state<ResultDraft>({ outcome: '', score: '', notes: '' });
let _resultFormError: string | null = $state<string | null>(null);
let _resultInvalidFields: string[] = $state<string[]>([]);

export function getHistoryExpandedRecordId(): string | null { return _historyExpandedRecordId; }
export function setHistoryExpandedRecordId(v: string | null): void { _historyExpandedRecordId = v; }

export function getHistoryInsightsExpanded(): boolean { return _historyInsightsExpanded; }
export function setHistoryInsightsExpanded(v: boolean): void { _historyInsightsExpanded = v; }
export function toggleHistoryInsights(): void { _historyInsightsExpanded = !_historyInsightsExpanded; }

export function getHistoryGroupingMode(): HistoryGroupingMode { return _historyGroupingMode; }
export function setHistoryGroupingMode(v: HistoryGroupingMode): void { _historyGroupingMode = v; }
export function resetHistoryGroupingMode(): void { _historyGroupingMode = DEFAULT_HISTORY_GROUPING_MODE as HistoryGroupingMode; }

let _historyOutcomeFilter: GameOutcome | 'all' = $state<GameOutcome | 'all'>('all');

export function getHistoryOutcomeFilter(): GameOutcome | 'all' { return _historyOutcomeFilter; }
export function setHistoryOutcomeFilter(v: GameOutcome | 'all'): void { _historyOutcomeFilter = v; }
export function resetHistoryOutcomeFilter(): void { _historyOutcomeFilter = 'all'; }

export function getResultEditorRecordId(): string | null { return _resultEditorRecordId; }
export function setResultEditorRecordId(v: string | null): void { _resultEditorRecordId = v; }

export function getResultEditorReturnFocusSelector(): string | null { return _resultEditorReturnFocusSelector; }
export function setResultEditorReturnFocusSelector(v: string | null): void { _resultEditorReturnFocusSelector = v; }

export function getResultDraft(): ResultDraft { return _resultDraft; }
export function setResultDraft(v: ResultDraft): void { _resultDraft = v; }
export function resetResultDraft(): void { _resultDraft = { outcome: '', score: '', notes: '' }; }

export function resetResultDraftForPlayerCount(playerCount: number): void {
  if (playerCount >= 2) {
    _resultDraft = {
      outcome: '',
      playerScores: createPerPlayerScoreArray(playerCount).map(() => ({ playerName: '', score: '' })),
      notes: ''
    };
  } else {
    _resultDraft = { outcome: '', score: '', notes: '' };
  }
}

export function setResultPlayerScore(index: number, value: string): void {
  if (!Array.isArray(_resultDraft.playerScores) || index < 0 || index >= _resultDraft.playerScores.length) return;
  const updated = _resultDraft.playerScores.map((entry, i) =>
    i === index ? { ...entry, score: value } : entry
  );
  _resultDraft = { ..._resultDraft, playerScores: updated };
}

export function setResultPlayerName(index: number, value: string): void {
  if (!Array.isArray(_resultDraft.playerScores) || index < 0 || index >= _resultDraft.playerScores.length) return;
  const updated = _resultDraft.playerScores.map((entry, i) =>
    i === index ? { ...entry, playerName: typeof value === 'string' ? value.trim() : '' } : entry
  );
  _resultDraft = { ..._resultDraft, playerScores: updated };
}

export function getResultFormError(): string | null { return _resultFormError; }
export function setResultFormError(v: string | null): void { _resultFormError = v; }

export function getResultInvalidFields(): string[] { return _resultInvalidFields; }
export function setResultInvalidFields(v: string[]): void { _resultInvalidFields = v; }
