<script lang="ts">
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import type { AppState, LocaleTools, AppPersistenceState, GeneratedSetup, HeroRuntime, MastermindRuntime } from '../app/types.ts';

  let {
    bundle,
    appState,
    locale,
    persistence,
    currentSetup,
    selectedTab,
    onToggleAboutPanel
  }: {
    bundle: Epic1Bundle;
    appState: AppState;
    locale: LocaleTools;
    persistence: AppPersistenceState;
    currentSetup: GeneratedSetup | null;
    selectedTab: string;
    onToggleAboutPanel: () => void;
  } = $props();

  const KNOWN_DUPLICATE_ENTITY_NAMES = ['Black Widow', 'Loki', 'Thor', 'Nova', 'Venom'];

  function formatDuplicateEntries(): Array<{ name: string; all: Array<HeroRuntime | MastermindRuntime> }> {
    return KNOWN_DUPLICATE_ENTITY_NAMES
      .map((name) => {
        const heroes = bundle.runtime.indexes.allHeroes.filter((entity) => entity.name === name);
        const masterminds = bundle.runtime.indexes.allMasterminds.filter((entity) => entity.name === name);
        return { name, all: [...heroes, ...masterminds] };
      })
      .filter((entry) => entry.all.length > 1);
  }

  let failedTests = $derived(bundle.tests.filter((t) => t.status === 'fail'));
  let duplicates = $derived(formatDuplicateEntries());
</script>

<section class="panel about-panel" id="about-panel">
  <div class="row space-between wrap gap-md align-center">
    <div class="panel-copy">
      <div class="eyebrow">{locale.t('about.eyebrow')}</div>
      <h2>{locale.t('about.title')}</h2>
      <p class="muted">{locale.t('about.description')}</p>
    </div>
    <div class="button-row">
      <button
        type="button"
        class="button button-secondary"
        data-action="toggle-about-panel"
        onclick={onToggleAboutPanel}
      >{locale.t('about.hide')}</button>
    </div>
  </div>
  <section class="two-col about-layout">
    <section class="stack gap-md">
      <details class="about-card">
        <summary><h3>{locale.t('about.initStatus')}</h3></summary>
        <div>
          {#if failedTests.length}
            <p class="error">{locale.t('about.failedInit', { count: locale.formatNumber(failedTests.length) })}</p>
          {:else}
            <p class="status-pass">{locale.t('about.loadedOk')}</p>
          {/if}
        </div>
      </details>
      <details class="about-card">
        <summary><h3>{locale.t('about.dataSamples')}</h3></summary>
        <div class="stack gap-sm">
          {#each duplicates as entry (entry.name)}
            <details>
              <summary>{entry.name} <span class="pill">{locale.formatNumber(entry.all.length)} {locale.t('about.entries')}</span></summary>
              <pre>{entry.all.map((entity) => `${entity.id}  ←  ${entity.setId}`).join('\n')}</pre>
            </details>
          {/each}
        </div>
      </details>
      <details class="about-card">
        <summary><h3>{locale.t('about.testResults')}</h3></summary>
        <ul class="clean">
          {#each bundle.tests as test (test.name)}
            <li class={"test " + test.status}>
              <strong class={"status-" + test.status}>{test.status === 'pass' ? 'PASS' : 'FAIL'}</strong>
              — {test.name}
              {#if test.error}<div class="error">{test.error}</div>{/if}
            </li>
          {/each}
        </ul>
      </details>
    </section>
    <section class="stack gap-md">
      <details class="about-card">
        <summary><h3>{locale.t('about.runtimeDiagnostics')}</h3></summary>
        <pre>{JSON.stringify({
          sampleLeadResolution: bundle.runtime.indexes.allMasterminds.filter((e) => e.lead).slice(0, 5),
          sampleForcedSchemes: bundle.runtime.indexes.allSchemes.filter((e) => e.forcedGroups.length || e.modifiers.length).slice(0, 8),
          storageState: {
            storageAvailable: persistence.storageAvailable,
            recoveredOnLoad: persistence.recoveredOnLoad,
            ownedSetIds: appState.collection.ownedSetIds,
            historyCount: appState.history.length,
            selectedTab,
            onboardingCompleted: appState.preferences.onboardingCompleted
          },
          currentSetup: currentSetup ? currentSetup.setupSnapshot : null
        }, null, 2)}</pre>
      </details>
      <details class="about-card">
        <summary><h3>{locale.t('about.persistedState')}</h3></summary>
        <pre>{JSON.stringify(appState, null, 2)}</pre>
      </details>
    </section>
  </section>
</section>
