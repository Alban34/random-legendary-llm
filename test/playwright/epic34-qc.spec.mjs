import { test, expect } from '@playwright/test';

import {
  gotoApp,
  seedAllOwnedState,
  selectLocale,
  selectTab
} from './helpers/app-fixture.mjs';

const EXPECTED_MODES = [
  { id: 'mastermind', labelEn: 'Mastermind', labelFr: 'Mastermind' },
  { id: 'scheme', labelEn: 'Scheme', labelFr: 'Scénario' },
  { id: 'heroes', labelEn: 'Heroes', labelFr: 'Héros' },
  { id: 'villains', labelEn: 'Villains', labelFr: 'Vilains' },
  { id: 'play-mode', labelEn: 'Player Mode', labelFr: 'Mode joueur' }
];

async function acceptSetup(page) {
  await selectTab(page, 'new-game');
  await page.locator('[data-action="set-player-count"][data-player-count="1"]').click();
  await page.locator('[data-action="generate-setup"]').click();
  await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
  await page.locator('[data-action="accept-current-setup"]').click();
}

test.describe('Epic 34 automated QC — History Grouping Expansion', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
  });

  // Story 34.3 — Grouping UI controls expose exactly five modes

  test('History tab renders exactly five grouping mode buttons and no others', async ({ page }) => {
    await acceptSetup(page);
    await page.locator('[data-action="skip-game-result"]').click();
    await selectTab(page, 'history');

    const buttons = page.locator('[data-history-grouping-controls] [data-action="set-history-grouping"]');
    await expect(buttons).toHaveCount(5);

    for (const mode of EXPECTED_MODES) {
      await expect(
        page.locator(`[data-action="set-history-grouping"][data-history-grouping-mode="${mode.id}"]`)
      ).toBeVisible();
    }

    // Removed modes must not exist
    await expect(
      page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="player-count"]')
    ).toHaveCount(0);
    await expect(
      page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="none"]')
    ).toHaveCount(0);
  });

  test('selecting each grouping mode renders grouped history with visible group headers', async ({ page }) => {
    await acceptSetup(page);
    await page.locator('[data-action="skip-game-result"]').click();
    await selectTab(page, 'history');

    for (const mode of EXPECTED_MODES) {
      await page.locator(`[data-action="set-history-grouping"][data-history-grouping-mode="${mode.id}"]`).click();
      await expect(
        page.locator(`[data-action="set-history-grouping"][data-history-grouping-mode="${mode.id}"]`)
      ).toHaveAttribute('aria-pressed', 'true');
      // Each mode must render at least one <details> group header
      await expect(page.locator('[data-history-group-id]').first()).toBeVisible();
    }
  });

  test('mastermind is active by default and no flat ungrouped view is rendered', async ({ page }) => {
    await acceptSetup(page);
    await page.locator('[data-action="skip-game-result"]').click();
    await selectTab(page, 'history');

    await expect(
      page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="mastermind"]')
    ).toHaveAttribute('aria-pressed', 'true');
    // Group headers must always be present (no flat/none mode)
    await expect(page.locator('[data-history-group-id]').first()).toBeVisible();
  });

  // Story 34.4 — Localization keys for all five modes in English and French

  test('all five grouping mode buttons display correct English labels', async ({ page }) => {
    await acceptSetup(page);
    await page.locator('[data-action="skip-game-result"]').click();
    await selectTab(page, 'history');

    for (const mode of EXPECTED_MODES) {
      const button = page.locator(`[data-action="set-history-grouping"][data-history-grouping-mode="${mode.id}"]`);
      await expect(button).toContainText(mode.labelEn);
    }
  });

  test('all five grouping mode buttons display correct French labels', async ({ page }) => {
    await selectLocale(page, 'fr-FR');
    await acceptSetup(page);
    await page.locator('[data-action="skip-game-result"]').click();
    await selectTab(page, 'history');

    for (const mode of EXPECTED_MODES) {
      const button = page.locator(`[data-action="set-history-grouping"][data-history-grouping-mode="${mode.id}"]`);
      await expect(button).toContainText(mode.labelFr);
    }
  });
});
