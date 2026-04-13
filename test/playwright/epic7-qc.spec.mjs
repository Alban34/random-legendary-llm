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

function buildUsedBucket(items, freshNames = new Set()) {
  return Object.fromEntries(
    items
      .filter((item) => !freshNames.has(item.name))
      .map((item, index) => [item.id, {
        plays: index + 1,
        lastPlayedAt: new Date(Date.UTC(2024, 0, 1 + index)).toISOString()
      }])
  );
}

async function targetSchemeAndMastermind(page, { schemeName, mastermindName }) {
  const snapshot = await getRuntimeSnapshot(page);
  const state = await readAppState(page);
  state.collection.ownedSetIds = snapshot.runtime.sets.map((set) => set.id);
  state.usage.schemes = buildUsedBucket(snapshot.runtime.indexes.allSchemes, new Set([schemeName]));
  state.usage.masterminds = buildUsedBucket(snapshot.runtime.indexes.allMasterminds, new Set([mastermindName]));
  await writeAppState(page, state);
  await reloadApp(page);
}

test.describe('Epic 7 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
    await selectTab(page, 'new-game');
  });

  test('renders player-count controls, updates play-mode options by player count, and updates displayed requirements', async ({ page }) => {
    const requirementsCard = page.locator('#setup-requirements-card');

    await expect(requirementsCard).toContainText('3 Heroes · 1 Villain Group · 1 Henchman Group · 25 Wounds');
    await expect(page.locator('[data-action="accept-current-setup"]')).toBeDisabled();
    await expect(page.locator('[data-action="set-play-mode"]')).toHaveCount(3);

    await page.locator('[data-action="set-player-count"][data-player-count="2"]').click();
    await expect(page.locator('[data-action="set-play-mode"]')).toHaveCount(1);
    await expect(requirementsCard).toContainText('5 Heroes · 2 Villain Groups · 1 Henchman Group · 30 Wounds');

    await page.locator('[data-action="set-player-count"][data-player-count="1"]').click();
    await expect(page.locator('[data-action="set-play-mode"]')).toHaveCount(3);
    await page.locator('[data-action="set-play-mode"][data-play-mode="advanced-solo"]').click();
    await expect(requirementsCard).toContainText('4 Heroes · 2 Villain Groups · 1 Henchman Group · 25 Wounds');
  });

  test('renders a full generated setup result with mastermind, scheme, hero cards, villain groups, and henchman groups', async ({ page }) => {
    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    const counts = await page.evaluate(() => ({
      heroes: window.__CURRENT_SETUP__.heroes.length,
      villainGroups: window.__CURRENT_SETUP__.villainGroups.length,
      henchmanGroups: window.__CURRENT_SETUP__.henchmanGroups.length
    }));

    await expect(page.locator('[data-result-section="mastermind"]')).toBeVisible();
    await expect(page.locator('[data-result-section="scheme"]')).toBeVisible();
    await expect(page.locator('[data-result-section="heroes"] .hero-result-card')).toHaveCount(counts.heroes);
    await expect(page.locator('[data-result-section="villain-groups"] .result-list-item')).toHaveCount(counts.villainGroups);
    await expect(page.locator('[data-result-section="henchman-groups"] .result-list-item')).toHaveCount(counts.henchmanGroups);
    await expect(page.locator('[data-action="accept-current-setup"]')).toBeEnabled();
  });

  test('shows scheme notes plus mastermind-lead and forced-group cues for representative special-rule setups', async ({ page }) => {
    await targetSchemeAndMastermind(page, {
      schemeName: 'Secret Invasion of the Skrull Shapeshifters',
      mastermindName: 'Red Skull'
    });
    await selectTab(page, 'new-game');

    await page.locator('[data-action="set-player-count"][data-player-count="2"]').click();
    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);

    await expect(page.locator('[data-result-section="mastermind"]')).toContainText('Red Skull');
    await expect(page.locator('[data-result-section="mastermind"]')).toContainText('Always leads: HYDRA');
    await expect(page.locator('[data-result-section="mastermind"]')).toContainText('Mandatory lead');

    await expect(page.locator('[data-result-section="scheme"]')).toContainText('Secret Invasion of the Skrull Shapeshifters');
    await expect(page.locator('[data-result-section="scheme"] .notice')).toContainText('Force the Skrulls Villain Group');
    await expect(page.locator('[data-result-section="villain-groups"]')).toContainText('Forced by Scheme');
    await expect(page.locator('[data-result-section="villain-groups"]')).toContainText('Forced by Mastermind lead');
  });

  test('keeps Generate/Regenerate ephemeral until Accept & Log, then updates history and usage exactly once', async ({ page }) => {
    const baselineState = await readAppState(page);
    expect(baselineState.history).toHaveLength(0);
    expect(Object.keys(baselineState.usage.heroes)).toHaveLength(0);

    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    const firstSetupSnapshot = await page.evaluate(() => JSON.stringify(window.__CURRENT_SETUP__.setupSnapshot));
    const afterGenerate = await readAppState(page);
    expect(afterGenerate.history).toHaveLength(0);
    expect(Object.keys(afterGenerate.usage.heroes)).toHaveLength(0);

    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction((previousSnapshot) => window.__CURRENT_SETUP__ !== null && JSON.stringify(window.__CURRENT_SETUP__.setupSnapshot) !== previousSnapshot, firstSetupSnapshot);
    const afterRegenerate = await readAppState(page);
    expect(afterRegenerate.history).toHaveLength(0);
    expect(Object.keys(afterRegenerate.usage.heroes)).toHaveLength(0);

    await page.locator('[data-action="accept-current-setup"]').click();
    const acceptedState = await readAppState(page);
    expect(acceptedState.history).toHaveLength(1);
    expect(Object.keys(acceptedState.usage.heroes).length).toBeGreaterThan(0);

    await selectTab(page, 'history');
    await expect(page.locator('#panel-history .history-item')).toHaveCount(1);
  });

  test('accept-current-setup persists snapshot and usage to localStorage (regression: Svelte 5 $state.snapshot must wrap ui.currentSetup)', async ({ page }) => {
    // This test catches the Svelte 5 $state proxy + buildHistoryReadySetupSnapshot/deepClone failure.
    // If $state.snapshot(ui.currentSetup) is NOT called before buildHistoryReadySetupSnapshot,
    // deepClone throws "could not be cloned" and acceptCurrentSetup silently fails — no history entry,
    // no usage update, no tab switch to history.
    await page.locator('[data-action="generate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);

    const setupSnapshot = await page.evaluate(() => window.__CURRENT_SETUP__.setupSnapshot);
    await page.locator('[data-action="accept-current-setup"]').click();

    // Verify the tab switches to history (fails if accept threw internally)
    await expect(page.locator('#panel-history')).toBeVisible();

    // Verify localStorage was written with the correct snapshot IDs
    const savedState = await readAppState(page);
    expect(savedState.history).toHaveLength(1);
    const savedSnapshot = savedState.history[0].setupSnapshot;
    expect(savedSnapshot.mastermindId).toBe(setupSnapshot.mastermindId);
    expect(savedSnapshot.schemeId).toBe(setupSnapshot.schemeId);
    expect(savedSnapshot.heroIds).toEqual(setupSnapshot.heroIds);
    expect(savedSnapshot.villainGroupIds).toEqual(setupSnapshot.villainGroupIds);
    expect(savedSnapshot.henchmanGroupIds).toEqual(setupSnapshot.henchmanGroupIds);

    // Verify usage counters incremented for the exact heroes/mastermind/scheme played
    for (const heroId of setupSnapshot.heroIds) {
      expect(savedState.usage.heroes[heroId]?.plays).toBeGreaterThan(0);
    }
    expect(savedState.usage.masterminds[setupSnapshot.mastermindId]?.plays).toBeGreaterThan(0);
    expect(savedState.usage.schemes[setupSnapshot.schemeId]?.plays).toBeGreaterThan(0);
  });
});

