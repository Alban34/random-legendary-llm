// src/app/backup-vm.svelte.ts
// Svelte 5 reactive view-model for the Backup tab.

import { toast } from 'svelte-sonner';
import { buildBackupFilename, createBackupPayload, mergeImportedState, parseBackupText, summarizeBackupState } from './backup-utils.ts';
import type { AppState, LocaleTools, BackupPayload, StagedBackup } from './types.ts';
import type { Epic1Bundle } from './game-data-pipeline.ts';

export const backupVm = $state<{
  importError: string | null;
  stagedBackup: StagedBackup | null;
  confirmRestoreMode: string | null;
  lastExportFileName: string | null;
}>({
  importError: null,
  stagedBackup: null,
  confirmRestoreMode: null,
  lastExportFileName: null
});

export function resetBackupDraft(): void {
  backupVm.importError = null;
  backupVm.stagedBackup = null;
  backupVm.confirmRestoreMode = null;
  backupVm.lastExportFileName = null;
}

// Keep BackupPayload re-exported for any consumers that imported it via this module
export type { BackupPayload };

// ---------------------------------------------------------------------------
// Action factory
// ---------------------------------------------------------------------------

interface BackupActionDeps {
  getLocale: () => LocaleTools;
  getAppState: () => AppState;
  getBundle: () => Epic1Bundle;
  applyStateUpdate: (updater: (s: AppState) => AppState, notice: string) => { state: AppState };
  syncUiFromPersistedState: (state: AppState) => void;
  ui: { lastActionNotice: string | null; modalReturnFocusAction: string | null };
  focusActionButton: (action: string) => void;
  focusModalCancelButton: () => void;
}

export function createBackupActions(deps: BackupActionDeps) {
  return {
    exportBackup() {
      const payload = createBackupPayload($state.snapshot(deps.getAppState()));
      const fileName = buildBackupFilename(payload.exportedAt);
      const backupBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(backupBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.append(link);
      link.click();
      link.remove();
      queueMicrotask(() => URL.revokeObjectURL(downloadUrl));
      backupVm.lastExportFileName = fileName;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.exportedBackup', { fileName });
      toast.success(deps.getLocale().t('actions.exportedBackupToast', { fileName }));
    },

    openImportBackup() {
      document.getElementById('backup-import-input')?.click();
    },

    async importBackupFile(file: File) {
      if (!file) return;
      const importedText = await file.text();
      const parsedBackup = parseBackupText(importedText, { indexes: deps.getBundle().runtime.indexes });
      if (!parsedBackup.ok) {
        backupVm.stagedBackup = null;
        backupVm.confirmRestoreMode = null;
        backupVm.importError = parsedBackup.error;
        deps.ui.lastActionNotice = deps.getLocale().t('actions.backupImportFailed');
        toast.error(parsedBackup.error, { duration: Infinity });
        return;
      }
      backupVm.importError = null;
      backupVm.confirmRestoreMode = null;
      backupVm.stagedBackup = {
        fileName: file.name || buildBackupFilename(parsedBackup.payload.exportedAt),
        payload: parsedBackup.payload,
        importedState: parsedBackup.importedState,
        summary: summarizeBackupState(parsedBackup.importedState)
      };
      deps.ui.lastActionNotice = deps.getLocale().t('actions.loadedBackupPreview');
    },

    cancelBackupPreview() {
      backupVm.importError = null;
      backupVm.stagedBackup = null;
      backupVm.confirmRestoreMode = null;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.discardedBackupPreview');
    },

    requestMergeBackup() {
      if (!backupVm.stagedBackup) return;
      backupVm.confirmRestoreMode = 'merge';
      deps.ui.modalReturnFocusAction = 'request-merge-backup';
      deps.ui.lastActionNotice = deps.getLocale().t('actions.reviewMerge');
      deps.focusModalCancelButton();
    },

    requestReplaceBackup() {
      if (!backupVm.stagedBackup) return;
      backupVm.confirmRestoreMode = 'replace';
      deps.ui.modalReturnFocusAction = 'request-replace-backup';
      deps.ui.lastActionNotice = deps.getLocale().t('actions.reviewReplace');
      deps.focusModalCancelButton();
    },

    cancelBackupRestore() {
      backupVm.confirmRestoreMode = null;
      deps.ui.lastActionNotice = deps.getLocale().t('actions.keptBackupPreview');
      deps.focusActionButton(deps.ui.modalReturnFocusAction ?? '');
    },

    confirmMergeBackup() {
      if (!backupVm.stagedBackup) return;
      backupVm.confirmRestoreMode = null;
      const nextState = mergeImportedState(
        $state.snapshot(deps.getAppState()),
        $state.snapshot(backupVm.stagedBackup.importedState)
      );
      const result = deps.applyStateUpdate(() => nextState, deps.getLocale().t('actions.mergedBackup'));
      deps.syncUiFromPersistedState(result.state);
      toast.success(deps.getLocale().t('actions.mergedBackup'));
    },

    confirmReplaceBackup() {
      if (!backupVm.stagedBackup) return;
      backupVm.confirmRestoreMode = null;
      const result = deps.applyStateUpdate(
        () => backupVm.stagedBackup!.importedState,
        deps.getLocale().t('actions.replacedBackup')
      );
      deps.syncUiFromPersistedState(result.state);
      toast.warning(deps.getLocale().t('actions.replacedBackup'));
    }
  };
}
