import { test, expect } from '@playwright/test';

import { gotoApp, readAppState, reloadApp, selectTab } from './helpers/app-fixture.mjs';

function getSetCard(page, setName) {
  return page.locator('#panel-browse .set-card').filter({ has: page.locator(`.set-card-title:text-is("${setName}")`) });
}

test.describe('Epic 5 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'browse');
  });

  test('renders the browse grid from normalized data with representative metadata and low-count edge cases', async ({ page }) => {
    await expect(page.locator('#panel-browse .set-card')).toHaveCount(39);

    const coreSetCard = getSetCard(page, 'Core Set');
    await expect(coreSetCard).toContainText('2012');
    await expect(coreSetCard).toContainText('Base');
    await expect(coreSetCard).toContainText('Heroes');
    await expect(coreSetCard).toContainText('15');
    await expect(coreSetCard).toContainText('Masterminds');
    await expect(coreSetCard).toContainText('4');
    await expect(coreSetCard).toContainText('Villain Groups');
    await expect(coreSetCard).toContainText('7');
    await expect(coreSetCard).toContainText('Schemes');
    await expect(coreSetCard).toContainText('8');

    const dimensionsCard = getSetCard(page, 'Dimensions');
    await expect(dimensionsCard).toContainText('Small Expansion');
    await expect(dimensionsCard).toContainText('Villain Groups');
    await expect(dimensionsCard).toContainText('0');
    await expect(dimensionsCard).toContainText('Henchman Groups');
    await expect(dimensionsCard).toContainText('2');
    await expect(dimensionsCard).toContainText('Schemes');
    await expect(dimensionsCard).toContainText('0');
  });

  test('expands set details as an accordion and renders detailed contents for representative sets', async ({ page }) => {
    const coreSetCard = getSetCard(page, 'Core Set');

    await coreSetCard.locator('[data-action="toggle-browse-set-expanded"]').click();
    await expect(page.locator('#browse-details-core-set')).toBeVisible();
    await expect(page.locator('#browse-details-core-set')).toContainText('Black Widow');
    await expect(page.locator('#browse-details-core-set')).toContainText('Dr. Doom → Doombot Legion');
    await expect(page.locator('#browse-details-core-set')).toContainText('Secret Invasion of the Skrull Shapeshifters');

    const darkCityCard = getSetCard(page, 'Dark City');
    await darkCityCard.locator('[data-action="toggle-browse-set-expanded"]').click();
    await expect(page.locator('#browse-details-dark-city')).toBeVisible();
    await expect(page.locator('#browse-details-core-set')).toBeHidden();
  });

  test('filters browse results by type and alias search and shows a clear empty state for no-match queries', async ({ page }) => {
    const searchInput = page.locator('#browse-search-input');

    await searchInput.fill('shield');
    await expect(page.locator('#panel-browse .set-card')).toHaveCount(1);
    await expect(getSetCard(page, 'S.H.I.E.L.D.')).toBeVisible();

    await page.locator('[data-action="set-browse-type-filter"][data-type-filter="small-expansion"]').click();
    await expect(page.locator('#panel-browse .set-card')).toHaveCount(1);
    await expect(getSetCard(page, 'S.H.I.E.L.D.')).toContainText('Small Expansion');

    await searchInput.fill('definitely-no-matches');
    await expect(page.locator('#browse-empty-state')).toBeVisible();
    await expect(page.locator('#panel-browse .set-card')).toHaveCount(0);

    await searchInput.fill('Revelations');
    await page.locator('[data-action="set-browse-type-filter"][data-type-filter="small-expansion"]').click();
    await expect(page.locator('#panel-browse .set-card')).toHaveCount(1);
    await expect(getSetCard(page, 'Revelations')).toBeVisible();
  });

  test('toggles owned collection state from Browse and persists the result across reloads', async ({ page }) => {
    const fantasticFourCard = getSetCard(page, 'Fantastic Four');
    await fantasticFourCard.getByRole('button', { name: 'Add to Collection' }).click();

    await expect(fantasticFourCard.getByRole('button', { name: '✓ In Collection' })).toBeVisible();
    await expect(page.locator('#panel-browse')).toContainText('Owned Sets');
    await expect(page.locator('#panel-browse')).toContainText('1');

    const stateAfterToggle = await readAppState(page);
    expect(stateAfterToggle.collection.ownedSetIds).toContain('fantastic-four');

    await reloadApp(page);
    await selectTab(page, 'browse');
    await expect(getSetCard(page, 'Fantastic Four').getByRole('button', { name: '✓ In Collection' })).toBeVisible();
  });
});

