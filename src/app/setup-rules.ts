import type { PlayMode, SetupRequirements } from './types.ts';

export interface SetupTemplate {
  key: string;
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
}

export type SetupTemplateSummary = Omit<SetupTemplate, 'key'>;

export const SETUP_RULES = {
  1: { heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 },
  '1-advanced': { heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 },
  '1-two-handed': { heroCount: 5, villainGroupCount: 2, henchmanGroupCount: 1, wounds: 30 },
  '1-standard-v2': { heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 },
  2: { heroCount: 5, villainGroupCount: 2, henchmanGroupCount: 1, wounds: 30 },
  3: { heroCount: 5, villainGroupCount: 3, henchmanGroupCount: 1, wounds: 30 },
  4: { heroCount: 5, villainGroupCount: 3, henchmanGroupCount: 2, wounds: 35 },
  5: { heroCount: 6, villainGroupCount: 5, henchmanGroupCount: 2, wounds: 35 }
} as unknown as Record<string | number, SetupRequirements>;

export const PLAY_MODE_OPTIONS: Record<PlayMode, { label: string; soloLabel: string; description: string }> = {
  standard: {
    label: 'Standard',
    soloLabel: 'Standard Solo v1',
    description: 'Use the standard setup counts for the selected player count.'
  },
  'advanced-solo': {
    label: 'Advanced Solo',
    soloLabel: 'Advanced Solo',
    description: 'Use the Advanced Solo setup counts — same card counts as Standard Solo v1, with an increased Master Strike deck.'
  },
  'two-handed-solo': {
    label: 'Two-Handed Solo',
    soloLabel: 'Two-Handed Solo',
    description: 'Track the game as solo, but use the standard 2-player setup counts.'
  },
  'standard-solo-v2': {
    label: 'Standard v2',
    soloLabel: 'Standard v2',
    description: 'Use the Second Edition solo setup counts — 3 Heroes, 1 Villain Group, 1 Henchman Group.'
  }
};

function normalizePlayerCount(playerCount: number): number {
  const normalized = Number(playerCount);
  if (!Number.isInteger(normalized) || normalized < 1 || normalized > 5) {
    throw new Error(`Unsupported player count: ${playerCount}`);
  }
  return normalized;
}

export function resolvePlayMode(playerCount: number, modeOptions: boolean | Record<string, unknown> = false): PlayMode {
  const normalizedPlayerCount = normalizePlayerCount(playerCount);
  const options: Record<string, unknown> = typeof modeOptions === 'object' && modeOptions !== null
    ? modeOptions
    : { advancedSolo: Boolean(modeOptions) };

  let playMode = typeof options.playMode === 'string' ? options.playMode : 'standard';
  if (options.playMode === undefined && options.advancedSolo === true) {
    playMode = 'advanced-solo';
  }

  if (!PLAY_MODE_OPTIONS[playMode as PlayMode]) {
    throw new Error(`Unsupported play mode: ${playMode}`);
  }

  if (playMode === 'advanced-solo' && normalizedPlayerCount !== 1) {
    throw new Error('Advanced Solo is only available for 1 player.');
  }

  if (playMode === 'two-handed-solo' && normalizedPlayerCount !== 1) {
    throw new Error('Two-Handed Solo is only available for 1 player.');
  }

  if (playMode === 'standard-solo-v2' && normalizedPlayerCount !== 1) {
    throw new Error('Standard v2 is only available for 1 player.');
  }

  return playMode as PlayMode;
}

export function getPlayModeLabel(playMode: PlayMode, playerCount: number = 1): string {
  if (playMode === 'advanced-solo') {
    return PLAY_MODE_OPTIONS['advanced-solo'].label;
  }

  if (playMode === 'two-handed-solo') {
    return PLAY_MODE_OPTIONS['two-handed-solo'].label;
  }

  if (playMode === 'standard-solo-v2') {
    return PLAY_MODE_OPTIONS['standard-solo-v2'].label;
  }

  return Number(playerCount) === 1 ? PLAY_MODE_OPTIONS.standard.soloLabel : PLAY_MODE_OPTIONS.standard.label;
}

export function resolveSetupTemplate(playerCount: number, modeOptions: boolean | Record<string, unknown> = false): SetupTemplate {
  const normalizedPlayerCount = normalizePlayerCount(playerCount);
  const playMode = resolvePlayMode(normalizedPlayerCount, modeOptions);

  let key: string | number = normalizedPlayerCount;
  if (playMode === 'advanced-solo') {
    key = '1-advanced';
  } else if (playMode === 'two-handed-solo') {
    key = '1-two-handed';
  } else if (playMode === 'standard-solo-v2') {
    key = '1-standard-v2';
  }

  const template = SETUP_RULES[key];
  if (!template) {
    throw new Error(`Missing setup template for ${getPlayModeLabel(playMode, normalizedPlayerCount)}.`);
  }

  return {
    key: String(key),
    playerCount: normalizedPlayerCount,
    effectivePlayerCount: playMode === 'two-handed-solo' ? 2 : normalizedPlayerCount,
    advancedSolo: playMode === 'advanced-solo',
    playMode,
    modeLabel: getPlayModeLabel(playMode, normalizedPlayerCount),
    modeDescription: PLAY_MODE_OPTIONS[playMode].description,
    ...template
  } as SetupTemplate;
}

export function summarizeSetupTemplate(template: SetupTemplate): SetupTemplateSummary {
  return {
    playerCount: template.playerCount,
    effectivePlayerCount: template.effectivePlayerCount,
    advancedSolo: template.advancedSolo,
    playMode: template.playMode,
    modeLabel: template.modeLabel,
    modeDescription: template.modeDescription,
    heroCount: template.heroCount,
    villainGroupCount: template.villainGroupCount,
    henchmanGroupCount: template.henchmanGroupCount,
    wounds: template.wounds
  };
}
