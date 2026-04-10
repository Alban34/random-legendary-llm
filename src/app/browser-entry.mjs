import { createEpic1Bundle } from './game-data-pipeline.mjs';
import { DEFAULT_TAB_ID, getAdjacentTabId, normalizeSelectedTab } from './app-tabs.mjs';
import { buildBackupFilename, createBackupPayload, mergeImportedState, parseBackupText, summarizeBackupState } from './backup-utils.mjs';
import { createToastRecord, pushToast, removeToast, shouldAutoDismissToast } from './feedback-utils.mjs';
import { addForcedPick, createEmptyForcedPicks, hasForcedPicks, removeForcedPick } from './forced-picks-utils.mjs';
import { normalizeGameResultDraft, validateGameResultDraft } from './result-utils.mjs';
import { renderBundle, renderInitializationError } from './app-renderer.mjs';
import { buildHistoryReadySetupSnapshot, generateSetup } from './setup-generator.mjs';
import { resolvePlayMode } from './setup-rules.mjs';
import { THEME_OPTIONS, normalizeThemeId } from './theme-utils.mjs';
import {
  STORAGE_KEY,
  acceptGameSetup,
  createStorageAdapter,
  createGameRecordId,
  createDefaultState,
  hydrateState,
  resetAllState,
  resetOwnedCollection,
  resetUsageCategory,
  toggleOwnedSet,
  updateGameResult,
  updateState
} from './state-store.mjs';

