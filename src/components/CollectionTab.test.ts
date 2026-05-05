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
let collectionSetsViewSource;

beforeAll(async () => {
  [collectionTabSource, enLocaleSource, collectionSetsViewSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'CollectionTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'en.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'CollectionSetsView.svelte'), 'utf8')
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

  assert.match(collectionSetsViewSource, /data-collection-reset-section/, 'CollectionTab must contain data-collection-reset-section');
});

test('CollectionTab reset section contains the consequence locale key', () => {

  const resetSectionMatch = collectionSetsViewSource.match(/data-collection-reset-section[\s\S]{0,400}<\/section>/);
  assert.ok(resetSectionMatch, 'data-collection-reset-section must exist');
  assert.match(
    resetSectionMatch[0],
    /collection\.resetSelections\.consequence/,
    'reset section must reference collection.resetSelections.consequence locale key'
  );
});

test('CollectionTab reset section appears after collection-group elements', () => {

  const lastGroupIdx = collectionSetsViewSource.lastIndexOf('data-collection-group');
  const resetSectionIdx = collectionSetsViewSource.indexOf('data-collection-reset-section');
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

test('CollectionTab storage-error notice is absent when storageAvailable is true', () => {

  assert.match(
    collectionTabSource,
    /\{#if !persistence\.storageAvailable\}/,
    'CollectionTab must contain a {#if !persistence.storageAvailable} guard for the storage error notice'
  );
  const guardMatch = collectionTabSource.match(/\{#if !persistence\.storageAvailable\}([\s\S]*?)\{\/if\}/);
  assert.ok(guardMatch, '{#if !persistence.storageAvailable} block must be present');
  const beforeGuard = collectionTabSource.slice(0, collectionTabSource.indexOf('{#if !persistence.storageAvailable}'));
  assert.doesNotMatch(
    beforeGuard,
    /data-storage-error-notice/,
    'data-storage-error-notice must not appear before the conditional guard'
  );
  const afterGuard = collectionTabSource.slice(
    collectionTabSource.indexOf('{#if !persistence.storageAvailable}') + guardMatch[0].length
  );
  assert.doesNotMatch(
    afterGuard,
    /data-storage-error-notice/,
    'data-storage-error-notice must not appear after the conditional guard'
  );
});

test('CollectionTab storage-error notice is present when storageAvailable is false', () => {

  const guardMatch = collectionTabSource.match(/\{#if !persistence\.storageAvailable\}([\s\S]*?)\{\/if\}/);
  assert.ok(guardMatch, '{#if !persistence.storageAvailable} block must be present');
  assert.match(
    guardMatch[1],
    /data-storage-error-notice/,
    'The {#if !persistence.storageAvailable} block must contain data-storage-error-notice'
  );
  assert.match(
    guardMatch[1],
    /collection\.storage\.error/,
    'The {#if !persistence.storageAvailable} block must reference the collection.storage.error locale key'
  );
});

test('CollectionTab does not render lastActionNotice element', () => {

  assert.doesNotMatch(
    collectionTabSource,
    /lastActionNotice/,
    'CollectionTab.svelte must not contain any reference to lastActionNotice'
  );
  assert.doesNotMatch(
    collectionTabSource,
    /collection\.latestAction/,
    'CollectionTab.svelte must not contain any reference to collection.latestAction'
  );
});
