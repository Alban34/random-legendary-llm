<script lang="ts">
  import { getCollectionFeasibility, groupSetsByType, summarizeOwnedCollection } from '../app/collection-utils.ts';
  import CardBrowserByCategory from './CardBrowserByCategory.svelte';
  import CardBrowserByExpansion from './CardBrowserByExpansion.svelte';
  import CollectionSetsView from './CollectionSetsView.svelte';
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { AppState, LocaleTools, AppPersistenceState, MyludoMatchResult, BggMatchResult } from '../app/types.ts';

  let {
    bundle,
    appState,
    locale,
    persistence,
    collectionActions,
    myludoImportStatus = 'idle',
    myludoImportError = '',
    myludoImportSummary = null,
    bggImportStatus = 'idle',
    bggImportError = '',
    bggImportSummary = null
  }: {
    bundle: Epic1Bundle;
    appState: AppState;
    locale: LocaleTools;
    persistence: AppPersistenceState;
    collectionActions: {
      toggleOwnedSet: (id: string) => void;
      requestResetOwnedCollection: () => void;
      importMyludoFile: (file: File) => void;
      dismissMyludoSummary: () => void;
      importBggCollection: (username: string) => void;
      dismissBggSummary: () => void;
    };
    myludoImportStatus?: string;
    myludoImportError?: string;
    myludoImportSummary?: MyludoMatchResult | null;
    bggImportStatus?: string;
    bggImportError?: string;
    bggImportSummary?: BggMatchResult | null;
  } = $props();

  let bggUsername = $state<string>('');
  let collectionView = $state<string>('sets');
  let cardBrowserGrouping = $state<string>('category');

  // Feature flags — set to true when each import panel is ready for release
  const FEATURE_BGG_IMPORT = false;

  let totals = $derived(summarizeOwnedCollection(bundle.runtime, appState.collection.ownedSetIds));
  let feasibility = $derived(getCollectionFeasibility(bundle.runtime, appState));
  let groupedSets = $derived(groupSetsByType(bundle.runtime.sets));
  let persistenceNotices = $derived([...persistence.hydrateNotices, ...persistence.updateNotices]);
</script>

