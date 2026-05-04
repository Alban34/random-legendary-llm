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
    path.join(rootDir, 'src', 'components', 'CardBrowserByExpansion.svelte'),
    'utf8'
  );
});

test('CardBrowserByExpansion renders a .history-group details element for each expansion', () => {
  assert.match(
    source,
    /<details[^>]*class="history-group"[^>]*>/,
    'Template must contain <details class="history-group"> elements'
  );
  assert.doesNotMatch(
    source,
    /<section[^>]*data-expansion/,
    'Template must not use <section data-expansion> — should use <details> instead'
  );
});

test('CardBrowserByExpansion summary contains expansion name and pill count', () => {
  assert.match(
    source,
    /<summary>/,
    'Template must contain a <summary> element inside the <details> group'
  );
  assert.match(
    source,
    /expansion\.setName/,
    'Summary must reference expansion.setName'
  );
  assert.match(
    source,
    /<span class="pill">/,
    'Summary must contain a <span class="pill"> for the card count badge'
  );
  assert.match(
    source,
    /expansion\.cards\.length/,
    'Pill badge must reference expansion.cards.length'
  );
});

test('CardBrowserByExpansion preserves data-expansion attribute on details element', () => {
  assert.match(
    source,
    /data-expansion=\{expansion\.setId\}/,
    '<details> element must carry data-expansion={expansion.setId}'
  );
});

test('CardBrowserByExpansion all groups render with the open attribute', () => {
  assert.doesNotMatch(
    source,
    /open=\{/,
    'Template must not use a conditional open binding — all groups should be open unconditionally'
  );
  assert.match(
    source,
    /open>/,
    '<details> element must carry a bare unconditional open attribute'
  );
});

test('CardBrowserByExpansion data-expansion attribute is present on the details element', () => {
  assert.match(
    source,
    /data-expansion=\{expansion\.setId\}/,
    '<details> element must carry data-expansion={expansion.setId}'
  );
});
