<script>
  import { getCollectionFeasibility, groupSetsByType, summarizeOwnedCollection } from '../app/collection-utils.mjs';
  import { summarizeBrowseSet } from '../app/browse-utils.mjs';

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
    myludoImportSummary = null
  } = $props();

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
</section>
