import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { createToastRecord, pushToast, removeToast, shouldAutoDismissToast } from '../src/app/feedback-utils.ts';
import { generateSetup } from '../src/app/setup-generator.ts';
import { createDefaultState, createStorageAdapter, loadState } from '../src/app/state-store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');
const rendererPath = path.join(rootDir, 'src', 'app', 'app-renderer.ts');
const shellCssPath = path.join(rootDir, 'src', 'app', 'app-shell.css');
const htmlPath = path.join(rootDir, 'src', 'components', 'App.svelte');
const tabNavPath = path.join(rootDir, 'src', 'components', 'TabNav.svelte');
const toastStackPath = path.join(rootDir, 'src', 'components', 'ToastStack.svelte');
const modalRootPath = path.join(rootDir, 'src', 'components', 'ModalRoot.svelte');

let bundle;
let rendererSource;
let shellCssSource;
let htmlSource;
let tabNavSource;
let toastStackSource;
let modalRootSource;

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

function markAllUsedExcept(bucket, entities, keepIds) {
  const keep = new Set(keepIds);
  entities.forEach((entity, index) => {
    if (!keep.has(entity.id)) {
      bucket[entity.id] = {
        plays: index < 8 ? 1 : 2,
        lastPlayedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
}

before(async () => {
  const [seedRaw, rendererRaw, shellCssRaw, htmlRaw, tabNavRaw, toastStackRaw, modalRootRaw] = await Promise.all([
    fs.readFile(seedPath, 'utf8'),
    fs.readFile(rendererPath, 'utf8'),
    fs.readFile(shellCssPath, 'utf8'),
    fs.readFile(htmlPath, 'utf8'),
    fs.readFile(tabNavPath, 'utf8'),
    fs.readFile(toastStackPath, 'utf8'),
    fs.readFile(modalRootPath, 'utf8')
  ]);

  bundle = createEpic1Bundle(JSON.parse(seedRaw));
  rendererSource = rendererRaw;
  shellCssSource = shellCssRaw;
  htmlSource = htmlRaw;
  tabNavSource = tabNavRaw;
  toastStackSource = toastStackRaw;
  modalRootSource = modalRootRaw;
});

test('Epic 9 toast helpers preserve variant metadata, dismiss records, and cap stacked notifications', () => {
  const successToast = createToastRecord({ id: 'toast-1', variant: 'success', message: 'Saved setup.' });
  const fallbackToast = createToastRecord({ id: 'toast-2', variant: 'missing', message: 'Fallback copy.' });
  const persistentWarning = createToastRecord({ id: 'toast-3', variant: 'warning', behavior: 'persistent', message: 'Storage is unavailable.' });

  assert.equal(successToast.variant, 'success');
  assert.equal(successToast.label, 'Success');
  assert.equal(successToast.icon, '✅');
  assert.equal(successToast.live, 'polite');
  assert.equal(successToast.behavior, 'transient');
  assert.equal(shouldAutoDismissToast(successToast), true);

  assert.equal(fallbackToast.variant, 'info');
  assert.equal(fallbackToast.label, 'Info');
  assert.equal(fallbackToast.icon, 'ℹ️');
  assert.equal(fallbackToast.live, 'polite');
  assert.equal(fallbackToast.behavior, 'transient');

  assert.equal(persistentWarning.variant, 'warning');
  assert.equal(persistentWarning.behavior, 'persistent');
  assert.equal(persistentWarning.isPersistent, true);
  assert.equal(shouldAutoDismissToast(persistentWarning), false);

  const stacked = ['toast-1', 'toast-2', 'toast-4', 'toast-5'].reduce((toasts, id, index) => {
    return pushToast(toasts, createToastRecord({
      id,
      variant: index % 2 === 0 ? 'info' : 'warning',
      message: `Message ${index}`
    }));
  }, [persistentWarning]);

  assert.deepEqual(stacked.map((toast) => toast.id), ['toast-3', 'toast-2', 'toast-4', 'toast-5']);
  assert.equal(removeToast(stacked, 'toast-4').some((toast) => toast.id === 'toast-4'), false);
});

test('Epic 9 setup messaging surfaces invalid requests clearly and reports least-played fallback usage', () => {
  assert.throws(
    () => generateSetup({
      runtime: bundle.runtime,
      state: createDefaultState(),
      playerCount: 2,
      advancedSolo: false,
      random: () => 0
    }),
    /No owned sets are currently selected\./
  );

  const simpleScheme = bundle.runtime.indexes.allSchemes.find((entity) => {
    return !entity.modifiers.length && !entity.forcedGroups.length && !entity.constraints?.minimumPlayerCount;
  });
  const simpleMastermind = bundle.runtime.indexes.allMasterminds.find((entity) => !entity.lead);
  const state = createAllOwnedState();

  markAllUsedExcept(state.usage.schemes, bundle.runtime.indexes.allSchemes, [simpleScheme.id]);
  markAllUsedExcept(state.usage.masterminds, bundle.runtime.indexes.allMasterminds, [simpleMastermind.id]);
  markAllUsedExcept(state.usage.heroes, bundle.runtime.indexes.allHeroes, bundle.runtime.indexes.allHeroes.slice(0, 2).map((hero) => hero.id));

  const before = JSON.stringify(state);
  const setup = generateSetup({
    runtime: bundle.runtime,
    state,
    playerCount: 2,
    advancedSolo: false,
    random: () => 0
  });

  assert.equal(setup.scheme.id, simpleScheme.id);
  assert.equal(setup.mastermind.id, simpleMastermind.id);
  assert.equal(setup.notices.some((notice) => notice.includes('Least-played fallback used for Hero selection')), true);
  assert.equal(setup.fallbackUsed, true);
  assert.equal(JSON.stringify(state), before);
});

test('Epic 9 storage degradation keeps a default in-memory state and exposes a readable compatibility message', () => {
  const brokenStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('Storage blocked for test');
    },
    removeItem() {
      throw new Error('Storage blocked for test');
    }
  };

  const storageAdapter = createStorageAdapter(brokenStorage);
  const loaded = loadState({ storageAdapter, indexes: bundle.runtime.indexes });

  assert.equal(storageAdapter.available, false);
  assert.equal(storageAdapter.setItem('x', 'y').ok, false);
  assert.equal(storageAdapter.removeItem('x').storageAvailable, false);
  assert.deepEqual(loaded.state, createDefaultState());
  assert.equal(loaded.storageAvailable, false);
  assert.equal(loaded.recovered, true);
  assert.ok(loaded.notices[0].includes('Browser storage is unavailable'));
});

test('Epic 9 ships semantic tab, toast, and modal markup plus visible focus styling', () => {
  assert.match(htmlSource, /id="toast-region"[^>]*aria-live="polite"[^>]*aria-atomic="false"/);
  assert.match(htmlSource, /role="tablist"/);

  assert.match(tabNavSource, /role="tab"/);
  assert.match(modalRootSource, /role="dialog"[\s\S]*?aria-modal="true"[\s\S]*?aria-labelledby="modal-title"[\s\S]*?aria-describedby="modal-description"/);
  assert.match(htmlSource, /aria-labelledby=\{"tab-desktop-" \+ tab\.id \+ " tab-mobile-" \+ tab\.id\}/);
  assert.match(toastStackSource, /role="region" aria-label=\{locale\.t\('toast\.region'\)\}/);
  assert.match(toastStackSource, /data-toast-dismiss-on-click=\{toast\.dismissOnClick \? 'true' : 'false'\}/);
  assert.match(toastStackSource, /" toast-" \+ toast\.behavior/);

  assert.match(shellCssSource, /button:focus-visible/);
  assert.match(shellCssSource, /\.tab-button:focus-visible/);
  assert.match(shellCssSource, /summary:focus-visible/);
  assert.match(shellCssSource, /#toast-region\s*\{[\s\S]*position:\s*fixed;/);
  assert.match(shellCssSource, /\.toast-persistent\s*\{/);
});

