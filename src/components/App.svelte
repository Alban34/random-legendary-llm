<script lang="ts">
  import TabNav from './TabNav.svelte';
  import BrowseTab from './BrowseTab.svelte';
  import CollectionTab from './CollectionTab.svelte';
  import NewGameTab from './NewGameTab.svelte';
  import HistoryTab from './HistoryTab.svelte';
  import BackupTab from './BackupTab.svelte';
  import { createEpic1Bundle } from '../app/game-data-pipeline.ts';
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import { APP_TABS, DEFAULT_TAB_ID, getAdjacentTabId, normalizeSelectedTab } from '../app/app-tabs.ts';
  import { Toaster, toast } from 'svelte-sonner';
  import { addForcedPick, hasForcedPicks, removeForcedPick } from '../app/forced-picks-utils.ts';
  import { DEFAULT_HISTORY_GROUPING_MODE, HISTORY_GROUPING_MODES } from '../app/history-utils.ts';
  import { createLocaleTools, getSelectableLocales, normalizeLocaleId } from '../app/localization-utils.ts';
  import { normalizeGameResultDraft, validateGameResultDraft, isCompletedGameResult } from '../app/result-utils.ts';
  import OnboardingShell from './OnboardingShell.svelte';
  import { buildHistoryReadySetupSnapshot, generateSetup } from '../app/setup-generator.ts';
  import { resolvePlayMode } from '../app/setup-rules.ts';
  import { getThemeDefinition, normalizeThemeId, THEME_OPTIONS } from '../app/theme-utils.ts';
  import type { AppState, LocaleTools, StorageAdapter, AppPersistenceState, ModalConfig, AppTab } from '../app/types.ts';
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
    setActiveSetIds as setActiveSetIdsStore,
    clearActiveSetIds as clearActiveSetIdsStore,
    deactivateAllSets as deactivateAllSetsStore,
    updateGameResult,
    updateState
  } from '../app/state-store.ts';
  import {
    buildBackupFilename,
    createBackupPayload,
    mergeImportedState,
    parseBackupText,
    summarizeBackupState
  } from '../app/backup-utils.ts';
  import { mergeOwnedSets } from '../app/collection-utils.ts';
  import { parseMyludoFile, matchMyludoNamesToSets } from '../app/myludo-import-utils.ts';
  import { fetchBggCollection, matchBggNamesToSets } from '../app/bgg-import-utils.ts';
  import {
    getBrowseSearchTerm, setBrowseSearchTerm,
    getBrowseTypeFilter, setBrowseTypeFilter,
    getExpandedBrowseSetId, setExpandedBrowseSetId
  } from '../app/browse-vm.svelte.ts';
  import {
    getCurrentSetup, setCurrentSetup,
    getGeneratorError, setGeneratorError,
    getGeneratorNotices, setGeneratorNotices,
    getSelectedPlayerCount, setSelectedPlayerCount,
    getSelectedPlayMode, setSelectedPlayMode,
    getAdvancedSolo, setAdvancedSolo,
    getForcedPicks, setForcedPicks, resetForcedPicks
  } from '../app/new-game-vm.svelte.ts';
  import {
    getHistoryExpandedRecordId, setHistoryExpandedRecordId,
    getHistoryInsightsExpanded, setHistoryInsightsExpanded, toggleHistoryInsights,
    getHistoryGroupingMode, setHistoryGroupingMode, resetHistoryGroupingMode,
    getResultEditorRecordId, setResultEditorRecordId,
    getResultEditorReturnFocusSelector, setResultEditorReturnFocusSelector,
    getResultDraft, setResultDraft, resetResultDraft,
    resetResultDraftForPlayerCount,
    getResultFormError, setResultFormError,
    getResultInvalidFields, setResultInvalidFields,
    setResultPlayerScore, setResultPlayerName
  } from '../app/history-vm.svelte.ts';
  import {
    getBackupImportError, setBackupImportError,
    getStagedBackup, setStagedBackup,
    getConfirmBackupRestoreMode, setConfirmBackupRestoreMode,
    getLastBackupExportFileName, setLastBackupExportFileName
  } from '../app/backup-vm.svelte.ts';
  import {
    getMyludoImportStatus, setMyludoImportStatus,
    getMyludoImportError, setMyludoImportError,
    getMyludoImportSummary, setMyludoImportSummary,
    getBggImportStatus, setBggImportStatus,
    getBggImportError, setBggImportError,
    getBggImportSummary, setBggImportSummary
  } from '../app/import-vm.svelte.ts';
  import { focusActionButton, focusSelector, focusModalCancelButton } from '../app/focus-utils.ts';
  import ModalRoot from './ModalRoot.svelte';

  /* global __APP_VERSION__ */

  async function loadSeed(): Promise<unknown> {
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
  let bundle = $state<Epic1Bundle | null>(null);
  let appState = $state<AppState | null>(null);
  let locale = $state<LocaleTools | null>(null);
  let persistence = $state<AppPersistenceState>({
    storageAvailable: true,
    hydratedFromStorage: false,
    recoveredOnLoad: false,
    hydrateNotices: [],
    updateNotices: [],
    lastSaveMessage: null,
    lastSaveOk: null
  });
  let ui = $state<{
    lastActionNotice: string | null;
    confirmResetOwnedCollection: boolean;
    confirmResetAllState: boolean;
    modalReturnFocusAction: string | null;
    onboardingVisible: boolean;
    onboardingStep: number;
    aboutPanelOpen: boolean;
    mobilePreferencesOpen: boolean;
    selectedTab: string;
  }>({
    lastActionNotice: null,
    confirmResetOwnedCollection: false,
    confirmResetAllState: false,
    modalReturnFocusAction: null,
    onboardingVisible: false,
    onboardingStep: 0,
    aboutPanelOpen: false,
    mobilePreferencesOpen: false,
    selectedTab: DEFAULT_TAB_ID
  });
  let compactViewport = $state<boolean>(false);
  let initError = $state<Error | null>(null);

  // Non-reactive helpers
  let storageAdapter: StorageAdapter | null = null;

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
    document.documentElement.lang = locale!.documentLang;
    document.documentElement.style.colorScheme = activeTheme.colorScheme;
    document.title = locale!.t('app.documentTitle');
  });

  $effect(() => {
    if (!isLoaded) return;
    syncGlobals();
  });

  // Toast cap: dismiss the oldest when more than 4 are active
  $effect(() => {
    const active = toast.getActiveToasts();
    if (active.length > 4) {
      toast.dismiss(active[active.length - 1].id);
    }
  });

  // Focus management: when a keyboard Enter/Space press dismisses a toast, move focus to the
  // next remaining close button. Uses keydown (capture) so both buttons are still in the DOM
  // when we record the candidate — more reliable than querying after the DOM mutation.
  $effect(() => {
    function handleKeydown(e: Event) {
      const ke = e as KeyboardEvent;
      if (ke.key !== 'Enter' && ke.key !== ' ') return;
      const target = ke.target as HTMLElement | null;
      if (!target?.hasAttribute('data-close-button')) return;

      const toaster = document.querySelector<HTMLElement>('[data-sonner-toaster]');
      if (!toaster) return;

      const buttons = Array.from(toaster.querySelectorAll<HTMLElement>('[data-close-button]'));
      const idx = buttons.indexOf(target);
      const candidate = buttons[idx + 1] ?? buttons[idx - 1];

      if (candidate) {
        setTimeout(() => {
          if (document.contains(candidate)) {
            candidate.focus();
          } else {
            const fallback = toaster.querySelector<HTMLElement>('[data-close-button]');
            if (fallback) fallback.focus();
          }
        }, 50);
      }
    }
    document.addEventListener('keydown', handleKeydown, true);
    return () => document.removeEventListener('keydown', handleKeydown, true);
  });

  // ---------------------------------------------------------------------------
  // Debug globals (mirrors syncDebugGlobals from browser-entry.mjs)
  // ---------------------------------------------------------------------------
  function syncGlobals() {
    if (!import.meta.env.DEV) return;
    if (!bundle || !appState) return;
    (globalThis as Record<string, unknown>).__EPIC1 = bundle;
    (globalThis as Record<string, unknown>).__APP_STATE__ = appState;
    (globalThis as Record<string, unknown>).__APP_PERSISTENCE__ = persistence;
    (globalThis as Record<string, unknown>).__CURRENT_SETUP__ = getCurrentSetup();
    (globalThis as Record<string, unknown>).__ACTIVE_TAB__ = ui.selectedTab;
    (globalThis as Record<string, unknown>).__BROWSE_UI__ = {
      searchTerm: getBrowseSearchTerm(),
      typeFilter: getBrowseTypeFilter(),
      expandedSetId: getExpandedBrowseSetId()
    };
    (globalThis as Record<string, unknown>).__COLLECTION_UI__ = { confirmResetOwnedCollection: ui.confirmResetOwnedCollection };
    (globalThis as Record<string, unknown>).__HISTORY_UI__ = {
      groupingMode: getHistoryGroupingMode(),
      supportedGroupingModes: HISTORY_GROUPING_MODES,
      confirmResetAllState: ui.confirmResetAllState,
      resultEditorRecordId: getResultEditorRecordId(),
      resultDraft: getResultDraft(),
      resultFormError: getResultFormError(),
      resultInvalidFields: getResultInvalidFields(),
      historyInsightsExpanded: getHistoryInsightsExpanded()
    };
    (globalThis as Record<string, unknown>).__ONBOARDING_UI__ = {
      visible: ui.onboardingVisible,
      step: ui.onboardingStep,
      aboutOpen: ui.aboutPanelOpen,
      completed: appState.preferences.onboardingCompleted,
      mobilePreferencesOpen: ui.mobilePreferencesOpen
    };
    (globalThis as Record<string, unknown>).__PLAY_MODE_UI__ = {
      playerCount: getSelectedPlayerCount(),
      playMode: getSelectedPlayMode(),
      advancedSolo: getAdvancedSolo()
    };
    (globalThis as Record<string, unknown>).__THEME_UI__ = {
      activeThemeId: appState.preferences.themeId,
      supportedThemes: THEME_OPTIONS.map((theme) => ({
        id: theme.id,
        label: locale!.getThemeLabel(theme.id)
      }))
    };
    (globalThis as Record<string, unknown>).__LOCALE_UI__ = {
      activeLocaleId: appState.preferences.localeId,
      supportedLocales: getSelectableLocales()
    };
    (globalThis as Record<string, unknown>).__BACKUP_UI__ = {
      importError: getBackupImportError(),
      stagedBackupSummary: getStagedBackup()?.summary || null,
      confirmRestoreMode: getConfirmBackupRestoreMode(),
      lastExportFileName: getLastBackupExportFileName() || null
    };
    (globalThis as Record<string, unknown>).__FORCED_PICKS_UI__ = getForcedPicks();
  }

  // ---------------------------------------------------------------------------
  // Modal config
  // ---------------------------------------------------------------------------
  function computeModalConfig(): ModalConfig | null {
    if (!locale || !appState) return null;
    if (ui.confirmResetOwnedCollection) {
      return {
        title: locale!.t('modal.reset.title'),
        description: locale!.t('modal.resetCollection.description'),
        cancelAction: 'cancel-reset-owned-collection',
        confirmAction: 'confirm-reset-owned-collection',
        confirmLabel: locale!.t('modal.resetCollection.confirm'),
        onCancel: () => actions.cancelResetOwnedCollection(),
        onConfirm: () => actions.confirmResetOwnedCollection()
      };
    }
    if (ui.confirmResetAllState) {
      return {
        title: locale!.t('modal.reset.title'),
        description: locale!.t('modal.resetAll.description'),
        cancelAction: 'cancel-reset-all-state',
        confirmAction: 'confirm-reset-all-state',
        confirmLabel: locale!.t('modal.resetAll.confirm'),
        onCancel: () => actions.cancelResetAllState(),
        onConfirm: () => actions.resetAllState()
      };
    }
    if (getConfirmBackupRestoreMode() && getStagedBackup()) {
      const { summary } = getStagedBackup()!;
      if (getConfirmBackupRestoreMode() === 'merge') {
        return {
          title: locale!.t('modal.merge.title'),
          description: locale!.t('modal.merge.description', {
            ownedSetCount: locale!.formatNumber(summary.ownedSetCount),
            historyCount: locale!.formatNumber(summary.historyCount)
          }),
          cancelAction: 'cancel-backup-restore',
          confirmAction: 'confirm-merge-backup',
          confirmLabel: locale!.t('modal.merge.confirm'),
          onCancel: () => actions.cancelBackupRestore(),
          onConfirm: () => actions.confirmMergeBackup()
        };
      }
      return {
        title: locale!.t('modal.replace.title'),
        description: locale!.t('modal.replace.description', {
          historyCount: locale!.formatNumber(summary.historyCount)
        }),
        cancelAction: 'cancel-backup-restore',
        confirmAction: 'confirm-replace-backup',
        confirmLabel: locale!.t('modal.replace.confirm'),
        onCancel: () => actions.cancelBackupRestore(),
        onConfirm: () => actions.confirmReplaceBackup()
      };
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // State helpers
  // ---------------------------------------------------------------------------
  function refreshLocaleState() {
    locale = createLocaleTools(appState!.preferences.localeId);
  }

  function localizeNotice(notice: string) {
    return locale!.localizeNotice(notice);
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

  function getLocaleFlag(localeId: string) {
    const flags = {
      'en-US': '🇺🇸',
      'fr-FR': '🇫🇷',
      'de-DE': '🇩🇪',
      'ja-JP': '🇯🇵',
      'ko-KR': '🇰🇷',
      'es-ES': '🇪🇸'
    };
    return (flags as Record<string, string>)[localeId] ?? '🌐';
  }

  function getThemeIcon(themeId: string) {
    const icons = { dark: '🌙', light: '☀️' };
    return (icons as Record<string, string>)[themeId] ?? '🎨';
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

  function openResultEditor(recordId: string, options: { returnFocusSelector?: string } = {}) {
    const record = appState!.history.find((entry) => entry.id === recordId);
    if (!record) return false;
    setResultEditorRecordId(recordId);
    setResultEditorReturnFocusSelector(
      options.returnFocusSelector ??
      `[data-action="edit-game-result"][data-record-id="${recordId}"]`
    );
    if (record.playerCount >= 2) {
      if (isCompletedGameResult(record.result)) {
        setResultDraft(normalizeGameResultDraft(record.result, record.playerCount));
      } else {
        resetResultDraftForPlayerCount(record.playerCount);
      }
    } else {
      setResultDraft(normalizeGameResultDraft(record.result));
    }
    setResultFormError(null);
    setResultInvalidFields([]);
    setHistoryExpandedRecordId(recordId);
    return true;
  }

  function syncUiFromPersistedState(nextState: AppState) {
    appState = nextState;
    refreshLocaleState();
    ui.selectedTab = normalizeSelectedTab(nextState.preferences.selectedTab) ?? DEFAULT_TAB_ID;
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

  function applyStateUpdate(updater: (s: AppState) => AppState, actionNotice: string) {
    const result = updateState({
      storageAdapter: storageAdapter!,
      indexes: bundle!.runtime.indexes,
      currentState: $state.snapshot(appState!),
      updater
    });
    appState = result.state;
    refreshLocaleState();
    persistence.updateNotices = result.notices;
    persistence.lastSaveMessage = result.save.message;
    persistence.lastSaveOk = result.save.ok;
    ui.lastActionNotice = actionNotice;
    result.notices.forEach((notice) =>
      toast.warning(localizeNotice(notice), { duration: Infinity })
    );
    if (!result.save.ok) {
      if (result.save.storageAvailable === false) {
        toast.warning(result.save.message, { duration: Infinity });
      } else {
        toast.error(result.save.message, { duration: Infinity });
      }
    }
    return result;
  }

  function persistPreferences(playerCount: number, playMode: string, actionNotice: string) {
    const normalizedPlayMode = resolvePlayMode(playerCount, { playMode });
    const advancedSolo = normalizedPlayMode === 'advanced-solo';
    setSelectedPlayerCount(playerCount);
    setSelectedPlayMode(normalizedPlayMode);
    setAdvancedSolo(advancedSolo);
    clearGeneratedSetup();
    applyStateUpdate((currentState: AppState) => {
      currentState.preferences.lastPlayerCount = playerCount;
      currentState.preferences.lastAdvancedSolo = advancedSolo;
      currentState.preferences.lastPlayMode = normalizedPlayMode;
      return currentState;
    }, actionNotice);
  }

  function persistSelectedTab(tabId: string | null, actionNotice: string) {
    const normalizedTabId = normalizeSelectedTab(tabId);
    ui.selectedTab = normalizedTabId ?? DEFAULT_TAB_ID;
    applyStateUpdate((currentState: AppState) => {
      currentState.preferences.selectedTab = normalizedTabId;
      return currentState;
    }, actionNotice);
  }

  function completeOnboardingFlow(actionNotice: string) {
    ui.onboardingVisible = false;
    ui.onboardingStep = 0;
    applyStateUpdate((currentState: AppState) => {
      currentState.preferences.onboardingCompleted = true;
      return currentState;
    }, actionNotice);
    focusSelector('[data-browse-primary-cta], [data-action="select-tab"][aria-selected="true"]');
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  type ActionsShape = {
    setTheme: (themeId: string) => void;
    setLocale: (localeId: string) => void;
    selectTab: (tabId: string) => void;
    handleTabKeydown: (tabId: string, key: string) => void;
    setHistoryGrouping: (mode: string) => void;
    toggleOwnedSet: (setId: string) => void;
    setActiveSetIds: (ids: string[]) => void;
    setBrowseSearchTerm: (searchTerm: string) => void;
    setBrowseTypeFilter: (typeFilter: string) => void;
    openOnboardingTab: (tabId: string) => void;
    toggleBrowseSetExpanded: (setId: string) => void;
    setPlayerCount: (playerCount: number) => void;
    setPlayMode: (playMode: string) => void;
    setEpicMastermind: (enabled: boolean) => void;
    editGameResult: (recordId: string) => void;
    setResultOutcome: (outcome: string) => void;
    setResultScore: (score: string) => void;
    setResultNotes: (notes: string) => void;
    setResultPlayerScore: (index: number, value: string) => void;
    setResultPlayerName: (index: number, value: string) => void;
    resetUsageCategory: (category: string) => void;
    importBackupFile: (file: File) => void;
    importMyludoFile: (file: File) => void;
    importBggCollection: (username: string) => Promise<void>;
    addForcedPick: (field: string, value: string) => void;
    removeForcedPick: (field: string, value: string) => void;
    setPreferredExpansion: (id: string | null) => void;
    clearToDefaults: () => void;
    dismissMyludoSummary: () => void;
    dismissBggSummary: () => void;
    clearActiveSetIds: () => void;
    deactivateAllSets: () => void;
    skipOnboarding: () => void;
    completeOnboarding: () => void;
    requestResetOwnedCollection: () => void;
    cancelResetOwnedCollection: () => void;
    confirmResetOwnedCollection: () => void;
    requestResetAllState: () => void;
    cancelResetAllState: () => void;
    resetAllState: () => void;
    acceptCurrentSetup: () => void;
    clearForcedPicks: () => void;
    generateSetup: () => void;
    toggleAboutPanel: () => void;
    startOnboarding: () => void;
    previousOnboardingStep: () => void;
    nextOnboardingStep: () => void;
    toggleHistoryInsights: () => void;
    saveGameResult: () => void;
    skipGameResultEntry: () => void;
    cancelResultEntry: () => void;
    exportBackup: () => void;
    openImportBackup: () => void;
    cancelBackupPreview: () => void;
    requestMergeBackup: () => void;
    requestReplaceBackup: () => void;
    cancelBackupRestore: () => void;
    confirmMergeBackup: () => void;
    confirmReplaceBackup: () => void;
    corruptSavedState?: () => void;
    injectInvalidOwnedSet?: () => void;
  };
  const actions = {
    selectTab(tabId) {
      persistSelectedTab(
        tabId,
        locale!.t('actions.switchedTab', { tab: locale!.getTabLabel(normalizeSelectedTab(tabId) ?? '') })
      );
      focusSelector(
        `[data-action="select-tab"][data-tab-id="${normalizeSelectedTab(tabId)}"][aria-selected="true"]`
      );
    },

    handleTabKeydown(tabId, key) {
      const normalizedTabId = normalizeSelectedTab(tabId) ?? DEFAULT_TAB_ID;
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        const nextId = getAdjacentTabId(normalizedTabId, 'next') ?? DEFAULT_TAB_ID;
        persistSelectedTab(nextId, locale!.t('actions.keyboardTabs'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${nextId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'ArrowLeft' || key === 'ArrowUp') {
        const prevId = getAdjacentTabId(normalizedTabId, 'previous') ?? DEFAULT_TAB_ID;
        persistSelectedTab(prevId, locale!.t('actions.keyboardTabs'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${prevId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'Home') {
        const firstId = getAdjacentTabId(normalizedTabId, 'first') ?? DEFAULT_TAB_ID;
        persistSelectedTab(firstId, locale!.t('actions.keyboardFirstTab'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${firstId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'End') {
        const lastId = getAdjacentTabId(normalizedTabId, 'last') ?? DEFAULT_TAB_ID;
        persistSelectedTab(lastId, locale!.t('actions.keyboardLastTab'));
        focusSelector(`[data-action="select-tab"][data-tab-id="${lastId}"][aria-selected="true"]`);
      }
    },

    setHistoryGrouping(mode) {
      setHistoryGroupingMode((HISTORY_GROUPING_MODES.some((entry) => entry.id === mode)
        ? mode
        : DEFAULT_HISTORY_GROUPING_MODE) as Parameters<typeof setHistoryGroupingMode>[0]);
      ui.lastActionNotice = locale!.t('actions.updatedHistoryGrouping', {
        mode: locale!.getHistoryGroupingLabel(getHistoryGroupingMode())
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
        (currentState: AppState) => toggleOwnedSetStore(currentState, setId),
        locale!.t('actions.updatedOwnedCollection')
      );
    },

    setActiveSetIds(ids) {
      applyStateUpdate(
        (currentState: AppState) => setActiveSetIdsStore(currentState, ids),
        locale!.t('actions.updatedActiveFilter')
      );
    },

    clearActiveSetIds() {
      applyStateUpdate(
        (currentState: AppState) => clearActiveSetIdsStore(currentState),
        locale!.t('actions.clearedActiveFilter')
      );
    },

    deactivateAllSets() {
      applyStateUpdate(
        (currentState: AppState) => deactivateAllSetsStore(currentState),
        locale!.t('actions.clearedActiveFilter')
      );
    },

    setBrowseSearchTerm(searchTerm) { setBrowseSearchTerm(searchTerm); },

    setBrowseTypeFilter(typeFilter) { setBrowseTypeFilter(typeFilter as Parameters<typeof setBrowseTypeFilter>[0]); },

    toggleAboutPanel() {
      ui.aboutPanelOpen = !ui.aboutPanelOpen;
      ui.lastActionNotice = ui.aboutPanelOpen
        ? locale!.t('actions.openedAbout')
        : locale!.t('actions.closedAbout');
    },

    startOnboarding() {
      ui.onboardingVisible = true;
      ui.onboardingStep = 0;
      ui.aboutPanelOpen = false;
      ui.lastActionNotice = locale!.t('actions.openedWalkthrough');
      if (ui.selectedTab !== 'browse') {
        persistSelectedTab('browse', locale!.t('actions.replayWalkthrough'));
        focusSelector('#onboarding-step-heading');
        return;
      }
      focusSelector('#onboarding-step-heading');
    },

    previousOnboardingStep() {
      ui.onboardingStep = Math.max(0, ui.onboardingStep - 1);
      ui.lastActionNotice = locale!.t('actions.previousWalkthrough');
      focusSelector('#onboarding-step-heading');
    },

    nextOnboardingStep() {
      ui.onboardingStep = Math.min(4, ui.onboardingStep + 1);
      ui.lastActionNotice = locale!.t('actions.nextWalkthrough');
      focusSelector('#onboarding-step-heading');
    },

    openOnboardingTab(tabId) {
      persistSelectedTab(
        tabId,
        locale!.t('actions.openedWalkthroughTab', {
          tab: locale!.getTabLabel(normalizeSelectedTab(tabId) ?? '')
        })
      );
    },

    skipOnboarding() { completeOnboardingFlow(locale!.t('actions.skippedWalkthrough')); },
    completeOnboarding() { completeOnboardingFlow(locale!.t('actions.completedWalkthrough')); },

    toggleBrowseSetExpanded(setId) {
      setExpandedBrowseSetId(getExpandedBrowseSetId() === setId ? null : setId);
    },

    requestResetOwnedCollection() {
      ui.confirmResetOwnedCollection = true;
      ui.modalReturnFocusAction = 'request-reset-owned-collection';
      ui.lastActionNotice = locale!.t('actions.confirmResetCollection');
      focusModalCancelButton();
    },

    cancelResetOwnedCollection() {
      ui.confirmResetOwnedCollection = false;
      ui.lastActionNotice = locale!.t('actions.keptCollection');
      focusActionButton(ui.modalReturnFocusAction ?? '');
    },

    confirmResetOwnedCollection() {
      ui.confirmResetOwnedCollection = false;
      clearForcedPicksState();
      clearGeneratedSetup();
      applyStateUpdate(
        (currentState: AppState) => resetOwnedCollection(currentState),
        locale!.t('actions.clearedCollection')
      );
      toast.success(locale!.t('actions.clearedCollection'));
    },

    requestResetAllState() {
      ui.confirmResetAllState = true;
      ui.modalReturnFocusAction = 'request-reset-all-state';
      ui.lastActionNotice = locale!.t('actions.confirmResetAll');
      focusModalCancelButton();
    },

    cancelResetAllState() {
      ui.confirmResetAllState = false;
      ui.lastActionNotice = locale!.t('actions.keptState');
      focusActionButton(ui.modalReturnFocusAction ?? '');
    },

    setPlayerCount(playerCount) {
      const playMode = playerCount === 1 ? getSelectedPlayMode() : 'standard';
      persistPreferences(
        playerCount,
        playMode,
        locale!.t('actions.selectedPlayerMode', {
          count: locale!.formatNumber(playerCount),
          playerWord: playerCount === 1 ? 'player' : 'players'
        })
      );
    },

    setPlayMode(playMode) {
      if (getSelectedPlayerCount() !== 1 && playMode !== 'standard') {
        ui.lastActionNotice = locale!.t('actions.invalidSoloMode');
        toast.warning(locale!.t('actions.invalidSoloMode'));
        return;
      }
      persistPreferences(
        getSelectedPlayerCount(),
        playMode,
        locale!.t('actions.selectedPlayMode', {
          mode: locale!.getPlayModeLabel(playMode, getSelectedPlayerCount())
        })
      );
    },

    setEpicMastermind(enabled) {
      applyStateUpdate((currentState: AppState) => {
        currentState.preferences.lastEpicMastermind = enabled;
        return currentState;
      }, locale!.t('newGame.epicMastermind'));
    },

    setTheme(themeId) {
      const normalizedThemeId = normalizeThemeId(themeId);
      if (appState!.preferences.themeId === normalizedThemeId) return;
      applyStateUpdate((currentState: AppState) => {
        currentState.preferences.themeId = normalizedThemeId;
        return currentState;
      }, locale!.t('actions.appliedTheme', { theme: locale!.getThemeLabel(normalizedThemeId) }));
      focusSelector(`[data-action="set-theme"][data-theme-id="${normalizedThemeId}"]`);
    },

    setLocale(localeId) {
      const normalizedLocaleId = normalizeLocaleId(localeId);
      if (appState!.preferences.localeId === normalizedLocaleId) return;
      const newLocaleTools = createLocaleTools(normalizedLocaleId);
      applyStateUpdate((currentState: AppState) => {
        currentState.preferences.localeId = normalizedLocaleId;
        return currentState;
      }, locale!.t('actions.appliedLocale', { locale: newLocaleTools.localeLabel }));
      toast.success(locale!.t('actions.appliedLocale', { locale: newLocaleTools.localeLabel }));
      focusSelector('#header-locale-select');
    },

    exportBackup() {
      const payload = createBackupPayload($state.snapshot(appState!));
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
      ui.lastActionNotice = locale!.t('actions.exportedBackup', { fileName });
      toast.success(locale!.t('actions.exportedBackupToast', { fileName }));
    },

    openImportBackup() {
      document.getElementById('backup-import-input')?.click();
    },

    async importBackupFile(file) {
      if (!file) return;
      const importedText = await file.text();
      const parsedBackup = parseBackupText(importedText, { indexes: bundle!.runtime.indexes });
      if (!parsedBackup.ok) {
        setStagedBackup(null);
        setConfirmBackupRestoreMode(null);
        setBackupImportError(parsedBackup.error);
        ui.lastActionNotice = locale!.t('actions.backupImportFailed');
        toast.error(parsedBackup.error, { duration: Infinity });
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
      ui.lastActionNotice = locale!.t('actions.loadedBackupPreview');
    },

    cancelBackupPreview() {
      clearBackupDraft();
      ui.lastActionNotice = locale!.t('actions.discardedBackupPreview');
    },

    requestMergeBackup() {
      if (!getStagedBackup()) return;
      setConfirmBackupRestoreMode('merge');
      ui.modalReturnFocusAction = 'request-merge-backup';
      ui.lastActionNotice = locale!.t('actions.reviewMerge');
      focusModalCancelButton();
    },

    requestReplaceBackup() {
      if (!getStagedBackup()) return;
      setConfirmBackupRestoreMode('replace');
      ui.modalReturnFocusAction = 'request-replace-backup';
      ui.lastActionNotice = locale!.t('actions.reviewReplace');
      focusModalCancelButton();
    },

    cancelBackupRestore() {
      setConfirmBackupRestoreMode(null);
      ui.lastActionNotice = locale!.t('actions.keptBackupPreview');
      focusActionButton(ui.modalReturnFocusAction ?? '');
    },

    confirmMergeBackup() {
      if (!getStagedBackup()) return;
      setConfirmBackupRestoreMode(null);
      const nextState = mergeImportedState($state.snapshot(appState!), $state.snapshot(getStagedBackup()!.importedState));
      const result = applyStateUpdate(() => nextState, locale!.t('actions.mergedBackup'));
      syncUiFromPersistedState(result.state);
      toast.success(locale!.t('actions.mergedBackup'));
    },

    confirmReplaceBackup() {
      if (!getStagedBackup()) return;
      setConfirmBackupRestoreMode(null);
      const result = applyStateUpdate(
        () => getStagedBackup()!.importedState,
        locale!.t('actions.replacedBackup')
      );
      syncUiFromPersistedState(result.state);
      toast.warning(locale!.t('actions.replacedBackup'));
    },

    addForcedPick(field, value) {
      if (!value) {
        ui.lastActionNotice = locale!.t('actions.chooseForcedPick');
        return;
      }
      const nextForcedPicks = addForcedPick(getForcedPicks(), field, value);
      const prev = getForcedPicks();
      const changed =
        nextForcedPicks.schemeId !== prev.schemeId ||
        nextForcedPicks.mastermindId !== prev.mastermindId ||
        nextForcedPicks.heroIds.join() !== prev.heroIds.join() ||
        nextForcedPicks.villainGroupIds.join() !== prev.villainGroupIds.join() ||
        nextForcedPicks.henchmanGroupIds.join() !== prev.henchmanGroupIds.join();
      setForcedPicks(nextForcedPicks);
      clearGeneratedSetup();
      ui.lastActionNotice = changed
        ? locale!.t('actions.updatedForcedPicks')
        : locale!.t('actions.duplicateForcedPick');
    },

    removeForcedPick(field, value) {
      setForcedPicks(removeForcedPick(getForcedPicks(), field, value));
      clearGeneratedSetup();
      ui.lastActionNotice = locale!.t('actions.removedForcedPick');
    },

    clearForcedPicks() {
      clearForcedPicksState();
      clearGeneratedSetup();
      ui.lastActionNotice = locale!.t('actions.clearedForcedPicks');
    },

    setPreferredExpansion(id) {
      setForcedPicks({ ...getForcedPicks(), preferredExpansionId: id });
      clearGeneratedSetup();
      ui.lastActionNotice = locale!.t('actions.updatedForcedPicks');
    },

    generateSetup() {
      try {
        const setup = generateSetup({
          runtime: bundle!.runtime,
          state: appState!,
          playerCount: getSelectedPlayerCount(),
          advancedSolo: getAdvancedSolo(),
          playMode: getSelectedPlayMode(),
          forcedPicks: getForcedPicks(),
          epicMastermind: appState!.preferences.lastEpicMastermind ?? false
        });
        setCurrentSetup(setup);
        setGeneratorError(null);
        setGeneratorNotices(setup.notices);
        ui.lastActionNotice = locale!.t('actions.generatedSetup');
      } catch (error: any) {
        setCurrentSetup(null);
        setGeneratorNotices([]);
        setGeneratorError(error.message);
        ui.lastActionNotice = locale!.t('actions.failedSetup');
        toast.error(error.message, { duration: Infinity });
      }
    },

    acceptCurrentSetup() {
      if (!getCurrentSetup()) {
        ui.lastActionNotice = locale!.t('actions.acceptBeforeLog');
        toast.warning(locale!.t('actions.acceptBeforeLog'));
        return;
      }
      const acceptedRecordId = createGameRecordId();
      const acceptedAt = new Date().toISOString();
      applyStateUpdate((currentState: AppState) => {
        const nextState = acceptGameSetup(currentState, {
          id: acceptedRecordId,
          createdAt: acceptedAt,
          playerCount: getSelectedPlayerCount(),
          advancedSolo: getAdvancedSolo(),
          playMode: getSelectedPlayMode(),
          epicMastermind: appState!.preferences.lastEpicMastermind ?? false,
          setupSnapshot: buildHistoryReadySetupSnapshot($state.snapshot(getCurrentSetup()!))
        });
        nextState.preferences.selectedTab = 'history';
        return nextState;
      }, hasForcedPicks(getForcedPicks())
        ? locale!.t('actions.acceptedLoggedForced')
        : locale!.t('actions.acceptedLogged'));
      ui.selectedTab = 'history';
      openResultEditor(acceptedRecordId, {
        returnFocusSelector: `[data-action="edit-game-result"][data-record-id="${acceptedRecordId}"]`
      });
      clearForcedPicksState();
      clearGeneratedSetup();
      focusSelector('[data-result-field="outcome"]');
      toast.success(locale!.t('actions.acceptedToast'));
    },

    editGameResult(recordId) {
      if (
        !openResultEditor(recordId, {
          returnFocusSelector: `[data-action="edit-game-result"][data-record-id="${recordId}"]`
        })
      )
        return;
      ui.lastActionNotice = locale!.t('actions.openedResultEditor');
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

    setResultPlayerScore(index, value) {
      setResultPlayerScore(index, value);
      setResultFormError(null);
      setResultInvalidFields([]);
    },

    setResultPlayerName(index, value) {
      setResultPlayerName(index, value);
    },

    skipGameResultEntry() {
      const returnFocusSelector = closeResultEditor();
      ui.lastActionNotice = locale!.t('actions.pendingResult');
      focusSelector(returnFocusSelector ?? '');
      toast.info(locale!.t('actions.pendingResultToast'));
    },

    cancelResultEntry() {
      const returnFocusSelector = closeResultEditor();
      ui.lastActionNotice = locale!.t('actions.closedResultEditor');
      focusSelector(returnFocusSelector ?? '');
    },

    saveGameResult() {
      if (!getResultEditorRecordId()) return;
      const activeRecordId = getResultEditorRecordId();
      const record = appState!.history.find((r) => r.id === activeRecordId);
      const playerCount = record?.playerCount ?? 1;
      const validation = validateGameResultDraft(getResultDraft(), playerCount);
      if (!validation.ok) {
        setResultFormError(validation.errors
          .map((message) => locale!.localizeValidationMessage(message))
          .join(' '));
        setResultInvalidFields(validation.errors.flatMap((message) => {
          if (message.includes('Win or Loss')) return ['outcome'];
          if (playerCount >= 2 && message.toLowerCase().includes('score')) {
            return Array.from({ length: playerCount }, (_, i) => `player-score-${i}`);
          }
          if (message.toLowerCase().includes('score')) return ['score'];
          return [];
        }));
        ui.lastActionNotice = locale!.t('actions.finishResultFields');
        focusSelector('[data-result-form-error]');
        return;
      }
      const returnFocusSelector = getResultEditorReturnFocusSelector() ?? '';
      const wasPending =
        appState!.history.find((r) => r.id === activeRecordId)?.result?.status !== 'completed';
      applyStateUpdate(
        (currentState) =>
          updateGameResult(currentState, {
            recordId: activeRecordId!,
            outcome: validation.result.outcome!,
            score: validation.result.score,
            notes: validation.result.notes !== null ? validation.result.notes : undefined,
            updatedAt: validation.result.updatedAt ?? new Date().toISOString()
          }),
        wasPending
          ? locale!.t('actions.savedResult')
          : locale!.t('actions.savedCorrectedResult')
      );
      closeResultEditor();
      focusSelector(returnFocusSelector);
      toast.success(wasPending
        ? locale!.t('actions.savedResultToast')
        : locale!.t('actions.savedCorrectedResultToast'));
    },

    toggleHistoryInsights() {
      toggleHistoryInsights();
      focusSelector('[data-action="toggle-history-insights"]');
    },

    resetUsageCategory(category) {
      ui.confirmResetAllState = false;
      closeResultEditor();
      const label = locale!.getUsageLabel(category);
      applyStateUpdate(
        (currentState: AppState) => resetUsageCategoryStore(currentState, category),
        locale!.t('actions.resetUsageStats', { label })
      );
      toast.info(locale!.t('actions.resetUsageStats', { label }));
    },

    resetAllState() {
      ui.confirmResetAllState = false;
      const result = resetAllStateStore({ storageAdapter: storageAdapter! });
      appState = result.state;
      persistence.updateNotices = result.notices;
      persistence.lastSaveMessage = result.save.message;
      persistence.lastSaveOk = result.save.ok;
      syncUiFromPersistedState(result.state);
      ui.selectedTab = DEFAULT_TAB_ID;
      ui.lastActionNotice = locale!.t('actions.resetAllDefaults');
      if (result.save.ok) {
        toast.warning(locale!.t('actions.resetAllDefaults'));
      } else if (result.save.storageAvailable === false) {
        toast.warning(result.save.message, { duration: Infinity });
      } else {
        toast.error(result.save.message, { duration: Infinity });
      }
    },

    ...(import.meta.env.DEV ? {
      corruptSavedState() {
        const save = storageAdapter!.setItem(STORAGE_KEY, '{ this-is-not-valid-json');
        persistence.lastSaveMessage = save.message;
        persistence.lastSaveOk = save.ok;
        ui.lastActionNotice = save.ok
          ? 'Wrote corrupted JSON to browser storage. Reload the page to verify recovery.'
          : 'Could not write corrupted JSON to browser storage.';
        if (save.ok) {
          toast.warning(ui.lastActionNotice!, { duration: Infinity });
        } else {
          toast.error(ui.lastActionNotice!, { duration: Infinity });
        }
      },
      injectInvalidOwnedSet() {
        const corruptedState = $state.snapshot(appState!);
        corruptedState!.collection.ownedSetIds = [
          ...corruptedState!.collection.ownedSetIds,
          'definitely-missing-set'
        ];
        const save = storageAdapter!.setItem(STORAGE_KEY, JSON.stringify(corruptedState, null, 2));
        persistence.lastSaveMessage = save.message;
        persistence.lastSaveOk = save.ok;
        ui.lastActionNotice = save.ok
          ? 'Wrote an invalid owned set ID to storage. Reload the page to verify safe cleanup.'
          : 'Could not write an invalid owned set ID to browser storage.';
        if (save.ok) {
          toast.warning(ui.lastActionNotice!, { duration: Infinity });
        } else {
          toast.error(ui.lastActionNotice!, { duration: Infinity });
        }
      },
    } : {}),

    clearToDefaults() {
      const defaultState = createDefaultState();
      setSelectedPlayerCount(defaultState.preferences.lastPlayerCount);
      setSelectedPlayMode(defaultState.preferences.lastPlayMode);
      setAdvancedSolo(defaultState.preferences.lastAdvancedSolo);
      clearForcedPicksState();
      closeResultEditor();
      clearGeneratedSetup();
      ui.lastActionNotice = locale!.t('actions.clearDefaults');
      toast.info(locale!.t('actions.clearDefaults'));
    },

    async importMyludoFile(file) {
      if (!file) return;
      setMyludoImportStatus('loading');
      setMyludoImportError('');
      setMyludoImportSummary(null);
      const result = await parseMyludoFile(file);
      if (!result.ok) {
        setMyludoImportStatus('error');
        setMyludoImportError(result.error);
        toast.error(result.error, { duration: Infinity });
        return;
      }
      const { matched, unmatched } = matchMyludoNamesToSets(result.gameNames, bundle!.runtime.sets);
      const matchedSetIds = matched.map((m) => m.setId);
      applyStateUpdate(
        (currentState: AppState) => mergeOwnedSets(currentState, matchedSetIds),
        locale!.t('actions.importedMyludoCollection')
      );
      setMyludoImportSummary({ matched, unmatched });
      setMyludoImportStatus('idle');
    },

    dismissMyludoSummary() {
      setMyludoImportSummary(null);
      setMyludoImportError('');
      setMyludoImportStatus('idle');
    },

    async importBggCollection(username) {
      if (!username) return;
      setBggImportStatus('loading');
      setBggImportError('');
      setBggImportSummary(null);
      const result = await fetchBggCollection(username);
      if (!result.ok) {
        setBggImportStatus('error');
        setBggImportError(result.error);
        toast.error(result.error, { duration: Infinity });
        return;
      }
      const { matched, unmatched } = matchBggNamesToSets(result.gameNames, bundle!.runtime.sets);
      const matchedSetIds = matched.map((m) => m.setId);
      applyStateUpdate(
        (currentState: AppState) => mergeOwnedSets(currentState, matchedSetIds),
        locale!.t('actions.importedBggCollection')
      );
      setBggImportSummary({ matched, unmatched });
      setBggImportStatus('idle');
    },

    dismissBggSummary() {
      setBggImportSummary(null);
      setBggImportError('');
      setBggImportStatus('idle');
    }
  } satisfies Partial<ActionsShape>;

  // ---------------------------------------------------------------------------
  // Domain action slices
  // ---------------------------------------------------------------------------
  const collectionActions = {
    toggleOwnedSet: actions.toggleOwnedSet,
    requestResetOwnedCollection: actions.requestResetOwnedCollection,
    importMyludoFile: actions.importMyludoFile,
    dismissMyludoSummary: actions.dismissMyludoSummary,
    importBggCollection: actions.importBggCollection,
    dismissBggSummary: actions.dismissBggSummary
  };

  const gameActions = {
    setPlayerCount: actions.setPlayerCount,
    setPlayMode: actions.setPlayMode,
    setEpicMastermind: actions.setEpicMastermind,
    generateSetup: actions.generateSetup,
    acceptCurrentSetup: actions.acceptCurrentSetup,
    addForcedPick: actions.addForcedPick,
    removeForcedPick: actions.removeForcedPick,
    clearForcedPicks: actions.clearForcedPicks,
    setPreferredExpansion: actions.setPreferredExpansion,
    clearToDefaults: actions.clearToDefaults,
    setActiveSetIds: actions.setActiveSetIds,
    clearActiveSetIds: actions.clearActiveSetIds,
    deactivateAllSets: actions.deactivateAllSets
  };

  const historyActions = {
    setHistoryGrouping: actions.setHistoryGrouping,
    editGameResult: actions.editGameResult,
    toggleHistoryInsights: actions.toggleHistoryInsights,
    saveGameResult: actions.saveGameResult,
    skipGameResultEntry: actions.skipGameResultEntry,
    cancelResultEntry: actions.cancelResultEntry,
    setResultOutcome: actions.setResultOutcome,
    setResultScore: actions.setResultScore,
    setResultNotes: actions.setResultNotes,
    setResultPlayerScore: actions.setResultPlayerScore,
    setResultPlayerName: actions.setResultPlayerName
  };

  const backupActions = {
    exportBackup: actions.exportBackup,
    openImportBackup: actions.openImportBackup,
    importBackupFile: actions.importBackupFile,
    cancelBackupPreview: actions.cancelBackupPreview,
    requestMergeBackup: actions.requestMergeBackup,
    requestReplaceBackup: actions.requestReplaceBackup,
    resetUsageCategory: actions.resetUsageCategory,
    requestResetAllState: actions.requestResetAllState
  };

  const onboardingActions = {
    previousOnboardingStep: actions.previousOnboardingStep,
    nextOnboardingStep: actions.nextOnboardingStep,
    skipOnboarding: actions.skipOnboarding,
    completeOnboarding: actions.completeOnboarding,
    openOnboardingTab: actions.openOnboardingTab
  };

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------
  $effect(() => {
    let destroyed = false;
    const mq = window.matchMedia('(max-width: 767px)');
    compactViewport = mq.matches;
    const onViewportChange = (e: MediaQueryListEvent): void => { compactViewport = e.matches; };
    mq.addEventListener('change', onViewportChange);

    async function init() {
      if (destroyed) return;
      try {
        const seed = await loadSeed();
        if (destroyed) return;
        const loadedBundle = createEpic1Bundle(seed as Parameters<typeof createEpic1Bundle>[0]);
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
        ui.selectedTab = normalizeSelectedTab(hydration.state.preferences.selectedTab) ?? DEFAULT_TAB_ID;
        setSelectedPlayerCount(hydration.state.preferences.lastPlayerCount);
        setSelectedPlayMode(resolvePlayMode(hydration.state.preferences.lastPlayerCount, {
          advancedSolo: hydration.state.preferences.lastAdvancedSolo,
          playMode: hydration.state.preferences.lastPlayMode
        }));
        setAdvancedSolo(hydration.state.preferences.lastAdvancedSolo);

        if (hydration.notices.length) {
          hydration.notices.forEach((notice) =>
            toast.warning(localizeNotice(notice), { duration: Infinity })
          );
        }
      } catch (error) {
        console.error(error);
        (globalThis as Record<string, unknown>).__EPIC1_ERROR__ = error;
        initError = error as Error;
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
          <h1 id="app-title">{locale!.t('app.title')}</h1>
          <p id="app-subtitle">{locale!.t('app.subtitle')}</p>
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
            aria-label={locale!.t('header.locale!.groupLabel')}
            onchange={(e) => actions.setLocale((e.target as HTMLSelectElement).value)}
          >
            {#each getSelectableLocales() as option (option.id)}
              <option value={option.id} selected={activeLocaleId === option.id}>{option.nativeLabel}</option>
            {/each}
          </select>
        </div>
        <div id="header-theme-controls" class="theme-icon-row" data-theme-switcher role="group" aria-label={locale!.t('header.theme.groupLabel')}>
          {#each THEME_OPTIONS as theme (theme.id)}
            <button
              type="button"
              class={"icon-btn " + (activeThemeId === theme.id ? 'icon-btn-active' : '')}
              data-action="set-theme"
              data-theme-id={theme.id}
              aria-pressed={activeThemeId === theme.id}
              aria-label={locale!.getThemeLabel(theme.id)}
              title={locale!.getThemeDescription(theme.id)}
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
          tabs={APP_TABS as AppTab[]}
          activeTab={activeTabId}
          locale={locale!}
          variant="desktop"
          navId="desktop-tabs"
          navLabel={locale!.t('header.primaryNav')}
          onTabSelect={actions.selectTab}
          onTabKeydown={actions.handleTabKeydown}
        />
      </div>
    </div>
  </header>

  <main class="app-main">
    <Toaster
      position="bottom-center"
      offset="calc(80px + env(safe-area-inset-bottom))"
      expand={true}
      richColors={true}
      closeButton={true}
      duration={4000}
      theme={activeThemeId as 'dark' | 'light'}
    />

    <!-- Onboarding shell -->
    <section class="stack gap-md" id="diagnostics-shell" hidden={!ui.onboardingVisible}>
      {#if isLoaded}
        <OnboardingShell
          locale={locale!}
          visible={ui.onboardingVisible}
          step={ui.onboardingStep}
          onboardingCompleted={appState!.preferences.onboardingCompleted}
          {onboardingActions}
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
                bundle={bundle!}
                appState={appState!}
                locale={locale!}
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
                bundle={bundle!}
                appState={appState!}
                locale={locale!}
                {persistence}
                lastActionNotice={ui.lastActionNotice}
                {collectionActions}
                myludoImportStatus={getMyludoImportStatus()}
                myludoImportError={getMyludoImportError()}
                myludoImportSummary={getMyludoImportSummary()}
                bggImportStatus={getBggImportStatus()}
                bggImportError={getBggImportError()}
                bggImportSummary={getBggImportSummary()}
              />
            {:else if tab.id === 'new-game'}
              <NewGameTab
                bundle={bundle!}
                appState={appState!}
                locale={locale!}
                selectedPlayerCount={getSelectedPlayerCount()}
                selectedPlayMode={getSelectedPlayMode()}
                advancedSolo={getAdvancedSolo()}
                currentSetup={getCurrentSetup()}
                generatorError={getGeneratorError()}
                generatorNotices={getGeneratorNotices()}
                forcedPicks={getForcedPicks()}
                {compactViewport}
                {gameActions}
              />
            {:else if tab.id === 'history'}
              <HistoryTab
                bundle={bundle!}
                appState={appState!}
                locale={locale!}
                {compactViewport}
                historyGroupingMode={getHistoryGroupingMode()}
                historyInsightsExpanded={getHistoryInsightsExpanded()}
                historyExpandedRecordId={getHistoryExpandedRecordId()}
                resultEditorRecordId={getResultEditorRecordId()}
                resultDraft={getResultDraft()}
                resultFormError={getResultFormError()}
                resultInvalidFields={getResultInvalidFields()}
                {historyActions}
              />
            {:else if tab.id === 'backup'}
              <BackupTab
                bundle={bundle!}
                appState={appState!}
                locale={locale!}
                {compactViewport}
                backupImportError={getBackupImportError()}
                stagedBackup={getStagedBackup()}
                {backupActions}
              />
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </main>

  <!-- Mobile tab navigation -->
  <TabNav
    tabs={APP_TABS as AppTab[]}
    activeTab={activeTabId}
    locale={locale!}
    variant="mobile"
    navId="mobile-tabs"
    navLabel={locale!.t('header.primaryNavMobile')}
    onTabSelect={actions.selectTab}
    onTabKeydown={actions.handleTabKeydown}
  />

  <ModalRoot {modalConfig} locale={locale!} />

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
