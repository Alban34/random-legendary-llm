import { test, expect } from '@playwright/test';

import { gotoApp, seedAllOwnedState, selectTab } from './helpers/app-fixture.ts';

async function acceptGeneratedSetup(page, playerCount = null) {
  await selectTab(page, 'new-game');
  if (playerCount !== null) {
    await page.locator(`[data-action="set-player-count"][data-player-count="${playerCount}"]`).click();
  }
  await page.locator('[data-action="generate-setup"]').click();
  await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
  await page.locator('[data-action="accept-current-setup"]').click();
}

test.describe('Replay from History', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await acceptGeneratedSetup(page, 1);
    await acceptGeneratedSetup(page, 2);
    // After the second accept the app switches to the history tab automatically.
    // The newest entry (2-player game) is expanded because openResultEditor sets expandedRecordId.
  });

  test('clicking replay-setup on a history entry switches to the New Game tab', async ({ page }) => {
    const newestRecordId = await page.evaluate(() => window.__APP_STATE__.history[0].id);
    const firstEntry = page.locator(`[data-history-record-id="${newestRecordId}"]`);
    await firstEntry.locator('[data-action="replay-setup"]').click();
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'new-game');
    await expect(page.locator('#panel-new-game')).toBeVisible();
  });

  test('after replay the New Game panel contains the original mastermind and scheme names', async ({ page }) => {
    const newestRecordId = await page.evaluate(() => window.__APP_STATE__.history[0].id);
    const originalMastermindId = await page.evaluate(
      () => window.__APP_STATE__.history[0].setupSnapshot.mastermindId
    );
    const originalSchemeId = await page.evaluate(
      () => window.__APP_STATE__.history[0].setupSnapshot.schemeId
    );

    const firstEntry = page.locator(`[data-history-record-id="${newestRecordId}"]`);
    await firstEntry.locator('[data-action="replay-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);

    const replayedMastermindId = await page.evaluate(
      () => window.__CURRENT_SETUP__.setupSnapshot.mastermindId
    );
    const replayedSchemeId = await page.evaluate(
      () => window.__CURRENT_SETUP__.setupSnapshot.schemeId
    );
    expect(replayedMastermindId).toBe(originalMastermindId);
    expect(replayedSchemeId).toBe(originalSchemeId);

    const mastermindName = await page.evaluate(
      () => window.__CURRENT_SETUP__.mastermind.name
    );
    const schemeName = await page.evaluate(
      () => window.__CURRENT_SETUP__.scheme.name
    );
    await expect(page.locator('#panel-new-game')).toContainText(mastermindName);
    await expect(page.locator('#panel-new-game')).toContainText(schemeName);
  });

  test('accepting a replayed setup creates a new history entry (3 total after 2 seeds + 1 replay accept)', async ({ page }) => {
    const newestRecordId = await page.evaluate(() => window.__APP_STATE__.history[0].id);
    const firstEntry = page.locator(`[data-history-record-id="${newestRecordId}"]`);
    await firstEntry.locator('[data-action="replay-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);

    await page.locator('[data-action="accept-current-setup"]').click();
    await selectTab(page, 'history');
    await expect(page.locator('#panel-history .history-item')).toHaveCount(3);
  });

  test('setupSnapshot.mastermindId of the replayed setup matches the original record ID', async ({ page }) => {
    const newestRecordId = await page.evaluate(() => window.__APP_STATE__.history[0].id);
    const originalId = await page.evaluate(
      () => window.__APP_STATE__.history[0].setupSnapshot.mastermindId
    );

    const firstEntry = page.locator(`[data-history-record-id="${newestRecordId}"]`);
    await firstEntry.locator('[data-action="replay-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);

    const replayedId = await page.evaluate(
      () => window.__CURRENT_SETUP__.setupSnapshot.mastermindId
    );
    expect(replayedId).toBe(originalId);
  });
});
