<script lang="ts">
  import { BROWSE_TYPE_OPTIONS, BROWSE_SORT_OPTIONS, filterBrowseSets, summarizeBrowseSet } from '../app/browse-utils.ts';
  import { browseVm } from '../app/browse-vm.svelte.ts';
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { AppState, LocaleTools, AppPersistenceState, GeneratedSetup, GameSet, MastermindCard, MastermindRuntime } from '../app/types.ts';

  import BrowseHeroSection from './BrowseHeroSection.svelte';
  import BrowseHelpDisclosure from './BrowseHelpDisclosure.svelte';
  import AboutPanel from './AboutPanel.svelte';

  let {
    bundle,
    appState,
    locale,
    persistence,
    browseSearchTerm,
    browseTypeFilter,
    expandedBrowseSetId,
    compactViewport,
    aboutPanelOpen,
    onboardingVisible,
    currentSetup,
    selectedTab,
    onToggleOwnedSet,
    onSetSearchTerm,
    onSetTypeFilter,
    onToggleSetExpanded,
    onJumpTab,
    onToggleAboutPanel,
    onStartOnboarding
  }: {
    bundle: Epic1Bundle;
    appState: AppState;
    locale: LocaleTools;
    persistence: AppPersistenceState;
    browseSearchTerm: string;
    browseTypeFilter: string;
    expandedBrowseSetId: string | null;
    compactViewport: boolean;
    aboutPanelOpen: boolean;
    onboardingVisible: boolean;
    currentSetup: GeneratedSetup | null;
    selectedTab: string;
    onToggleOwnedSet: (id: string) => void;
    onSetSearchTerm: (term: string) => void;
    onSetTypeFilter: (filter: string) => void;
    onToggleSetExpanded: (id: string) => void;
    onJumpTab: (tabId: string) => void;
    onToggleAboutPanel: () => void;
    onStartOnboarding: () => void;
  } = $props();

  let firstRun: boolean = $derived(onboardingVisible || !appState.preferences.onboardingCompleted);
  let ownedSetIds: Set<string> = $derived(new Set(appState.collection.ownedSetIds));
  let browseSets: GameSet[] = $derived(
    filterBrowseSets(bundle.runtime.sets, {
      searchTerm: browseSearchTerm,
      typeFilter: browseTypeFilter,
      sortKey: browseVm.sortKey,
      ownedSetIds
    })
  );

  function formatBrowseMastermind(mastermind: MastermindCard | MastermindRuntime): string {
    if (!('lead' in mastermind) || !mastermind.lead) return mastermind.name;
    const indexes = bundle.runtime.indexes;
    const leadEntity = (mastermind as MastermindRuntime).lead!.category === 'villains'
      ? indexes.villainGroupsById[(mastermind as MastermindRuntime).lead!.id]
      : indexes.henchmanGroupsById[(mastermind as MastermindRuntime).lead!.id];
    return `${mastermind.name} → ${leadEntity?.name || (mastermind as MastermindRuntime).lead!.id}`;
  }

</script>

