import { test } from 'vitest';
import assert from 'node:assert/strict';
import { deepClone, isPlainObject } from './object-utils.ts';

// ── deepClone ─────────────────────────────────────────────────────────────────

test('deepClone clones primitive values', () => {
  assert.equal(deepClone(42), 42);
  assert.equal(deepClone('hello'), 'hello');
  assert.equal(deepClone(true), true);
  assert.equal(deepClone(null), null);
});

test('deepClone clones objects without reference sharing', () => {
  const original = { a: 1, b: { c: 2 } };
  const clone = deepClone(original);
  assert.deepEqual(clone, original);
  assert.notEqual(clone, original);
  assert.notEqual(clone.b, original.b);
});

test('deepClone clones arrays without reference sharing', () => {
  const original = [1, 2, [3, 4]];
  const clone = deepClone(original);
  assert.deepEqual(clone, original);
  assert.notEqual(clone, original);
  assert.notEqual(clone[2], original[2]);
});

test('deepClone clones nested objects deeply', () => {
  const original = { x: { y: { z: 99 } } };
  const clone = deepClone(original);
  clone.x.y.z = 0;
  assert.equal(original.x.y.z, 99, 'Mutation of clone should not affect original');
});

// ── isPlainObject ─────────────────────────────────────────────────────────────

test('isPlainObject returns true for plain objects', () => {
  assert.equal(isPlainObject({}), true);
  assert.equal(isPlainObject({ a: 1, b: 'hello' }), true);
});

test('isPlainObject returns false for arrays', () => {
  assert.equal(isPlainObject([]), false);
  assert.equal(isPlainObject([1, 2, 3]), false);
});

test('isPlainObject returns false for null', () => {
  assert.equal(isPlainObject(null), false);
});

test('isPlainObject returns false for strings and numbers', () => {
  assert.equal(isPlainObject('hello'), false);
  assert.equal(isPlainObject(42), false);
});

test('isPlainObject returns true for non-array objects (including class instances)', () => {
  class Foo {}
  assert.equal(isPlainObject(new Foo()), true);
});
