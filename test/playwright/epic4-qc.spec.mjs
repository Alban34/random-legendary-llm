import { test, expect } from '@playwright/test';

import { gotoApp, readAppState, reloadApp, selectTab, setViewport } from './helpers/app-fixture.mjs';

test.describe('Epic 4 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('renders the shell correctly at desktop and mobile widths', async ({ page }) => {
    await setViewport(page, 'desktop');
    await reloadApp(page);
    await expect(page.locator('#desktop-tabs')).toBeVisible();
    await expect(page.locator('#mobile-tabs')).toBeHidden();
    await expect(page.locator('#panel-browse')).toBeVisible();

    await setViewport(page, 'mobile');
    await reloadApp(page);
    await expect(page.locator('#desktop-tabs')).toBeHidden();
    await expect(page.locator('#mobile-tabs')).toBeVisible();
    await expect(page.locator('#panel-browse')).toBeVisible();
  });

  test('supports keyboard-only tab navigation and persists the selected tab across reloads', async ({ page }) => {
    await setViewport(page, 'desktop');
    await reloadApp(page);

    const browseTab = page.locator('#tab-desktop-browse');
    await browseTab.focus();
    await browseTab.press('ArrowRight');
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'collection');
    await expect(page.locator('#tab-desktop-collection')).toHaveAttribute('aria-selected', 'true');

    await page.locator('#tab-desktop-collection').press('End');
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'backup');
    await expect(page.locator('#tab-desktop-backup')).toHaveAttribute('aria-selected', 'true');

    await reloadApp(page);
    await expect(page.locator('#tab-desktop-backup')).toHaveAttribute('aria-selected', 'true');

    const state = await readAppState(page);
    expect(state.preferences.selectedTab).toBe('backup');
  });

  test('applies the dark visual design system and reuses primitives across multiple screens', async ({ page }) => {
    const shellStyles = await page.evaluate(() => {
      const rootStyles = getComputedStyle(document.documentElement);
      const headerStyles = getComputedStyle(document.querySelector('.app-header'));
      const activeTabStyles = getComputedStyle(document.querySelector('.tab-button.active'));
      const buttonStyles = getComputedStyle(document.querySelector('.button'));
      const panelStyles = getComputedStyle(document.querySelector('.panel'));
      return {
        accent: rootStyles.getPropertyValue('--accent').trim(),
        bg: rootStyles.getPropertyValue('--bg').trim(),
        headerPosition: headerStyles.position,
        activeTabBackground: activeTabStyles.backgroundColor,
        buttonRadius: buttonStyles.borderRadius,
        panelRadius: panelStyles.borderRadius
      };
    });

    expect(shellStyles.accent).toBe('#e62429');
    expect(shellStyles.bg).toBe('#0d0d0d');
    expect(shellStyles.headerPosition).toBe('sticky');
    expect(shellStyles.activeTabBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(shellStyles.buttonRadius).toBe('999px');
    expect(shellStyles.panelRadius).toBe('14px');

    await selectTab(page, 'browse');
    await expect(page.locator('#panel-browse .panel').first()).toBeVisible();
    await expect(page.locator('#panel-browse .button').first()).toBeVisible();

    await selectTab(page, 'new-game');
    await expect(page.locator('#panel-new-game .result-card, #panel-new-game .panel').first()).toBeVisible();
    await expect(page.locator('#panel-new-game .button').first()).toBeVisible();

    await page.locator('#panel-new-game [data-action="generate-setup"]').click();
    await selectTab(page, 'history');
    await expect(page.locator('#panel-history .panel').first()).toBeVisible();
    await expect(page.locator('#panel-history .panel h2').first()).toContainText('Game history');

    await selectTab(page, 'backup');
    await expect(page.locator('#panel-backup .panel').first()).toBeVisible();
    await expect(page.locator('#panel-backup .button').first()).toBeVisible();
  });

  test('can traverse the full shell without a mouse and shows visible focus treatment', async ({ page }) => {
    await setViewport(page, 'desktop');
    await reloadApp(page);

    await page.keyboard.press('Tab');
    await expect(page.locator('#header-locale-select')).toBeFocused();

    const focusOutline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    expect(focusOutline).toBe('solid');

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-action="set-theme"][data-theme-id="midnight"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-action="set-theme"][data-theme-id="newsprint"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#tab-desktop-browse')).toBeFocused();

    await page.locator('#tab-desktop-browse').press('ArrowRight');
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'collection');
    await page.locator('#tab-desktop-collection').press('ArrowRight');
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'new-game');
    await page.locator('#tab-desktop-new-game').press('ArrowRight');
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'history');
    await expect(page.locator('#panel-history')).toBeVisible();

    await page.locator('#tab-desktop-history').press('ArrowRight');
    await page.waitForFunction(() => window.__ACTIVE_TAB__ === 'backup');
    await expect(page.locator('#panel-backup')).toBeVisible();
  });
});

