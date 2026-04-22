<script lang="ts">
  import { getCardsByCategory } from '../app/collection-utils.ts';
  import type { LocaleTools } from '../app/types.ts';
  import type { GamePool } from '../app/setup-generator.ts';

  let { pools, locale }: { pools: GamePool; locale: LocaleTools } = $props();

  let categories: ReturnType<typeof getCardsByCategory> = $derived(getCardsByCategory(pools));
</script>

{#if pools.sets.length === 0}
  <p class="muted">{locale.t('collection.browser.noOwnedSets')}</p>
{:else}
  <div class="stack gap-md">
    {#each categories as category (category.categoryId)}
      {#if category.cards.length > 0}
        <section data-category={category.categoryId}>
          <h3>{locale.t(category.labelKey)} <span class="muted" style="font-weight: normal; font-size: 0.85em;">({category.cards.length})</span></h3>
          <ul class="card-browser-columns">
            {#each category.cards as card (card.id)}
              <li>{card.name}</li>
            {/each}
          </ul>
        </section>
      {/if}
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
