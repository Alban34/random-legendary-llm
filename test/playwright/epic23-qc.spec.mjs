import { test, expect } from '@playwright/test';

import {
  gotoApp,
  selectTab
} from './helpers/app-fixture.mjs';

test.describe('Epic 23 automated QC', () => {
  test('per-category stats panels render as <details> elements with stats-category-panel class', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'history');

    // Stats/insights section must exist
    await expect(page.locator('[data-history-insights]')).toBeVisible();

    // Each per-category panel is a <details> with the class
    const panels = page.locator('details.stats-category-panel');
    await expect(panels).toHaveCount(5); // heroes, masterminds, villainGroups, henchmanGroups, schemes
  });

  test('per-category stats panels start collapsed by default', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'history');

    // None of the <details> panels should have the open attribute by default
    const openPanels = page.locator('details.stats-category-panel[open]');
    await expect(openPanels).toHaveCount(0);
  });

  test('per-category stats panels expand when clicked', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'history');

    const firstPanel = page.locator('details.stats-category-panel').first();
    const firstSummary = firstPanel.locator('summary.stats-category-summary');

    await expect(firstPanel).not.toHaveAttribute('open', '');
    await firstSummary.click();
    await expect(firstPanel).toHaveAttribute('open', '');
  });

  test('stats-category-body is visible when panel is open', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'history');

    const firstPanel = page.locator('details.stats-category-panel').first();
    const firstSummary = firstPanel.locator('summary.stats-category-summary');
    const body = firstPanel.locator('.stats-category-body');

    await expect(body).not.toBeVisible();
    await firstSummary.click();
    await expect(body).toBeVisible();
  });

  test('panels have data-stats-category attributes for each tracked category', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'history');

    const expectedCategories = ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes'];
    for (const category of expectedCategories) {
      await expect(page.locator(`details[data-stats-category="${category}"]`)).toHaveCount(1);
    }
  });

  test('removed technical grouping notice does NOT appear in the history tab', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'history');

    await expect(page.locator('#panel-history')).not.toContainText('Presentation only');
    await expect(page.locator('#panel-history')).not.toContainText('Grouping never changes saved history');
  });

  test('storage status is NOT shown in the collection tab when storage is healthy', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'collection');

    // The "Storage: Available" happy-path status line must not be visible
    await expect(page.locator('#panel-collection')).not.toContainText('Storage: Available');
    // The healthy-state storage panel should not contain 'Available' from the storage label
    const storageAvailableText = page.locator('#panel-collection').getByText(/Storage:.*Available/);
    await expect(storageAvailableText).toHaveCount(0);
  });

  test('storage status warning IS shown in the collection tab when storage is unavailable', async ({ page }) => {
    // Block localStorage before loading the page to simulate unavailable storage
    await page.addInitScript(() => {
      const blockedStorage = {
        length: 0,
        key() { return null; },
        getItem() { return null; },
        setItem() {
          throw new Error('Storage disabled for Epic 23 QC');
        },
        removeItem() {
          throw new Error('Storage disabled for Epic 23 QC');
        }
      };

      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: blockedStorage
      });
    });

    await gotoApp(page);
    await selectTab(page, 'collection');

    await expect(page.locator('#panel-collection')).toContainText('Storage: Unavailable');
  });
});
