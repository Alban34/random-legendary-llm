import { test, expect } from '@playwright/test';

import {
  getRuntimeSnapshot,
  gotoApp,
  readAppState,
  reloadApp,
  seedAllOwnedState,
  selectTab
} from './helpers/app-fixture.mjs';

async function addForcedPick(page, field, value) {
  await page.selectOption(`[data-forced-pick-select="${field}"]`, value);
  await page.locator(`[data-action="add-forced-pick"][data-field="${field}"]`).click();
}

test.describe('Epic 15 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
  });

  test('adds, reviews, removes, and clears forced picks across multiple categories', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const mastermind = snapshot.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
    const hero = snapshot.runtime.indexes.allHeroes[0];

    await addForcedPick(page, 'mastermindId', mastermind.id);
    await addForcedPick(page, 'heroIds', hero.id);

    await expect(page.locator('[data-forced-picks-panel]')).toContainText(mastermind.name);
    await expect(page.locator(`[data-forced-pick-field="heroIds"][data-forced-pick-id="${hero.id}"]`)).toContainText(hero.name);

    await page.locator(`[data-action="remove-forced-pick"][data-field="heroIds"][data-entity-id="${hero.id}"]`).click();
    await expect(page.locator(`[data-forced-pick-field="heroIds"][data-forced-pick-id="${hero.id}"]`)).toHaveCount(0);

    await page.locator('[data-action="clear-forced-picks"]').click();
    await expect(page.locator('[data-forced-picks-panel]')).toContainText('No forced picks are active.');
  });

  test('generates a setup that honors legal forced picks and surfaces an applied-constraints notice', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const scheme = snapshot.runtime.indexes.allSchemes.find((entity) => !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints.minimumPlayerCount);
    const mastermind = snapshot.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
    const hero = snapshot.runtime.indexes.allHeroes[0];

    await addForcedPick(page, 'schemeId', scheme.id);
    await addForcedPick(page, 'mastermindId', mastermind.id);
    await addForcedPick(page, 'heroIds', hero.id);

    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);

    await expect(page.locator('[data-result-section="scheme"]')).toContainText(scheme.name);
    await expect(page.locator('[data-result-section="mastermind"]')).toContainText(mastermind.name);
    await expect(page.locator('[data-result-section="heroes"]')).toContainText(hero.name);
    await expect(page.locator('#panel-new-game .notice.info').first()).toContainText('Applied forced picks');
  });

  test('shows actionable errors for impossible forced-pick combinations and clears one-shot constraints after accept or reload', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const scheme = snapshot.runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters');
    const mastermind = snapshot.runtime.indexes.allMasterminds.find((entity) => entity.name === 'Red Skull' && entity.setId === 'core-set');
    const extraVillainGroup = snapshot.runtime.indexes.allVillainGroups.find((entity) => ![scheme.forcedGroups[0].id, mastermind.lead.id].includes(entity.id));
    const hero = snapshot.runtime.indexes.allHeroes[0];

    await page.locator('[data-action="set-player-count"][data-player-count="2"]').click();
    await addForcedPick(page, 'schemeId', scheme.id);
    await addForcedPick(page, 'mastermindId', mastermind.id);
    await addForcedPick(page, 'villainGroupIds', extraVillainGroup.id);
    await page.locator('[data-action="generate-setup"]').click();
    await expect(page.locator('#panel-new-game .notice.warning')).toContainText('Forced Villain Groups exceed the available slots');

    await page.locator('[data-action="clear-forced-picks"]').click();
    await page.locator('[data-action="set-player-count"][data-player-count="1"]').click();
    await addForcedPick(page, 'heroIds', hero.id);
    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    await page.locator('[data-action="accept-current-setup"]').click();
    await selectTab(page, 'new-game');
    await expect(page.locator('[data-forced-picks-panel]')).toContainText('No forced picks are active.');

    const state = await readAppState(page);
    expect(state.history[0].forcedPicks).toBeUndefined();

    await selectTab(page, 'new-game');
    await addForcedPick(page, 'heroIds', hero.id);
    await reloadApp(page);
    await selectTab(page, 'new-game');
    await expect(page.locator('[data-forced-picks-panel]')).toContainText('No forced picks are active.');
  });
});