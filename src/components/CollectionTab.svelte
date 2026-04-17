<script>
  import { getCollectionFeasibility, groupSetsByType, summarizeOwnedCollection } from '../app/collection-utils.mjs';
  import { summarizeBrowseSet } from '../app/browse-utils.mjs';
  import CardBrowserByCategory from './CardBrowserByCategory.svelte';
  import CardBrowserByExpansion from './CardBrowserByExpansion.svelte';

  let {
    bundle,
    appState,
    locale,
    persistence,
    lastActionNotice,
    onToggleOwnedSet,
    onRequestResetOwnedCollection,
    onImportMyludoFile,
    onDismissMyludoSummary,
    myludoImportStatus = 'idle',
    myludoImportError = '',
    myludoImportSummary = null,
    onImportBggCollection,
    onDismissBggSummary,
    bggImportStatus = 'idle',
    bggImportError = '',
    bggImportSummary = null
  } = $props();

  let bggUsername = $state('');
  let collectionView = $state('sets');
  let cardBrowserGrouping = $state('category');

  let totals = $derived(summarizeOwnedCollection(bundle.runtime, appState.collection.ownedSetIds));
  let feasibility = $derived(getCollectionFeasibility(bundle.runtime, appState));
  let groupedSets = $derived(groupSetsByType(bundle.runtime.sets));
  let ownedSetSet = $derived(new Set(appState.collection.ownedSetIds));
  let persistenceNotices = $derived([...persistence.hydrateNotices, ...persistence.updateNotices]);
</script>

