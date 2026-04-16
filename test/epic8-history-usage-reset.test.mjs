import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.mjs';
import { buildFullResetPreview, formatHistorySummary, summarizeUsageIndicators } from '../src/app/history-utils.mjs';
import { acceptGameSetup, createDefaultState, resetAllState, resetUsageCategory } from '../src/app/state-store.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

function createSampleSnapshot(offset = 0) {
  const indexes = bundle.runtime.indexes;
  return {
    mastermindId: indexes.allMasterminds[offset].id,
    schemeId: indexes.allSchemes[offset].id,
    heroIds: indexes.allHeroes.slice(offset, offset + 3).map((entity) => entity.id),
    villainGroupIds: [indexes.allVillainGroups[offset].id],
    henchmanGroupIds: [indexes.allHenchmanGroups[offset].id]
  };
}

function createMemoryStorage(initialEntries = {}) {
  const store = new Map(Object.entries(initialEntries));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

test('Epic 8 usage indicators reflect persisted usage statistics and never-played totals', () => {
  let state = createAllOwnedState();
  state = acceptGameSetup(state, {
    id: 'epic8-usage',
    createdAt: '2026-04-10T12:00:00.000Z',
    playerCount: 2,
    advancedSolo: false,
    setupSnapshot: createSampleSnapshot(0)
  });

  const indicators = summarizeUsageIndicators(bundle.runtime, state);
  const heroIndicator = indicators.find((indicator) => indicator.category === 'heroes');
  const mastermindIndicator = indicators.find((indicator) => indicator.category === 'masterminds');

  assert.equal(heroIndicator.used, 3);
  assert.equal(heroIndicator.neverPlayed, heroIndicator.total - 3);
  assert.equal(mastermindIndicator.used, 1);
  assert.equal(mastermindIndicator.label, 'Masterminds');
});

test('Epic 8 history summaries resolve IDs back to readable newest-first metadata', () => {
  let state = createAllOwnedState();
  state = acceptGameSetup(state, {
    id: 'older-game',
    createdAt: '2026-04-09T12:00:00.000Z',
    playerCount: 1,
    advancedSolo: true,
    setupSnapshot: createSampleSnapshot(0)
  });
  state = acceptGameSetup(state, {
    id: 'newer-game',
    createdAt: '2026-04-10T12:00:00.000Z',
    playerCount: 3,
    advancedSolo: false,
    setupSnapshot: createSampleSnapshot(1)
  });

  assert.equal(state.history[0].id, 'newer-game');
  const summary = formatHistorySummary(state.history[0], bundle.runtime.indexes);
  assert.equal(summary.playerLabel, '3 Players');
  assert.equal(summary.modeLabel, 'Standard');
  assert.equal(typeof summary.mastermindName, 'string');
  assert.equal(summary.heroNames.length, 3);
  assert.equal(summary.villainGroupNames.length, 1);
});

test('Epic 8 category resets and full reset preview/behavior stay scoped correctly', () => {
  let state = createAllOwnedState();
  state = acceptGameSetup(state, {
    id: 'reset-game',
    createdAt: '2026-04-10T12:00:00.000Z',
    playerCount: 2,
    advancedSolo: false,
    setupSnapshot: createSampleSnapshot(0)
  });

  const heroesReset = resetUsageCategory(state, 'heroes');
  assert.deepEqual(heroesReset.usage.heroes, {});
  assert.notDeepEqual(heroesReset.usage.masterminds, {});

  const preview = buildFullResetPreview();
  assert.deepEqual(preview, {
    collection: { ownedSetIds: [], activeSetIds: null },
    usage: {
      heroes: {},
      masterminds: {},
      villainGroups: {},
      henchmanGroups: {},
      schemes: {}
    },
    history: [],
    preferences: {
      lastPlayerCount: 1,
      lastAdvancedSolo: false,
      lastPlayMode: 'standard',
      selectedTab: null,
      onboardingCompleted: false,
      themeId: 'dark',
      localeId: 'en-US'
    }
  });

  const storageAdapter = createMemoryStorage();
  const fullReset = resetAllState({ storageAdapter });
  assert.deepEqual(fullReset.state, createDefaultState());
});

