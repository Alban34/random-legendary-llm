import { test } from 'vitest';
import assert from 'node:assert/strict';
import { computeModalConfig } from './modal-utils.ts';

function makeLocale(overrides = {}) {
  return {
    t: (key, vars = {}) => {
      const parts = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
      return parts.length ? `${key}(${parts.join(',')})` : key;
    },
    formatNumber: (n) => String(n),
    ...overrides
  };
}

function makeAppState() {
  return {} as never;
}

function makeBaseParams(overrides = {}) {
  return {
    locale: makeLocale(),
    appState: makeAppState(),
    confirmResetOwnedCollection: false,
    confirmResetAllState: false,
    confirmBackupRestoreMode: null,
    stagedBackup: null,
    onCancelResetOwnedCollection: () => {},
    onConfirmResetOwnedCollection: () => {},
    onCancelResetAllState: () => {},
    onResetAllState: () => {},
    onCancelBackupRestore: () => {},
    onConfirmMergeBackup: () => {},
    onConfirmReplaceBackup: () => {},
    ...overrides
  };
}

test('computeModalConfig returns null when no modal condition is active', () => {
  const result = computeModalConfig(makeBaseParams());
  assert.equal(result, null);
});

test('computeModalConfig returns null when locale is missing', () => {
  const result = computeModalConfig(makeBaseParams({ locale: null }));
  assert.equal(result, null);
});

test('computeModalConfig returns reset-collection config when confirmResetOwnedCollection is true', () => {
  const result = computeModalConfig(makeBaseParams({ confirmResetOwnedCollection: true }));
  assert.ok(result !== null, 'Expected a modal config');
  assert.equal(result.cancelAction, 'cancel-reset-owned-collection');
  assert.equal(result.confirmAction, 'confirm-reset-owned-collection');
});

test('computeModalConfig returns reset-all config when confirmResetAllState is true', () => {
  const result = computeModalConfig(makeBaseParams({ confirmResetAllState: true }));
  assert.ok(result !== null, 'Expected a modal config');
  assert.equal(result.cancelAction, 'cancel-reset-all-state');
  assert.equal(result.confirmAction, 'confirm-reset-all-state');
});

test('computeModalConfig returns merge config when mode is merge and stagedBackup is present', () => {
  const stagedBackup = {
    summary: { ownedSetCount: 5, historyCount: 10 },
    data: null
  } as never;
  const result = computeModalConfig(makeBaseParams({
    confirmBackupRestoreMode: 'merge',
    stagedBackup
  }));
  assert.ok(result !== null, 'Expected a modal config');
  assert.equal(result.confirmAction, 'confirm-merge-backup');
  assert.equal(result.cancelAction, 'cancel-backup-restore');
});

test('computeModalConfig returns replace config when mode is replace and stagedBackup is present', () => {
  const stagedBackup = {
    summary: { ownedSetCount: 3, historyCount: 7 },
    data: null
  } as never;
  const result = computeModalConfig(makeBaseParams({
    confirmBackupRestoreMode: 'replace',
    stagedBackup
  }));
  assert.ok(result !== null, 'Expected a modal config');
  assert.equal(result.confirmAction, 'confirm-replace-backup');
  assert.equal(result.cancelAction, 'cancel-backup-restore');
});

test('computeModalConfig returns null for backup mode when stagedBackup is null', () => {
  const result = computeModalConfig(makeBaseParams({
    confirmBackupRestoreMode: 'merge',
    stagedBackup: null
  }));
  assert.equal(result, null);
});
