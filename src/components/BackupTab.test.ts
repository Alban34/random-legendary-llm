import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let backupTabSource;
let cssSource;
let localizationSource;

beforeAll(async () => {
  [backupTabSource, cssSource, localizationSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'BackupTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    Promise.all([
      fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'en.ts'), 'utf8'),
      fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'fr.ts'), 'utf8')
    ]).then(([en, fr]) => en + '\n' + fr)
  ]);
});

function getEnBlock(src: string): string {
  const start = src.indexOf('const EN_MESSAGES');
  const end = src.indexOf('\nconst ', start + 10);
  return src.slice(start, end > -1 ? end : undefined);
}

function getFrBlock(src: string): string {
  const start = src.indexOf('const FR_MESSAGES');
  const end = src.indexOf('\nconst ', start + 10);
  return src.slice(start, end > -1 ? end : undefined);
}

function getEnDisclosureBody(src: string): string {
  const block = getEnBlock(src);
  const keyIdx = block.indexOf("'storage.disclosureBody'");
  return block.slice(keyIdx, keyIdx + 400).toLowerCase();
}

function getFrDisclosureBody(src: string): string {
  const block = getFrBlock(src);
  const keyIdx = block.indexOf("'storage.disclosureBody'");
  return block.slice(keyIdx, keyIdx + 500);
}

// UX6.1 — Portability panel

test('Renderer contains data-backup-portability-panel section', () => {

  assert.match(
    backupTabSource,
    /data-backup-portability-panel/,
    'renderer must declare data-backup-portability-panel'
  );
});

test('Portability panel contains export-backup and open-import-backup actions', () => {

  const portabilityIdx = backupTabSource.indexOf('data-backup-portability-panel');
  const maintenanceIdx = backupTabSource.indexOf('data-backup-maintenance-panel');
  assert.ok(portabilityIdx !== -1, 'data-backup-portability-panel must exist');
  assert.ok(maintenanceIdx !== -1, 'data-backup-maintenance-panel must exist');
  assert.ok(portabilityIdx < maintenanceIdx, 'portability panel must appear before maintenance panel');

  const portabilitySlice = backupTabSource.slice(portabilityIdx, maintenanceIdx);
  assert.match(portabilitySlice, /data-action="export-backup"/, 'export-backup must be in portability panel');
  assert.match(portabilitySlice, /data-action="open-import-backup"/, 'open-import-backup must be in portability panel');
});

test('Portability panel does NOT contain request-reset-all-state', () => {

  const portabilityIdx = backupTabSource.indexOf('data-backup-portability-panel');
  const maintenanceIdx = backupTabSource.indexOf('data-backup-maintenance-panel');
  const portabilitySlice = backupTabSource.slice(portabilityIdx, maintenanceIdx);
  assert.doesNotMatch(
    portabilitySlice,
    /data-action="request-reset-all-state"/,
    'full reset must not appear in the portability panel'
  );
});

// UX6.1 / UX6.3 — Maintenance panel

test('Renderer contains data-backup-maintenance-panel section or accordion', () => {

  assert.match(
    backupTabSource,
    /data-backup-maintenance-panel/,
    'renderer must declare data-backup-maintenance-panel'
  );
});

test('Renderer uses maintenance-accordion for the compact (mobile) layout', () => {

  assert.match(
    backupTabSource,
    /maintenance-accordion/,
    'renderer must reference the maintenance-accordion class for mobile collapsing'
  );
});

test('Maintenance panel contains reset-usage actions', () => {

  const maintenanceIdx = backupTabSource.indexOf('data-backup-maintenance-panel');
  const dangerIdx = backupTabSource.indexOf('data-backup-danger-zone');
  assert.ok(maintenanceIdx !== -1, 'data-backup-maintenance-panel must exist');
  assert.ok(dangerIdx !== -1, 'data-backup-danger-zone must exist');

  const maintenanceSlice = backupTabSource.slice(maintenanceIdx, dangerIdx);
  assert.match(maintenanceSlice, /data-action="reset-usage"/, 'reset-usage must be in maintenance panel');
});

test('Maintenance panel does NOT contain request-reset-all-state', () => {

  const maintenanceIdx = backupTabSource.indexOf('data-backup-maintenance-panel');
  const dangerIdx = backupTabSource.indexOf('data-backup-danger-zone');
  const maintenanceSlice = backupTabSource.slice(maintenanceIdx, dangerIdx);
  assert.doesNotMatch(
    maintenanceSlice,
    /data-action="request-reset-all-state"/,
    'full reset must not appear in the maintenance panel'
  );
});

// UX6.2 — Danger zone panel

test('Renderer contains data-backup-danger-zone section', () => {

  assert.match(
    backupTabSource,
    /data-backup-danger-zone/,
    'renderer must declare data-backup-danger-zone'
  );
});

test('Danger zone contains request-reset-all-state and NOT reset-usage', () => {

  const dangerIdx = backupTabSource.indexOf('data-backup-danger-zone');
  assert.ok(dangerIdx !== -1, 'data-backup-danger-zone must exist');
  const dangerSlice = backupTabSource.slice(dangerIdx);
  assert.match(dangerSlice, /data-action="request-reset-all-state"/, 'full reset must be in the danger zone');
  const dangerOnlySlice = dangerSlice.slice(0, dangerSlice.indexOf('</section>', dangerSlice.indexOf('data-backup-danger-zone')) + 10);
  assert.doesNotMatch(
    dangerOnlySlice,
    /data-action="reset-usage"/,
    'per-category reset-usage must not appear in the danger zone'
  );
});

