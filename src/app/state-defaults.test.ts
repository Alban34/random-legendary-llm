import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  createDefaultState,
  USAGE_CATEGORIES
} from './state-defaults.ts';

test('Default root state matches the expected schema', () => {

  const state = createDefaultState();

  assert.equal(state.schemaVersion, 1);
  assert.deepEqual(state.collection, { ownedSetIds: [], activeSetIds: null });
  assert.deepEqual(state.usage, {
    heroes: {},
    masterminds: {},
    villainGroups: {},
    henchmanGroups: {},
    schemes: {}
  });
  assert.deepEqual(state.history, []);
  assert.deepEqual(state.preferences, {
    lastPlayerCount: 1,
    lastAdvancedSolo: false,
    lastPlayMode: 'standard',
    selectedTab: null,
    onboardingCompleted: false,
    themeId: 'dark',
    localeId: 'en-US'
  });
});

test('Exposes all documented usage categories', () => {

  assert.deepEqual(USAGE_CATEGORIES, ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes']);
});

test('createDefaultState produces activeSetIds: null', () => {

  const state = createDefaultState();
  assert.equal(state.collection.activeSetIds, null);
});
