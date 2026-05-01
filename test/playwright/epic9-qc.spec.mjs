import { test, expect } from '@playwright/test';

import {
  getRuntimeSnapshot,
  gotoApp,
  reloadApp,
  seedAllOwnedState,
  selectTab,
  updateAppState
} from './helpers/app-fixture.mjs';

test.describe('Epic 9 automated QC', () => {
  test('stacks floating toast notifications, caps the stack size, supports dismissal, and auto-clears over time', async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');

    // Use programmatic DOM clicks throughout so the Playwright mouse never enters the
    // toaster area. This keeps svelte-sonner's hover-pause (expanded=false) inactive,
    // letting each toast's auto-dismiss timer run naturally from the moment it is created.
    for (let index = 0; index < 5; index += 1) {
      await page.evaluate(() => {
        document.querySelector('[data-action="clear-setup-controls"]')?.click();
      });
    }

    const toasts = page.locator('[data-sonner-toaster] [data-sonner-toast]');
    await expect(toasts).toHaveCount(4);
    await expect(toasts.first()).toBeVisible();

    // Programmatic dismiss — verifies the close button works without moving the mouse
    // into the toaster (which would pause all remaining timers via hover-expansion).
    await page.evaluate(() => {
      document.querySelector('[data-sonner-toaster] [data-close-button]')?.click();
    });
    await expect(toasts).toHaveCount(3);

    // Timers have been running since toast creation (expanded=false throughout).
    // The remaining 3 toasts auto-dismiss after their duration (4000ms) elapses.
    await expect.poll(async () => toasts.count(), { timeout: 8_000 }).toBe(0);
  });

  test('shows clear error and info notifications for invalid setup requests and least-played fallback usage', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'new-game');

    await page.locator('[data-action="generate-setup"]').click();
    await expect(page.locator('[data-sonner-toast][data-type="error"]').filter({ hasText: 'No owned sets are currently selected.' })).toHaveCount(1);
    await expect(page.locator('#panel-new-game .notice.warning')).toContainText('No owned sets are currently selected.');

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
    await expect(page.locator('[data-sonner-toast][data-type="info"]').filter({ hasText: 'Least-played fallback used for Hero selection' })).toHaveCount(0);
    await page.waitForFunction(() => Boolean(window.__CURRENT_SETUP__));
  });

  test('handles unavailable browser storage gracefully while keeping the app usable in degraded mode', async ({ page }) => {
    await page.addInitScript(() => {
      const blockedStorage = {
        getItem() {
          return null;
        },
        setItem() {
          throw new Error('Storage disabled for Epic 9 QC');
        },
        removeItem() {
          throw new Error('Storage disabled for Epic 9 QC');
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
    await expect(page.locator('#panel-collection')).toContainText('Browser storage is unavailable');

    await page.locator('#tab-desktop-history').click();
    await expect(page.locator('[data-sonner-toast][data-type="warning"]').filter({ hasText: 'Browser storage is unavailable' }).first()).toContainText('Browser storage is unavailable');
    await expect(page.locator('#panel-history')).toBeVisible();
  });

  test('supports keyboard navigation, semantic tab panels, and keyboard-operable modal confirmation flows', async ({ page }) => {
    await gotoApp(page);

    await expect(page.locator('#desktop-tabs')).toHaveAttribute('role', 'tablist');
    await expect(page.locator('#panel-browse')).toHaveAttribute('role', 'tabpanel');
    await expect(page.locator('section[aria-live="polite"][aria-relevant="additions text"]')).toBeAttached();

    await page.locator('#tab-desktop-browse').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-desktop-collection')).toHaveAttribute('aria-selected', 'true');

    await page.locator('#tab-desktop-collection').focus();
    await page.keyboard.press('End');
    await expect(page.locator('#tab-desktop-backup')).toHaveAttribute('aria-selected', 'true');

    await page.locator('#tab-desktop-backup').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#tab-desktop-history')).toHaveAttribute('aria-selected', 'true');

    await page.locator('#tab-desktop-history').press('ArrowRight');
    await expect(page.locator('#tab-desktop-backup')).toHaveAttribute('aria-selected', 'true');

    const resetButton = page.locator('#panel-backup [data-action="request-reset-all-state"]');
    await resetButton.focus();
    await page.keyboard.press('Enter');

    const dialog = page.locator('#modal-root [role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.activeElement?.dataset?.modalFocus || null)).toBe('cancel');

    await page.keyboard.press('Tab');
    await expect.poll(() => page.evaluate(() => document.activeElement?.dataset?.modalFocus || null)).toBe('confirm');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.activeElement?.dataset?.action || null)).toBe('request-reset-all-state');
  });
});

