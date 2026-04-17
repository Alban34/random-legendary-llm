<script>
  import { getCardsByExpansion } from '../app/collection-utils.mjs';

  let { pools, locale } = $props();

  let expansions = $derived(getCardsByExpansion(pools));
</script>

{#if pools.sets.length === 0}
  <p class="muted">{locale.t('collection.browser.noOwnedSets')}</p>
{:else}
  <div class="stack gap-md">
    {#each expansions as expansion (expansion.setId)}
      <section data-expansion={expansion.setId}>
        <h3>{expansion.setName} <span class="muted" style="font-weight: normal; font-size: 0.85em;">({expansion.cards.length})</span></h3>
        <ul class="card-browser-columns">
          {#each expansion.cards as card (card.id)}
            <li>{card.name}</li>
          {/each}
        </ul>
      </section>
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
