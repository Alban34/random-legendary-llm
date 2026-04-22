<script lang="ts">
  import type { AppTab, LocaleTools } from '../app/types.ts';

  let {
    tabs,
    activeTab,
    locale,
    variant,
    navId,
    navLabel,
    onTabSelect,
    onTabKeydown
  }: {
    tabs: AppTab[];
    activeTab: string;
    locale: LocaleTools;
    variant: string;
    navId: string;
    navLabel: string;
    onTabSelect: (id: string) => void;
    onTabKeydown: (id: string, key: string) => void;
  } = $props();
</script>

<div
  class="{variant}-tab-nav"
  id={navId}
  aria-label={navLabel}
  role="tablist"
>
  {#each tabs as tab (tab.id)}
    <button
      type="button"
      class="tab-button {variant} {activeTab === tab.id ? 'active' : ''}"
      role="tab"
      id={"tab-" + variant + "-" + tab.id}
      aria-selected={activeTab === tab.id}
      aria-controls={"panel-" + tab.id}
      data-action="select-tab"
      data-tab-id={tab.id}
      tabindex={activeTab === tab.id ? 0 : -1}
      title={locale.getTabDescription(tab.id)}
      onclick={() => onTabSelect(tab.id)}
      onkeydown={(e) => {
        if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          onTabKeydown(tab.id, e.key);
        }
      }}
    >
      <span class="tab-icon" aria-hidden="true">{tab.icon}</span>
      <span class="tab-label">{variant === 'mobile' ? locale.getTabShortLabel(tab.id) : locale.getTabLabel(tab.id)}</span>
    </button>
  {/each}
</div>
