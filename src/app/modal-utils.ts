// src/app/modal-utils.ts
// Pure modal configuration builder — extracted from App.svelte (F-02).

import type { ModalConfig, AppState, StagedBackup, LocaleTools } from './types.ts';

export interface ModalConfigParams {
  locale: LocaleTools;
  appState: AppState;
  confirmResetOwnedCollection: boolean;
  confirmResetAllState: boolean;
  confirmBackupRestoreMode: string | null;
  stagedBackup: StagedBackup | null;
  onCancelResetOwnedCollection: () => void;
  onConfirmResetOwnedCollection: () => void;
  onCancelResetAllState: () => void;
  onResetAllState: () => void;
  onCancelBackupRestore: () => void;
  onConfirmMergeBackup: () => void;
  onConfirmReplaceBackup: () => void;
}

export function computeModalConfig(params: ModalConfigParams): ModalConfig | null {
  const {
    locale,
    appState,
    confirmResetOwnedCollection,
    confirmResetAllState,
    confirmBackupRestoreMode,
    stagedBackup,
    onCancelResetOwnedCollection,
    onConfirmResetOwnedCollection,
    onCancelResetAllState,
    onResetAllState,
    onCancelBackupRestore,
    onConfirmMergeBackup,
    onConfirmReplaceBackup
  } = params;
  if (!locale || !appState) return null;
  if (confirmResetOwnedCollection) {
    return {
      title: locale.t('modal.reset.title'),
      description: locale.t('modal.resetCollection.description'),
      cancelAction: 'cancel-reset-owned-collection',
      confirmAction: 'confirm-reset-owned-collection',
      confirmLabel: locale.t('modal.resetCollection.confirm'),
      onCancel: onCancelResetOwnedCollection,
      onConfirm: onConfirmResetOwnedCollection
    };
  }
  if (confirmResetAllState) {
    return {
      title: locale.t('modal.reset.title'),
      description: locale.t('modal.resetAll.description'),
      cancelAction: 'cancel-reset-all-state',
      confirmAction: 'confirm-reset-all-state',
      confirmLabel: locale.t('modal.resetAll.confirm'),
      onCancel: onCancelResetAllState,
      onConfirm: onResetAllState
    };
  }
  if (confirmBackupRestoreMode && stagedBackup) {
    const { summary } = stagedBackup;
    if (confirmBackupRestoreMode === 'merge') {
      return {
        title: locale.t('modal.merge.title'),
        description: locale.t('modal.merge.description', {
          ownedSetCount: locale.formatNumber(summary.ownedSetCount),
          historyCount: locale.formatNumber(summary.historyCount)
        }),
        cancelAction: 'cancel-backup-restore',
        confirmAction: 'confirm-merge-backup',
        confirmLabel: locale.t('modal.merge.confirm'),
        onCancel: onCancelBackupRestore,
        onConfirm: onConfirmMergeBackup
      };
    }
    return {
      title: locale.t('modal.replace.title'),
      description: locale.t('modal.replace.description', {
        historyCount: locale.formatNumber(summary.historyCount)
      }),
      cancelAction: 'cancel-backup-restore',
      confirmAction: 'confirm-replace-backup',
      confirmLabel: locale.t('modal.replace.confirm'),
      onCancel: onCancelBackupRestore,
      onConfirm: onConfirmReplaceBackup
    };
  }
  return null;
}
