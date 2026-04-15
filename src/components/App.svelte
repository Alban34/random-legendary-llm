<script>
  import TabNav from './TabNav.svelte';
  import ToastStack from './ToastStack.svelte';
  import BrowseTab from './BrowseTab.svelte';
  import CollectionTab from './CollectionTab.svelte';
  import NewGameTab from './NewGameTab.svelte';
  import HistoryTab from './HistoryTab.svelte';
  import BackupTab from './BackupTab.svelte';
  import { createEpic1Bundle } from '../app/game-data-pipeline.mjs';
  import { APP_TABS, DEFAULT_TAB_ID, getAdjacentTabId, normalizeSelectedTab } from '../app/app-tabs.mjs';
  import { createToastRecord, pushToast, removeToast, shouldAutoDismissToast } from '../app/feedback-utils.mjs';
  import { addForcedPick, hasForcedPicks, removeForcedPick } from '../app/forced-picks-utils.mjs';
  import { DEFAULT_HISTORY_GROUPING_MODE, HISTORY_GROUPING_MODES } from '../app/history-utils.mjs';
  import { createLocaleTools, getSelectableLocales, normalizeLocaleId } from '../app/localization-utils.mjs';
  import { normalizeGameResultDraft, validateGameResultDraft } from '../app/result-utils.mjs';
  import OnboardingShell from './OnboardingShell.svelte';
  import { buildHistoryReadySetupSnapshot, generateSetup } from '../app/setup-generator.mjs';
  import { resolvePlayMode } from '../app/setup-rules.mjs';
  import { getThemeDefinition, normalizeThemeId, THEME_OPTIONS } from '../app/theme-utils.mjs';
  import {
    STORAGE_KEY,
    acceptGameSetup,
    createStorageAdapter,
    createGameRecordId,
    createDefaultState,
    hydrateState,
    resetAllState as resetAllStateStore,
    resetOwnedCollection,
    resetUsageCategory as resetUsageCategoryStore,
    toggleOwnedSet as toggleOwnedSetStore,
    updateGameResult,
    updateState
  } from '../app/state-store.mjs';
  import {
    buildBackupFilename,
    createBackupPayload,
    mergeImportedState,
    parseBackupText,
    summarizeBackupState
  } from '../app/backup-utils.mjs';
  import {
    getBrowseSearchTerm, setBrowseSearchTerm,
    getBrowseTypeFilter, setBrowseTypeFilter,
    getExpandedBrowseSetId, setExpandedBrowseSetId
  } from '../app/browse-vm.svelte.js';
  import {
    getCurrentSetup, setCurrentSetup,
    getGeneratorError, setGeneratorError,
    getGeneratorNotices, setGeneratorNotices,
    getSelectedPlayerCount, setSelectedPlayerCount,
    getSelectedPlayMode, setSelectedPlayMode,
    getAdvancedSolo, setAdvancedSolo,
    getForcedPicks, setForcedPicks, resetForcedPicks
  } from '../app/new-game-vm.svelte.js';
  import {
    getHistoryExpandedRecordId, setHistoryExpandedRecordId,
    getHistoryInsightsExpanded, setHistoryInsightsExpanded, toggleHistoryInsights,
    getHistoryGroupingMode, setHistoryGroupingMode, resetHistoryGroupingMode,
    getResultEditorRecordId, setResultEditorRecordId,
    getResultEditorReturnFocusSelector, setResultEditorReturnFocusSelector,
    getResultDraft, setResultDraft, resetResultDraft,
    getResultFormError, setResultFormError,
    getResultInvalidFields, setResultInvalidFields
  } from '../app/history-vm.svelte.js';
  import {
    getBackupImportError, setBackupImportError,
    getStagedBackup, setStagedBackup,
    getConfirmBackupRestoreMode, setConfirmBackupRestoreMode,
    getLastBackupExportFileName, setLastBackupExportFileName
  } from '../app/backup-vm.svelte.js';

  /* global __APP_VERSION__ */

  async function loadSeed() {
    const seedUrl = new URL('../data/canonical-game-data.json', import.meta.url);
    const response = await fetch(seedUrl);
    if (!response.ok) {
      throw new Error(`Unable to load canonical game data (${response.status} ${response.statusText})`);
    }
    return response.json();
  }

  // ---------------------------------------------------------------------------
  // Reactive State
  // ---------------------------------------------------------------------------
  let bundle = $state(null);
  let appState = $state(null);
  let locale = $state(null);
  let persistence = $state({
    storageAvailable: true,
    hydratedFromStorage: false,
    recoveredOnLoad: false,
    hydrateNotices: [],
    updateNotices: [],
    lastSaveMessage: null,
    lastSaveOk: null
  });
  let ui = $state({
    lastActionNotice: null,
    confirmResetOwnedCollection: false,
    confirmResetAllState: false,
    modalReturnFocusAction: null,
    toasts: [],
    onboardingVisible: false,
    onboardingStep: 0,
    aboutPanelOpen: false,
    mobilePreferencesOpen: false,
    selectedTab: DEFAULT_TAB_ID
  });
  let compactViewport = $state(false);
  let initError = $state(null);

  // Non-reactive helpers
  let storageAdapter = null;
  const toastTimers = new Map();
  let nextToastId = 1;

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  let isLoaded = $derived(bundle !== null && appState !== null && locale !== null);
  let activeTabId = $derived(ui.selectedTab);
  let activeThemeId = $derived(appState ? normalizeThemeId(appState.preferences.themeId) : 'dark');
  let activeTheme = $derived(activeThemeId ? getThemeDefinition(activeThemeId) : null);
  let activeLocaleId = $derived(appState?.preferences?.localeId ?? 'en-US');


  let modalConfig = $derived(isLoaded ? computeModalConfig() : null);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  $effect(() => {
    if (!isLoaded || !locale || !activeTheme) return;
    document.documentElement.dataset.theme = activeThemeId;
    document.documentElement.lang = locale.documentLang;
    document.documentElement.style.colorScheme = activeTheme.colorScheme;
    document.title = locale.t('app.documentTitle');
  });

  $effect(() => {
    if (!isLoaded) return;
    syncGlobals();
  });

  // ---------------------------------------------------------------------------
  // Debug globals (mirrors syncDebugGlobals from browser-entry.mjs)
  // ---------------------------------------------------------------------------
  function syncGlobals() {
    if (!import.meta.env.DEV) return;
    if (!bundle || !appState) return;
    globalThis.__EPIC1 = bundle;
    globalThis.__APP_STATE__ = appState;
    globalThis.__APP_PERSISTENCE__ = persistence;
    globalThis.__CURRENT_SETUP__ = getCurrentSetup();
    globalThis.__ACTIVE_TAB__ = ui.selectedTab;
    globalThis.__BROWSE_UI__ = {
      searchTerm: getBrowseSearchTerm(),
      typeFilter: getBrowseTypeFilter(),
      expandedSetId: getExpandedBrowseSetId()
    };
    globalThis.__COLLECTION_UI__ = { confirmResetOwnedCollection: ui.confirmResetOwnedCollection };
    globalThis.__HISTORY_UI__ = {
      groupingMode: getHistoryGroupingMode(),
      supportedGroupingModes: HISTORY_GROUPING_MODES,
      confirmResetAllState: ui.confirmResetAllState,
      resultEditorRecordId: getResultEditorRecordId(),
      resultDraft: getResultDraft(),
      resultFormError: getResultFormError(),
      resultInvalidFields: getResultInvalidFields(),
      historyInsightsExpanded: getHistoryInsightsExpanded()
    };
    globalThis.__ONBOARDING_UI__ = {
      visible: ui.onboardingVisible,
      step: ui.onboardingStep,
      aboutOpen: ui.aboutPanelOpen,
      completed: appState.preferences.onboardingCompleted,
      mobilePreferencesOpen: ui.mobilePreferencesOpen
    };
    globalThis.__PLAY_MODE_UI__ = {
      playerCount: getSelectedPlayerCount(),
      playMode: getSelectedPlayMode(),
      advancedSolo: getAdvancedSolo()
    };
    globalThis.__THEME_UI__ = {
      activeThemeId: appState.preferences.themeId,
      supportedThemes: THEME_OPTIONS.map((theme) => ({
        id: theme.id,
        label: locale.getThemeLabel(theme.id)
      }))
    };
    globalThis.__LOCALE_UI__ = {
      activeLocaleId: appState.preferences.localeId,
      supportedLocales: getSelectableLocales(),
      hasFallbacks: locale.hasFallbacks,
      fallbackKeys: locale.fallbackKeys
    };
    globalThis.__BACKUP_UI__ = {
      importError: getBackupImportError(),
      stagedBackupSummary: getStagedBackup()?.summary || null,
      confirmRestoreMode: getConfirmBackupRestoreMode(),
      lastExportFileName: getLastBackupExportFileName() || null
    };
    globalThis.__FORCED_PICKS_UI__ = getForcedPicks();
    globalThis.__TOASTS__ = ui.toasts;
  }

  // ---------------------------------------------------------------------------
  // Modal config
  // ---------------------------------------------------------------------------
  function computeModalConfig() {
    if (!locale || !appState) return null;
    if (ui.confirmResetOwnedCollection) {
      return {
        title: locale.t('modal.reset.title'),
        description: locale.t('modal.resetCollection.description'),
        cancelAction: 'cancel-reset-owned-collection',
        confirmAction: 'confirm-reset-owned-collection',
        confirmLabel: locale.t('modal.resetCollection.confirm'),
        onCancel: () => actions.cancelResetOwnedCollection(),
        onConfirm: () => actions.confirmResetOwnedCollection()
      };
    }
    if (ui.confirmResetAllState) {
      return {
        title: locale.t('modal.reset.title'),
        description: locale.t('modal.resetAll.description'),
        cancelAction: 'cancel-reset-all-state',
        confirmAction: 'confirm-reset-all-state',
        confirmLabel: locale.t('modal.resetAll.confirm'),
        onCancel: () => actions.cancelResetAllState(),
        onConfirm: () => actions.resetAllState()
      };
    }
    if (getConfirmBackupRestoreMode() && getStagedBackup()) {
      const { summary } = getStagedBackup();
      if (getConfirmBackupRestoreMode() === 'merge') {
        return {
          title: locale.t('modal.merge.title'),
          description: locale.t('modal.merge.description', {
            ownedSetCount: locale.formatNumber(summary.ownedSetCount),
            historyCount: locale.formatNumber(summary.historyCount)
          }),
          cancelAction: 'cancel-backup-restore',
          confirmAction: 'confirm-merge-backup',
          confirmLabel: locale.t('modal.merge.confirm'),
          onCancel: () => actions.cancelBackupRestore(),
          onConfirm: () => actions.confirmMergeBackup()
        };
      }
      return {
        title: locale.t('modal.replace.title'),
        description: locale.t('modal.replace.description', {
          historyCount: locale.formatNumber(summary.historyCount)
        }),
        cancelAction: 'cancel-backup-restore',
        confirmAction: 'confirm-replace-backup',
        confirmLabel: locale.t('modal.replace.confirm'),
        onCancel: () => actions.cancelBackupRestore(),
        onConfirm: () => actions.confirmReplaceBackup()
      };
    }
    return null;
  }

  function handleModalKeydown(event) {
    const modalDialog = document.querySelector('#modal-root [role="dialog"]');
    if (!modalDialog) return;
    const focusables = [...modalDialog.querySelectorAll('button:not([disabled])')];
    if (event.key === 'Escape') {
      event.preventDefault();
      modalDialog.querySelector('[data-modal-focus="cancel"]')?.click();
      return;
    }
    if (event.key === 'Enter' && modalDialog.contains(event.target)) {
      event.preventDefault();
      modalDialog.querySelector('[data-modal-focus="confirm"]')?.click();
      return;
    }
    if (event.key === 'Tab' && focusables.length) {
      const first = focusables[0];
      const last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Toast management
  // ---------------------------------------------------------------------------
  function clearToastTimer(id) {
    const record = toastTimers.get(id);
    if (!record) return;
    if (record.timeoutId) clearTimeout(record.timeoutId);
    toastTimers.delete(id);
  }

  function scheduleToastDismissal(toast) {
    if (!shouldAutoDismissToast(toast)) return;
    const record = { remainingMs: toast.autoDismissMs, timeoutId: null, startedAt: Date.now() };
    record.timeoutId = setTimeout(() => dismissToast(toast.id), record.remainingMs);
    toastTimers.set(toast.id, record);
  }

  function pauseToastDismissal(id) {
    const record = toastTimers.get(id);
    if (!record?.timeoutId) return;
    clearTimeout(record.timeoutId);
    record.remainingMs = Math.max(1000, record.remainingMs - (Date.now() - record.startedAt));
    record.timeoutId = null;
    toastTimers.set(id, record);
  }

  function resumeToastDismissal(id) {
    const record = toastTimers.get(id);
    if (!record || record.timeoutId) return;
    record.startedAt = Date.now();
    record.timeoutId = setTimeout(() => dismissToast(id), record.remainingMs);
    toastTimers.set(id, record);
  }

  function dismissToast(id, options = {}) {
    clearToastTimer(id);
    ui.toasts = removeToast(ui.toasts, id);
    if (options.focusToastId) {
      queueMicrotask(() => {
        document
          .querySelector(`[data-action="dismiss-toast"][data-toast-id="${options.focusToastId}"]`)
          ?.focus();
      });
    }
  }

  function enqueueToast({ variant, message, behavior = 'transient' }) {
    const toast = createToastRecord({ id: `toast-${nextToastId++}`, variant, message, behavior });
    const previousToasts = ui.toasts;
    const nextToasts = pushToast(previousToasts, toast);
    const nextToastIds = new Set(nextToasts.map((entry) => entry.id));
    previousToasts.forEach((entry) => {
      if (!nextToastIds.has(entry.id)) clearToastTimer(entry.id);
    });
    ui.toasts = nextToasts;
    if (nextToastIds.has(toast.id)) scheduleToastDismissal(toast);
  }

  // ---------------------------------------------------------------------------
  // Focus utilities
  // ---------------------------------------------------------------------------
  function focusActionButton(actionName) {
    if (!actionName) return;
    queueMicrotask(() => {
      [...document.querySelectorAll(`[data-action="${actionName}"]`)]
        .find((el) => !el.hidden && el.offsetParent !== null)
        ?.focus();
    });
  }

  function focusSelector(selector) {
    if (!selector) return;
    queueMicrotask(() => {
      [...document.querySelectorAll(selector)]
        .find((el) => !el.hidden && el.offsetParent !== null)
        ?.focus();
    });
  }

  function focusModalCancelButton() {
    queueMicrotask(() => {
      document.querySelector('#modal-root [data-modal-focus="cancel"]')?.focus();
    });
  }

  // ---------------------------------------------------------------------------
  // State helpers
  // ---------------------------------------------------------------------------
  function refreshLocaleState() {
    locale = createLocaleTools(appState.preferences.localeId);
  }

  function localizeNotice(notice) {
    return locale.localizeNotice(notice);
  }

  function clearGeneratedSetup() {
    setCurrentSetup(null);
    setGeneratorError(null);
    setGeneratorNotices([]);
  }

  function clearForcedPicksState() {
    resetForcedPicks();
  }

  function clearBackupDraft() {
    setBackupImportError(null);
    setStagedBackup(null);
    setConfirmBackupRestoreMode(null);
  }

  function getLocaleFlag(localeId) {
    const flags = {
      'en-US': '🇺🇸',
      'fr-FR': '🇫🇷',
      'de-DE': '🇩🇪',
      'ja-JP': '🇯🇵',
      'ko-KR': '🇰🇷',
      'es-ES': '🇪🇸'
    };
    return flags[localeId] ?? '🌐';
  }

  function getThemeIcon(themeId) {
    const icons = { dark: '🌙', light: '☀️' };
    return icons[themeId] ?? '🎨';
  }

  function closeResultEditor() {
    const returnFocusSelector = getResultEditorReturnFocusSelector();
    setResultEditorRecordId(null);
    setResultEditorReturnFocusSelector(null);
    resetResultDraft();
    setResultFormError(null);
    setResultInvalidFields([]);
    return returnFocusSelector;
  }

  function openResultEditor(recordId, options = {}) {
    const record = appState.history.find((entry) => entry.id === recordId);
    if (!record) return false;
    setResultEditorRecordId(recordId);
    setResultEditorReturnFocusSelector(
      options.returnFocusSelector ||
      `[data-action="edit-game-result"][data-record-id="${recordId}"]`
    );
    setResultDraft(normalizeGameResultDraft(record.result));
    setResultFormError(null);
    setResultInvalidFields([]);
    setHistoryExpandedRecordId(recordId);
    return true;
  }

  function syncUiFromPersistedState(nextState) {
    appState = nextState;
    refreshLocaleState();
    ui.selectedTab = normalizeSelectedTab(nextState.preferences.selectedTab);
    setSelectedPlayerCount(nextState.preferences.lastPlayerCount);
    setSelectedPlayMode(resolvePlayMode(nextState.preferences.lastPlayerCount, {
      advancedSolo: nextState.preferences.lastAdvancedSolo,
      playMode: nextState.preferences.lastPlayMode
    }));
    setAdvancedSolo(nextState.preferences.lastAdvancedSolo);
    ui.onboardingVisible = !nextState.preferences.onboardingCompleted;
    ui.onboardingStep = 0;
    ui.aboutPanelOpen = false;
    ui.mobilePreferencesOpen = false;
    clearForcedPicksState();
    closeResultEditor();
    clearGeneratedSetup();
    clearBackupDraft();
    setHistoryExpandedRecordId(null);
    setHistoryInsightsExpanded(false);
    resetHistoryGroupingMode();
  }

  function applyStateUpdate(updater, actionNotice) {
    const result = updateState({
      storageAdapter,
      indexes: bundle.runtime.indexes,
      currentState: $state.snapshot(appState),
      updater
    });
    appState = result.state;
    refreshLocaleState();
    persistence.updateNotices = result.notices;
    persistence.lastSaveMessage = result.save.message;
    persistence.lastSaveOk = result.save.ok;
    ui.lastActionNotice = actionNotice;
    result.notices.forEach((notice) =>
      enqueueToast({ variant: 'warning', message: localizeNotice(notice), behavior: 'persistent' })
    );
    if (!result.save.ok) {
      enqueueToast({
        variant: result.save.storageAvailable === false ? 'warning' : 'error',
        message: result.save.message,
        behavior: 'persistent'
      });
    }
    return result;
  }

  function persistPreferences(playerCount, playMode, actionNotice) {
    const normalizedPlayMode = resolvePlayMode(playerCount, { playMode });
    const advancedSolo = normalizedPlayMode === 'advanced-solo';
    setSelectedPlayerCount(playerCount);
    setSelectedPlayMode(normalizedPlayMode);
    setAdvancedSolo(advancedSolo);
    clearGeneratedSetup();
    applyStateUpdate((currentState) => {
      currentState.preferences.lastPlayerCount = playerCount;
      currentState.preferences.lastAdvancedSolo = advancedSolo;
      currentState.preferences.lastPlayMode = normalizedPlayMode;
      return currentState;
    }, actionNotice);
  }

  function persistSelectedTab(tabId, actionNotice) {
    const normalizedTabId = normalizeSelectedTab(tabId);
    ui.selectedTab = normalizedTabId;
    applyStateUpdate((currentState) => {
      currentState.preferences.selectedTab = normalizedTabId;
      return currentState;
    }, actionNotice);
  }

  function completeOnboardingFlow(actionNotice) {
    ui.onboardingVisible = false;
    ui.onboardingStep = 0;
    applyStateUpdate((currentState) => {
      currentState.preferences.onboardingCompleted = true;
      return currentState;
    }, actionNotice);
    focusSelector('[data-browse-primary-cta], [data-action="select-tab"][aria-selected="true"]');
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const actions = {
    dismissToast,
    pauseToastDismissal,
    resumeToastDismissal,

    selectTab(tabId) {
      persistSelectedTab(
        tabId,
        locale.t('actions.switchedTab', { tab: locale.getTabLabel(normalizeSelectedTab(tabId)) })
      );
      focusSelector(
        `[data-action="select-tab"][data-tab-id="${normalizeSelectedTab(tabId)}"][aria-selected="true"]`
      );
    },

    handleTabKeydown(tabId, key) {
      const normalizedTabId = normalizeSelectedTab(tabId);
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        const nextId = getAdjacentTabId(normalizedTabId, 'next');
        persistSelectedTab(nextId, locale.t('actions.keyboardTabs'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${nextId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'ArrowLeft' || key === 'ArrowUp') {
        const prevId = getAdjacentTabId(normalizedTabId, 'previous');
        persistSelectedTab(prevId, locale.t('actions.keyboardTabs'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${prevId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'Home') {
        const firstId = getAdjacentTabId(normalizedTabId, 'first');
        persistSelectedTab(firstId, locale.t('actions.keyboardFirstTab'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${firstId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'End') {
        const lastId = getAdjacentTabId(normalizedTabId, 'last');
        persistSelectedTab(lastId, locale.t('actions.keyboardLastTab'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${lastId}"][aria-selected="true"]`);
      }
    },

    setHistoryGrouping(mode) {
      setHistoryGroupingMode(HISTORY_GROUPING_MODES.some((entry) => entry.id === mode)
        ? mode
        : DEFAULT_HISTORY_GROUPING_MODE);
      ui.lastActionNotice = locale.t('actions.updatedHistoryGrouping', {
        mode: locale.getHistoryGroupingLabel(getHistoryGroupingMode())
      });
      focusSelector(
        `[data-action="set-history-grouping"][data-history-grouping-mode="${getHistoryGroupingMode()}"]`
      );
    },

    toggleOwnedSet(setId) {
      clearGeneratedSetup();
      ui.confirmResetOwnedCollection = false;
      ui.confirmResetAllState = false;
      applyStateUpdate(
        (currentState) => toggleOwnedSetStore(currentState, setId),
        locale.t('actions.updatedOwnedCollection')
      );
    },

    setBrowseSearchTerm(searchTerm) { setBrowseSearchTerm(searchTerm); },

    setBrowseTypeFilter(typeFilter) { setBrowseTypeFilter(typeFilter); },

    toggleAboutPanel() {
      ui.aboutPanelOpen = !ui.aboutPanelOpen;
      ui.lastActionNotice = ui.aboutPanelOpen
        ? locale.t('actions.openedAbout')
        : locale.t('actions.closedAbout');
    },

    startOnboarding() {
      ui.onboardingVisible = true;
      ui.onboardingStep = 0;
      ui.aboutPanelOpen = false;
      ui.lastActionNotice = locale.t('actions.openedWalkthrough');
      if (ui.selectedTab !== 'browse') {
        persistSelectedTab('browse', locale.t('actions.replayWalkthrough'));
        focusSelector('#onboarding-step-heading');
        return;
      }
      focusSelector('#onboarding-step-heading');
    },

    previousOnboardingStep() {
      ui.onboardingStep = Math.max(0, ui.onboardingStep - 1);
      ui.lastActionNotice = locale.t('actions.previousWalkthrough');
      focusSelector('#onboarding-step-heading');
    },

    nextOnboardingStep() {
      ui.onboardingStep = Math.min(4, ui.onboardingStep + 1);
      ui.lastActionNotice = locale.t('actions.nextWalkthrough');
      focusSelector('#onboarding-step-heading');
    },

    openOnboardingTab(tabId) {
      persistSelectedTab(
        tabId,
        locale.t('actions.openedWalkthroughTab', {
          tab: locale.getTabLabel(normalizeSelectedTab(tabId))
        })
      );
    },

    skipOnboarding() { completeOnboardingFlow(locale.t('actions.skippedWalkthrough')); },
    completeOnboarding() { completeOnboardingFlow(locale.t('actions.completedWalkthrough')); },

    toggleBrowseSetExpanded(setId) {
      setExpandedBrowseSetId(getExpandedBrowseSetId() === setId ? null : setId);
    },

    requestResetOwnedCollection() {
      ui.confirmResetOwnedCollection = true;
      ui.modalReturnFocusAction = 'request-reset-owned-collection';
      ui.lastActionNotice = locale.t('actions.confirmResetCollection');
      focusModalCancelButton();
    },

    cancelResetOwnedCollection() {
      ui.confirmResetOwnedCollection = false;
      ui.lastActionNotice = locale.t('actions.keptCollection');
      focusActionButton(ui.modalReturnFocusAction);
    },

    confirmResetOwnedCollection() {
      ui.confirmResetOwnedCollection = false;
      clearForcedPicksState();
      clearGeneratedSetup();
      applyStateUpdate(
        (currentState) => resetOwnedCollection(currentState),
        locale.t('actions.clearedCollection')
      );
      enqueueToast({ variant: 'success', message: locale.t('actions.clearedCollection') });
    },

    requestResetAllState() {
      ui.confirmResetAllState = true;
      ui.modalReturnFocusAction = 'request-reset-all-state';
      ui.lastActionNotice = locale.t('actions.confirmResetAll');
      focusModalCancelButton();
    },

    cancelResetAllState() {
      ui.confirmResetAllState = false;
      ui.lastActionNotice = locale.t('actions.keptState');
      focusActionButton(ui.modalReturnFocusAction);
    },

    setPlayerCount(playerCount) {
      const playMode = playerCount === 1 ? getSelectedPlayMode() : 'standard';
      persistPreferences(
        playerCount,
        playMode,
        locale.t('actions.selectedPlayerMode', {
          count: locale.formatNumber(playerCount),
          playerWord: playerCount === 1 ? 'player' : 'players'
        })
      );
    },

    setPlayMode(playMode) {
      if (getSelectedPlayerCount() !== 1 && playMode !== 'standard') {
        ui.lastActionNotice = locale.t('actions.invalidSoloMode');
        enqueueToast({ variant: 'warning', message: locale.t('actions.invalidSoloMode') });
        return;
      }
      persistPreferences(
        getSelectedPlayerCount(),
        playMode,
        locale.t('actions.selectedPlayMode', {
          mode: locale.getPlayModeLabel(playMode, getSelectedPlayerCount())
        })
      );
    },

    setTheme(themeId) {
      const normalizedThemeId = normalizeThemeId(themeId);
      if (appState.preferences.themeId === normalizedThemeId) return;
      applyStateUpdate((currentState) => {
        currentState.preferences.themeId = normalizedThemeId;
        return currentState;
      }, locale.t('actions.appliedTheme', { theme: locale.getThemeLabel(normalizedThemeId) }));
      focusSelector(`[data-action="set-theme"][data-theme-id="${normalizedThemeId}"]`);
    },

    setLocale(localeId) {
      const normalizedLocaleId = normalizeLocaleId(localeId);
      if (appState.preferences.localeId === normalizedLocaleId) return;
      const newLocaleTools = createLocaleTools(normalizedLocaleId);
      applyStateUpdate((currentState) => {
        currentState.preferences.localeId = normalizedLocaleId;
        return currentState;
      }, locale.t('actions.appliedLocale', { locale: newLocaleTools.localeLabel }));
      enqueueToast({
        variant: 'success',
        message: locale.t('actions.appliedLocale', { locale: newLocaleTools.localeLabel })
      });
      focusSelector('#header-locale-select');
    },

    exportBackup() {
      const payload = createBackupPayload($state.snapshot(appState));
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
      setLastBackupExportFileName(fileName);
      ui.lastActionNotice = locale.t('actions.exportedBackup', { fileName });
      enqueueToast({
        variant: 'success',
        message: locale.t('actions.exportedBackupToast', { fileName })
      });
    },

    openImportBackup() {
      document.getElementById('backup-import-input')?.click();
    },

    async importBackupFile(file) {
      if (!file) return;
      const importedText = await file.text();
      const parsedBackup = parseBackupText(importedText, { indexes: bundle.runtime.indexes });
      if (!parsedBackup.ok) {
        setStagedBackup(null);
        setConfirmBackupRestoreMode(null);
        setBackupImportError(parsedBackup.error);
        ui.lastActionNotice = locale.t('actions.backupImportFailed');
        enqueueToast({ variant: 'error', message: parsedBackup.error, behavior: 'persistent' });
        return;
      }
      setBackupImportError(null);
      setConfirmBackupRestoreMode(null);
      setStagedBackup({
        fileName: file.name || buildBackupFilename(parsedBackup.payload.exportedAt),
        payload: parsedBackup.payload,
        importedState: parsedBackup.importedState,
        summary: summarizeBackupState(parsedBackup.importedState)
      });
      ui.lastActionNotice = locale.t('actions.loadedBackupPreview');
    },

    cancelBackupPreview() {
      clearBackupDraft();
      ui.lastActionNotice = locale.t('actions.discardedBackupPreview');
    },

    requestMergeBackup() {
      if (!getStagedBackup()) return;
      setConfirmBackupRestoreMode('merge');
      ui.modalReturnFocusAction = 'request-merge-backup';
      ui.lastActionNotice = locale.t('actions.reviewMerge');
      focusModalCancelButton();
    },

    requestReplaceBackup() {
      if (!getStagedBackup()) return;
      setConfirmBackupRestoreMode('replace');
      ui.modalReturnFocusAction = 'request-replace-backup';
      ui.lastActionNotice = locale.t('actions.reviewReplace');
      focusModalCancelButton();
    },

    cancelBackupRestore() {
      setConfirmBackupRestoreMode(null);
      ui.lastActionNotice = locale.t('actions.keptBackupPreview');
      focusActionButton(ui.modalReturnFocusAction);
    },

    confirmMergeBackup() {
      if (!getStagedBackup()) return;
      setConfirmBackupRestoreMode(null);
      const nextState = mergeImportedState($state.snapshot(appState), $state.snapshot(getStagedBackup().importedState));
      const result = applyStateUpdate(() => nextState, locale.t('actions.mergedBackup'));
      syncUiFromPersistedState(result.state);
      enqueueToast({ variant: 'success', message: locale.t('actions.mergedBackup') });
    },

    confirmReplaceBackup() {
      if (!getStagedBackup()) return;
      setConfirmBackupRestoreMode(null);
      const result = applyStateUpdate(
        () => getStagedBackup().importedState,
        locale.t('actions.replacedBackup')
      );
      syncUiFromPersistedState(result.state);
      enqueueToast({ variant: 'warning', message: locale.t('actions.replacedBackup') });
    },

    addForcedPick(field, value) {
      if (!value) {
        ui.lastActionNotice = locale.t('actions.chooseForcedPick');
        return;
      }
      const nextForcedPicks = addForcedPick(getForcedPicks(), field, value);
      const changed = JSON.stringify(nextForcedPicks) !== JSON.stringify(getForcedPicks());
      setForcedPicks(nextForcedPicks);
      clearGeneratedSetup();
      ui.lastActionNotice = changed
        ? locale.t('actions.updatedForcedPicks')
        : locale.t('actions.duplicateForcedPick');
    },

    removeForcedPick(field, value) {
      setForcedPicks(removeForcedPick(getForcedPicks(), field, value));
      clearGeneratedSetup();
      ui.lastActionNotice = locale.t('actions.removedForcedPick');
    },

    clearForcedPicks() {
      clearForcedPicksState();
      clearGeneratedSetup();
      ui.lastActionNotice = locale.t('actions.clearedForcedPicks');
    },

    generateSetup() {
      try {
        const setup = generateSetup({
          runtime: bundle.runtime,
          state: appState,
          playerCount: getSelectedPlayerCount(),
          advancedSolo: getAdvancedSolo(),
          playMode: getSelectedPlayMode(),
          forcedPicks: getForcedPicks()
        });
        setCurrentSetup(setup);
        setGeneratorError(null);
        setGeneratorNotices(setup.notices);
        ui.lastActionNotice = locale.t('actions.generatedSetup');
      } catch (error) {
        setCurrentSetup(null);
        setGeneratorNotices([]);
        setGeneratorError(error.message);
        ui.lastActionNotice = locale.t('actions.failedSetup');
        enqueueToast({ variant: 'error', message: error.message, behavior: 'persistent' });
      }
    },

    acceptCurrentSetup() {
      if (!getCurrentSetup()) {
        ui.lastActionNotice = locale.t('actions.acceptBeforeLog');
        enqueueToast({ variant: 'warning', message: locale.t('actions.acceptBeforeLog') });
        return;
      }
      const acceptedRecordId = createGameRecordId();
      const acceptedAt = new Date().toISOString();
      applyStateUpdate((currentState) => {
        const nextState = acceptGameSetup(currentState, {
          id: acceptedRecordId,
          createdAt: acceptedAt,
          playerCount: getSelectedPlayerCount(),
          advancedSolo: getAdvancedSolo(),
          playMode: getSelectedPlayMode(),
          setupSnapshot: buildHistoryReadySetupSnapshot($state.snapshot(getCurrentSetup()))
        });
        nextState.preferences.selectedTab = 'history';
        return nextState;
      }, hasForcedPicks(getForcedPicks())
        ? locale.t('actions.acceptedLoggedForced')
        : locale.t('actions.acceptedLogged'));
      ui.selectedTab = 'history';
      openResultEditor(acceptedRecordId, {
        returnFocusSelector: `[data-action="edit-game-result"][data-record-id="${acceptedRecordId}"]`
      });
      clearForcedPicksState();
      clearGeneratedSetup();
      focusSelector('[data-result-field="outcome"]');
      enqueueToast({ variant: 'success', message: locale.t('actions.acceptedToast') });
    },

    editGameResult(recordId) {
      if (
        !openResultEditor(recordId, {
          returnFocusSelector: `[data-action="edit-game-result"][data-record-id="${recordId}"]`
        })
      )
        return;
      ui.lastActionNotice = locale.t('actions.openedResultEditor');
      focusSelector('[data-result-field="outcome"]');
    },

    setResultOutcome(outcome) {
      setResultDraft({ ...getResultDraft(), outcome });
      const hadValidationState = getResultFormError() || getResultInvalidFields().length;
      setResultFormError(null);
      setResultInvalidFields([]);
      if (hadValidationState) focusSelector('[data-result-field="outcome"]');
    },

    setResultScore(score) {
      setResultDraft({ ...getResultDraft(), score });
      setResultFormError(null);
      setResultInvalidFields([]);
      focusSelector('[data-result-field="score"]');
    },

    setResultNotes(notes) {
      setResultDraft({ ...getResultDraft(), notes });
      const hadValidationState = getResultFormError() || getResultInvalidFields().length;
      setResultFormError(null);
      setResultInvalidFields([]);
      if (hadValidationState) focusSelector('[data-result-field="notes"]');
    },

    skipGameResultEntry() {
      const returnFocusSelector = closeResultEditor();
      ui.lastActionNotice = locale.t('actions.pendingResult');
      focusSelector(returnFocusSelector);
      enqueueToast({ variant: 'info', message: locale.t('actions.pendingResultToast') });
    },

    cancelResultEntry() {
      const returnFocusSelector = closeResultEditor();
      ui.lastActionNotice = locale.t('actions.closedResultEditor');
      focusSelector(returnFocusSelector);
    },

    saveGameResult() {
      if (!getResultEditorRecordId()) return;
      const validation = validateGameResultDraft(getResultDraft());
      if (!validation.ok) {
        setResultFormError(validation.errors
          .map((message) => locale.localizeValidationMessage(message))
          .join(' '));
        setResultInvalidFields(validation.errors.flatMap((message) => {
          if (message.includes('Win or Loss')) return ['outcome'];
          if (message.toLowerCase().includes('score')) return ['score'];
          return [];
        }));
        ui.lastActionNotice = locale.t('actions.finishResultFields');
        focusSelector('[data-result-form-error]');
        return;
      }
      const activeRecordId = getResultEditorRecordId();
      const returnFocusSelector = getResultEditorReturnFocusSelector();
      const wasPending =
        appState.history.find((r) => r.id === activeRecordId)?.result?.status !== 'completed';
      applyStateUpdate(
        (currentState) =>
          updateGameResult(currentState, {
            recordId: activeRecordId,
            outcome: validation.result.outcome,
            score: validation.result.score,
            notes: validation.result.notes,
            updatedAt: validation.result.updatedAt
          }),
        wasPending
          ? locale.t('actions.savedResult')
          : locale.t('actions.savedCorrectedResult')
      );
      closeResultEditor();
      focusSelector(returnFocusSelector);
      enqueueToast({
        variant: 'success',
        message: wasPending
          ? locale.t('actions.savedResultToast')
          : locale.t('actions.savedCorrectedResultToast')
      });
    },

    toggleHistoryInsights() {
      toggleHistoryInsights();
      focusSelector('[data-action="toggle-history-insights"]');
    },

    resetUsageCategory(category) {
      ui.confirmResetAllState = false;
      closeResultEditor();
      const label = locale.getUsageLabel(category);
      applyStateUpdate(
        (currentState) => resetUsageCategoryStore(currentState, category),
        locale.t('actions.resetUsageStats', { label })
      );
      enqueueToast({ variant: 'info', message: locale.t('actions.resetUsageStats', { label }) });
    },

    resetAllState() {
      ui.confirmResetAllState = false;
      const result = resetAllStateStore({ storageAdapter });
      appState = result.state;
      persistence.updateNotices = result.notices;
      persistence.lastSaveMessage = result.save.message;
      persistence.lastSaveOk = result.save.ok;
      syncUiFromPersistedState(result.state);
      ui.selectedTab = DEFAULT_TAB_ID;
      ui.lastActionNotice = locale.t('actions.resetAllDefaults');
      if (result.save.ok) {
        enqueueToast({ variant: 'warning', message: locale.t('actions.resetAllDefaults') });
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
      persistence.lastSaveMessage = save.message;
      persistence.lastSaveOk = save.ok;
      ui.lastActionNotice = save.ok
        ? 'Wrote corrupted JSON to browser storage. Reload the page to verify recovery.'
        : 'Could not write corrupted JSON to browser storage.';
      enqueueToast({
        variant: save.ok ? 'warning' : 'error',
        message: ui.lastActionNotice,
        behavior: 'persistent'
      });
    },

    injectInvalidOwnedSet() {
      const corruptedState = $state.snapshot(appState);
      corruptedState.collection.ownedSetIds = [
        ...corruptedState.collection.ownedSetIds,
        'definitely-missing-set'
      ];
      const save = storageAdapter.setItem(STORAGE_KEY, JSON.stringify(corruptedState, null, 2));
      persistence.lastSaveMessage = save.message;
      persistence.lastSaveOk = save.ok;
      ui.lastActionNotice = save.ok
        ? 'Wrote an invalid owned set ID to storage. Reload the page to verify safe cleanup.'
        : 'Could not write an invalid owned set ID to browser storage.';
      enqueueToast({
        variant: save.ok ? 'warning' : 'error',
        message: ui.lastActionNotice,
        behavior: 'persistent'
      });
    },

    clearToDefaults() {
      const defaultState = createDefaultState();
      setSelectedPlayerCount(defaultState.preferences.lastPlayerCount);
      setSelectedPlayMode(defaultState.preferences.lastPlayMode);
      setAdvancedSolo(defaultState.preferences.lastAdvancedSolo);
      clearForcedPicksState();
      closeResultEditor();
      clearGeneratedSetup();
      ui.lastActionNotice = locale.t('actions.clearDefaults');
      enqueueToast({ variant: 'info', message: locale.t('actions.clearDefaults') });
    }
  };

  // ---------------------------------------------------------------------------
  // Document-level event delegation (for {@html} tab/onboarding content)
  // Actions handled by Svelte directly are in the skip set.
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------
  $effect(() => {
    let destroyed = false;
    const mq = window.matchMedia('(max-width: 767px)');
    compactViewport = mq.matches;
    const onViewportChange = (e) => { compactViewport = e.matches; };
    mq.addEventListener('change', onViewportChange);

    async function init() {
      if (destroyed) return;
      try {
        const seed = await loadSeed();
        if (destroyed) return;
        const loadedBundle = createEpic1Bundle(seed);
        storageAdapter = createStorageAdapter(globalThis.localStorage);
        const hydration = hydrateState({ storageAdapter, indexes: loadedBundle.runtime.indexes });

        bundle = loadedBundle;
        appState = hydration.state;
        locale = createLocaleTools(hydration.state.preferences.localeId);
        persistence = {
          storageAvailable: hydration.storageAvailable,
          hydratedFromStorage: hydration.hydratedFromStorage,
          recoveredOnLoad: hydration.recovered,
          hydrateNotices: hydration.notices,
          updateNotices: [],
          lastSaveMessage: null,
          lastSaveOk: null
        };
        ui.onboardingVisible = !hydration.state.preferences.onboardingCompleted;
        ui.selectedTab = normalizeSelectedTab(hydration.state.preferences.selectedTab);
        setSelectedPlayerCount(hydration.state.preferences.lastPlayerCount);
        setSelectedPlayMode(resolvePlayMode(hydration.state.preferences.lastPlayerCount, {
          advancedSolo: hydration.state.preferences.lastAdvancedSolo,
          playMode: hydration.state.preferences.lastPlayMode
        }));
        setAdvancedSolo(hydration.state.preferences.lastAdvancedSolo);

        if (hydration.notices.length) {
          hydration.notices.forEach((notice) =>
            enqueueToast({
              variant: 'warning',
              message: localizeNotice(notice),
              behavior: 'persistent'
            })
          );
        }
      } catch (error) {
        console.error(error);
        globalThis.__EPIC1_ERROR__ = error;
        initError = error;
      }
    }

    init();

    return () => {
      destroyed = true;
      mq.removeEventListener('change', onViewportChange);
    };
  });
</script>

{#if initError}
  <header class="app-header">
    <div class="header-inner">
      <div class="header-top-row">
        <div class="header-copy">
          <h1 id="app-title">Legendary: Marvel Randomizer</h1>
        </div>
        <div class="header-icon-strip"></div>
      </div>
      <div class="header-controls">
        <div class="desktop-tab-nav" id="desktop-tabs" aria-label="Primary" role="tablist"></div>
      </div>
    </div>
  </header>
  <main class="app-main">
    <section id="toast-region" aria-live="polite" aria-atomic="false"></section>
    <section class="stack gap-md" id="diagnostics-shell">
      <section class="panel">
        <h2>Initialization status</h2>
        <p class="error">Initialization failed: {initError.message}</p>
        <pre>{initError.stack || String(initError)}</pre>
      </section>
    </section>
    <div class="tab-panel-shell">
      {#each APP_TABS as tab (tab.id)}
        <div class="tab-panel" id="panel-{tab.id}" role="tabpanel" hidden={tab.id !== 'browse'}></div>
      {/each}
    </div>
  </main>
  <div class="mobile-tab-nav" id="mobile-tabs" aria-label="Primary mobile" role="tablist"></div>
  <div id="modal-root"></div>

{:else if isLoaded}
  <header class="app-header" data-onboarding-visible={String(ui.onboardingVisible)}>
    <div class="header-inner">
      <div class="header-top-row">
        <div class="header-copy">
          <h1 id="app-title">{locale.t('app.title')}</h1>
          <p id="app-subtitle">{locale.t('app.subtitle')}</p>
        </div>
        <div class="header-right">
        <div class="header-icon-strip">
        <!-- Compact preference strip (always visible, mobile and desktop) -->
        <div id="header-locale-controls" class="locale-wrap" data-locale-switcher>
          <span class="locale-flag" aria-hidden="true">{getLocaleFlag(activeLocaleId)}</span>
          <select
            id="header-locale-select"
            class="locale-select-compact"
            data-action="set-locale-select"
            aria-label={locale.t('header.locale.groupLabel')}
            onchange={(e) => actions.setLocale(e.target.value)}
          >
            {#each getSelectableLocales() as option (option.id)}
              <option value={option.id} selected={activeLocaleId === option.id}>{option.nativeLabel}</option>
            {/each}
          </select>
        </div>
        <div id="header-theme-controls" class="theme-icon-row" data-theme-switcher role="group" aria-label={locale.t('header.theme.groupLabel')}>
          {#each THEME_OPTIONS as theme (theme.id)}
            <button
              type="button"
              class={"icon-btn " + (activeThemeId === theme.id ? 'icon-btn-active' : '')}
              data-action="set-theme"
              data-theme-id={theme.id}
              aria-pressed={activeThemeId === theme.id}
              title={locale.getThemeDescription(theme.id)}
              onclick={() => actions.setTheme(theme.id)}
            >{getThemeIcon(theme.id)}</button>
          {/each}
        </div>
        <a
          href="https://github.com/Alban34/random-legendary-llm"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          class="github-link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="28" height="28" aria-hidden="true" focusable="false"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
        </a>
        </div>
        <span class="app-version" id="app-version">v{__APP_VERSION__}</span>
        </div>
      </div>
      <div class="header-controls">
        <!-- Desktop tab navigation -->
        <TabNav
          tabs={APP_TABS}
          activeTab={activeTabId}
          {locale}
          variant="desktop"
          navId="desktop-tabs"
          navLabel={locale.t('header.primaryNav')}
          onTabSelect={actions.selectTab}
          onTabKeydown={actions.handleTabKeydown}
        />
      </div>
    </div>
  </header>

  <main class="app-main">
    <!-- Toast region -->
    <section id="toast-region" aria-live="polite" aria-atomic="false">
      {#if ui.toasts.length}
        <ToastStack
          toasts={ui.toasts}
          {locale}
          onDismiss={dismissToast}
          onPause={pauseToastDismissal}
          onResume={resumeToastDismissal}
        />
      {/if}
    </section>

    <!-- Onboarding shell -->
    <section class="stack gap-md" id="diagnostics-shell" hidden={!ui.onboardingVisible}>
      {#if isLoaded}
        <OnboardingShell
          {locale}
          visible={ui.onboardingVisible}
          step={ui.onboardingStep}
          onboardingCompleted={appState.preferences.onboardingCompleted}
          onPreviousStep={actions.previousOnboardingStep}
          onNextStep={actions.nextOnboardingStep}
          onSkip={actions.skipOnboarding}
          onComplete={actions.completeOnboarding}
          onOpenTab={actions.openOnboardingTab}
        />
      {/if}
    </section>

    <!-- Tab panels -->
    <div class="tab-panel-shell">
      {#each APP_TABS as tab (tab.id)}
        <div
          class="tab-panel"
          id="panel-{tab.id}"
          role="tabpanel"
          hidden={activeTabId !== tab.id}
          aria-labelledby={"tab-desktop-" + tab.id + " tab-mobile-" + tab.id}
        >
          {#if isLoaded}
            {#if tab.id === 'browse'}
              <BrowseTab
                {bundle}
                {appState}
                {locale}
                {persistence}
                browseSearchTerm={getBrowseSearchTerm()}
                browseTypeFilter={getBrowseTypeFilter()}
                expandedBrowseSetId={getExpandedBrowseSetId()}
                {compactViewport}
                aboutPanelOpen={ui.aboutPanelOpen}
                onboardingVisible={ui.onboardingVisible}
                currentSetup={getCurrentSetup()}
                selectedTab={ui.selectedTab}
                onToggleOwnedSet={actions.toggleOwnedSet}
                onSetSearchTerm={actions.setBrowseSearchTerm}
                onSetTypeFilter={actions.setBrowseTypeFilter}
                onToggleSetExpanded={actions.toggleBrowseSetExpanded}
                onJumpTab={actions.selectTab}
                onToggleAboutPanel={actions.toggleAboutPanel}
                onStartOnboarding={actions.startOnboarding}
              />
            {:else if tab.id === 'collection'}
              <CollectionTab
                {bundle}
                {appState}
                {locale}
                {persistence}
                lastActionNotice={ui.lastActionNotice}
                onToggleOwnedSet={actions.toggleOwnedSet}
                onRequestResetOwnedCollection={actions.requestResetOwnedCollection}
              />
            {:else if tab.id === 'new-game'}
              <NewGameTab
                {bundle}
                {appState}
                {locale}
                selectedPlayerCount={getSelectedPlayerCount()}
                selectedPlayMode={getSelectedPlayMode()}
                advancedSolo={getAdvancedSolo()}
                currentSetup={getCurrentSetup()}
                generatorError={getGeneratorError()}
                generatorNotices={getGeneratorNotices()}
                forcedPicks={getForcedPicks()}
                {compactViewport}
                onSetPlayerCount={actions.setPlayerCount}
                onSetPlayMode={actions.setPlayMode}
                onGenerateSetup={actions.generateSetup}
                onAcceptCurrentSetup={actions.acceptCurrentSetup}
                onAddForcedPick={actions.addForcedPick}
                onRemoveForcedPick={actions.removeForcedPick}
                onClearForcedPicks={actions.clearForcedPicks}
                onClearToDefaults={actions.clearToDefaults}
              />
            {:else if tab.id === 'history'}
              <HistoryTab
                {bundle}
                {appState}
                {locale}
                {compactViewport}
                historyGroupingMode={getHistoryGroupingMode()}
                historyInsightsExpanded={getHistoryInsightsExpanded()}
                historyExpandedRecordId={getHistoryExpandedRecordId()}
                resultEditorRecordId={getResultEditorRecordId()}
                resultDraft={getResultDraft()}
                resultFormError={getResultFormError()}
                resultInvalidFields={getResultInvalidFields()}
                onSetHistoryGrouping={actions.setHistoryGrouping}
                onEditGameResult={actions.editGameResult}
                onToggleHistoryInsights={actions.toggleHistoryInsights}
                onSaveGameResult={actions.saveGameResult}
                onSkipGameResult={actions.skipGameResultEntry}
                onCancelResultEntry={actions.cancelResultEntry}
                onSetResultOutcome={actions.setResultOutcome}
                onSetResultScore={actions.setResultScore}
                onSetResultNotes={actions.setResultNotes}
              />
            {:else if tab.id === 'backup'}
              <BackupTab
                {bundle}
                {appState}
                {locale}
                {persistence}
                {compactViewport}
                backupImportError={getBackupImportError()}
                stagedBackup={getStagedBackup()}
                confirmBackupRestoreMode={getConfirmBackupRestoreMode()}
                lastBackupExportFileName={getLastBackupExportFileName()}
                onExportBackup={actions.exportBackup}
                onOpenImportBackup={actions.openImportBackup}
                onImportBackupFile={actions.importBackupFile}
                onCancelBackupPreview={actions.cancelBackupPreview}
                onRequestMergeBackup={actions.requestMergeBackup}
                onRequestReplaceBackup={actions.requestReplaceBackup}
                onResetUsageCategory={actions.resetUsageCategory}
                onRequestResetAllState={actions.requestResetAllState}
              />
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </main>

  <!-- Mobile tab navigation -->
  <TabNav
    tabs={APP_TABS}
    activeTab={activeTabId}
    {locale}
    variant="mobile"
    navId="mobile-tabs"
    navLabel={locale.t('header.primaryNavMobile')}
    onTabSelect={actions.selectTab}
    onTabKeydown={actions.handleTabKeydown}
  />

  <!-- Modal root -->
  <div id="modal-root">
    {#if modalConfig}
      <div class="modal-backdrop">
        <div
          class="modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          tabindex="-1"
          onkeydown={handleModalKeydown}
        >
          <h2 id="modal-title">{modalConfig.title}</h2>
          <p id="modal-description">{modalConfig.description}</p>
          <div class="button-row confirmation-actions">
            <button
              type="button"
              class="button button-secondary"
              data-action={modalConfig.cancelAction}
              data-modal-focus="cancel"
              onclick={modalConfig.onCancel}
            >{locale.t('modal.cancel')}</button>
            <button
              type="button"
              class="button button-danger"
              data-action={modalConfig.confirmAction}
              data-modal-focus="confirm"
              onclick={modalConfig.onConfirm}
            >{modalConfig.confirmLabel}</button>
          </div>
        </div>
      </div>
    {/if}
  </div>

{:else}
  <!-- Loading shell — briefly visible while data loads; preserves all DOM IDs for Playwright -->
  <header class="app-header">
    <div class="header-inner">
      <div class="header-top-row">
        <div class="header-copy">
          <h1 id="app-title">{globalThis.__LEGENDARY_BOOTSTRAP_COPY__?.title ?? 'Legendary: Marvel Randomizer'}</h1>
          <p id="app-subtitle">{globalThis.__LEGENDARY_BOOTSTRAP_COPY__?.subtitle ?? ''}</p>
        </div>
        <div class="header-right">
          <div class="header-icon-strip"></div>
          <span class="app-version" id="app-version">v{__APP_VERSION__}</span>
        </div>
      </div>
      <div class="header-controls">
        <div class="desktop-tab-nav" id="desktop-tabs" aria-label="Primary" role="tablist"></div>
      </div>
    </div>
  </header>
  <main class="app-main">
    <section id="toast-region" aria-live="polite" aria-atomic="false"></section>
    <section class="stack gap-md" id="diagnostics-shell" hidden></section>
    <div class="tab-panel-shell">
      {#each APP_TABS as tab (tab.id)}
        <div class="tab-panel" id="panel-{tab.id}" role="tabpanel" hidden={tab.id !== 'browse'}></div>
      {/each}
    </div>
  </main>
  <div class="mobile-tab-nav" id="mobile-tabs" aria-label="Primary mobile" role="tablist"></div>
  <div id="modal-root"></div>
{/if}