function createEmptyResultDraft() {
  return {
    outcome: '',
    score: '',
    notes: ''
  };
}

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
  window.__BROWSE_UI__ = {
    searchTerm: viewModel.ui.browseSearchTerm,
    typeFilter: viewModel.ui.browseTypeFilter,
    expandedSetId: viewModel.ui.expandedBrowseSetId
  };
  window.__COLLECTION_UI__ = {
    confirmResetOwnedCollection: viewModel.ui.confirmResetOwnedCollection
  };
  window.__HISTORY_UI__ = {
    confirmResetAllState: viewModel.ui.confirmResetAllState,
    resultEditorRecordId: viewModel.ui.resultEditorRecordId,
    resultDraft: viewModel.ui.resultDraft,
    resultFormError: viewModel.ui.resultFormError
  };
  window.__ONBOARDING_UI__ = {
    visible: viewModel.ui.onboardingVisible,
    step: viewModel.ui.onboardingStep,
    aboutOpen: viewModel.ui.aboutPanelOpen,
    completed: viewModel.state.preferences.onboardingCompleted
  };
  window.__PLAY_MODE_UI__ = {
    playerCount: viewModel.ui.selectedPlayerCount,
    playMode: viewModel.ui.selectedPlayMode,
    advancedSolo: viewModel.ui.advancedSolo
  };
  window.__THEME_UI__ = {
    activeThemeId: viewModel.state.preferences.themeId,
    supportedThemes: THEME_OPTIONS.map((theme) => ({ id: theme.id, label: theme.label }))
  };
  window.__BACKUP_UI__ = {
    importError: viewModel.ui.backupImportError,
    stagedBackupSummary: viewModel.ui.stagedBackup?.summary || null,
    confirmRestoreMode: viewModel.ui.confirmBackupRestoreMode,
    lastExportFileName: viewModel.ui.lastBackupExportFileName || null
  };
  window.__FORCED_PICKS_UI__ = viewModel.ui.forcedPicks;
  window.__TOASTS__ = viewModel.ui.toasts;
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
      browseSearchTerm: '',
      browseTypeFilter: 'all',
      expandedBrowseSetId: null,
      confirmResetOwnedCollection: false,
      confirmResetAllState: false,
      modalReturnFocusAction: null,
      toasts: [],
      onboardingVisible: !hydration.state.preferences.onboardingCompleted,
      onboardingStep: 0,
      aboutPanelOpen: false,
      backupImportError: null,
      stagedBackup: null,
      confirmBackupRestoreMode: null,
      lastBackupExportFileName: null,
      forcedPicks: createEmptyForcedPicks(),
      resultEditorRecordId: null,
      resultDraft: createEmptyResultDraft(),
      resultFormError: null,
      selectedTab: normalizeSelectedTab(hydration.state.preferences.selectedTab),
      selectedPlayerCount: hydration.state.preferences.lastPlayerCount,
      selectedPlayMode: resolvePlayMode(hydration.state.preferences.lastPlayerCount, {
        advancedSolo: hydration.state.preferences.lastAdvancedSolo,
        playMode: hydration.state.preferences.lastPlayMode
      }),
      advancedSolo: hydration.state.preferences.lastAdvancedSolo
    }
  };
  const toastTimers = new Map();
  let nextToastId = 1;

  const clearToastTimer = (id) => {
    const record = toastTimers.get(id);
    if (!record) {
      return;
    }

    if (record.timeoutId) {
      clearTimeout(record.timeoutId);
    }
    toastTimers.delete(id);
  };

  const scheduleToastDismissal = (toast) => {
    if (!shouldAutoDismissToast(toast)) {
      return;
    }

    const record = {
      remainingMs: toast.autoDismissMs,
      timeoutId: null,
      startedAt: Date.now()
    };

    record.timeoutId = setTimeout(() => dismissToast(toast.id), record.remainingMs);
    toastTimers.set(toast.id, record);
  };

  const pauseToastDismissal = (id) => {
    const record = toastTimers.get(id);
    if (!record?.timeoutId) {
      return;
    }

    clearTimeout(record.timeoutId);
    record.remainingMs = Math.max(1000, record.remainingMs - (Date.now() - record.startedAt));
    record.timeoutId = null;
    toastTimers.set(id, record);
  };

  const resumeToastDismissal = (id) => {
    const record = toastTimers.get(id);
    if (!record || record.timeoutId) {
      return;
    }

    record.startedAt = Date.now();
    record.timeoutId = setTimeout(() => dismissToast(id), record.remainingMs);
    toastTimers.set(id, record);
  };

  const rerender = () => {
    syncDebugGlobals(viewModel);
    renderBundle(document, viewModel, actions);
  };

  const dismissToast = (id, options = {}) => {
    clearToastTimer(id);
    viewModel.ui.toasts = removeToast(viewModel.ui.toasts, id);
    rerender();
    if (options.focusToastId) {
      queueMicrotask(() => {
        document.querySelector(`[data-action="dismiss-toast"][data-toast-id="${options.focusToastId}"]`)?.focus();
      });
    }
  };

  const enqueueToast = ({ variant, message, behavior = 'transient' }) => {
    const toast = createToastRecord({ id: `toast-${nextToastId++}`, variant, message, behavior });
    const previousToasts = viewModel.ui.toasts;
    const nextToasts = pushToast(previousToasts, toast);
    const nextToastIds = new Set(nextToasts.map((entry) => entry.id));

    previousToasts.forEach((entry) => {
      if (!nextToastIds.has(entry.id)) {
        clearToastTimer(entry.id);
      }
    });

    viewModel.ui.toasts = nextToasts;
    rerender();

    if (nextToastIds.has(toast.id)) {
      scheduleToastDismissal(toast);
    }
  };

  const focusActionButton = (actionName) => {
    if (!actionName) {
      return;
    }
    queueMicrotask(() => {
      document.querySelector(`[data-action="${actionName}"]`)?.focus();
    });
  };

  const focusModalCancelButton = () => {
    queueMicrotask(() => {
      document.querySelector('#modal-root [data-modal-focus="cancel"]')?.focus();
    });
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
    result.notices.forEach((notice) => enqueueToast({ variant: 'warning', message: notice, behavior: 'persistent' }));
    if (!result.save.ok) {
      enqueueToast({
        variant: result.save.storageAvailable === false ? 'warning' : 'error',
        message: result.save.message,
        behavior: 'persistent'
      });
    }
    return result;
  };

  const clearGeneratedSetup = () => {
    viewModel.ui.currentSetup = null;
    viewModel.ui.generatorError = null;
    viewModel.ui.generatorNotices = [];
  };

  const clearForcedPicksState = () => {
    viewModel.ui.forcedPicks = createEmptyForcedPicks();
  };

  const clearBackupDraft = () => {
    viewModel.ui.backupImportError = null;
    viewModel.ui.stagedBackup = null;
    viewModel.ui.confirmBackupRestoreMode = null;
  };

  const syncUiFromPersistedState = (nextState) => {
    viewModel.ui.selectedTab = normalizeSelectedTab(nextState.preferences.selectedTab);
    viewModel.ui.selectedPlayerCount = nextState.preferences.lastPlayerCount;
    viewModel.ui.selectedPlayMode = resolvePlayMode(nextState.preferences.lastPlayerCount, {
      advancedSolo: nextState.preferences.lastAdvancedSolo,
      playMode: nextState.preferences.lastPlayMode
    });
    viewModel.ui.advancedSolo = nextState.preferences.lastAdvancedSolo;
    viewModel.ui.onboardingVisible = !nextState.preferences.onboardingCompleted;
    viewModel.ui.onboardingStep = 0;
    viewModel.ui.aboutPanelOpen = false;
    clearForcedPicksState();
    closeResultEditor();
    clearGeneratedSetup();
    clearBackupDraft();
  };

  const closeResultEditor = () => {
    viewModel.ui.resultEditorRecordId = null;
    viewModel.ui.resultDraft = createEmptyResultDraft();
    viewModel.ui.resultFormError = null;
  };

  const openResultEditor = (recordId) => {
    const record = viewModel.state.history.find((entry) => entry.id === recordId);
    if (!record) {
      return false;
    }

    viewModel.ui.resultEditorRecordId = recordId;
    viewModel.ui.resultDraft = normalizeGameResultDraft(record.result);
    viewModel.ui.resultFormError = null;
    return true;
  };

  const persistPreferences = (playerCount, playMode, actionNotice) => {
    const normalizedPlayMode = resolvePlayMode(playerCount, { playMode });
    const advancedSolo = normalizedPlayMode === 'advanced-solo';
    viewModel.ui.selectedPlayerCount = playerCount;
    viewModel.ui.selectedPlayMode = normalizedPlayMode;
    viewModel.ui.advancedSolo = advancedSolo;
    clearGeneratedSetup();
    applyStateUpdate((currentState) => {
      currentState.preferences.lastPlayerCount = playerCount;
      currentState.preferences.lastAdvancedSolo = advancedSolo;
      currentState.preferences.lastPlayMode = normalizedPlayMode;
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

  const completeOnboardingFlow = (actionNotice) => {
    viewModel.ui.onboardingVisible = false;
    viewModel.ui.onboardingStep = 0;
    applyStateUpdate((currentState) => {
      currentState.preferences.onboardingCompleted = true;
      return currentState;
    }, actionNotice);
  };

  const actions = {
    dismissToast,
    pauseToastDismissal,
    resumeToastDismissal,
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
      viewModel.ui.confirmResetOwnedCollection = false;
      viewModel.ui.confirmResetAllState = false;
      applyStateUpdate((currentState) => toggleOwnedSet(currentState, setId), 'Updated owned collection state. Generate a new setup to use the current collection.');
    },
    setBrowseSearchTerm(searchTerm) {
      viewModel.ui.browseSearchTerm = searchTerm;
      rerender();
    },
    setBrowseTypeFilter(typeFilter) {
      viewModel.ui.browseTypeFilter = typeFilter;
      rerender();
    },
    toggleAboutPanel() {
      viewModel.ui.aboutPanelOpen = !viewModel.ui.aboutPanelOpen;
      viewModel.ui.lastActionNotice = viewModel.ui.aboutPanelOpen
        ? 'Opened the About this project panel.'
        : 'Closed the About this project panel.';
      rerender();
    },
    startOnboarding() {
      viewModel.ui.onboardingVisible = true;
      viewModel.ui.onboardingStep = 0;
      viewModel.ui.aboutPanelOpen = false;
      viewModel.ui.lastActionNotice = 'Opened the introductory walkthrough.';
      if (viewModel.ui.selectedTab !== 'browse') {
        persistSelectedTab('browse', 'Returned to the Browse tab to replay the walkthrough.');
        return;
      }
      rerender();
    },
    previousOnboardingStep() {
      viewModel.ui.onboardingStep = Math.max(0, viewModel.ui.onboardingStep - 1);
      viewModel.ui.lastActionNotice = 'Moved to the previous walkthrough step.';
      rerender();
    },
    nextOnboardingStep() {
      viewModel.ui.onboardingStep = Math.min(3, viewModel.ui.onboardingStep + 1);
      viewModel.ui.lastActionNotice = 'Moved to the next walkthrough step.';
      rerender();
    },
    openOnboardingTab(tabId) {
      persistSelectedTab(tabId, `Opened the ${normalizeSelectedTab(tabId)} tab from the walkthrough.`);
    },
    skipOnboarding() {
      completeOnboardingFlow('Skipped the walkthrough. Replay it anytime from Browse.');
    },
    completeOnboarding() {
      completeOnboardingFlow('Completed the walkthrough. Replay it anytime from Browse.');
    },
    toggleBrowseSetExpanded(setId) {
      viewModel.ui.expandedBrowseSetId = viewModel.ui.expandedBrowseSetId === setId ? null : setId;
      rerender();
    },
    requestResetOwnedCollection() {
      viewModel.ui.confirmResetOwnedCollection = true;
      viewModel.ui.modalReturnFocusAction = 'request-reset-owned-collection';
      viewModel.ui.lastActionNotice = 'Confirm clearing the owned collection to remove all current selections.';
      rerender();
      focusModalCancelButton();
    },
    cancelResetOwnedCollection() {
      viewModel.ui.confirmResetOwnedCollection = false;
      viewModel.ui.lastActionNotice = 'Kept the current owned collection selections.';
      rerender();
      focusActionButton(viewModel.ui.modalReturnFocusAction);
    },
    confirmResetOwnedCollection() {
      viewModel.ui.confirmResetOwnedCollection = false;
      clearForcedPicksState();
      clearGeneratedSetup();
      applyStateUpdate((currentState) => resetOwnedCollection(currentState), 'Cleared all owned collection selections.');
      enqueueToast({ variant: 'success', message: 'Cleared all owned collection selections.' });
    },
    requestResetAllState() {
      viewModel.ui.confirmResetAllState = true;
      viewModel.ui.modalReturnFocusAction = 'request-reset-all-state';
      viewModel.ui.lastActionNotice = 'Confirm the full reset to clear collection, usage, history, and preferences.';
      rerender();
      focusModalCancelButton();
    },
    cancelResetAllState() {
      viewModel.ui.confirmResetAllState = false;
      viewModel.ui.lastActionNotice = 'Kept the current persisted application state.';
      rerender();
      focusActionButton(viewModel.ui.modalReturnFocusAction);
    },
    setPlayerCount(playerCount) {
      const playMode = playerCount === 1 ? viewModel.ui.selectedPlayMode : 'standard';
      persistPreferences(playerCount, playMode, `Selected ${playerCount} player${playerCount === 1 ? '' : 's'} setup mode.`);
    },
    setPlayMode(playMode) {
      if (viewModel.ui.selectedPlayerCount !== 1 && playMode !== 'standard') {
        viewModel.ui.lastActionNotice = 'Alternate solo modes are only available for 1 player.';
        rerender();
        enqueueToast({ variant: 'warning', message: 'Alternate solo modes are only available for 1 player.' });
        return;
      }
      persistPreferences(viewModel.ui.selectedPlayerCount, playMode, `Selected ${playMode.replaceAll('-', ' ')} mode.`);
    },
    setTheme(themeId) {
      const normalizedThemeId = normalizeThemeId(themeId);
      if (viewModel.state.preferences.themeId === normalizedThemeId) {
        return;
      }

      applyStateUpdate((currentState) => {
        currentState.preferences.themeId = normalizedThemeId;
        return currentState;
      }, `Applied the ${normalizedThemeId} theme.`);
    },
    exportBackup() {
      const payload = createBackupPayload(viewModel.state);
      const fileName = buildBackupFilename(payload.exportedAt);
      const backupBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(backupBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.append(link);
      link.click();
      link.remove();
      queueMicrotask(() => URL.revokeObjectURL(downloadUrl));
      viewModel.ui.lastBackupExportFileName = fileName;
      viewModel.ui.lastActionNotice = `Exported a backup to ${fileName}.`;
      rerender();
      enqueueToast({ variant: 'success', message: `Exported backup as ${fileName}.` });
    },
    openImportBackup() {
      document.getElementById('backup-import-input')?.click();
    },
    async importBackupFile(file) {
      if (!file) {
        return;
      }

      const importedText = await file.text();
      const parsedBackup = parseBackupText(importedText, { indexes: bundle.runtime.indexes });

      if (!parsedBackup.ok) {
        viewModel.ui.stagedBackup = null;
        viewModel.ui.confirmBackupRestoreMode = null;
        viewModel.ui.backupImportError = parsedBackup.error;
        viewModel.ui.lastActionNotice = 'The selected backup file could not be imported.';
        rerender();
        enqueueToast({ variant: 'error', message: parsedBackup.error, behavior: 'persistent' });
        return;
      }

      viewModel.ui.backupImportError = null;
      viewModel.ui.confirmBackupRestoreMode = null;
      viewModel.ui.stagedBackup = {
        fileName: file.name || buildBackupFilename(parsedBackup.payload.exportedAt),
        payload: parsedBackup.payload,
        importedState: parsedBackup.importedState,
        summary: summarizeBackupState(parsedBackup.importedState)
      };
      viewModel.ui.lastActionNotice = 'Loaded a backup preview. Choose Merge or Replace to apply it.';
      rerender();
    },
    cancelBackupPreview() {
      clearBackupDraft();
      viewModel.ui.lastActionNotice = 'Discarded the staged backup preview.';
      rerender();
    },
    requestMergeBackup() {
      if (!viewModel.ui.stagedBackup) {
        return;
      }
      viewModel.ui.confirmBackupRestoreMode = 'merge';
      viewModel.ui.modalReturnFocusAction = 'request-merge-backup';
      viewModel.ui.lastActionNotice = 'Review the merge confirmation before applying the imported backup.';
      rerender();
      focusModalCancelButton();
    },
    requestReplaceBackup() {
      if (!viewModel.ui.stagedBackup) {
        return;
      }
      viewModel.ui.confirmBackupRestoreMode = 'replace';
      viewModel.ui.modalReturnFocusAction = 'request-replace-backup';
      viewModel.ui.lastActionNotice = 'Review the replace confirmation before applying the imported backup.';
      rerender();
      focusModalCancelButton();
    },
    cancelBackupRestore() {
      viewModel.ui.confirmBackupRestoreMode = null;
      viewModel.ui.lastActionNotice = 'Kept the staged backup preview without applying it.';
      rerender();
      focusActionButton(viewModel.ui.modalReturnFocusAction);
    },
    confirmMergeBackup() {
      if (!viewModel.ui.stagedBackup) {
        return;
      }

      viewModel.ui.confirmBackupRestoreMode = null;
      const nextState = mergeImportedState(viewModel.state, viewModel.ui.stagedBackup.importedState);
      const result = applyStateUpdate(() => nextState, 'Merged the imported backup with the current app data.');
      syncUiFromPersistedState(result.state);
      rerender();
      enqueueToast({ variant: 'success', message: 'Merged the imported backup with the current app data.' });
    },
    confirmReplaceBackup() {
      if (!viewModel.ui.stagedBackup) {
        return;
      }

      viewModel.ui.confirmBackupRestoreMode = null;
      const result = applyStateUpdate(() => viewModel.ui.stagedBackup.importedState, 'Replaced the current app data with the imported backup.');
      syncUiFromPersistedState(result.state);
      rerender();
      enqueueToast({ variant: 'warning', message: 'Replaced the current app data with the imported backup.' });
    },
    addForcedPick(field, value) {
      if (!value) {
        viewModel.ui.lastActionNotice = 'Choose a card or setup entity before adding a forced pick.';
        rerender();
        return;
      }

      const nextForcedPicks = addForcedPick(viewModel.ui.forcedPicks, field, value);
      const changed = JSON.stringify(nextForcedPicks) !== JSON.stringify(viewModel.ui.forcedPicks);
      viewModel.ui.forcedPicks = nextForcedPicks;
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = changed
        ? 'Updated the active forced picks for the next generated setup.'
        : 'That forced pick was already active.';
      rerender();
    },
    removeForcedPick(field, value) {
      viewModel.ui.forcedPicks = removeForcedPick(viewModel.ui.forcedPicks, field, value);
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = 'Removed one forced pick from the next generated setup.';
      rerender();
    },
    clearForcedPicks() {
      clearForcedPicksState();
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = 'Cleared all forced picks for the next generated setup.';
      rerender();
    },
    generateSetup() {
      try {
        const setup = generateSetup({
          runtime: bundle.runtime,
          state: viewModel.state,
          playerCount: viewModel.ui.selectedPlayerCount,
          advancedSolo: viewModel.ui.advancedSolo,
          playMode: viewModel.ui.selectedPlayMode,
          forcedPicks: viewModel.ui.forcedPicks
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
        enqueueToast({ variant: 'error', message: error.message, behavior: 'persistent' });
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
        enqueueToast({ variant: 'warning', message: 'Generate a setup before using Accept & Log.' });
        return;
      }
      const acceptedRecordId = createGameRecordId();
      const acceptedAt = new Date().toISOString();

      applyStateUpdate((currentState) => {
        const nextState = acceptGameSetup(currentState, {
          id: acceptedRecordId,
          createdAt: acceptedAt,
          playerCount: viewModel.ui.selectedPlayerCount,
          advancedSolo: viewModel.ui.advancedSolo,
          playMode: viewModel.ui.selectedPlayMode,
          setupSnapshot: buildHistoryReadySetupSnapshot(viewModel.ui.currentSetup)
        });
        nextState.preferences.selectedTab = 'history';
        return nextState;
      }, hasForcedPicks(viewModel.ui.forcedPicks)
        ? 'Accepted & logged the current generated setup, opened score entry, and cleared the one-shot forced picks.'
        : 'Accepted & logged the current generated setup and opened score entry in History.');
      viewModel.ui.selectedTab = 'history';
      openResultEditor(acceptedRecordId);
      clearForcedPicksState();
      clearGeneratedSetup();
      rerender();
      enqueueToast({ variant: 'success', message: 'Accepted & logged the current generated setup. Add the result now or skip it for later.' });
    },
    editGameResult(recordId) {
      if (!openResultEditor(recordId)) {
        return;
      }

      viewModel.ui.lastActionNotice = 'Opened result editing for the selected history record.';
      rerender();
    },
    setResultOutcome(outcome) {
      viewModel.ui.resultDraft.outcome = outcome;
      viewModel.ui.resultFormError = null;
    },
    setResultScore(score) {
      viewModel.ui.resultDraft.score = score;
      viewModel.ui.resultFormError = null;
    },
    setResultNotes(notes) {
      viewModel.ui.resultDraft.notes = notes;
      viewModel.ui.resultFormError = null;
    },
    skipGameResultEntry() {
      closeResultEditor();
      viewModel.ui.lastActionNotice = 'Left the selected game result pending. You can add it later from History.';
      rerender();
      enqueueToast({ variant: 'info', message: 'Kept the selected game result pending.' });
    },
    cancelResultEntry() {
      closeResultEditor();
      viewModel.ui.lastActionNotice = 'Closed result editing without changing the stored history record.';
      rerender();
    },
    saveGameResult() {
      if (!viewModel.ui.resultEditorRecordId) {
        return;
      }

      const validation = validateGameResultDraft(viewModel.ui.resultDraft);
      if (!validation.ok) {
        viewModel.ui.resultFormError = validation.errors.join(' ');
        viewModel.ui.lastActionNotice = 'Finish the required result fields before saving.';
        rerender();
        return;
      }

      const activeRecordId = viewModel.ui.resultEditorRecordId;
      const wasPending = viewModel.state.history.find((record) => record.id === activeRecordId)?.result?.status !== 'completed';
      applyStateUpdate((currentState) => updateGameResult(currentState, {
        recordId: activeRecordId,
        outcome: validation.result.outcome,
        score: validation.result.score,
        notes: validation.result.notes,
        updatedAt: validation.result.updatedAt
      }), wasPending
        ? 'Saved the game result for the selected history record.'
        : 'Saved the corrected game result for the selected history record.');
      closeResultEditor();
      rerender();
      enqueueToast({ variant: 'success', message: wasPending ? 'Saved the game result.' : 'Saved the corrected game result.' });
    },
    resetUsageCategory(category) {
      viewModel.ui.confirmResetAllState = false;
      closeResultEditor();
      applyStateUpdate((currentState) => resetUsageCategory(currentState, category), `Reset ${category} usage stats.`);
      enqueueToast({ variant: 'info', message: `Reset ${category} usage stats.` });
    },
    resetAllState() {
      viewModel.ui.confirmResetAllState = false;
      const result = resetAllState({ storageAdapter });
      viewModel.state = result.state;
      viewModel.persistence.updateNotices = result.notices;
      viewModel.persistence.lastSaveMessage = result.save.message;
      viewModel.persistence.lastSaveOk = result.save.ok;
      syncUiFromPersistedState(result.state);
      viewModel.ui.selectedTab = DEFAULT_TAB_ID;
      viewModel.ui.lastActionNotice = 'Reset the entire application state to defaults.';
      rerender();
      if (!result.save.ok) {
        enqueueToast({
          variant: result.save.storageAvailable === false ? 'warning' : 'error',
          message: result.save.message,
          behavior: 'persistent'
        });
      } else {
        enqueueToast({ variant: 'warning', message: 'Reset the entire application state to defaults.' });
      }
    },
    corruptSavedState() {
      const save = storageAdapter.setItem(STORAGE_KEY, '{ this-is-not-valid-json');
      viewModel.persistence.lastSaveMessage = save.message;
      viewModel.persistence.lastSaveOk = save.ok;
      viewModel.ui.lastActionNotice = save.ok
        ? 'Wrote corrupted JSON to browser storage. Reload the page to verify recovery.'
        : 'Could not write corrupted JSON to browser storage.';
      rerender();
      enqueueToast({
        variant: save.ok ? 'warning' : 'error',
        message: viewModel.ui.lastActionNotice,
        behavior: 'persistent'
      });
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
      enqueueToast({
        variant: save.ok ? 'warning' : 'error',
        message: viewModel.ui.lastActionNotice,
        behavior: 'persistent'
      });
    },
    clearToDefaults() {
      const defaultState = createDefaultState();
      viewModel.ui.selectedPlayerCount = defaultState.preferences.lastPlayerCount;
      viewModel.ui.selectedPlayMode = defaultState.preferences.lastPlayMode;
      viewModel.ui.advancedSolo = defaultState.preferences.lastAdvancedSolo;
      clearForcedPicksState();
      closeResultEditor();
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = 'Reset the current setup controls to their default values.';
      rerender();
      enqueueToast({ variant: 'info', message: 'Reset the current setup controls to their default values.' });
    }
  };

  if (hydration.notices.length) {
    hydration.notices.forEach((notice) => enqueueToast({ variant: 'warning', message: notice, behavior: 'persistent' }));
  }

  rerender();
}

boot().catch((error) => {
  console.error(error);
  window.__EPIC1_ERROR__ = error;
  renderInitializationError(document, error);
});
