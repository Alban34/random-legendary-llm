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
  source = await fs.readFile(path.join(rootDir, 'src', 'app', 'browse-vm.svelte.ts'), 'utf8');
});

test('browseVm $state exports the expected shape', () => {
  assert.match(source, /export const browseVm = \$state/);
  assert.match(source, /searchTerm/);
  assert.match(source, /typeFilter/);
  assert.match(source, /expandedSetId/);
  assert.match(source, /sortKey/);
});

test('createBrowseActions factory function is exported', () => {
  assert.match(source, /export function createBrowseActions\(\)/);
});

test('createBrowseActions returns setBrowseSearchTerm and setBrowseTypeFilter', () => {
  assert.match(source, /setBrowseSearchTerm/);
  assert.match(source, /setBrowseTypeFilter/);
});

test('toggleBrowseSetExpanded toggles expandedSetId on and off', () => {
  assert.match(source, /browseVm\.expandedSetId === setId \? null : setId/);
});
