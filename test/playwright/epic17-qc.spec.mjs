import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  reloadApp,
  selectTab,
  setViewport
} from './helpers/app-fixture.mjs';

test.describe('Epic 17 automated QC', () => {
  test('shows the walkthrough on first launch, hides it after skip, and allows replay from Browse', async ({ page }) => {
    await gotoApp(page);

    await expect(page.locator('#onboarding-shell')).toBeVisible();
    await expect(page.locator('#onboarding-shell')).toContainText('Step 1 of 4');

    await page.locator('#onboarding-shell [data-action="skip-onboarding"]').click();
    await expect(page.locator('#onboarding-shell')).toBeHidden();

    let state = await readAppState(page);
    expect(state.preferences.onboardingCompleted).toBe(true);

    await reloadApp(page);
    await expect(page.locator('#onboarding-shell')).toBeHidden();

    await selectTab(page, 'browse');
    await page.locator('#panel-browse [data-action="start-onboarding"]').click();
    await expect(page.locator('#onboarding-shell')).toBeVisible();
    await expect(page.locator('#onboarding-shell')).toContainText('Step 1 of 4');
  });

  test('keeps the About surface hidden by default and exposes project details only when requested', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'browse');

    await expect(page.locator('#about-panel')).toHaveCount(0);
    await expect(page.locator('#panel-browse')).not.toContainText('Project details and developer diagnostics');

    await page.locator('#panel-browse [data-action="toggle-about-panel"]').click();

    const aboutPanel = page.locator('#about-panel');
    await expect(aboutPanel).toBeVisible();
    await expect(aboutPanel).toContainText('Project details and developer diagnostics');
    await expect(aboutPanel).toContainText('Persisted state snapshot');

    await page.locator('#about-panel [data-action="toggle-about-panel"]').click();
    await expect(aboutPanel).toHaveCount(0);
  });

  test('supports walkthrough progression on mobile and restores first-run onboarding after a full reset', async ({ page }) => {
    await gotoApp(page);
    await setViewport(page, 'mobile');
    await reloadApp(page);

    const walkthrough = page.locator('#onboarding-shell');
    await expect(walkthrough).toBeVisible();

    await walkthrough.locator('[data-action="next-onboarding-step"]').click();
    await expect(walkthrough).toContainText('Step 2 of 4');

    await walkthrough.locator('[data-action="open-onboarding-tab"]').click();
    await expect(page.locator('#panel-collection')).toBeVisible();
    await expect(walkthrough).toBeVisible();

    await selectTab(page, 'browse');
    await page.locator('#panel-browse [data-action="start-onboarding"]').click();
    await walkthrough.locator('[data-action="next-onboarding-step"]').click();
    await walkthrough.locator('[data-action="next-onboarding-step"]').click();
    await walkthrough.locator('[data-action="next-onboarding-step"]').click();
    await walkthrough.locator('[data-action="complete-onboarding"]').click();

    await expect(walkthrough).toBeHidden();

    await selectTab(page, 'history');
    await page.locator('#panel-history [data-action="request-reset-all-state"]').click();
    await page.locator('#modal-root [data-action="confirm-reset-all-state"]').click();

    await expect(page.locator('#onboarding-shell')).toBeVisible();

    const state = await readAppState(page);
    expect(state.preferences.onboardingCompleted).toBe(false);
  });
});