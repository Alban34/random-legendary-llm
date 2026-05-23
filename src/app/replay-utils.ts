// src/app/replay-utils.ts

// ---------------------------------------------------------------------------
// Story 1 audit — HistoryRecord ↔ GeneratedSetup field coverage
//
// setupSnapshot.{mastermindId, schemeId, heroIds, villainGroupIds, henchmanGroupIds}
//   exactly mirrors GeneratedSetup.setupSnapshot — all entity IDs are present.
// HistoryRecord.{playerCount, advancedSolo, playMode} are sufficient inputs to
//   resolveSetupTemplate(), which derives the full SetupTemplate.
// HistoryRecord.epicMastermind is an optional boolean; treat absent as false.
// No new fields are needed on HistoryRecord for full setup reconstruction.
// ---------------------------------------------------------------------------

import type { HistoryRecord, GeneratedSetup } from './types.ts';
import type { RuntimeIndexes } from './types.ts';
import { resolveSetupTemplate, summarizeSetupTemplate } from './setup-rules.ts';
import { applySchemeModifiersToTemplate } from './setup-scheme-modifiers.ts';
import { isSoloMode } from './setup-validator.ts';

type RuntimeWithIndexes = { indexes: RuntimeIndexes };

export function reconstructSetupFromRecord(
  record: HistoryRecord,
  runtime: RuntimeWithIndexes
): GeneratedSetup {
  const { mastermindId, schemeId, heroIds, villainGroupIds, henchmanGroupIds } =
    record.setupSnapshot;
  const { indexes } = runtime;

  const mastermind = indexes.mastermindsById[mastermindId];
  if (!mastermind) {
    throw new Error(`Replay failed: mastermind ID not found: ${mastermindId}`);
  }

  const scheme = indexes.schemesById[schemeId];
  if (!scheme) {
    throw new Error(`Replay failed: scheme ID not found: ${schemeId}`);
  }

  const heroes = heroIds.map((id) => {
    const hero = indexes.heroesById[id];
    if (!hero) throw new Error(`Replay failed: hero ID not found: ${id}`);
    return hero;
  });

  const villainGroups = villainGroupIds.map((id) => {
    const group = indexes.villainGroupsById[id];
    if (!group) throw new Error(`Replay failed: villain group ID not found: ${id}`);
    return group;
  });

  const henchmanGroups = henchmanGroupIds.map((id) => {
    const group = indexes.henchmanGroupsById[id];
    if (!group) throw new Error(`Replay failed: henchman group ID not found: ${id}`);
    return group;
  });

  const template = resolveSetupTemplate(record.playerCount, {
    advancedSolo: record.advancedSolo,
    playMode: record.playMode
  });

  const effectiveRequirements = applySchemeModifiersToTemplate(template, scheme);

  const leadEntity =
    isSoloMode(template) || !mastermind.lead
      ? null
      : mastermind.lead.category === 'villains'
        ? (indexes.villainGroupsById[mastermind.lead.id] ?? null)
        : (indexes.henchmanGroupsById[mastermind.lead.id] ?? null);

  return {
    template: summarizeSetupTemplate(template),
    requirements: {
      ...summarizeSetupTemplate(template),
      heroCount: effectiveRequirements.heroCount,
      villainGroupCount: effectiveRequirements.villainGroupCount,
      henchmanGroupCount: effectiveRequirements.henchmanGroupCount,
      wounds: effectiveRequirements.wounds,
      bystanders: effectiveRequirements.bystanders
    } as GeneratedSetup['requirements'],
    scheme: { ...scheme, notes: [...scheme.notes] },
    mastermind: { ...mastermind, leadEntity },
    heroes,
    villainGroups,
    henchmanGroups,
    setupSnapshot: { ...record.setupSnapshot },
    forcedPicks: {
      schemeId: record.setupSnapshot.schemeId,
      mastermindId: record.setupSnapshot.mastermindId,
      heroIds: [...record.setupSnapshot.heroIds],
      villainGroupIds: [...record.setupSnapshot.villainGroupIds],
      henchmanGroupIds: [...record.setupSnapshot.henchmanGroupIds],
      forcedTeam: null,
      preferredExpansionId: null
    } as GeneratedSetup['forcedPicks'],
    notices: [],
    fallbackUsed: false,
    legalSchemesCount: 0
  } as GeneratedSetup;
}
