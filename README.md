# Legendary: Marvel Randomizer

STATUS: Approved

## Project state

The repository now contains the **full implementation through Epic 28**, plus the Svelte 5 migration (Epics 29–33), including post-v1 updates for alternate play modes, score logging, backup portability, insights, forced picks, onboarding, theming, interface localization, grouped history, and classification corrections.

Current status:
- Epic 10 release readiness is complete and remains covered by documentation-alignment automation
- Epics 1 through 28 are implemented, along with Svelte 5 migration Epics 29–33
- Node-based automated tests cover the current shipped runtime modules and documentation contracts
- Playwright browser QC covers the current shipped user flows, including localization switching and fallback behavior

Implemented so far:
- canonical seed data under `src/data/`
- shared normalization and validation logic under `src/app/`
- versioned browser-state persistence under `src/app/state-store.mjs`
- a persisted theme switcher plus a persisted language selector with built-in support for English (en-US), French (fr-FR), German (de-DE), Japanese (ja-JP), Korean (ko-KR), and Spanish (es-ES)
- versioned backup export/import utilities under `src/app/backup-utils.mjs`
- switchable History grouping modes: by mastermind, scheme, heroes, villain groups, or play mode
- setup templates and generation logic under `src/app/setup-rules.mjs` and `src/app/setup-generator.mjs`
- shared tab-shell metadata and navigation helpers under `src/app/app-tabs.mjs`
- Browse filtering/detail helpers under `src/app/browse-utils.mjs`
- Collection grouping/totals/feasibility helpers under `src/app/collection-utils.mjs`
- New Game display/control helpers under `src/app/new-game-utils.mjs`
- History/usage/reset helpers under `src/app/history-utils.mjs`
- notification/toast helpers under `src/app/feedback-utils.mjs`
- a tabbed `index.html` shell for the browser app with Browse, Collection, New Game, History, Backup, notifications, reset confirmation, and accessibility support
- npm-based automated tests under `test/` covering Epics 1–28 and Svelte migration Epics 29–33
- Playwright browser QC coverage for the current shipped user flows under `test/playwright/`
- a data-foundation summary reporter under `tools/`

The app remains **fully static**:
- no server-side code
- built with Vite and the Svelte 5 plugin; output in `dist/` can be hosted by any static HTTP server

---

## Current architecture direction

The project is now a **single-page app served as static files**, rather than a single monolithic HTML file.

Current entry points:
- `index.html` — browser shell
- `src/app/app-shell.css` — application shell styles
- `src/app/browser-entry.mjs` — mounts the root `App.svelte` component via Svelte 5 `mount()`
- `src/app/game-data-pipeline.mjs` — canonical-data transformation, normalization, validation, and Epic 1 checks
- `src/app/state-store.mjs` — versioned browser-state creation, hydration, persistence, history, and reset helpers
- `src/app/state-store.svelte.js` — Svelte 5 reactive wrapper; `_appState` backed by `$state`
- `src/components/App.svelte` — root Svelte 5 component; owns viewModel `$state`, mounts the app shell and all tabs
- `src/app/setup-rules.mjs` — player-count templates and active-mode resolution
- `src/app/setup-generator.mjs` — legality checks, freshness ranking, forced-group handling, and setup generation
- `src/app/app-tabs.mjs` — tab metadata, default-tab selection, and keyboard navigation order
- `src/app/app-renderer.mjs` — transitional render helpers used via `{@html}` blocks inside Svelte tab components
- `src/data/canonical-game-data.json` — project-owned canonical game data asset

This keeps the app easy to host statically while making Epic 2+ work much easier to maintain and test.

---

## Use the app

Typical flow:

1. Open the app through a static HTTP server.
2. Use the first-run walkthrough if needed, then use the shared header controls to choose your preferred language and theme.
3. Use the **Browse** tab to inspect included sets, replay onboarding, open About, and add sets to your collection.
4. Review totals and legality warnings in **Collection**.
5. Go to **New Game** to choose player count, optionally enable Advanced Solo for 1 player, then **Generate Setup**.
6. Use **Regenerate** as much as you want without changing persisted history or usage.
7. Use **Accept & Log** when you want the current setup to count toward usage tracking and game history, then complete or skip the immediate result-entry editor.
8. Review accepted games in **History**, regroup them by mastermind, scheme, heroes, villain groups, or play mode, edit pending or completed results, and inspect insights after the grouped history list.
9. Use **Backup** to export a portable JSON backup, reset usage buckets, or import one with Merge or Replace restore modes.

