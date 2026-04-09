import { createEpic1Bundle } from './game-data-pipeline.mjs';
import { DEFAULT_TAB_ID, getAdjacentTabId, normalizeSelectedTab } from './app-tabs.mjs';
import { renderBundle, renderInitializationError } from './app-renderer.mjs';
import { buildHistoryReadySetupSnapshot, generateSetup } from './setup-generator.mjs';
import {
  STORAGE_KEY,
  acceptGameSetup,
  createStorageAdapter,
  createDefaultState,
  hydrateState,
  resetAllState,
  resetUsageCategory,
  toggleOwnedSet,
  updateState
} from './state-store.mjs';

async function loadSeed() {
  const seedUrl = new URL('../data/canonical-game-data.json', import.meta.url);
  const response = await fetch(seedUrl);
  if (!response.ok) {
    throw new Error(`Unable to load canonical game data (${response.status} ${response.statusText})`);
  }
  return response.json();
}

function syncDebugGlobals(viewModel) {
  window.__EPIC1 = viewModel.bundle;
  window.__APP_STATE__ = viewModel.state;
  window.__APP_PERSISTENCE__ = viewModel.persistence;
  window.__CURRENT_SETUP__ = viewModel.ui.currentSetup;
  window.__ACTIVE_TAB__ = viewModel.ui.selectedTab;
}

