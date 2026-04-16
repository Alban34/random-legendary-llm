<script>
  import {
    buildHistoryGroups,
    DEFAULT_HISTORY_GROUPING_MODE,
    HISTORY_GROUPING_MODES
  } from '../app/history-utils.mjs';
  import { buildInsightsDashboard } from '../app/stats-utils.mjs';
  import { GAME_OUTCOME_OPTIONS, isCompletedGameResult } from '../app/result-utils.mjs';

  let {
    bundle,
    appState,
    locale,
    compactViewport,
    historyGroupingMode,
    historyInsightsExpanded,
    historyExpandedRecordId,
    resultEditorRecordId,
    resultDraft,
    resultFormError,
    resultInvalidFields,
    onSetHistoryGrouping,
    onEditGameResult,
    onToggleHistoryInsights,
    onSaveGameResult,
    onSkipGameResult,
    onCancelResultEntry,
    onSetResultOutcome,
    onSetResultScore,
    onSetResultNotes
  } = $props();

  let activeGroupingMode = $derived(historyGroupingMode || DEFAULT_HISTORY_GROUPING_MODE);
  let groups = $derived(
    buildHistoryGroups(appState.history, bundle.runtime.indexes, { mode: activeGroupingMode })
  );
  let dashboard = $derived(buildInsightsDashboard(bundle.runtime, appState, { limit: 3 }));
  let insightsExpanded = $derived(compactViewport ? Boolean(historyInsightsExpanded) : true);

  function formatInsightMetric(value, { suffix = '', fallback = '—' } = {}) {
    if (value === null || value === undefined) return fallback;
    return `${value}${suffix}`;
  }

  function getLocalizedGroupLabel(group) {
    if (group.mode === 'play-mode') {
      const playMode = group.id.split(':')[1] || 'standard';
      return locale.getPlayModeLabel(playMode, playMode === 'standard' ? 2 : 1);
    }
    return group.label;
  }

  function getHelperCopy(outcome) {
    const scoredWindow = Math.min(outcome.scoredGames, 5);
    if (outcome.totalGames === 0) return locale.t('history.insights.helper.noGames');
    if (outcome.completedResults === 0) return locale.t('history.insights.helper.pendingOnly');
    if (outcome.scoredGames === 0) return locale.t('history.insights.helper.noScores');
    if (outcome.scoredGames === 1) return locale.t('history.insights.helper.oneScore');
    return locale.t('history.insights.helper.recentAverage', {
      count: locale.formatNumber(scoredWindow),
      gameWord: scoredWindow === 1 ? locale.t('common.game') : locale.t('common.games'),
      score: formatInsightMetric(outcome.recentAverageScore)
    });
  }
</script>

