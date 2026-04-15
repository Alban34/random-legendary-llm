import { test, expect } from '@playwright/test';

import { gotoApp, readAppState, reloadApp, selectTab, setViewport, updateAppState } from './helpers/app-fixture.mjs';

async function readMobileAnchorMetrics(page, selector) {
  return page.evaluate((query) => {
    const element = document.querySelector(query);
    const nav = document.querySelector('#mobile-tabs');
    if (!element || !nav) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
      navTop: navRect.top
    };
  }, selector);
}

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
    await expect(page.locator('#header-locale-select')).toBeVisible();

    await setViewport(page, 'mobile');
    await reloadApp(page);
    await expect(page.locator('#desktop-tabs')).toBeHidden();
    await expect(page.locator('#mobile-tabs')).toBeVisible();
    await expect(page.locator('#panel-browse')).toBeVisible();
    await expect(page.locator('.header-icon-strip')).toBeVisible();

    const mobileShellMetrics = await page.evaluate(() => {
      const nav = document.querySelector('#mobile-tabs');
      const navButtons = [...document.querySelectorAll('#mobile-tabs .tab-button.mobile')];
      const header = document.querySelector('.app-header');
      return {
        navHeight: nav?.getBoundingClientRect().height ?? 0,
        wrappedRows: new Set(navButtons.map((button) => Math.round(button.getBoundingClientRect().top))).size,
        headerHeight: header?.getBoundingClientRect().height ?? 0
      };
    });

    expect(mobileShellMetrics.wrappedRows).toBe(1);
    expect(mobileShellMetrics.navHeight).toBeLessThan(96);
    expect(mobileShellMetrics.headerHeight).toBeLessThan(160);
  });

  test('trims repeated mobile copy after onboarding while keeping first-use cues and earlier task visibility across major tabs', async ({ page }) => {
    await setViewport(page, 'mobile');
    await reloadApp(page);

    await expect(page.locator('.browse-hero-description')).toBeVisible();
    await page.locator('#panel-browse [data-browse-help-disclosure] summary').click();
    await expect(page.locator('#panel-browse .browse-help-description')).toBeVisible();

    const firstRunBrowseToolbarMetrics = await readMobileAnchorMetrics(page, '[data-mobile-task-anchor="browse"]');
    const firstRunBrowseCtaMetrics = await readMobileAnchorMetrics(page, '[data-browse-primary-cta]');
    expect(firstRunBrowseToolbarMetrics).not.toBeNull();
    expect(firstRunBrowseCtaMetrics).not.toBeNull();

    await updateAppState(page, (state) => ({
      ...state,
      preferences: {
        ...state.preferences,
        onboardingCompleted: true,
        selectedTab: 'browse'
      }
    }));
    await reloadApp(page);

    await expect(page.locator('.browse-hero-description')).toHaveCount(0);
    await expect(page.locator('.browse-help-description')).toHaveCount(0);
    await expect(page.locator('.browse-panel-description')).toHaveCount(0);

    const browseToolbarMetrics = await readMobileAnchorMetrics(page, '[data-mobile-task-anchor="browse"]');
    const browseCtaMetrics = await readMobileAnchorMetrics(page, '[data-browse-primary-cta]');
    expect(browseToolbarMetrics).not.toBeNull();
    expect(browseCtaMetrics).not.toBeNull();
    expect(browseToolbarMetrics.top).toBeLessThan(firstRunBrowseToolbarMetrics.top);
    expect(browseCtaMetrics.top).toBeLessThan(browseCtaMetrics.navTop);

    await selectTab(page, 'new-game');
    await expect(page.locator('.new-game-mode-help')).toBeVisible();
    await expect(page.locator('.new-game-ephemeral-notice')).toHaveCount(0);

    const newGameMetrics = await readMobileAnchorMetrics(page, '[data-mobile-task-anchor="new-game"]');
    expect(newGameMetrics).not.toBeNull();
    expect(newGameMetrics.top).toBeLessThan(newGameMetrics.viewportHeight * 0.4);
    expect(newGameMetrics.top).toBeLessThan(newGameMetrics.navTop);

    await selectTab(page, 'history');
    await expect(page.locator('.history-panel-description')).toHaveCount(0);

    const historyMetrics = await readMobileAnchorMetrics(page, '[data-history-grouping-controls]');
    expect(historyMetrics).not.toBeNull();
    expect(historyMetrics.top).toBeLessThan(historyMetrics.viewportHeight * 0.4);
    expect(historyMetrics.top).toBeLessThan(historyMetrics.navTop);

    await selectTab(page, 'backup');
    await expect(page.locator('.backup-panel-description')).toHaveCount(0);
    await expect(page.locator('.backup-usage-description')).toHaveCount(0);
    await expect(page.locator('.backup-reuse-notice')).toHaveCount(0);

    const backupMetrics = await readMobileAnchorMetrics(page, '[data-mobile-task-anchor="backup"]');
    expect(backupMetrics).not.toBeNull();
    expect(backupMetrics.top).toBeLessThan(backupMetrics.viewportHeight * 0.4);
    expect(backupMetrics.top).toBeLessThan(backupMetrics.navTop);
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

    expect(shellStyles.accent).toBe('#f05a28');
    expect(shellStyles.bg).toBe('#11131a');
    expect(shellStyles.headerPosition).toBe('sticky');
    expect(shellStyles.activeTabBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(shellStyles.buttonRadius).toBe('999px');
    expect(shellStyles.panelRadius).toBe('16px');

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
    await expect(page.locator('[data-action="set-theme"][data-theme-id="dark"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-action="set-theme"][data-theme-id="light"]')).toBeFocused();

    // step over the GitHub link in the header icon strip
    await page.keyboard.press('Tab');
    await expect(page.locator('.github-link')).toBeFocused();

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

