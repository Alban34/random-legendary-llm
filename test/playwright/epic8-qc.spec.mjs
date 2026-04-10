import { test, expect } from '@playwright/test';

import { gotoApp, readAppState, seedAllOwnedState, selectTab, setViewport } from './helpers/app-fixture.mjs';

async function acceptGeneratedSetup(page, playerCount = null) {
  await selectTab(page, 'new-game');
  if (playerCount !== null) {
    await page.locator(`[data-action="set-player-count"][data-player-count="${playerCount}"]`).click();
  }
  await page.locator('[data-action="generate-setup"]').click();
  await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
  const snapshot = await page.evaluate(() => ({
    mastermind: window.__CURRENT_SETUP__.mastermind.name,
    scheme: window.__CURRENT_SETUP__.scheme.name
  }));
  await page.locator('[data-action="accept-current-setup"]').click();
  return snapshot;
}

test.describe('Epic 8 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
  });

  test('renders newest-first history summaries in History and usage indicators in Backup after accepted games exist', async ({ page }) => {
    const firstGame = await acceptGeneratedSetup(page, 1);
    const secondGame = await acceptGeneratedSetup(page, 2);

    await selectTab(page, 'history');
    const historyItems = page.locator('#panel-history .history-item');
    await expect(historyItems).toHaveCount(2);
    await expect(historyItems.first()).toContainText(secondGame.mastermind);
    await expect(historyItems.first()).toContainText(secondGame.scheme);
    await expect(historyItems.nth(1)).toContainText(firstGame.mastermind);

    await selectTab(page, 'backup');
    await expect(page.locator('#panel-backup [data-usage-category="heroes"]')).toContainText('Heroes');
    await expect(page.locator('#panel-backup [data-usage-category="heroes"]')).toContainText('Never played:');
    await expect(page.locator('#panel-backup')).toContainText('Lowest-play reuse activates automatically');
  });

  test('supports expanding history entries on desktop and mobile widths with readable resolved labels', async ({ page }) => {
    await acceptGeneratedSetup(page, 1);
    await acceptGeneratedSetup(page, 3);

    await setViewport(page, 'desktop');
    await selectTab(page, 'history');
    const firstHistory = page.locator('#panel-history .history-item').first();
    await firstHistory.locator('summary').click();
    await expect(firstHistory).toContainText('Heroes:');
    await expect(firstHistory).toContainText('Villain Groups:');
    await expect(firstHistory).toContainText('Henchman Groups:');

    await setViewport(page, 'mobile');
    await selectTab(page, 'history');
    const mobileFirstHistory = page.locator('#panel-history .history-item').first();
    await mobileFirstHistory.locator('summary').click();
    await expect(mobileFirstHistory).toContainText('Scheme:');
  });

  test('resets individual usage categories without disturbing the others and updates indicators immediately', async ({ page }) => {
    await acceptGeneratedSetup(page, 2);
    await acceptGeneratedSetup(page, 2);
    await selectTab(page, 'backup');

    await page.locator('#panel-backup [data-usage-category="heroes"] [data-action="reset-usage"]').click();
    let state = await readAppState(page);
    expect(Object.keys(state.usage.heroes)).toHaveLength(0);
    expect(Object.keys(state.usage.masterminds).length).toBeGreaterThan(0);
    await expect(page.locator('#panel-backup [data-usage-category="heroes"]')).toContainText(`Never played: ${state.collection.ownedSetIds.length ? '' : ''}`);

    await page.locator('#panel-backup [data-usage-category="schemes"] [data-action="reset-usage"]').click();
    state = await readAppState(page);
    expect(Object.keys(state.usage.schemes)).toHaveLength(0);
    expect(Object.keys(state.usage.masterminds).length).toBeGreaterThan(0);
  });

  test('uses a confirmation flow for full reset and returns the app to a clean initial state on confirm', async ({ page }) => {
    await acceptGeneratedSetup(page, 1);
    await selectTab(page, 'backup');

    await page.locator('#panel-backup [data-action="request-reset-all-state"]').click();
    await expect(page.locator('#modal-root [role="dialog"]')).toBeVisible();
    await page.locator('#modal-root [data-action="cancel-reset-all-state"]').click();
    await expect(page.locator('#modal-root [role="dialog"]')).toBeHidden();
    await selectTab(page, 'history');
    await expect(page.locator('#panel-history .history-item')).toHaveCount(1);
    await selectTab(page, 'backup');

    await page.locator('#panel-backup [data-action="request-reset-all-state"]').click();
    await page.locator('#modal-root [data-action="confirm-reset-all-state"]').click();
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'browse');

    const resetState = await readAppState(page);
    expect(resetState.collection.ownedSetIds).toHaveLength(0);
    expect(resetState.history).toHaveLength(0);
    expect(Object.keys(resetState.usage.heroes)).toHaveLength(0);
    expect(resetState.preferences.selectedTab).toBeNull();
    await expect(page.locator('#panel-browse')).toBeVisible();
  });
});

