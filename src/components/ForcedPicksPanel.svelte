<script lang="ts">
  import { FORCED_PICK_FIELD_CONFIGS } from '../app/forced-picks-utils.ts';
  import type { ForcedPicks } from '../app/forced-picks-utils.ts';
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { LocaleTools, PlayMode, SchemeRuntime, HeroRuntime, MastermindRuntime, VillainGroupRuntime, HenchmanGroupRuntime } from '../app/types.ts';

  type ForcedPicksGameActions = {
    addForcedPick: (field: string, value: string) => void;
    removeForcedPick: (field: string, id: string) => void;
    setPreferredExpansion: (id: string | null) => void;
    setForcedTeam: (team: string | null) => void;
  };

  let {
    forcedPicks,
    ownedForcedPickOptions,
    gameActions,
    locale,
    modeIneligibleSchemeIds,
    ownedExpansions,
    activeHeroTeamNames,
    selectedPlayMode,
    selectedPlayerCount,
    bundle
  }: {
    forcedPicks: ForcedPicks;
    ownedForcedPickOptions: {
      schemeId: SchemeRuntime[];
      mastermindId: MastermindRuntime[];
      heroIds: HeroRuntime[];
      villainGroupIds: VillainGroupRuntime[];
      henchmanGroupIds: HenchmanGroupRuntime[];
    };
    gameActions: ForcedPicksGameActions;
    locale: LocaleTools;
    modeIneligibleSchemeIds: Set<string>;
    ownedExpansions: Array<{ id: string; name: string }>;
    activeHeroTeamNames: string[];
    selectedPlayMode: PlayMode;
    selectedPlayerCount: number;
    bundle: Epic1Bundle;
  } = $props();

  function getActiveIds(config: { field: string; multi: boolean }): string[] {
    const val = (forcedPicks as unknown as Record<string, string | string[] | null>)[config.field];
    if (config.multi) return (val as string[]) ?? [];
    return val ? [val as string] : [];
  }

  function getAvailableOptions(config: { field: string; multi: boolean }): Array<{ id: string; name: string; constraints?: { incompatiblePlayModes?: string[] } }> {
    let opts = (ownedForcedPickOptions as Record<string, Array<{ id: string; name: string; constraints?: { incompatiblePlayModes?: string[] } }>>)[config.field] ?? [];
    if (config.field === 'schemeId') {
      opts = opts.filter((e) => !modeIneligibleSchemeIds.has(e.id));
    }
    return config.multi ? opts.filter((e) => !getActiveIds(config).includes(e.id)) : opts;
  }

  function handleAddForcedPick(field: string): void {
    const sel = document.querySelector(`[data-forced-pick-select="${field}"]`);
    gameActions.addForcedPick(field, (sel as HTMLSelectElement | null)?.value || '');
  }
</script>

