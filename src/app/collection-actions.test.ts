import { test } from 'vitest';
import { vi } from 'vitest';
import assert from 'node:assert/strict';
import { createCollectionActions } from './collection-actions.ts';

function makeDeps(overrides = {}) {
  const locale = {
    t: vi.fn((key) => key)
  };
  const deps = {
    getLocale: vi.fn(() => locale),
    getStorageAdapter: vi.fn(() => null),
    applyStateUpdate: vi.fn(),
    syncUiFromPersistedState: vi.fn(),
    clearGeneratedSetup: vi.fn(),
    clearForcedPicksState: vi.fn(),
    focusActionButton: vi.fn(),
    focusModalCancelButton: vi.fn(),
    ui: {
      lastActionNotice: null,
      confirmResetOwnedCollection: false,
      confirmResetAllState: false,
      modalReturnFocusAction: null,
      selectedTab: 'collection'
    },
    persistence: {
      updateNotices: [],
      lastSaveMessage: null,
      lastSaveOk: null
    },
    ...overrides
  };
  return deps;
}

test('createCollectionActions returns an object with the expected action function names', () => {
  const deps = makeDeps();
  const actions = createCollectionActions(deps);
  assert.equal(typeof actions.toggleOwnedSet, 'function');
  assert.equal(typeof actions.setActiveSetIds, 'function');
  assert.equal(typeof actions.clearActiveSetIds, 'function');
  assert.equal(typeof actions.deactivateAllSets, 'function');
  assert.equal(typeof actions.requestResetOwnedCollection, 'function');
  assert.equal(typeof actions.cancelResetOwnedCollection, 'function');
  assert.equal(typeof actions.confirmResetOwnedCollection, 'function');
  assert.equal(typeof actions.requestResetAllState, 'function');
  assert.equal(typeof actions.cancelResetAllState, 'function');
  assert.equal(typeof actions.resetAllState, 'function');
});

test('toggleOwnedSet calls clearGeneratedSetup and applyStateUpdate', () => {
  const deps = makeDeps();
  const actions = createCollectionActions(deps);
  actions.toggleOwnedSet('core-set');
  assert.equal(deps.clearGeneratedSetup.mock.calls.length, 1);
  assert.equal(deps.applyStateUpdate.mock.calls.length, 1);
  assert.equal(deps.ui.confirmResetOwnedCollection, false);
  assert.equal(deps.ui.confirmResetAllState, false);
});

test('requestResetOwnedCollection sets confirmResetOwnedCollection and calls focusModalCancelButton', () => {
  const deps = makeDeps();
  const actions = createCollectionActions(deps);
  actions.requestResetOwnedCollection();
  assert.equal(deps.ui.confirmResetOwnedCollection, true);
  assert.equal(deps.ui.modalReturnFocusAction, 'request-reset-owned-collection');
  assert.equal(deps.focusModalCancelButton.mock.calls.length, 1);
});

test('cancelResetOwnedCollection clears the confirm flag and calls focusActionButton', () => {
  const deps = makeDeps();
  deps.ui.confirmResetOwnedCollection = true;
  deps.ui.modalReturnFocusAction = 'request-reset-owned-collection';
  const actions = createCollectionActions(deps);
  actions.cancelResetOwnedCollection();
  assert.equal(deps.ui.confirmResetOwnedCollection, false);
  assert.equal(deps.focusActionButton.mock.calls.length, 1);
});
