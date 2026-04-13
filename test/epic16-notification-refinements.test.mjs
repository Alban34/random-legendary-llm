import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createToastRecord,
  pushToast,
  shouldAutoDismissToast
} from '../src/app/feedback-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const browserEntryPath = path.join(rootDir, 'src', 'app', 'browser-entry.mjs');
const rendererPath = path.join(rootDir, 'src', 'app', 'app-renderer.mjs');
const appSveltePath = path.join(rootDir, 'src', 'components', 'App.svelte');

let browserEntrySource;
let rendererSource;
let appSvelteSource;

before(async () => {
  [browserEntrySource, rendererSource, appSvelteSource] = await Promise.all([
    fs.readFile(browserEntryPath, 'utf8'),
    fs.readFile(rendererPath, 'utf8'),
    fs.readFile(appSveltePath, 'utf8')
  ]);
});

test('Epic 16 classifies transient and persistent toasts with different dismissal behavior', () => {
  const transientToast = createToastRecord({
    id: 'toast-1',
    variant: 'info',
    message: 'Setup controls reset.'
  });
  const persistentToast = createToastRecord({
    id: 'toast-2',
    variant: 'error',
    behavior: 'persistent',
    message: 'No owned sets are currently selected.'
  });

  assert.equal(transientToast.behavior, 'transient');
  assert.equal(transientToast.dismissOnClick, true);
  assert.equal(shouldAutoDismissToast(transientToast), true);

  assert.equal(persistentToast.behavior, 'persistent');
  assert.equal(persistentToast.dismissOnClick, false);
  assert.equal(persistentToast.isPersistent, true);
  assert.equal(shouldAutoDismissToast(persistentToast), false);
});

test('Epic 16 stack trimming preserves persistent alerts ahead of transient notices', () => {
  const persistentToast = createToastRecord({
    id: 'toast-critical',
    variant: 'warning',
    behavior: 'persistent',
    message: 'Browser storage is unavailable.'
  });

  const stacked = ['toast-1', 'toast-2', 'toast-3', 'toast-4'].reduce((toasts, id) => {
    return pushToast(toasts, createToastRecord({
      id,
      variant: 'info',
      message: id
    }));
  }, [persistentToast]);

  assert.deepEqual(stacked.map((toast) => toast.id), ['toast-critical', 'toast-2', 'toast-3', 'toast-4']);
});

test('Epic 16 suppresses redundant generator toasts and keeps critical alerts persistent in source behavior', () => {
  assert.doesNotMatch(appSvelteSource, /setup\.notices\.forEach\(\(notice\) => enqueueToast/);
  assert.doesNotMatch(appSvelteSource, /Generated a fully fresh setup\./);
  assert.match(appSvelteSource, /enqueueToast\(\{ variant: 'error', message: error\.message, behavior: 'persistent' \}\)/);
  assert.match(rendererSource, /Persistent alert/);
  assert.match(rendererSource, /data-toast-auto-dismiss="\$\{toast\.autoDismissMs \? 'true' : 'false'\}"/);
});