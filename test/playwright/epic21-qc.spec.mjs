import { test, expect } from '@playwright/test';

import {
  gotoApp,
  reloadApp,
  selectLocale,
  selectTab
} from './helpers/app-fixture.mjs';

test.describe('Epic 21 automated QC', () => {
  test('shows the walkthrough above the main tab content on first launch', async ({ page }) => {
    await gotoApp(page);

    await expect(page.locator('#onboarding-shell')).toBeVisible();
    await expect(page.locator('#panel-browse .browse-hero .button-primary')).toHaveCount(1);

    const positions = await page.evaluate(() => {
      const onboarding = document.querySelector('#onboarding-shell');
      const browseHero = document.querySelector('#panel-browse .browse-hero');
      if (!onboarding || !browseHero) {
        return null;
      }

      const onboardingRect = onboarding.getBoundingClientRect();
      const browseHeroRect = browseHero.getBoundingClientRect();
      return {
        onboardingTop: onboardingRect.top,
        onboardingBottom: onboardingRect.bottom,
        browseHeroTop: browseHeroRect.top
      };
    });

    expect(positions).not.toBeNull();
    expect(positions.onboardingTop).toBeLessThan(positions.browseHeroTop);
    expect(positions.onboardingBottom).toBeLessThan(positions.browseHeroTop);
  });

  test('keeps Browse sets full width and moves secondary help behind disclosure', async ({ page }) => {
    await gotoApp(page);
    await page.locator('#onboarding-shell [data-action="skip-onboarding"]').click();
    await reloadApp(page);
    await selectTab(page, 'browse');

    await expect(page.locator('#panel-browse')).not.toContainText('Ready Tabs');
    await expect(page.locator('#panel-browse [data-browse-help-disclosure]')).not.toHaveAttribute('open', '');

    const layout = await page.evaluate(() => {
      const tabPanel = document.querySelector('#panel-browse');
      const hero = document.querySelector('#panel-browse .browse-hero');
      const browseSets = document.querySelector('#panel-browse [data-browse-sets-panel]');
      const help = document.querySelector('#panel-browse [data-browse-help-disclosure]');
      if (!tabPanel || !hero || !browseSets || !help) {
        return null;
      }

      const panelRect = tabPanel.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const setsRect = browseSets.getBoundingClientRect();
      return {
        panelWidth: panelRect.width,
        setsWidth: setsRect.width,
        sameLeftEdge: Math.abs(heroRect.left - setsRect.left) <= 2,
        stacked: setsRect.top >= heroRect.bottom,
        helpClosed: !help.hasAttribute('open')
      };
    });

    expect(layout).not.toBeNull();
    expect(layout.sameLeftEdge).toBe(true);
    expect(layout.stacked).toBe(true);
    expect(layout.helpClosed).toBe(true);
    expect(layout.setsWidth / layout.panelWidth).toBeGreaterThan(0.9);
  });

  test('translates the first-run walkthrough eyebrow in supported non-English locales', async ({ page }) => {
    await gotoApp(page);

    const onboardingTitleEyebrow = page.locator('#onboarding-shell > .row > div').first().locator('.eyebrow');
    const onboardingStepCard = page.locator('#onboarding-shell .onboarding-step-card');

    const expectations = [
      {
        id: 'fr-FR',
        eyebrow: 'Visite de premiere ouverture',
        stepPrefix: 'Etape 1 sur 5',
        stepTitle: 'Parcourez d abord tout le catalogue',
        stepAction: 'Rester dans Parcourir'
      },
      {
        id: 'de-DE',
        eyebrow: 'Erststart-Einfuhrung',
        stepPrefix: 'Schritt 1 von 5',
        stepTitle: 'Durchsuche zuerst den gesamten Katalog',
        stepAction: 'Im Stoebern bleiben'
      },
      {
        id: 'ja-JP',
        eyebrow: '初回起動ガイド',
        stepPrefix: 'ステップ 1 / 5',
        stepTitle: 'まずは全カタログを確認',
        stepAction: '閲覧にとどまる'
      },
      {
        id: 'ko-KR',
        eyebrow: '첫 실행 안내',
        stepPrefix: '5단계 중 1단계',
        stepTitle: '먼저 전체 카탈로그 둘러보기',
        stepAction: '둘러보기에 머무르기'
      },
      {
        id: 'es-ES',
        eyebrow: 'Guia de primer uso',
        stepPrefix: 'Paso 1 de 5',
        stepTitle: 'Explora primero el catálogo completo',
        stepAction: 'Seguir en Explorar'
      }
    ];

    for (const localeExpectation of expectations) {
      await selectLocale(page, localeExpectation.id);
      await expect(onboardingTitleEyebrow).toHaveText(localeExpectation.eyebrow);
      await expect(onboardingStepCard.locator('.eyebrow')).toHaveText(localeExpectation.stepPrefix);
      await expect(onboardingStepCard.locator('h3')).toHaveText(localeExpectation.stepTitle);
      await expect(onboardingStepCard.locator('[data-action="open-onboarding-tab"]')).toHaveText(localeExpectation.stepAction);
      await reloadApp(page);
      await expect(onboardingTitleEyebrow).toHaveText(localeExpectation.eyebrow);
      await expect(onboardingStepCard.locator('.eyebrow')).toHaveText(localeExpectation.stepPrefix);
      await expect(onboardingStepCard.locator('h3')).toHaveText(localeExpectation.stepTitle);
      await expect(onboardingStepCard.locator('[data-action="open-onboarding-tab"]')).toHaveText(localeExpectation.stepAction);
    }
  });
});