Important behavior:
- **Generate** and **Regenerate** are ephemeral; they do not change persisted state
- **Accept & Log** updates usage statistics and appends a history record
- if browser storage is unavailable, the app stays usable in-memory for the current session and shows a warning

---

## Persistence, reset behavior, and current limitations

Persisted data:
- the app stores one versioned root state object in browser storage under `legendary_state_v1`
- that state contains collection ownership, usage statistics, accepted game history, and preferences
- preferences now include the active theme and locale so the shared header controls restore on reload without leaving the shell in a mixed state longer than necessary
- the **Backup** tab can export the persistent data above as a versioned JSON backup and later import it with either **Merge** or **Replace** restore modes

Reset behavior:
- **Reset All Selections** in **Collection** clears owned sets only
- **Reset Heroes / Masterminds / Villain Groups / Henchman Groups / Schemes** in **Backup** clear only the selected usage bucket
- **Full Reset — Clear all data** clears collection, usage, history, and preferences only after confirmation

Current V1 limitations:
- hero tracking is at the hero-deck level, not per individual card
- the app must be opened through a static HTTP server rather than `file://`
- browser QC is automated in Chromium via Playwright; runtime behavior targets modern browsers with graceful degradation when storage is unavailable

---

## Run the app locally

Because the app now loads ES modules and JSON assets, open it through a static HTTP server rather than `file://`.

Preferred dev command with Node:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run dev
```

Then open:

```text
http://127.0.0.1:8000/
```

Optional port override:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run dev -- --port 8123
```

Fallback example with Python:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

---

## Run validation checks

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic1
```

Run the full npm test suite:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm test
```

Run the Epic 2 state-management checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic2
```

Run the Epic 3 setup-generation checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic3
```

Run the Epic 4 shell and navigation checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic4
```

Run the Epic 5 Browse checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic5
```

Run the Epic 6 Collection checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic6
```

Run the Epic 7 New Game checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic7
```

Run the Epic 8 History/Reset checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic8
```

Run the Epic 9 Notifications/Error Handling/Accessibility checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic9
```

Run the Epic 9 browser QC only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:qc:epic9
```

Run the Epic 10 documentation/release-readiness checks only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic10
```

Run the Epic 10 browser QC only:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:qc:epic10
```

Run the browser QC suite for Epic 1–10:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:qc
```

Run the same browser QC suite in headed mode:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run test:qc:headed
```

Optional human-readable Epic 1 data summary reporter:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run report:epic1
```

Optional shell refresh:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
python3 ./tools/build_epic1_index.py
```

Optional seed rebuild (expects the upstream source file path or `LEGENDARY_SOURCE_CARD_DB`):

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
python3 ./tools/build_epic1_seed.py
```

---

## Documentation index

Project documentation lives in `documentation/`.

- `documentation/create-project.md` — original brief plus implementation-direction addendum
- `documentation/sources.md` — authoritative external reference sources
- `documentation/architecture.md` — runtime architecture and module boundaries
- `documentation/roadmap.md` — implementation roadmap
- `documentation/data-model.md` — data and local storage specification
- `documentation/setup-rules.md` — setup rules and randomization rules
- `documentation/ui-design.md` — visual design and user flows
- `documentation/game-data.md` — human-readable data scope summary
- `documentation/game-data-normalized.md` — BGG-derived normalized inventory
- `documentation/clarifications.md` — clarification record and final decisions
- `documentation/epics.md` — implementation epics and stories
- `documentation/task-list.md` — checkable implementation tracker
- `documentation/testing-qc-strategy.md` — testing and quality-control policy
- `documentation/_next-steps.md` — post-V1 ideas and future enhancements

---

## Current release status

Epic 1 through Epic 10 are implemented, documented, and covered by automated logic tests plus browser QC, and Epic 10 release readiness remains complete in the shipped baseline.

For future enhancements beyond the current release, see `documentation/_next-steps.md`.
