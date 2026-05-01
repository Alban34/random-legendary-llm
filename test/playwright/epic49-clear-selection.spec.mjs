import { test, expect } from '@playwright/test';

import {
  getRuntimeSnapshot,
  gotoApp,
  readAppState,
  seedAllOwnedState,
  selectTab
} from './helpers/app-fixture.mjs';

async function openActiveFilterPanel(page) {
  const toggleBtn = page.locator('[data-action="toggle-active-filter-panel"]');
  const isExpanded = await toggleBtn.evaluate((el) => el.getAttribute('aria-expanded') === 'true');
  if (!isExpanded) {
    await toggleBtn.click();
  }
}

test.describe('Epic 49: Clear selection unchecks all expansion checkboxes', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
    await openActiveFilterPanel(page);
  });

  test('all expansion checkboxes are checked when no filter is active', async ({ page }) => {
    await getRuntimeSnapshot(page);
    const checkboxes = page.locator('[data-active-filter-checkbox]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('clicking Clear selection unchecks every expansion checkbox', async ({ page }) => {
    expect(await page.locator('[data-active-filter-checkbox]').count()).toBeGreaterThan(2);

    await page.locator('[data-action="active-filter-clear-all"]').click();

    const checkboxes = page.locator('[data-active-filter-checkbox]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
  });

  test('Use all expansions restores all checkboxes to checked after Clear selection', async ({ page }) => {
    await page.locator('[data-action="active-filter-clear-all"]').click();

    const checkboxes = page.locator('[data-active-filter-checkbox]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }

    await page.locator('[data-action="active-filter-select-all"]').click();

    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('Clear selection sets activeSetIds to [] in persisted state', async ({ page }) => {
    await page.locator('[data-action="active-filter-clear-all"]').click();

    const state = await readAppState(page);
    expect(state.collection.activeSetIds).toEqual([]);
  });
});
