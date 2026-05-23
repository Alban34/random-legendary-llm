<script lang="ts">
  import {
    buildHistoryGroups,
    DEFAULT_HISTORY_GROUPING_MODE,
    filterHistoryByOutcome,
    HISTORY_GROUPING_MODES
  } from '../app/history-utils.ts';
  import type { HistoryGroup } from '../app/history-utils.ts';
  import type { HistoryRecord } from '../app/types.ts';
  import type { MessageKey } from '../app/locales/en.ts';
  import { buildInsightsDashboard } from '../app/stats-utils.ts';
  import { isCompletedGameResult } from '../app/result-utils.ts';
  import { historyVm } from '../app/history-vm.svelte.ts';
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { AppState, LocaleTools } from '../app/types.ts';
  import GameResultEditor from './GameResultEditor.svelte';
  import HistoryInsightsDashboard from './HistoryInsightsDashboard.svelte';

  type ResultDraft = { outcome: string; score?: string; playerScores?: { playerName: string; score: string }[]; notes: string };
  type HistoryActions = {
    setHistoryGrouping: (mode: string) => void;
    editGameResult: (recordId: string) => void;
    toggleHistoryInsights: () => void;
    saveGameResult: () => void;
    skipGameResultEntry: () => void;
    cancelResultEntry: () => void;
    setResultOutcome: (outcome: string) => void;
    setResultScore: (score: string) => void;
    setResultNotes: (notes: string) => void;
    setResultPlayerScore: (index: number, value: string) => void;
    setResultPlayerName: (index: number, value: string) => void;
    replaySetup: (recordId: string) => void;
  };
  type OutcomeInsight = {
    totalGames: number;
    completedResults: number;
    pendingResults: number;
    wins: number;
    losses: number;
    scoredGames: number;
    winRate: number | null;
    averageScore: number | null;
    recentAverageScore: number | null;
    bestScore: number | null;
  };
  type UsageCategoryInsight = {
    category: string;
    label: string;
    total: number;
    used: number;
    neverPlayed: number;
    mostPlayed: Array<{ id: string; label: string; plays: number; lastPlayedAt: string | null }>;
    leastPlayed: Array<{ id: string; label: string; plays: number; lastPlayedAt: string | null }>;
  };
  type FreshnessInsight = { totalEntitiesTracked: number; totalNeverPlayed: number; usedEntities: number };
  type CollectionByType = Array<{ category: string; label: string; played: number; total: number; playedPercent: number | null }>;
  type CollectionGroup = { played: number; total: number; playedPercent: number | null; byType: CollectionByType };
  type CollectionCoverageInsight = {
    userCollection: CollectionGroup;
    overallCollection: CollectionGroup;
    missingExtensions: { missing: number; total: number; missingPercent: number | null };
  };

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
    historyActions
  }: {
    bundle: Epic1Bundle;
    appState: AppState;
    locale: LocaleTools;
    compactViewport: boolean;
    historyGroupingMode: string | null;
    historyInsightsExpanded: boolean;
    historyExpandedRecordId: string | null;
    resultEditorRecordId: string | null;
    resultDraft: ResultDraft;
    resultFormError: string | null;
    resultInvalidFields: string[];
    historyActions: HistoryActions;
  } = $props();

  let activeGroupingMode: string = $derived(historyGroupingMode || DEFAULT_HISTORY_GROUPING_MODE);
  let filteredHistory: HistoryRecord[] = $derived(filterHistoryByOutcome(appState.history, historyVm.outcomeFilter));
  let groups: HistoryGroup[] = $derived(
    buildHistoryGroups(filteredHistory, bundle.runtime.indexes, { mode: activeGroupingMode })
  );
  let filteredCount: number = $derived(filteredHistory.length);
  type ExpansionUsageEntry = { id: string; name: string; games: number; percent: number };
  type DashboardResult = { outcome: OutcomeInsight; usage: UsageCategoryInsight[]; expansionUsage: ExpansionUsageEntry[]; freshness: FreshnessInsight; collectionCoverage: CollectionCoverageInsight } | null;
  let dashboard: DashboardResult = $derived(buildInsightsDashboard(bundle.runtime, appState, { limit: 3 }) as DashboardResult);
  let insightsExpanded: boolean = $derived(compactViewport ? Boolean(historyInsightsExpanded) : true);

  function getLocalizedGroupLabel(group: HistoryGroup): string {
    if (group.mode === 'play-mode') {
      const playMode = group.id.split(':')[1] || 'standard';
      return locale.getPlayModeLabel(playMode, playMode === 'standard' ? 2 : 1);
    }
    if (group.mode === 'epic-mastermind') {
      return locale.t(group.label as MessageKey);
    }
    return group.label;
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
    <div class="row space-between wrap gap-sm align-center" data-history-grouping-controls>
      <div class="button-row button-row-scroll" role="group" aria-label={locale.t('history.groupBy')}>
        {#each HISTORY_GROUPING_MODES as mode (mode.id)}
          <button
            type="button"
            class={"button " + (activeGroupingMode === mode.id ? 'button-primary' : 'button-secondary')}
            data-action="set-history-grouping"
            data-history-grouping-mode={mode.id}
            aria-pressed={activeGroupingMode === mode.id}
            aria-label={`${locale.t('history.groupBy')} ${locale.getHistoryGroupingLabel(mode.id)}`}
            onclick={() => historyActions.setHistoryGrouping(mode.id)}
          >{locale.getHistoryGroupingLabel(mode.id)}</button>
        {/each}
      </div>
      {#if appState.history.length > 0}
      <div data-outcome-filter-row class="button-row wrap">
        {#each [
          { value: 'all', label: locale.t('history.filter.all') },
          { value: 'win', label: locale.t('history.filter.win') },
          { value: 'loss', label: locale.t('history.filter.loss') },
          { value: 'pending', label: locale.t('history.filter.pending') }
        ] as opt (opt.value)}
          <button
            type="button"
            class={"button " + (historyVm.outcomeFilter === opt.value ? 'button-primary' : 'button-secondary')}
            aria-pressed={historyVm.outcomeFilter === opt.value}
            data-outcome-filter={opt.value}
            onclick={() => { historyVm.outcomeFilter = opt.value as typeof historyVm.outcomeFilter; }}
          >{opt.label}</button>
        {/each}
      </div>
      {/if}
    </div>
    {#if historyVm.outcomeFilter !== 'all' && appState.history.length > 0}
      <p class="muted" data-outcome-filter-count>{locale.formatGameCount(filteredCount)}</p>
    {/if}

    <!-- History records -->
    {#if !appState.history.length}
      <p class="muted empty-state">{locale.t('history.empty')}</p>
    {:else if filteredHistory.length === 0 && historyVm.outcomeFilter !== 'all'}
      <p class="muted empty-state" data-outcome-filter-empty>
        {#if historyVm.outcomeFilter === 'win'}No won games yet
        {:else if historyVm.outcomeFilter === 'loss'}No lost games yet
        {:else}No pending games yet{/if}
      </p>
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
                  {#if summary.epicMastermind}
                    <span class="pill" data-epic-mastermind-indicator>{locale.t('history.epicMastermind.indicator')}</span>
                  {/if}
                </summary>
                <div class="history-meta muted">{locale.t('history.acceptedAt', { date: locale.formatDateTime(summary.createdAt), mode: modeLabel })}</div>
                <div class="history-meta"><strong>{locale.t('history.result')}</strong> {resultLabel}</div>
                {#if summary.perPlayerScoreLabel}
                  <div class="history-meta" data-history-per-player-scores>{summary.perPlayerScoreLabel}</div>
                {/if}
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
                    onclick={() => historyActions.editGameResult(summary.id)}
                  >{isCompletedGameResult(summary.result) ? locale.t('history.editResult') : locale.t('history.addResult')}</button>
                  <button
                    type="button"
                    class="button button-secondary"
                    data-action="replay-setup"
                    data-record-id={summary.id}
                    onclick={() => historyActions.replaySetup(summary.id)}
                  >{locale.t('history.replaySetup')}</button>
                </div>

                {#if isEditing}
                  <GameResultEditor
                    recordId={summary.id}
                    playerCount={summary.playerCount}
                    isPending={!isCompletedGameResult(summary.result)}
                    {resultDraft}
                    {resultFormError}
                    {resultInvalidFields}
                    {historyActions}
                    {locale}
                  />
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
    <HistoryInsightsDashboard
      {dashboard}
      {locale}
      {insightsExpanded}
      {compactViewport}
      setsTotal={bundle.runtime.sets.length}
      onToggleInsights={historyActions.toggleHistoryInsights}
    />
  {/if}

</section>
