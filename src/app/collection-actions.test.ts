import { test, beforeEach } from 'vitest';
import { vi } from 'vitest';
import assert from 'node:assert/strict';
import { toast } from 'svelte-sonner';
import { createCollectionActions } from './collection-actions.ts';
import { createStorageAdapter } from './storage-adapter.ts';
import { createMemoryStorage } from './test-utils.ts';

vi.mock('svelte-sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  }
}));

beforeEach(() => { vi.clearAllMocks(); });

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

test('setActiveSetIds calls applyStateUpdate', () => {
  const deps = makeDeps();
  const actions = createCollectionActions(deps);
  actions.setActiveSetIds(['core-set']);
  assert.equal(deps.applyStateUpdate.mock.calls.length, 1);
});

test('clearActiveSetIds calls applyStateUpdate', () => {
  const deps = makeDeps();
  const actions = createCollectionActions(deps);
  actions.clearActiveSetIds();
  assert.equal(deps.applyStateUpdate.mock.calls.length, 1);
});

test('deactivateAllSets calls applyStateUpdate', () => {
  const deps = makeDeps();
  const actions = createCollectionActions(deps);
  actions.deactivateAllSets();
  assert.equal(deps.applyStateUpdate.mock.calls.length, 1);
});

test('confirmResetOwnedCollection clears flag, clears picks and setup, applies state update, and calls toast.success', () => {
  const deps = makeDeps();
  deps.ui.confirmResetOwnedCollection = true;
  const actions = createCollectionActions(deps);
  actions.confirmResetOwnedCollection();
  assert.equal(deps.ui.confirmResetOwnedCollection, false);
  assert.equal(deps.clearForcedPicksState.mock.calls.length, 1);
  assert.equal(deps.clearGeneratedSetup.mock.calls.length, 1);
  assert.equal(deps.applyStateUpdate.mock.calls.length, 1);
  assert.equal((toast.success as ReturnType<typeof vi.fn>).mock.calls.length, 1);
});

test('requestResetAllState sets confirmResetAllState and calls focusModalCancelButton', () => {
  const deps = makeDeps();
  const actions = createCollectionActions(deps);
  actions.requestResetAllState();
  assert.equal(deps.ui.confirmResetAllState, true);
  assert.equal(deps.ui.modalReturnFocusAction, 'request-reset-all-state');
  assert.equal(deps.focusModalCancelButton.mock.calls.length, 1);
});

test('cancelResetAllState clears confirmResetAllState and calls focusActionButton', () => {
  const deps = makeDeps();
  deps.ui.confirmResetAllState = true;
  deps.ui.modalReturnFocusAction = 'request-reset-all-state';
  const actions = createCollectionActions(deps);
  actions.cancelResetAllState();
  assert.equal(deps.ui.confirmResetAllState, false);
  assert.equal(deps.focusActionButton.mock.calls.length, 1);
});

test('resetAllState calls toast.warning when save succeeds', () => {
  const storageAdapter = createStorageAdapter(createMemoryStorage());
  const deps = makeDeps({ getStorageAdapter: vi.fn(() => storageAdapter) });
  const actions = createCollectionActions(deps);
  actions.resetAllState();
  assert.equal(deps.ui.confirmResetAllState, false);
  assert.equal(deps.syncUiFromPersistedState.mock.calls.length, 1);
  const warnCalls = (toast.warning as ReturnType<typeof vi.fn>).mock.calls;
  assert.equal(warnCalls.length, 1);
  assert.equal(warnCalls[0].length, 1, 'toast.warning called with only one argument when save succeeds');
});

test('resetAllState calls toast.warning with Infinity duration when storage is unavailable', () => {
  const storageAdapter = createStorageAdapter(null);
  const deps = makeDeps({ getStorageAdapter: vi.fn(() => storageAdapter) });
  const actions = createCollectionActions(deps);
  actions.resetAllState();
  const warnCalls = (toast.warning as ReturnType<typeof vi.fn>).mock.calls;
  assert.equal(warnCalls.length, 1);
  assert.deepEqual(warnCalls[0][1], { duration: Infinity });
});

test('resetAllState calls toast.error with Infinity duration when remove fails but storage is available', () => {
  const failingAdapter = {
    available: true,
    message: null,
    getItem: () => null,
    setItem: () => ({ ok: true, storageAvailable: true, message: '' }),
    removeItem: () => ({ ok: false, storageAvailable: true, message: 'Disk full.' })
  };
  const deps = makeDeps({ getStorageAdapter: vi.fn(() => failingAdapter) });
  const actions = createCollectionActions(deps);
  actions.resetAllState();
  const errorCalls = (toast.error as ReturnType<typeof vi.fn>).mock.calls;
  assert.equal(errorCalls.length, 1);
  assert.deepEqual(errorCalls[0][1], { duration: Infinity });
});
