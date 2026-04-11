import { test, expect } from '@playwright/test';

import {
  gotoApp,
  selectTab
} from './helpers/app-fixture.mjs';

test.describe('Epic 22 automated QC', () => {
  test('Browse filter "Base Game" shows both Core Set and Villains', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'browse');

    // Click the Base Game filter button by its data attribute (resilient to label changes)
    await page.locator('[data-type-filter="base"]').click();

    const setNames = await page.locator('[data-browse-sets-panel] [data-set-id]').evaluateAll(
      (els) => els.map((el) => el.getAttribute('data-set-id'))
    );

    // Both Core Set and Villains must appear under the base type filter
    expect(setNames.some((id) => id && id.toLowerCase().includes('core'))).toBe(true);
    expect(setNames.some((id) => id && id.toLowerCase().includes('villain'))).toBe(true);
  });

  test('Browse set list is sorted alphabetically', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'browse');

    // Use the "All" filter (default) to get the full sorted list
    await page.locator('[data-type-filter="all"]').click();

    // Collect set names from data-set-name attributes in DOM order
    const setNames = await page.locator('[data-browse-sets-panel] article[data-set-id]').evaluateAll(
      (els) => els.map((el) => el.getAttribute('data-set-name'))
    );

    if (setNames.length >= 2) {
      for (let i = 0; i < setNames.length - 1; i++) {
        const cmp = setNames[i].localeCompare(setNames[i + 1]);
        // Each set name must sort before or equal to the next (ascending)
        expect(cmp).toBeLessThanOrEqual(0);
      }
    }
  });

  test('Browse filter label for base type reads "Base Game"', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'browse');

    const baseFilterButton = page.locator('[data-type-filter="base"]');
    await expect(baseFilterButton).toContainText('Base Game');
  });

  test('Collection tab shows Villains in the base game group', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'collection');

    // Locate the collection group that contains base sets
    const baseGroup = page.locator('[data-collection-group="base"]');
    if (await baseGroup.count() > 0) {
      await expect(baseGroup).toContainText('Villains');
      await expect(baseGroup).toContainText('Core Set');
    } else {
      // Fallback: check that Villains appears in the page without being in a standalone group
      const standaloneGroup = page.locator('[data-collection-group="standalone"]');
      if (await standaloneGroup.count() > 0) {
        await expect(standaloneGroup).not.toContainText('Villains');
      }
      await expect(page.locator('#panel-collection')).toContainText('Villains');
    }
  });

  test('Collection sets are alphabetically ordered within their group', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'collection');

    // Within the base group, Core Set (C) should appear before Villains (V)
    const panel = page.locator('#panel-collection');
    const corePos = await panel.evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      let pos = 0;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() === 'Core Set') return pos;
        pos++;
      }
      return -1;
    });
    const villainsPos = await panel.evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      let pos = 0;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() === 'Villains') return pos;
        pos++;
      }
      return -1;
    });

    if (corePos !== -1 && villainsPos !== -1) {
      // Core Set (C) must appear before Villains (V) in document order
      expect(corePos).toBeLessThan(villainsPos);
    }
  });
});
