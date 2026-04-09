export const SETUP_RULES = {
  1: { heroCount: 3, villainGroupCount: 1, henchmanGroupCount: 1, wounds: 25 },
  '1-advanced': { heroCount: 4, villainGroupCount: 2, henchmanGroupCount: 1, wounds: 25 },
  2: { heroCount: 5, villainGroupCount: 2, henchmanGroupCount: 1, wounds: 30 },
  3: { heroCount: 5, villainGroupCount: 3, henchmanGroupCount: 1, wounds: 30 },
  4: { heroCount: 6, villainGroupCount: 3, henchmanGroupCount: 2, wounds: 35 },
  5: { heroCount: 6, villainGroupCount: 4, henchmanGroupCount: 2, wounds: 35 }
};

function normalizePlayerCount(playerCount) {
  const normalized = Number(playerCount);
  if (!Number.isInteger(normalized) || normalized < 1 || normalized > 5) {
    throw new Error(`Unsupported player count: ${playerCount}`);
  }
  return normalized;
}

export function resolveSetupTemplate(playerCount, advancedSolo = false) {
  const normalizedPlayerCount = normalizePlayerCount(playerCount);
  if (advancedSolo && normalizedPlayerCount !== 1) {
    throw new Error('Advanced Solo is only available for 1 player.');
  }

  const key = advancedSolo ? '1-advanced' : normalizedPlayerCount;
  const template = SETUP_RULES[key];
  if (!template) {
    throw new Error(`Missing setup template for ${advancedSolo ? 'Advanced Solo' : `${normalizedPlayerCount} players`}.`);
  }

  return {
    key: String(key),
    playerCount: normalizedPlayerCount,
    advancedSolo,
    modeLabel: advancedSolo
      ? 'Advanced Solo'
      : normalizedPlayerCount === 1
        ? 'Standard Solo'
        : 'Standard',
    ...template
  };
}

export function summarizeSetupTemplate(template) {
  return {
    playerCount: template.playerCount,
    advancedSolo: template.advancedSolo,
    modeLabel: template.modeLabel,
    heroCount: template.heroCount,
    villainGroupCount: template.villainGroupCount,
    henchmanGroupCount: template.henchmanGroupCount,
    wounds: template.wounds
  };
}

