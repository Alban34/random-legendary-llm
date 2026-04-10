import { resolveSetupTemplate } from './setup-rules.mjs';

export function isAdvancedSoloAvailable(playerCount) {
  return Number(playerCount) === 1;
}

export function getDisplayedSetupRequirements({ playerCount, advancedSolo, currentSetup }) {
  const template = resolveSetupTemplate(playerCount, advancedSolo);

  if (
    currentSetup
    && currentSetup.template.playerCount === template.playerCount
    && currentSetup.template.advancedSolo === template.advancedSolo
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
  return hero.teams && hero.teams.length ? hero.teams.join(' · ') : 'No team listed';
}

export function formatMastermindLeadLabel(mastermind) {
  if (!mastermind?.leadEntity) {
    return 'No mandatory lead';
  }

  return `Always leads: ${mastermind.leadEntity.name}`;
}

