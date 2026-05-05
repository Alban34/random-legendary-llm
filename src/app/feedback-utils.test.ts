import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  createToastRecord,
  pushToast,
  removeToast,
  shouldAutoDismissToast,
  TOAST_VARIANTS,
  TOAST_BEHAVIORS
} from './feedback-utils.ts';

// ── TOAST_VARIANTS and TOAST_BEHAVIORS ────────────────────────────────────────

test('TOAST_VARIANTS exposes the expected variant keys', () => {
  assert.ok('success' in TOAST_VARIANTS);
  assert.ok('info' in TOAST_VARIANTS);
  assert.ok('warning' in TOAST_VARIANTS);
  assert.ok('error' in TOAST_VARIANTS);
});

test('TOAST_BEHAVIORS exposes transient and persistent keys', () => {
  assert.ok('transient' in TOAST_BEHAVIORS);
  assert.ok('persistent' in TOAST_BEHAVIORS);
});

// ── createToastRecord ─────────────────────────────────────────────────────────

test('createToastRecord creates a toast with the expected shape', () => {
  const toast = createToastRecord({ id: 'test-1', variant: 'success', message: 'All good' });
  assert.equal(toast.id, 'test-1');
  assert.equal(toast.variant, 'success');
  assert.equal(toast.message, 'All good');
  assert.equal(toast.behavior, 'transient');
  assert.equal(toast.label, TOAST_VARIANTS.success.label);
  assert.equal(toast.icon, TOAST_VARIANTS.success.icon);
  assert.equal(toast.live, TOAST_VARIANTS.success.live);
  assert.equal(toast.autoDismissMs, TOAST_BEHAVIORS.transient.autoDismissMs);
  assert.equal(toast.dismissible, TOAST_BEHAVIORS.transient.dismissible);
  assert.equal(toast.isPersistent, TOAST_BEHAVIORS.transient.isPersistent);
});

test('createToastRecord uses persistent behavior when specified', () => {
  const toast = createToastRecord({ id: 'test-2', variant: 'error', message: 'Something failed', behavior: 'persistent' });
  assert.equal(toast.behavior, 'persistent');
  assert.equal(toast.autoDismissMs, null);
  assert.equal(toast.isPersistent, true);
});

test('createToastRecord falls back to info variant for unknown variant', () => {
  const toast = createToastRecord({ id: 'test-3', variant: 'unknown-type', message: 'Fallback' });
  assert.equal(toast.variant, 'info');
});

// ── pushToast ─────────────────────────────────────────────────────────────────

test('pushToast appends a toast to the list', () => {
  const toast1 = createToastRecord({ id: 'a', variant: 'info', message: 'First' });
  const toast2 = createToastRecord({ id: 'b', variant: 'success', message: 'Second' });
  const result = pushToast([toast1], toast2);
  assert.equal(result.length, 2);
  assert.equal(result[1].id, 'b');
});

test('pushToast respects maxToasts limit and drops the oldest non-persistent entry', () => {
  const toasts = [
    createToastRecord({ id: '1', variant: 'info', message: 'Oldest' }),
    createToastRecord({ id: '2', variant: 'info', message: 'Middle' }),
    createToastRecord({ id: '3', variant: 'info', message: 'Recent' }),
    createToastRecord({ id: '4', variant: 'info', message: 'Newest' })
  ];
  const newToast = createToastRecord({ id: '5', variant: 'success', message: 'Extra' });
  const result = pushToast(toasts, newToast, 4);
  assert.equal(result.length, 4);
  assert.ok(!result.some((t) => t.id === '1'), 'Oldest toast should have been dropped');
  assert.ok(result.some((t) => t.id === '5'), 'New toast should be present');
});

// ── removeToast ───────────────────────────────────────────────────────────────

test('removeToast removes toast by id', () => {
  const toast1 = createToastRecord({ id: 'x', variant: 'info', message: 'Keep' });
  const toast2 = createToastRecord({ id: 'y', variant: 'warning', message: 'Remove' });
  const result = removeToast([toast1, toast2], 'y');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'x');
});

test('removeToast is a no-op for a missing id', () => {
  const toast1 = createToastRecord({ id: 'x', variant: 'info', message: 'Keep' });
  const result = removeToast([toast1], 'missing-id');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'x');
});

// ── shouldAutoDismissToast ────────────────────────────────────────────────────

test('shouldAutoDismissToast returns true for transient toast with autoDismissMs', () => {
  const toast = createToastRecord({ id: 't', variant: 'success', message: 'Done', behavior: 'transient' });
  assert.equal(shouldAutoDismissToast(toast), true);
});

test('shouldAutoDismissToast returns false for persistent toast', () => {
  const toast = createToastRecord({ id: 'p', variant: 'error', message: 'Stuck', behavior: 'persistent' });
  assert.equal(shouldAutoDismissToast(toast), false);
});

test('shouldAutoDismissToast returns false for null', () => {
  assert.equal(shouldAutoDismissToast(null), false);
});

test('shouldAutoDismissToast returns false for undefined', () => {
  assert.equal(shouldAutoDismissToast(undefined), false);
});
