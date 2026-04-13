import { createEpic1Bundle } from './game-data-pipeline.mjs';
import { DEFAULT_TAB_ID, getAdjacentTabId, normalizeSelectedTab } from './app-tabs.mjs';
import { buildBackupFilename, createBackupPayload, mergeImportedState, parseBackupText, summarizeBackupState } from './backup-utils.mjs';
import { createToastRecord, pushToast, removeToast, shouldAutoDismissToast } from './feedback-utils.mjs';
import { addForcedPick, createEmptyForcedPicks, hasForcedPicks, removeForcedPick } from './forced-picks-utils.mjs';
import { DEFAULT_HISTORY_GROUPING_MODE, HISTORY_GROUPING_MODES } from './history-utils.mjs';
import { createLocaleTools, getSelectableLocales, normalizeLocaleId } from './localization-utils.mjs';
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
  globalThis.__EPIC1 = viewModel.bundle;
  globalThis.__APP_STATE__ = viewModel.state;
  globalThis.__APP_PERSISTENCE__ = viewModel.persistence;
  globalThis.__CURRENT_SETUP__ = viewModel.ui.currentSetup;
  globalThis.__ACTIVE_TAB__ = viewModel.ui.selectedTab;
  globalThis.__BROWSE_UI__ = {
    searchTerm: viewModel.ui.browseSearchTerm,
    typeFilter: viewModel.ui.browseTypeFilter,
    expandedSetId: viewModel.ui.expandedBrowseSetId
  };
  globalThis.__COLLECTION_UI__ = {
    confirmResetOwnedCollection: viewModel.ui.confirmResetOwnedCollection
  };
  globalThis.__HISTORY_UI__ = {
    groupingMode: viewModel.ui.historyGroupingMode,
    supportedGroupingModes: HISTORY_GROUPING_MODES,
    confirmResetAllState: viewModel.ui.confirmResetAllState,
    resultEditorRecordId: viewModel.ui.resultEditorRecordId,
    resultDraft: viewModel.ui.resultDraft,
    resultFormError: viewModel.ui.resultFormError,
    resultInvalidFields: viewModel.ui.resultInvalidFields,
    historyInsightsExpanded: viewModel.ui.historyInsightsExpanded
  };
  globalThis.__ONBOARDING_UI__ = {
    visible: viewModel.ui.onboardingVisible,
    step: viewModel.ui.onboardingStep,
    aboutOpen: viewModel.ui.aboutPanelOpen,
    completed: viewModel.state.preferences.onboardingCompleted,
    mobilePreferencesOpen: viewModel.ui.mobilePreferencesOpen
  };
  globalThis.__PLAY_MODE_UI__ = {
    playerCount: viewModel.ui.selectedPlayerCount,
    playMode: viewModel.ui.selectedPlayMode,
    advancedSolo: viewModel.ui.advancedSolo
  };
  globalThis.__THEME_UI__ = {
    activeThemeId: viewModel.state.preferences.themeId,
    supportedThemes: THEME_OPTIONS.map((theme) => ({ id: theme.id, label: viewModel.locale.getThemeLabel(theme.id) }))
  };
  globalThis.__LOCALE_UI__ = {
    activeLocaleId: viewModel.state.preferences.localeId,
    supportedLocales: getSelectableLocales(),
    hasFallbacks: viewModel.locale.hasFallbacks,
    fallbackKeys: viewModel.locale.fallbackKeys
  };
  globalThis.__BACKUP_UI__ = {
    importError: viewModel.ui.backupImportError,
    stagedBackupSummary: viewModel.ui.stagedBackup?.summary || null,
    confirmRestoreMode: viewModel.ui.confirmBackupRestoreMode,
    lastExportFileName: viewModel.ui.lastBackupExportFileName || null
  };
  globalThis.__FORCED_PICKS_UI__ = viewModel.ui.forcedPicks;
  globalThis.__TOASTS__ = viewModel.ui.toasts;
}

