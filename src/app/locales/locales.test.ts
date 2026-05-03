import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

import { EN_MESSAGES } from './en.ts';
import { FR_MESSAGES } from './fr.ts';
import { DE_MESSAGES } from './de.ts';
import { JA_MESSAGES } from './ja.ts';
import { KO_MESSAGES } from './ko.ts';
import { ES_MESSAGES } from './es.ts';

test('All locale .ts files expose the same key set as the canonical English locale', () => {
  const canonicalKeys = Object.keys(EN_MESSAGES).sort();

  const locales = [
    { id: 'fr', messages: FR_MESSAGES },
    { id: 'de', messages: DE_MESSAGES },
    { id: 'ja', messages: JA_MESSAGES },
    { id: 'ko', messages: KO_MESSAGES },
    { id: 'es', messages: ES_MESSAGES },
  ];

  for (const { id, messages } of locales) {
    const localeKeys = Object.keys(messages).sort();

    const missingKeys = canonicalKeys.filter((k) => !localeKeys.includes(k));
    const extraKeys = localeKeys.filter((k) => !canonicalKeys.includes(k));

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      const diff = [
        missingKeys.length > 0 ? `Keys in en.ts but missing from ${id}.ts: ${missingKeys.join(', ')}` : '',
        extraKeys.length > 0 ? `Keys in ${id}.ts but missing from en.ts: ${extraKeys.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      assert.fail(`Key parity failure for locale "${id}":\n${diff}`);
    }

    assert.deepEqual(localeKeys, canonicalKeys, `Key set for locale "${id}" must be identical to en.ts`);
  }
});

// ── From epic37-small-improvements ───────────────────────────────────────────

let pkgJson;

beforeAll(async () => {
  pkgJson = JSON.parse(await fs.readFile(new URL('../../../package.json', import.meta.url), 'utf8'));
});

test('Test:epic10 script is absent from package.json', () => {

  assert.ok(
    !Object.prototype.hasOwnProperty.call(pkgJson.scripts, 'test:epic10'),
    'package.json must not contain a test:epic10 script'
  );
});

test('e2e and e2e:filter Playwright scripts are present', () => {

  assert.ok(
    Object.prototype.hasOwnProperty.call(pkgJson.scripts, 'e2e'),
    'package.json must contain the e2e Playwright script'
  );
  assert.ok(
    Object.prototype.hasOwnProperty.call(pkgJson.scripts, 'e2e:filter'),
    'package.json must contain the e2e:filter Playwright script'
  );
});

test('Package.json version is 2.1.0', () => {

  assert.equal(pkgJson.version, '2.1.0', 'package.json version must be 2.1.0');
});

const NON_ENGLISH_LOCALES = {
  'fr-FR': FR_MESSAGES,
  'de-DE': DE_MESSAGES,
  'ja-JP': JA_MESSAGES,
  'ko-KR': KO_MESSAGES,
  'es-ES': ES_MESSAGES,
};

test('All tab-related strings are translated in each non-English locale', () => {

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

test('Header.locale.fallbackNotice is translated in all non-English locales', () => {

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

test('Backup, history, and action strings are translated in all non-English locales', () => {

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
