import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { fetchBggCollection, matchBggNamesToSets } from '../src/app/bgg-import-utils.ts';
import { mergeOwnedSets } from '../src/app/collection-utils.ts';
import { createDefaultState } from '../src/app/state-store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

// ---------------------------------------------------------------------------
// Minimal DOMParser shim for the Node.js test environment.
// Covers the <item> / <name sortindex="1"> structure emitted by the BGG XML API.
// ---------------------------------------------------------------------------
class NodeDOMParser {
  parseFromString(text) {
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(text)) !== null) {
      const content = itemMatch[1];
      const names = [];
      const nameRegex = /<name\s+sortindex="(\d+)"[^>]*>([\s\S]*?)<\/name>/g;
      let nameMatch;
      while ((nameMatch = nameRegex.exec(content)) !== null) {
        names.push({ sortindex: nameMatch[1], text: nameMatch[2].trim() });
      }
      items.push({
        querySelectorAll: (sel) =>
          sel === 'name'
            ? names.map((n) => ({
                getAttribute: (attr) => (attr === 'sortindex' ? n.sortindex : null),
                textContent: n.text
              }))
            : []
      });
    }
    const hasMessage = /<message[^>]*>/.test(text);
    return {
      querySelectorAll: (sel) => (sel === 'item' ? items : []),
      querySelector: (sel) => (sel === 'message' && hasMessage ? {} : null)
    };
  }
}

globalThis.DOMParser = NodeDOMParser;

let bundle;
let collectionTabSource;

before(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
  collectionTabSource = await fs.readFile(
    path.join(rootDir, 'src', 'components', 'CollectionTab.svelte'),
    'utf8'
  );
});

// ---------------------------------------------------------------------------
// Story 42.1 — CollectionTab source assertions
// ---------------------------------------------------------------------------

test('Epic 42.1 CollectionTab declares onImportBggCollection prop', () => {
  assert.match(collectionTabSource, /collectionActions\.importBggCollection/);
});

test('Epic 42.1 CollectionTab renders a bgg-username input', () => {
  assert.match(collectionTabSource, /id="bgg-username"/);
});

test('Epic 42.1 CollectionTab renders an "Import from BGG" button', () => {
  assert.match(collectionTabSource, /Import from BGG/);
});

test('Epic 42.1 CollectionTab button is disabled when bggUsername is empty or loading', () => {
  assert.match(collectionTabSource, /disabled=\{bggImportStatus === 'loading' \|\| !bggUsername\.trim\(\)\}/);
});

