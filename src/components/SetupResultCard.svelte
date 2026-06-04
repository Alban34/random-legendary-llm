<script lang="ts">
  import type { LocaleTools, GeneratedSetup, GeneratorNotice } from '../app/types.ts';

  let {
    currentSetup,
    soloRulesItems,
    locale,
    generatorError,
    generatorNotices
  }: {
    currentSetup: GeneratedSetup | null;
    soloRulesItems: string[] | null;
    locale: LocaleTools;
    generatorError: string | null;
    generatorNotices: GeneratorNotice[];
  } = $props();

  function formatForcedByLabel(forcedBy: string | string[]): string {
    const values = Array.isArray(forcedBy) ? forcedBy : [forcedBy];
    return locale.formatList(values.map((v) => {
      if (v === 'mastermind') return locale.t('newGame.forcedPicks.reason.mastermind');
      if (v === 'scheme') return locale.t('newGame.forcedPicks.reason.scheme');
      return locale.t('newGame.forcedPicks.reason.default');
    }));
  }
</script>

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
      {#each generatorNotices as notice (notice.key)}
        <div class="notice info">{locale.t(notice.key, notice.values)}</div>
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
