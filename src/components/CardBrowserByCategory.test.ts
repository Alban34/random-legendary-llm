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
  source = await fs.readFile(
    path.join(rootDir, 'src', 'components', 'CardBrowserByCategory.svelte'),
    'utf8'
  );
});

test('CardBrowserByCategory renders a .history-group details element for each non-empty category', () => {
  assert.match(
    source,
    /<details[^>]*class="history-group"[^>]*>/,
    'Template must contain <details class="history-group"> elements'
  );
  assert.doesNotMatch(
    source,
    /<section[^>]*data-category/,
    'Template must not use <section data-category> — should use <details> instead'
  );
});

test('CardBrowserByCategory category heading references a locale key from CARD_CATEGORIES', () => {
  assert.match(
    source,
    /locale\.t\(category\.labelKey\)/,
    'Summary must reference locale.t(category.labelKey) rather than a hardcoded string'
  );
});

test('CardBrowserByCategory first group renders with the open attribute', () => {
  assert.doesNotMatch(
    source,
    /open=\{categoryIndex/,
    'Template must not use the conditional open={categoryIndex === 0} binding'
  );
  assert.match(
    source,
    /open>/,
    '<details> element must carry a bare unconditional open attribute'
  );
});

test('CardBrowserByCategory all groups render with the open attribute', () => {
  assert.doesNotMatch(
    source,
    /open=\{categoryIndex/,
    'Template must not contain open={categoryIndex === 0} — all groups should be open unconditionally'
  );
  assert.match(
    source,
    /open>/,
    'Template must contain a bare unconditional open attribute on the <details> element'
  );
});
