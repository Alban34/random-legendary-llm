import { test, expect } from '@playwright/test';

import {
  gotoApp,
  selectLocale,
  selectTheme
} from './helpers/app-fixture.mjs';

test.describe('Epic 24 — Toast Behavior and Feedback Channel Cleanup', () => {
  test('switching the theme produces no toast notification', async ({ page }) => {
    await gotoApp(page);

    // Switch to a different theme
    await selectTheme(page, 'light');

    // Toast region may exist in the DOM but no toast item should appear
    const toastRegion = page.locator('#toast-region');
    // Either the region is absent (no toasts) or it contains no .toast elements
    const toastCount = await page.locator('#toast-region .toast').count();
    expect(toastCount).toBe(0);
  });

  test('switching the theme still applies the new theme visually', async ({ page }) => {
    await gotoApp(page);

    await selectTheme(page, 'light');

    const themeAttr = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(themeAttr).toBe('light');
  });

  test('toasts from locale switches appear at the bottom of the viewport', async ({ page }) => {
    await gotoApp(page);

    // Locale switch still emits a toast
    await selectLocale(page, 'fr-FR');

    const toast = page.locator('#toast-region .toast').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Confirm the toast is positioned in the lower half of the viewport
    const { toastBottom, viewportHeight } = await page.evaluate(() => {
      const el = document.querySelector('#toast-region .toast');
      if (!el) {
        return { toastBottom: 0, viewportHeight: window.innerHeight };
      }
      const rect = el.getBoundingClientRect();
      return {
        toastBottom: rect.bottom,
        viewportHeight: window.innerHeight
      };
    });

    // The toast should be in the lower half of the viewport
    expect(toastBottom).toBeGreaterThan(viewportHeight / 2);
  });

  test('#toast-region is positioned at the bottom of the viewport', async ({ page }) => {
    await gotoApp(page);

    // Force a toast so the region is rendered in the DOM
    await selectLocale(page, 'fr-FR');
    await expect(page.locator('#toast-region .toast').first()).toBeVisible({ timeout: 5000 });

    const regionStyles = await page.evaluate(() => {
      const el = document.querySelector('#toast-region');
      if (!el) {
        return null;
      }
      const styles = getComputedStyle(el);
      return {
        position: styles.position,
        bottom: styles.bottom
      };
    });

    expect(regionStyles).not.toBeNull();
    expect(regionStyles.position).toBe('fixed');
    // bottom should be set (non-auto) — the computed value will be a pixel value
    expect(regionStyles.bottom).not.toBe('auto');
  });
});
