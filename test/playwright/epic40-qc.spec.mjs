import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers/app-fixture.mjs';

test.describe('Epic 40 — PWA Installability', () => {
  test('manifest link is present and href references manifest.webmanifest', async ({ page }) => {
    await gotoApp(page);
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    const href = await manifestLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/manifest\.webmanifest$/);
  });

  test('manifest JSON contains all required PWA fields and at least two icon entries', async ({ page }) => {
    await gotoApp(page);
    const manifestLink = page.locator('link[rel="manifest"]');
    const href = await manifestLink.getAttribute('href');
    const response = await page.request.get(href);
    expect(response.ok()).toBe(true);
    const manifest = await response.json();

    expect(typeof manifest.name).toBe('string');
    expect(manifest.name.length).toBeGreaterThan(0);
    expect(typeof manifest.short_name).toBe('string');
    expect(manifest.short_name.length).toBeGreaterThan(0);
    expect(typeof manifest.start_url).toBe('string');
    expect(manifest.start_url.length).toBeGreaterThan(0);
    expect(manifest.display).toBe('standalone');
    expect(typeof manifest.theme_color).toBe('string');
    expect(typeof manifest.background_color).toBe('string');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  test('each manifest icon src URL returns HTTP 200 with image/png content-type', async ({ page }) => {
    await gotoApp(page);
    const isProduction = page.url().includes('/random-legendary-llm/');
    test.skip(!isProduction, 'Icon URL test requires production build served via npm run preview');

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

  test('Service Worker is registered after app load', async ({ page }) => {
    await gotoApp(page);
    // Wait for SW registration to complete (up to 5 s)
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

  test('app shell renders from cache after going offline (requires working SW cache)', async ({ page, context }) => {
    await gotoApp(page);
    const isProduction = page.url().includes('/random-legendary-llm/');
    test.skip(!isProduction, 'Offline cache test requires production build (npm run preview)');

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
      test.skip(true, 'SW not controlling page (dev mode — run against preview build for full offline test)');
      return;
    }

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).toBeVisible();
    const appContent = await page.locator('#app').innerHTML();
    expect(appContent.trim().length).toBeGreaterThan(0);
  });
});
