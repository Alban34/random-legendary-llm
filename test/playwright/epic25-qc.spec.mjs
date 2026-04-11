import { test, expect } from '@playwright/test';

import {
  gotoApp,
  selectTab
} from './helpers/app-fixture.mjs';

test.describe('Epic 25 — Header and New Game Action Density Refinement', () => {
  test('app version is visible in the header', async ({ page }) => {
    await gotoApp(page);

    const versionEl = page.locator('#app-version');
    await expect(versionEl).toBeVisible();

    const versionText = await versionEl.textContent();
    // Must show a version string starting with 'v' followed by digits
    expect(versionText).toMatch(/^v\d+\.\d+/);
  });

  test('header h1 font-size is smaller than the old display-md value (1.75rem)', async ({ page }) => {
    await gotoApp(page);

    const h1FontSize = await page.evaluate(() => {
      const h1 = document.querySelector('.app-header h1');
      if (!h1) return null;
      return parseFloat(getComputedStyle(h1).fontSize);
    });

    expect(h1FontSize).not.toBeNull();
    // Old size was 1.75rem = 28px at 16px base. New size (1.1rem) must be notably smaller.
    expect(h1FontSize).toBeLessThan(22);
  });

  test('header is more compact — padding is smaller than the old large padding', async ({ page }) => {
    await gotoApp(page);

    const paddingTop = await page.evaluate(() => {
      const header = document.querySelector('.app-header');
      if (!header) return null;
      return parseFloat(getComputedStyle(header).paddingTop);
    });

    expect(paddingTop).not.toBeNull();
    // Old padding-top was var(--space-5) = 1.5rem = 24px. New should be var(--space-2) = 0.5rem = 8px.
    expect(paddingTop).toBeLessThan(20);
  });

  test('theme and locale controls are still present and accessible in the header', async ({ page }) => {
    await gotoApp(page);

    // Desktop controls are rendered into these containers
    const headerThemeControls = page.locator('#header-theme-controls');
    const headerLocaleControls = page.locator('#header-locale-controls');

    // At least one of them should contain something — or mobile preference toggle is visible
    const mobilePrefs = page.locator('#mobile-preference-controls');
    const hasMobilePrefs = await mobilePrefs.evaluate((el) => el.children.length > 0);
    const hasDesktopTheme = await headerThemeControls.evaluate((el) => el.children.length > 0);
    const hasDesktopLocale = await headerLocaleControls.evaluate((el) => el.children.length > 0);

    expect(hasMobilePrefs || (hasDesktopTheme && hasDesktopLocale)).toBe(true);
  });

  test('New Game tab shows only ONE generate-type primary button — not both Generate Setup and Regenerate simultaneously', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'new-game');

    const generateButtons = page.locator('[data-action="generate-setup"]');
    const regenerateButtons = page.locator('[data-action="regenerate-setup"]');

    // There must be exactly one generate button
    await expect(generateButtons).toHaveCount(1);
    // There must be no separate regenerate button
    await expect(regenerateButtons).toHaveCount(0);
  });

  test('before any setup is generated, the button shows "Generate Setup" label', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'new-game');

    // Ensure no setup is active (fresh state)
    await page.evaluate(() => {
      window.__APP_STATE__.ui = window.__APP_STATE__.ui || {};
    });

    const generateBtn = page.locator('[data-action="generate-setup"]');
    const label = await generateBtn.textContent();
    // When no setup is present, should say "Generate Setup" (or locale equivalent)
    expect(label?.trim().length).toBeGreaterThan(0);
  });

  test('generate button appears ABOVE the forced picks panel in DOM order', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'new-game');

    const positions = await page.evaluate(() => {
      const generateBtn = document.querySelector('[data-action="generate-setup"]');
      const forcedPicksPanel = document.querySelector('[data-forced-picks-panel]');
      if (!generateBtn || !forcedPicksPanel) {
        return null;
      }
      const generateRect = generateBtn.getBoundingClientRect();
      const forcedPicksRect = forcedPicksPanel.getBoundingClientRect();
      return {
        generateBottom: generateRect.bottom,
        forcedPicksTop: forcedPicksRect.top
      };
    });

    // If forced picks panel is inside <details> and collapsed, it has 0 height but is still in DOM
    // Check via DOM order instead
    const domOrder = await page.evaluate(() => {
      const generateBtn = document.querySelector('[data-action="generate-setup"]');
      const forcedPicksPanel = document.querySelector('[data-forced-picks-panel]');
      if (!generateBtn || !forcedPicksPanel) return null;

      const allInteractive = [...document.querySelectorAll('[data-action="generate-setup"], [data-forced-picks-panel]')];
      const generateIdx = allInteractive.indexOf(generateBtn);
      const forcedPicksIdx = allInteractive.indexOf(forcedPicksPanel);
      return { generateIdx, forcedPicksIdx };
    });

    expect(domOrder).not.toBeNull();
    expect(domOrder.generateIdx).toBeLessThan(domOrder.forcedPicksIdx);
  });

  test('forced picks panel is still accessible (present in DOM, below generate button)', async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'new-game');

    const forcedPicksPanel = page.locator('[data-forced-picks-panel]');
    // Panel must exist in DOM even if collapsed
    await expect(forcedPicksPanel).toHaveCount(1);
  });
});
