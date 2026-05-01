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

async function openForcedPicksPanel(page) {
  await page.evaluate(() => {
    const details = document.querySelector('[data-forced-picks-panel]')?.closest('details');
    if (details) details.open = true;
  });
}

async function getForcedPicksState(page) {
  return page.evaluate(() => window.__FORCED_PICKS_UI__);
}

test.describe('Epic 70 — Preferred Expansion Priority (Story 70.4 UI)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
    await openForcedPicksPanel(page);
  });

  test('preferred expansion selector is visible and interactive when player owns ≥ 2 expansions', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    // seedAllOwnedState seeds all sets — there will be well more than 2.
    expect(snapshot.runtime.sets.length).toBeGreaterThanOrEqual(2);

    await expect(page.locator('[data-preferred-expansion-section]')).toBeVisible();
    await expect(page.locator('[data-preferred-expansion-select]')).toBeVisible();
    await expect(page.locator('[data-preferred-expansion-select]')).not.toBeDisabled();
  });

  test('preferred expansion selector is absent when player owns fewer than 2 expansions', async ({ page }) => {
    // Seed a state where only 1 set is owned
    const snapshot = await getRuntimeSnapshot(page);
    const singleSetId = snapshot.runtime.sets[0].id;
    const state = await readAppState(page);
    state.collection.ownedSetIds = [singleSetId];
    await writeAppState(page, state);
    await reloadApp(page);
    await selectTab(page, 'new-game');
    await openForcedPicksPanel(page);

    await expect(page.locator('[data-preferred-expansion-select]')).toHaveCount(0);
    await expect(page.locator('[data-preferred-expansion-unavailable]')).toBeVisible();
  });

  test('selecting an expansion persists preferredExpansionId in forced picks state', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const firstSet = snapshot.runtime.sets.find((s) =>
      snapshot.runtime.sets.length >= 2
    );
    const targetSetId = snapshot.runtime.sets[0].id;

    await page.locator('[data-preferred-expansion-select]').selectOption(targetSetId);

    // Wait for reactive state to update
    await page.waitForFunction(
      (id) => window.__FORCED_PICKS_UI__?.preferredExpansionId === id,
      targetSetId
    );

    const fp = await getForcedPicksState(page);
    expect(fp.preferredExpansionId).toBe(targetSetId);
  });

  test('active preferred expansion is shown with its name and a clear button', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const targetSet = snapshot.runtime.sets[0];

    await page.locator('[data-preferred-expansion-select]').selectOption(targetSet.id);
    await page.waitForFunction(
      (id) => window.__FORCED_PICKS_UI__?.preferredExpansionId === id,
      targetSet.id
    );

    await expect(page.locator('[data-preferred-expansion-active]')).toBeVisible();
    await expect(page.locator('[data-preferred-expansion-active]')).toContainText(targetSet.name);
    await expect(page.locator('[data-action="clear-preferred-expansion"]')).toBeVisible();
  });

  test('tapping the clear button removes the preferred expansion (returns to null)', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const targetSetId = snapshot.runtime.sets[0].id;

    // Set a preferred expansion first
    await page.locator('[data-preferred-expansion-select]').selectOption(targetSetId);
    await page.waitForFunction(
      (id) => window.__FORCED_PICKS_UI__?.preferredExpansionId === id,
      targetSetId
    );

    // Clear it
    await page.locator('[data-action="clear-preferred-expansion"]').click();
    await page.waitForFunction(() => window.__FORCED_PICKS_UI__?.preferredExpansionId === null);

    const fp = await getForcedPicksState(page);
    expect(fp.preferredExpansionId).toBeNull();
    await expect(page.locator('[data-preferred-expansion-active]')).toHaveCount(0);
  });

  test('preferred expansion state is cleared after page reload (one-shot constraint)', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const targetSetId = snapshot.runtime.sets[0].id;

    await page.locator('[data-preferred-expansion-select]').selectOption(targetSetId);
    await page.waitForFunction(
      (id) => window.__FORCED_PICKS_UI__?.preferredExpansionId === id,
      targetSetId
    );

    // Reload clears the in-memory forced picks state
    await reloadApp(page);
    await selectTab(page, 'new-game');
    await openForcedPicksPanel(page);

    const fp = await getForcedPicksState(page);
    expect(fp.preferredExpansionId).toBeNull();
    await expect(page.locator('[data-preferred-expansion-active]')).toHaveCount(0);
  });
});
