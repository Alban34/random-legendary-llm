import { getPlayModeLabel, resolvePlayMode, resolveSetupTemplate } from './setup-rules.mjs';

export function isAdvancedSoloAvailable(playerCount) {
  return Number(playerCount) === 1;
}

export function getAvailablePlayModes(playerCount) {
  if (Number(playerCount) !== 1) {
    return [{ id: 'standard', label: 'Standard', description: 'Use the standard multiplayer setup counts.' }];
  }

  return [
    { id: 'standard', label: 'Standard Solo', description: 'Use the standard 1-player setup counts.' },
    { id: 'advanced-solo', label: 'Advanced Solo', description: 'Use the Advanced Solo setup counts with 4 Heroes and 2 Villain Groups.' },
    { id: 'two-handed-solo', label: 'Two-Handed Solo', description: 'Track the game as solo, but use the standard 2-player setup counts.' }
  ];
}

export function getPlayModeHelpText(playerCount, playMode) {
  if (Number(playerCount) !== 1) {
    return 'Alternate solo modes are disabled until you switch back to 1 player.';
  }

  if (resolvePlayMode(playerCount, { playMode }) === 'two-handed-solo') {
    return 'Two-Handed Solo keeps the game labeled as solo, but uses the standard 2-player setup counts.';
  }

  return 'Choose between Standard Solo, Advanced Solo, and Two-Handed Solo while staying in 1-player mode.';
}

export function getDisplayedSetupRequirements({ playerCount, advancedSolo, playMode, currentSetup }) {
  const template = resolveSetupTemplate(playerCount, { advancedSolo, playMode });

  if (
    currentSetup?.template.playerCount === template.playerCount
    && currentSetup?.template.playMode === template.playMode
  ) {
    return currentSetup.requirements;
  }

  return {
    heroCount: template.heroCount,
    villainGroupCount: template.villainGroupCount,
    henchmanGroupCount: template.henchmanGroupCount,
    wounds: template.wounds,
    bystanders: 30
  };
}

export function formatHeroTeamLabel(hero) {
  return hero.teams?.length ? hero.teams.join(' · ') : 'No team listed';
}

export function formatMastermindLeadLabel(mastermind) {
  if (!mastermind?.leadEntity) {
    return 'No mandatory lead';
  }

  return `Always leads: ${mastermind.leadEntity.name}`;
}

export function formatPersistedPlayMode(playerCount, playMode) {
  return `${playerCount}P · ${getPlayModeLabel(playMode, playerCount)}`;
}


