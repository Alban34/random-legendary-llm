import { getPlayModeLabel, resolvePlayMode, resolveSetupTemplate } from './setup-rules.ts';
import type { SetupRequirements } from './types.ts';

export interface PlayModeOption {
  id: string;
  label: string;
  description: string;
}

export interface GetDisplayedSetupRequirementsOptions {
  playerCount: number;
  advancedSolo: boolean;
  playMode: string;
  currentSetup?: {
    template: { playerCount: number; playMode: string };
    requirements: SetupRequirements;
  } | null;
}

export function isAdvancedSoloAvailable(playerCount: number): boolean {
  return Number(playerCount) === 1;
}

export function getAvailablePlayModes(playerCount: number): PlayModeOption[] {
  if (Number(playerCount) !== 1) {
    return [{ id: 'standard', label: 'Standard', description: 'Use the standard multiplayer setup counts.' }];
  }

  return [
    { id: 'standard', label: 'Standard Solo v1', description: 'Use the standard 1-player setup counts.' },
    { id: 'advanced-solo', label: 'Advanced Solo', description: 'Use the Advanced Solo setup counts — same card counts as Standard Solo v1, with an increased Master Strike deck.' },
    { id: 'two-handed-solo', label: 'Two-Handed Solo', description: 'Track the game as solo, but use the standard 2-player setup counts.' },
    { id: 'standard-solo-v2', label: 'Standard Solo v2', description: 'Use the Second Edition solo setup counts — 3 Heroes, 1 Villain Group, 1 Henchman Group.' }
  ];
}

export function getPlayModeHelpText(playerCount: number, playMode: string): string {
  if (Number(playerCount) !== 1) {
    return 'Alternate solo modes are disabled until you switch back to 1 player.';
  }

  type ResolvePlayModeFn = (playerCount: number, opts: { playMode?: string }) => string;
  if ((resolvePlayMode as unknown as ResolvePlayModeFn)(playerCount, { playMode }) === 'two-handed-solo') {
    return 'Two-Handed Solo keeps the game labeled as solo, but uses the standard 2-player setup counts.';
  }

  return 'Choose between Standard Solo v1, Advanced Solo, Two-Handed Solo, and Standard Solo v2 while staying in 1-player mode.';
}

export function getDisplayedSetupRequirements({ playerCount, advancedSolo, playMode, currentSetup }: GetDisplayedSetupRequirementsOptions): Omit<SetupRequirements, 'heroNameRequirements'> {
  type ResolveTemplateFn = (playerCount: number, opts: { advancedSolo?: boolean; playMode?: string }) => { heroCount: number; villainGroupCount: number; henchmanGroupCount: number; wounds: number; playerCount: number; playMode: string };
  const template = (resolveSetupTemplate as unknown as ResolveTemplateFn)(playerCount, { advancedSolo, playMode });

  if (
    currentSetup?.template.playerCount === template.playerCount
    && currentSetup?.template.playMode === template.playMode
  ) {
    return currentSetup!.requirements;
  }

  return {
    heroCount: template.heroCount,
    villainGroupCount: template.villainGroupCount,
    henchmanGroupCount: template.henchmanGroupCount,
    wounds: template.wounds,
    bystanders: 30,
  };
}

export function formatHeroTeamLabel(hero: { teams?: string[] }): string {
  return hero.teams?.length ? hero.teams.join(' · ') : 'No team listed';
}

export function formatMastermindLeadLabel(mastermind: { leadEntity?: { name: string } | null }): string {
  if (!mastermind?.leadEntity) {
    return 'No mandatory lead';
  }

  return `Always leads: ${mastermind.leadEntity.name}`;
}

export function formatPersistedPlayMode(playerCount: number, playMode: string): string {
  return `${playerCount}P · ${getPlayModeLabel(playMode as import('./types.ts').PlayMode, playerCount)}`;
}