<section class="page-flow stack gap-md">
  <section class="panel">
    <div class="row space-between wrap gap-md align-center">
      <div class="panel-copy">
        <h2>{locale.t('collection.title')}</h2>
        <p class="muted">{locale.t('collection.description')}</p>
      </div>
    </div>
    <div class="button-row" data-view-toggle>
      <button
        type="button"
        class={"button " + (collectionView === 'sets' ? 'button-primary' : 'button-secondary')}
        data-action="set-collection-view"
        data-view="sets"
        aria-pressed={collectionView === 'sets'}
        onclick={() => (collectionView = 'sets')}
      >{locale.t('collection.viewToggle.sets')}</button>
      <button
        type="button"
        class={"button " + (collectionView === 'cards' ? 'button-primary' : 'button-secondary')}
        data-action="set-collection-view"
        data-view="cards"
        aria-pressed={collectionView === 'cards'}
        onclick={() => (collectionView = 'cards')}
      >{locale.t('collection.viewToggle.cards')}</button>
    </div>
    <div class="stack gap-sm">
      <div class="summary-grid">
        <div class="summary-card"><div class="muted">{locale.t('collection.ownedSets')}</div><div class="metric-sm">{totals.setCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.heroes')}</div><div class="metric-sm">{totals.heroCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.masterminds')}</div><div class="metric-sm">{totals.mastermindCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.villainGroups')}</div><div class="metric-sm">{totals.villainGroupCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.henchmanGroups')}</div><div class="metric-sm">{totals.henchmanGroupCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.schemes')}</div><div class="metric-sm">{totals.schemeCount}</div></div>
      </div>
      {#if !persistence.storageAvailable}
        <div class="notice warning" data-storage-error-notice>
          {locale.t('collection.storage.error')}
        </div>
      {/if}
      {#if persistenceNotices.length}
        {#each persistenceNotices as notice (notice)}
          <div class="notice warning">{notice}</div>
        {/each}
      {:else}
        <div class="notice success">{locale.t('collection.noRecoveryIssues')}</div>
      {/if}
    </div>
  </section>

  {#if FEATURE_BGG_IMPORT}
  <details class="panel" data-bgg-import-panel>
    <summary>Import from BGG</summary>
    <div class="panel-copy">
      <p class="muted">Enter your BoardGameGeek username to import your owned expansions.</p>
    </div>
    <form onsubmit={(e) => { e.preventDefault(); if (bggUsername.trim()) collectionActions.importBggCollection(bggUsername.trim()); }}>
      <div class="stack gap-sm">
        <div class="row gap-sm align-center wrap">
          <label for="bgg-username">BGG Username</label>
          <input
            type="text"
            id="bgg-username"
            bind:value={bggUsername}
            disabled={bggImportStatus === 'loading'}
            autocomplete="off"
          />
        </div>
        <div class="button-row">
          <button
            type="submit"
            class="button button-secondary"
            data-action="import-bgg-collection"
            disabled={bggImportStatus === 'loading' || !bggUsername.trim()}
            aria-busy={bggImportStatus === 'loading' ? 'true' : undefined}
          >
            {#if bggImportStatus === 'loading'}
              Importing…
            {:else}
              Import from BGG
            {/if}
          </button>
        </div>
      </div>
    </form>
    {#if bggImportStatus === 'error' && bggImportError}
      <div class="notice warning" data-bgg-import-error>{bggImportError}</div>
    {/if}
  </details>

  {#if bggImportSummary !== null}
    <section class="panel" data-bgg-summary-panel>
      <div class="panel-copy">
        <h2>BGG Import Summary</h2>
        <p>{bggImportSummary.matched.length} expansion(s) added to your collection</p>
      </div>
      {#if bggImportSummary.matched.length === 0}
        <p class="muted">No matching expansions found</p>
      {:else}
        <ul class="stack gap-sm">
          {#each bggImportSummary.matched as item (item.setId)}
            <li>{item.setName}</li>
          {/each}
        </ul>
      {/if}
      {#if bggImportSummary.unmatched.length > 0}
        <div class="panel-copy">
          <h3>Not found in catalog</h3>
        </div>
        <ul class="stack gap-sm">
          {#each bggImportSummary.unmatched as name}
            <li class="muted">{name}</li>
          {/each}
        </ul>
      {/if}
      <div class="button-row">
        <button
          class="button button-secondary"
          data-action="dismiss-bgg-summary"
          onclick={collectionActions.dismissBggSummary}
        >Dismiss</button>
      </div>
    </section>
  {/if}
  {/if}

  {#if collectionView === 'sets'}
  <CollectionSetsView
    {totals}
    {feasibility}
    {groupedSets}
    ownedSetIds={appState.collection.ownedSetIds}
    {locale}
    collectionActions={{
      toggleOwnedSet: collectionActions.toggleOwnedSet,
      requestResetOwnedCollection: collectionActions.requestResetOwnedCollection,
      importMyludoFile: collectionActions.importMyludoFile,
      dismissMyludoSummary: collectionActions.dismissMyludoSummary
    }}
    {myludoImportStatus}
    {myludoImportError}
    {myludoImportSummary}
  />
  {/if}

  {#if collectionView === 'cards'}
  <section class="panel" data-view="card-browser">
    <div class="button-row" data-grouping-toggle>
      <button
        type="button"
        class={"button " + (cardBrowserGrouping === 'category' ? 'button-primary' : 'button-secondary')}
        data-action="set-card-grouping"
        data-grouping="category"
        aria-pressed={cardBrowserGrouping === 'category'}
        onclick={() => (cardBrowserGrouping = 'category')}
      >{locale.t('collection.browser.groupBy.category')}</button>
      <button
        type="button"
        class={"button " + (cardBrowserGrouping === 'expansion' ? 'button-primary' : 'button-secondary')}
        data-action="set-card-grouping"
        data-grouping="expansion"
        aria-pressed={cardBrowserGrouping === 'expansion'}
        onclick={() => (cardBrowserGrouping = 'expansion')}
      >{locale.t('collection.browser.groupBy.expansion')}</button>
    </div>
    {#if cardBrowserGrouping === 'category'}
      <CardBrowserByCategory pools={totals.pools} {locale} />
    {:else}
      <CardBrowserByExpansion pools={totals.pools} {locale} />
    {/if}
  </section>
  {/if}
</section>
