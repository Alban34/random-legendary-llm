import type { PlayMode } from './types-app-state.ts';
import type { SchemeRuntime, HeroRuntime, MastermindRuntime, VillainGroupRuntime, HenchmanGroupRuntime } from './types-game-data.ts';

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

// =============================================================================
// Section 5: BGG / MyLudo match results
// =============================================================================

export interface BggMatchResult {
  matched: Array<{ setId: string; setName: string; bggName: string }>;
  unmatched: string[];
}

export interface MyludoMatchResult {
  matched: Array<{ setId: string; setName: string; myludoName: string }>;
  unmatched: string[];
}
