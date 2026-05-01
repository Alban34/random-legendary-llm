<script lang="ts">
  import { getAvailablePlayModes, getDisplayedSetupRequirements } from '../app/new-game-utils.ts';
  import type { PlayModeOption } from '../app/new-game-utils.ts';
  import { FORCED_PICK_FIELD_CONFIGS, hasForcedPicks } from '../app/forced-picks-utils.ts';
  import type { ForcedPicks } from '../app/forced-picks-utils.ts';
  import { buildOwnedPools, validateSetupLegality } from '../app/setup-generator.ts';
  import { getSoloRulesItems, SOLO_RULES_PANEL_MODES } from '../app/solo-rules.ts';
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { AppState, LocaleTools, GeneratedSetup, PlayMode, SchemeRuntime, HeroRuntime, MastermindRuntime, VillainGroupRuntime, HenchmanGroupRuntime } from '../app/types.ts';
  import { EPIC_MASTERMIND_SUPPORTED_SETS } from '../app/types.ts';

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
    generatorNotices: string[];
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

  let filterFeasibility: ReturnType<typeof validateSetupLegality> = $derived.by(() => {
    return validateSetupLegality({
      runtime: bundle.runtime,
      state: appState,
      playerCount: selectedPlayerCount,
      advancedSolo,
      playMode: selectedPlayMode,
      forcedPicks: null
    });
  });

  let ownedForcedPickOptions: {
    schemeId: SchemeRuntime[];
    mastermindId: MastermindRuntime[];
    heroIds: HeroRuntime[];
    villainGroupIds: VillainGroupRuntime[];
    henchmanGroupIds: HenchmanGroupRuntime[];
  } = $derived.by(() => {
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
    return new Set<string>(
      ownedForcedPickOptions.schemeId
        .filter((s) => s.constraints?.incompatiblePlayModes?.includes('standard-solo'))
        .map((s) => s.id)
    );
  });

  let entityIndexes: Record<string, Record<string, { id: string; name: string }>> = $derived({
    schemeId: bundle.runtime.indexes.schemesById,
    mastermindId: bundle.runtime.indexes.mastermindsById,
    heroIds: bundle.runtime.indexes.heroesById,
    villainGroupIds: bundle.runtime.indexes.villainGroupsById,
    henchmanGroupIds: bundle.runtime.indexes.henchmanGroupsById
  });

  function formatForcedByLabel(forcedBy: string | string[]): string {
    const values = Array.isArray(forcedBy) ? forcedBy : [forcedBy];
    return locale.formatList(values.map((v) => {
      if (v === 'mastermind') return locale.t('newGame.forcedPicks.reason.mastermind');
      if (v === 'scheme') return locale.t('newGame.forcedPicks.reason.scheme');
      return locale.t('newGame.forcedPicks.reason.default');
    }));
  }

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

  let activeExpansionsPanelOpen = $state(false);
</script>

