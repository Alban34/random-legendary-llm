// src/app/collection-actions.ts
// Action factory for collection and reset operations — extracted from App.svelte (F-02).

import { toast } from 'svelte-sonner';
import {
  toggleOwnedSet as toggleOwnedSetStore,
  setActiveSetIds as setActiveSetIdsStore,
  clearActiveSetIds as clearActiveSetIdsStore,
  deactivateAllSets as deactivateAllSetsStore,
  resetAllState as resetAllStateStore,
  resetOwnedCollection
} from './state-store.ts';
import { DEFAULT_TAB_ID } from './app-tabs.ts';
import type { AppState, LocaleTools, StorageAdapter } from './types.ts';

interface CollectionActionDeps {
  getLocale: () => LocaleTools;
  getStorageAdapter: () => StorageAdapter | null;
  applyStateUpdate: (updater: (s: AppState) => AppState, notice: string) => void;
  syncUiFromPersistedState: (state: AppState) => void;
  clearGeneratedSetup: () => void;
  clearForcedPicksState: () => void;
  focusActionButton: (action: string) => void;
  focusModalCancelButton: () => void;
  ui: {
    lastActionNotice: string | null;
    confirmResetOwnedCollection: boolean;
    confirmResetAllState: boolean;
    modalReturnFocusAction: string | null;
    selectedTab: string;
  };
  persistence: {
    updateNotices: string[];
    lastSaveMessage: string | null;
    lastSaveOk: boolean | null;
  };
}

export function createCollectionActions(deps: CollectionActionDeps) {
  return {
    toggleOwnedSet(setId: string) {
      deps.clearGeneratedSetup();
      deps.ui.confirmResetOwnedCollection = false;
      deps.ui.confirmResetAllState = false;
      deps.applyStateUpdate(
        (currentState: AppState) => toggleOwnedSetStore(currentState, setId),
        deps.getLocale().t('actions.updatedOwnedCollection')
      );
    },

    setActiveSetIds(ids: string[]) {
      deps.applyStateUpdate(
        (currentState: AppState) => setActiveSetIdsStore(currentState, ids),
        deps.getLocale().t('actions.updatedActiveFilter')
      );
    },

    clearActiveSetIds() {
      deps.applyStateUpdate(
        (currentState: AppState) => clearActiveSetIdsStore(currentState),
        deps.getLocale().t('actions.clearedActiveFilter')
      );
    },

    deactivateAllSets() {
      deps.applyStateUpdate(
        (currentState: AppState) => deactivateAllSetsStore(currentState),
        deps.getLocale().t('actions.clearedActiveFilter')
      );
    },

    requestResetOwnedCollection() {
      deps.ui.confirmResetOwnedCollection = true;
      deps.ui.modalReturnFocusAction = 'request-reset-owned-collection';
      deps.ui.lastActionNotice = deps.getLocale().t('actions.confirmResetCollection');
      deps.focusModalCancelButton();
    },

    cancelResetOwnedCollection() {
      deps.ui.confirmResetOwnedCollection = false;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.keptCollection');
      deps.focusActionButton(deps.ui.modalReturnFocusAction ?? '');
    },

    confirmResetOwnedCollection() {
      deps.ui.confirmResetOwnedCollection = false;
      deps.clearForcedPicksState();
      deps.clearGeneratedSetup();
      deps.applyStateUpdate(
        (currentState: AppState) => resetOwnedCollection(currentState),
        deps.getLocale().t('actions.clearedCollection')
      );
      toast.success(deps.getLocale().t('actions.clearedCollection'));
    },

    requestResetAllState() {
      deps.ui.confirmResetAllState = true;
      deps.ui.modalReturnFocusAction = 'request-reset-all-state';
      deps.ui.lastActionNotice = deps.getLocale().t('actions.confirmResetAll');
      deps.focusModalCancelButton();
    },

    cancelResetAllState() {
      deps.ui.confirmResetAllState = false;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.keptState');
      deps.focusActionButton(deps.ui.modalReturnFocusAction ?? '');
    },

    resetAllState() {
      deps.ui.confirmResetAllState = false;
      const result = resetAllStateStore({ storageAdapter: deps.getStorageAdapter()! });
      deps.persistence.updateNotices = result.notices;
      deps.persistence.lastSaveMessage = result.save.message;
      deps.persistence.lastSaveOk = result.save.ok;
      deps.syncUiFromPersistedState(result.state);
      deps.ui.selectedTab = DEFAULT_TAB_ID;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.resetAllDefaults');
      if (result.save.ok) {
        toast.warning(deps.getLocale().t('actions.resetAllDefaults'));
      } else if (result.save.storageAvailable === false) {
        toast.warning(result.save.message, { duration: Infinity });
      } else {
        toast.error(result.save.message, { duration: Infinity });
      }
    }
  };
}