async function boot() {
  const seed = await loadSeed();
  const bundle = createEpic1Bundle(seed);
  const storageAdapter = createStorageAdapter(globalThis.localStorage);
  const hydration = hydrateState({ storageAdapter, indexes: bundle.runtime.indexes });
  const viewModel = {
    bundle,
    state: hydration.state,
    locale: createLocaleTools(hydration.state.preferences.localeId),
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
      mobilePreferencesOpen: false,
      forcedPicks: createEmptyForcedPicks(),
      resultEditorRecordId: null,
      resultEditorReturnFocusSelector: null,
      resultDraft: createEmptyResultDraft(),
      resultFormError: null,
      resultInvalidFields: [],
      historyExpandedRecordId: null,
      historyInsightsExpanded: false,
      historyGroupingMode: DEFAULT_HISTORY_GROUPING_MODE,
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
  const t = (key, params) => viewModel.locale.t(key, params);
  const refreshLocaleState = () => {
    viewModel.locale = createLocaleTools(viewModel.state.preferences.localeId);
  };
  const localizeNotice = (notice) => viewModel.locale.localizeNotice(notice);

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
      [...document.querySelectorAll(`[data-action="${actionName}"]`)]
        .find((element) => !element.hidden && element.offsetParent !== null)
        ?.focus();
    });
  };

  const focusSelector = (selector) => {
    if (!selector) {
      return;
    }
    queueMicrotask(() => {
      [...document.querySelectorAll(selector)]
        .find((element) => !element.hidden && element.offsetParent !== null)
        ?.focus();
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
    refreshLocaleState();
    viewModel.persistence.updateNotices = result.notices;
    viewModel.persistence.lastSaveMessage = result.save.message;
    viewModel.persistence.lastSaveOk = result.save.ok;
    viewModel.ui.lastActionNotice = actionNotice;
    rerender();
    result.notices.forEach((notice) => enqueueToast({ variant: 'warning', message: localizeNotice(notice), behavior: 'persistent' }));
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
    viewModel.state = nextState;
    refreshLocaleState();
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
    viewModel.ui.mobilePreferencesOpen = false;
    clearForcedPicksState();
    closeResultEditor();
    clearGeneratedSetup();
    clearBackupDraft();
    viewModel.ui.historyExpandedRecordId = null;
    viewModel.ui.historyInsightsExpanded = false;
    viewModel.ui.historyGroupingMode = DEFAULT_HISTORY_GROUPING_MODE;
  };

  const closeResultEditor = () => {
    const returnFocusSelector = viewModel.ui.resultEditorReturnFocusSelector;
    viewModel.ui.resultEditorRecordId = null;
    viewModel.ui.resultEditorReturnFocusSelector = null;
    viewModel.ui.resultDraft = createEmptyResultDraft();
    viewModel.ui.resultFormError = null;
    viewModel.ui.resultInvalidFields = [];
    return returnFocusSelector;
  };

  const openResultEditor = (recordId, options = {}) => {
    const record = viewModel.state.history.find((entry) => entry.id === recordId);
    if (!record) {
      return false;
    }

    viewModel.ui.resultEditorRecordId = recordId;
    viewModel.ui.resultEditorReturnFocusSelector = options.returnFocusSelector || `[data-action="edit-game-result"][data-record-id="${recordId}"]`;
    viewModel.ui.resultDraft = normalizeGameResultDraft(record.result);
    viewModel.ui.resultFormError = null;
    viewModel.ui.resultInvalidFields = [];
    viewModel.ui.historyExpandedRecordId = recordId;
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
    focusSelector('[data-browse-primary-cta], [data-action="select-tab"][aria-selected="true"]');
  };

  const actions = {
    dismissToast,
    pauseToastDismissal,
    resumeToastDismissal,
    selectTab(tabId) {
      persistSelectedTab(tabId, t('actions.switchedTab', { tab: viewModel.locale.getTabLabel(normalizeSelectedTab(tabId)) }));
      focusSelector(`[data-action="select-tab"][data-tab-id="${normalizeSelectedTab(tabId)}"][aria-selected="true"]`);
    },
    setHistoryGrouping(mode) {
      viewModel.ui.historyGroupingMode = HISTORY_GROUPING_MODES.some((entry) => entry.id === mode)
        ? mode
        : DEFAULT_HISTORY_GROUPING_MODE;
      viewModel.ui.lastActionNotice = t('actions.updatedHistoryGrouping', {
        mode: viewModel.locale.getHistoryGroupingLabel(viewModel.ui.historyGroupingMode)
      });
      rerender();
      focusSelector(`[data-action="set-history-grouping"][data-history-grouping-mode="${viewModel.ui.historyGroupingMode}"]`);
    },
    handleTabKeydown(tabId, key) {
      const normalizedTabId = normalizeSelectedTab(tabId);
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        const nextTabId = getAdjacentTabId(normalizedTabId, 'next');
        persistSelectedTab(nextTabId, t('actions.keyboardTabs'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${nextTabId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'ArrowLeft' || key === 'ArrowUp') {
        const previousTabId = getAdjacentTabId(normalizedTabId, 'previous');
        persistSelectedTab(previousTabId, t('actions.keyboardTabs'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${previousTabId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'Home') {
        const firstTabId = getAdjacentTabId(normalizedTabId, 'first');
        persistSelectedTab(firstTabId, t('actions.keyboardFirstTab'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${firstTabId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'End') {
        const lastTabId = getAdjacentTabId(normalizedTabId, 'last');
        persistSelectedTab(lastTabId, t('actions.keyboardLastTab'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${lastTabId}"][aria-selected="true"]`);
      }
    },
    toggleOwnedSet(setId) {
      clearGeneratedSetup();
      viewModel.ui.confirmResetOwnedCollection = false;
      viewModel.ui.confirmResetAllState = false;
      applyStateUpdate((currentState) => toggleOwnedSet(currentState, setId), t('actions.updatedOwnedCollection'));
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
        ? t('actions.openedAbout')
        : t('actions.closedAbout');
      rerender();
    },
    startOnboarding() {
      viewModel.ui.onboardingVisible = true;
      viewModel.ui.onboardingStep = 0;
      viewModel.ui.aboutPanelOpen = false;
      viewModel.ui.lastActionNotice = t('actions.openedWalkthrough');
      if (viewModel.ui.selectedTab !== 'browse') {
        persistSelectedTab('browse', t('actions.replayWalkthrough'));
        focusSelector('#onboarding-step-heading');
        return;
      }
      rerender();
      focusSelector('#onboarding-step-heading');
    },
    previousOnboardingStep() {
      viewModel.ui.onboardingStep = Math.max(0, viewModel.ui.onboardingStep - 1);
      viewModel.ui.lastActionNotice = t('actions.previousWalkthrough');
      rerender();
      focusSelector('#onboarding-step-heading');
    },
    nextOnboardingStep() {
      viewModel.ui.onboardingStep = Math.min(4, viewModel.ui.onboardingStep + 1);
      viewModel.ui.lastActionNotice = t('actions.nextWalkthrough');
      rerender();
      focusSelector('#onboarding-step-heading');
    },
    openOnboardingTab(tabId) {
      persistSelectedTab(tabId, t('actions.openedWalkthroughTab', { tab: viewModel.locale.getTabLabel(normalizeSelectedTab(tabId)) }));
    },
    skipOnboarding() {
      completeOnboardingFlow(t('actions.skippedWalkthrough'));
    },
    completeOnboarding() {
      completeOnboardingFlow(t('actions.completedWalkthrough'));
    },
    toggleBrowseSetExpanded(setId) {
      viewModel.ui.expandedBrowseSetId = viewModel.ui.expandedBrowseSetId === setId ? null : setId;
      rerender();
    },
    requestResetOwnedCollection() {
      viewModel.ui.confirmResetOwnedCollection = true;
      viewModel.ui.modalReturnFocusAction = 'request-reset-owned-collection';
      viewModel.ui.lastActionNotice = t('actions.confirmResetCollection');
      rerender();
      focusModalCancelButton();
    },
    cancelResetOwnedCollection() {
      viewModel.ui.confirmResetOwnedCollection = false;
      viewModel.ui.lastActionNotice = t('actions.keptCollection');
      rerender();
      focusActionButton(viewModel.ui.modalReturnFocusAction);
    },
    confirmResetOwnedCollection() {
      viewModel.ui.confirmResetOwnedCollection = false;
      clearForcedPicksState();
      clearGeneratedSetup();
      applyStateUpdate((currentState) => resetOwnedCollection(currentState), t('actions.clearedCollection'));
      enqueueToast({ variant: 'success', message: t('actions.clearedCollection') });
    },
    requestResetAllState() {
      viewModel.ui.confirmResetAllState = true;
      viewModel.ui.modalReturnFocusAction = 'request-reset-all-state';
      viewModel.ui.lastActionNotice = t('actions.confirmResetAll');
      rerender();
      focusModalCancelButton();
    },
    cancelResetAllState() {
      viewModel.ui.confirmResetAllState = false;
      viewModel.ui.lastActionNotice = t('actions.keptState');
      rerender();
      focusActionButton(viewModel.ui.modalReturnFocusAction);
    },
    setPlayerCount(playerCount) {
      const playMode = playerCount === 1 ? viewModel.ui.selectedPlayMode : 'standard';
      persistPreferences(playerCount, playMode, t('actions.selectedPlayerMode', {
        count: viewModel.locale.formatNumber(playerCount),
        playerWord: playerCount === 1 ? 'player' : 'players'
      }));
    },
    setPlayMode(playMode) {
      if (viewModel.ui.selectedPlayerCount !== 1 && playMode !== 'standard') {
        viewModel.ui.lastActionNotice = t('actions.invalidSoloMode');
        rerender();
        enqueueToast({ variant: 'warning', message: t('actions.invalidSoloMode') });
        return;
      }
      persistPreferences(viewModel.ui.selectedPlayerCount, playMode, t('actions.selectedPlayMode', {
        mode: viewModel.locale.getPlayModeLabel(playMode, viewModel.ui.selectedPlayerCount)
      }));
    },
    setTheme(themeId) {
      const normalizedThemeId = normalizeThemeId(themeId);
      if (viewModel.state.preferences.themeId === normalizedThemeId) {
        return;
      }

      applyStateUpdate((currentState) => {
        currentState.preferences.themeId = normalizedThemeId;
        return currentState;
      }, t('actions.appliedTheme', { theme: viewModel.locale.getThemeLabel(normalizedThemeId) }));
      // Theme changes provide instant visual feedback via aria-pressed state and page re-theming;
      // no supplemental toast notification is needed (Story 24.1/24.2).
      focusSelector(`[data-action="set-theme"][data-theme-id="${normalizedThemeId}"]`);
    },
    setLocale(localeId) {
      const normalizedLocaleId = normalizeLocaleId(localeId);
      if (viewModel.state.preferences.localeId === normalizedLocaleId) {
        return;
      }

      applyStateUpdate((currentState) => {
        currentState.preferences.localeId = normalizedLocaleId;
        return currentState;
      }, t('actions.appliedLocale', { locale: createLocaleTools(normalizedLocaleId).localeLabel }));
      enqueueToast({ variant: 'success', message: t('actions.appliedLocale', { locale: createLocaleTools(normalizedLocaleId).localeLabel }) });
      focusSelector('#header-locale-select');
    },
    toggleMobilePreferences() {
      viewModel.ui.mobilePreferencesOpen = !viewModel.ui.mobilePreferencesOpen;
      rerender();
      if (viewModel.ui.mobilePreferencesOpen) {
        focusSelector('#header-locale-select, [data-action="set-theme"][aria-pressed="true"]');
        return;
      }
      focusSelector('[data-action="toggle-mobile-preferences"]');
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
      viewModel.ui.lastActionNotice = t('actions.exportedBackup', { fileName });
      rerender();
      enqueueToast({ variant: 'success', message: t('actions.exportedBackupToast', { fileName }) });
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
        viewModel.ui.lastActionNotice = t('actions.backupImportFailed');
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
      viewModel.ui.lastActionNotice = t('actions.loadedBackupPreview');
      rerender();
    },
    cancelBackupPreview() {
      clearBackupDraft();
      viewModel.ui.lastActionNotice = t('actions.discardedBackupPreview');
      rerender();
    },
    requestMergeBackup() {
      if (!viewModel.ui.stagedBackup) {
        return;
      }
      viewModel.ui.confirmBackupRestoreMode = 'merge';
      viewModel.ui.modalReturnFocusAction = 'request-merge-backup';
      viewModel.ui.lastActionNotice = t('actions.reviewMerge');
      rerender();
      focusModalCancelButton();
    },
    requestReplaceBackup() {
      if (!viewModel.ui.stagedBackup) {
        return;
      }
      viewModel.ui.confirmBackupRestoreMode = 'replace';
      viewModel.ui.modalReturnFocusAction = 'request-replace-backup';
      viewModel.ui.lastActionNotice = t('actions.reviewReplace');
      rerender();
      focusModalCancelButton();
    },
    cancelBackupRestore() {
      viewModel.ui.confirmBackupRestoreMode = null;
      viewModel.ui.lastActionNotice = t('actions.keptBackupPreview');
      rerender();
      focusActionButton(viewModel.ui.modalReturnFocusAction);
    },
    confirmMergeBackup() {
      if (!viewModel.ui.stagedBackup) {
        return;
      }

      viewModel.ui.confirmBackupRestoreMode = null;
      const nextState = mergeImportedState(viewModel.state, viewModel.ui.stagedBackup.importedState);
      const result = applyStateUpdate(() => nextState, t('actions.mergedBackup'));
      syncUiFromPersistedState(result.state);
      rerender();
      enqueueToast({ variant: 'success', message: t('actions.mergedBackup') });
    },
    confirmReplaceBackup() {
      if (!viewModel.ui.stagedBackup) {
        return;
      }

      viewModel.ui.confirmBackupRestoreMode = null;
      const result = applyStateUpdate(() => viewModel.ui.stagedBackup.importedState, t('actions.replacedBackup'));
      syncUiFromPersistedState(result.state);
      rerender();
      enqueueToast({ variant: 'warning', message: t('actions.replacedBackup') });
    },
    addForcedPick(field, value) {
      if (!value) {
        viewModel.ui.lastActionNotice = t('actions.chooseForcedPick');
        rerender();
        return;
      }

      const nextForcedPicks = addForcedPick(viewModel.ui.forcedPicks, field, value);
      const changed = JSON.stringify(nextForcedPicks) !== JSON.stringify(viewModel.ui.forcedPicks);
      viewModel.ui.forcedPicks = nextForcedPicks;
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = changed
        ? t('actions.updatedForcedPicks')
        : t('actions.duplicateForcedPick');
      rerender();
    },
    removeForcedPick(field, value) {
      viewModel.ui.forcedPicks = removeForcedPick(viewModel.ui.forcedPicks, field, value);
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = t('actions.removedForcedPick');
      rerender();
    },
    clearForcedPicks() {
      clearForcedPicksState();
      clearGeneratedSetup();
      viewModel.ui.lastActionNotice = t('actions.clearedForcedPicks');
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
        viewModel.ui.lastActionNotice = t('actions.generatedSetup');
      } catch (error) {
        viewModel.ui.currentSetup = null;
        viewModel.ui.generatorNotices = [];
        viewModel.ui.generatorError = error.message;
        viewModel.ui.lastActionNotice = t('actions.failedSetup');
        enqueueToast({ variant: 'error', message: error.message, behavior: 'persistent' });
      }
      rerender();
    },
    acceptCurrentSetup() {
      if (!viewModel.ui.currentSetup) {
        viewModel.ui.lastActionNotice = t('actions.acceptBeforeLog');
        rerender();
        enqueueToast({ variant: 'warning', message: t('actions.acceptBeforeLog') });
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
        ? t('actions.acceptedLoggedForced')
        : t('actions.acceptedLogged'));
      viewModel.ui.selectedTab = 'history';
      openResultEditor(acceptedRecordId, {
        returnFocusSelector: `[data-action="edit-game-result"][data-record-id="${acceptedRecordId}"]`
      });
      clearForcedPicksState();
      clearGeneratedSetup();
      rerender();
      focusSelector('[data-result-field="outcome"]');
      enqueueToast({ variant: 'success', message: t('actions.acceptedToast') });
    },
    editGameResult(recordId) {
      if (!openResultEditor(recordId, {
        returnFocusSelector: `[data-action="edit-game-result"][data-record-id="${recordId}"]`
      })) {
        return;
      }

      viewModel.ui.lastActionNotice = t('actions.openedResultEditor');
      rerender();
      focusSelector('[data-result-field="outcome"]');
    },
    setResultOutcome(outcome) {
      viewModel.ui.resultDraft.outcome = outcome;
      const hadValidationState = viewModel.ui.resultFormError || viewModel.ui.resultInvalidFields.length;
      viewModel.ui.resultFormError = null;
      viewModel.ui.resultInvalidFields = [];
      if (hadValidationState) {
        rerender();
        focusSelector('[data-result-field="outcome"]');
      }
    },
    setResultScore(score) {
      viewModel.ui.resultDraft.score = score;
      const hadValidationState = viewModel.ui.resultFormError || viewModel.ui.resultInvalidFields.length;
      viewModel.ui.resultFormError = null;
      viewModel.ui.resultInvalidFields = [];
      if (hadValidationState) {
        rerender();
        focusSelector('[data-result-field="score"]');
      }
    },
    setResultNotes(notes) {
      viewModel.ui.resultDraft.notes = notes;
      const hadValidationState = viewModel.ui.resultFormError || viewModel.ui.resultInvalidFields.length;
      viewModel.ui.resultFormError = null;
      viewModel.ui.resultInvalidFields = [];
      if (hadValidationState) {
        rerender();
        focusSelector('[data-result-field="notes"]');
      }
    },
    skipGameResultEntry() {
      const returnFocusSelector = closeResultEditor();
      viewModel.ui.lastActionNotice = t('actions.pendingResult');
      rerender();
      focusSelector(returnFocusSelector);
      enqueueToast({ variant: 'info', message: t('actions.pendingResultToast') });
    },
    cancelResultEntry() {
      const returnFocusSelector = closeResultEditor();
      viewModel.ui.lastActionNotice = t('actions.closedResultEditor');
      rerender();
      focusSelector(returnFocusSelector);
    },
    saveGameResult() {
      if (!viewModel.ui.resultEditorRecordId) {
        return;
      }

      const validation = validateGameResultDraft(viewModel.ui.resultDraft);
      if (!validation.ok) {
        viewModel.ui.resultFormError = validation.errors.map((message) => viewModel.locale.localizeValidationMessage(message)).join(' ');
        viewModel.ui.resultInvalidFields = validation.errors.flatMap((message) => {
          if (message.includes('Win or Loss')) {
            return ['outcome'];
          }
          if (message.toLowerCase().includes('score')) {
            return ['score'];
          }
          return [];
        });
        viewModel.ui.lastActionNotice = t('actions.finishResultFields');
        rerender();
        focusSelector('[data-result-form-error]');
        return;
      }

      const activeRecordId = viewModel.ui.resultEditorRecordId;
      const returnFocusSelector = viewModel.ui.resultEditorReturnFocusSelector;
      const wasPending = viewModel.state.history.find((record) => record.id === activeRecordId)?.result?.status !== 'completed';
      applyStateUpdate((currentState) => updateGameResult(currentState, {
        recordId: activeRecordId,
        outcome: validation.result.outcome,
        score: validation.result.score,
        notes: validation.result.notes,
        updatedAt: validation.result.updatedAt
      }), wasPending
        ? t('actions.savedResult')
        : t('actions.savedCorrectedResult'));
      closeResultEditor();
      rerender();
      focusSelector(returnFocusSelector);
      enqueueToast({ variant: 'success', message: wasPending ? t('actions.savedResultToast') : t('actions.savedCorrectedResultToast') });
    },
    toggleHistoryInsights() {
      viewModel.ui.historyInsightsExpanded = !viewModel.ui.historyInsightsExpanded;
      rerender();
      focusSelector('[data-action="toggle-history-insights"]');
    },
    resetUsageCategory(category) {
      viewModel.ui.confirmResetAllState = false;
      closeResultEditor();
      const label = viewModel.locale.getUsageLabel(category);
      applyStateUpdate((currentState) => resetUsageCategory(currentState, category), t('actions.resetUsageStats', { label }));
      enqueueToast({ variant: 'info', message: t('actions.resetUsageStats', { label }) });
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
      viewModel.ui.lastActionNotice = t('actions.resetAllDefaults');
      rerender();
      if (result.save.ok) {
        enqueueToast({ variant: 'warning', message: t('actions.resetAllDefaults') });
      } else {
        enqueueToast({
          variant: result.save.storageAvailable === false ? 'warning' : 'error',
          message: result.save.message,
          behavior: 'persistent'
        });
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
      const corruptedState = structuredClone(viewModel.state);
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
      viewModel.ui.lastActionNotice = t('actions.clearDefaults');
      rerender();
      enqueueToast({ variant: 'info', message: t('actions.clearDefaults') });
    }
  };

  if (hydration.notices.length) {
    hydration.notices.forEach((notice) => enqueueToast({ variant: 'warning', message: localizeNotice(notice), behavior: 'persistent' }));
  }

  rerender();
}

try {
  await boot();
} catch (error) {
  console.error(error);
  globalThis.__EPIC1_ERROR__ = error;
  renderInitializationError(document, error);
}
