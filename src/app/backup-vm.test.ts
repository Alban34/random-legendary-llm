import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let source: string;

beforeAll(async () => {
  source = await fs.readFile(path.join(rootDir, 'src', 'app', 'backup-vm.svelte.ts'), 'utf8');
});

test('backupVm $state exports the expected shape', () => {
  assert.match(source, /export const backupVm = \$state/);
  assert.match(source, /importError/);
  assert.match(source, /stagedBackup/);
  assert.match(source, /confirmRestoreMode/);
  assert.match(source, /lastExportFileName/);
});

test('resetBackupDraft function is exported', () => {
  assert.match(source, /export function resetBackupDraft\(\)/);
});

test('createBackupActions factory function is exported', () => {
  assert.match(source, /export function createBackupActions/);
});

test('importBackupFile shows persistent error toast on parse failure', () => {
  assert.match(source, /toast\.error\(parsedBackup\.error,\s*\{\s*duration:\s*Infinity\s*\}\)/);
});
