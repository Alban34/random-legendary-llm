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

async function configureOwnedSets(page, ownedSetIds) {
  const state = await readAppState(page);
  state.collection.ownedSetIds = ownedSetIds;
  await writeAppState(page, state);
  await reloadApp(page);
}

async function prepareTargetedState(page, options = {}) {
  const snapshot = await getRuntimeSnapshot(page);
  const state = await readAppState(page);
  state.collection.ownedSetIds = snapshot.runtime.sets.map((set) => set.id);

  if (options.schemeNames) {
    state.usage.schemes = buildUsedBucket(snapshot.runtime.indexes.allSchemes, new Set(options.schemeNames));
  }

  if (options.mastermindNames) {
    state.usage.masterminds = buildUsedBucket(snapshot.runtime.indexes.allMasterminds, new Set(options.mastermindNames));
  }

  if (options.heroFreshCount !== undefined) {
    const freshHeroNames = new Set(snapshot.runtime.indexes.allHeroes.slice(0, options.heroFreshCount).map((hero) => hero.name));
    state.usage.heroes = buildUsedBucket(snapshot.runtime.indexes.allHeroes, freshHeroNames);
  }

  await writeAppState(page, state);
  await reloadApp(page);
}

async function generateSetup(page) {
  await selectTab(page, 'new-game');
  await page.locator('#panel-new-game [data-action="generate-setup"]').click();
  await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null || document.querySelector('#panel-new-game .notice.warning'));
  return page.evaluate(() => ({
    error: document.querySelector('#panel-new-game .notice.warning')?.textContent ?? null,
    setup: window.__CURRENT_SETUP__ ? {
      requirements: window.__CURRENT_SETUP__.requirements,
      template: window.__CURRENT_SETUP__.template,
      mastermind: {
        id: window.__CURRENT_SETUP__.mastermind.id,
        name: window.__CURRENT_SETUP__.mastermind.name,
        leadCategory: window.__CURRENT_SETUP__.mastermind.lead?.category ?? null,
        leadEntityId: window.__CURRENT_SETUP__.mastermind.leadEntity?.id ?? null,
        leadEntityName: window.__CURRENT_SETUP__.mastermind.leadEntity?.name ?? null
      },
      scheme: {
        id: window.__CURRENT_SETUP__.scheme.id,
        name: window.__CURRENT_SETUP__.scheme.name
      },
      heroes: window.__CURRENT_SETUP__.heroes.map((hero) => ({ id: hero.id, name: hero.name })),
      villainGroups: window.__CURRENT_SETUP__.villainGroups.map((group) => ({ id: group.id, name: group.name, forced: group.forced })),
      henchmanGroups: window.__CURRENT_SETUP__.henchmanGroups.map((group) => ({ id: group.id, name: group.name, forced: group.forced })),
      notices: window.__CURRENT_SETUP__.notices
    } : null
  }));
}

async function setPlayerMode(page, playerCount, advancedSolo = false) {
  await selectTab(page, 'new-game');
  await page.locator(`#panel-new-game [data-action="set-player-count"][data-player-count="${playerCount}"]`).click();
  const advancedButton = page.locator('#panel-new-game [data-action="toggle-advanced-solo"]');
  const shouldEnable = advancedSolo;
  const isEnabled = await advancedButton.textContent();
  const currentlyEnabled = isEnabled?.includes('✓') ?? false;
  if (currentlyEnabled !== shouldEnable) {
    await advancedButton.click();
  }
}