test('Epic 42.1 CollectionTab button has aria-busy when loading', () => {
  assert.match(collectionTabSource, /aria-busy=\{bggImportStatus === 'loading'/);
});

test('Epic 42.1 CollectionTab form prevents default on submit', () => {
  assert.match(collectionTabSource, /e\.preventDefault\(\)/);
});

// ---------------------------------------------------------------------------
// Story 42.2 — fetchBggCollection unit tests
// ---------------------------------------------------------------------------

function makeFetch(responses) {
  let i = 0;
  return async () => responses[i++];
}

test('Epic 42.2 fetchBggCollection: 200 with valid XML returns correct gameNames', async () => {
  const xml = `<items>
    <item type="thing" objectid="1">
      <name sortindex="1">Core Set</name>
    </item>
    <item type="thing" objectid="2">
      <name sortindex="1">Dark City</name>
    </item>
  </items>`;
  const result = await fetchBggCollection('testuser', {
    retryDelayMs: 0,
    fetchFn: makeFetch([{ status: 200, ok: true, text: async () => xml }])
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Core Set', 'Dark City']);
});

test('Epic 42.2 fetchBggCollection: 202 then 200 on retry returns names', async () => {
  const xml = `<items><item type="thing" objectid="3"><name sortindex="1">Fantastic Four</name></item></items>`;
  const result = await fetchBggCollection('testuser', {
    retryDelayMs: 0,
    maxRetries: 5,
    fetchFn: makeFetch([
      { status: 202, ok: false, text: async () => '' },
      { status: 200, ok: true, text: async () => xml }
    ])
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, ['Fantastic Four']);
});

test('Epic 42.2 fetchBggCollection: 202 exhausting retries returns ok: false', async () => {
  const always202 = { status: 202, ok: false, text: async () => '' };
  const result = await fetchBggCollection('testuser', {
    maxRetries: 3,
    retryDelayMs: 0,
    fetchFn: makeFetch([always202, always202, always202, always202, always202])
  });
  assert.equal(result.ok, false);
  assert.ok(result.error && result.error.length > 0);
});

test('Epic 42.2 fetchBggCollection: network throw returns ok: false', async () => {
  const result = await fetchBggCollection('testuser', {
    retryDelayMs: 0,
    fetchFn: async () => { throw new Error('Network failure'); }
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /network/i);
});

test('Epic 42.2 fetchBggCollection: 404 returns ok: false with HTTP error message', async () => {
  const result = await fetchBggCollection('testuser', {
    retryDelayMs: 0,
    fetchFn: makeFetch([{ status: 404, ok: false, text: async () => 'Not found' }])
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /404/);
});

test('Epic 42.2 fetchBggCollection: 200 with no items returns ok: true and empty gameNames', async () => {
  const xml = '<items total="0"></items>';
  const result = await fetchBggCollection('testuser', {
    retryDelayMs: 0,
    fetchFn: makeFetch([{ status: 200, ok: true, text: async () => xml }])
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.gameNames, []);
});

// ---------------------------------------------------------------------------
// Story 42.3 — matchBggNamesToSets
// ---------------------------------------------------------------------------

test('Epic 42.3 matchBggNamesToSets: alias match — "Legendary: A Marvel Deck Building Game" → core-set', () => {
  const { matched, unmatched } = matchBggNamesToSets(
    ['Legendary: A Marvel Deck Building Game'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 1);
  assert.equal(matched[0].setId, 'core-set');
  assert.equal(unmatched.length, 0);
});

test('Epic 42.3 matchBggNamesToSets: canonical name match — "Dark City" → dark-city', () => {
  const { matched, unmatched } = matchBggNamesToSets(['Dark City'], bundle.runtime.sets);
  assert.equal(matched.length, 1);
  assert.equal(matched[0].setId, 'dark-city');
  assert.equal(unmatched.length, 0);
});

test('Epic 42.3 matchBggNamesToSets: unknown name goes to unmatched', () => {
  const { matched, unmatched } = matchBggNamesToSets(['Unknown Expansion 9999'], bundle.runtime.sets);
  assert.equal(matched.length, 0);
  assert.equal(unmatched.length, 1);
  assert.equal(unmatched[0], 'Unknown Expansion 9999');
});

test('Epic 42.3 matchBggNamesToSets: case-insensitive — "dark city" matches dark-city', () => {
  const { matched } = matchBggNamesToSets(['dark city'], bundle.runtime.sets);
  assert.equal(matched.length, 1);
  assert.equal(matched[0].setId, 'dark-city');
});

test('Epic 42.3 matchBggNamesToSets: mixed — matched and unmatched in one call', () => {
  const { matched, unmatched } = matchBggNamesToSets(
    ['Legendary: A Marvel Deck Building Game', 'Dark City', 'No Such Expansion'],
    bundle.runtime.sets
  );
  assert.equal(matched.length, 2);
  const ids = matched.map((m) => m.setId);
  assert.ok(ids.includes('core-set'));
  assert.ok(ids.includes('dark-city'));
  assert.equal(unmatched.length, 1);
});

test('Epic 42.3 matchBggNamesToSets: original casing preserved in matched.bggName', () => {
  const { matched } = matchBggNamesToSets(['DARK CITY'], bundle.runtime.sets);
  assert.equal(matched[0].bggName, 'DARK CITY');
});

// ---------------------------------------------------------------------------
// Story 42.4 — mergeOwnedSets
// ---------------------------------------------------------------------------

test('Epic 42.4 mergeOwnedSets: merges new IDs with sorting', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, ['dark-city']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set', 'dark-city']);
});

test('Epic 42.4 mergeOwnedSets: no duplicates when merging already-owned ID', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, ['core-set']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set']);
});

test('Epic 42.4 mergeOwnedSets: empty newSetIds leaves ownedSetIds unchanged', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  const result = mergeOwnedSets(state, []);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set']);
});

test('Epic 42.4 mergeOwnedSets: result is sorted alphabetically', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['dark-city'];
  const result = mergeOwnedSets(state, ['core-set']);
  assert.deepEqual(result.collection.ownedSetIds, ['core-set', 'dark-city']);
});

test('Epic 42.4 mergeOwnedSets: does not mutate the original state', () => {
  const state = createDefaultState();
  state.collection.ownedSetIds = ['core-set'];
  mergeOwnedSets(state, ['dark-city']);
  assert.deepEqual(state.collection.ownedSetIds, ['core-set']);
});

// ---------------------------------------------------------------------------
// Story 42.5 — CollectionTab summary section source assertions
// ---------------------------------------------------------------------------

test('Epic 42.5 CollectionTab renders summary section when bggImportSummary is non-null', () => {
  assert.match(collectionTabSource, /data-bgg-summary-panel/);
  assert.match(collectionTabSource, /bggImportSummary !== null/);
});

test('Epic 42.5 CollectionTab summary section is conditionally rendered', () => {
  assert.match(collectionTabSource, /\{#if bggImportSummary !== null\}/);
});

test('Epic 42.5 CollectionTab summary includes "BGG Import Summary" heading', () => {
  assert.match(collectionTabSource, /BGG Import Summary/);
});

test('Epic 42.5 CollectionTab summary includes expansion count sentence', () => {
  assert.match(collectionTabSource, /bggImportSummary\.matched\.length.*expansion\(s\) added/s);
});

test('Epic 42.5 CollectionTab summary includes "Not found in catalog" section for unmatched', () => {
  assert.match(collectionTabSource, /Not found in catalog/);
  assert.match(collectionTabSource, /bggImportSummary\.unmatched\.length > 0/);
});

test('Epic 42.5 CollectionTab summary has a Dismiss button calling onDismissBggSummary', () => {
  assert.match(collectionTabSource, /dismiss-bgg-summary/);
  assert.match(collectionTabSource, /collectionActions\.dismissBggSummary/);
});

test('Epic 42.5 CollectionTab shows "No matching expansions found" when matched is empty', () => {
  assert.match(collectionTabSource, /No matching expansions found/);
});

test('Epic 42.5 CollectionTab renders inline error below input when bggImportStatus is error', () => {
  assert.match(collectionTabSource, /data-bgg-import-error/);
  assert.match(collectionTabSource, /bggImportStatus === 'error' && bggImportError/);
});
