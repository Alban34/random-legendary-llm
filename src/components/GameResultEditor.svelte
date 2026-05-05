<script lang="ts">
  import { GAME_OUTCOME_OPTIONS } from '../app/result-utils.ts';
  import type { LocaleTools } from '../app/types.ts';

  type ResultDraft = {
    outcome: string;
    score?: string;
    playerScores?: { playerName: string; score: string }[];
    notes: string;
  };
  type ResultEditorActions = {
    saveGameResult: () => void;
    skipGameResultEntry: () => void;
    cancelResultEntry: () => void;
    setResultOutcome: (outcome: string) => void;
    setResultScore: (score: string) => void;
    setResultNotes: (notes: string) => void;
    setResultPlayerScore: (index: number, value: string) => void;
    setResultPlayerName: (index: number, value: string) => void;
  };

  let {
    recordId,
    playerCount,
    isPending,
    resultDraft,
    resultFormError,
    resultInvalidFields,
    historyActions,
    locale
  }: {
    recordId: string;
    playerCount: number;
    isPending: boolean;
    resultDraft: ResultDraft;
    resultFormError: string | null;
    resultInvalidFields: string[];
    historyActions: ResultEditorActions;
    locale: LocaleTools;
  } = $props();

  let outcomeInvalid: boolean = $derived(resultInvalidFields.includes('outcome'));
  let scoreInvalid: boolean = $derived(playerCount === 1 && resultInvalidFields.includes('score'));
  let errorId: string = $derived(`result-form-error-${recordId}`);
</script>

<section class="result-card history-result-editor" data-result-editor={recordId}>
  <h3 id={"result-editor-heading-" + recordId} tabindex="-1">{isPending ? locale.t('history.resultEditor.addTitle') : locale.t('history.resultEditor.editTitle')}</h3>
  <p class="muted">{isPending ? locale.t('history.resultEditor.pendingDescription') : locale.t('history.resultEditor.editDescription')}</p>

  {#if resultFormError}
    <div
      class="notice warning"
      id={errorId}
      role="alert"
      aria-live="assertive"
      tabindex="-1"
      data-result-form-error
    >{resultFormError}</div>
  {/if}

  <div class="stack gap-sm">
    <label for={"result-outcome-" + recordId}><strong>{locale.t('history.resultEditor.outcome')}</strong></label>
    <select
      id={"result-outcome-" + recordId}
      class="text-input"
      data-result-field="outcome"
      aria-invalid={outcomeInvalid || undefined}
      aria-describedby={outcomeInvalid ? errorId : undefined}
      onchange={(e) => historyActions.setResultOutcome((e.target as HTMLSelectElement).value)}
    >
      <option value="">{locale.t('history.resultEditor.chooseOutcome')}</option>
      {#each GAME_OUTCOME_OPTIONS as option (option.id)}
        <option value={option.id} selected={resultDraft.outcome === option.id}>{locale.getOutcomeLabel(option.id)}</option>
      {/each}
    </select>
  </div>

  {#if playerCount === 1}
    <div class="stack gap-sm">
      <label for={"result-score-" + recordId}><strong>{locale.t('history.resultEditor.score')}</strong> <span class="muted">{locale.t('history.resultEditor.scoreHint')}</span></label>
      <input
        id={"result-score-" + recordId}
        class="text-input"
        data-result-field="score"
        type="number"
        min="0"
        step="1"
        inputmode="numeric"
        value={resultDraft.score}
        placeholder="0"
        aria-invalid={scoreInvalid || undefined}
        aria-describedby={scoreInvalid ? errorId : undefined}
        oninput={(e) => historyActions.setResultScore((e.target as HTMLInputElement).value)}
      />
    </div>
  {:else}
    {#each resultDraft.playerScores ?? [] as entry, i}
      {@const playerScoreInvalid = resultInvalidFields.includes(`player-score-${i}`)}
      <div class="stack gap-sm">
        <label for={`result-player-name-${recordId}-${i}`}><strong>Player {i + 1}</strong></label>
        <input
          id={`result-player-name-${recordId}-${i}`}
          type="text"
          class="text-input"
          data-result-field={`player-name-${i}`}
          placeholder={`Player ${i + 1}`}
          value={entry.playerName}
          oninput={(e) => historyActions.setResultPlayerName(i, (e.target as HTMLInputElement).value)}
        />
        <input
          type="number"
          class="text-input"
          data-result-field={`player-score-${i}`}
          min="0"
          step="1"
          inputmode="numeric"
          value={entry.score}
          placeholder="0"
          aria-invalid={playerScoreInvalid || undefined}
          aria-describedby={playerScoreInvalid ? errorId : undefined}
          oninput={(e) => historyActions.setResultPlayerScore(i, (e.target as HTMLInputElement).value)}
        />
      </div>
    {/each}
  {/if}

  <div class="stack gap-sm">
    <label for={"result-notes-" + recordId}><strong>{locale.t('history.resultEditor.notes')}</strong> <span class="muted">{locale.t('history.resultEditor.optional')}</span></label>
    <textarea
      id={"result-notes-" + recordId}
      class="text-input result-notes-input"
      data-result-field="notes"
      rows="3"
      maxlength="500"
      placeholder={locale.t('history.resultEditor.notesPlaceholder')}
      oninput={(e) => historyActions.setResultNotes((e.target as HTMLTextAreaElement).value)}
    >{resultDraft.notes}</textarea>
  </div>

  <div class="button-row">
    <button
      type="button"
      class="button button-success"
      data-action="save-game-result"
      onclick={historyActions.saveGameResult}
    >{locale.t('history.resultEditor.save')}</button>
    {#if isPending}
      <button
        type="button"
        class="button button-secondary"
        data-action="skip-game-result"
        onclick={historyActions.skipGameResultEntry}
      >{locale.t('history.resultEditor.skip')}</button>
    {/if}
    <button
      type="button"
      class="button button-secondary"
      data-action="cancel-result-entry"
      onclick={historyActions.cancelResultEntry}
    >{locale.t('history.resultEditor.cancel')}</button>
  </div>
</section>