<section class={"page-flow stack gap-md" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

  <!-- Hero section -->
  <BrowseHeroSection {firstRun} {compactViewport} {locale} {bundle} {appState} {onJumpTab} />

  <!-- Help disclosure -->
  <BrowseHelpDisclosure {firstRun} {compactViewport} {locale} {onStartOnboarding} />

  <!-- Sets panel -->
  <section class="panel browse-panel-full-width" data-browse-sets-panel>
    <div class="row space-between wrap gap-md align-center">
      <div class={"panel-copy" + (compactViewport ? ' compact-mobile' : '')}>
        <h2>{locale.t('browse.panel.title')}</h2>
        {#if !compactViewport}
          <p class="muted browse-panel-description">{locale.t('browse.panel.description')}</p>
        {/if}
      </div>
      <div class="summary-card browse-results-summary">
        <div class="muted">{locale.t('browse.visibleSets')}</div>
        <div class="metric-sm">{browseSets.length}</div>
        <div class="muted">of {bundle.runtime.sets.length}</div>
      </div>
    </div>

    <div class="browse-toolbar" data-mobile-task-anchor="browse">
      <label class="browse-search-shell" for="browse-search-input">
        <span class="muted">{locale.t('browse.searchLabel')}</span>
        <input
          id="browse-search-input"
          class="text-input"
          type="search"
          placeholder={locale.t('browse.searchPlaceholder')}
          value={browseSearchTerm}
          oninput={(e) => onSetSearchTerm((e.target as HTMLInputElement).value)}
        />
      </label>
      <div class="stack gap-sm">
        <span class="muted">{locale.t('browse.typeFilter')}</span>
        <div class="button-row" role="group" aria-label={locale.t('browse.typeFilter')}>
          {#each BROWSE_TYPE_OPTIONS as option (option.id)}
            <button
              type="button"
              class={"button " + (browseTypeFilter === option.id ? 'button-primary' : 'button-secondary') + " browse-filter-button"}
              data-action="set-browse-type-filter"
              data-type-filter={option.id}
              aria-pressed={browseTypeFilter === option.id}
              onclick={() => onSetTypeFilter(option.id)}
            >{locale.getBrowseTypeFilterLabel(option.id)}</button>
          {/each}
        </div>
      </div>
      <div class="stack gap-sm">
        <span class="muted">{locale.t('browse.sort.label')}</span>
        <div class="button-row" role="group" aria-label={locale.t('browse.sort.label')}>
          {#each BROWSE_SORT_OPTIONS as option (option.id)}
            <button
              type="button"
              class={"button " + (browseVm.sortKey === option.id ? 'button-primary' : 'button-secondary') + " browse-sort-button"}
              data-action="set-browse-sort-key"
              data-sort-key={option.id}
              aria-pressed={browseVm.sortKey === option.id}
              onclick={() => { browseVm.sortKey = option.id as typeof browseVm.sortKey; }}
            >{locale.getBrowseSortLabel(option.id)}</button>
          {/each}
        </div>
      </div>
    </div>

    {#if browseSets.length}
      <div class="grid collection-grid browse-set-grid">
        {#each browseSets as set (set.id)}
          {@const counts = summarizeBrowseSet(set)}
          {@const owned = ownedSetIds.has(set.id)}
          {@const expanded = expandedBrowseSetId === set.id}
          <article
            class={"panel panel-inline set-card" + (owned ? ' owned' : '')}
            data-set-id={set.id}
            data-set-name={set.name}
            data-set-type={set.type}
          >
            <div class="stack gap-md">
              <div class="row space-between gap-md wrap align-center">
                <div class="stack gap-sm browse-card-copy">
                  <button
                    type="button"
                    class="set-card-toggle"
                    data-action="toggle-browse-set-expanded"
                    data-set-id={set.id}
                    aria-expanded={expanded}
                    aria-controls={"browse-details-" + set.id}
                    onclick={() => onToggleSetExpanded(set.id)}
                  >
                    <span class="set-card-title">{set.name}</span>
                    <span class="set-card-toggle-copy">{expanded ? locale.t('browse.set.hideDetails') : locale.t('browse.set.showDetails')}</span>
                  </button>
                  <div class="row wrap gap-sm align-center browse-badge-row">
                    <span class="pill set-year-badge">{set.year}</span>
                    <span class="pill set-type-badge">{locale.getBrowseTypeLabel(set.type)}</span>
                    {#if owned}
                      <span class="pill set-owned-badge">{locale.t('browse.set.inCollection')}</span>
                    {/if}
                  </div>
                  {#if set.aliases.length}
                    <div class="muted browse-aliases">{locale.t('browse.set.aliases')} {set.aliases.join(', ')}</div>
                  {/if}
                </div>
                <div class="stack gap-sm browse-card-actions">
                  <button
                    class={"button " + (owned ? 'button-success' : 'button-secondary')}
                    data-action="toggle-owned-set"
                    data-set-id={set.id}
                    onclick={() => onToggleOwnedSet(set.id)}
                  >{owned ? `✓ ${locale.t('browse.set.inCollection')}` : locale.t('browse.set.addToCollection')}</button>
                  <div class="muted browse-ownership-copy">{owned ? locale.t('browse.set.ownedAvailable') : locale.t('browse.set.notOwned')}</div>
                </div>
              </div>

              <div class="browse-count-grid">
                <div class="summary-card"><div class="muted">{locale.t('common.heroes')}</div><div class="metric-sm">{counts.heroCount}</div></div>
                <div class="summary-card"><div class="muted">{locale.t('common.masterminds')}</div><div class="metric-sm">{counts.mastermindCount}</div></div>
                <div class="summary-card"><div class="muted">{locale.t('common.villainGroups')}</div><div class="metric-sm">{counts.villainGroupCount}</div></div>
                <div class="summary-card"><div class="muted">{locale.t('common.henchmanGroups')}</div><div class="metric-sm">{counts.henchmanGroupCount}</div></div>
                <div class="summary-card"><div class="muted">{locale.t('common.schemes')}</div><div class="metric-sm">{counts.schemeCount}</div></div>
              </div>

              <div id={"browse-details-" + set.id} class="browse-details" hidden={!expanded}>
                <div class="browse-details-grid">
                  <section class="summary-card">
                    <h3>{locale.t('common.heroes')}</h3>
                    {#if set.heroes.length}
                      <ul class="clean browse-entity-list">
                        {#each set.heroes as hero (hero.id ?? hero.name)}<li class="browse-entity-item">{hero.name}</li>{/each}
                      </ul>
                    {:else}
                      <p class="muted browse-empty-copy">{locale.t('browse.noHeroes')}</p>
                    {/if}
                  </section>
                  <section class="summary-card">
                    <h3>{locale.t('common.masterminds')}</h3>
                    {#if set.masterminds.length}
                      <ul class="clean browse-entity-list">
                        {#each set.masterminds as mm (mm.id ?? mm.name)}<li class="browse-entity-item">{formatBrowseMastermind(mm)}</li>{/each}
                      </ul>
                    {:else}
                      <p class="muted browse-empty-copy">{locale.t('browse.noMasterminds')}</p>
                    {/if}
                  </section>
                  <section class="summary-card">
                    <h3>{locale.t('common.villainGroups')}</h3>
                    {#if set.villainGroups.length}
                      <ul class="clean browse-entity-list">
                        {#each set.villainGroups as vg (vg.id ?? vg.name)}<li class="browse-entity-item">{vg.name}</li>{/each}
                      </ul>
                    {:else}
                      <p class="muted browse-empty-copy">{locale.t('browse.noVillainGroups')}</p>
                    {/if}
                  </section>
                  <section class="summary-card">
                    <h3>{locale.t('common.henchmanGroups')}</h3>
                    {#if set.henchmanGroups.length}
                      <ul class="clean browse-entity-list">
                        {#each set.henchmanGroups as hg (hg.id ?? hg.name)}<li class="browse-entity-item">{hg.name}</li>{/each}
                      </ul>
                    {:else}
                      <p class="muted browse-empty-copy">{locale.t('browse.noHenchmanGroups')}</p>
                    {/if}
                  </section>
                  <section class="summary-card browse-detail-section-full">
                    <h3>{locale.t('common.schemes')}</h3>
                    {#if set.schemes.length}
                      <ul class="clean browse-entity-list">
                        {#each set.schemes as scheme (scheme.id ?? scheme.name)}<li class="browse-entity-item">{scheme.name}</li>{/each}
                      </ul>
                    {:else}
                      <p class="muted browse-empty-copy">{locale.t('browse.noSchemes')}</p>
                    {/if}
                  </section>
                </div>
              </div>
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <div id="browse-empty-state" class="notice info">{locale.t('browse.emptyFiltered')}</div>
    {/if}
  </section>

  <!-- About panel -->
  {#if aboutPanelOpen}
    <AboutPanel {bundle} {appState} {locale} {persistence} {currentSetup} {selectedTab} {onToggleAboutPanel} />
  {/if}

  <footer class="browse-footer" data-browse-footer>
    <button
      type="button"
      class="button-link"
      data-action="toggle-about-panel"
      aria-expanded={aboutPanelOpen}
      onclick={onToggleAboutPanel}
    >{locale.t('browse.hero.aboutProject')}</button>
  </footer>

</section>
