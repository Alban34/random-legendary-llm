import { test, expect } from '@playwright/test';

import { getRuntimeSnapshot, gotoApp, selectTab } from './helpers/app-fixture.mjs';

test.describe('Epic 1 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'browse');
  });

  test('spot-checks approved set inventory and duplicate-name samples', async ({ page }) => {
    const browsePanel = page.locator('#panel-browse');

    for (const setName of ['Core Set', 'Dark City', 'Fantastic Four', 'Paint the Town Red', 'Villains']) {
      await expect(browsePanel.getByText(setName, { exact: true })).toBeVisible();
    }

    await expect(page.locator('#about-panel')).toHaveCount(0);
    await page.locator('#panel-browse [data-action="toggle-about-panel"]').click();
    const aboutPanel = page.locator('#about-panel');
    await expect(aboutPanel.getByRole('heading', { name: 'Data-quality samples' })).toBeVisible();
    await aboutPanel.locator('.about-card > summary').filter({ hasText: 'Data-quality samples' }).click();
    await expect(aboutPanel.locator('summary').filter({ hasText: 'Black Widow' })).toBeVisible();
    await expect(aboutPanel.locator('summary').filter({ hasText: 'Loki' })).toBeVisible();
    await expect(aboutPanel.locator('summary').filter({ hasText: 'Thor' })).toBeVisible();

    const duplicateCounts = await page.evaluate(() => ({
      blackWidow: window.__EPIC1.runtime.indexes.allHeroes.filter((entity) => entity.name === 'Black Widow').length,
      loki: window.__EPIC1.runtime.indexes.allMasterminds.filter((entity) => entity.name === 'Loki').length,
      thor: window.__EPIC1.runtime.indexes.allHeroes.filter((entity) => entity.name === 'Thor').length
    }));

    expect(duplicateCounts.blackWidow).toBeGreaterThan(1);
    expect(duplicateCounts.loki).toBeGreaterThan(1);
    expect(duplicateCounts.thor).toBeGreaterThan(1);
  });

  test('inspects runtime edge cases like Dr. Doom and Secret Invasion through browser diagnostics', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const drDoom = snapshot.runtime.indexes.allMasterminds.find((entity) => entity.name === 'Dr. Doom');
    const secretInvasion = snapshot.runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters');

    expect(drDoom.lead.category).toBe('henchmen');
    expect(snapshot.runtime.indexes.henchmanGroupsById[drDoom.lead.id].name).toBe('Doombot Legion');
    expect(secretInvasion.forcedGroups.length).toBeGreaterThan(0);
    expect(secretInvasion.modifiers.some((modifier) => modifier.type === 'set-min-heroes' && modifier.value === 6)).toBeTruthy();

    await selectTab(page, 'browse');
    await page.locator('#panel-browse [data-action="toggle-about-panel"]').click();
    await expect(page.locator('#about-panel')).toContainText('selectedTab');
  });

  test('surfaces initialization errors with understandable browser messaging', async ({ page }) => {
    await page.evaluate(async () => {
      const { renderInitializationError } = await import('./src/app/app-renderer.mjs');
      renderInitializationError(document, new Error('Demo initialization error for QC review.'));
    });

    await expect(page.locator('#diagnostics-shell')).toContainText('Initialization failed: Demo initialization error for QC review.');
  });
});

