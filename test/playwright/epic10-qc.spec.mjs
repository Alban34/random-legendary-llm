import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  reloadApp,
  seedAllOwnedState,
  selectTab
} from './helpers/app-fixture.mjs';

test.describe('Epic 10 automated QC', () => {
  test('supports the documented release-ready user flow from launch through persistence and reset', async ({ page }) => {
    await gotoApp(page);

    await expect(page.locator('#app-title')).toHaveText('Legendary: Marvel Randomizer');
    await expect(page.locator('#app-subtitle')).toContainText('Browse sets');
    await expect(page.locator('#desktop-tabs [role="tab"]')).toHaveCount(5);

    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
    await page.locator('[data-action="generate-setup"]').click();
    await expect(page.locator('#panel-new-game [data-result-section="mastermind"]')).toBeVisible();
    await expect(page.locator('#panel-new-game [data-result-section="scheme"]')).toBeVisible();

    await page.locator('[data-action="accept-current-setup"]').click();
    await selectTab(page, 'history');
    await expect(page.locator('#panel-history [data-history-record-id]')).toHaveCount(1);

    await reloadApp(page);
    await selectTab(page, 'history');
    await expect(page.locator('#panel-history [data-history-record-id]')).toHaveCount(1);

    await selectTab(page, 'backup');
    await page.locator('#panel-backup [data-action="request-reset-all-state"]').click();
    await expect(page.locator('#modal-root [role="dialog"]')).toBeVisible();
    await page.locator('#modal-root [data-action="cancel-reset-all-state"]').click();
    await expect(page.locator('#modal-root [role="dialog"]')).toBeHidden();

    await selectTab(page, 'history');
    await expect(page.locator('#panel-history [data-history-record-id]')).toHaveCount(1);

    await selectTab(page, 'backup');
    await page.locator('#panel-backup [data-action="request-reset-all-state"]').click();
    await page.locator('#modal-root [data-action="confirm-reset-all-state"]').click();

    await selectTab(page, 'history');
    await expect(page.locator('#panel-history')).toContainText('No accepted games have been logged yet.');

    const state = await readAppState(page);
    expect(state.collection.ownedSetIds).toEqual([]);
    expect(state.history).toEqual([]);
    expect(state.preferences.lastPlayerCount).toBe(1);
    expect(state.preferences.lastAdvancedSolo).toBe(false);
  });
});

