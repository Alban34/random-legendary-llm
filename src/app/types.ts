// Epic 62 — Domain Type Declarations
import type { MessageKey } from './locales/en.ts';

// Add future expansion names here when their Epic Mastermind cards are catalogued.
export const EPIC_MASTERMIND_SUPPORTED_SETS: readonly string[] = [
  'X-Men',
  'Marvel Noir',
  'Spider-Man Homecoming',
  'Champions',
  'World War Hulk',
  'Ant-Man',
  'Marvel Studios, Phase 1',
  'S.H.I.E.L.D.',
  'Dimensions',
  'Venom',
  'Revelations',
  'The New Mutants',
  'Into the Cosmos',
  'Realm of Kings',
  'Heroes of Asgard',
  'Annihilation',
  'Black Widow',
  'Black Panther',
  'Doctor Strange and the Shadows of Nightmare',
  'Messiah Complex',
  "Marvel Studios' Guardians of the Galaxy",
  'Midnight Sons',
  'The Infinity Saga',
  "Marvel Studios' What If...?",
  'Weapon X',
  '2099',
  'Ant-Man and the Wasp',
] as const;

// =============================================================================
// Section 1: Game data (canonical source)
// =============================================================================

export type SetType = 'base' | 'large-expansion' | 'small-expansion' | 'standalone';

export interface HeroCard {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  teams: string[];
  cardCount: number;
}

export interface MastermindCard {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  leadName: string | null;
  leadCategory: string | null;
  notes: string[];
}

export interface VillainGroupCard {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  cardCount: number;
}

export interface HenchmanGroupCard {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  cardCount: number;
}

export interface SchemeCard {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  constraints: { minimumPlayerCount: number | null };
  forcedGroups: Array<{ name: string; category: string }>;
  modifiers: unknown[];
  notes: string[];
}

export interface GameSet {
  id: string;
  name: string;
  year: number;
  type: SetType;
  aliases: string[];
  heroes: HeroCard[];
  masterminds: MastermindCard[];
  villainGroups: VillainGroupCard[];
  henchmanGroups: HenchmanGroupCard[];
  schemes: SchemeCard[];
}

// =============================================================================
// Section 2: Runtime indexes (pipeline output)
// =============================================================================

export interface HeroRuntime {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  teams: string[];
  cardCount: number;
}

export interface MastermindRuntime {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  lead: { category: string; id: string } | null;
  notes: string[];
  isEpicMastermind?: boolean;
}

export interface VillainGroupRuntime {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  cardCount: number;
  forced?: boolean;
  forcedBy?: string | string[];
}

export interface HenchmanGroupRuntime {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  cardCount: number;
  forced?: boolean;
  forcedBy?: string | string[];
}

export interface SchemeRuntime {
  id: string;
  setId: string;
  name: string;
  aliases: string[];
  constraints: { minimumPlayerCount: number | null; incompatiblePlayModes?: string[] };
  forcedGroups: Array<{ category: string; id: string }>;
  modifiers: unknown[];
  notes: string[];
}

export interface RuntimeIndexes {
  setsById: Record<string, GameSet>;
  heroesById: Record<string, HeroRuntime>;
  mastermindsById: Record<string, MastermindRuntime>;
  villainGroupsById: Record<string, VillainGroupRuntime>;
  henchmanGroupsById: Record<string, HenchmanGroupRuntime>;
  schemesById: Record<string, SchemeRuntime>;
  setsList: GameSet[];
}

// =============================================================================
// Section 3: Application state (persisted)
// =============================================================================

export type PlayMode = 'standard' | 'advanced-solo' | 'two-handed-solo' | 'standard-solo-v2';

export type ThemeId = 'dark' | 'light';

export type LocaleId = 'en-US' | 'fr-FR' | 'de-DE' | 'ja-JP' | 'ko-KR' | 'es-ES';

export interface UsageStat {
  plays: number;
  lastPlayedAt: string | null;
}

export type UsageCategoryMap = Record<string, UsageStat>;

export interface UsageState {
  heroes: UsageCategoryMap;
  masterminds: UsageCategoryMap;
  villainGroups: UsageCategoryMap;
  henchmanGroups: UsageCategoryMap;
  schemes: UsageCategoryMap;
}

export interface CollectionState {
  ownedSetIds: string[];
  activeSetIds: string[] | null;
}

export interface Preferences {
  lastPlayerCount: number;
  lastAdvancedSolo: boolean;
  lastEpicMastermind?: boolean;
  lastPlayMode: PlayMode;
  selectedTab: string | null;
  onboardingCompleted: boolean;
  themeId: ThemeId;
  localeId: LocaleId;
}

export type GameOutcome = 'win' | 'loss' | 'draw';

export type GameResultStatus = 'pending' | 'completed';

export interface PlayerScoreEntry {
  playerName: string;
  score: number | null;
}

export type GameResult =
  | { status: 'pending'; outcome: null; score: null; notes: string; updatedAt: null }
  | { status: 'completed'; outcome: GameOutcome; score: number | null | PlayerScoreEntry[]; notes: string; updatedAt: string };

export interface HistoryRecord {
  id: string;
  createdAt: string;
  playerCount: number;
  advancedSolo: boolean;
  playMode: PlayMode;
  setupSnapshot: {
    mastermindId: string;
    schemeId: string;
    heroIds: string[];
    villainGroupIds: string[];
    henchmanGroupIds: string[];
  };
  result: GameResult;
  epicMastermind?: boolean;
}

export interface AppState {
  schemaVersion: number;
  collection: CollectionState;
  usage: UsageState;
  history: HistoryRecord[];
  preferences: Preferences;
}

