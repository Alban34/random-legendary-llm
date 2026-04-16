import { test, expect } from '@playwright/test';

import {
  getRuntimeSnapshot,
  gotoApp,
  readAppState,
  reloadApp,
  seedAllOwnedState,
  selectTab,
  writeAppState
} from './helpers/app-fixture.mjs';

test.describe('Epic 46 Story 46.3: expansion subset selector panel', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
  });

  test('selector panel is visible when expansions are owned', async ({ page }) => {
    await expect(page.locator('[data-active-filter-panel]')).toBeVisible();
  });

  test('shows "All X expansions" summary when activeSetIds is empty', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const totalSets = snapshot.runtime.sets.length;
    await expect(page.locator('[data-active-filter-panel] .muted')).toContainText(`All ${totalSets} expansions`);
  });

  test('unchecking an expansion updates the summary to filtered view', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const totalSets = snapshot.runtime.sets.length;
    const firstSetId = snapshot.runtime.sets[0].id;

    await page.locator(`[data-active-filter-checkbox="${firstSetId}"]`).uncheck();

    await expect(page.locator('[data-active-filter-panel] .muted')).toContainText(
      `Using ${totalSets - 1} of ${totalSets} expansions`
    );
  });

  test('"Use all expansions" restores the "All X expansions" summary', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const totalSets = snapshot.runtime.sets.length;
    const firstSetId = snapshot.runtime.sets[0].id;

    await page.locator(`[data-active-filter-checkbox="${firstSetId}"]`).uncheck();
    await page.locator('[data-action="active-filter-select-all"]').click();

    await expect(page.locator('[data-active-filter-panel] .muted')).toContainText(`All ${totalSets} expansions`);
  });

  test('"Clear selection" also restores the all-owned state', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const totalSets = snapshot.runtime.sets.length;
    const firstSetId = snapshot.runtime.sets[0].id;

    await page.locator(`[data-active-filter-checkbox="${firstSetId}"]`).uncheck();
    await page.locator('[data-action="active-filter-clear-all"]').click();

    await expect(page.locator('[data-active-filter-panel] .muted')).toContainText(`All ${totalSets} expansions`);
  });

  test('state is persisted after toggling a checkbox', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const firstSetId = snapshot.runtime.sets[0].id;

    await page.locator(`[data-active-filter-checkbox="${firstSetId}"]`).uncheck();

    const state = await readAppState(page);
    expect(state.collection.activeSetIds).not.toContain(firstSetId);
  });

  test('selector panel is hidden when no expansions are owned', async ({ page }) => {
    const state = await readAppState(page);
    state.collection.ownedSetIds = [];
    state.collection.activeSetIds = [];
    await writeAppState(page, state);
    await reloadApp(page);
    await selectTab(page, 'new-game');

    await expect(page.locator('[data-active-filter-panel]')).not.toBeVisible();
  });
});

test.describe('Epic 46 Story 46.4: feasibility warning and Generate button gating', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
  });

  test('Generate button is enabled when all expansions are owned and filter is inactive', async ({ page }) => {
    await expect(page.locator('[data-action="generate-setup"]')).toBeEnabled();
  });

  test('Generate button is disabled and warning shows when active filter yields no legal setup', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);

    // Deselect all expansions by unchecking each one; the last uncheck collapses
    // back to empty (all-owned) per the spec, so instead write a minimal
    // single-set filter that excludes everything the generator needs.
    // We write state directly so we can craft an impossible filter (empty array of IDs).
    const state = await readAppState(page);
    // Set activeSetIds to a fake ID that owns nothing — forces "No owned sets selected"
    state.collection.activeSetIds = ['__nonexistent_set__'];
    await writeAppState(page, state);
    await reloadApp(page);
    await selectTab(page, 'new-game');

    await expect(page.locator('[data-action="generate-setup"]')).toBeDisabled();
    await expect(page.locator('[data-active-filter-warning]')).toBeVisible();
  });

  test('warning disappears and Generate re-enables after restoring a valid filter', async ({ page }) => {
    const state = await readAppState(page);
    state.collection.activeSetIds = ['__nonexistent_set__'];
    await writeAppState(page, state);
    await reloadApp(page);
    await selectTab(page, 'new-game');

    // Restore all-owned fallback via the "Use all expansions" button
    await page.locator('[data-action="active-filter-select-all"]').click();

    await expect(page.locator('[data-action="generate-setup"]')).toBeEnabled();
    await expect(page.locator('[data-active-filter-warning]')).not.toBeVisible();
  });
});