<section class={"page-flow stack gap-md" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

  <!-- History panel -->
  <section class="panel">
    <div class={"panel-copy" + (compactViewport ? ' compact-mobile' : '')}>
      <h2>{locale.t('history.title')}</h2>
      {#if !compactViewport}
        <div class="muted history-panel-description">{locale.t('history.description')}</div>
      {/if}
    </div>

    <!-- Grouping controls -->
    <div class="stack gap-sm" data-history-grouping-controls>
      <div class="row space-between wrap gap-sm align-center">
        <strong>{locale.t('history.groupBy')}</strong>
      </div>
      <div class="button-row wrap">
        {#each HISTORY_GROUPING_MODES as mode (mode.id)}
          <button
            type="button"
            class={"button " + (activeGroupingMode === mode.id ? 'button-primary' : 'button-secondary')}
            data-action="set-history-grouping"
            data-history-grouping-mode={mode.id}
            aria-pressed={activeGroupingMode === mode.id}
            aria-label={`${locale.t('history.groupBy')} ${locale.getHistoryGroupingLabel(mode.id)}`}
            onclick={() => onSetHistoryGrouping(mode.id)}
          >{locale.getHistoryGroupingLabel(mode.id)}</button>
        {/each}
      </div>
    </div>

    <!-- History records -->
    {#if !appState.history.length}
      <p class="muted empty-state">{locale.t('history.empty')}</p>
    {:else}
      {#each groups as group, groupIndex (group.id)}
        <details
          class="history-group"
          data-history-group-id={group.id}
          data-history-grouping-mode={group.mode}
          open={groupIndex === 0 || group.records.some((s) => s.id === resultEditorRecordId)}
        >
          <summary>
            <span class="history-group-title">{getLocalizedGroupLabel(group)}</span>
            <span class="pill">{locale.formatGameCount(group.count)}</span>
          </summary>
          <div class="stack gap-sm history-group-records">
            {#each group.records as summary (summary.id)}
              {@const isEditing = resultEditorRecordId === summary.id}
              {@const resultPillClass = isCompletedGameResult(summary.result)
                ? `result-pill-${summary.result.outcome}`
                : 'result-pill-pending'}
              {@const playerLabel = locale.formatPlayerLabel(summary.playerCount)}
              {@const modeLabel = locale.getPlayModeLabel(summary.playMode, summary.playerCount)}
              {@const resultLabel = locale.formatResultStatus(summary.result)}
              {@const errorId = `result-form-error-${summary.id}`}
              {@const outcomeInvalid = resultInvalidFields.includes('outcome')}
              {@const scoreInvalid = resultInvalidFields.includes('score')}
              {@const isPending = !isCompletedGameResult(summary.result)}
              <details
                class="history-item"
                data-history-record-id={summary.id}
                open={isEditing || historyExpandedRecordId === summary.id}
              >
                <summary>
                  <strong>{summary.mastermindName}</strong><span class="expansion-label">{summary.mastermindSetName}</span>
                  <span class="pill">{playerLabel}</span>
                  <span class="pill">{modeLabel}</span>
                  <span
                    class={"pill " + resultPillClass}
                    data-history-result-status={summary.result.status}
                  >{resultLabel}</span>
                </summary>
                <div class="history-meta muted">{locale.t('history.acceptedAt', { date: locale.formatDateTime(summary.createdAt), mode: modeLabel })}</div>
                <div class="history-meta"><strong>{locale.t('history.result')}</strong> {resultLabel}</div>
                {#if summary.resultNotes}
                  <div class="history-meta"><strong>{locale.t('history.notes')}</strong> {summary.resultNotes}</div>
                {/if}
                {#if summary.resultUpdatedAt}
                  <div class="history-meta muted">{locale.t('history.lastUpdated', { date: locale.formatDateTime(summary.resultUpdatedAt) })}</div>
                {/if}
                <div class="history-meta"><strong>{locale.t('history.scheme')}</strong> {summary.schemeName}<span class="expansion-label">{summary.schemeSetName}</span></div>
                <div class="history-meta"><strong>{locale.t('history.heroes')}</strong> {#each summary.heroNames as name, i}{name}<span class="expansion-label">{summary.heroSetNames[i]}</span>{#if i < summary.heroNames.length - 1}, {/if}{/each}</div>
                <div class="history-meta"><strong>{locale.t('history.villainGroups')}</strong> {#each summary.villainGroupNames as name, i}{name}<span class="expansion-label">{summary.villainGroupSetNames[i]}</span>{#if i < summary.villainGroupNames.length - 1}, {/if}{/each}</div>
                <div class="history-meta"><strong>{locale.t('history.henchmanGroups')}</strong> {#each summary.henchmanGroupNames as name, i}{name}<span class="expansion-label">{summary.henchmanGroupSetNames[i]}</span>{#if i < summary.henchmanGroupNames.length - 1}, {/if}{/each}</div>
                <div class="button-row history-result-actions">
                  <button
                    type="button"
                    class="button button-secondary"
                    data-action="edit-game-result"
                    data-record-id={summary.id}
                    onclick={() => onEditGameResult(summary.id)}
                  >{isCompletedGameResult(summary.result) ? locale.t('history.editResult') : locale.t('history.addResult')}</button>
                </div>

                <!-- Inline result editor -->
                {#if isEditing}
                  <section class="result-card history-result-editor" data-result-editor={summary.id}>
                    <h3 id={"result-editor-heading-" + summary.id} tabindex="-1">{isPending ? locale.t('history.resultEditor.addTitle') : locale.t('history.resultEditor.editTitle')}</h3>
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
                      <label for={"result-outcome-" + summary.id}><strong>{locale.t('history.resultEditor.outcome')}</strong></label>
                      <select
                        id={"result-outcome-" + summary.id}
                        class="text-input"
                        data-result-field="outcome"
                        aria-invalid={outcomeInvalid || undefined}
                        aria-describedby={outcomeInvalid ? errorId : undefined}
                        onchange={(e) => onSetResultOutcome(e.target.value)}
                      >
                        <option value="">{locale.t('history.resultEditor.chooseOutcome')}</option>
                        {#each GAME_OUTCOME_OPTIONS as option (option.id)}
                          <option value={option.id} selected={resultDraft.outcome === option.id}>{locale.getOutcomeLabel(option.id)}</option>
                        {/each}
                      </select>
                    </div>

                    <div class="stack gap-sm">
                      <label for={"result-score-" + summary.id}><strong>{locale.t('history.resultEditor.score')}</strong> <span class="muted">{locale.t('history.resultEditor.scoreHint')}</span></label>
                      <input
                        id={"result-score-" + summary.id}
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
                        oninput={(e) => onSetResultScore(e.target.value)}
                      />
                    </div>

                    <div class="stack gap-sm">
                      <label for={"result-notes-" + summary.id}><strong>{locale.t('history.resultEditor.notes')}</strong> <span class="muted">{locale.t('history.resultEditor.optional')}</span></label>
                      <textarea
                        id={"result-notes-" + summary.id}
                        class="text-input result-notes-input"
                        data-result-field="notes"
                        rows="3"
                        maxlength="500"
                        placeholder={locale.t('history.resultEditor.notesPlaceholder')}
                        oninput={(e) => onSetResultNotes(e.target.value)}
                      >{resultDraft.notes}</textarea>
                    </div>

                    <div class="button-row">
                      <button
                        type="button"
                        class="button button-success"
                        data-action="save-game-result"
                        onclick={onSaveGameResult}
                      >{locale.t('history.resultEditor.save')}</button>
                      {#if isPending}
                        <button
                          type="button"
                          class="button button-secondary"
                          data-action="skip-game-result"
                          onclick={onSkipGameResult}
                        >{locale.t('history.resultEditor.skip')}</button>
                      {/if}
                      <button
                        type="button"
                        class="button button-secondary"
                        data-action="cancel-result-entry"
                        onclick={onCancelResultEntry}
                      >{locale.t('history.resultEditor.cancel')}</button>
                    </div>
                  </section>
                {/if}

              </details>
            {/each}
          </div>
        </details>
      {/each}
    {/if}
  </section>

  <!-- Insights dashboard -->
  {#if dashboard}
    {@const { outcome, usage, freshness, collectionCoverage } = dashboard}
    {@const helperCopy = getHelperCopy(outcome)}
    {@const toggleButtonLabel = insightsExpanded ? locale.t('browse.set.hideDetails') : locale.t('browse.set.showDetails')}
    <section
      class={"panel history-insights-shell " + (compactViewport ? 'compact' : 'expanded')}
      data-history-insights
    >
      <div class="row space-between wrap gap-md align-center">
        <div>
          <h2>{locale.t('history.insights.title')}</h2>
          <p class="muted">{locale.t('history.insights.description')}</p>
        </div>
        <div class="muted insight-outcome-summary">{locale.t('history.insights.summary', { wins: locale.formatNumber(outcome.wins), losses: locale.formatNumber(outcome.losses), pending: locale.formatNumber(outcome.pendingResults), scored: locale.formatNumber(outcome.scoredGames) })}</div>
      </div>
      <div class="notice info">{helperCopy}</div>
      {#if compactViewport}
        <button
          type="button"
          class="button button-secondary history-insights-toggle"
          data-action="toggle-history-insights"
          aria-expanded={insightsExpanded}
          onclick={onToggleHistoryInsights}
        >{toggleButtonLabel}</button>
      {/if}
      {#if insightsExpanded}
        <div class="history-insights-content">
          <div class="summary-grid insight-summary-grid">
            <article class="summary-card" data-insight-card="games-logged">
              <div class="muted">{locale.t('history.insights.gamesLogged')}</div>
              <div class="metric-sm">{outcome.totalGames}</div>
            </article>
            <article class="summary-card" data-insight-card="win-rate">
              <div class="muted">{locale.t('history.insights.winRate')}</div>
              <div class="metric-sm">{formatInsightMetric(outcome.winRate, { suffix: '%' })}</div>
            </article>
            <article class="summary-card" data-insight-card="pending-results">
              <div class="muted">{locale.t('history.insights.pendingResults')}</div>
              <div class="metric-sm">{outcome.pendingResults}</div>
            </article>
            <article class="summary-card" data-insight-card="average-score">
              <div class="muted">{locale.t('history.insights.averageScore')}</div>
              <div class="metric-sm">{formatInsightMetric(outcome.averageScore)}</div>
            </article>
            <article class="summary-card" data-insight-card="best-score">
              <div class="muted">{locale.t('history.insights.bestScore')}</div>
              <div class="metric-sm">{formatInsightMetric(outcome.bestScore)}</div>
            </article>
            <article class="summary-card" data-insight-card="fresh-pool">
              <div class="muted">{locale.t('history.insights.freshPool')}</div>
              <div class="metric-sm">{freshness.totalNeverPlayed}/{freshness.totalEntitiesTracked}</div>
            </article>
            <article class="summary-card" data-insight-card="user-collection-played">
              <div class="muted">{locale.t('history.insights.userCollectionPlayed')}</div>
              <div class="metric-sm">{formatInsightMetric(collectionCoverage.userCollection.playedPercent, { suffix: '%' })}</div>
              <div class="muted">{collectionCoverage.userCollection.played}/{collectionCoverage.userCollection.total}</div>
            </article>
            <article class="summary-card" data-insight-card="overall-collection-played">
              <div class="muted">{locale.t('history.insights.overallCollectionPlayed')}</div>
              <div class="metric-sm">{formatInsightMetric(collectionCoverage.overallCollection.playedPercent, { suffix: '%' })}</div>
              <div class="muted">{collectionCoverage.overallCollection.played}/{collectionCoverage.overallCollection.total}</div>
            </article>
            <article class="summary-card" data-insight-card="missing-extensions">
              <div class="muted">{locale.t('history.insights.missingExtensions')}</div>
              <div class="metric-sm">{formatInsightMetric(collectionCoverage.missingExtensions.missingPercent, { suffix: '%' })}</div>
              <div class="muted">{collectionCoverage.missingExtensions.missing}/{collectionCoverage.missingExtensions.total} {locale.t('history.insights.notOwned')}</div>
            </article>
          </div>

          <div class="two-col insight-coverage-grid">
            <article class="result-card insight-ranking-card" data-insight-coverage-group="user-collection">
              <h3>{locale.t('history.insights.userCoverage')}</h3>
              <div class="muted">{locale.t('history.insights.userCoverageDescription')}</div>
              <ul class="clean result-list insight-coverage-list">
                {#each collectionCoverage.userCollection.byType as entry (entry.category)}
                  <li class="result-list-item insight-coverage-item" data-insight-coverage-category={entry.category}>
                    <span>
                      <strong>{entry.label}</strong>
                      <span class="muted insight-ranking-meta">{locale.t('history.coverage.playedSummary', { played: locale.formatNumber(entry.played), total: locale.formatNumber(entry.total) })}</span>
                    </span>
                    <span class="pill">{formatInsightMetric(entry.playedPercent, { suffix: '%' })}</span>
                  </li>
                {/each}
              </ul>
            </article>
            <article class="result-card insight-ranking-card" data-insight-coverage-group="overall-collection">
              <h3>{locale.t('history.insights.overallCoverage')}</h3>
              <div class="muted">{locale.t('history.insights.overallCoverageDescription')}</div>
              <ul class="clean result-list insight-coverage-list">
                {#each collectionCoverage.overallCollection.byType as entry (entry.category)}
                  <li class="result-list-item insight-coverage-item" data-insight-coverage-category={entry.category}>
                    <span>
                      <strong>{entry.label}</strong>
                      <span class="muted insight-ranking-meta">{locale.t('history.coverage.playedSummary', { played: locale.formatNumber(entry.played), total: locale.formatNumber(entry.total) })}</span>
                    </span>
                    <span class="pill">{formatInsightMetric(entry.playedPercent, { suffix: '%' })}</span>
                  </li>
                {/each}
              </ul>
            </article>
          </div>

          <div class="stats-category-panels">
            {#each usage as category (category.category)}
              <details class="stats-category-panel" data-stats-category={category.category}>
                <summary class="stats-category-summary">{category.label}</summary>
                <div class="stats-category-body">
                  <div class="muted">{locale.t('history.insights.playedSummary', { used: locale.formatNumber(category.used), total: locale.formatNumber(category.total), neverPlayed: locale.formatNumber(category.neverPlayed) })}</div>
                  <div class="stack gap-sm insight-ranking-section">
                    <strong>{locale.t('history.insights.mostPlayed')}</strong>
                    {#if category.mostPlayed.length}
                      <ul class="clean result-list insight-ranking-list">
                        {#each category.mostPlayed as entry (entry.label)}
                          <li class="result-list-item insight-ranking-item">
                            <span>
                              <strong>{entry.label}</strong>
                              <span class="muted insight-ranking-meta">{entry.lastPlayedAt ? locale.t('history.insights.lastUsed', { date: locale.formatDate(entry.lastPlayedAt) }) : locale.t('history.insights.noPlayDate')}</span>
                            </span>
                            <span class="pill">{locale.formatPlayCount(entry.plays)}</span>
                          </li>
                        {/each}
                      </ul>
                    {:else}
                      <p class="muted empty-state">{locale.t('history.insights.noneMostPlayed', { label: category.label.toLowerCase() })}</p>
                    {/if}
                  </div>
                  <div class="stack gap-sm insight-ranking-section">
                    <strong>{locale.t('history.insights.leastPlayed')}</strong>
                    {#if category.leastPlayed.length}
                      <ul class="clean result-list insight-ranking-list">
                        {#each category.leastPlayed as entry (entry.label)}
                          <li class="result-list-item insight-ranking-item">
                            <span>
                              <strong>{entry.label}</strong>
                              <span class="muted insight-ranking-meta">{entry.lastPlayedAt ? locale.t('history.insights.lastUsed', { date: locale.formatDate(entry.lastPlayedAt) }) : locale.t('history.insights.noPlayDate')}</span>
                            </span>
                            <span class="pill">{locale.formatPlayCount(entry.plays)}</span>
                          </li>
                        {/each}
                      </ul>
                    {:else}
                      <p class="muted empty-state">{locale.t('history.insights.noneLeastPlayed', { label: category.label.toLowerCase() })}</p>
                    {/if}
                  </div>
                </div>
              </details>
            {/each}
          </div>
        </div>
      {/if}
    </section>
  {/if}

</section>
