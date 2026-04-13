import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  reloadApp,
  seedAllOwnedState,
  selectTab,
  writeAppState
} from './helpers/app-fixture.mjs';

async function setPlayMode(page, playerCount, playMode) {
  await selectTab(page, 'new-game');
  await page.locator(`#panel-new-game [data-action="set-player-count"][data-player-count="${playerCount}"]`).click();
  await page.locator(`#panel-new-game [data-action="set-play-mode"][data-play-mode="${playMode}"]`).click();
}

test.describe('Epic 11 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
  });

  test('renders explicit solo mode controls and updates the requirement messaging for Two-Handed Solo', async ({ page }) => {
    await selectTab(page, 'new-game');
    await expect(page.locator('[data-action="set-play-mode"][data-play-mode="standard"]')).toContainText('Standard Solo');
    await expect(page.locator('[data-action="set-play-mode"][data-play-mode="advanced-solo"]')).toContainText('Advanced Solo');
    await expect(page.locator('[data-action="set-play-mode"][data-play-mode="two-handed-solo"]')).toContainText('Two-Handed Solo');

    await setPlayMode(page, 1, 'two-handed-solo');
    await expect(page.locator('#setup-requirements-card')).toContainText('5 Heroes · 2 Villain Groups · 1 Henchman Group · 30 Wounds');
    await expect(page.locator('#setup-requirements-card')).toContainText('standard 2-player setup counts');

    await page.locator('[data-action="set-player-count"][data-player-count="2"]').click();
    await expect(page.locator('[data-action="set-play-mode"]')).toHaveCount(1);
    await expect(page.locator('#panel-new-game')).toContainText('Alternate solo modes are disabled until you switch back to 1 player.');
  });

  test('generates and accepts setups that differ only by play mode, then renders distinct history labels', async ({ page }) => {
    await setPlayMode(page, 1, 'standard');
    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    await page.locator('[data-action="accept-current-setup"]').click();

    await setPlayMode(page, 1, 'two-handed-solo');
    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null && window.__CURRENT_SETUP__.template.playMode === 'two-handed-solo');
    await page.locator('[data-action="accept-current-setup"]').click();

    await selectTab(page, 'history');
    await expect(page.locator('#panel-history .history-item')).toHaveCount(2);
    // Groups are sorted alphabetically by label, not by recency — check both labels appear
    await expect(page.locator('#panel-history')).toContainText('Two-Handed Solo');
    await expect(page.locator('#panel-history')).toContainText('Standard Solo');
  });

  test('keeps restored legacy records readable alongside mode-aware records', async ({ page }) => {
    const state = await readAppState(page);
    state.history = [{
      id: 'legacy-standard-solo',
      createdAt: new Date().toISOString(),
      playerCount: 1,
      advancedSolo: false,
      setupSnapshot: {
        mastermindId: 'core-set-red-skull',
        schemeId: 'core-set-secret-invasion-of-the-skrull-shapeshifters',
        heroIds: ['core-set-black-widow', 'core-set-cyclops', 'core-set-deadpool'],
        villainGroupIds: ['core-set-brotherhood'],
        henchmanGroupIds: ['core-set-hand-ninjas']
      }
    }];
    await writeAppState(page, state);
    await reloadApp(page);

    await selectTab(page, 'history');
    await expect(page.locator('#panel-history .history-item').first()).toContainText('Standard Solo');
  });
});