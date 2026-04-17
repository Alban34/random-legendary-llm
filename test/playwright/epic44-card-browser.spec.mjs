import { test, expect } from '@playwright/test';

import {
  gotoApp,
  readAppState,
  reloadApp,
  selectTab,
  writeAppState,
} from './helpers/app-fixture.mjs';

function getCollectionRow(page, setName) {
  return page.locator(`#panel-collection .collection-row[data-set-name="${setName}"]`);
}

async function ownSets(page, setIds) {
  const state = await readAppState(page);
  state.collection.ownedSetIds = setIds;
  await writeAppState(page, state);
  await reloadApp(page);
  await selectTab(page, 'collection');
}

test.describe('Epic 44: Card Browser', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await selectTab(page, 'collection');
  });

  // Story 44.1 — View toggle

  test('view toggle is visible in the Collection panel header', async ({ page }) => {
    await expect(page.locator('#panel-collection [data-view-toggle]')).toBeVisible();
    await expect(page.locator('#panel-collection [data-action="set-collection-view"][data-view="sets"]')).toBeVisible();
    await expect(page.locator('#panel-collection [data-action="set-collection-view"][data-view="cards"]')).toBeVisible();
  });

  test('card-browser section is hidden by default (sets view active)', async ({ page }) => {
    await expect(page.locator('#panel-collection [data-view="card-browser"]')).not.toBeVisible();
  });

  test('clicking "Browse Cards" shows card-browser section and hides set-ownership groups', async ({ page }) => {
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();

    await expect(page.locator('#panel-collection [data-view="card-browser"]')).toBeVisible();
    await expect(page.locator('#panel-collection .collection-group')).not.toBeVisible();
  });

  test('clicking "Sets" after "Browse Cards" restores the set-ownership view', async ({ page }) => {
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();
    await page.locator('[data-action="set-collection-view"][data-view="sets"]').click();

    await expect(page.locator('#panel-collection .collection-group').first()).toBeVisible();
    await expect(page.locator('#panel-collection [data-view="card-browser"]')).not.toBeVisible();
  });

  test('toggling views does not alter ownedSetIds in appState', async ({ page }) => {
    await ownSets(page, ['core-set']);
    const stateBefore = await readAppState(page);

    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();
    await page.locator('[data-action="set-collection-view"][data-view="sets"]').click();

    const stateAfter = await readAppState(page);
    assert_equal(stateBefore.collection.ownedSetIds, stateAfter.collection.ownedSetIds);
  });

  test('view toggle buttons carry aria-pressed reflecting active view', async ({ page }) => {
    const setsBtn = page.locator('[data-action="set-collection-view"][data-view="sets"]');
    const cardsBtn = page.locator('[data-action="set-collection-view"][data-view="cards"]');

    await expect(setsBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(cardsBtn).toHaveAttribute('aria-pressed', 'false');

    await cardsBtn.click();

    await expect(setsBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(cardsBtn).toHaveAttribute('aria-pressed', 'true');
  });

  // Story 44.3 — By Category grouping

  test('By Category: shows no-owned-sets message when no expansions are owned', async ({ page }) => {
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();
    // Default grouping is 'category'
    await expect(page.locator('#panel-collection [data-view="card-browser"]')).toContainText(
      'Own at least one expansion to browse individual cards.'
    );
  });

  test('By Category: owned Core Set shows five category section headings', async ({ page }) => {
    await ownSets(page, ['core-set']);
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();

    const browser = page.locator('#panel-collection [data-view="card-browser"]');
    await expect(browser.locator('[data-category="heroes"] h3')).toBeVisible();
    await expect(browser.locator('[data-category="masterminds"] h3')).toBeVisible();
    await expect(browser.locator('[data-category="villainGroups"] h3')).toBeVisible();
    await expect(browser.locator('[data-category="henchmanGroups"] h3')).toBeVisible();
    await expect(browser.locator('[data-category="schemes"] h3')).toBeVisible();
  });

  test('By Category: a known Core Set hero name appears in the Heroes section', async ({ page }) => {
    await ownSets(page, ['core-set']);
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();

    const heroesSection = page.locator('#panel-collection [data-view="card-browser"] [data-category="heroes"]');
    await expect(heroesSection).toContainText('Spider-Man');
    await expect(heroesSection).toContainText('Wolverine');
    await expect(heroesSection).toContainText('Black Widow');
  });

  // Story 44.4 — By Expansion grouping

  test('By Expansion: owned Core Set shows one expansion heading', async ({ page }) => {
    await ownSets(page, ['core-set']);
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();
    await page.locator('[data-action="set-card-grouping"][data-grouping="expansion"]').click();

    const browser = page.locator('#panel-collection [data-view="card-browser"]');
    await expect(browser.locator('[data-expansion="core-set"] h3')).toContainText('Core Set');
  });

  test('By Expansion: two owned expansions show two sections sorted A-Z', async ({ page }) => {
    await ownSets(page, ['core-set', 'fantastic-four']);
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();
    await page.locator('[data-action="set-card-grouping"][data-grouping="expansion"]').click();

    const browser = page.locator('#panel-collection [data-view="card-browser"]');
    const headings = await browser.locator('section[data-expansion] h3').allTextContents();

    expect(headings.length).toBe(2);
    // Core Set alphabetically before Fantastic Four
    expect(headings[0]).toContain('Core Set');
    expect(headings[1]).toContain('Fantastic Four');
  });

  test('By Expansion: a known core-set card appears in the Core Set section', async ({ page }) => {
    await ownSets(page, ['core-set']);
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();
    await page.locator('[data-action="set-card-grouping"][data-grouping="expansion"]').click();

    const coreSection = page.locator('#panel-collection [data-expansion="core-set"]');
    await expect(coreSection).toContainText('Spider-Man');
  });

  // Story 44.5 — Grouping selector

  test('grouping selector is visible only when card-browser mode is active', async ({ page }) => {
    await expect(page.locator('[data-grouping-toggle]')).not.toBeVisible();

    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();
    await expect(page.locator('[data-grouping-toggle]')).toBeVisible();
  });

  test('grouping selector buttons carry aria-pressed reflecting active grouping', async ({ page }) => {
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();

    const categoryBtn = page.locator('[data-action="set-card-grouping"][data-grouping="category"]');
    const expansionBtn = page.locator('[data-action="set-card-grouping"][data-grouping="expansion"]');

    await expect(categoryBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(expansionBtn).toHaveAttribute('aria-pressed', 'false');

    await expansionBtn.click();

    await expect(categoryBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(expansionBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('switching grouping updates rendered content immediately without navigation', async ({ page }) => {
    await ownSets(page, ['core-set']);
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();

    // Default is category view — category sections visible
    await expect(page.locator('#panel-collection [data-category="heroes"]')).toBeVisible();

    // Switch to expansion
    await page.locator('[data-action="set-card-grouping"][data-grouping="expansion"]').click();

    // Expansion section visible, no category sections
    await expect(page.locator('#panel-collection [data-expansion="core-set"]')).toBeVisible();
    await expect(page.locator('#panel-collection [data-category="heroes"]')).not.toBeVisible();
  });

  test('grouping selector buttons are keyboard-focusable', async ({ page }) => {
    await page.locator('[data-action="set-collection-view"][data-view="cards"]').click();

    const categoryBtn = page.locator('[data-action="set-card-grouping"][data-grouping="category"]');
    await categoryBtn.focus();
    await expect(categoryBtn).toBeFocused();
  });
});

// Simple deep-equal helper used in the toggle test
function assert_equal(a, b) {
  const aStr = JSON.stringify([...a].sort());
  const bStr = JSON.stringify([...b].sort());
  if (aStr !== bStr) {
    throw new Error(`Expected ${aStr} to equal ${bStr}`);
  }
}
