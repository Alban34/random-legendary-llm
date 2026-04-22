import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN_MESSAGES } from '../src/app/locales/en.ts';
import { FR_MESSAGES } from '../src/app/locales/fr.ts';
import { DE_MESSAGES } from '../src/app/locales/de.ts';
import { JA_MESSAGES } from '../src/app/locales/ja.ts';
import { KO_MESSAGES } from '../src/app/locales/ko.ts';
import { ES_MESSAGES } from '../src/app/locales/es.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let pkgJson;

before(async () => {
  pkgJson = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));
});

// ── Story 37.3 — Stale test:epic10 script removed ──────────────────────────

test('Story 37.3: test:epic10 script is absent from package.json', () => {
  assert.ok(
    !Object.prototype.hasOwnProperty.call(pkgJson.scripts, 'test:epic10'),
    'package.json must not contain a test:epic10 script'
  );
});

test('Story 37.3: test:qc:epic10 Playwright script is still present', () => {
  assert.ok(
    Object.prototype.hasOwnProperty.call(pkgJson.scripts, 'test:qc:epic10'),
    'package.json must retain the test:qc:epic10 Playwright script'
  );
});

// ── Story 37.4 — Version bumped to 1.0.2 ──────────────────────────────────

test('Story 37.4: package.json version is 2.0.0', () => {
  assert.equal(pkgJson.version, '2.0.0', 'package.json version must be 2.0.0');
});

// ── Story 37.1 — Locale coverage ──────────────────────────────────────────

const NON_ENGLISH_LOCALES = {
  'fr-FR': FR_MESSAGES,
  'de-DE': DE_MESSAGES,
  'ja-JP': JA_MESSAGES,
  'ko-KR': KO_MESSAGES,
  'es-ES': ES_MESSAGES,
};

test('Story 37.1: all tab-related strings are translated in each non-English locale', () => {
  const tabKeys = [
    'tabs.browse.label',
    'tabs.collection.label',
    'tabs.new-game.label',
    'tabs.history.label',
    'tabs.backup.label',
    'tabs.browse.description',
    'tabs.collection.description',
    'tabs.new-game.description',
    'tabs.history.description',
    'tabs.backup.description',
  ];

  for (const [localeId, messages] of Object.entries(NON_ENGLISH_LOCALES)) {
    for (const key of tabKeys) {
      assert.ok(
        messages[key] !== undefined && messages[key] !== null,
        `${localeId}: key '${key}' must be present`
      );
    }
  }
});

test('Story 37.1: header.locale.fallbackNotice is translated in all non-English locales', () => {
  for (const [localeId, messages] of Object.entries(NON_ENGLISH_LOCALES)) {
    assert.ok(
      messages['header.locale.fallbackNotice'] !== undefined && messages['header.locale.fallbackNotice'] !== null,
      `${localeId}: key 'header.locale.fallbackNotice' must be present`
    );
    assert.notEqual(
      messages['header.locale.fallbackNotice'],
      EN_MESSAGES['header.locale.fallbackNotice'],
      `${localeId}: key 'header.locale.fallbackNotice' must not be an English fallback`
    );
  }
});

test('Story 37.1: backup, history, and action strings are translated in all non-English locales', () => {
  const representativeKeys = [
    'backup.export',
    'backup.import',
    'history.description',
    'history.addResult',
    'newGame.generate',
    'modal.cancel',
  ];

  for (const [localeId, messages] of Object.entries(NON_ENGLISH_LOCALES)) {
    for (const key of representativeKeys) {
      assert.ok(
        messages[key] !== undefined && messages[key] !== null,
        `${localeId}: key '${key}' must be present`
      );
    }
  }
});
