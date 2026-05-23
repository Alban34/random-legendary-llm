<script lang="ts">
  import TabNav from './TabNav.svelte';
  import BrowseTab from './BrowseTab.svelte';
  import CollectionTab from './CollectionTab.svelte';
  import NewGameTab from './NewGameTab.svelte';
  import HistoryTab from './HistoryTab.svelte';
  import BackupTab from './BackupTab.svelte';
  import type { Epic1Bundle } from '../app/game-data-pipeline.ts';
  import { APP_TABS, DEFAULT_TAB_ID, normalizeSelectedTab } from '../app/app-tabs.ts';
  import { Toaster, toast } from 'svelte-sonner';
  import { HISTORY_GROUPING_MODES } from '../app/history-utils.ts';
  import { createLocaleTools, getSelectableLocales, getLocaleFlag } from '../app/localization-utils.ts';
  import OnboardingShell from './OnboardingShell.svelte';
  import { resolvePlayMode } from '../app/setup-rules.ts';
  import { getThemeDefinition, normalizeThemeId, THEME_OPTIONS, getThemeIcon } from '../app/theme-utils.ts';
  import type { AppState, LocaleTools, StorageAdapter, AppPersistenceState, AppTab } from '../app/types.ts';
  import { STORAGE_KEY, updateState } from '../app/state-store.ts';
  import { browseVm, createBrowseActions } from '../app/browse-vm.svelte.ts';
  import { newGameVm, resetForcedPicks, createNewGameActions } from '../app/new-game-vm.svelte.ts';
  import {
    historyVm, resetHistoryGroupingMode,
    openResultEditor, closeResultEditor, createHistoryActions
  } from '../app/history-vm.svelte.ts';
  import { backupVm, createBackupActions } from '../app/backup-vm.svelte.ts';
  import { importVm, createImportActions } from '../app/import-vm.svelte.ts';
  import { focusActionButton, focusSelector, focusModalCancelButton } from '../app/focus-utils.ts';
  import ModalRoot from './ModalRoot.svelte';
  import { computeModalConfig } from '../app/modal-utils.ts';
  import { initApp } from '../app/app-init.ts';
  import { createCollectionActions } from '../app/collection-actions.ts';
  import { createPreferencesActions } from '../app/preferences-actions.ts';

  /* global __APP_VERSION__ */

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

  const TOAST_DISMISS_FOCUS_DELAY_MS = 50;

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  let isLoaded = $derived(bundle !== null && appState !== null && locale !== null);
  let activeTabId = $derived(ui.selectedTab);
  let activeThemeId = $derived(appState ? normalizeThemeId(appState.preferences.themeId) : 'dark');
  let activeTheme = $derived(activeThemeId ? getThemeDefinition(activeThemeId) : null);
  let activeLocaleId = $derived(appState?.preferences?.localeId ?? 'en-US');


  let modalConfig = $derived(
    isLoaded
      ? computeModalConfig({
          locale: locale!,
          appState: appState!,
          confirmResetOwnedCollection: ui.confirmResetOwnedCollection,
          confirmResetAllState: ui.confirmResetAllState,
          confirmBackupRestoreMode: backupVm.confirmRestoreMode,
          stagedBackup: backupVm.stagedBackup,
          onCancelResetOwnedCollection: () => actions.cancelResetOwnedCollection(),
          onConfirmResetOwnedCollection: () => actions.confirmResetOwnedCollection(),
          onCancelResetAllState: () => actions.cancelResetAllState(),
          onResetAllState: () => actions.resetAllState(),
          onCancelBackupRestore: () => actions.cancelBackupRestore(),
          onConfirmMergeBackup: () => actions.confirmMergeBackup(),
          onConfirmReplaceBackup: () => actions.confirmReplaceBackup()
        })
      : null
  );

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
        }, TOAST_DISMISS_FOCUS_DELAY_MS);
      }
    }
    document.addEventListener('keydown', handleKeydown, true);
    return () => document.removeEventListener('keydown', handleKeydown, true);
  });

  // ---------------------------------------------------------------------------
  // Debug globals (mirrors syncDebugGlobals from browser-entry.ts)
  // ---------------------------------------------------------------------------
  function syncGlobals() {
    if (!import.meta.env.DEV) return;
    if (!bundle || !appState) return;
    (globalThis as Record<string, unknown>).__EPIC1 = bundle;
    (globalThis as Record<string, unknown>).__APP_STATE__ = appState;
    (globalThis as Record<string, unknown>).__APP_PERSISTENCE__ = persistence;
    (globalThis as Record<string, unknown>).__CURRENT_SETUP__ = newGameVm.currentSetup;
    (globalThis as Record<string, unknown>).__ACTIVE_TAB__ = ui.selectedTab;
    (globalThis as Record<string, unknown>).__BROWSE_UI__ = {
      searchTerm: browseVm.searchTerm,
      typeFilter: browseVm.typeFilter,
      expandedSetId: browseVm.expandedSetId
    };
    (globalThis as Record<string, unknown>).__COLLECTION_UI__ = { confirmResetOwnedCollection: ui.confirmResetOwnedCollection };
    (globalThis as Record<string, unknown>).__HISTORY_UI__ = {
      groupingMode: historyVm.groupingMode,
      supportedGroupingModes: HISTORY_GROUPING_MODES,
      confirmResetAllState: ui.confirmResetAllState,
      resultEditorRecordId: historyVm.resultEditorRecordId,
      resultDraft: historyVm.resultDraft,
      resultFormError: historyVm.resultFormError,
      resultInvalidFields: historyVm.resultInvalidFields,
      historyInsightsExpanded: historyVm.insightsExpanded
    };
    (globalThis as Record<string, unknown>).__ONBOARDING_UI__ = {
      visible: ui.onboardingVisible,
      step: ui.onboardingStep,
      aboutOpen: ui.aboutPanelOpen,
      completed: appState.preferences.onboardingCompleted,
      mobilePreferencesOpen: ui.mobilePreferencesOpen
    };
    (globalThis as Record<string, unknown>).__PLAY_MODE_UI__ = {
      playerCount: newGameVm.selectedPlayerCount,
      playMode: newGameVm.selectedPlayMode,
      advancedSolo: newGameVm.advancedSolo
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
      importError: backupVm.importError,
      stagedBackupSummary: backupVm.stagedBackup?.summary || null,
      confirmRestoreMode: backupVm.confirmRestoreMode,
      lastExportFileName: backupVm.lastExportFileName || null
    };
    (globalThis as Record<string, unknown>).__FORCED_PICKS_UI__ = newGameVm.forcedPicks;
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
    newGameVm.currentSetup = null;
    newGameVm.generatorError = null;
    newGameVm.generatorNotices = [];
  }

  function clearForcedPicksState() {
    resetForcedPicks();
  }

  function clearBackupDraft() {
    backupVm.importError = null;
    backupVm.stagedBackup = null;
    backupVm.confirmRestoreMode = null;
  }

  function syncUiFromPersistedState(nextState: AppState) {
    appState = nextState;
    refreshLocaleState();
    ui.selectedTab = normalizeSelectedTab(nextState.preferences.selectedTab) ?? DEFAULT_TAB_ID;
    newGameVm.selectedPlayerCount = nextState.preferences.lastPlayerCount;
    newGameVm.selectedPlayMode = resolvePlayMode(nextState.preferences.lastPlayerCount, {
      advancedSolo: nextState.preferences.lastAdvancedSolo,
      playMode: nextState.preferences.lastPlayMode
    });
    newGameVm.advancedSolo = nextState.preferences.lastAdvancedSolo;
    ui.onboardingVisible = !nextState.preferences.onboardingCompleted;
    ui.onboardingStep = 0;
    ui.aboutPanelOpen = false;
    ui.mobilePreferencesOpen = false;
    clearForcedPicksState();
    closeResultEditor();
    clearGeneratedSetup();
    clearBackupDraft();
    historyVm.expandedRecordId = null;
    historyVm.insightsExpanded = false;
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

  // ---------------------------------------------------------------------------
  // Factory instances
  // ---------------------------------------------------------------------------
  const browseActionsImpl = createBrowseActions();

  const newGameActionsImpl = createNewGameActions({
    getLocale: () => locale!,
    getBundle: () => bundle!,
    getAppState: () => appState!,
    applyStateUpdate,
    clearGeneratedSetup,
    clearForcedPicksState,
    closeResultEditor,
    focusSelector,
    openResultEditor: (id, opts) => openResultEditor(appState!, id, opts ?? {}),
    ui
  });

  const historyActionsImpl = createHistoryActions({
    getLocale: () => locale!,
    getAppState: () => appState!,
    applyStateUpdate,
    openResultEditor: (id, opts) => openResultEditor(appState!, id, opts ?? {}),
    closeResultEditor,
    focusSelector,
    ui
  });

  const backupActionsImpl = createBackupActions({
    getLocale: () => locale!,
    getAppState: () => appState!,
    getBundle: () => bundle!,
    applyStateUpdate,
    syncUiFromPersistedState,
    ui,
    focusActionButton,
    focusModalCancelButton
  });

  const importActionsImpl = createImportActions({
    getLocale: () => locale!,
    getBundle: () => bundle!,
    applyStateUpdate
  });

  const collectionActionsImpl = createCollectionActions({
    getLocale: () => locale!,
    getStorageAdapter: () => storageAdapter,
    applyStateUpdate,
    syncUiFromPersistedState,
    clearGeneratedSetup,
    clearForcedPicksState,
    focusActionButton,
    focusModalCancelButton,
    ui,
    persistence
  });

  const preferencesActionsImpl = createPreferencesActions({
    getLocale: () => locale!,
    getAppState: () => appState!,
    applyStateUpdate,
    focusSelector,
    ui
  });

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
    setForcedTeam: (team: string | null) => void;
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
    replaySetup: (recordId: string) => void;
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
    ...browseActionsImpl,
    ...newGameActionsImpl,
    ...historyActionsImpl,
    ...backupActionsImpl,
    ...importActionsImpl,
    ...collectionActionsImpl,
    ...preferencesActionsImpl,
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
    } : {})
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
    setForcedTeam: actions.setForcedTeam,
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
    setResultPlayerName: actions.setResultPlayerName,
    replaySetup: actions.replaySetup
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
        const result = await initApp();
        if (destroyed) return;
        storageAdapter = result.storageAdapter;
        bundle = result.bundle;
        appState = result.hydratedState;
        locale = createLocaleTools(result.hydratedState.preferences.localeId);
        persistence.storageAvailable = result.storageAvailable;
        persistence.hydratedFromStorage = result.hydratedFromStorage;
        persistence.recoveredOnLoad = result.recovered;
        persistence.hydrateNotices = result.hydrateNotices;
        persistence.updateNotices = [];
        persistence.lastSaveMessage = null;
        persistence.lastSaveOk = null;
        ui.onboardingVisible = !result.hydratedState.preferences.onboardingCompleted;
        ui.selectedTab = normalizeSelectedTab(result.hydratedState.preferences.selectedTab) ?? DEFAULT_TAB_ID;
        newGameVm.selectedPlayerCount = result.hydratedState.preferences.lastPlayerCount;
        newGameVm.selectedPlayMode = resolvePlayMode(result.hydratedState.preferences.lastPlayerCount, {
          advancedSolo: result.hydratedState.preferences.lastAdvancedSolo,
          playMode: result.hydratedState.preferences.lastPlayMode
        });
        newGameVm.advancedSolo = result.hydratedState.preferences.lastAdvancedSolo;

        if (result.hydrateNotices.length) {
          result.hydrateNotices.forEach((notice) =>
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
    <a href="#main" class="skip-link" data-skip-link>{locale!.t('header.skipToMain')}</a>
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
            aria-label={locale!.t('header.locale.groupLabel')}
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

  <main id="main" class="app-main">
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
                browseSearchTerm={browseVm.searchTerm}
                browseTypeFilter={browseVm.typeFilter}
                expandedBrowseSetId={browseVm.expandedSetId}
                {compactViewport}
                aboutPanelOpen={ui.aboutPanelOpen}
                onboardingVisible={ui.onboardingVisible}
                currentSetup={newGameVm.currentSetup}
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
                {collectionActions}
                myludoImportStatus={importVm.myludoStatus}
                myludoImportError={importVm.myludoError}
                myludoImportSummary={importVm.myludoSummary}
                bggImportStatus={importVm.bggStatus}
                bggImportError={importVm.bggError}
                bggImportSummary={importVm.bggSummary}
              />
            {:else if tab.id === 'new-game'}
              <NewGameTab
                bundle={bundle!}
                appState={appState!}
                locale={locale!}
                selectedPlayerCount={newGameVm.selectedPlayerCount}
                selectedPlayMode={newGameVm.selectedPlayMode}
                advancedSolo={newGameVm.advancedSolo}
                currentSetup={newGameVm.currentSetup}
                generatorError={newGameVm.generatorError}
                generatorNotices={newGameVm.generatorNotices}
                forcedPicks={newGameVm.forcedPicks}
                {compactViewport}
                {gameActions}
              />
            {:else if tab.id === 'history'}
              <HistoryTab
                bundle={bundle!}
                appState={appState!}
                locale={locale!}
                {compactViewport}
                historyGroupingMode={historyVm.groupingMode}
                historyInsightsExpanded={historyVm.insightsExpanded}
                historyExpandedRecordId={historyVm.expandedRecordId}
                resultEditorRecordId={historyVm.resultEditorRecordId}
                resultDraft={historyVm.resultDraft}
                resultFormError={historyVm.resultFormError}
                resultInvalidFields={historyVm.resultInvalidFields}
                {historyActions}
              />
            {:else if tab.id === 'backup'}
              <BackupTab
                bundle={bundle!}
                appState={appState!}
                locale={locale!}
                {compactViewport}
                backupImportError={backupVm.importError}
                stagedBackup={backupVm.stagedBackup}
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
