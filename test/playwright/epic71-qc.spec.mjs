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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function seedXMenOwnedState(page) {
  const snapshot = await getRuntimeSnapshot(page);
  const xmenSet = snapshot.runtime.sets.find((s) => s.name === 'X-Men');
  if (!xmenSet) throw new Error('X-Men set not found in runtime data');
  const state = await readAppState(page);
  state.collection.ownedSetIds = [xmenSet.id];
  await writeAppState(page, state);
  await reloadApp(page);
}

async function seedNoEpicMastermindState(page) {
  // Own only Core Set and Dark City — no Epic Mastermind supported sets
  const snapshot = await getRuntimeSnapshot(page);
  const nonEpicSets = snapshot.runtime.sets
    .filter((s) => s.name === 'Core Set' || s.name === 'Dark City')
    .map((s) => s.id);
  const state = await readAppState(page);
  state.collection.ownedSetIds = nonEpicSets;
  await writeAppState(page, state);
  await reloadApp(page);
}

async function injectHistoryRecords(page, records) {
  const state = await readAppState(page);
  state.history = records;
  await writeAppState(page, state);
  await reloadApp(page);
}

function buildHistoryRecord(indexes, id, epicMastermind) {
  return {
    id,
    createdAt: '2026-05-01T12:00:00.000Z',
    playerCount: 1,
    advancedSolo: false,
    playMode: 'standard',
    epicMastermind,
    setupSnapshot: {
      mastermindId: indexes.allMasterminds[0].id,
      schemeId: indexes.allSchemes[0].id,
      heroIds: indexes.allHeroes.slice(0, 3).map((h) => h.id),
      villainGroupIds: [indexes.allVillainGroups[0].id],
      henchmanGroupIds: [indexes.allHenchmanGroups[0].id]
    },
    result: { status: 'pending', outcome: null, score: null, notes: '', updatedAt: null }
  };
}

// ---------------------------------------------------------------------------
// Story 71.3 — Epic Mastermind toggle visibility in setup view
// ---------------------------------------------------------------------------

test.describe('Epic 71.3 — Epic Mastermind toggle in New Game tab', () => {
  test('toggle is visible when a supported expansion (X-Men) is owned', async ({ page }) => {
    await gotoApp(page);
    await seedXMenOwnedState(page);
    await selectTab(page, 'new-game');

    await expect(page.locator('[data-epic-mastermind-toggle]')).toBeVisible();
  });

  test('toggle is absent from the DOM when no supported expansion is owned', async ({ page }) => {
    await gotoApp(page);
    await seedNoEpicMastermindState(page);
    await selectTab(page, 'new-game');

    await expect(page.locator('[data-epic-mastermind-toggle]')).not.toBeAttached();
  });

  test('toggle state survives a page reload', async ({ page }) => {
    await gotoApp(page);
    await seedXMenOwnedState(page);
    await selectTab(page, 'new-game');

    const toggle = page.locator('[data-epic-mastermind-toggle]');
    await expect(toggle).not.toBeChecked();

    await toggle.click();
    await expect(toggle).toBeChecked();

    await reloadApp(page);
    await selectTab(page, 'new-game');

    await expect(page.locator('[data-epic-mastermind-toggle]')).toBeChecked();
  });
});

// ---------------------------------------------------------------------------
// Story 71.5 — History indicator and Epic Mastermind grouping
// ---------------------------------------------------------------------------

test.describe('Epic 71.5 — History indicator and grouping mode', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await seedAllOwnedState(page);
  });

  test('Epic Mastermind indicator is visible on tagged entry and absent on untagged entry', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const indexes = snapshot.runtime.indexes;

    await injectHistoryRecords(page, [
      buildHistoryRecord(indexes, 'epic-game', true),
      buildHistoryRecord(indexes, 'standard-game', false)
    ]);

    await selectTab(page, 'history');

    const epicItem = page.locator('[data-history-record-id="epic-game"]');
    const standardItem = page.locator('[data-history-record-id="standard-game"]');

    await expect(epicItem.locator('[data-epic-mastermind-indicator]')).toBeVisible();
    await expect(standardItem.locator('[data-epic-mastermind-indicator]')).toHaveCount(0);
  });

  test('epic-mastermind grouping mode is present in the group-by controls', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const indexes = snapshot.runtime.indexes;

    await injectHistoryRecords(page, [buildHistoryRecord(indexes, 'one', true)]);
    await selectTab(page, 'history');

    await expect(
      page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="epic-mastermind"]')
    ).toBeVisible();
  });

  test('selecting epic-mastermind grouping produces exactly two group headings', async ({ page }) => {
    const snapshot = await getRuntimeSnapshot(page);
    const indexes = snapshot.runtime.indexes;

    await injectHistoryRecords(page, [
      buildHistoryRecord(indexes, 'epic-one', true),
      buildHistoryRecord(indexes, 'standard-one', false)
    ]);

    await selectTab(page, 'history');
    await page.locator('[data-action="set-history-grouping"][data-history-grouping-mode="epic-mastermind"]').click();

    await expect(page.locator('[data-history-group-id]')).toHaveCount(2);
  });
});
