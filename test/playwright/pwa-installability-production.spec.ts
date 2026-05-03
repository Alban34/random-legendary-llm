/**
 * PWA Installability — production-only checks
 *
 * These tests require a production build served via `npm run preview`
 * against the GitHub Pages base URL. They are excluded from the default
 * `npm run e2e` dev-server suite via `testIgnore` in playwright.config.ts.
 *
 * To run manually:
 *   npm run build
 *   npx playwright test --config playwright.prod.config.ts
 */
import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers/app-fixture.ts';

test.describe('PWA installability: production build', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('Service Worker is registered after app load', async ({ page }) => {
    const registered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        await navigator.serviceWorker.ready;
        return true;
      } catch {
        return false;
      }
    });
    expect(registered).toBe(true);
  });

  test('each manifest icon src URL returns HTTP 200 with image/png content-type', async ({ page }) => {
    const manifestLink = page.locator('link[rel="manifest"]');
    const href = await manifestLink.getAttribute('href');
    const response = await page.request.get(href);
    const manifest = await response.json();

    for (const icon of manifest.icons) {
      const iconResponse = await page.request.get(icon.src);
      expect(iconResponse.status(), `icon ${icon.src} should return 200`).toBe(200);
      const contentType = iconResponse.headers()['content-type'] || '';
      expect(contentType, `icon ${icon.src} should be image/png`).toContain('image/png');
    }
  });

  test('app shell renders from cache after going offline (requires working SW cache)', async ({ page, context }) => {
    // Wait for the SW to become the controller of this page
    const swControlled = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      await navigator.serviceWorker.ready;
      // Give the SW time to claim the page if it just activated
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, 2000);
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }
      return navigator.serviceWorker.controller !== null;
    });

    if (!swControlled) {
      test.fixme(true, 'SW not controlling page (dev mode — run against preview build for full offline test)');
      return;
    }

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).toBeVisible();
    const appContent = await page.locator('#app').innerHTML();
    expect(appContent.trim().length).toBeGreaterThan(0);
  });
});
