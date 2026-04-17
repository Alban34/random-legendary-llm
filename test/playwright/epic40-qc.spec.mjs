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

});
