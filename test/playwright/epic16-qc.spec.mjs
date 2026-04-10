import { test, expect } from '@playwright/test';

import {
  gotoApp,
  seedAllOwnedState,
  selectTab,
  updateAppState,
  reloadApp,
  getRuntimeSnapshot
} from './helpers/app-fixture.mjs';

test.describe('Epic 16 automated QC', () => {
  test('suppresses redundant generator toasts while keeping inline fallback messaging visible', async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    const runtime = await getRuntimeSnapshot(page);

    await updateAppState(page, (state) => {
      const simpleScheme = runtime.runtime.indexes.allSchemes.find((entity) => {
        return !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints?.minimumPlayerCount;
      });
      const simpleMastermind = runtime.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
      const keepHeroIds = new Set(runtime.runtime.indexes.allHeroes.slice(0, 2).map((hero) => hero.id));

      runtime.runtime.indexes.allSchemes.forEach((entity, index) => {
        if (entity.id !== simpleScheme.id) {
          state.usage.schemes[entity.id] = {
            plays: index < 8 ? 1 : 2,
            lastPlayedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}T12:00:00.000Z`
          };
        }
      });

      runtime.runtime.indexes.allMasterminds.forEach((entity, index) => {
        if (entity.id !== simpleMastermind.id) {
          state.usage.masterminds[entity.id] = {
            plays: index < 8 ? 1 : 2,
            lastPlayedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}T12:00:00.000Z`
          };
        }
      });

      runtime.runtime.indexes.allHeroes.forEach((hero, index) => {
        if (!keepHeroIds.has(hero.id)) {
          state.usage.heroes[hero.id] = {
            plays: index < 8 ? 1 : 2,
            lastPlayedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}T12:00:00.000Z`
          };
        }
      });

      return state;
    });

    await reloadApp(page);
    await page.evaluate(() => {
      Math.random = () => 0;
    });

    await selectTab(page, 'new-game');
    await page.locator('[data-action="generate-setup"]').click();

    await expect(page.locator('#panel-new-game')).toContainText('Least-played fallback used for Hero selection');
    await expect(page.locator('#toast-region .toast').filter({ hasText: 'Least-played fallback used for Hero selection' })).toHaveCount(0);
  });

  test('keeps critical setup errors visible until acknowledged while transient notices still auto-dismiss', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'new-game');

    await page.locator('[data-action="clear-setup-controls"]').click();
    await expect(page.locator('#toast-region .toast-info')).toHaveCount(1);

    await page.locator('[data-action="generate-setup"]').click();

    const criticalToast = page.locator('#toast-region .toast-error').filter({ hasText: 'No owned sets are currently selected.' }).first();
    await expect(criticalToast).toBeVisible();
    await expect(criticalToast).toContainText('Persistent alert');

    await expect.poll(async () => page.locator('#toast-region .toast-info').count(), { timeout: 6_000 }).toBe(0);
    await expect(criticalToast).toBeVisible();

    await criticalToast.locator('[data-action="dismiss-toast"]').click();
    await expect(criticalToast).toHaveCount(0);
  });

  test('pauses transient toast auto-dismiss while the user is interacting with it', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'new-game');

    await page.locator('[data-action="clear-setup-controls"]').click();

    const transientToast = page.locator('#toast-region .toast-info').filter({ hasText: 'Reset the current setup controls to their default values.' }).first();
    await expect(transientToast).toBeVisible();

    await transientToast.hover();
    await page.waitForTimeout(4500);
    await expect(transientToast).toBeVisible();

    await page.locator('#app-title').hover();
    await expect.poll(async () => transientToast.count(), { timeout: 6000 }).toBe(0);
  });

  test('keeps keyboard focus inside the toast stack after manual dismissal', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'new-game');

    await page.locator('[data-action="clear-setup-controls"]').click();
    await page.locator('[data-action="clear-setup-controls"]').click();

    const dismissButtons = page.locator('#toast-region [data-action="dismiss-toast"]');
    await expect(dismissButtons).toHaveCount(2);

    await dismissButtons.first().focus();
    await page.keyboard.press('Enter');

    await expect(dismissButtons).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => document.activeElement?.dataset?.toastId || null)).toBe('toast-2');
  });
});