import { deepClone, isPlainObject } from './object-utils.ts';
import { SCHEMA_VERSION, STORAGE_KEY, sanitizePersistedState } from './state-store.ts';

import type { AppState, BackupPayload, BackupSummary, RuntimeIndexes } from './types';

type Indexes = RuntimeIndexes;

export const BACKUP_SCHEMA_ID: string = 'legendary-marvel-randomizer-backup';
export const BACKUP_SCHEMA_VERSION: number = 1;

function normalizeIsoString(value: unknown): string {
  return typeof value === 'string' && value ? value : new Date().toISOString();
}

export function createBackupPayload(state: AppState, { exportedAt = new Date().toISOString() }: { exportedAt?: string } = {}): BackupPayload {
  return {
    schemaId: BACKUP_SCHEMA_ID,
    version: BACKUP_SCHEMA_VERSION,
    exportedAt: normalizeIsoString(exportedAt),
    metadata: {
      appId: 'legendary-marvel-randomizer',
      storageKey: STORAGE_KEY,
      stateSchemaVersion: SCHEMA_VERSION
    },
    data: deepClone({
      collection: state.collection,
      usage: state.usage,
      history: state.history,
      preferences: state.preferences
    }) as BackupPayload['data']
  };
}

export function buildBackupFilename(exportedAt: string = new Date().toISOString()): string {
  const safeTimestamp = normalizeIsoString(exportedAt).replaceAll(':', '-').replaceAll('.', '-');
  return `legendary-marvel-randomizer-backup-${safeTimestamp}.json`;
}

function validateBackupEnvelope(payload: unknown): string | null {
  if (!isPlainObject(payload)) {
    return 'Backup files must contain a JSON object at the root.';
  }

  const p = payload as Record<string, unknown>;

  if (p.schemaId !== BACKUP_SCHEMA_ID) {
    return 'This backup file uses an unsupported schema identifier.';
  }

  if (p.version !== BACKUP_SCHEMA_VERSION) {
    return `This backup file uses unsupported schema version ${String(p.version)}.`;
  }

  if (!isPlainObject(p.data)) {
    return 'This backup file is missing its data section.';
  }

  const data = p.data as Record<string, unknown>;

  if (!isPlainObject(data.collection)) {
    return 'This backup file is missing collection data.';
  }

  if (!isPlainObject(data.usage)) {
    return 'This backup file is missing usage data.';
  }

  if (!Array.isArray(data.history)) {
    return 'This backup file is missing history data.';
  }

  if (!isPlainObject(data.preferences)) {
    return 'This backup file is missing preference data.';
  }

  return null;
}

export function parseBackupPayload(payload: unknown, { indexes }: { indexes: Indexes }): { ok: false; error: string } | { ok: true; payload: BackupPayload; importedState: AppState } {
  const envelopeError = validateBackupEnvelope(payload);
  if (envelopeError) {
    return { ok: false, error: envelopeError };
  }

  const p = payload as BackupPayload;
  const importedCandidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: p.data.collection,
    usage: p.data.usage,
    history: p.data.history,
    preferences: p.data.preferences
  };
  const sanitized = sanitizePersistedState({ candidate: importedCandidate, indexes });

  if (sanitized.notices.length) {
    return {
      ok: false,
      error: `This backup file could not be imported safely: ${sanitized.notices.join(' ')}`
    };
  }

  return {
    ok: true,
    payload: p,
    importedState: sanitized.state
  };
}

export function parseBackupText(rawText: unknown, { indexes }: { indexes: Indexes }): { ok: false; error: string } | { ok: true; payload: BackupPayload; importedState: AppState } {
  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(rawText as string);
  } catch {
    return { ok: false, error: 'Backup files must contain valid JSON.' };
  }

  return parseBackupPayload(parsedPayload, { indexes });
}

function mergeUsageBucket(
  currentBucket: Record<string, { plays: number; lastPlayedAt: string | null }>,
  importedBucket: Record<string, { plays: number; lastPlayedAt: string | null }>
): Record<string, { plays: number; lastPlayedAt: string | null }> {
  const mergedBucket = { ...(deepClone(currentBucket) as typeof currentBucket) };

  for (const [id, importedStat] of Object.entries(importedBucket)) {
    const currentStat = mergedBucket[id];
    if (!currentStat) {
      mergedBucket[id] = { ...importedStat };
      continue;
    }

    const currentLastPlayedAt = currentStat.lastPlayedAt ? new Date(currentStat.lastPlayedAt).getTime() : 0;
    const importedLastPlayedAt = importedStat.lastPlayedAt ? new Date(importedStat.lastPlayedAt).getTime() : 0;

    mergedBucket[id] = {
      plays: Math.max(currentStat.plays, importedStat.plays),
      lastPlayedAt: importedLastPlayedAt >= currentLastPlayedAt ? importedStat.lastPlayedAt : currentStat.lastPlayedAt
    };
  }

  return mergedBucket;
}

export function mergeImportedState(currentState: AppState, importedState: AppState): AppState {
  const currentHistoryById = new Map(currentState.history.map((record) => [record.id, record]));
  importedState.history.forEach((record) => {
    currentHistoryById.set(record.id, record);
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    collection: {
      ownedSetIds: [...new Set([...currentState.collection.ownedSetIds, ...importedState.collection.ownedSetIds])]
        .sort((left, right) => left.localeCompare(right)),
      activeSetIds: currentState.collection.activeSetIds
    },
    usage: {
      heroes: mergeUsageBucket(currentState.usage.heroes, importedState.usage.heroes),
      masterminds: mergeUsageBucket(currentState.usage.masterminds, importedState.usage.masterminds),
      villainGroups: mergeUsageBucket(currentState.usage.villainGroups, importedState.usage.villainGroups),
      henchmanGroups: mergeUsageBucket(currentState.usage.henchmanGroups, importedState.usage.henchmanGroups),
      schemes: mergeUsageBucket(currentState.usage.schemes, importedState.usage.schemes)
    },
    history: [...currentHistoryById.values()].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))),
    preferences: deepClone(importedState.preferences) as AppState['preferences']
  };
}

export function summarizeBackupState(state: AppState): BackupSummary {
  return {
    ownedSetCount: state.collection.ownedSetIds.length,
    historyCount: state.history.length,
    usageCounts: Object.fromEntries(Object.entries(state.usage).map(([category, bucket]) => [category, Object.keys(bucket).length])),
    themeId: state.preferences.themeId,
    selectedTab: state.preferences.selectedTab,
    playMode: state.preferences.lastPlayMode
  };
}
