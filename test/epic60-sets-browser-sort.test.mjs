import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BROWSE_SORT_OPTIONS,
  filterBrowseSets
} from '../src/app/browse-utils.mjs';

// Realistic sample data exercising all three sort paths.
// Each object carries the minimum fields used by filterBrowseSets: id, name, type, year.
const SETS = [
  { id: 'set-c', name: 'Civil War', type: 'large-expansion', year: 2016 },
  { id: 'set-a', name: 'Annihilation', type: 'large-expansion', year: 2018 },
  { id: 'set-b', name: 'Breakout', type: 'small-expansion', year: 2016 },
  { id: 'set-d', name: 'Dark City', type: 'large-expansion', year: 2014 }
];

test('Epic 60.1 — BROWSE_SORT_OPTIONS is an array of exactly three objects with the correct ids in order', () => {
  assert.ok(Array.isArray(BROWSE_SORT_OPTIONS));
  assert.equal(BROWSE_SORT_OPTIONS.length, 3);
  assert.equal(BROWSE_SORT_OPTIONS[0].id, 'name');
  assert.equal(BROWSE_SORT_OPTIONS[1].id, 'releaseYear');
  assert.equal(BROWSE_SORT_OPTIONS[2].id, 'collection');
});

test('Epic 60.1 — filterBrowseSets with sortKey "name" returns sets sorted A–Z by set.name', () => {
  const result = filterBrowseSets(SETS, { sortKey: 'name' });
  assert.deepEqual(
    result.map((s) => s.name),
    ['Annihilation', 'Breakout', 'Civil War', 'Dark City']
  );
});

test('Epic 60.1 — filterBrowseSets with sortKey "releaseYear" sorts ascending by year, A–Z name as tiebreaker', () => {
  const result = filterBrowseSets(SETS, { sortKey: 'releaseYear' });
  // Dark City: 2014; Civil War: 2016; Breakout: 2016 (tie → B before C); Annihilation: 2018
  assert.deepEqual(
    result.map((s) => s.name),
    ['Dark City', 'Breakout', 'Civil War', 'Annihilation']
  );
});

test('Epic 60.1 — filterBrowseSets with sortKey "collection" puts owned set first; unowned sorted A–Z', () => {
  const ownedSetIds = new Set(['set-c']); // Civil War is owned
  const result = filterBrowseSets(SETS, { sortKey: 'collection', ownedSetIds });
  // Owned first: Civil War; then unowned A–Z: Annihilation, Breakout, Dark City
  assert.deepEqual(
    result.map((s) => s.name),
    ['Civil War', 'Annihilation', 'Breakout', 'Dark City']
  );
});

test('Epic 60.1 — filterBrowseSets with no options produces the same order as sortKey "name" (no regression)', () => {
  const defaultResult = filterBrowseSets(SETS);
  const namedResult = filterBrowseSets(SETS, { sortKey: 'name' });
  assert.deepEqual(
    defaultResult.map((s) => s.id),
    namedResult.map((s) => s.id)
  );
});
