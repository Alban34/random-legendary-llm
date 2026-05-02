# Epic 75 — Locale File Sync and Accessibility Defect Fixes: Task List

## Story 1 — Add the five missing `forcedTeam.*` keys to all six `.ts` runtime locale files

The five keys were added to all six `.mjs` locale files as part of Epic 74 but were never ported to
the corresponding `.ts` files. Because `localization-utils.ts` imports exclusively from the `.ts`
files, the Forced Picks panel falls back to raw key strings at runtime for all locales.

Insertion point in every file: immediately after `'newGame.forcedPicks.preferredExpansion.unavailable'`
and before `'newGame.activeFilter.title'`.

- [ ] In `src/app/locales/en.ts`: after line 156 (`'newGame.forcedPicks.preferredExpansion.unavailable'`), add:
  ```ts
  'newGame.forcedPicks.forcedTeam.label': 'Forced team',
  'newGame.forcedPicks.forcedTeam.placeholder': 'None (all teams eligible)',
  'newGame.forcedPicks.forcedTeam.active': 'Forced team: {name}',
  'newGame.forcedPicks.forcedTeam.clear': 'Clear forced team',
  'newGame.forcedPicks.forcedTeam.unavailable': 'No heroes in the active collection have a team affiliation',
  ```
- [ ] In `src/app/locales/fr.ts`: after the `'newGame.forcedPicks.preferredExpansion.unavailable'` line, add:
  ```ts
  'newGame.forcedPicks.forcedTeam.label': 'Équipe forcée',
  'newGame.forcedPicks.forcedTeam.placeholder': 'Aucune (toutes les équipes éligibles)',
  'newGame.forcedPicks.forcedTeam.active': 'Équipe forcée : {name}',
  'newGame.forcedPicks.forcedTeam.clear': 'Effacer l\'équipe forcée',
  'newGame.forcedPicks.forcedTeam.unavailable': 'Aucun héros de la collection active n\'appartient à une équipe',
  ```
- [ ] In `src/app/locales/de.ts`: after the `'newGame.forcedPicks.preferredExpansion.unavailable'` line, add:
  ```ts
  'newGame.forcedPicks.forcedTeam.label': 'Erzwungenes Team',
  'newGame.forcedPicks.forcedTeam.placeholder': 'Keins (alle Teams wählbar)',
  'newGame.forcedPicks.forcedTeam.active': 'Erzwungenes Team: {name}',
  'newGame.forcedPicks.forcedTeam.clear': 'Erzwungenes Team löschen',
  'newGame.forcedPicks.forcedTeam.unavailable': 'Kein Held in der aktiven Sammlung hat eine Teamzugehörigkeit',
  ```
- [ ] In `src/app/locales/ja.ts`: after the `'newGame.forcedPicks.preferredExpansion.unavailable'` line, add:
  ```ts
  'newGame.forcedPicks.forcedTeam.label': 'チーム固定',
  'newGame.forcedPicks.forcedTeam.placeholder': 'なし（すべてのチームが対象）',
  'newGame.forcedPicks.forcedTeam.active': 'チーム固定: {name}',
  'newGame.forcedPicks.forcedTeam.clear': 'チーム固定をクリア',
  'newGame.forcedPicks.forcedTeam.unavailable': '有効なコレクション内のヒーローにチーム所属がありません',
  ```
- [ ] In `src/app/locales/ko.ts`: after the `'newGame.forcedPicks.preferredExpansion.unavailable'` line, add:
  ```ts
  'newGame.forcedPicks.forcedTeam.label': '강제 팀',
  'newGame.forcedPicks.forcedTeam.placeholder': '없음 (모든 팀 선택 가능)',
  'newGame.forcedPicks.forcedTeam.active': '강제 팀: {name}',
  'newGame.forcedPicks.forcedTeam.clear': '강제 팀 지우기',
  'newGame.forcedPicks.forcedTeam.unavailable': '활성 컬렉션의 히어로 중 팀 소속이 있는 히어로가 없습니다',
  ```
