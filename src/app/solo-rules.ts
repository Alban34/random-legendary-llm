import type { PlayMode } from './types.ts';

export const SOLO_RULES_PANEL_MODES = new Set(['standard', 'advanced-solo', 'standard-solo-v2']) as ReadonlySet<PlayMode>;

/**
 * Returns an ordered array of locale key strings for the given solo play mode,
 * or null if the mode is not a solo-rules-eligible mode.
 */
export function getSoloRulesItems(playMode: PlayMode): string[] | null {
  switch (playMode) {
    case 'standard':
      return [
        'newGame.soloRules.standard.villainDeck',
        'newGame.soloRules.standard.schemeTwist',
        'newGame.soloRules.standard.eachOtherPlayer',
        'newGame.soloRules.standard.alwaysLeads'
      ];
    case 'advanced-solo':
      return [
        'newGame.soloRules.advancedSolo.villainDeck',
        'newGame.soloRules.advancedSolo.masterStrike',
        'newGame.soloRules.advancedSolo.schemeTwist',
        'newGame.soloRules.advancedSolo.eachOtherPlayer',
        'newGame.soloRules.advancedSolo.alwaysLeads'
      ];
    case 'standard-solo-v2':
      return [
        'newGame.soloRules.standardV2.villainDeck',
        'newGame.soloRules.standardV2.firstTurnHenchmen',
        'newGame.soloRules.standardV2.schemeTwist',
        'newGame.soloRules.standardV2.eachOtherPlayer',
        'newGame.soloRules.standardV2.mastermindAbility',
        'newGame.soloRules.standardV2.alwaysLeads'
      ];
    default:
      return null;
  }
}
