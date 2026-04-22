import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let rendererSource;
let backupTabSource;
let cssSource;
let localeSource;

beforeAll(async () => {
  [rendererSource, backupTabSource, cssSource, localeSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'BackupTab.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    Promise.all([
      fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'en.ts'), 'utf8'),
      fs.readFile(path.join(rootDir, 'src', 'app', 'locales', 'fr.ts'), 'utf8')
    ]).then(([en, fr]) => en + '\n' + fr)
  ]);
});

// UX6.1 — Portability panel

test('Renderer contains data-backup-portability-panel section', () => {

  assert.match(
    backupTabSource,
    /data-backup-portability-panel/,
    'renderer must declare data-backup-portability-panel'
  );
});

test('Portability panel contains export-backup and open-import-backup actions', () => {

  // Portability panel appears before maintenance panel — find its slice
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
  // danger zone slice starts at the opening — check reset-usage does not appear there
  // The danger zone is the last panel so slicing from its position is sufficient
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

test('CSS contains .maintenance-accordion-body class', () => {

  assert.match(
    cssSource,
    /\.maintenance-accordion-body\s*\{/,
    'CSS must define .maintenance-accordion-body'
  );
});

test('CSS includes prefers-reduced-motion rule for accordion arrow', () => {

  assert.match(
    cssSource,
    /prefers-reduced-motion:\s*reduce[\s\S]*?\.maintenance-accordion-summary::after[\s\S]*?transition:\s*none/,
    'CSS must disable accordion arrow transition under prefers-reduced-motion'
  );
});

// UX6.4 — Localization keys

test('EN locale contains backup.portabilityDescription key', () => {

  assert.match(
    localeSource,
    /'backup\.portabilityDescription'/,
    'localization must define backup.portabilityDescription'
  );
});

test('EN locale contains backup.maintenanceTitle key', () => {

  assert.match(
    localeSource,
    /'backup\.maintenanceTitle'/,
    'localization must define backup.maintenanceTitle'
  );
});

test('EN locale contains backup.dangerZoneTitle key', () => {

  assert.match(
    localeSource,
    /'backup\.dangerZoneTitle'/,
    'localization must define backup.dangerZoneTitle'
  );
});

test('EN locale contains backup.dangerZoneConsequence key', () => {

  assert.match(
    localeSource,
    /'backup\.dangerZoneConsequence'/,
    'localization must define backup.dangerZoneConsequence'
  );
});

test('FR locale contains backup.portabilityDescription', () => {

  // Appears twice (EN + FR), just confirm it appears at all
  const allMatches = [...localeSource.matchAll(/'backup\.portabilityDescription'/g)];
  assert.ok(allMatches.length >= 2, 'backup.portabilityDescription must exist in both EN and FR locales');
});

test('FR locale contains backup.maintenanceTitle', () => {

  const allMatches = [...localeSource.matchAll(/'backup\.maintenanceTitle'/g)];
  assert.ok(allMatches.length >= 2, 'backup.maintenanceTitle must exist in both EN and FR locales');
});

test('FR locale contains backup.dangerZoneTitle', () => {

  const allMatches = [...localeSource.matchAll(/'backup\.dangerZoneTitle'/g)];
  assert.ok(allMatches.length >= 2, 'backup.dangerZoneTitle must exist in both EN and FR locales');
});

test('FR locale contains backup.dangerZoneConsequence', () => {

  const allMatches = [...localeSource.matchAll(/'backup\.dangerZoneConsequence'/g)];
  assert.ok(allMatches.length >= 2, 'backup.dangerZoneConsequence must exist in both EN and FR locales');
});