- [ ] In `src/app/locales/es.ts`: after the `'newGame.forcedPicks.preferredExpansion.unavailable'` line, add:
  ```ts
  'newGame.forcedPicks.forcedTeam.label': 'Equipo forzado',
  'newGame.forcedPicks.forcedTeam.placeholder': 'Ninguno (todos los equipos disponibles)',
  'newGame.forcedPicks.forcedTeam.active': 'Equipo forzado: {name}',
  'newGame.forcedPicks.forcedTeam.clear': 'Borrar equipo forzado',
  'newGame.forcedPicks.forcedTeam.unavailable': 'Ningún héroe de la colección activa tiene afiliación a un equipo',
  ```
- [ ] Test: open the New Game tab with a collection that includes heroes with team affiliations; confirm the Forced Picks panel renders "Forced team" (or the equivalent translated label) as the dropdown label rather than the raw key string `newGame.forcedPicks.forcedTeam.label`; repeat with the locale set to fr, de, ja, ko, and es to confirm each respective translation appears.
- [ ] QC (Automated): run `npm run lint` and the story-1 targeted tests in `test/epic75-locale-sync-a11y.test.mjs`

---

## Story 2 — Reconcile the `.mjs`/`.ts` locale file duplication so `.ts` is unambiguously the runtime source

**Context:** `localization-utils.ts` imports from `locales/*.ts` (the runtime path used by the Svelte
app); `localization-utils.mjs` imports from `locales/*.mjs` (used by `.mjs` utility modules such as
`result-utils.mjs` and `state-store.mjs`, which are imported directly by Node-based vitest tests).
Both file families must therefore be kept in sync — removing either set would break either the app or
the tests. The root cause of the Epic 74 regression is that Story 2 of Epic 74 added the five
`forcedTeam.*` keys only to the `.mjs` files, leaving the `.ts` files stale.

**Chosen approach:** Add a dedicated Vitest key-parity test and add a canonical-source comment header
to every `.mjs` locale file so the two-file rule is visible to future contributors.

- [ ] In `test/epic75-locale-sync-a11y.test.mjs`: add a Vitest test named `'All .ts and .mjs locale files expose identical key sets'` that:
  1. Imports `EN_MESSAGES`, `FR_MESSAGES`, `DE_MESSAGES`, `JA_MESSAGES`, `KO_MESSAGES`, `ES_MESSAGES` from the six `.ts` locale files.
  2. Imports the same six named exports from the six `.mjs` locale files.
  3. For each locale, asserts that `Object.keys(X_MESSAGES_TS).sort()` deep-equals `Object.keys(X_MESSAGES_MJS).sort()`, printing a diff of any missing or extra keys when the assertion fails.
- [ ] In `src/app/locales/en.mjs`: add the following comment block as the very first line (before the `export` statement):
  ```js
  // ⚠ MIRROR FILE — do not edit in isolation.
  // The canonical source is en.ts. This .mjs file mirrors it for the Node test environment
  // (localization-utils.mjs → state-store.mjs → vitest tests).
  // When adding or removing keys in en.ts, make the identical change here.
  ```
