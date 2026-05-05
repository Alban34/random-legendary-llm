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
  source = await fs.readFile(path.join(rootDir, 'src', 'app', 'history-vm.svelte.ts'), 'utf8');
});

test('historyVm $state exports the expected shape', () => {
  assert.match(source, /export const historyVm = \$state/);
  assert.match(source, /expandedRecordId/);
  assert.match(source, /insightsExpanded/);
  assert.match(source, /groupingMode/);
  assert.match(source, /resultDraft/);
});

test('toggleHistoryInsights, resetHistoryGroupingMode, and resetHistoryOutcomeFilter are exported', () => {
  assert.match(source, /export function toggleHistoryInsights\(\)/);
  assert.match(source, /export function resetHistoryGroupingMode\(\)/);
  assert.match(source, /export function resetHistoryOutcomeFilter\(\)/);
});

test('resetResultDraft and resetResultDraftForPlayerCount are exported', () => {
  assert.match(source, /export function resetResultDraft\(\)/);
  assert.match(source, /export function resetResultDraftForPlayerCount/);
});

test('historyVm outcomeFilter defaults to "all"', () => {
  assert.match(source, /outcomeFilter: 'all'/);
});
