// src/app/new-game-vm.svelte.ts
// Svelte 5 reactive view-model for the New Game tab.

import { createEmptyForcedPicks } from './forced-picks-utils.ts';
import type { ForcedPicks } from './forced-picks-utils.ts';
import type { PlayMode, GeneratedSetup } from './types.ts';

let _currentSetup: GeneratedSetup | null = $state<GeneratedSetup | null>(null);
let _generatorError: string | null = $state<string | null>(null);
let _generatorNotices: string[] = $state<string[]>([]);
let _selectedPlayerCount: number = $state<number>(1);
let _selectedPlayMode: PlayMode = $state<PlayMode>('standard');
let _advancedSolo: boolean = $state<boolean>(false);
let _forcedPicks: ForcedPicks = $state<ForcedPicks>(createEmptyForcedPicks());

export function getCurrentSetup(): GeneratedSetup | null { return _currentSetup; }
export function setCurrentSetup(v: GeneratedSetup | null): void { _currentSetup = v; }

export function getGeneratorError(): string | null { return _generatorError; }
export function setGeneratorError(v: string | null): void { _generatorError = v; }

export function getGeneratorNotices(): string[] { return _generatorNotices; }
export function setGeneratorNotices(v: string[]): void { _generatorNotices = v; }

export function getSelectedPlayerCount(): number { return _selectedPlayerCount; }
export function setSelectedPlayerCount(v: number): void { _selectedPlayerCount = v; }

export function getSelectedPlayMode(): PlayMode { return _selectedPlayMode; }
export function setSelectedPlayMode(v: PlayMode): void { _selectedPlayMode = v; }

export function getAdvancedSolo(): boolean { return _advancedSolo; }
export function setAdvancedSolo(v: boolean): void { _advancedSolo = v; }

export function getForcedPicks(): ForcedPicks { return _forcedPicks; }
export function setForcedPicks(v: ForcedPicks): void { _forcedPicks = v; }
export function resetForcedPicks(): void { _forcedPicks = createEmptyForcedPicks(); }

export function resetNewGame(): void {
  _generatorError = null;
  _generatorNotices = [];
  _currentSetup = null;
}
