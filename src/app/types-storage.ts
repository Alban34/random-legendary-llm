import type { CollectionState, UsageState, HistoryRecord, Preferences, PlayMode, ThemeId } from './types-app-state.ts';

// =============================================================================
// Section 6: Storage & persistence
// =============================================================================

export interface StorageOperationResult {
  ok: boolean;
  storageAvailable: boolean;
  message: string;
}

export interface StorageAdapter {
  available: boolean;
  message: string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): StorageOperationResult;
  removeItem(key: string): StorageOperationResult;
}

export interface BackupPayload {
  schemaId: string;
  version: number;
  exportedAt: string;
  metadata: {
    appId: string;
    storageKey: string;
    stateSchemaVersion: number;
  };
  data: {
    collection: CollectionState;
    usage: UsageState;
    history: HistoryRecord[];
    preferences: Preferences;
  };
}

export interface BackupSummary {
  ownedSetCount: number;
  historyCount: number;
  usageCounts: Record<string, number>;
  themeId: ThemeId;
  selectedTab: string | null;
  playMode: PlayMode;
}
