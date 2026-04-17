/**
 * Epic 40 — PWA Installability (production-only checks)
 *
 * These tests require a production build served via `npm run preview`
 * against the GitHub Pages base URL. They are skipped automatically in
 * any non-production environment.
 *
 * To run manually: npx playwright test test/playwright/epic40-production.spec.mjs
 */
import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers/app-fixture.mjs';

test.describe('Epic 40 — PWA Installability (production-only)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
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
      // In dev mode the SW template has no precached URLs; skip the offline assertion
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
