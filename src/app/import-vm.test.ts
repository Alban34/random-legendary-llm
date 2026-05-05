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
  source = await fs.readFile(path.join(rootDir, 'src', 'app', 'import-vm.svelte.ts'), 'utf8');
});

test('importVm $state exports the expected shape', () => {
  assert.match(source, /export const importVm = \$state/);
  assert.match(source, /myludoStatus/);
  assert.match(source, /myludoError/);
  assert.match(source, /myludoSummary/);
  assert.match(source, /bggStatus/);
  assert.match(source, /bggError/);
  assert.match(source, /bggSummary/);
});

test('createImportActions factory function is exported', () => {
  assert.match(source, /export function createImportActions/);
});

test('createImportActions returns importMyludoFile and importBggCollection', () => {
  assert.match(source, /importMyludoFile/);
  assert.match(source, /importBggCollection/);
});

test('import errors show persistent toast with duration Infinity', () => {
  assert.match(source, /toast\.error\(result\.error,\s*\{\s*duration:\s*Infinity\s*\}\)/);
});
