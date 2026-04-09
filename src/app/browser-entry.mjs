import { createEpic1Bundle } from './game-data-pipeline.mjs';
import { renderBundle, renderInitializationError } from './app-renderer.mjs';
import {
  STORAGE_KEY,
  acceptGameSetup,
  createStorageAdapter,
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

function buildPoolsFromSets(sets) {
  return sets.reduce((accumulator, set) => {
    accumulator.heroes.push(...set.heroes);
    accumulator.masterminds.push(...set.masterminds);
    accumulator.villainGroups.push(...set.villainGroups);
    accumulator.henchmanGroups.push(...set.henchmanGroups);
    accumulator.schemes.push(...set.schemes);
    return accumulator;
  }, {
    heroes: [],
    masterminds: [],
    villainGroups: [],
    henchmanGroups: [],
    schemes: []
  });
}

function pickDistinct(pool, count, offset = 0) {
  if (pool.length === 0 || count <= 0) {
    return [];
  }

  const picks = [];
  const usedIds = new Set();
  let cursor = offset;

  while (picks.length < Math.min(count, pool.length)) {
    const candidate = pool[cursor % pool.length];
    cursor += 1;
    if (usedIds.has(candidate.id)) {
      continue;
    }
    usedIds.add(candidate.id);
    picks.push(candidate);
  }

  return picks;
}

function buildSampleAcceptedGame(bundle, state) {
  const ownedSetIds = new Set(state.collection.ownedSetIds);
  const ownedSets = bundle.runtime.sets.filter((set) => ownedSetIds.has(set.id));
  const ownedPools = buildPoolsFromSets(ownedSets);
  const globalPools = buildPoolsFromSets(bundle.runtime.sets);
  const canUseOwnedPools = ownedPools.heroes.length >= 3
    && ownedPools.masterminds.length >= 1
    && ownedPools.villainGroups.length >= 1
    && ownedPools.henchmanGroups.length >= 1
    && ownedPools.schemes.length >= 1;

  const pools = canUseOwnedPools ? ownedPools : globalPools;
  const offset = state.history.length;
  const heroes = pickDistinct(pools.heroes, 3, offset).map((entity) => entity.id);
  const villainGroups = pickDistinct(pools.villainGroups, 1, offset).map((entity) => entity.id);
  const henchmanGroups = pickDistinct(pools.henchmanGroups, 1, offset).map((entity) => entity.id);
  const masterminds = pickDistinct(pools.masterminds, 1, offset);
  const schemes = pickDistinct(pools.schemes, 1, offset);

  return {
    config: {
      playerCount: 1,
      advancedSolo: false,
      setupSnapshot: {
        mastermindId: masterminds[0].id,
        schemeId: schemes[0].id,
        heroIds: heroes,
        villainGroupIds: villainGroups,
        henchmanGroupIds: henchmanGroups
      }
    },
    notice: canUseOwnedPools
      ? 'Logged a sample accepted game using the currently owned collection.'
      : ownedSetIds.size > 0
        ? 'Owned sets were insufficient for a sample accepted game, so the demo used the full catalog fallback.'
        : 'No owned sets are selected yet, so the demo used the full catalog.'
  };
}

function syncDebugGlobals(viewModel) {
  window.__EPIC1 = viewModel.bundle;
  window.__APP_STATE__ = viewModel.state;
  window.__APP_PERSISTENCE__ = viewModel.persistence;
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
      lastActionNotice: null
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

  const actions = {
    toggleOwnedSet(setId) {
      applyStateUpdate((currentState) => toggleOwnedSet(currentState, setId), 'Updated owned collection state.');
    },
    logSampleAcceptedGame() {
      const sampleGame = buildSampleAcceptedGame(bundle, viewModel.state);
      applyStateUpdate((currentState) => acceptGameSetup(currentState, sampleGame.config), sampleGame.notice);
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
    }
  };

  rerender();
}

boot().catch((error) => {
  console.error(error);
  window.__EPIC1_ERROR__ = error;
  renderInitializationError(document, error);
});

