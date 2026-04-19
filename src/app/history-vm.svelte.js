import { DEFAULT_HISTORY_GROUPING_MODE } from './history-utils.mjs';
import { createPerPlayerScoreArray } from './result-utils.mjs';

let _historyExpandedRecordId = $state(null);
let _historyInsightsExpanded = $state(false);
let _historyGroupingMode = $state(DEFAULT_HISTORY_GROUPING_MODE);
let _resultEditorRecordId = $state(null);
let _resultEditorReturnFocusSelector = $state(null);
let _resultDraft = $state({ outcome: '', score: '', notes: '' });
let _resultFormError = $state(null);
let _resultInvalidFields = $state([]);

export function getHistoryExpandedRecordId() { return _historyExpandedRecordId; }
export function setHistoryExpandedRecordId(v) { _historyExpandedRecordId = v; }

export function getHistoryInsightsExpanded() { return _historyInsightsExpanded; }
export function setHistoryInsightsExpanded(v) { _historyInsightsExpanded = v; }
export function toggleHistoryInsights() { _historyInsightsExpanded = !_historyInsightsExpanded; }

export function getHistoryGroupingMode() { return _historyGroupingMode; }
export function setHistoryGroupingMode(v) { _historyGroupingMode = v; }
export function resetHistoryGroupingMode() { _historyGroupingMode = DEFAULT_HISTORY_GROUPING_MODE; }

let _historyOutcomeFilter = $state('all');

export function getHistoryOutcomeFilter() { return _historyOutcomeFilter; }
export function setHistoryOutcomeFilter(v) { _historyOutcomeFilter = v; }
export function resetHistoryOutcomeFilter() { _historyOutcomeFilter = 'all'; }

export function getResultEditorRecordId() { return _resultEditorRecordId; }
export function setResultEditorRecordId(v) { _resultEditorRecordId = v; }

export function getResultEditorReturnFocusSelector() { return _resultEditorReturnFocusSelector; }
export function setResultEditorReturnFocusSelector(v) { _resultEditorReturnFocusSelector = v; }

export function getResultDraft() { return _resultDraft; }
export function setResultDraft(v) { _resultDraft = v; }
export function resetResultDraft() { _resultDraft = { outcome: '', score: '', notes: '' }; }

export function resetResultDraftForPlayerCount(playerCount) {
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

export function setResultPlayerScore(index, value) {
  if (!Array.isArray(_resultDraft.playerScores) || index < 0 || index >= _resultDraft.playerScores.length) return;
  const updated = _resultDraft.playerScores.map((entry, i) =>
    i === index ? { ...entry, score: value } : entry
  );
  _resultDraft = { ..._resultDraft, playerScores: updated };
}

export function setResultPlayerName(index, value) {
  if (!Array.isArray(_resultDraft.playerScores) || index < 0 || index >= _resultDraft.playerScores.length) return;
  const updated = _resultDraft.playerScores.map((entry, i) =>
    i === index ? { ...entry, playerName: typeof value === 'string' ? value.trim() : '' } : entry
  );
  _resultDraft = { ..._resultDraft, playerScores: updated };
}

export function getResultFormError() { return _resultFormError; }
export function setResultFormError(v) { _resultFormError = v; }

export function getResultInvalidFields() { return _resultInvalidFields; }
export function setResultInvalidFields(v) { _resultInvalidFields = v; }