test.describe('Epic 3 automated QC', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('reviews displayed setup requirements across all supported player modes', async ({ page }) => {
    await seedAllOwnedState(page);

    for (const [playerCount, advancedSolo, expected] of [
      [1, false, { heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 }],
      [1, true, { heroCount: 4, villainGroupCount: 2, henchmanGroupCount: 1, wounds: 25 }],
      [2, false, { heroCount: 5, villainGroupCount: 2, henchmanGroupCount: 1, wounds: 30 }],
      [3, false, { heroCount: 5, villainGroupCount: 3, henchmanGroupCount: 1, wounds: 30 }],
      [4, false, { heroCount: 6, villainGroupCount: 3, henchmanGroupCount: 2, wounds: 35 }],
      [5, false, { heroCount: 6, villainGroupCount: 4, henchmanGroupCount: 2, wounds: 35 }]
    ]) {
      await setPlayerMode(page, playerCount, advancedSolo);
      const { setup } = await generateSetup(page);
      expect(setup.template.heroCount).toBe(expected.heroCount);
      expect(setup.template.villainGroupCount).toBe(expected.villainGroupCount);
      expect(setup.template.henchmanGroupCount).toBe(expected.henchmanGroupCount);
      expect(setup.template.wounds).toBe(expected.wounds);
      expect(setup.requirements.heroCount).toBeGreaterThanOrEqual(expected.heroCount);
      expect(setup.requirements.villainGroupCount).toBeGreaterThanOrEqual(expected.villainGroupCount);
      expect(setup.requirements.henchmanGroupCount).toBeGreaterThanOrEqual(expected.henchmanGroupCount);
      expect(setup.requirements.wounds).toBeGreaterThanOrEqual(expected.wounds);
    }
  });

  test('rejects thin collections such as Dimensions-heavy or low-henchman ownership selections', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const dimensionsSetIds = snapshot.runtime.sets.filter((set) => set.name.includes('Dimensions')).map((set) => set.id);
    const lowestHenchmanSetIds = [...snapshot.runtime.sets]
      .sort((left, right) => left.henchmanGroups.length - right.henchmanGroups.length)
      .slice(0, 2)
      .map((set) => set.id);

    for (const ownedSetIds of [dimensionsSetIds.length ? dimensionsSetIds : lowestHenchmanSetIds, lowestHenchmanSetIds]) {
      await configureOwnedSets(page, ownedSetIds);
      await setPlayerMode(page, 5, false);
      const result = await generateSetup(page);
      expect(result.setup).toBeNull();
      expect(result.error).toContain('Need at least');
    }
  });

  test('inspects three scheme edge cases with special setup rules', async ({ page }) => {
    await prepareTargetedState(page, { schemeNames: ['Secret Invasion of the Skrull Shapeshifters'] });
    await setPlayerMode(page, 1, false);
    let result = await generateSetup(page);
    expect(result.setup.scheme.name).toBe('Secret Invasion of the Skrull Shapeshifters');
    expect(result.setup.requirements.heroCount).toBe(6);
    expect(result.setup.villainGroups.some((group) => group.forced)).toBeTruthy();

    await prepareTargetedState(page, { schemeNames: ['Negative Zone Prison Breakout'] });
    await setPlayerMode(page, 1, false);
    result = await generateSetup(page);
    expect(result.setup.scheme.name).toBe('Negative Zone Prison Breakout');
    expect(result.setup.requirements.henchmanGroupCount).toBe(2);

    await prepareTargetedState(page, { schemeNames: ['Break the Planet Asunder'] });
    await setPlayerMode(page, 2, false);
    result = await generateSetup(page);
    expect(result.setup.scheme.name).toBe('Break the Planet Asunder');
    expect(result.setup.requirements.heroCount).toBe(7);
  });

  test('inspects Red Skull, Dr. Doom, and another mastermind lead edge case', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const extraLeadMastermind = snapshot.runtime.indexes.allMasterminds.find((entity) => entity.lead && !['Red Skull', 'Dr. Doom'].includes(entity.name));

    await prepareTargetedState(page, { mastermindNames: ['Red Skull'] });
    let result = await generateSetup(page);
    expect(result.setup.mastermind.name).toBe('Red Skull');
    expect(result.setup.mastermind.leadCategory).toBe('villains');
    expect(result.setup.villainGroups.some((group) => group.id === result.setup.mastermind.leadEntityId && group.forced)).toBeTruthy();

    await prepareTargetedState(page, { mastermindNames: ['Dr. Doom'] });
    result = await generateSetup(page);
    expect(result.setup.mastermind.name).toBe('Dr. Doom');
    expect(result.setup.mastermind.leadCategory).toBe('henchmen');
    expect(result.setup.henchmanGroups.some((group) => group.id === result.setup.mastermind.leadEntityId && group.forced)).toBeTruthy();

    await prepareTargetedState(page, { mastermindNames: [extraLeadMastermind.name] });
    result = await generateSetup(page);
    expect(result.setup.mastermind.name).toBe(extraLeadMastermind.name);
    expect(result.setup.mastermind.leadCategory).toBeTruthy();
  });

  test('inspects a 5-player setup under tight counts and keeps generate/regenerate ephemeral while surfacing fallback messaging', async ({ page }) => {
    await prepareTargetedState(page, { heroFreshCount: 2 });
    await setPlayerMode(page, 5, false);
    const stateBefore = JSON.stringify(await readAppState(page));

    let result = await generateSetup(page);
    expect(result.setup.requirements.heroCount).toBe(6);
    expect(new Set(result.setup.heroes.map((hero) => hero.id)).size).toBe(result.setup.heroes.length);
    expect(new Set(result.setup.villainGroups.map((group) => group.id)).size).toBe(result.setup.villainGroups.length);
    expect(result.setup.notices.some((notice) => notice.includes('Least-played fallback used for Hero selection'))).toBeTruthy();
    expect(JSON.stringify(await readAppState(page))).toBe(stateBefore);

    await page.locator('#panel-new-game [data-action="regenerate-setup"]').click();
    await page.waitForFunction(() => window.__CURRENT_SETUP__ !== null);
    result = await page.evaluate(() => ({ notices: window.__CURRENT_SETUP__.notices }));
    expect(result.notices.some((notice) => notice.includes('Least-played fallback used for Hero selection'))).toBeTruthy();
    expect(JSON.stringify(await readAppState(page))).toBe(stateBefore);
  });

  test('renders stored duplicate-name history records correctly from ID-only snapshots', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const blackWidows = snapshot.runtime.indexes.allHeroes.filter((hero) => hero.name === 'Black Widow');
    const thor = snapshot.runtime.indexes.allHeroes.find((hero) => hero.name === 'Thor');
    const mastermind = snapshot.runtime.indexes.allMasterminds.find((entity) => entity.name === 'Dr. Doom') || snapshot.runtime.indexes.allMasterminds[0];
    const scheme = snapshot.runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters') || snapshot.runtime.indexes.allSchemes[0];

    const state = await readAppState(page);
    state.collection.ownedSetIds = snapshot.runtime.sets.map((set) => set.id);
    state.history = [{
      id: 'qc-duplicate-history-record',
      createdAt: new Date().toISOString(),
      playerCount: 2,
      advancedSolo: false,
      setupSnapshot: {
        mastermindId: mastermind.id,
        schemeId: scheme.id,
        heroIds: [blackWidows[0].id, blackWidows[1].id, thor.id, snapshot.runtime.indexes.allHeroes[0].id, snapshot.runtime.indexes.allHeroes[1].id],
        villainGroupIds: snapshot.runtime.indexes.allVillainGroups.slice(0, 2).map((group) => group.id),
        henchmanGroupIds: snapshot.runtime.indexes.allHenchmanGroups.slice(0, 1).map((group) => group.id)
      }
    }];
    await writeAppState(page, state);
    await reloadApp(page);

    await selectTab(page, 'history');
    await page.locator('#panel-history .history-item summary').first().click();
    const historyText = await page.locator('#panel-history .history-item').first().textContent();
    expect((historyText.match(/Black Widow/g) || []).length).toBeGreaterThanOrEqual(2);
  });
});

