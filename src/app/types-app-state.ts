// Section 3: Application state (persisted)

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
