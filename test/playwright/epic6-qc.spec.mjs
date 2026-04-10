import { test, expect } from '@playwright/test';

import { gotoApp, readAppState, reloadApp, selectTab } from './helpers/app-fixture.mjs';

function getCollectionRow(page, setName) {
  return page.locator(`#panel-collection .collection-row[data-set-name="${setName}"]`);
}

function getBrowseCard(page, setName) {
  return page.locator(`#panel-browse .set-card[data-set-name="${setName}"]`);
}

test.describe('Epic 6 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'collection');
  });

  test('renders grouped collection rows by set type with representative checklist metadata', async ({ page }) => {
    const groupHeadings = await page.locator('#panel-collection .collection-group h3').allTextContents();
    expect(groupHeadings).toEqual(['Base', 'Large Expansions', 'Small Expansions', 'Standalone']);

    const coreRow = getCollectionRow(page, 'Core Set');
    await expect(coreRow).toContainText('(2012)');
    await expect(coreRow).toContainText('15 heroes');
    await expect(coreRow).toContainText('4 masterminds');

    const shieldRow = getCollectionRow(page, 'S.H.I.E.L.D.');
    await expect(shieldRow).toContainText('4 heroes');
    await expect(shieldRow).toContainText('0 henchman groups');

    const villainsRow = getCollectionRow(page, 'Villains');
    await expect(villainsRow).toBeVisible();
  });

  test('mirrors ownership toggles between Browse and Collection and updates totals immediately', async ({ page }) => {
    await selectTab(page, 'browse');
    await getBrowseCard(page, 'Fantastic Four').locator('[data-action="toggle-owned-set"]').click();

    await selectTab(page, 'collection');
    await expect(getCollectionRow(page, 'Fantastic Four').locator('.collection-checkbox')).toBeChecked();
    await expect(page.locator('#panel-collection')).toContainText('Heroes');
    await expect(page.locator('#panel-collection')).toContainText('5');
    await expect(page.locator('#panel-collection')).toContainText('Masterminds');
    await expect(page.locator('#panel-collection')).toContainText('2');

    await getCollectionRow(page, 'Fantastic Four').locator('.collection-checkbox').click();
    await expect(getCollectionRow(page, 'Fantastic Four').locator('.collection-checkbox')).not.toBeChecked();

    await selectTab(page, 'browse');
    await expect(getBrowseCard(page, 'Fantastic Four').locator('[data-action="toggle-owned-set"]')).toContainText('Add to Collection');
  });

  test('shows feasibility warnings for thin collections and legal states for healthy collections', async ({ page }) => {
    await getCollectionRow(page, 'Dimensions').locator('.collection-checkbox').click();

    await expect(page.locator('[data-feasibility-mode="standard-solo"]')).toContainText('Warning');
    await expect(page.locator('[data-feasibility-mode="standard-solo"]')).toContainText('villain groups');

    await getCollectionRow(page, 'Dimensions').locator('.collection-checkbox').click();
    await getCollectionRow(page, 'Core Set').locator('.collection-checkbox').click();

    for (const mode of ['standard-solo', 'advanced-solo', '2p', '3p', '4p', '5p']) {
      await expect(page.locator(`[data-feasibility-mode="${mode}"]`)).toContainText('Legal');
    }
  });

  test('clears only owned collection state through the confirmation flow and persists the result', async ({ page }) => {
    await getCollectionRow(page, 'Core Set').locator('.collection-checkbox').click();
    await getCollectionRow(page, 'Dark City').locator('.collection-checkbox').click();

    await page.locator('#panel-collection [data-action="request-reset-owned-collection"]').click();
    await expect(page.locator('#modal-root [role="dialog"]')).toBeVisible();

    await page.locator('#modal-root [data-action="cancel-reset-owned-collection"]').click();
    await expect(page.locator('#modal-root [role="dialog"]')).toBeHidden();
    await expect(getCollectionRow(page, 'Core Set').locator('.collection-checkbox')).toBeChecked();

    await page.locator('#panel-collection [data-action="request-reset-owned-collection"]').click();
    await page.locator('#modal-root [data-action="confirm-reset-owned-collection"]').click();
    await expect(getCollectionRow(page, 'Core Set').locator('.collection-checkbox')).not.toBeChecked();
    await expect(getCollectionRow(page, 'Dark City').locator('.collection-checkbox')).not.toBeChecked();

    const stateAfterReset = await readAppState(page);
    expect(stateAfterReset.collection.ownedSetIds).toEqual([]);

    await reloadApp(page);
    await selectTab(page, 'collection');
    await expect(getCollectionRow(page, 'Core Set').locator('.collection-checkbox')).not.toBeChecked();
  });
});

