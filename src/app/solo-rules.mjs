export const SOLO_RULES_PANEL_MODES = new Set(['standard', 'advanced-solo', 'standard-solo-v2']);

/**
 * Returns an ordered array of locale key strings for the given solo play mode,
 * or null if the mode is not a solo-rules-eligible mode.
 *
 * @param {string} playMode
 * @returns {string[]|null}
 */
export function getSoloRulesItems(playMode) {
  switch (playMode) {
    case 'standard':
      return [
        'newGame.soloRules.standard.villainDeck',
        'newGame.soloRules.standard.schemeTwist',
        'newGame.soloRules.standard.eachOtherPlayer'
      ];
    case 'advanced-solo':
      return [
        'newGame.soloRules.advancedSolo.villainDeck',
        'newGame.soloRules.advancedSolo.masterStrike',
        'newGame.soloRules.advancedSolo.schemeTwist',
        'newGame.soloRules.advancedSolo.eachOtherPlayer'
      ];
    case 'standard-solo-v2':
      return [
        'newGame.soloRules.standardV2.villainDeck',
        'newGame.soloRules.standardV2.firstTurnHenchmen',
        'newGame.soloRules.standardV2.schemeTwist',
        'newGame.soloRules.standardV2.eachOtherPlayer',
        'newGame.soloRules.standardV2.mastermindAbility'
      ];
    default:
      return null;
  }
}
