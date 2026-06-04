// Section 1: Game data (canonical source) + Section 2: Runtime indexes

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
  leadNameFilter?: string[];
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
  leadCandidates?: Array<{ category: string; id: string }>;
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

// Set whose card arrays hold normalized runtime entities (pipeline output).
export interface RuntimeGameSet {
  id: string;
  name: string;
  year: number;
  type: SetType;
  aliases: string[];
  heroes: HeroRuntime[];
  masterminds: MastermindRuntime[];
  villainGroups: VillainGroupRuntime[];
  henchmanGroups: HenchmanGroupRuntime[];
  schemes: SchemeRuntime[];
}

export interface RuntimeIndexes {
  setsById: Record<string, RuntimeGameSet>;
  heroesById: Record<string, HeroRuntime>;
  mastermindsById: Record<string, MastermindRuntime>;
  villainGroupsById: Record<string, VillainGroupRuntime>;
  henchmanGroupsById: Record<string, HenchmanGroupRuntime>;
  schemesById: Record<string, SchemeRuntime>;
  setsList: RuntimeGameSet[];
}
