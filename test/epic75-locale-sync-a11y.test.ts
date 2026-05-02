import { test } from 'vitest';
import assert from 'node:assert/strict';

import { EN_MESSAGES } from '../src/app/locales/en.ts';
import { FR_MESSAGES } from '../src/app/locales/fr.ts';
import { DE_MESSAGES } from '../src/app/locales/de.ts';
import { JA_MESSAGES } from '../src/app/locales/ja.ts';
import { KO_MESSAGES } from '../src/app/locales/ko.ts';
import { ES_MESSAGES } from '../src/app/locales/es.ts';

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
