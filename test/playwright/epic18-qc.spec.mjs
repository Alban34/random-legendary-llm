import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  readDocumentTheme,
  reloadApp,
  seedAllOwnedState,
  selectLocale,
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

    const surfaces = [
      ['browse', '#panel-browse [data-browse-sets-panel]'],
      ['collection', '#panel-collection .collection-group'],
      ['new-game', '#panel-new-game #setup-requirements-card'],
      ['history', '#panel-history [data-history-insights]'],
      ['backup', '#panel-backup [data-backup-panel]']
    ];

    for (const viewport of ['desktop', 'mobile']) {
      await setViewport(page, viewport);
      await reloadApp(page);

      for (const themeId of ['dark', 'light']) {
        await selectTheme(page, themeId);
        await expect(page.locator('[data-action="set-theme"][data-theme-id="' + themeId + '"]')).toHaveAttribute('aria-pressed', 'true');

        for (const [tabId, selector] of surfaces) {
          await selectTab(page, tabId);
          await expect(page.locator(selector).first()).toBeVisible();

          const metrics = await captureThemeSurfaceMetrics(page);
          expect(metrics.bodyContrast).toBeGreaterThan(4.5);
          expect(metrics.panelContrast).toBeGreaterThan(4.5);
          expect(metrics.buttonContrast).toBeGreaterThan(3);
        }
      }
    }
  });

  test('restores focus predictably after theme, locale, and tab changes', async ({ page }) => {
    await page.locator('[data-action="set-theme"][data-theme-id="light"]').focus();
    await selectTheme(page, 'light');
    await expect(page.locator('[data-action="set-theme"][data-theme-id="light"]')).toBeFocused();

    await page.locator('#header-locale-select').focus();
    await selectLocale(page, 'fr-FR');
    await expect(page.locator('#header-locale-select')).toBeFocused();

    await page.locator('#tab-desktop-browse').focus();
    await page.locator('#tab-desktop-browse').press('ArrowRight');
    await expect(page.locator('#tab-desktop-collection')).toBeFocused();
    await expect(page.locator('#tab-desktop-collection')).toHaveAttribute('aria-selected', 'true');
  });

  test('supports reduced motion and enlarged text without hiding core actions', async ({ page }) => {
    await seedAllOwnedState(page);
    await setViewport(page, 'mobile');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await reloadApp(page);

    const skipOnboardingButton = page.locator('[data-action="skip-onboarding"]');
    if (await skipOnboardingButton.isVisible()) {
      await skipOnboardingButton.click();
    }

    await selectTab(page, 'new-game');

    const reducedMotionStyles = await page.evaluate(() => {
      const button = document.querySelector('[data-action="generate-setup"]');
      return getComputedStyle(button).transitionDuration;
    });
    expect(reducedMotionStyles === '0.01ms' || reducedMotionStyles === '1e-05s').toBe(true);

    await page.hover('[data-action="generate-setup"]');
    const hoveredTransform = await page.evaluate(() => getComputedStyle(document.querySelector('[data-action="generate-setup"]')).transform);
    expect(hoveredTransform).toBe('none');

    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });

    await expect(page.locator('[data-action="generate-setup"]')).toBeVisible();
    await expect(page.locator('[data-action="accept-current-setup"]')).toBeVisible();

    await page.locator('[data-action="generate-setup"]').click();
    await expect(page.locator('#panel-new-game [data-result-section="mastermind"]')).toBeVisible();
  });
});
