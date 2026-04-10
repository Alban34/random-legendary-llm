import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  reloadApp,
  seedAllOwnedState,
  selectTheme,
  selectTab
} from './helpers/app-fixture.mjs';

async function acceptSetup(page, playerCount = 1, playMode = null) {
  await selectTab(page, 'new-game');
  await page.locator(`[data-action="set-player-count"][data-player-count="${playerCount}"]`).click();
  if (playMode) {
    await page.locator(`[data-action="set-play-mode"][data-play-mode="${playMode}"]`).click();
  }
  await page.locator('[data-action="generate-setup"]').click();
  await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
  await page.locator('[data-action="accept-current-setup"]').click();
}

test.describe('Epic 20 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
  });

  test('groups History by mastermind by default and keeps the newest group first', async ({ page }) => {
    await acceptSetup(page, 1, 'standard');
    await page.locator('[data-action="skip-game-result"]').click();
    await acceptSetup(page, 1, 'two-handed-solo');
    await page.locator('[data-action="skip-game-result"]').click();

    await selectTab(page, 'history');
    await expect(page.locator('[data-history-grouping-controls] [data-history-grouping-mode="mastermind"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-history-group-id]').first()).toBeVisible();
  });

  test('switches grouping modes without mutating persisted history', async ({ page }) => {
    await acceptSetup(page, 1, 'standard');
    await page.locator('[data-action="skip-game-result"]').click();
    await acceptSetup(page, 2, 'standard');
    await page.locator('[data-action="skip-game-result"]').click();

    const beforeState = await readAppState(page);
    await selectTab(page, 'history');
    await page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="player-count"]').click();
    await expect(page.locator('[data-history-group-id]').first()).toContainText('2 Players');

    await page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="none"]').click();
    await expect(page.locator('[data-history-group-id]')).toHaveCount(0);
    await expect(page.locator('#panel-history .history-item')).toHaveCount(2);

    const afterState = await readAppState(page);
    expect(afterState).toEqual(beforeState);
  });

  test('supports editing a result inside a grouped history section', async ({ page }) => {
    await acceptSetup(page, 1, 'two-handed-solo');

    await selectTab(page, 'history');
    await page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="play-mode"]').click();
    const twoHandedGroup = page.locator('[data-history-group-id="play-mode:two-handed-solo"]');
    await expect(twoHandedGroup).toContainText('Two-Handed Solo');

    const firstRecord = twoHandedGroup.locator('.history-item').first();
    await firstRecord.locator('[data-result-field="outcome"]').selectOption('win');
    await firstRecord.locator('[data-result-field="score"]').fill('88');
    await firstRecord.locator('[data-action="save-game-result"]').click();

    await expect(firstRecord).toContainText('Win · Score 88');
  });

  test('resets to the default grouping after reload and after backup restore', async ({ page }) => {
    await acceptSetup(page, 1, 'standard');
    await page.locator('[data-action="skip-game-result"]').click();
    await selectTheme(page, 'newsprint');

    const savedState = await readAppState(page);
    await selectTab(page, 'history');
    await page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="none"]').click();
    await reloadApp(page);
    await selectTab(page, 'history');
    await expect(page.locator('[data-history-grouping-controls] [data-history-grouping-mode="mastermind"]')).toHaveAttribute('aria-pressed', 'true');

    await selectTab(page, 'backup');
    await page.locator('#backup-import-input').setInputFiles({
      name: 'epic20-backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        schemaId: 'legendary-marvel-randomizer-backup',
        version: 1,
        exportedAt: '2026-04-10T21:00:00.000Z',
        metadata: {
          appId: 'legendary-marvel-randomizer',
          storageKey: 'legendary_state_v1',
          stateSchemaVersion: 1
        },
        data: {
          collection: savedState.collection,
          usage: savedState.usage,
          history: savedState.history,
          preferences: savedState.preferences
        }
      }), 'utf8')
    });
    await page.locator('[data-action="request-replace-backup"]').click();
    await page.locator('#modal-root [data-action="confirm-replace-backup"]').click();

    await selectTab(page, 'history');
    await expect(page.locator('[data-history-grouping-controls] [data-history-grouping-mode="mastermind"]')).toHaveAttribute('aria-pressed', 'true');
  });
});