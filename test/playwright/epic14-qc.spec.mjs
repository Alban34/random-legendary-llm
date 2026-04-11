import { test, expect } from '@playwright/test';

import {
  getRuntimeSnapshot,
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
  await expect(page.locator('[data-result-editor]')).toHaveCount(1);
}

async function saveCurrentResult(page, { outcome, score = null, notes = '' }) {
  await page.locator('[data-result-field="outcome"]').selectOption(outcome);
  await page.locator('[data-result-field="score"]').fill(score === null ? '' : String(score));
  await page.locator('[data-result-field="notes"]').fill(notes);
  await page.locator('[data-action="save-game-result"]').click();
}

test.describe('Epic 14 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
  });

  test('shows sparse-data insight copy and keeps Game history as the first History section', async ({ page }) => {
    await selectTab(page, 'history');

    await expect(page.locator('#panel-history > section').first()).toContainText('Game history');
    await expect(page.locator('[data-history-insights]')).toContainText('No games have been logged yet');
    await expect(page.locator('[data-insight-card="games-logged"]')).toContainText('0');
    await expect(page.locator('[data-insight-card="win-rate"]')).toContainText('—');
    await expect(page.locator('[data-insight-card="fresh-pool"]')).not.toContainText('0/0');
  });

  test('updates insight summary cards after wins, losses, scoreless losses, and pending results are logged', async ({ page }) => {
    await acceptSetupIntoResultEntry(page, 1);
    await saveCurrentResult(page, { outcome: 'win', score: 80, notes: 'Strong opening.' });

    await acceptSetupIntoResultEntry(page, 2);
    await saveCurrentResult(page, { outcome: 'loss', score: null, notes: 'City filled before the finish.' });

    await acceptSetupIntoResultEntry(page, 3);
    await page.locator('[data-action="skip-game-result"]').click();

    await selectTab(page, 'history');
    await expect(page.locator('[data-insight-card="games-logged"]')).toContainText('3');
    await expect(page.locator('[data-insight-card="win-rate"]')).toContainText('50%');
    await expect(page.locator('[data-insight-card="pending-results"]')).toContainText('1');
    await expect(page.locator('[data-insight-card="average-score"]')).toContainText('80');
    await expect(page.locator('[data-history-insights]')).toContainText('Wins 1 · Losses 1 · Pending 1 · Scored 1');
  });

  test('renders duplicate-name rankings with set context and keeps the layout readable on desktop and mobile', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const blackWidows = snapshot.runtime.indexes.allHeroes.filter((entity) => entity.name === 'Black Widow');
    expect(blackWidows.length).toBeGreaterThanOrEqual(2);

    const state = await readAppState(page);
    state.usage.heroes[blackWidows[0].id] = { plays: 4, lastPlayedAt: '2026-04-10T10:00:00.000Z' };
    state.usage.heroes[blackWidows[1].id] = { plays: 4, lastPlayedAt: '2026-04-09T10:00:00.000Z' };
    state.history = [{
      id: 'hero-ranking-seed',
      createdAt: '2026-04-10T10:00:00.000Z',
      playerCount: 1,
      advancedSolo: false,
      playMode: 'standard',
      setupSnapshot: {
        mastermindId: 'core-set-red-skull',
        schemeId: 'core-set-secret-invasion-of-the-skrull-shapeshifters',
        heroIds: ['core-set-black-widow', 'core-set-cyclops', 'core-set-deadpool'],
        villainGroupIds: ['core-set-brotherhood'],
        henchmanGroupIds: ['core-set-hand-ninjas']
      },
      result: {
        status: 'completed',
        outcome: 'win',
        score: 66,
        notes: '',
        updatedAt: '2026-04-10T10:00:00.000Z'
      }
    }];
    await writeAppState(page, state);
    await reloadApp(page);

    await setViewport(page, 'desktop');
    await selectTab(page, 'history');
    const heroRankings = page.locator('[data-stats-category="heroes"]');
    await expect(heroRankings).toContainText('Black Widow ·');

    await setViewport(page, 'mobile');
    await selectTab(page, 'history');
    await expect(page.locator('[data-history-insights]')).toBeVisible();
    await page.locator('[data-action="toggle-history-insights"]').click();
    await expect(heroRankings).toContainText('Black Widow ·');
  });

  test('shows owned-collection coverage, full-catalog coverage, and missing-extension percentages distinctly', async ({ page }) => {
    const state = await readAppState(page);
    state.collection.ownedSetIds = ['core-set'];
    state.usage.heroes['core-set-black-widow'] = { plays: 2, lastPlayedAt: '2026-04-10T10:00:00.000Z' };
    state.usage.heroes['dark-city-professor-x'] = { plays: 1, lastPlayedAt: '2026-04-10T09:00:00.000Z' };
    state.usage.masterminds['core-set-red-skull'] = { plays: 1, lastPlayedAt: '2026-04-10T10:00:00.000Z' };
    await writeAppState(page, state);
    await reloadApp(page);

    await selectTab(page, 'history');
    await expect(page.locator('[data-insight-card="user-collection-played"]')).not.toContainText('—');
    await expect(page.locator('[data-insight-card="overall-collection-played"]')).not.toContainText('—');
    await expect(page.locator('[data-insight-card="missing-extensions"]')).toContainText('100%');

    const userCoverage = page.locator('[data-insight-coverage-group="user-collection"]');
    const overallCoverage = page.locator('[data-insight-coverage-group="overall-collection"]');
    await expect(userCoverage.locator('[data-insight-coverage-category="heroes"]')).toContainText('1/');
    await expect(overallCoverage.locator('[data-insight-coverage-category="heroes"]')).toContainText('2/');
  });
});