async function boot() {
  const seed = await loadSeed();
  const bundle = createEpic1Bundle(seed);
  const storageAdapter = createStorageAdapter(globalThis.localStorage);
  const hydration = hydrateState({ storageAdapter, indexes: bundle.runtime.indexes });
  const viewModel = {
    bundle,
    state: hydration.state,
    persistence: {
      storageAvailable: hydration.storageAvailable,
      hydratedFromStorage: hydration.hydratedFromStorage,
      recoveredOnLoad: hydration.recovered,
      hydrateNotices: hydration.notices,
      updateNotices: [],
      lastSaveMessage: null,
      lastSaveOk: null
    },
    ui: {
      lastActionNotice: null,
      generatorError: null,
      generatorNotices: [],
      currentSetup: null,
      selectedTab: normalizeSelectedTab(hydration.state.preferences.selectedTab),
      selectedPlayerCount: hydration.state.preferences.lastPlayerCount,
      advancedSolo: hydration.state.preferences.lastAdvancedSolo
    }
  };

  const rerender = () => {
    syncDebugGlobals(viewModel);
    renderBundle(document, viewModel, actions);
  };

  const applyStateUpdate = (updater, actionNotice) => {
    const result = updateState({
      storageAdapter,
      indexes: bundle.runtime.indexes,
      currentState: viewModel.state,
      updater
    });

    viewModel.state = result.state;
    viewModel.persistence.updateNotices = result.notices;
    viewModel.persistence.lastSaveMessage = result.save.message;
    viewModel.persistence.lastSaveOk = result.save.ok;
    viewModel.ui.lastActionNotice = actionNotice;
    rerender();
  };

  const clearGeneratedSetup = () => {
    viewModel.ui.currentSetup = null;
    viewModel.ui.generatorError = null;
    viewModel.ui.generatorNotices = [];
  };

  const persistPreferences = (playerCount, advancedSolo, actionNotice) => {
    viewModel.ui.selectedPlayerCount = playerCount;
    viewModel.ui.advancedSolo = advancedSolo;
    clearGeneratedSetup();
    applyStateUpdate((currentState) => {
      currentState.preferences.lastPlayerCount = playerCount;
      currentState.preferences.lastAdvancedSolo = advancedSolo;
      return currentState;
    }, actionNotice);
  };

  const persistSelectedTab = (tabId, actionNotice) => {
    const normalizedTabId = normalizeSelectedTab(tabId);
    viewModel.ui.selectedTab = normalizedTabId;
    applyStateUpdate((currentState) => {
      currentState.preferences.selectedTab = normalizedTabId;
      return currentState;
    }, actionNotice);
  };

  const actions = {
    selectTab(tabId) {
      persistSelectedTab(tabId, `Switched to the ${normalizeSelectedTab(tabId)} tab.`);
    },
    handleTabKeydown(tabId, key) {
      const normalizedTabId = normalizeSelectedTab(tabId);
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        persistSelectedTab(getAdjacentTabId(normalizedTabId, 'next'), 'Switched tabs with keyboard navigation.');
        return;
      }
      if (key === 'ArrowLeft' || key === 'ArrowUp') {
        persistSelectedTab(getAdjacentTabId(normalizedTabId, 'previous'), 'Switched tabs with keyboard navigation.');
        return;
      }
      if (key === 'Home') {
        persistSelectedTab(getAdjacentTabId(normalizedTabId, 'first'), 'Jumped to the first tab with keyboard navigation.');
        return;
      }
      if (key === 'End') {
        persistSelectedTab(getAdjacentTabId(normalizedTabId, 'last'), 'Jumped to the last tab with keyboard navigation.');
      }
    },
    toggleOwnedSet(setId) {
      clearGeneratedSetup();
      applyStateUpdate((currentState) => toggleOwnedSet(currentState, setId), 'Updated owned collection state. Generate a new setup to use the current collection.');
    },
    setPlayerCount(playerCount) {
      const advancedSolo = playerCount === 1 ? viewModel.ui.advancedSolo : false;
      persistPreferences(playerCount, advancedSolo, `Selected ${playerCount} player${playerCount === 1 ? '' : 's'} setup mode.`);
    },
    toggleAdvancedSolo() {
      if (viewModel.ui.selectedPlayerCount !== 1) {
        viewModel.ui.lastActionNotice = 'Advanced Solo is only available for 1 player.';
        rerender();
        return;
      }
      persistPreferences(
        viewModel.ui.selectedPlayerCount,
        !viewModel.ui.advancedSolo,
        `${!viewModel.ui.advancedSolo ? 'Enabled' : 'Disabled'} Advanced Solo mode.`
      );
    },
    generateSetup() {
      try {
        const setup = generateSetup({
          runtime: bundle.runtime,
          state: viewModel.state,
          playerCount: viewModel.ui.selectedPlayerCount,
          advancedSolo: viewModel.ui.advancedSolo
        });
        viewModel.ui.currentSetup = setup;
        viewModel.ui.generatorError = null;
        viewModel.ui.generatorNotices = setup.notices;
        viewModel.ui.lastActionNotice = 'Generated a new setup without mutating persisted usage or history.';
      } catch (error) {
        viewModel.ui.currentSetup = null;
        viewModel.ui.generatorNotices = [];
        viewModel.ui.generatorError = error.message;
        viewModel.ui.lastActionNotice = 'Could not generate a legal setup for the current collection.';
      }
      rerender();
    },
    regenerateSetup() {
      actions.generateSetup();
      if (!viewModel.ui.generatorError) {
        viewModel.ui.lastActionNotice = 'Regenerated the current setup without mutating persisted state.';
        rerender();
      }
    },
    acceptCurrentSetup() {
      if (!viewModel.ui.currentSetup) {
        viewModel.ui.lastActionNotice = 'Generate a setup before using Accept & Log.';
        rerender();
        return;
      }
      applyStateUpdate((currentState) => acceptGameSetup(currentState, {
        playerCount: viewModel.ui.selectedPlayerCount,
        advancedSolo: viewModel.ui.advancedSolo,
        setupSnapshot: buildHistoryReadySetupSnapshot(viewModel.ui.currentSetup)
      }), 'Accepted & logged the current generated setup.');
    },
    resetUsageCategory(category) {
      applyStateUpdate((currentState) => resetUsageCategory(currentState, category), `Reset ${category} usage stats.`);
    },
    resetAllState() {
      const result = resetAllState({ storageAdapter });
      viewModel.state = result.state;
      viewModel.persistence.updateNotices = result.notices;
      viewModel.persistence.lastSaveMessage = result.save.message;
      viewModel.persistence.lastSaveOk = result.save.ok;
      viewModel.ui.selectedTab = DEFAULT_TAB_ID;
      viewModel.ui.selectedPlayerCount = result.state.preferences.lastPlayerCount;
      viewModel.ui.advancedSolo = result.state.preferences.lastAdvancedSolo;
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = 'Reset the entire application state to defaults.';
      rerender();
    },
    corruptSavedState() {
      const save = storageAdapter.setItem(STORAGE_KEY, '{ this-is-not-valid-json');
      viewModel.persistence.lastSaveMessage = save.message;
      viewModel.persistence.lastSaveOk = save.ok;
      viewModel.ui.lastActionNotice = save.ok
        ? 'Wrote corrupted JSON to browser storage. Reload the page to verify recovery.'
        : 'Could not write corrupted JSON to browser storage.';
      rerender();
    },
    injectInvalidOwnedSet() {
      const corruptedState = JSON.parse(JSON.stringify(viewModel.state));
      corruptedState.collection.ownedSetIds = [...corruptedState.collection.ownedSetIds, 'definitely-missing-set'];
      const save = storageAdapter.setItem(STORAGE_KEY, JSON.stringify(corruptedState, null, 2));
      viewModel.persistence.lastSaveMessage = save.message;
      viewModel.persistence.lastSaveOk = save.ok;
      viewModel.ui.lastActionNotice = save.ok
        ? 'Wrote an invalid owned set ID to storage. Reload the page to verify safe cleanup.'
        : 'Could not write an invalid owned set ID to browser storage.';
      rerender();
    },
    clearToDefaults() {
      const defaultState = createDefaultState();
      viewModel.ui.selectedPlayerCount = defaultState.preferences.lastPlayerCount;
      viewModel.ui.advancedSolo = defaultState.preferences.lastAdvancedSolo;
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = 'Reset the current setup controls to their default values.';
      rerender();
    }
  };

  rerender();
}

boot().catch((error) => {
  console.error(error);
  window.__EPIC1_ERROR__ = error;
  renderInitializationError(document, error);
});
