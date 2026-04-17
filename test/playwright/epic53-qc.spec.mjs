import { test, expect } from '@playwright/test';

import {
  gotoApp,
  seedAllOwnedState,
  selectTab
} from './helpers/app-fixture.mjs';

const INELIGIBLE_SCHEME_IDS = [
  'core-set-super-hero-civil-war',
  'marvel-studios-phase-1-super-hero-civil-war',
  'core-set-negative-zone-prison-breakout'
];

async function openForcedPicksPanel(page) {
  const details = page.locator('details:has([data-forced-picks-panel])');
  const isOpen = await details.evaluate((el) => el.open);
  if (!isOpen) {
    await details.locator('summary').click();
  }
}

test.describe('Epic 53 Story 2: Enforce standard-solo scheme ineligibility in forced-selection UI', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
    // Ensure standard solo defaults: 1 player, standard play mode
    await page.locator('[data-action="set-player-count"][data-player-count="1"]').click();
    await page.locator('[data-action="set-play-mode"][data-play-mode="standard"]').click();
    await openForcedPicksPanel(page);
  });

  test('ineligible schemes are absent from scheme select in standard solo', async ({ page }) => {
    const schemeSelect = page.locator('[data-forced-pick-select="schemeId"]');
    for (const id of INELIGIBLE_SCHEME_IDS) {
      await expect(schemeSelect.locator(`option[value="${id}"]`)).toHaveCount(0);
    }
  });

  test('ineligibility notice is visible in standard solo', async ({ page }) => {
    const notice = page.locator('[data-scheme-mode-ineligibility-notice]');
    await expect(notice).toBeVisible();
    const text = await notice.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('ineligible schemes appear in scheme select after switching to advanced solo', async ({ page }) => {
    await page.locator('[data-action="set-play-mode"][data-play-mode="advanced-solo"]').click();
    const schemeSelect = page.locator('[data-forced-pick-select="schemeId"]');
    await expect(schemeSelect.locator('option[value="core-set-negative-zone-prison-breakout"]')).toHaveCount(1);
  });

  test('notice is gone after switching to advanced solo', async ({ page }) => {
    await page.locator('[data-action="set-play-mode"][data-play-mode="advanced-solo"]').click();
    await expect(page.locator('[data-scheme-mode-ineligibility-notice]')).toHaveCount(0);
  });

  test('ineligible schemes return to absent and notice reappears after switching back to standard solo', async ({ page }) => {
    await page.locator('[data-action="set-play-mode"][data-play-mode="advanced-solo"]').click();
    await page.locator('[data-action="set-play-mode"][data-play-mode="standard"]').click();

    const schemeSelect = page.locator('[data-forced-pick-select="schemeId"]');
    await expect(schemeSelect.locator('option[value="core-set-negative-zone-prison-breakout"]')).toHaveCount(0);
    await expect(page.locator('[data-scheme-mode-ineligibility-notice]')).toBeVisible();
  });
});
