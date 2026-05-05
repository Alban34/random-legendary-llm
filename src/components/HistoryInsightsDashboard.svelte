<script lang="ts">
  import { computeExpansionUsagePercent, RECENT_SCORE_WINDOW } from '../app/stats-utils.ts';
  import type { LocaleTools } from '../app/types.ts';

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
  type ExpansionUsageEntry = { id: string; name: string; games: number; percent: number };
  type DashboardData = {
    outcome: OutcomeInsight;
    usage: UsageCategoryInsight[];
    expansionUsage: ExpansionUsageEntry[];
    freshness: FreshnessInsight;
    collectionCoverage: CollectionCoverageInsight;
  };

  let {
    dashboard,
    locale,
    insightsExpanded,
    compactViewport,
    setsTotal,
    onToggleInsights
  }: {
    dashboard: DashboardData;
    locale: LocaleTools;
    insightsExpanded: boolean;
    compactViewport: boolean;
    setsTotal: number;
    onToggleInsights: () => void;
  } = $props();

  function formatInsightMetric(value: unknown, { suffix = '', fallback = '—' }: { suffix?: string; fallback?: string } = {}): string {
    if (value === null || value === undefined) return fallback;
    return `${value}${suffix}`;
  }

  function getHelperCopy(outcome: OutcomeInsight): string {
    const scoredWindow = Math.min(outcome.scoredGames, RECENT_SCORE_WINDOW);
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
  let outcome = $derived(dashboard.outcome);
  let usage = $derived(dashboard.usage);
  let expansionUsage = $derived(dashboard.expansionUsage);
  let freshness = $derived(dashboard.freshness);
  let collectionCoverage = $derived(dashboard.collectionCoverage);
  let helperCopy = $derived(getHelperCopy(outcome));
  let toggleButtonLabel = $derived(insightsExpanded ? locale.t('browse.set.hideDetails') : locale.t('browse.set.showDetails'));
</script>

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
      onclick={onToggleInsights}
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
                  <strong>{locale.t(entry.label)}</strong>
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
                  <strong>{locale.t(entry.label)}</strong>
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
            <summary class="stats-category-summary">{locale.t(category.label)}</summary>
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
                        <span class="pill">{outcome.totalGames > 0 ? locale.t('history.insights.playCountWithPercent', { count: locale.formatPlayCount(entry.plays), percent: computeExpansionUsagePercent(entry.plays, outcome.totalGames) }) : locale.formatPlayCount(entry.plays)}</span>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="muted empty-state">{locale.t('history.insights.noneMostPlayed', { label: locale.t(category.label).toLowerCase() })}</p>
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
                        <span class="pill">{outcome.totalGames > 0 ? locale.t('history.insights.playCountWithPercent', { count: locale.formatPlayCount(entry.plays), percent: computeExpansionUsagePercent(entry.plays, outcome.totalGames) }) : locale.formatPlayCount(entry.plays)}</span>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="muted empty-state">{locale.t('history.insights.noneLeastPlayed', { label: locale.t(category.label).toLowerCase() })}</p>
                {/if}
              </div>
            </div>
          </details>
        {/each}
        <details class="stats-category-panel" data-stats-category="expansions">
          <summary class="stats-category-summary">{locale.t('history.insights.expansionUsage')}</summary>
          <div class="stats-category-body">
            {#if outcome.totalGames === 0}
              <p class="muted empty-state">{locale.t('history.insights.noExpansionData')}</p>
            {:else}
              <div class="muted">{locale.t('history.insights.expansionUsageSummary', { used: locale.formatNumber(expansionUsage.length), total: locale.formatNumber(setsTotal) })}</div>
              {#if expansionUsage.length > 0}
                <ul class="clean result-list insight-ranking-list">
                  {#each expansionUsage as entry (entry.id)}
                    <li class="result-list-item insight-ranking-item">
                      <span><strong>{entry.name}</strong></span>
                      <span class="pill">{locale.t('history.insights.expansionUsageGames', { games: locale.formatPlayCount(entry.games), percent: entry.percent })}</span>
                    </li>
                  {/each}
                </ul>
              {/if}
            {/if}
          </div>
        </details>
      </div>
    </div>
  {/if}
</section>
