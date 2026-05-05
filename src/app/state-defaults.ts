import { DEFAULT_LOCALE_ID } from './localization-utils.ts';
import { DEFAULT_THEME_ID } from './theme-utils.ts';
import type { AppState, Preferences, UsageState } from './types.ts';

export const STORAGE_KEY = 'legendary_state_v1';
export const SCHEMA_VERSION = 1;
export const USAGE_CATEGORIES = ['heroes', 'masterminds', 'villainGroups', 'henchmanGroups', 'schemes'];

export function createDefaultUsageState(): UsageState {
  return {
    heroes: {},
    masterminds: {},
    villainGroups: {},
    henchmanGroups: {},
    schemes: {}
  };
}

export function createDefaultPreferences(): Preferences {
  return {
    lastPlayerCount: 1,
    lastAdvancedSolo: false,
    lastPlayMode: 'standard',
    selectedTab: null,
    onboardingCompleted: false,
    themeId: DEFAULT_THEME_ID,
    localeId: DEFAULT_LOCALE_ID
  };
}

export function createDefaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    collection: {
      ownedSetIds: [],
      activeSetIds: null
    },
    usage: createDefaultUsageState(),
    history: [],
    preferences: createDefaultPreferences()
  };
}