test('Danger zone uses panel danger-zone CSS class', () => {

  assert.match(
    backupTabSource,
    /class="panel danger-zone"/,
    'danger zone section must use the danger-zone CSS class'
  );
});

test('Danger zone consequence copy key is used in renderer', () => {

  assert.match(
    backupTabSource,
    /backup\.dangerZoneConsequence/,
    'renderer must reference backup.dangerZoneConsequence locale key'
  );
});

// UX6.2 — CSS danger zone

test('CSS contains .danger-zone with danger-border-soft token', () => {

  assert.match(
    cssSource,
    /\.danger-zone\s*\{[^}]*--danger-border/,
    'CSS .danger-zone must reference a --danger-border token'
  );
});

test('CSS contains .danger-zone with danger-soft token', () => {

  assert.match(
    cssSource,
    /\.danger-zone\s*\{[^}]*--danger-soft/,
    'CSS .danger-zone must reference a --danger-soft token'
  );
});

test('CSS contains .danger-zone h2 rule with danger color', () => {

  assert.match(
    cssSource,
    /\.danger-zone h2\s*\{[^}]*--danger/,
    'CSS .danger-zone h2 must set color using a --danger token'
  );
});

// UX6.3 — CSS maintenance accordion

test('CSS contains .maintenance-accordion class', () => {

  assert.match(
    cssSource,
    /\.maintenance-accordion\s*\{/,
    'CSS must define .maintenance-accordion'
  );
});

test('CSS contains .maintenance-accordion-summary class', () => {

  assert.match(
    cssSource,
    /\.maintenance-accordion-summary\s*\{/,
    'CSS must define .maintenance-accordion-summary'
  );
});

// Story 36.2 — localStorage disclosure

test('BackupTab renders storage disclosure element', () => {

  assert.match(
    backupTabSource,
    /data-storage-disclosure/,
    'BackupTab must render an element with data-storage-disclosure attribute'
  );
});

test('BackupTab references both disclosure locale keys', () => {

  assert.match(
    backupTabSource,
    /storage\.disclosureTitle/,
    'BackupTab must reference storage.disclosureTitle locale key'
  );
  assert.match(
    backupTabSource,
    /storage\.disclosureBody/,
    'BackupTab must reference storage.disclosureBody locale key'
  );
});

// ── From epic36-version-storage-disclosure (BackupTab disclosure assertions) ─

test('EN_MESSAGES contains storage.disclosureTitle', () => {

  const enBlock = getEnBlock(localizationSource);
  assert.match(enBlock, /storage\.disclosureTitle/, 'EN_MESSAGES must have storage.disclosureTitle');
});

test('EN_MESSAGES contains storage.disclosureBody', () => {

  const enBlock = getEnBlock(localizationSource);
  assert.match(enBlock, /storage\.disclosureBody/, 'EN_MESSAGES must have storage.disclosureBody');
});

test('FR_MESSAGES contains storage.disclosureTitle and storage.disclosureBody', () => {

  const frBlock = getFrBlock(localizationSource);
  assert.match(frBlock, /storage\.disclosureTitle/, 'FR_MESSAGES must have storage.disclosureTitle');
  assert.match(frBlock, /storage\.disclosureBody/, 'FR_MESSAGES must have storage.disclosureBody');
});

test('EN disclosure body mentions localStorage', () => {

  const bodyCtx = getEnDisclosureBody(localizationSource);
  assert.match(bodyCtx, /localStorage/i, 'EN disclosure must mention localStorage');
});

test('EN disclosure body mentions collection ownership', () => {

  const bodyCtx = getEnDisclosureBody(localizationSource);
  assert.ok(bodyCtx.includes('collection'), 'EN disclosure must mention collection ownership');
});

test('EN disclosure body mentions game history', () => {

  const bodyCtx = getEnDisclosureBody(localizationSource);
  assert.ok(bodyCtx.includes('history'), 'EN disclosure must mention game history');
});

test('EN disclosure body mentions user preferences', () => {

  const bodyCtx = getEnDisclosureBody(localizationSource);
  assert.ok(bodyCtx.includes('preference'), 'EN disclosure must mention user preferences');
});

test('EN disclosure body confirms data is never transmitted', () => {

  const bodyCtx = getEnDisclosureBody(localizationSource);
  assert.ok(
    bodyCtx.includes('never transmitted') || bodyCtx.includes('never sent'),
    'EN disclosure must state data is never transmitted'
  );
});

test('EN disclosure does not mention cookies', () => {

  const bodyCtx = getEnDisclosureBody(localizationSource);
  assert.doesNotMatch(bodyCtx, /cookie/i, 'EN disclosure must not mention cookie or cookies');
});

test('FR disclosure does not mention cookies', () => {

  const bodyCtx = getFrDisclosureBody(localizationSource);
  assert.doesNotMatch(bodyCtx, /cookie/i, 'FR disclosure must not mention cookie or cookies');
});

test('FR disclosure mentions localStorage', () => {

  const bodyCtx = getFrDisclosureBody(localizationSource);
  assert.match(bodyCtx, /localStorage/i, 'FR disclosure must mention localStorage');
});
