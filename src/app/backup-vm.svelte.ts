// src/app/backup-vm.svelte.ts
// Svelte 5 reactive view-model for the Backup tab.

import type { BackupPayload, StagedBackup } from './types.ts';

let _backupImportError: string | null = $state<string | null>(null);
let _stagedBackup: StagedBackup | null = $state<StagedBackup | null>(null);
let _confirmBackupRestoreMode: string | null = $state<string | null>(null);
let _lastBackupExportFileName: string | null = $state<string | null>(null);

export function getBackupImportError(): string | null { return _backupImportError; }
export function setBackupImportError(v: string | null): void { _backupImportError = v; }

export function getStagedBackup(): StagedBackup | null { return _stagedBackup; }
export function setStagedBackup(v: StagedBackup | null): void { _stagedBackup = v; }

export function getConfirmBackupRestoreMode(): string | null { return _confirmBackupRestoreMode; }
export function setConfirmBackupRestoreMode(v: string | null): void { _confirmBackupRestoreMode = v; }

export function getLastBackupExportFileName(): string | null { return _lastBackupExportFileName; }
export function setLastBackupExportFileName(v: string | null): void { _lastBackupExportFileName = v; }

export function resetBackupDraft(): void {
  _backupImportError = null;
  _stagedBackup = null;
  _confirmBackupRestoreMode = null;
  _lastBackupExportFileName = null;
}

// Keep BackupPayload re-exported for any consumers that imported it via this module
export type { BackupPayload };
