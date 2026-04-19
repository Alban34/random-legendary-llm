import { test, expect } from '@playwright/test';

import {
  getRuntimeSnapshot,
  gotoApp,
  reloadApp,
  seedAllOwnedState,
  selectTab,
  writeAppState,
  readAppState
} from './helpers/app-fixture.mjs';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRecord(id, result, runtime) {
  const { indexes } = runtime;
  const mastermindId = indexes.allMasterminds[0].id;
  const schemeId = indexes.allSchemes[0].id;
  const heroIds = indexes.allHeroes.slice(0, 3).map((h) => h.id);
  const villainGroupIds = indexes.allVillainGroups.slice(0, 1).map((v) => v.id);
  const henchmanGroupIds = indexes.allHenchmanGroups.slice(0, 1).map((h) => h.id);
  return {
    id,
    createdAt: '2025-01-01T00:00:00.000Z',
    playerCount: 1,
    advancedSolo: false,
    playMode: 'standard',
    setupSnapshot: { mastermindId, schemeId, heroIds, villainGroupIds, henchmanGroupIds },
    result
  };
}

async function seedHistoryWithOutcomes(page) {
  const snapshot = await getRuntimeSnapshot(page);
  const { runtime } = snapshot;

  const winRecord = makeRecord(
    'hist-win-1',
    { status: 'completed', outcome: 'win', score: 42, notes: '', updatedAt: '2025-01-01T00:01:00.000Z' },
    runtime
  );
  const lossRecord = makeRecord(
    'hist-loss-1',
    { status: 'completed', outcome: 'loss', score: null, notes: '', updatedAt: '2025-01-02T00:01:00.000Z' },
    runtime
  );
  const pendingRecord = makeRecord(
    'hist-pending-1',
    { status: 'pending' },
    runtime
  );

  const state = await readAppState(page);
  state.history = [winRecord, lossRecord, pendingRecord];
  await writeAppState(page, state);
  await reloadApp(page);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Epic 47: History Outcome Filter', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await seedHistoryWithOutcomes(page);
    await selectTab(page, 'history');
  });

  test('filter row appears when history has records', async ({ page }) => {
    await expect(page.locator('[data-outcome-filter-row]')).toBeVisible();
    await expect(page.locator('[data-outcome-filter="all"]')).toBeVisible();
    await expect(page.locator('[data-outcome-filter="win"]')).toBeVisible();
    await expect(page.locator('[data-outcome-filter="loss"]')).toBeVisible();
    await expect(page.locator('[data-outcome-filter="pending"]')).toBeVisible();
  });

  test('clicking "Won" shows only won records', async ({ page }) => {
    await page.locator('[data-outcome-filter="win"]').click();
    const records = page.locator('[data-history-record-id]');
    await expect(records).toHaveCount(1);
    await expect(page.locator('[data-history-record-id="hist-win-1"]')).toBeVisible();
    await expect(page.locator('[data-history-result-status="completed"]')).toHaveCount(1);
  });

  test('clicking "Lost" shows only lost records', async ({ page }) => {
    await page.locator('[data-outcome-filter="loss"]').click();
    const records = page.locator('[data-history-record-id]');
    await expect(records).toHaveCount(1);
    await expect(page.locator('[data-history-record-id="hist-loss-1"]')).toBeVisible();
  });

  test('clicking "Pending" shows only pending records', async ({ page }) => {
    await page.locator('[data-outcome-filter="pending"]').click();
    const records = page.locator('[data-history-record-id]');
    await expect(records).toHaveCount(1);
    await expect(page.locator('[data-history-record-id="hist-pending-1"]')).toBeVisible();
    await expect(page.locator('[data-history-result-status="pending"]')).toHaveCount(1);
  });

  test('clicking "All" restores all records', async ({ page }) => {
    await page.locator('[data-outcome-filter="win"]').click();
    await expect(page.locator('[data-history-record-id]')).toHaveCount(1);

    await page.locator('[data-outcome-filter="all"]').click();
    await expect(page.locator('[data-history-record-id]')).toHaveCount(3);
  });

  test('active filter option has aria-pressed=true', async ({ page }) => {
    // Default: "All" is active
    await expect(page.locator('[data-outcome-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-outcome-filter="win"]')).toHaveAttribute('aria-pressed', 'false');

    await page.locator('[data-outcome-filter="win"]').click();
    await expect(page.locator('[data-outcome-filter="win"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-outcome-filter="all"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('count line shows correct number when filter is not All', async ({ page }) => {
    await page.locator('[data-outcome-filter="win"]').click();
    const countEl = page.locator('[data-outcome-filter-count]');
    await expect(countEl).toBeVisible();
    await expect(countEl).toContainText('1 game');
  });

  test('count line is absent when filter is All', async ({ page }) => {
    await expect(page.locator('[data-outcome-filter-count]')).not.toBeVisible();
  });

  test('empty-state message appears when filter yields no results', async ({ page }) => {
    // Seed only loss and pending — no wins
    const snapshot = await getRuntimeSnapshot(page);
    const { runtime } = snapshot;
    const lossRecord = makeRecord(
      'hist-loss-only',
      { status: 'completed', outcome: 'loss', score: null, notes: '', updatedAt: '2025-01-01T00:01:00.000Z' },
      runtime
    );
    const state = await readAppState(page);
    state.history = [lossRecord];
    await writeAppState(page, state);
    await reloadApp(page);
    await selectTab(page, 'history');

    await page.locator('[data-outcome-filter="win"]').click();
    await expect(page.locator('[data-outcome-filter-empty]')).toBeVisible();
    await expect(page.locator('[data-outcome-filter-empty]')).toContainText('No won games yet');
    await expect(page.locator('[data-history-record-id]')).toHaveCount(0);
  });

  test('switching back to All hides empty-state and shows full list', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const { runtime } = snapshot;
    const lossRecord = makeRecord(
      'hist-loss-back',
      { status: 'completed', outcome: 'loss', score: null, notes: '', updatedAt: '2025-01-01T00:01:00.000Z' },
      runtime
    );
    const state = await readAppState(page);
    state.history = [lossRecord];
    await writeAppState(page, state);
    await reloadApp(page);
    await selectTab(page, 'history');

    await page.locator('[data-outcome-filter="win"]').click();
    await expect(page.locator('[data-outcome-filter-empty]')).toBeVisible();

    await page.locator('[data-outcome-filter="all"]').click();
    await expect(page.locator('[data-outcome-filter-empty]')).not.toBeVisible();
    await expect(page.locator('[data-history-record-id]')).toHaveCount(1);
  });
});
