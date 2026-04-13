import { SCHEMA_VERSION, STORAGE_KEY, sanitizePersistedState } from './state-store.mjs';

export const BACKUP_SCHEMA_ID = 'legendary-marvel-randomizer-backup';
export const BACKUP_SCHEMA_VERSION = 1;

function deepClone(value) {
  return structuredClone(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeIsoString(value) {
  return typeof value === 'string' && value ? value : new Date().toISOString();
}

export function createBackupPayload(state, { exportedAt = new Date().toISOString() } = {}) {
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
    })
  };
}

export function buildBackupFilename(exportedAt = new Date().toISOString()) {
  const safeTimestamp = normalizeIsoString(exportedAt).replaceAll(':', '-').replaceAll('.', '-');
  return `legendary-marvel-randomizer-backup-${safeTimestamp}.json`;
}

function validateBackupEnvelope(payload) {
  if (!isPlainObject(payload)) {
    return 'Backup files must contain a JSON object at the root.';
  }

  if (payload.schemaId !== BACKUP_SCHEMA_ID) {
    return 'This backup file uses an unsupported schema identifier.';
  }

  if (payload.version !== BACKUP_SCHEMA_VERSION) {
    return `This backup file uses unsupported schema version ${String(payload.version)}.`;
  }

  if (!isPlainObject(payload.data)) {
    return 'This backup file is missing its data section.';
  }

  if (!isPlainObject(payload.data.collection)) {
    return 'This backup file is missing collection data.';
  }

  if (!isPlainObject(payload.data.usage)) {
    return 'This backup file is missing usage data.';
  }

  if (!Array.isArray(payload.data.history)) {
    return 'This backup file is missing history data.';
  }

  if (!isPlainObject(payload.data.preferences)) {
    return 'This backup file is missing preference data.';
  }

  return null;
}

export function parseBackupPayload(payload, { indexes }) {
  const envelopeError = validateBackupEnvelope(payload);
  if (envelopeError) {
    return { ok: false, error: envelopeError };
  }

  const importedCandidate = {
    schemaVersion: SCHEMA_VERSION,
    collection: payload.data.collection,
    usage: payload.data.usage,
    history: payload.data.history,
    preferences: payload.data.preferences
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
    payload,
    importedState: sanitized.state
  };
}

export function parseBackupText(rawText, { indexes }) {
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'Backup files must contain valid JSON.' };
  }

  return parseBackupPayload(parsedPayload, { indexes });
}

function mergeUsageBucket(currentBucket, importedBucket) {
  const mergedBucket = { ...deepClone(currentBucket) };

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

export function mergeImportedState(currentState, importedState) {
  const currentHistoryById = new Map(currentState.history.map((record) => [record.id, record]));
  importedState.history.forEach((record) => {
    currentHistoryById.set(record.id, record);
  });

  return {
    schemaVersion: SCHEMA_VERSION,
    collection: {
      ownedSetIds: [...new Set([...currentState.collection.ownedSetIds, ...importedState.collection.ownedSetIds])]
        .sort((left, right) => left.localeCompare(right))
    },
    usage: {
      heroes: mergeUsageBucket(currentState.usage.heroes, importedState.usage.heroes),
      masterminds: mergeUsageBucket(currentState.usage.masterminds, importedState.usage.masterminds),
      villainGroups: mergeUsageBucket(currentState.usage.villainGroups, importedState.usage.villainGroups),
      henchmanGroups: mergeUsageBucket(currentState.usage.henchmanGroups, importedState.usage.henchmanGroups),
      schemes: mergeUsageBucket(currentState.usage.schemes, importedState.usage.schemes)
    },
    history: [...currentHistoryById.values()].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt))),
    preferences: deepClone(importedState.preferences)
  };
}

export function summarizeBackupState(state) {
  return {
    ownedSetCount: state.collection.ownedSetIds.length,
    historyCount: state.history.length,
    usageCounts: Object.fromEntries(Object.entries(state.usage).map(([category, bucket]) => [category, Object.keys(bucket).length])),
    themeId: state.preferences.themeId,
    selectedTab: state.preferences.selectedTab,
    playMode: state.preferences.lastPlayMode
  };
}