// =============================================================================
// Section 4: Setup output
// =============================================================================

export interface SetupRequirements {
  heroCount: number;
  villainGroupCount: number;
  henchmanGroupCount: number;
  wounds: number;
  bystanders: number;
  heroNameRequirements: Array<{ pattern: string; value: number }>;
}

export interface GeneratedSetup {
  template: {
    playerCount: number;
    effectivePlayerCount: number;
    advancedSolo: boolean;
    playMode: PlayMode;
    modeLabel: string;
    modeDescription: string;
    heroCount: number;
    villainGroupCount: number;
    henchmanGroupCount: number;
    wounds: number;
  };
  requirements: SetupRequirements & {
    playerCount: number;
    effectivePlayerCount: number;
    advancedSolo: boolean;
    playMode: PlayMode;
    modeLabel: string;
    modeDescription: string;
  };
  scheme: SchemeRuntime;
  mastermind: MastermindRuntime & { leadEntity: VillainGroupRuntime | HenchmanGroupRuntime | null };
  heroes: HeroRuntime[];
  villainGroups: VillainGroupRuntime[];
  henchmanGroups: HenchmanGroupRuntime[];
  setupSnapshot: {
    mastermindId: string;
    schemeId: string;
    heroIds: string[];
    villainGroupIds: string[];
    henchmanGroupIds: string[];
  };
  forcedPicks: {
    schemeId: string | null;
    mastermindId: string | null;
    heroIds: string[];
    villainGroupIds: string[];
    henchmanGroupIds: string[];
    forcedTeam: string | null;
  };
  notices: string[];
  fallbackUsed: boolean;
  legalSchemesCount: number;
}

export interface BggMatchResult {
  matched: Array<{ setId: string; setName: string; bggName: string }>;
  unmatched: string[];
}

export interface MyludoMatchResult {
  matched: Array<{ setId: string; setName: string; myludoName: string }>;
  unmatched: string[];
}

// =============================================================================
// Section 6: Storage & persistence
// =============================================================================

export interface StorageOperationResult {
  ok: boolean;
  storageAvailable: boolean;
  message: string;
}

export interface StorageAdapter {
  available: boolean;
  message: string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): StorageOperationResult;
  removeItem(key: string): StorageOperationResult;
}

export interface BackupPayload {
  schemaId: string;
  version: number;
  exportedAt: string;
  metadata: {
    appId: string;
    storageKey: string;
    stateSchemaVersion: number;
  };
  data: {
    collection: CollectionState;
    usage: UsageState;
    history: HistoryRecord[];
    preferences: Preferences;
  };
}

export interface BackupSummary {
  ownedSetCount: number;
  historyCount: number;
  usageCounts: Record<string, number>;
  themeId: ThemeId;
  selectedTab: string | null;
  playMode: PlayMode;
}

// =============================================================================
// Section 7: Localization
// =============================================================================

export type LocaleTools = {
  localeId: LocaleId;
  documentLang: string;
  localeLabel: string;
  t(key: MessageKey, params?: Record<string, unknown>): string;
  formatNumber(value: number | null | undefined | '', fallback?: string): string;
  formatDate(value: string | null | undefined | false, fallback?: string): string;
  formatDateTime(value: string | null | undefined | false, fallback?: string): string;
  formatList(values: string[], fallback?: string): string;
  formatPlayerLabel(count: number): string;
  formatGameCount(count: number): string;
  formatPlayCount(count: number): string;
  formatEntityCount(count: number, singularKey: MessageKey, pluralKey?: MessageKey): string;
  formatResultStatus(result: unknown): string;
  formatPersistedPlayMode(playerCount: number, playMode: string): string;
  formatGroupingModeLabel(modeId: string): string;
  getTabLabel(tabId: string): string;
  getTabShortLabel(tabId: string): string;
  getTabDescription(tabId: string): string;
  getThemeLabel(themeId: string): string;
  getThemeDescription(themeId: string): string;
  getHistoryGroupingLabel(modeId: string): string;
  getUsageLabel(category: string): string;
  getOutcomeLabel(outcomeId: string): string;
  getPlayModeLabel(playMode: string, playerCount?: number): string;
  getPlayModeDescription(playMode: string, playerCount?: number): string;
  getPlayModeHelpText(playerCount: number, playMode: string): string;
  getBrowseTypeLabel(type: string): string;
  getBrowseTypeFilterLabel(type: string): string;
  getBrowseSortLabel(sortKey: string): string;
  getCollectionGroupLabel(type: string): string;
  getToastVariantLabel(variant: string): string;
  localizeNotice(notice: string): string;
  localizeValidationMessage(message: string): string;
  [key: string]: unknown;
};

// =============================================================================
// Section 8: Theme
// =============================================================================

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  description: string;
  colorScheme: 'dark' | 'light';
}

// =============================================================================
// Section 9: App integration types (Epic 67)
// =============================================================================

export interface AppTab {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export interface ModalConfig {
  title: string;
  description: string;
  cancelAction: string;
  confirmAction: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface OnboardingActions {
  openOnboardingTab: (tabId: string) => void;
  previousOnboardingStep: () => void;
  nextOnboardingStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

export interface AppPersistenceState {
  storageAvailable: boolean;
  hydratedFromStorage: boolean;
  recoveredOnLoad: boolean;
  hydrateNotices: string[];
  updateNotices: string[];
  lastSaveMessage: string | null;
  lastSaveOk: boolean | null;
}

export interface StagedBackup {
  fileName: string;
  payload: BackupPayload;
  importedState: AppState;
  summary: BackupSummary;
}
