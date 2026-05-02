import { test } from 'vitest';
import assert from 'node:assert/strict';
import { filterHistoryByOutcome } from '../src/app/history-utils.ts';


// ── Fixtures ─────────────────────────────────────────────────────────────────

const winRecord = {
  id: 'r-win',
  result: { status: 'completed', outcome: 'win', score: null, notes: '', updatedAt: '2025-01-01T00:01:00.000Z' }
};

const lossRecord = {
  id: 'r-loss',
  result: { status: 'completed', outcome: 'loss', score: null, notes: '', updatedAt: '2025-01-02T00:01:00.000Z' }
};

const pendingRecord = {
  id: 'r-pending',
  result: { status: 'pending' }
};

const nullResultRecord = {
  id: 'r-null',
  result: null
};

const allRecords = [winRecord, lossRecord, pendingRecord, nullResultRecord];

// ── Story 47.1 — filterHistoryByOutcome ──────────────────────────────────────

test('filterHistoryByOutcome "all" returns all records unchanged', () => {

  const result = filterHistoryByOutcome(allRecords, 'all');
  assert.equal(result.length, allRecords.length);
  assert.equal(result, allRecords, 'should return the same array reference');
});

test('filterHistoryByOutcome "win" returns only won records', () => {

  const result = filterHistoryByOutcome(allRecords, 'win');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'r-win');
  assert.ok(result.every((r) => r.result?.outcome === 'win'));
});

test('filterHistoryByOutcome "loss" returns only lost records', () => {

  const result = filterHistoryByOutcome(allRecords, 'loss');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'r-loss');
  assert.ok(result.every((r) => r.result?.outcome === 'loss'));
});

test('filterHistoryByOutcome "pending" returns records with status pending or null result', () => {

  const result = filterHistoryByOutcome(allRecords, 'pending');
  assert.equal(result.length, 2);
  const ids = result.map((r) => r.id);
  assert.ok(ids.includes('r-pending'));
  assert.ok(ids.includes('r-null'));
});

test('filterHistoryByOutcome does not mutate the input array', () => {

  const input = [...allRecords];
  filterHistoryByOutcome(input, 'win');
  filterHistoryByOutcome(input, 'loss');
  filterHistoryByOutcome(input, 'pending');
  assert.equal(input.length, allRecords.length);
});

test('filterHistoryByOutcome empty array always returns []', () => {

  assert.deepEqual(filterHistoryByOutcome([], 'all'), []);
  assert.deepEqual(filterHistoryByOutcome([], 'win'), []);
  assert.deepEqual(filterHistoryByOutcome([], 'loss'), []);
  assert.deepEqual(filterHistoryByOutcome([], 'pending'), []);
});


