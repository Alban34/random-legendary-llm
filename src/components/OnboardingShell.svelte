<script lang="ts">
  import type { LocaleTools, OnboardingActions } from '../app/types.ts';

  const ONBOARDING_STEPS = [
    { id: 'browse', tabId: 'browse' },
    { id: 'collection', tabId: 'collection' },
    { id: 'new-game', tabId: 'new-game' },
    { id: 'history', tabId: 'history' },
    { id: 'backup', tabId: 'backup' }
  ];

  let {
    locale,
    visible,
    step,
    onboardingCompleted: _onboardingCompleted,
    onboardingActions
  }: {
    locale: LocaleTools;
    visible: boolean;
    step: number;
    onboardingCompleted?: boolean;
    onboardingActions: OnboardingActions;
  } = $props();

  let clampedStep: number = $derived(Math.max(0, Math.min(step, ONBOARDING_STEPS.length - 1)));
  let currentStep: { id: string; tabId: string } = $derived(ONBOARDING_STEPS[clampedStep]);
  let isLastStep: boolean = $derived(currentStep.id === ONBOARDING_STEPS.at(-1)!.id);
  let currentStepNumber: number = $derived(clampedStep + 1);
</script>

{#if visible}
  <section class="panel onboarding-shell" id="onboarding-shell" aria-live="polite">
    <div class="row space-between wrap gap-md align-center">
      <div class="panel-copy">
        <div class="eyebrow">{locale.t('onboarding.titleEyebrow')}</div>
        <h2>{locale.t('onboarding.title')}</h2>
        <p class="muted">{locale.t('onboarding.description')}</p>
      </div>
      <div class="onboarding-progress" aria-label={locale.t('onboarding.progress')}>
        {#each ONBOARDING_STEPS as stepDef, index (stepDef.id)}
          {@const pillStatus = index === clampedStep ? 'active' : index < clampedStep ? 'complete' : ''}
          <span class={"onboarding-step-pill " + pillStatus}>{locale.t(`onboarding.step${index + 1}.eyebrow`)}</span>
        {/each}
      </div>
    </div>

    <div class="result-card onboarding-step-card" data-onboarding-step={currentStep.id}>
      <div class="eyebrow">{locale.t('onboarding.stepPrefix', { current: currentStepNumber, total: ONBOARDING_STEPS.length })}</div>
      <h3 id="onboarding-step-heading" tabindex="-1">{locale.t(`onboarding.step${currentStepNumber}.title`)}</h3>
      <p>{locale.t(`onboarding.step${currentStepNumber}.description`)}</p>
      <div class="button-row">
        <button
          type="button"
          class="button button-secondary"
          data-action="open-onboarding-tab"
          data-tab-id={currentStep.tabId}
          onclick={() => onboardingActions.openOnboardingTab(currentStep.tabId)}
        >{locale.t(`onboarding.step${currentStepNumber}.action`)}</button>
      </div>
    </div>

    <div class="button-row onboarding-actions">
      <button
        type="button"
        class="button button-secondary"
        data-action="previous-onboarding-step"
        disabled={clampedStep === 0}
        onclick={onboardingActions.previousOnboardingStep}
      >{locale.t('onboarding.previous')}</button>
      {#if isLastStep}
        <button
          type="button"
          class="button button-success"
          data-action="complete-onboarding"
          onclick={onboardingActions.completeOnboarding}
        >{locale.t('onboarding.finish')}</button>
      {:else}
        <button
          type="button"
          class="button button-primary"
          data-action="next-onboarding-step"
          onclick={onboardingActions.nextOnboardingStep}
        >{locale.t('onboarding.next')}</button>
      {/if}
      <button
        type="button"
        class="button button-secondary"
        data-action="skip-onboarding"
        onclick={onboardingActions.skipOnboarding}
      >{locale.t('onboarding.skip')}</button>
    </div>
  </section>
{/if}
