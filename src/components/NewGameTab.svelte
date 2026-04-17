<script>
  import { getAvailablePlayModes, getDisplayedSetupRequirements } from '../app/new-game-utils.mjs';
  import { FORCED_PICK_FIELD_CONFIGS, hasForcedPicks } from '../app/forced-picks-utils.mjs';
  import { buildOwnedPools, validateSetupLegality } from '../app/setup-generator.mjs';

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
  } = $props();

  let availablePlayModes = $derived(getAvailablePlayModes(selectedPlayerCount));
  let displayedRequirements = $derived(getDisplayedSetupRequirements({
    playerCount: selectedPlayerCount,
    advancedSolo,
    playMode: selectedPlayMode,
    currentSetup
  }));
  let hasActiveForcedPicks = $derived(hasForcedPicks(forcedPicks));

  let filterFeasibility = $derived.by(() => {
    return validateSetupLegality({
      runtime: bundle.runtime,
      state: appState,
      playerCount: selectedPlayerCount,
      advancedSolo,
      playMode: selectedPlayMode,
      forcedPicks: null
    });
  });

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

  let entityIndexes = $derived({
    schemeId: bundle.runtime.indexes.schemesById,
    mastermindId: bundle.runtime.indexes.mastermindsById,
    heroIds: bundle.runtime.indexes.heroesById,
    villainGroupIds: bundle.runtime.indexes.villainGroupsById,
    henchmanGroupIds: bundle.runtime.indexes.henchmanGroupsById
  });

  function formatForcedByLabel(forcedBy) {
    const values = Array.isArray(forcedBy) ? forcedBy : [forcedBy];
    return locale.formatList(values.map((v) => {
      if (v === 'mastermind') return locale.t('newGame.forcedPicks.reason.mastermind');
      if (v === 'scheme') return locale.t('newGame.forcedPicks.reason.scheme');
      return locale.t('newGame.forcedPicks.reason.default');
    }));
  }

  function getActiveIds(config) {
    if (config.multi) return forcedPicks[config.field];
    return forcedPicks[config.field] ? [forcedPicks[config.field]] : [];
  }

  function getAvailableOptions(config) {
    const opts = ownedForcedPickOptions[config.field];
    return config.multi ? opts.filter((e) => !getActiveIds(config).includes(e.id)) : opts;
  }

  function handleAddForcedPick(field) {
    const sel = document.querySelector(`[data-forced-pick-select="${field}"]`);
    gameActions.addForcedPick(field, sel?.value || '');
  }
</script>

<section class={"two-col shell-two-col page-flow" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

  <!-- Setup controls panel -->
  <section class="panel">
    <h2>{locale.t('newGame.panel.setupTitle')}</h2>
    <div class={"stack gap-md" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

      {#if appState.collection.ownedSetIds.length > 0}
        <!-- Active expansion filter panel -->
        <details class="panel" data-active-filter-panel open>
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
                      const nowChecked = e.target.checked;
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
                onclick={gameActions.clearActiveSetIds}
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
                  <span class="pill">{locale.t('newGame.forcedPicks.forcedBy', { value: formatForcedByLabel(group.forcedBy) })}</span>
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
                  <span class="pill">{locale.t('newGame.forcedPicks.forcedBy', { value: formatForcedByLabel(group.forcedBy) })}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </section>

</section>
