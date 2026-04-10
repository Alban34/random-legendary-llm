import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  reloadApp,
  seedAllOwnedState,
  selectTab,
  STORAGE_KEY
} from './helpers/app-fixture.mjs';

async function toggleOwnedSet(page, setName) {
  const card = page.locator(`#panel-browse .set-card[data-set-name="${setName}"]`);
  await card.locator('[data-action="toggle-owned-set"]').click();
}

test.describe('Epic 2 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('writes browser storage after collection changes and keeps owned sets consistent across reloads', async ({ page }) => {
    await selectTab(page, 'browse');

    for (const setName of ['Core Set', 'Dark City', 'Fantastic Four']) {
      await toggleOwnedSet(page, setName);
    }

    const stateAfterToggle = await readAppState(page);
    expect(stateAfterToggle.collection.ownedSetIds).toHaveLength(3);
    expect(stateAfterToggle.collection.ownedSetIds.join(' ')).toContain('core-set');
    expect(stateAfterToggle.collection.ownedSetIds.join(' ')).toContain('dark-city');

    await reloadApp(page);
    await selectTab(page, 'browse');

    for (const setName of ['Core Set', 'Dark City', 'Fantastic Four']) {
      const card = page.locator(`#panel-browse .set-card[data-set-name="${setName}"]`);
      await expect(card.locator('[data-action="toggle-owned-set"]')).toContainText('In Collection');
    }

    await selectTab(page, 'collection');
    await expect(page.locator('#panel-collection')).toContainText('Hydrated from storage');
    await expect(page.locator('#panel-collection')).toContainText('Owned sets');
    await expect(page.locator('#panel-collection')).toContainText('3');
  });

  test('accepts multiple setups, persists usage stats, and renders matching history entries newest first', async ({ page }) => {
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');

    await page.locator('#panel-new-game [data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    const firstSetup = await page.evaluate(() => ({
      mastermind: window.__CURRENT_SETUP__.mastermind.name,
      scheme: window.__CURRENT_SETUP__.scheme.name,
      heroCount: window.__CURRENT_SETUP__.heroes.length
    }));
    await page.locator('#panel-new-game [data-action="accept-current-setup"]').click();

    await selectTab(page, 'new-game');
    await page.locator('#panel-new-game [data-action="set-player-count"][data-player-count="2"]').click();
    await page.locator('#panel-new-game [data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    const secondSetup = await page.evaluate(() => ({
      mastermind: window.__CURRENT_SETUP__.mastermind.name,
      scheme: window.__CURRENT_SETUP__.scheme.name,
      heroCount: window.__CURRENT_SETUP__.heroes.length
    }));
    await page.locator('#panel-new-game [data-action="accept-current-setup"]').click();

    const state = await readAppState(page);
    expect(state.history).toHaveLength(2);
    expect(new Date(state.history[0].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(state.history[1].createdAt).getTime());
    expect(Object.keys(state.usage.heroes).length).toBeGreaterThanOrEqual(firstSetup.heroCount);

    await selectTab(page, 'history');
    const historyPanel = page.locator('#panel-history');
    await expect(historyPanel).toContainText(secondSetup.mastermind);
    await expect(historyPanel).toContainText(secondSetup.scheme);
    await expect(historyPanel).toContainText(firstSetup.mastermind);
    await expect(historyPanel).toContainText(firstSetup.scheme);

    const firstHistorySummary = historyPanel.locator('.history-item').first();
    await expect(firstHistorySummary).toContainText(secondSetup.mastermind);
  });

  test('per-category resets and full reset update visible state without leaving stale data behind', async ({ page }) => {
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
    await page.locator('#panel-new-game [data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    await page.locator('#panel-new-game [data-action="accept-current-setup"]').click();

    await selectTab(page, 'history');

    for (const [label, category] of [
      ['Heroes', 'heroes'],
      ['Masterminds', 'masterminds'],
      ['Villain Groups', 'villainGroups'],
      ['Henchman Groups', 'henchmanGroups'],
      ['Schemes', 'schemes']
    ]) {
      await page.locator(`#panel-history [data-action="reset-usage"][data-category="${category}"]`).click();
      const state = await readAppState(page);
      expect(Object.keys(state.usage[category])).toHaveLength(0);
      await expect(page.locator('#panel-history')).toContainText(label);
    }

    await page.locator('#panel-history [data-action="request-reset-all-state"]').click();
    await page.locator('#modal-root [data-action="confirm-reset-all-state"]').click();
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'browse');
    const resetState = await readAppState(page);
    expect(resetState.collection.ownedSetIds).toHaveLength(0);
    expect(resetState.history).toHaveLength(0);
    await expect(page.locator('#panel-browse')).toContainText('Owned Sets');
  });

  test('reload recovery notices are visible and understandable for corrupted or invalid saved state', async ({ page }) => {
    await seedAllOwnedState(page);
    await selectTab(page, 'history');

    await page.evaluate((storageKey) => {
      localStorage.setItem(storageKey, '{ this-is-not-valid-json');
    }, STORAGE_KEY);
    await reloadApp(page);
    await selectTab(page, 'collection');
    await expect(page.locator('#panel-collection')).toContainText('Recovered browser state because the saved JSON was corrupted.');

    const validState = await readAppState(page);
    validState.collection.ownedSetIds.push('definitely-missing-set');
    await page.evaluate(([storageKey, nextState]) => {
      localStorage.setItem(storageKey, JSON.stringify(nextState, null, 2));
    }, [STORAGE_KEY, validState]);
    await reloadApp(page);
    await selectTab(page, 'collection');
    await expect(page.locator('#panel-collection')).toContainText('Removed invalid stored set IDs during state hydration.');
  });
});