<section class="page-flow stack gap-md">
  <section class="panel">
    <div class="row space-between wrap gap-md align-center">
      <div class="panel-copy">
        <h2>{locale.t('collection.title')}</h2>
        <p class="muted">{locale.t('collection.description')}</p>
      </div>
      <div class="button-row">
        <button
          class="button button-secondary"
          data-action="request-reset-owned-collection"
          onclick={onRequestResetOwnedCollection}
        >{locale.t('collection.resetSelections')}</button>
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
      <div class="summary-card">
        {#if !persistence.storageAvailable}
          <div><strong>{locale.t('collection.storage')}:</strong> {locale.t('collection.storage.unavailable')}</div>
        {/if}
        {#if lastActionNotice}
          <div class="muted">{locale.t('collection.latestAction')} {lastActionNotice}</div>
        {/if}
      </div>
      {#if persistenceNotices.length}
        {#each persistenceNotices as notice (notice)}
          <div class="notice warning">{notice}</div>
        {/each}
      {:else}
        <div class="notice success">{locale.t('collection.noRecoveryIssues')}</div>
      {/if}
    </div>
  </section>

  {#if false}
  <details class="panel" data-bgg-import-panel>
    <summary>Import from BGG</summary>
    <div class="panel-copy">
      <p class="muted">Enter your BoardGameGeek username to import your owned expansions.</p>
    </div>
    <form onsubmit={(e) => { e.preventDefault(); if (bggUsername.trim()) onImportBggCollection(bggUsername.trim()); }}>
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
          onclick={onDismissBggSummary}
        >Dismiss</button>
      </div>
    </section>
  {/if}
  {/if}

  {#if collectionView === 'sets'}
  <section class="two-col">
    <section class="panel">
      <div class="panel-copy">
        <h2>{locale.t('collection.totals.title')}</h2>
        <p class="muted">{locale.t('collection.totals.description')}</p>
      </div>
      <div class="summary-grid collection-totals-grid">
        <div class="summary-card"><div class="muted">{locale.t('common.heroes')}</div><div class="metric-sm">{totals.heroCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.masterminds')}</div><div class="metric-sm">{totals.mastermindCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.villainGroups')}</div><div class="metric-sm">{totals.villainGroupCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.henchmanGroups')}</div><div class="metric-sm">{totals.henchmanGroupCount}</div></div>
        <div class="summary-card"><div class="muted">{locale.t('common.schemes')}</div><div class="metric-sm">{totals.schemeCount}</div></div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-copy">
        <h2>{locale.t('collection.capacity.title')}</h2>
        <p class="muted">{locale.t('collection.capacity.description')}</p>
      </div>
      <div class="summary-grid collection-feasibility-grid">
        {#each feasibility as mode (mode.id)}
          <article
            class={"summary-card feasibility-card " + (mode.ok ? 'is-ok' : 'is-warning')}
            data-feasibility-mode={mode.id}
          >
            <div class="row space-between gap-sm wrap align-center">
              <strong>{mode.playerCount === 1 ? locale.getPlayModeLabel(mode.playMode, mode.playerCount) : locale.formatPlayerLabel(mode.playerCount)}</strong>
              <span class={"pill " + (mode.ok ? 'feasibility-pill-ok' : 'feasibility-pill-warning')}>
                {mode.ok ? `✓ ${locale.t('collection.feasibility.legal')}` : `⚠ ${locale.t('collection.feasibility.warning')}`}
              </span>
            </div>
            <div class="muted feasibility-copy">
              {mode.ok ? locale.t('collection.feasibility.okCopy') : (mode.reasons[0] || locale.t('collection.feasibility.badCopy'))}
            </div>
          </article>
        {/each}
      </div>
    </section>
  </section>

  {#if false}
  <section class="panel" data-myludo-import-panel>
    <div class="panel-copy">
      <h2>Import from MyLudo</h2>
      <p class="muted">Upload your MyLudo collection export to pre-populate your owned expansions.</p>
    </div>
    <div class="button-row">
      <label
        class={"button button-secondary" + (myludoImportStatus === 'parsing' ? ' is-loading' : '')}
        aria-disabled={myludoImportStatus === 'parsing' ? 'true' : undefined}
        for="myludo-file-input"
      >
        Import from MyLudo
        <input
          type="file"
          id="myludo-file-input"
          class="visually-hidden"
          accept=".csv,.json,.txt,text/csv,application/json,text/plain"
          disabled={myludoImportStatus === 'parsing'}
          onchange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onImportMyludoFile(file);
              event.target.value = '';
            }
          }}
        />
      </label>
      {#if myludoImportStatus === 'parsing'}
        <span aria-live="polite" class="muted">Parsing file…</span>
      {/if}
    </div>
    {#if myludoImportStatus === 'error' && myludoImportError}
      <div class="notice warning" data-myludo-import-error>{myludoImportError}</div>
    {/if}
  </section>

  {#if myludoImportSummary !== null}
    <section class="panel" data-myludo-summary-panel>
      <div class="panel-copy">
        <h2>MyLudo Import Summary</h2>
        <p>{myludoImportSummary.matched.length} expansion(s) added to your collection</p>
      </div>
      {#if myludoImportSummary.matched.length === 0}
        <p class="muted">No matching expansions were found in the Legendary: Marvel catalog</p>
      {:else}
        <ul class="stack gap-sm">
          {#each myludoImportSummary.matched as item (item.setId)}
            <li>{item.setName}</li>
          {/each}
        </ul>
      {/if}
      {#if myludoImportSummary.unmatched.length > 0}
        <details>
          <summary class="muted">Unrecognised titles ({myludoImportSummary.unmatched.length})</summary>
          <ul class="stack gap-sm">
            {#each myludoImportSummary.unmatched as name}
              <li class="muted">{name}</li>
            {/each}
          </ul>
        </details>
      {/if}
      <div class="button-row">
        <button
          class="button button-secondary"
          data-action="dismiss-myludo-summary"
          onclick={onDismissMyludoSummary}
        >Dismiss</button>
      </div>
    </section>
  {/if}

  {/if}

  {#each groupedSets as group (group.id)}
    <section class="panel collection-group" data-collection-group={group.id}>
      <h3>{locale.getCollectionGroupLabel(group.id)}</h3>
      <div class="stack gap-sm">
        {#each group.sets as set (set.id)}
          {@const counts = summarizeBrowseSet(set)}
          {@const isOwned = ownedSetSet.has(set.id)}
          <label
            class={"collection-row" + (isOwned ? ' owned' : '')}
            data-set-id={set.id}
            data-set-name={set.name}
          >
            <span class="row gap-sm align-center collection-row-main">
              <input
                type="checkbox"
                class="collection-checkbox"
                data-action="toggle-owned-set"
                data-set-id={set.id}
                checked={isOwned}
                onchange={() => onToggleOwnedSet(set.id)}
              />
              <span>
                <strong>{set.name}</strong>
                <span class="muted"> ({set.year})</span>
              </span>
            </span>
            <span class="muted collection-row-meta">
              {locale.formatEntityCount(counts.heroCount, 'common.hero', 'common.heroesLower')} · {locale.formatEntityCount(counts.mastermindCount, 'common.mastermind', 'common.mastermindsLower')} · {locale.formatEntityCount(counts.villainGroupCount, 'common.villainGroup', 'common.villainGroupsLower')} · {locale.formatEntityCount(counts.henchmanGroupCount, 'common.henchmanGroup', 'common.henchmanGroupsLower')} · {locale.formatEntityCount(counts.schemeCount, 'common.scheme', 'common.schemesLower')}
            </span>
          </label>
        {/each}
      </div>
    </section>
  {/each}
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
