## Title
Locale selector `aria-label` contains a raw key string with a typo, degrading accessibility for all users

## Severity
Must change

## Affects
Both

## Source
Senior Desktop UX Auditor (review on 2026-05-02)

## Where it appears
Shared header — locale selector (`<select>` element), visible on all tabs.

## Evidence
Live browser inspection confirmed `aria-label="header.locale!.groupLabel"` on the locale selector in every locale. The correct key is `header.locale.groupLabel` (value: "Choose language" in English; "Choisir la langue" in French, etc.).

Source code root cause in `src/components/App.svelte` line 1385:
```svelte
aria-label={locale!.t('header.locale!.groupLabel')}
```
The TypeScript non-null assertion operator `!` on `locale` was accidentally embedded inside the string literal as `'header.locale!.groupLabel'`. The runtime lookup uses this malformed key, which is absent from all message catalogs, so the raw key string is returned as the aria-label.

The correct code should be:
```svelte
aria-label={locale.t('header.locale.groupLabel')}
```
(or `locale!.t('header.locale.groupLabel')` if the non-null assertion is needed)

## Why it matters
The locale selector is a global control accessible on every tab in every locale. Its broken `aria-label` means:
1. Screen readers announce `"header.locale!.groupLabel"` instead of `"Choose language"` to every assistive-technology user.
2. The raw key string is meaningless in any language, completely breaking the control's accessible name.
3. This defect is present in every supported locale including English, French, German, Japanese, Korean, and Spanish.

## Recommended change
Fix the string literal in `src/components/App.svelte` line 1385. Remove the `!` from inside the key string:
```svelte
aria-label={locale.t('header.locale.groupLabel')}
```

## Expected UX improvement
Screen readers will announce the correct accessible name ("Choose language" in English) for the locale selector, restoring basic accessibility for a globally visible control.
