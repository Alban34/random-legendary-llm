# Locale Authoring Convention

STATUS: Approved

## Overview

The project maintains locale message catalogs in two file formats under `src/app/locales/`:

| File type | Purpose |
|---|---|
| `*.ts` (e.g. `en.ts`, `fr.ts`) | **Runtime source.** Imported by `src/app/localization-utils.ts`. These files are what the browser executes. |
| `*.mjs` (e.g. `en.mjs`, `fr.mjs`) | **Translator working copies and Node test environment mirrors.** Read and written by translator agents; also imported by the Vitest test chain (`localization-utils.mjs → state-store.mjs`). Not imported by the browser runtime. Each file carries a standard `⚠ MIRROR FILE` header comment identifying it as a mirror of its `.ts` counterpart. |

## Authoring rule: add new keys to `.ts` files first

When adding a new locale key to the app:

1. Add the key and its English value to `src/app/locales/en.ts` (the canonical key schema, marked at the top of the file).
2. Add the same key with translated values to each of `fr.ts`, `de.ts`, `ja.ts`, `ko.ts`, and `es.ts`.
3. Mirror the same additions to the corresponding `.mjs` files so translator agents can read the current English source.

**Do not add keys only to `.mjs` files.** The runtime imports exclusively from `.ts`. Keys missing from `.ts` fall through to the raw key string, which appears verbatim in the live UI.

## Constraint: `.mjs` files must never diverge from `.ts` files

The `.mjs` and `.ts` locale files for the same locale must always carry the same set of keys with the same translated values. If they diverge:

- Translator agents produce translations for keys that the runtime never uses.
- Keys added only to `.mjs` files are invisible to the app and appear as raw key strings in the browser.

Keep the two formats in sync. The locale-completeness test in `npm test` catches missing keys across locale files. Cross-format key parity (`.mjs` vs `.ts`) is additionally enforced by `test/epic75-locale-sync-a11y.test.mjs`, which verifies that every locale's `.mjs` and `.ts` catalogs carry an identical set of keys; any divergence fails the suite.

## Where to add new keys

Add new locale keys at the bottom of the relevant message group within `en.ts`, above the closing `}`. Follow the existing grouping conventions (e.g. `newGame.forcedPicks.*`, `history.*`, `backup.*`). After adding to `en.ts`, propagate to the other five `.ts` locale files before committing.
