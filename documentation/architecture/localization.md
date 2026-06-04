# Locale Authoring Convention

STATUS: Approved

## Overview

The project maintains locale message catalogs as TypeScript source files under `src/app/locales/`:

| File type | Purpose |
|---|---|
| `*.ts` (e.g. `en.ts`, `fr.ts`) | **Runtime source.** Imported by `src/app/localization-utils.ts`. These files are what the browser executes and the authoritative source for all locale keys. |

## Authoring rule: add new keys to `.ts` files first

When adding a new locale key to the app:

1. Add the key and its English value to `src/app/locales/en.ts` (the canonical key schema, marked at the top of the file).
2. Add the same key with translated values to each of `fr.ts`, `de.ts`, `ja.ts`, `ko.ts`, and `es.ts`.

**The runtime imports exclusively from `.ts`.** Keys missing from `.ts` fall through to the raw key string, which appears verbatim in the live UI.

## Constraint: all locale `.ts` files must expose the same key set

Every locale file must carry exactly the same set of keys as `en.ts`. If they diverge:

- The missing locale renders raw key strings (e.g. `newGame.forcedPicks.label`) instead of translated text.
- Extra keys added to a non-English locale but absent from `en.ts` are unreachable by the app.

Cross-locale key parity is enforced by `src/app/locales/locales.test.ts`, which verifies that every locale's `.ts` catalog carries an identical set of keys to `en.ts`; any divergence fails the suite.

## Where to add new keys

Add new locale keys at the bottom of the relevant message group within `en.ts`, above the closing `}`. Follow the existing grouping conventions (e.g. `newGame.forcedPicks.*`, `history.*`, `backup.*`). After adding to `en.ts`, propagate to the other five `.ts` locale files before committing.

> **Note (clean-code cleanup, 3 June 2026):** Four key groups were added to localize previously hardcoded English strings — `collection.typeGroup.*` and `collection.feasibilityMode.*` (collection type-group and feasibility-mode labels, formerly literal `label` strings in `collection-utils.ts`) and `newGame.generator.notice.*` and `newGame.generator.error.*` (generator notices and generic generator errors, formerly plain English in `setup-generator.ts`). This added 18 new keys to each of the six locale catalogs.
