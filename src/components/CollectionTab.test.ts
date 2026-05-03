import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let collectionTabSource;
let enLocaleSource;

beforeAll(async () => {
  [collectionTabSource, enLocaleSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'CollectionTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'en.ts'), 'utf8')
  ]);
});

test('CollectionTab panel header does NOT contain request-reset-owned-collection button', () => {

  const panelHeaderMatch = collectionTabSource.match(/<section class="panel">\s*<div class="row space-between[^>]*">([\s\S]*?)<\/div>/);
  assert.ok(panelHeaderMatch, 'panel header row must exist');
  assert.doesNotMatch(
    panelHeaderMatch[1],
    /request-reset-owned-collection/,
    'Reset button must not be in the panel header row'
  );
});

test('CollectionTab contains [data-collection-reset-section]', () => {

  assert.match(collectionTabSource, /data-collection-reset-section/, 'CollectionTab must contain data-collection-reset-section');
});

test('CollectionTab reset section contains the consequence locale key', () => {

  const resetSectionMatch = collectionTabSource.match(/data-collection-reset-section[\s\S]{0,400}<\/section>/);
  assert.ok(resetSectionMatch, 'data-collection-reset-section must exist');
  assert.match(
    resetSectionMatch[0],
    /collection\.resetSelections\.consequence/,
    'reset section must reference collection.resetSelections.consequence locale key'
  );
});

test('CollectionTab reset section appears after collection-group elements', () => {

  const lastGroupIdx = collectionTabSource.lastIndexOf('data-collection-group');
  const resetSectionIdx = collectionTabSource.indexOf('data-collection-reset-section');
  assert.ok(lastGroupIdx !== -1, 'data-collection-group must exist');
  assert.ok(resetSectionIdx !== -1, 'data-collection-reset-section must exist');
  assert.ok(
    resetSectionIdx > lastGroupIdx,
    `data-collection-reset-section (at ${resetSectionIdx}) must appear after last data-collection-group (at ${lastGroupIdx})`
  );
});

test('en.ts contains collection.resetSelections.consequence key', () => {

  assert.match(
    enLocaleSource,
    /'collection\.resetSelections\.consequence'/,
    "en.ts must contain the 'collection.resetSelections.consequence' key"
  );
});
