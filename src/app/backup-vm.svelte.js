let _backupImportError = $state(null);
let _stagedBackup = $state(null);
let _confirmBackupRestoreMode = $state(null);
let _lastBackupExportFileName = $state(null);

export function getBackupImportError() { return _backupImportError; }
export function setBackupImportError(v) { _backupImportError = v; }

export function getStagedBackup() { return _stagedBackup; }
export function setStagedBackup(v) { _stagedBackup = v; }

export function getConfirmBackupRestoreMode() { return _confirmBackupRestoreMode; }
export function setConfirmBackupRestoreMode(v) { _confirmBackupRestoreMode = v; }

export function getLastBackupExportFileName() { return _lastBackupExportFileName; }
export function setLastBackupExportFileName(v) { _lastBackupExportFileName = v; }

export function resetBackupDraft() {
  _backupImportError = null;
  _stagedBackup = null;
  _confirmBackupRestoreMode = null;
  _lastBackupExportFileName = null;
}
