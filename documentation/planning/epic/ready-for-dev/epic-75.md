## Epic 75 — Locale File Sync and Accessibility Defect Fixes

**Objective**
Repair three regressions that degrade the experience for assistive-technology users and non-English speakers: runtime locale `.ts` files missing five Forced Hero Team keys (showing raw key strings instead of translated text), a typoed key path that causes the locale `<select>` aria-label to announce a raw string to screen readers, and the absence of a skip-navigation link that forces keyboard users to tab through every header control on every page load.

**Background**
Epic 74 added `forcedTeam.*` locale strings to `.mjs` source files but the runtime import chain resolves from `.ts` files; the five keys were never added to any `.ts` catalog. Separately, a TypeScript non-null assertion operator (`!`) was accidentally embedded inside a string literal in `App.svelte`, producing the malformed key `header.locale!.groupLabel`, which is absent from every catalog — violating WCAG SC 4.1.2. The skip-navigation gap is a WCAG SC 2.4.1 deficiency that will worsen as more header controls are added.

**In scope**
- Adding the five `forcedTeam.*` keys (`newGame.forcedPicks.forcedTeam.label`, `.placeholder`, `.active`, `.clear`, `.unavailable`) to all six `.ts` locale files (`en.ts`, `fr.ts`, `de.ts`, `ja.ts`, `ko.ts`, `es.ts`) — Finding M1
- Reconciling the `.mjs`/`.ts` duplication risk so there is a clear single authoritative source for runtime locale content — Finding M1
- Correcting `App.svelte` line 1385 from `locale!.t('header.locale!.groupLabel')` to the correct key path so the locale `<select>` element receives a resolved `aria-label` — Finding M2
- Adding a visually-hidden `<a href="#main">Skip to main content</a>` as the first focusable element in the document; the link becomes visible on keyboard focus and moves focus to the main content landmark — Finding S1

**Out of scope**
- Adding translation quality review or professional translation for the new `forcedTeam.*` strings in non-English locales (machine-translated or placeholder values accepted for this epic; a separate localization pass is out of scope)
- Fixing any other missing locale keys beyond the five listed above
- Adding skip links to any modal dialogs or sub-panels (header-level skip link only)
- Modifying any other `aria-label` or WCAG attributes not described in M2

**Stories**
1. **Add the five missing `forcedTeam.*` keys to all six `.ts` runtime locale files**
2. **Reconcile the `.mjs`/`.ts` locale file duplication so `.ts` is unambiguously the runtime source**
3. **Fix the malformed aria-label key path on the locale `<select>` element in App.svelte**
4. **Add a visually-hidden skip-to-main-content link as the first focusable element in the header**

**Acceptance Criteria**
- Story 1: All five `forcedTeam.*` keys are present in `en.ts`, `fr.ts`, `de.ts`, `ja.ts`, `ko.ts`, and `es.ts`; the Forced Picks panel renders a translated string (not the raw key string) for every key in every locale; `npm run lint` passes.
- Story 2: A clear rule is established and implemented — either `.mjs` files are removed, generated from `.ts`, or explicitly marked as non-runtime — such that a new locale key added only to `.mjs` will not silently fall back to a raw key string at runtime; `npm run lint` passes.
- Story 3: The `aria-label` on the locale `<select>` element in `App.svelte` evaluates to the resolved locale string for `header.locale.groupLabel` (not the raw key `header.locale!.groupLabel`) in every locale; `npm run lint` passes.
- Story 4: A visually-hidden `<a href="#main">Skip to main content</a>` link is the first element reached by Tab key from the top of the page; the link becomes visible (not hidden) when it receives keyboard focus; activating the link moves focus to the element with `id="main"` or the main content landmark; the link is not visible to pointer users when not focused; `npm run lint` passes.
