// src/app/preferences-actions.ts
// Action factory for theme, locale, tab, and onboarding preferences — extracted from App.svelte (F-02).

import { toast } from 'svelte-sonner';
import { createLocaleTools, normalizeLocaleId } from './localization-utils.ts';
import { normalizeThemeId } from './theme-utils.ts';
import { normalizeSelectedTab, getAdjacentTabId, DEFAULT_TAB_ID } from './app-tabs.ts';
import type { AppState, LocaleTools } from './types.ts';

interface PreferencesActionDeps {
  getLocale: () => LocaleTools;
  getAppState: () => AppState;
  applyStateUpdate: (updater: (s: AppState) => AppState, notice: string) => void;
  focusSelector: (sel: string) => void;
  ui: {
    lastActionNotice: string | null;
    selectedTab: string;
    aboutPanelOpen: boolean;
    onboardingVisible: boolean;
    onboardingStep: number;
  };
}

export function createPreferencesActions(deps: PreferencesActionDeps) {
  function localPersistSelectedTab(tabId: string | null, actionNotice: string) {
    const normalizedTabId = normalizeSelectedTab(tabId);
    deps.ui.selectedTab = normalizedTabId ?? DEFAULT_TAB_ID;
    deps.applyStateUpdate((s: AppState) => ({
      ...s,
      preferences: { ...s.preferences, selectedTab: normalizedTabId }
    }), actionNotice);
  }

  function localCompleteOnboardingFlow(actionNotice: string) {
    deps.ui.onboardingVisible = false;
    deps.ui.onboardingStep = 0;
    deps.applyStateUpdate((s: AppState) => ({
      ...s,
      preferences: { ...s.preferences, onboardingCompleted: true }
    }), actionNotice);
    deps.focusSelector('[data-browse-primary-cta], [data-action="select-tab"][aria-selected="true"]');
  }

  return {
    setTheme(themeId: string) {
      const normalizedThemeId = normalizeThemeId(themeId);
      if (deps.getAppState().preferences.themeId === normalizedThemeId) return;
      deps.applyStateUpdate((s: AppState) => ({
        ...s,
        preferences: { ...s.preferences, themeId: normalizedThemeId }
      }), deps.getLocale().t('actions.appliedTheme', { theme: deps.getLocale().getThemeLabel(normalizedThemeId) }));
      deps.focusSelector(`[data-action="set-theme"][data-theme-id="${normalizedThemeId}"]`);
    },

    setLocale(localeId: string) {
      const normalizedLocaleId = normalizeLocaleId(localeId);
      if (deps.getAppState().preferences.localeId === normalizedLocaleId) return;
      const newLocaleTools = createLocaleTools(normalizedLocaleId);
      deps.applyStateUpdate((s: AppState) => ({
        ...s,
        preferences: { ...s.preferences, localeId: normalizedLocaleId }
      }), deps.getLocale().t('actions.appliedLocale', { locale: newLocaleTools.localeLabel }));
      toast.success(deps.getLocale().t('actions.appliedLocale', { locale: newLocaleTools.localeLabel }));
      deps.focusSelector('#header-locale-select');
    },

    selectTab(tabId: string) {
      localPersistSelectedTab(
        tabId,
        deps.getLocale().t('actions.switchedTab', { tab: deps.getLocale().getTabLabel(normalizeSelectedTab(tabId) ?? '') })
      );
      deps.focusSelector(
        `[data-action="select-tab"][data-tab-id="${normalizeSelectedTab(tabId)}"][aria-selected="true"]`
      );
    },

    handleTabKeydown(tabId: string, key: string) {
      const normalizedTabId = normalizeSelectedTab(tabId) ?? DEFAULT_TAB_ID;
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        const nextId = getAdjacentTabId(normalizedTabId, 'next') ?? DEFAULT_TAB_ID;
        localPersistSelectedTab(nextId, deps.getLocale().t('actions.keyboardTabs'));
        deps.focusSelector(`[data-action="select-tab"][data-tab-id="${nextId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'ArrowLeft' || key === 'ArrowUp') {
        const prevId = getAdjacentTabId(normalizedTabId, 'previous') ?? DEFAULT_TAB_ID;
        localPersistSelectedTab(prevId, deps.getLocale().t('actions.keyboardTabs'));
        deps.focusSelector(`[data-action="select-tab"][data-tab-id="${prevId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'Home') {
        const firstId = getAdjacentTabId(normalizedTabId, 'first') ?? DEFAULT_TAB_ID;
        localPersistSelectedTab(firstId, deps.getLocale().t('actions.keyboardFirstTab'));
        deps.focusSelector(`[data-action="select-tab"][data-tab-id="${firstId}"][aria-selected="true"]`);
        return;
      }
      if (key === 'End') {
        const lastId = getAdjacentTabId(normalizedTabId, 'last') ?? DEFAULT_TAB_ID;
        localPersistSelectedTab(lastId, deps.getLocale().t('actions.keyboardLastTab'));
        deps.focusSelector(`[data-action="select-tab"][data-tab-id="${lastId}"][aria-selected="true"]`);
      }
    },

    toggleAboutPanel() {
      deps.ui.aboutPanelOpen = !deps.ui.aboutPanelOpen;
      deps.ui.lastActionNotice = deps.ui.aboutPanelOpen
        ? deps.getLocale().t('actions.openedAbout')
        : deps.getLocale().t('actions.closedAbout');
    },

    startOnboarding() {
      deps.ui.onboardingVisible = true;
      deps.ui.onboardingStep = 0;
      deps.ui.aboutPanelOpen = false;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.openedWalkthrough');
      if (deps.ui.selectedTab !== 'browse') {
        localPersistSelectedTab('browse', deps.getLocale().t('actions.replayWalkthrough'));
        deps.focusSelector('#onboarding-step-heading');
        return;
      }
      deps.focusSelector('#onboarding-step-heading');
    },

    previousOnboardingStep() {
      deps.ui.onboardingStep = Math.max(0, deps.ui.onboardingStep - 1);
      deps.ui.lastActionNotice = deps.getLocale().t('actions.previousWalkthrough');
      deps.focusSelector('#onboarding-step-heading');
    },

    nextOnboardingStep() {
      deps.ui.onboardingStep = Math.min(4, deps.ui.onboardingStep + 1);
      deps.ui.lastActionNotice = deps.getLocale().t('actions.nextWalkthrough');
      deps.focusSelector('#onboarding-step-heading');
    },

    openOnboardingTab(tabId: string) {
      localPersistSelectedTab(
        tabId,
        deps.getLocale().t('actions.openedWalkthroughTab', {
          tab: deps.getLocale().getTabLabel(normalizeSelectedTab(tabId) ?? '')
        })
      );
    },

    skipOnboarding() {
      localCompleteOnboardingFlow(deps.getLocale().t('actions.skippedWalkthrough'));
    },

    completeOnboarding() {
      localCompleteOnboardingFlow(deps.getLocale().t('actions.completedWalkthrough'));
    }
  };
}
