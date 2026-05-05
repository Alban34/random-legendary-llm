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
  source = await fs.readFile(path.join(rootDir, 'src', 'components', 'ToastStack.svelte'), 'utf8');
});

test('ToastStack container has role="region" and aria-label', () => {
  assert.match(source, /role="region"/);
  assert.match(source, /aria-label={locale\.t\('toast\.region'\)}/);
});

test('ToastStack articles use role="alert" or role="status" based on live level', () => {
  assert.match(source, /role={toast\.live === 'assertive' \? 'alert' : 'status'}/);
  assert.match(source, /aria-live={toast\.live}/);
});

test('ToastStack dismiss button has data-action="dismiss-toast"', () => {
  assert.match(source, /data-action="dismiss-toast"/);
});

test('ToastStack pauses auto-dismiss on hover and focus', () => {
  assert.match(source, /onmouseenter/);
  assert.match(source, /onfocusin/);
  assert.match(source, /onPause\(toast\.id\)/);
  assert.match(source, /onResume\(toast\.id\)/);
});

test('ToastStack dismiss button has aria-label with notification context', () => {
  assert.match(source, /aria-label={actionLabel \+ " " \+ toast\.label \+ " notification"}/);
});
