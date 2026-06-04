<script lang="ts">
  import { getAvailablePlayModes, getDisplayedSetupRequirements } from '../app/new-game-utils.ts';
  import type { PlayModeOption } from '../app/new-game-utils.ts';
  import { FORCED_PICK_FIELD_CONFIGS, hasForcedPicks } from '../app/forced-picks-utils.ts';
  import type { ForcedPicks } from '../app/forced-picks-utils.ts';
  import { buildOwnedPools } from '../app/setup-pool-builder.ts';
  import { validateSetupLegality } from '../app/setup-validator.ts';
  import { getSoloRulesItems, SOLO_RULES_PANEL_MODES } from '../app/solo-rules.ts';
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { AppState, LocaleTools, GeneratedSetup, PlayMode, GeneratorNotice } from '../app/types.ts';
  import { EPIC_MASTERMIND_SUPPORTED_SETS } from '../app/types.ts';
  import ActiveSetFilterPanel from './ActiveSetFilterPanel.svelte';
  import ForcedPicksPanel from './ForcedPicksPanel.svelte';
  import SetupResultCard from './SetupResultCard.svelte';

  let {
    bundle,
    appState,
    locale,
    selectedPlayerCount,
    selectedPlayMode,
    advancedSolo,
    currentSetup,
    generatorError,
    generatorNotices,
    forcedPicks,
    compactViewport,
    gameActions
  }: {
    bundle: Epic1Bundle;
    appState: AppState;
    locale: LocaleTools;
    selectedPlayerCount: number;
    selectedPlayMode: PlayMode;
    advancedSolo: boolean;
    currentSetup: GeneratedSetup | null;
    generatorError: string | null;
    generatorNotices: GeneratorNotice[];
    forcedPicks: ForcedPicks;
    compactViewport: boolean;
    gameActions: {
      setPlayerCount: (n: number) => void;
      setPlayMode: (mode: string) => void;
      generateSetup: () => void;
      acceptCurrentSetup: () => void;
      addForcedPick: (field: string, value: string) => void;
      removeForcedPick: (field: string, id: string) => void;
      clearForcedPicks: () => void;
      clearToDefaults: () => void;
      setActiveSetIds: (ids: string[]) => void;
      clearActiveSetIds: () => void;
      deactivateAllSets: () => void;
      setPreferredExpansion: (id: string | null) => void;
      setForcedTeam: (team: string | null) => void;
      setEpicMastermind: (enabled: boolean) => void;
    };
  } = $props();

  let availablePlayModes: PlayModeOption[] = $derived(getAvailablePlayModes(selectedPlayerCount));
  let displayedRequirements: ReturnType<typeof getDisplayedSetupRequirements> = $derived(getDisplayedSetupRequirements({
    playerCount: selectedPlayerCount,
    advancedSolo,
    playMode: selectedPlayMode,
    currentSetup
  }));
  let hasActiveForcedPicks: boolean = $derived(hasForcedPicks(forcedPicks));

  let epicMastermindEnabled: boolean = $derived(appState.preferences.lastEpicMastermind ?? false);
  let hasEpicMastermindSets: boolean = $derived(
    (appState.collection.activeSetIds ?? appState.collection.ownedSetIds).some((id) => {
      const setEntry = bundle.runtime.indexes.setsById[id];
      return setEntry !== undefined && EPIC_MASTERMIND_SUPPORTED_SETS.includes(setEntry.name);
    })
  );

  let soloRulesItems: string[] | null = $derived(
    currentSetup && selectedPlayerCount === 1 && SOLO_RULES_PANEL_MODES.has(selectedPlayMode)
      ? getSoloRulesItems(selectedPlayMode)
      : null
  );

  let filterFeasibility = $derived(validateSetupLegality({
    runtime: bundle.runtime,
    state: appState,
    playerCount: selectedPlayerCount,
    advancedSolo,
    playMode: selectedPlayMode,
    forcedPicks: null
  }));

  let ownedForcedPickOptions = $derived.by(() => {
    const pools = buildOwnedPools(bundle.runtime, appState.collection.ownedSetIds);
    return {
      schemeId: [...pools.schemes].sort((a, b) => a.name.localeCompare(b.name)),
      mastermindId: [...pools.masterminds].sort((a, b) => a.name.localeCompare(b.name)),
      heroIds: [...pools.heroes].sort((a, b) => a.name.localeCompare(b.name)),
      villainGroupIds: [...pools.villainGroups].sort((a, b) => a.name.localeCompare(b.name)),
      henchmanGroupIds: [...pools.henchmanGroups].sort((a, b) => a.name.localeCompare(b.name))
    };
  });

  let ownedExpansions: Array<{ id: string; name: string }> = $derived(
    bundle.runtime.sets
      .filter((set) => appState.collection.ownedSetIds.includes(set.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  let modeIneligibleSchemeIds: Set<string> = $derived.by(() => {
    if (selectedPlayMode !== 'standard' || selectedPlayerCount !== 1) return new Set<string>();
    return new Set(ownedForcedPickOptions.schemeId
      .filter((s) => s.constraints?.incompatiblePlayModes?.includes('standard-solo'))
      .map((s) => s.id));
  });

  let entityIndexes: Record<string, Record<string, { id: string; name: string }>> = $derived({
    schemeId: bundle.runtime.indexes.schemesById,
    mastermindId: bundle.runtime.indexes.mastermindsById,
    heroIds: bundle.runtime.indexes.heroesById,
    villainGroupIds: bundle.runtime.indexes.villainGroupsById,
    henchmanGroupIds: bundle.runtime.indexes.henchmanGroupsById
  });

  function getActiveIds(config: { field: string; multi: boolean }): string[] {
    const val = (forcedPicks as unknown as Record<string, string | string[] | null>)[config.field];
    if (config.multi) return (val as string[]) ?? [];
    return val ? [val as string] : [];
  }

  let activeHeroTeamNames: string[] = $derived.by(() => {
    const effectiveSetIds = appState.collection.activeSetIds ?? appState.collection.ownedSetIds;
    const pools = buildOwnedPools(bundle.runtime, effectiveSetIds);
    const teamSet = new Set<string>();
    for (const hero of pools.heroes) {
      for (const team of hero.teams) {
        if (team) teamSet.add(team);
      }
    }
    return [...teamSet].sort((a, b) => a.localeCompare(b));
  });
</script>

<section class={"two-col shell-two-col page-flow" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

  <!-- Setup controls panel -->
  <section class="panel">
    <h2>{locale.t('newGame.panel.setupTitle')}</h2>
    <div data-new-game-status-summary class="muted">
      <span data-status-field="owned-sets">{appState.collection.ownedSetIds.length}</span>
      · <span data-status-field="last-persisted">{appState.preferences.lastPlayMode}</span>
    </div>
    <div class={"stack gap-md" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

      <div data-mobile-task-anchor="new-game">
        <h3>{locale.t('newGame.playerCount')}</h3>
        <div class="button-row">
          {#each [1,2,3,4,5] as pc (pc)}
            <button
              class={"button " + (selectedPlayerCount === pc ? 'button-primary' : 'button-secondary')}
              data-action="set-player-count"
              data-player-count={pc}
              onclick={() => gameActions.setPlayerCount(pc)}
            >{pc}P</button>
          {/each}
        </div>
      </div>

      <div>
        <h3>{locale.t('newGame.playMode')}</h3>
        <div class="button-row">
          {#each availablePlayModes as mode (mode.id)}
            <button
              class={"button " + (selectedPlayMode === mode.id ? 'button-primary' : 'button-secondary')}
              data-action="set-play-mode"
              data-play-mode={mode.id}
              aria-pressed={selectedPlayMode === mode.id}
              title={locale.getPlayModeDescription(mode.id, selectedPlayerCount)}
              onclick={() => gameActions.setPlayMode(mode.id)}
            >{selectedPlayMode === mode.id ? `${locale.getPlayModeLabel(mode.id, selectedPlayerCount)} ✓` : locale.getPlayModeLabel(mode.id, selectedPlayerCount)}</button>
          {/each}
        </div>
      </div>

      {#if hasEpicMastermindSets}
        <label>
          <input
            type="checkbox"
            checked={epicMastermindEnabled}
            data-epic-mastermind-toggle
            onchange={() => gameActions.setEpicMastermind(!epicMastermindEnabled)}
          /> {locale.t('newGame.epicMastermind')}
          <small class="muted">{locale.t('newGame.epicMastermind.help')}</small>
        </label>
      {/if}

      <div class="row wrap gap-sm align-center">
        <button
          class="button button-secondary"
          data-action="clear-setup-controls"
          onclick={gameActions.clearToDefaults}
        >{locale.t('newGame.resetControls')}</button>
      </div>

      <div class="muted new-game-mode-help">{locale.getPlayModeHelpText(selectedPlayerCount, selectedPlayMode)}</div>

      <div class="result-card current-requirements-card" id="setup-requirements-card">
        <h3>{locale.t('newGame.setupRequirements')}</h3>
        <div class="muted">{locale.formatEntityCount(displayedRequirements.heroCount, 'common.heroTitle', 'common.heroes')} · {locale.formatEntityCount(displayedRequirements.villainGroupCount, 'common.villainGroupTitle', 'common.villainGroups')} · {locale.formatEntityCount(displayedRequirements.henchmanGroupCount, 'common.henchmanGroupTitle', 'common.henchmanGroups')} · {locale.formatEntityCount(displayedRequirements.wounds, 'common.wound', 'common.wounds')}</div>
        {#if selectedPlayMode === 'two-handed-solo' && !compactViewport}
          <div class="muted new-game-two-handed-help">{locale.t('newGame.twoHandedHelp')}</div>
        {/if}
      </div>

      <div class="stack gap-sm" data-active-constraints>
        <div class="row space-between wrap gap-sm align-center">
          <strong>{locale.t('newGame.forcedPicks.activeConstraints')}</strong>
          <button
            type="button"
            class="button button-secondary"
            data-action="clear-forced-picks"
            disabled={!hasActiveForcedPicks}
            onclick={gameActions.clearForcedPicks}
          >{locale.t('newGame.forcedPicks.clearAll')}</button>
        </div>
        {#if hasActiveForcedPicks}
          <ul class="clean result-list">
            {#each FORCED_PICK_FIELD_CONFIGS as config (config.field)}
              {#each getActiveIds(config) as id (id)}
                {@const entity = entityIndexes[config.field][id]}
                {@const label = entity ? entity.name : `${id} (not currently owned)`}
                <li class="result-list-item" data-forced-pick-field={config.field} data-forced-pick-id={id}>
                  <span><strong>{locale.t(`newGame.forcedPicks.field.${config.field}`)}:</strong> {label}</span>
                  <button
                    type="button"
                    class="button button-secondary"
                    data-action="remove-forced-pick"
                    data-field={config.field}
                    data-entity-id={id}
                    onclick={() => gameActions.removeForcedPick(config.field, id)}
                  >{locale.t('newGame.forcedPicks.remove')}</button>
                </li>
              {/each}
            {/each}
          </ul>
        {:else}
          <p class="muted empty-state">{locale.t('newGame.forcedPicks.none')}</p>
        {/if}
      </div>
      <div class="button-row">
        <button
          class="button button-primary"
          data-action="generate-setup"
          disabled={appState.collection.activeSetIds !== null && !filterFeasibility.ok}
          onclick={gameActions.generateSetup}
        >{currentSetup ? locale.t('newGame.reroll') : locale.t('newGame.generate')}</button>
        <button
          class="button button-success"
          data-action="accept-current-setup"
          disabled={!currentSetup}
          onclick={gameActions.acceptCurrentSetup}
        >{locale.t('newGame.acceptLog')}</button>
      </div>

      {#if !compactViewport}
        <div class="muted new-game-ephemeral-notice">{locale.t('newGame.ephemeralNotice')}</div>
      {/if}

      <ForcedPicksPanel
        {forcedPicks}
        {ownedForcedPickOptions}
        {gameActions}
        {locale}
        {modeIneligibleSchemeIds}
        {ownedExpansions}
        {activeHeroTeamNames}
        {selectedPlayMode}
        {selectedPlayerCount}
        {bundle}
      />

      {#if appState.collection.ownedSetIds.length > 0}
        <ActiveSetFilterPanel
          {appState}
          {bundle}
          {gameActions}
          {locale}
          {filterFeasibility}
        />
      {/if}

    </div>
  </section>

  <SetupResultCard
    {currentSetup}
    {soloRulesItems}
    {locale}
    {generatorError}
    {generatorNotices}
  />
</section>
