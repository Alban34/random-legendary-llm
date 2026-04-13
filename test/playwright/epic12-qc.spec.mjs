import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  reloadApp,
  seedAllOwnedState,
  selectTab,
  setViewport,
  writeAppState
} from './helpers/app-fixture.mjs';

async function acceptSetupIntoResultEntry(page, playerCount = 1) {
  await selectTab(page, 'new-game');
  await page.locator(`[data-action="set-player-count"][data-player-count="${playerCount}"]`).click();
  await page.locator('[data-action="generate-setup"]').click();
  await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
  await page.locator('[data-action="accept-current-setup"]').click();
  await expect(page.locator('#panel-history')).toBeVisible();
  await expect(page.locator('[data-result-editor]')).toHaveCount(1);
}

test.describe('Epic 12 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
  });

  test('opens immediate score entry after accept, shows validation, and supports keyboard-first saving', async ({ page }) => {
    await acceptSetupIntoResultEntry(page, 1);

    const editor = page.locator('[data-result-editor]').first();
    await expect(editor.locator('[data-result-field="outcome"]')).toBeFocused();
    await editor.locator('[data-action="save-game-result"]').click();
    await expect(editor.locator('[data-result-form-error]')).toContainText('Choose Win or Loss');
    await expect(editor.locator('[data-result-form-error]')).toBeFocused();
    await expect(editor.locator('[data-result-form-error]')).toHaveAttribute('role', 'alert');
    await expect(editor.locator('[data-result-field="outcome"]')).toHaveAttribute('aria-invalid', 'true');

    await editor.locator('[data-result-field="outcome"]').selectOption('win');

    const scoreField = editor.locator('[data-result-field="score"]');
    await scoreField.focus();
    await page.keyboard.type('123');

    const notesField = editor.locator('[data-result-field="notes"]');
    await notesField.focus();
    await page.keyboard.type('Won after stabilizing the board.');
    await editor.locator('[data-action="save-game-result"]').click();

    const firstHistoryItem = page.locator('#panel-history .history-item').first();
    await expect(page.locator('[data-result-editor]')).toHaveCount(0);
    await expect(firstHistoryItem.locator('[data-action="edit-game-result"]')).toBeFocused();
    await expect(firstHistoryItem).toContainText('Win · Score 123');
    await expect(firstHistoryItem).toContainText('Won after stabilizing the board.');

    const state = await readAppState(page);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].result.outcome).toBe('win');
    expect(state.history[0].result.score).toBe(123);
  });

  test('supports skip, cancel, and later correction without duplicating the accepted record', async ({ page }) => {
    await acceptSetupIntoResultEntry(page, 2);

    await page.locator('[data-action="skip-game-result"]').click();
    const firstHistoryItem = page.locator('#panel-history .history-item').first();
    await expect(firstHistoryItem.locator('[data-action="edit-game-result"]')).toBeFocused();
    await expect(firstHistoryItem).toContainText('Pending result');

    await firstHistoryItem.locator('[data-action="edit-game-result"]').click();
    await page.locator('[data-result-field="outcome"]').selectOption('loss');
    await page.locator('[data-result-field="notes"]').fill('Initial result entry.');
    await page.locator('[data-action="save-game-result"]').click();
    await expect(firstHistoryItem).toContainText('Loss');
    await expect(firstHistoryItem).not.toContainText('Loss · Score');

    await firstHistoryItem.locator('[data-action="edit-game-result"]').click();
    await page.locator('[data-result-field="score"]').fill('90');
    await page.locator('[data-action="cancel-result-entry"]').click();
    await expect(firstHistoryItem.locator('[data-action="edit-game-result"]')).toBeFocused();
    await expect(firstHistoryItem).toContainText('Loss');
    await expect(firstHistoryItem).not.toContainText('Loss · Score');

    await firstHistoryItem.locator('[data-action="edit-game-result"]').click();
    await page.locator('[data-result-field="score"]').fill('90');
    await page.locator('[data-result-field="outcome"]').selectOption('win');
    await page.locator('[data-result-field="notes"]').fill('Corrected after recounting the final total.');
    await page.locator('[data-action="save-game-result"]').click();
    await expect(firstHistoryItem.locator('[data-action="edit-game-result"]')).toBeFocused();
    await expect(firstHistoryItem).toContainText('Win · Score 90');
    await expect(firstHistoryItem).toContainText('Corrected after recounting the final total.');

    const state = await readAppState(page);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].result.outcome).toBe('win');
    expect(state.history[0].result.score).toBe(90);
  });

  test('renders mixed pending and completed history entries clearly on desktop and mobile layouts', async ({ page }) => {
    await acceptSetupIntoResultEntry(page, 1);
    await page.locator('[data-result-field="outcome"]').selectOption('win');
    await page.locator('[data-result-field="score"]').fill('77');
    await page.locator('[data-action="save-game-result"]').click();

    await acceptSetupIntoResultEntry(page, 3);
    await page.locator('[data-action="skip-game-result"]').click();

    await setViewport(page, 'desktop');
    await selectTab(page, 'history');
    const historyItems = page.locator('#panel-history .history-item');
    await expect(historyItems).toHaveCount(2);
    await expect(page.locator('#panel-history')).toContainText('Pending result');
    await expect(page.locator('#panel-history')).toContainText('Win · Score 77');

    await setViewport(page, 'mobile');
    await selectTab(page, 'history');
    await expect(page.locator('#panel-history')).toContainText('Pending result');
    await expect(page.locator('#panel-history')).toContainText('Win · Score 77');
  });

  test('upgrades older saved history records without results into pending entries that can be completed', async ({ page }) => {
    const state = await readAppState(page);
    state.history = [{
      id: 'legacy-pending-record',
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
    const firstHistoryItem = page.locator('#panel-history .history-item').first();
    await expect(firstHistoryItem).toContainText('Pending result');
    await firstHistoryItem.locator('summary').click();
    await firstHistoryItem.locator('[data-action="edit-game-result"]').click();
    await page.locator('[data-result-field="outcome"]').selectOption('win');
    await page.locator('[data-result-field="score"]').fill('64');
    await page.locator('[data-action="save-game-result"]').click();
    await expect(firstHistoryItem).toContainText('Win · Score 64');
  });
});