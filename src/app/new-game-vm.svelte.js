import { createEmptyForcedPicks } from './forced-picks-utils.mjs';

let _currentSetup = $state(null);
let _generatorError = $state(null);
let _generatorNotices = $state([]);
let _selectedPlayerCount = $state(1);
let _selectedPlayMode = $state('standard');
let _advancedSolo = $state(false);
let _forcedPicks = $state(createEmptyForcedPicks());

export function getCurrentSetup() { return _currentSetup; }
export function setCurrentSetup(v) { _currentSetup = v; }

export function getGeneratorError() { return _generatorError; }
export function setGeneratorError(v) { _generatorError = v; }

export function getGeneratorNotices() { return _generatorNotices; }
export function setGeneratorNotices(v) { _generatorNotices = v; }

export function getSelectedPlayerCount() { return _selectedPlayerCount; }
export function setSelectedPlayerCount(v) { _selectedPlayerCount = v; }

export function getSelectedPlayMode() { return _selectedPlayMode; }
export function setSelectedPlayMode(v) { _selectedPlayMode = v; }

export function getAdvancedSolo() { return _advancedSolo; }
export function setAdvancedSolo(v) { _advancedSolo = v; }

export function getForcedPicks() { return _forcedPicks; }
export function setForcedPicks(v) { _forcedPicks = v; }
export function resetForcedPicks() { _forcedPicks = createEmptyForcedPicks(); }

export function resetNewGame() {
  _generatorError = null;
  _generatorNotices = [];
  _currentSetup = null;
}
