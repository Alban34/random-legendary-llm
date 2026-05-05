<script lang="ts">
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { AppState, LocaleTools } from '../app/types.ts';

  type ActiveSetFilterGameActions = {
    setActiveSetIds: (ids: string[]) => void;
    clearActiveSetIds: () => void;
    deactivateAllSets: () => void;
  };
  type FilterFeasibility = { ok: boolean; reasons: string[] };

  let {
    appState,
    bundle,
    gameActions,
    locale,
    filterFeasibility
  }: {
    appState: AppState;
    bundle: Epic1Bundle;
    gameActions: ActiveSetFilterGameActions;
    locale: LocaleTools;
    filterFeasibility: FilterFeasibility;
  } = $props();
</script>

<details data-active-filter-panel>
  <summary>
    {locale.t('newGame.activeFilter.title')}
    <span class="muted">
      — {#if appState.collection.activeSetIds === null}
        {locale.t('newGame.activeFilter.summaryAll', { count: appState.collection.ownedSetIds.length })}
      {:else}
        {locale.t('newGame.activeFilter.summaryFiltered', { active: appState.collection.activeSetIds.length, total: appState.collection.ownedSetIds.length })}
      {/if}
    </span>
  </summary>
  <section class="result-card">
    <div class="stack gap-sm">
      {#each appState.collection.ownedSetIds as setId (setId)}
        {@const setEntry = bundle.runtime.indexes.setsById[setId]}
        {@const isChecked = appState.collection.activeSetIds === null || appState.collection.activeSetIds.includes(setId)}
        <label>
          <input
            type="checkbox"
            checked={isChecked}
            data-active-filter-checkbox={setId}
            onchange={(e) => {
              const nowChecked = (e.target as HTMLInputElement).checked;
              const activeIds = appState.collection.activeSetIds;
              const ownedIds = appState.collection.ownedSetIds;
              if (nowChecked) {
                if (activeIds === null) return;
                const newIds = [...new Set([...activeIds, setId])];
                if (newIds.length === ownedIds.length) {
                  gameActions.clearActiveSetIds();
                } else {
                  gameActions.setActiveSetIds(newIds);
                }
              } else {
                const currentIds = activeIds === null ? [...ownedIds] : activeIds;
                gameActions.setActiveSetIds(currentIds.filter((id) => id !== setId));
              }
            }}
          /> {setEntry ? setEntry.name : setId}
        </label>
      {/each}
    </div>
    <div class="row wrap gap-sm align-center" style="margin-top: var(--space-sm)">
      <button
        type="button"
        class="button button-secondary"
        data-action="active-filter-select-all"
        onclick={gameActions.clearActiveSetIds}
      >{locale.t('newGame.activeFilter.selectAll')}</button>
      <button
        type="button"
        class="button button-secondary"
        data-action="active-filter-clear-all"
        onclick={gameActions.deactivateAllSets}
      >{locale.t('newGame.activeFilter.clearAll')}</button>
    </div>
  </section>
</details>
{#if appState.collection.activeSetIds !== null && !filterFeasibility.ok}
  <div class="notice warning" data-active-filter-warning>
    <ul>
      {#each filterFeasibility.reasons as reason}
        <li>{reason}</li>
      {/each}
    </ul>
  </div>
{/if}
