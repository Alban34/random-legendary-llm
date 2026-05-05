<script lang="ts">
  import type { LocaleTools } from '../app/types.ts';

  let {
    firstRun,
    compactViewport,
    locale,
    onStartOnboarding
  }: {
    firstRun: boolean;
    compactViewport: boolean;
    locale: LocaleTools;
    onStartOnboarding: () => void;
  } = $props();
</script>

<details class={"panel browse-help-disclosure" + (compactViewport ? ' compact-mobile' : '')} data-browse-help-disclosure>
  <summary>{locale.t('browse.startHere.title')}</summary>
  <div class="stack gap-sm browse-priority-list">
    {#if !compactViewport || firstRun}
      <p class="muted browse-help-description">{locale.t('browse.startHere.description')}</p>
    {/if}
    <article class="summary-card browse-priority-item">
      <strong>{locale.t('browse.startHere.step1Title')}</strong>
      <div class="muted">{locale.t('browse.startHere.step1Body')}</div>
    </article>
    <article class="summary-card browse-priority-item">
      <strong>{locale.t('browse.startHere.step2Title')}</strong>
      <div class="muted">{locale.t('browse.startHere.step2Body')}</div>
    </article>
    <article class="summary-card browse-priority-item">
      <strong>{locale.t('browse.startHere.step3Title')}</strong>
      <div class="muted">{locale.t('browse.startHere.step3Body')}</div>
    </article>
    <div class="button-row" data-help-walkthrough-action>
      <button
        type="button"
        class="button button-secondary"
        data-action="start-onboarding"
        onclick={onStartOnboarding}
      >{locale.t('browse.hero.replayWalkthrough')}</button>
    </div>
  </div>
</details>
