import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  readDocumentTheme,
  reloadApp,
  seedAllOwnedState,
  selectTab,
  selectTheme,
  setViewport
} from './helpers/app-fixture.mjs';

async function captureThemeSurfaceMetrics(page) {
  return page.evaluate(() => {
    const parseColor = (value) => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) {
        return null;
      }

      const [red, green, blue] = match[1].split(',').slice(0, 3).map((part) => Number.parseFloat(part.trim()));
      return { red, green, blue };
    };

    const toLinear = (channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    };

    const contrastRatio = (foreground, background) => {
      const foregroundLuminosity = (0.2126 * toLinear(foreground.red)) + (0.7152 * toLinear(foreground.green)) + (0.0722 * toLinear(foreground.blue));
      const backgroundLuminosity = (0.2126 * toLinear(background.red)) + (0.7152 * toLinear(background.green)) + (0.0722 * toLinear(background.blue));
      const lighter = Math.max(foregroundLuminosity, backgroundLuminosity);
      const darker = Math.min(foregroundLuminosity, backgroundLuminosity);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const bodyStyles = getComputedStyle(document.body);
    const panelStyles = getComputedStyle(document.querySelector('.panel'));
    const buttonStyles = getComputedStyle(document.querySelector('.button'));
    const themeStyles = getComputedStyle(document.documentElement);

    const bodyText = parseColor(bodyStyles.color);
    const bodyBackground = parseColor(bodyStyles.backgroundColor);
    const panelBackground = parseColor(panelStyles.backgroundColor);
    const buttonText = parseColor(buttonStyles.color);
    const buttonBackground = parseColor(buttonStyles.backgroundColor);

    return {
      colorScheme: themeStyles.colorScheme,
      bodyContrast: contrastRatio(bodyText, bodyBackground),
      panelContrast: contrastRatio(bodyText, panelBackground),
      buttonContrast: contrastRatio(buttonText, buttonBackground)
    };
  });
}

test.describe('Epic 18 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('persists the selected theme across reloads from the shared header control', async ({ page }) => {
    await expect(page.locator('#header-theme-controls')).toContainText('Theme');

    const defaultTheme = await readDocumentTheme(page);
    expect(defaultTheme.themeId).toBe('dark');
    expect(defaultTheme.colorScheme).toBe('dark');

    await selectTheme(page, 'light');
    await expect(page.locator('[data-action="set-theme"][data-theme-id="light"]')).toHaveAttribute('aria-pressed', 'true');

    const switchedTheme = await readDocumentTheme(page);
    expect(switchedTheme.themeId).toBe('light');
    expect(switchedTheme.colorScheme).toBe('light');

    const switchedState = await readAppState(page);
    expect(switchedState.preferences.themeId).toBe('light');

    await reloadApp(page);
    await expect(page.locator('[data-action="set-theme"][data-theme-id="light"]')).toHaveAttribute('aria-pressed', 'true');

    const reloadedTheme = await readDocumentTheme(page);
    expect(reloadedTheme.themeId).toBe('light');
    expect(reloadedTheme.colorScheme).toBe('light');
  });

  test('keeps primary screens legible across both supported themes on desktop and mobile', async ({ page }) => {
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
    await page.locator('[data-action="generate-setup"]').click();
    await selectTab(page, 'history');

    for (const viewport of ['desktop', 'mobile']) {
      await setViewport(page, viewport);
      await reloadApp(page);

      for (const themeId of ['dark', 'light']) {
        await selectTheme(page, themeId);
        await selectTab(page, 'browse');
        await expect(page.locator('#panel-browse .panel').first()).toBeVisible();
        await expect(page.locator('[data-action="set-theme"][data-theme-id="' + themeId + '"]')).toHaveAttribute('aria-pressed', 'true');

        const browseMetrics = await captureThemeSurfaceMetrics(page);
        expect(browseMetrics.bodyContrast).toBeGreaterThan(4.5);
        expect(browseMetrics.panelContrast).toBeGreaterThan(4.5);
        expect(browseMetrics.buttonContrast).toBeGreaterThan(3);

        await selectTab(page, 'history');
        await expect(page.locator('[data-history-insights]')).toBeVisible();
        const historyMetrics = await captureThemeSurfaceMetrics(page);
        expect(historyMetrics.bodyContrast).toBeGreaterThan(4.5);
        expect(historyMetrics.panelContrast).toBeGreaterThan(4.5);
      }
    }
  });
});
