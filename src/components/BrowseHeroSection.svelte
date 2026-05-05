<script lang="ts">
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { AppState, LocaleTools } from '../app/types.ts';

  let {
    firstRun,
    compactViewport,
    locale,
    bundle,
    appState,
    onJumpTab
  }: {
    firstRun: boolean;
    compactViewport: boolean;
    locale: LocaleTools;
    bundle: Epic1Bundle;
    appState: AppState;
    onJumpTab: (tabId: string) => void;
  } = $props();
</script>

<section class={"panel browse-hero " + (firstRun ? 'browse-hero-first-run' : 'browse-hero-returning')}>
  <div class="row space-between wrap gap-md align-center">
    <div class={"browse-hero-copy panel-copy" + (compactViewport ? ' compact-mobile' : '')}>
      <div class="eyebrow">{locale.t('browse.hero.eyebrow')}</div>
      <h2>{locale.t('browse.hero.title')}</h2>
      {#if !compactViewport || firstRun}
        <p class="muted browse-hero-description">{locale.t('browse.hero.description')}</p>
      {/if}
      <div class="button-row browse-hero-actions">
        <button
          type="button"
          class="button button-primary"
          data-action="jump-tab"
          data-tab-id={firstRun ? 'collection' : 'new-game'}
          data-browse-primary-cta
          onclick={() => onJumpTab(firstRun ? 'collection' : 'new-game')}
        >{firstRun ? locale.t('browse.hero.manageCollection') : locale.t('browse.hero.generateGame')}</button>
        <button
          type="button"
          class="button button-secondary"
          data-action="jump-tab"
          data-tab-id={firstRun ? 'new-game' : 'collection'}
          onclick={() => onJumpTab(firstRun ? 'new-game' : 'collection')}
        >{firstRun ? locale.t('browse.hero.generateGame') : locale.t('browse.hero.manageCollection')}</button>
      </div>
    </div>
    <div class="summary-card browse-results-summary browse-hero-summary">
      <div class="muted">{locale.t('browse.metrics.includedSets')}</div>
      <div class="metric-sm">{bundle.counts.sets}</div>
      <div class="muted">{locale.t('browse.metrics.ownedSets')} {appState.collection.ownedSetIds.length} · {locale.t('browse.metrics.historyRecords')} {appState.history.length}</div>
    </div>
  </div>
</section>