<section class={"two-col shell-two-col page-flow" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

  <!-- Setup controls panel -->
  <section class="panel">
    <h2>{locale.t('newGame.panel.setupTitle')}</h2>
    <div class={"stack gap-md" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

      {#if appState.collection.ownedSetIds.length > 0}
        <!-- Active expansion filter panel -->
        <div class="panel" data-active-filter-panel>
          <div>
            {locale.t('newGame.activeFilter.title')}
            <span class="muted">
              — {#if appState.collection.activeSetIds === null}
                {locale.t('newGame.activeFilter.summaryAll', { count: appState.collection.ownedSetIds.length })}
              {:else}
                {locale.t('newGame.activeFilter.summaryFiltered', { active: appState.collection.activeSetIds.length, total: appState.collection.ownedSetIds.length })}
              {/if}
            </span>
            <button
              type="button"
              data-action="toggle-active-filter-panel"
              aria-expanded={activeExpansionsPanelOpen}
              aria-label={locale.t('newGame.activeFilter.title')}
              onclick={() => (activeExpansionsPanelOpen = !activeExpansionsPanelOpen)}
            >▼</button>
          </div>
          {#if activeExpansionsPanelOpen}
          <section class="result-card" style="margin-top: var(--space-sm)">
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
          {/if}
        </div>
        {#if appState.collection.activeSetIds !== null && !filterFeasibility.ok}
          <div class="notice warning" data-active-filter-warning>
            <ul>
              {#each filterFeasibility.reasons as reason}
                <li>{reason}</li>
              {/each}
            </ul>
          </div>
        {/if}
      {/if}

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

      <div class="summary-grid">
        <div class="summary-card">
          <div class="muted">{locale.t('newGame.selectedMode')}</div>
          <div class="metric-sm">{availablePlayModes.some((m) => m.id === selectedPlayMode) ? locale.getPlayModeLabel(selectedPlayMode, selectedPlayerCount) : locale.getPlayModeLabel('standard', selectedPlayerCount)}</div>
        </div>
        <div class="summary-card">
          <div class="muted">{locale.t('newGame.ownedSets')}</div>
          <div class="metric-sm">{appState.collection.ownedSetIds.length}</div>
        </div>
        <div class="summary-card">
          <div class="muted">{locale.t('newGame.lastPersistedMode')}</div>
          <div class="metric-sm">{locale.formatPersistedPlayMode(appState.preferences.lastPlayerCount, appState.preferences.lastPlayMode)}</div>
        </div>
      </div>

      <div class="result-card current-requirements-card" id="setup-requirements-card">
        <h3>{locale.t('newGame.setupRequirements')}</h3>
        <div class="muted">{locale.formatEntityCount(displayedRequirements.heroCount, 'common.heroTitle', 'common.heroes')} · {locale.formatEntityCount(displayedRequirements.villainGroupCount, 'common.villainGroupTitle', 'common.villainGroups')} · {locale.formatEntityCount(displayedRequirements.henchmanGroupCount, 'common.henchmanGroupTitle', 'common.henchmanGroups')} · {locale.formatEntityCount(displayedRequirements.wounds, 'common.wound', 'common.wounds')}</div>
        {#if selectedPlayMode === 'two-handed-solo' && !compactViewport}
          <div class="muted new-game-two-handed-help">{locale.t('newGame.twoHandedHelp')}</div>
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

      <!-- Forced picks panel -->
      <details>
        <summary>{locale.t('newGame.forcedPicks.title')}</summary>
        <section class="result-card" data-forced-picks-panel>
          <h3>{locale.t('newGame.forcedPicks.title')}</h3>
          <div class="muted">{locale.t('newGame.forcedPicks.description')}</div>
          <div class="stack gap-md">
            {#each FORCED_PICK_FIELD_CONFIGS as config (config.field)}
              {@const availableOptions = getAvailableOptions(config)}
              <div class="stack gap-sm">
                <label for={"forced-pick-" + config.field}><strong>{locale.t(`newGame.forcedPicks.field.${config.field}`)}</strong></label>
                <div class="button-row wrap">
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
          <div class="stack gap-sm">
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
        </section>
      </details>

    </div>
  </section>

  <!-- Setup result panel -->
  <section class="panel">
    <h2>{locale.t('newGame.panel.resultTitle')}</h2>
    <div class="stack gap-md">
      <!-- Generator notices -->
      {#if generatorError}
        <div class="notice warning">{generatorError}</div>
      {:else if !currentSetup}
        <div class="notice info">{locale.t('newGame.generator.previewNotice')}</div>
      {:else if !generatorNotices.length}
        <div class="notice success">{locale.t('newGame.generator.freshNotice')}</div>
      {:else}
        {#each generatorNotices as notice (notice)}
          <div class="notice info">{notice}</div>
        {/each}
      {/if}

      {#if !currentSetup}
        <div class="summary-grid">
          <div class="summary-card"><div class="muted">{locale.t('common.heroes')}</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">{locale.t('common.villainGroups')}</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">{locale.t('common.henchmanGroups')}</div><div class="metric-sm">—</div></div>
          <div class="summary-card"><div class="muted">{locale.t('common.wounds')}</div><div class="metric-sm">—</div></div>
        </div>
      {:else}
        <div class="summary-grid">
          <div class="summary-card"><div class="muted">{locale.t('common.heroes')}</div><div class="metric-sm">{currentSetup.requirements.heroCount}</div></div>
          <div class="summary-card"><div class="muted">{locale.t('common.villainGroups')}</div><div class="metric-sm">{currentSetup.requirements.villainGroupCount}</div></div>
          <div class="summary-card"><div class="muted">{locale.t('common.henchmanGroups')}</div><div class="metric-sm">{currentSetup.requirements.henchmanGroupCount}</div></div>
          <div class="summary-card"><div class="muted">{locale.t('common.wounds')}</div><div class="metric-sm">{currentSetup.requirements.wounds}</div></div>
        </div>

        <div class="result-card" data-result-section="mastermind">
          <h3>{locale.t('newGame.result.mastermind')}</h3>
          <div><strong>{currentSetup.mastermind.name}</strong></div>
          <div class="muted">{currentSetup.mastermind.leadEntity ? locale.t('common.alwaysLeads', { name: currentSetup.mastermind.leadEntity.name }) : locale.t('common.noMandatoryLead')}</div>
          {#if currentSetup.mastermind.leadEntity}
            <div class="pill">★ {locale.t('common.mandatoryLead')}</div>
          {/if}
          {#if currentSetup.mastermind.notes.length}
            <div class="muted">{currentSetup.mastermind.notes.join(' ')}</div>
          {/if}
        </div>

        <div class="result-card" data-result-section="scheme">
          <h3>{locale.t('newGame.result.scheme')}</h3>
          <div><strong>{currentSetup.scheme.name}</strong></div>
          <div class="muted">{locale.t('newGame.result.modeBystanders', { mode: currentSetup.template.modeLabel, count: locale.formatNumber(currentSetup.requirements.bystanders) })}</div>
          {#if currentSetup.scheme.notes.length}
            <div class="notice info">⚠ {locale.t('newGame.result.special', { notes: currentSetup.scheme.notes.join(' ') })}</div>
          {/if}
        </div>

        <div class="result-card" data-result-section="heroes">
          <h3>{locale.t('newGame.result.heroes')}</h3>
          {#if currentSetup.forcedPicks.forcedTeam}
            <div class="pill" data-forced-team-badge>{locale.t('newGame.forcedPicks.forcedTeam.active', { name: currentSetup.forcedPicks.forcedTeam })}</div>
          {/if}
          <div class="new-game-hero-grid">
            {#each currentSetup.heroes as hero (hero.id)}
              <article class="result-card hero-result-card" data-hero-id={hero.id}>
                <h3>{hero.name}</h3>
                <div class="muted">{hero.teams?.length ? hero.teams.join(' · ') : locale.t('common.noTeamListed')}</div>
              </article>
            {/each}
          </div>
        </div>

        <div class="result-card" data-result-section="villain-groups">
          <h3>{locale.t('newGame.result.villainGroups')}</h3>
          <ul class="clean result-list">
            {#each currentSetup.villainGroups as group (group.name)}
              <li class="result-list-item">
                <span>{group.name}</span>
                {#if group.forced}
                  <span class="pill">{locale.t('newGame.forcedPicks.forcedBy', { value: formatForcedByLabel(group.forcedBy!) })}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </div>

        <div class="result-card" data-result-section="henchman-groups">
          <h3>{locale.t('newGame.result.henchmanGroups')}</h3>
          <ul class="clean result-list">
            {#each currentSetup.henchmanGroups as group (group.name)}
              <li class="result-list-item">
                <span>{group.name}</span>
                {#if group.forced}
                  <span class="pill">{locale.t('newGame.forcedPicks.forcedBy', { value: formatForcedByLabel(group.forcedBy!) })}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </div>

        {#if soloRulesItems}
          <details class="result-card" data-result-section="solo-rules" open>
            <summary><strong>{locale.t('newGame.soloRules.sectionTitle')}</strong></summary>
            <ul class="clean result-list" style="margin-top: var(--space-sm)">
              {#each soloRulesItems as key (key)}
                <li>{locale.t(key)}</li>
              {/each}
            </ul>
          </details>
        {/if}
      {/if}
    </div>
  </section>

</section>
