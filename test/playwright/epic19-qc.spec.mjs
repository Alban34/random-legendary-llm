import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  readDocumentLocale,
  reloadApp,
  selectLocale,
  selectTab,
  setViewport,
  writeAppState
} from './helpers/app-fixture.mjs';

test.describe('Epic 19 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('switches to French from the shared header selector and persists across reloads', async ({ page }) => {
    await expect(page.locator('#header-locale-controls')).toBeVisible();

    await selectLocale(page, 'fr-FR');
    await expect(page.locator('#app-title')).toHaveText('Randomiseur Legendary: Marvel');

    await selectTab(page, 'backup');
    await expect(page.locator('#panel-backup h2').first()).toHaveText('Sauvegarde et restauration');

    const state = await readAppState(page);
    expect(state.preferences.localeId).toBe('fr-FR');

    await reloadApp(page);
    await expect(page.locator('#app-title')).toHaveText('Randomiseur Legendary: Marvel');

    const locale = await readDocumentLocale(page);
    expect(locale.lang).toBe('fr-FR');
    expect(locale.title).toBe('Randomiseur Legendary: Marvel');
  });

  test('shows only the six requested locales and translated primary UI for each one', async ({ page }) => {
    const localeSelect = page.locator('#header-locale-select');
    await expect(localeSelect.locator('option')).toHaveCount(6);
    await expect(localeSelect.locator('option')).toContainText(['English', 'Français', 'Deutsch', '日本語', '한국어', 'Español']);

    const expectations = [
      { id: 'en-US', title: 'Legendary: Marvel Randomizer', backup: 'Backup and restore' },
      { id: 'fr-FR', title: 'Randomiseur Legendary: Marvel', backup: 'Sauvegarde et restauration' },
      { id: 'de-DE', title: 'Legendary: Marvel Zufallsgenerator', backup: 'Backup und Wiederherstellung' },
      { id: 'ja-JP', title: 'Legendary: Marvel ランダマイザー', backup: 'バックアップと復元' },
      { id: 'ko-KR', title: 'Legendary: Marvel 랜덤라이저', backup: '백업 및 복원' },
      { id: 'es-ES', title: 'Aleatorizador de Legendary: Marvel', backup: 'Copia y restauración' }
    ];

    for (const localeExpectation of expectations) {
      await selectLocale(page, localeExpectation.id);
      await expect(page.locator('#app-title')).toHaveText(localeExpectation.title);
      await selectTab(page, 'backup');
      await expect(page.locator('#panel-backup h2').first()).toHaveText(localeExpectation.backup);
      await selectTab(page, 'browse');
    }
  });
});