<script>
  import { summarizeUsageIndicators } from '../app/history-utils.mjs';

  let {
    bundle,
    appState,
    locale,
    compactViewport,
    backupImportError,
    stagedBackup,
    backupActions
  } = $props();

  let indicators = $derived(summarizeUsageIndicators(bundle.runtime, appState));

  function handleFileChange(e) {
    const [file] = [...(e.target.files || [])];
    if (file) backupActions.importBackupFile(file);
    e.target.value = '';
  }
</script>

<section class={"page-flow stack gap-md" + (compactViewport ? ' page-flow-compact-mobile' : '')}>

  <!-- Portability panel -->
  <section class="panel" data-backup-panel data-backup-portability-panel>
    <div class={"panel-copy" + (compactViewport ? ' compact-mobile' : '')}>
      <h2>{locale.t('backup.title')}</h2>
      {#if !compactViewport}
        <div class="muted backup-panel-description">{locale.t('backup.portabilityDescription')}</div>
      {/if}
    </div>
    <div class="button-row" data-mobile-task-anchor="backup">
      <button
        class="button button-secondary"
        data-action="export-backup"
        onclick={backupActions.exportBackup}
      >{locale.t('backup.export')}</button>
      <button
        class="button button-primary"
        data-action="open-import-backup"
        onclick={backupActions.openImportBackup}
      >{locale.t('backup.import')}</button>
    </div>
    <p class="muted storage-disclosure" data-storage-disclosure>
      <strong>{locale.t('storage.disclosureTitle')} —</strong>
      {locale.t('storage.disclosureBody')}
    </p>
    <input
      id="backup-import-input"
      class="visually-hidden"
      type="file"
      accept=".json,application/json"
      onchange={handleFileChange}
    />

    <!-- Backup preview / error -->
    {#if backupImportError}
      <div class="notice warning" data-backup-import-error>{backupImportError}</div>
    {:else if stagedBackup}
      {@const { summary, fileName, payload } = stagedBackup}
      {@const usageLines = [
        ['Heroes', summary.usageCounts.heroes],
        ['Masterminds', summary.usageCounts.masterminds],
        ['Villain Groups', summary.usageCounts.villainGroups],
        ['Henchman Groups', summary.usageCounts.henchmanGroups],
        ['Schemes', summary.usageCounts.schemes]
      ]}
      <article class="result-card" data-backup-preview>
        <div class="row space-between wrap gap-sm align-center">
          <div>
            <h3>{locale.t('backup.previewTitle')}</h3>
            <div class="muted">{fileName} · {locale.t('backup.exportedAt', { date: locale.formatDateTime(payload.exportedAt) })}</div>
          </div>
          <span class="pill">v{payload.version}</span>
        </div>
        <div class="summary-grid">
          <div class="summary-card"><div class="muted">{locale.t('backup.summary.ownedSets')}</div><div class="metric-sm">{summary.ownedSetCount}</div></div>
          <div class="summary-card"><div class="muted">{locale.t('backup.summary.historyRecords')}</div><div class="metric-sm">{summary.historyCount}</div></div>
          <div class="summary-card"><div class="muted">{locale.t('backup.summary.theme')}</div><div class="metric-sm">{summary.themeId}</div></div>
          <div class="summary-card"><div class="muted">{locale.t('backup.summary.lastMode')}</div><div class="metric-sm">{summary.playMode}</div></div>
        </div>
        <div class="muted">{locale.t('backup.summary.usageEntries', { value: usageLines.map(([label, count]) => `${label} ${count}`).join(' · ') })}</div>
        <div class="muted">{locale.t('backup.mergeReplaceDescription')}</div>
        <div class="button-row">
          <button
            type="button"
            class="button button-primary"
            data-action="request-merge-backup"
            onclick={backupActions.requestMergeBackup}
          >{locale.t('backup.merge')}</button>
          <button
            type="button"
            class="button button-danger"
            data-action="request-replace-backup"
            onclick={backupActions.requestReplaceBackup}
          >{locale.t('backup.replace')}</button>
          <button
            type="button"
            class="button button-secondary"
            data-action="cancel-backup-preview"
            onclick={backupActions.cancelBackupPreview}
          >{locale.t('backup.discardPreview')}</button>
        </div>
      </article>
    {/if}
  </section>

  <!-- Maintenance panel -->
  {#if compactViewport}
    <details class="maintenance-accordion panel" data-backup-maintenance-panel>
      <summary class="maintenance-accordion-summary">{locale.t('backup.maintenanceTitle')}</summary>
      <div class="maintenance-accordion-body">
        <div class="stack gap-sm history-usage-indicators">
          {#each indicators as indicator (indicator.category)}
            <article class="summary-card history-usage-row" data-usage-category={indicator.category}>
              <div>
                <strong>{locale.getUsageLabel(indicator.category)}</strong>
                <div class="muted">{locale.t('backup.neverPlayed', { value: `${locale.formatNumber(indicator.neverPlayed)}/${locale.formatNumber(indicator.total)}` })}</div>
              </div>
              <button
                class="button button-secondary"
                data-action="reset-usage"
                data-category={indicator.category}
                onclick={() => backupActions.resetUsageCategory(indicator.category)}
              >{locale.t('backup.resetCategory', { label: locale.getUsageLabel(indicator.category) })}</button>
            </article>
          {/each}
        </div>
      </div>
    </details>
  {:else}
    <section class="panel" data-backup-maintenance-panel>
      <div class="panel-copy">
        <h2>{locale.t('backup.maintenanceTitle')}</h2>
        <div class="muted backup-usage-description">{locale.t('backup.usedCardDescription')}</div>
      </div>
      <div class="stack gap-sm history-usage-indicators">
        {#each indicators as indicator (indicator.category)}
          <article class="summary-card history-usage-row" data-usage-category={indicator.category}>
            <div>
              <strong>{locale.getUsageLabel(indicator.category)}</strong>
              <div class="muted">{locale.t('backup.neverPlayed', { value: `${locale.formatNumber(indicator.neverPlayed)}/${locale.formatNumber(indicator.total)}` })}</div>
            </div>
            <button
              class="button button-secondary"
              data-action="reset-usage"
              data-category={indicator.category}
              onclick={() => backupActions.resetUsageCategory(indicator.category)}
            >{locale.t('backup.resetCategory', { label: locale.getUsageLabel(indicator.category) })}</button>
          </article>
        {/each}
      </div>
      <p class="muted backup-reuse-notice">{locale.t('backup.lowestPlayReuse')}</p>
    </section>
  {/if}

  <!-- Danger zone -->
  <section class="panel danger-zone" data-backup-danger-zone>
    <h2>{locale.t('backup.dangerZoneTitle')}</h2>
    <p>{locale.t('backup.dangerZoneConsequence')}</p>
    <div class="button-row">
      <button
        class="button button-danger"
        data-action="request-reset-all-state"
        onclick={backupActions.requestResetAllState}
      >{locale.t('backup.fullReset')}</button>
    </div>
  </section>

</section>
