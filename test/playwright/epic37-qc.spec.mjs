import { test, expect } from '@playwright/test';

import {
  gotoApp,
  seedAllOwnedState,
  selectTab,
  selectLocale,
  writeAppState,
  readAppState
} from './helpers/app-fixture.mjs';

test.describe('Epic 37 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
  });

  test('Story 37.5: 5-player setup requires exactly 5 Villain Groups in the setup requirements', async ({ page }) => {
    const requirementsCard = page.locator('#setup-requirements-card');

    await page.locator('[data-action="set-player-count"][data-player-count="5"]').click();
    await expect(requirementsCard).toContainText('5 Villain Groups');
  });

  test('Story 37.5: generating a 5-player setup produces exactly 5 villain group slots in the result display', async ({ page }) => {
    await page.locator('[data-action="set-player-count"][data-player-count="5"]').click();
    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);

    await expect(
      page.locator('[data-result-section="villain-groups"] .result-list-item')
    ).toHaveCount(5);
  });
});

test.describe('Epic 37 Story 37.1 QC: locale coverage', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('Story 37.1: each non-English locale renders the app title in the target language', async ({ page }) => {
    const locales = [
      { id: 'fr-FR', title: 'Randomiseur Legendary: Marvel' },
      { id: 'de-DE', title: 'Legendary: Marvel Zufallsgenerator' },
      { id: 'ja-JP', title: 'Legendary: Marvel ランダマイザー' },
      { id: 'ko-KR', title: 'Legendary: Marvel 랜덤라이저' },
      { id: 'es-ES', title: 'Aleatorizador de Legendary: Marvel' },
    ];

    for (const locale of locales) {
      await selectLocale(page, locale.id);
      await expect(page.locator('#app-title')).toHaveText(locale.title);
    }
  });

  test('Story 37.1: each non-English locale renders the backup tab title in the target language', async ({ page }) => {
    const locales = [
      { id: 'fr-FR', backupTitle: 'Sauvegarde et restauration' },
      { id: 'de-DE', backupTitle: 'Backup und Wiederherstellung' },
      { id: 'ja-JP', backupTitle: 'バックアップと復元' },
      { id: 'ko-KR', backupTitle: '백업 및 복원' },
      { id: 'es-ES', backupTitle: 'Copia y restauración' },
    ];

    for (const locale of locales) {
      await selectLocale(page, locale.id);
      await selectTab(page, 'backup');
      await expect(page.locator('#panel-backup h2').first()).toHaveText(locale.backupTitle);
      await selectTab(page, 'browse');
    }
  });

  test('Story 37.1: each non-English locale renders the generate button label in the target language', async ({ page }) => {
    const locales = [
      { id: 'fr-FR', generateLabel: 'Générer la mise en place' },
      { id: 'de-DE', generateLabel: 'Aufstellung generieren' },
      { id: 'ja-JP', generateLabel: 'セットアップを生成' },
      { id: 'ko-KR', generateLabel: '세팅 생성' },
      { id: 'es-ES', generateLabel: 'Generar configuración' },
    ];

    await selectTab(page, 'new-game');

    for (const locale of locales) {
      await selectLocale(page, locale.id);
      await expect(page.locator('[data-action="generate-setup"]')).toHaveText(locale.generateLabel);
    }
  });
});

test.describe('Epic 37 Story 37.2 QC: score display locale-aware', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
  });

  test('Story 37.2: history score shows locale-aware number format and translated score label', async ({ page }) => {
    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    await page.locator('[data-action="accept-current-setup"]').click();
    await expect(page.locator('[data-result-editor]')).toHaveCount(1);

    await page.locator('[data-result-field="outcome"]').selectOption('win');
    await page.locator('[data-result-field="score"]').fill('1000');
    await page.locator('[data-action="save-game-result"]').click();

    await selectTab(page, 'history');
    const historyItem = page.locator('.history-item').first();

    // en-US: comma-separated thousands
    await expect(historyItem).toContainText('1,000');

    // de-DE: German score label and period-separated thousands
    await selectLocale(page, 'de-DE');
    await expect(historyItem).toContainText('Punktzahl');
    await expect(historyItem).toContainText('1.000');
  });
});

test.describe('Epic 37 Story 37.4 QC: version badge', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('Story 37.4: app version badge displays v1.0.4', async ({ page }) => {
    await expect(page.locator('#app-version').first()).toHaveText('v1.0.4');
  });
});
