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
  source = await fs.readFile(path.join(rootDir, 'src', 'components', 'TabNav.svelte'), 'utf8');
});

test('TabNav container has role="tablist" and aria-label', () => {
  assert.match(source, /role="tablist"/);
  assert.match(source, /aria-label={navLabel}/);
});

test('TabNav tab buttons have role="tab" and aria-selected', () => {
  assert.match(source, /role="tab"/);
  assert.match(source, /aria-selected={activeTab === tab\.id}/);
});

test('TabNav buttons use data-action="select-tab" and data-tab-id', () => {
  assert.match(source, /data-action="select-tab"/);
  assert.match(source, /data-tab-id={tab\.id}/);
});

test('TabNav keyboard handler responds to arrow and boundary keys', () => {
  assert.match(source, /ArrowRight/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /Home/);
  assert.match(source, /End/);
});

test('TabNav sets tabindex based on active state', () => {
  assert.match(source, /tabindex={activeTab === tab\.id \? 0 : -1}/);
});
