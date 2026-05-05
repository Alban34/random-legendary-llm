<script lang="ts">
  import { getCardsByCategory } from '../app/collection-utils.ts';
  import type { LocaleTools } from '../app/types.ts';
  import type { GamePool } from '../app/setup-pool-builder.ts';

  let { pools, locale }: { pools: GamePool; locale: LocaleTools } = $props();

  let categories: ReturnType<typeof getCardsByCategory> = $derived(getCardsByCategory(pools));
</script>

{#if pools.sets.length === 0}
  <p class="muted">{locale.t('collection.browser.noOwnedSets')}</p>
{:else}
  <div class="stack gap-md">
    {#each categories.filter((c) => c.cards.length > 0) as category, _categoryIndex (category.categoryId)}
      <details class="history-group" data-category={category.categoryId} open>
        <summary><span class="history-group-title">{locale.t(category.labelKey)}</span><span class="pill">({category.cards.length})</span></summary>
        <ul class="card-browser-columns">
          {#each category.cards as card (card.id)}
            <li>{card.name}</li>
          {/each}
        </ul>
      </details>
    {/each}
  </div>
{/if}

<style>
  .card-browser-columns {
    list-style: none;
    padding: 0;
    margin: 0;
    columns: 3 14rem;
    column-gap: var(--space-lg, 1.5rem);
  }

  .card-browser-columns li {
    padding: var(--space-xs, 0.2rem) 0;
    break-inside: avoid;
  }
</style>
