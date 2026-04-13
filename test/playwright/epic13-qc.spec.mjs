import fs from 'node:fs/promises';

import { test, expect } from '@playwright/test';

import { BACKUP_SCHEMA_ID, BACKUP_SCHEMA_VERSION, createBackupPayload } from '../../src/app/backup-utils.mjs';
import {
  gotoApp,
  readAppState,
  seedAllOwnedState,
  selectTab,
  selectTheme,
} from './helpers/app-fixture.mjs';

async function acceptSetup(page, playerCount = 1) {
  await selectTab(page, 'new-game');
  await page.locator(`[data-action="set-player-count"][data-player-count="${playerCount}"]`).click();
  await page.locator('[data-action="generate-setup"]').click();
  await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
  await page.locator('[data-action="accept-current-setup"]').click();
}

function toJsonFile(payload, name = 'backup.json') {
  return {
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload, null, 2), 'utf8')
  };
}

test.describe('Epic 13 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('exports a versioned JSON backup from the dedicated Backup tab', async ({ page }) => {
    await seedAllOwnedState(page);
    await selectTheme(page, 'light');
    await acceptSetup(page, 1);
    await selectTab(page, 'backup');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-backup-panel] [data-action="export-backup"]').click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const backupText = downloadPath ? await fs.readFile(downloadPath, 'utf8') : await download.createReadStream().then(async (stream) => {
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      return Buffer.concat(chunks).toString('utf8');
    });
    const payload = JSON.parse(backupText);

    expect(download.suggestedFilename()).toMatch(/^legendary-marvel-randomizer-backup-.*\.json$/);
    expect(payload.schemaId).toBe(BACKUP_SCHEMA_ID);
    expect(payload.version).toBe(BACKUP_SCHEMA_VERSION);
    expect(payload.data.collection.ownedSetIds.length).toBeGreaterThan(0);
    expect(payload.data.history.length).toBe(1);
    expect(payload.data.preferences.themeId).toBe('light');
  });

  test('imports a valid backup preview and can replace current app data safely', async ({ page }) => {
    await seedAllOwnedState(page);
    await selectTheme(page, 'light');
    await acceptSetup(page, 2);
    const backupPayload = createBackupPayload(await readAppState(page), { exportedAt: '2026-04-10T18:00:00.000Z' });

    await selectTab(page, 'backup');
    await page.locator('#panel-backup [data-action="request-reset-all-state"]').click();
    await page.locator('#modal-root [data-action="confirm-reset-all-state"]').click();
    await selectTab(page, 'backup');

    await page.locator('#backup-import-input').setInputFiles(toJsonFile(backupPayload, 'replace-backup.json'));
    await expect(page.locator('[data-backup-preview]')).toContainText('replace-backup.json');
    await page.locator('[data-action="request-replace-backup"]').click();
    await page.locator('#modal-root [data-action="confirm-replace-backup"]').click();

    const restoredState = await readAppState(page);
    expect(restoredState.collection.ownedSetIds.length).toBe(backupPayload.data.collection.ownedSetIds.length);
    expect(restoredState.history).toHaveLength(1);
    expect(restoredState.preferences.themeId).toBe('light');
  });

  test('merges an imported backup with overlapping local data without duplicating shared records', async ({ page }) => {
    await seedAllOwnedState(page);
    await acceptSetup(page, 1);
    const currentState = await readAppState(page);

    const importedState = JSON.parse(JSON.stringify(currentState));
    importedState.collection.ownedSetIds = [...new Set([...currentState.collection.ownedSetIds.slice(0, 1), 'dark-city'])];
    importedState.preferences.themeId = 'light';
    importedState.history.push({
      ...currentState.history[0],
      id: 'backup-extra-record',
      createdAt: '2026-04-10T20:00:00.000Z'
    });
    const importedPayload = createBackupPayload(importedState, { exportedAt: '2026-04-10T20:15:00.000Z' });

    await selectTab(page, 'backup');
    await page.locator('#backup-import-input').setInputFiles(toJsonFile(importedPayload, 'merge-backup.json'));
    await expect(page.locator('[data-backup-preview]')).toContainText('merge-backup.json');
    await page.locator('[data-action="request-merge-backup"]').click();
    await page.locator('#modal-root [data-action="confirm-merge-backup"]').click();

    const mergedState = await readAppState(page);
    expect(mergedState.collection.ownedSetIds).toContain('dark-city');
    expect(mergedState.history).toHaveLength(2);
    expect(mergedState.preferences.themeId).toBe('light');
  });

  test('shows actionable import errors for unsupported backup files without mutating saved state', async ({ page }) => {
    await selectTab(page, 'backup');
    const startingState = await readAppState(page);

    await page.locator('#backup-import-input').setInputFiles(toJsonFile({ schemaId: 'wrong-schema', version: 1, data: {} }, 'invalid-backup.json'));
    await expect(page.locator('[data-backup-import-error]')).toContainText('unsupported schema identifier');

    const endingState = await readAppState(page);
    expect(endingState).toEqual(startingState);
  });

  test('import button opens file chooser and preview appears when a valid backup is selected', async ({ page }) => {
    const backupPayload = createBackupPayload({
      schemaVersion: 1,
      collection: { ownedSetIds: [] },
      usage: { heroes: {}, masterminds: {}, villainGroups: {}, henchmanGroups: {}, schemes: {} },
      history: [],
      preferences: { themeId: 'dark', localeId: 'en-US', lastPlayerCount: 1, lastAdvancedSolo: false, lastPlayMode: 'standard', selectedTab: null, onboardingCompleted: false }
    }, { exportedAt: '2026-04-13T10:00:00.000Z' });

    await selectTab(page, 'backup');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('[data-action="open-import-backup"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(toJsonFile(backupPayload, 'via-button.json'));

    await expect(page.locator('[data-backup-preview]')).toContainText('via-button.json');
  });
});
