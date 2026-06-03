import type { SchemeRuntime } from './types.ts';
import type { SetupTemplate } from './setup-rules.ts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BYSTANDERS = 30;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SchemeRequirements {
  heroCount: number;
  villainGroupCount: number;
  henchmanGroupCount: number;
  wounds: number;
  bystanders: number;
  heroNameRequirements: Array<{ pattern: string; value: number }>;
  playerCount?: number;
}

interface Modifier {
  type: string;
  amount?: number;
  value?: number;
  pattern?: string;
  playerCounts?: number[];
}

// ---------------------------------------------------------------------------
// Modifier application
// ---------------------------------------------------------------------------

export function applyModifier(requirements: SchemeRequirements, modifier: Modifier, playerCount: number): void {
  switch (modifier.type) {
    case 'add-hero':
      requirements.heroCount += modifier.amount || 0;
      break;
    case 'add-villain-group':
      requirements.villainGroupCount += modifier.amount || 0;
      break;
    case 'add-henchman-group':
      requirements.henchmanGroupCount += modifier.amount || 0;
      break;
    case 'conditional-add-villain-group':
      if ((modifier.playerCounts || []).includes(playerCount)) {
        requirements.villainGroupCount += modifier.amount || 0;
      }
      break;
    case 'conditional-add-hero':
      if ((modifier.playerCounts || []).includes(playerCount)) {
        requirements.heroCount += modifier.amount || 0;
      }
      break;
    case 'set-min-heroes':
      requirements.heroCount = Math.max(requirements.heroCount, modifier.value || 0);
      break;
    case 'conditional-set-min-heroes':
      if ((modifier.playerCounts || []).includes(playerCount)) {
        requirements.heroCount = Math.max(requirements.heroCount, modifier.value || 0);
      }
      break;
    case 'set-bystanders':
      requirements.bystanders = modifier.value ?? requirements.bystanders;
      break;
    case 'replace-villain-group-with-specific-group':
      break;
    case 'require-hero-name-match-count':
      requirements.heroNameRequirements.push({
        pattern: modifier.pattern!,
        value: modifier.value!
      });
      break;
    default:
      break;
  }
}

export function applySchemeModifiersToTemplate(template: SetupTemplate, scheme: SchemeRuntime): SchemeRequirements {
  const requirements: SchemeRequirements = {
    heroCount: template.heroCount,
    villainGroupCount: template.villainGroupCount,
    henchmanGroupCount: template.henchmanGroupCount,
    wounds: template.wounds,
    bystanders: DEFAULT_BYSTANDERS,
    heroNameRequirements: []
  };

  for (const modifier of scheme.modifiers || []) {
    applyModifier(requirements, modifier as Modifier, template.playerCount);
  }

  return requirements;
}