- [ ] Repeat the same four-line comment block at the top of `src/app/locales/fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, and `es.mjs` (substituting the locale code in the comment text).
- [ ] Test: confirm the new key-parity test passes with `npm test` (or `npx vitest run test/epic75-locale-sync-a11y.test.mjs`) after Story 1 keys have been added to all `.ts` files; confirm it fails if a key is temporarily removed from one `.ts` file.
- [ ] QC (Automated): run `npm run lint` and the story-2 targeted tests in `test/epic75-locale-sync-a11y.test.mjs`

---

## Story 3 — Fix the malformed `aria-label` key path on the locale `<select>` element in App.svelte

**Context:** Line 1385 of `src/components/App.svelte` reads
`aria-label={locale!.t('header.locale!.groupLabel')}`. The `!` after `locale` is valid TypeScript
non-null assertion syntax on the variable, but the exclamation mark was accidentally copied into the
_string key argument_, producing the invalid key `'header.locale!.groupLabel'`. Because no such key
exists, `t()` returns the raw key string at runtime instead of the resolved label. The correct key is
`'header.locale.groupLabel'` (already present in all six `.ts` locale files).

- [ ] In `src/components/App.svelte` at line 1385: change
  ```svelte
  aria-label={locale!.t('header.locale!.groupLabel')}
  ```
  to
  ```svelte
  aria-label={locale!.t('header.locale.groupLabel')}
  ```
- [ ] Test: with any locale active, inspect the rendered `<select id="header-locale-select">` element in DevTools and confirm its `aria-label` attribute equals the resolved string for `header.locale.groupLabel` (e.g. `"Choose language"` in English, `"Choisir la langue"` in French) rather than the raw key string `"header.locale!.groupLabel"`.
- [ ] QC (Automated): run `npm run lint` and the story-3 targeted tests in `test/epic75-locale-sync-a11y.test.mjs`

---

## Story 4 — Add a visually-hidden skip-to-main-content link as the first focusable element in the header

**Context:** There is no existing skip link in any of the three conditional `<header>` blocks in
`src/components/App.svelte`. The `.visually-hidden` CSS class exists in `app-shell.css` but has no
`:focus` exception, so it cannot be reused as-is for a skip link. The three `<main class="app-main">`
elements (lines 1351, 1436, 1588) have no `id` attribute; the skip link target requires `id="main"`
on the primary loaded-state `<main>`.

- [ ] In `src/app/locales/en.ts`: after `'header.theme.groupLabel': 'Choose theme',` (line 14), add:
  ```ts
  'header.skipToMain': 'Skip to main content',
  ```
- [ ] In `src/app/locales/fr.ts`: after the `'header.theme.groupLabel'` line, add:
  ```ts
  'header.skipToMain': 'Aller au contenu principal',
  ```
- [ ] In `src/app/locales/de.ts`: after the `'header.theme.groupLabel'` line, add:
  ```ts
  'header.skipToMain': 'Zum Hauptinhalt springen',
  ```
- [ ] In `src/app/locales/ja.ts`: after the `'header.theme.groupLabel'` line, add:
  ```ts
  'header.skipToMain': 'メインコンテンツへスキップ',
  ```
- [ ] In `src/app/locales/ko.ts`: after the `'header.theme.groupLabel'` line, add:
  ```ts
  'header.skipToMain': '본문으로 이동',
  ```
- [ ] In `src/app/locales/es.ts`: after the `'header.theme.groupLabel'` line, add:
  ```ts
  'header.skipToMain': 'Saltar al contenido principal',
  ```
- [ ] In each of `src/app/locales/en.mjs`, `fr.mjs`, `de.mjs`, `ja.mjs`, `ko.mjs`, `es.mjs`: add the matching `'header.skipToMain'` key with the same translated value, after the `'header.theme.groupLabel'` entry, to keep the `.mjs` mirror in sync (required to pass the Story 2 key-parity test).
- [ ] In `src/app/app-shell.css`: add a `.skip-link` rule block immediately after the existing `.visually-hidden` rule:
  ```css
  .skip-link {
    position: absolute;
    top: -9999px;
    left: 0;
    z-index: 9999;
    padding: 0.5rem 1rem;
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-weight: 600;
    border: 2px solid var(--color-accent);
    border-radius: var(--radius-sm, 4px);
    text-decoration: none;
    white-space: nowrap;
  }

  .skip-link:focus {
    top: 0.5rem;
    left: 0.5rem;
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
  ```
- [ ] In `src/components/App.svelte` inside the `{:else if isLoaded}` block (line 1369): add the skip link as the very first child of `<header class="app-header" data-onboarding-visible={...}>`, before `<div class="header-inner">`:
  ```svelte
  <a href="#main" class="skip-link">{locale!.t('header.skipToMain')}</a>
  ```
- [ ] In `src/components/App.svelte` inside the `{:else if isLoaded}` block: add `id="main"` to `<main class="app-main">` (line 1436) so the skip link target resolves:
  ```svelte
  <main id="main" class="app-main">
  ```
- [ ] Test: tab to the skip link from the browser address bar and confirm it becomes visible (not clipped); press Enter and confirm focus moves to the `<main id="main">` landmark; confirm the skip link is not visible on mouse hover without focus; confirm `aria-label` and tab order are unaffected for all subsequent header controls; confirm the Playwright a11y snapshot for the header contains `[data-skip-link]` as the first focusable element (add `data-skip-link` attribute to the `<a>` for easier selector targeting).
- [ ] QC (Automated): run `npm run lint` and the story-4 targeted tests in `test/epic75-locale-sync-a11y.test.mjs`
