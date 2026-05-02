import { test } from 'vitest';
import assert from 'node:assert/strict';

import { EN_MESSAGES as EN_MESSAGES_TS } from '../src/app/locales/en.ts';
import { FR_MESSAGES as FR_MESSAGES_TS } from '../src/app/locales/fr.ts';
import { DE_MESSAGES as DE_MESSAGES_TS } from '../src/app/locales/de.ts';
import { JA_MESSAGES as JA_MESSAGES_TS } from '../src/app/locales/ja.ts';
import { KO_MESSAGES as KO_MESSAGES_TS } from '../src/app/locales/ko.ts';
import { ES_MESSAGES as ES_MESSAGES_TS } from '../src/app/locales/es.ts';

import { EN_MESSAGES as EN_MESSAGES_MJS } from '../src/app/locales/en.mjs';
import { FR_MESSAGES as FR_MESSAGES_MJS } from '../src/app/locales/fr.mjs';
import { DE_MESSAGES as DE_MESSAGES_MJS } from '../src/app/locales/de.mjs';
import { JA_MESSAGES as JA_MESSAGES_MJS } from '../src/app/locales/ja.mjs';
import { KO_MESSAGES as KO_MESSAGES_MJS } from '../src/app/locales/ko.mjs';
import { ES_MESSAGES as ES_MESSAGES_MJS } from '../src/app/locales/es.mjs';

test('All .ts and .mjs locale files expose identical key sets', () => {
  const locales = [
    { id: 'en', ts: EN_MESSAGES_TS, mjs: EN_MESSAGES_MJS },
    { id: 'fr', ts: FR_MESSAGES_TS, mjs: FR_MESSAGES_MJS },
    { id: 'de', ts: DE_MESSAGES_TS, mjs: DE_MESSAGES_MJS },
    { id: 'ja', ts: JA_MESSAGES_TS, mjs: JA_MESSAGES_MJS },
    { id: 'ko', ts: KO_MESSAGES_TS, mjs: KO_MESSAGES_MJS },
    { id: 'es', ts: ES_MESSAGES_TS, mjs: ES_MESSAGES_MJS },
  ];

  for (const { id, ts, mjs } of locales) {
    const tsKeys = Object.keys(ts).sort();
    const mjsKeys = Object.keys(mjs).sort();

    const missingFromMjs = tsKeys.filter((k) => !mjsKeys.includes(k));
    const extraInMjs = mjsKeys.filter((k) => !tsKeys.includes(k));

    if (missingFromMjs.length > 0 || extraInMjs.length > 0) {
      const diff = [
        missingFromMjs.length > 0 ? `Keys in .ts but missing from .mjs [${id}]: ${missingFromMjs.join(', ')}` : '',
        extraInMjs.length > 0 ? `Keys in .mjs but missing from .ts [${id}]: ${extraInMjs.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      assert.fail(`Key parity failure for locale "${id}":\n${diff}`);
    }

    assert.deepEqual(tsKeys, mjsKeys, `Key sets for locale "${id}" must be identical between .ts and .mjs`);
  }
});