<details>
  <summary>{locale.t('newGame.forcedPicks.title')}</summary>
  <section class="result-card" data-forced-picks-panel>
    <div class="muted">{locale.t('newGame.forcedPicks.description')}</div>
    <div class="forced-picks-pickers-grid">
      {#each FORCED_PICK_FIELD_CONFIGS as config (config.field)}
        {@const availableOptions = getAvailableOptions(config)}
        <div class="stack gap-sm">
          <label for={"forced-pick-" + config.field}><strong>{locale.t(`newGame.forcedPicks.field.${config.field}`)}</strong></label>
          <div class="button-row wrap forced-pick-picker-row">
            <select
              id={"forced-pick-" + config.field}
              data-forced-pick-select={config.field}
              disabled={!availableOptions.length}
            >
              <option value="">{locale.t('newGame.forcedPicks.choose', { label: locale.t(`newGame.forcedPicks.field.${config.field}`).toLowerCase() })}</option>
              {#each availableOptions as entity (entity.id)}
                <option value={entity.id}>{entity.name}</option>
              {/each}
            </select>
            <button
              type="button"
              class="button button-secondary"
              data-action="add-forced-pick"
              data-field={config.field}
              disabled={!availableOptions.length}
              onclick={() => handleAddForcedPick(config.field)}
            >{config.multi
              ? locale.t('newGame.forcedPicks.add', { label: locale.t(`newGame.forcedPicks.field.${config.field}`) })
              : locale.t('newGame.forcedPicks.set', { label: locale.t(`newGame.forcedPicks.field.${config.field}`) })}</button>
          </div>
        </div>
      {/each}
    </div>
    <hr class="forced-picks-section-divider" aria-hidden="true">
    {#if ownedExpansions.length >= 2}
      <div class="stack gap-sm" data-preferred-expansion-section>
        <label for="preferred-expansion-select"><strong>{locale.t('newGame.forcedPicks.preferredExpansion.label')}</strong></label>
        <select
          id="preferred-expansion-select"
          data-preferred-expansion-select
          value={forcedPicks.preferredExpansionId ?? ''}
          onchange={(e) => gameActions.setPreferredExpansion((e.target as HTMLSelectElement).value || null)}
        >
          <option value="">{locale.t('newGame.forcedPicks.preferredExpansion.placeholder')}</option>
          {#each ownedExpansions as set (set.id)}
            <option value={set.id}>{set.name}</option>
          {/each}
        </select>
        {#if forcedPicks.preferredExpansionId}
          {@const preferredSet = bundle.runtime.indexes.setsById[forcedPicks.preferredExpansionId]}
          <div class="row gap-sm align-center wrap" data-preferred-expansion-active>
            <span>{locale.t('newGame.forcedPicks.preferredExpansion.active', { name: preferredSet?.name ?? forcedPicks.preferredExpansionId })}</span>
            <button
              type="button"
              class="button button-secondary"
              data-action="clear-preferred-expansion"
              onclick={() => gameActions.setPreferredExpansion(null)}
            >{locale.t('newGame.forcedPicks.preferredExpansion.clear')}</button>
          </div>
        {/if}
      </div>
    {:else}
      <p class="muted" data-preferred-expansion-unavailable>{locale.t('newGame.forcedPicks.preferredExpansion.unavailable')}</p>
    {/if}
    {#if activeHeroTeamNames.length > 0}
      <div class="stack gap-sm" data-forced-team-section>
        <label for="forced-team-select"><strong>{locale.t('newGame.forcedPicks.forcedTeam.label')}</strong></label>
        <select
          id="forced-team-select"
          data-forced-team-select
          value={forcedPicks.forcedTeam ?? ''}
          onchange={(e) => gameActions.setForcedTeam((e.target as HTMLSelectElement).value || null)}
        >
          <option value="">{locale.t('newGame.forcedPicks.forcedTeam.placeholder')}</option>
          {#each activeHeroTeamNames as team (team)}
            <option value={team}>{team}</option>
          {/each}
        </select>
        {#if forcedPicks.forcedTeam}
          <div class="row gap-sm align-center wrap" data-forced-team-active>
            <span>{locale.t('newGame.forcedPicks.forcedTeam.active', { name: forcedPicks.forcedTeam })}</span>
            <button
              type="button"
              class="button button-secondary"
              data-action="clear-forced-team"
              onclick={() => gameActions.setForcedTeam(null)}
            >{locale.t('newGame.forcedPicks.forcedTeam.clear')}</button>
          </div>
        {/if}
      </div>
    {:else}
      <p class="muted" data-forced-team-unavailable>{locale.t('newGame.forcedPicks.forcedTeam.unavailable')}</p>
    {/if}
    {#if modeIneligibleSchemeIds.size > 0}
      <p class="muted" data-scheme-mode-ineligibility-notice>
        {locale.t('newGame.forcedPicks.schemesModeIneligible', {
          count: modeIneligibleSchemeIds.size,
          mode: locale.getPlayModeLabel(selectedPlayMode, selectedPlayerCount)
        })}
      </p>
    {/if}
  </section>
</details>
