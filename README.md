# Legendary: Marvel Randomizer

STATUS: Approved

## Project state

The repository now contains the **Epic 1 through Epic 10 implementation, documentation, and release-readiness pass** for the Legendary: Marvel randomizer.

Current status:
- Epic 1 implementation, tests, and browser QC automation are complete
- Epic 2 implementation, automated tests, and browser QC automation are complete
- Epic 3 implementation, automated tests, and browser QC automation are complete
- Epic 4 implementation, automated tests, and browser QC automation are complete
- Epic 5 Browse implementation, automated tests, and browser QC automation are complete
- Epic 6 Collection implementation, automated tests, and browser QC automation are complete
- Epic 7 New Game implementation, automated tests, and browser QC automation are complete
- Epic 8 History/Usage/Reset implementation, automated tests, and browser QC automation are complete
- Epic 9 Notifications/Error Handling/Accessibility implementation, automated tests, and browser QC automation are complete
- Epic 10 Final Documentation/Release Readiness updates, automated tests, and browser QC automation are complete

Implemented so far:
- canonical seed data under `src/data/`
- shared normalization and validation logic under `src/app/`
- versioned browser-state persistence under `src/app/state-store.mjs`
- a persisted theme switcher with the built-in Midnight and Newsprint themes
- setup templates and generation logic under `src/app/setup-rules.mjs` and `src/app/setup-generator.mjs`
- shared tab-shell metadata and navigation helpers under `src/app/app-tabs.mjs`
- Browse filtering/detail helpers under `src/app/browse-utils.mjs`
- Collection grouping/totals/feasibility helpers under `src/app/collection-utils.mjs`
- New Game display/control helpers under `src/app/new-game-utils.mjs`
- History/usage/reset helpers under `src/app/history-utils.mjs`
- notification/toast helpers under `src/app/feedback-utils.mjs`
- a tabbed `index.html` shell for the browser app with Browse, Collection, New Game, History, notifications, reset confirmation, and accessibility support
- npm-based Epic 1 through Epic 10 tests under `test/`
- Playwright browser QC coverage for the Epic 1 through Epic 10 flows under `test/playwright/`
- a data-foundation summary reporter under `tools/`

The app remains **fully static**:
- no server-side code
- no framework build step
- can be hosted by any static HTTP server

---

## Current architecture direction

The project is now a **single-page app served as static files**, rather than a single monolithic HTML file.

Current entry points:
- `index.html` — browser shell
- `src/app/app-shell.css` — application shell styles
- `src/app/browser-entry.mjs` — browser bootstrap entry
- `src/app/game-data-pipeline.mjs` — canonical-data transformation, normalization, validation, and Epic 1 checks
- `src/app/state-store.mjs` — versioned browser-state creation, hydration, persistence, history, and reset helpers
- `src/app/setup-rules.mjs` — player-count templates and active-mode resolution
- `src/app/setup-generator.mjs` — legality checks, freshness ranking, forced-group handling, and setup generation
- `src/app/app-tabs.mjs` — tab metadata, default-tab selection, and keyboard navigation order
- `src/app/app-renderer.mjs` — browser rendering for the current foundation screen
- `src/data/canonical-game-data.json` — project-owned canonical game data asset

This keeps the app easy to host statically while making Epic 2+ work much easier to maintain and test.

---

## Use the app

Typical flow:

1. Open the app through a static HTTP server.
2. Use the **Browse** tab to inspect included sets and add them to your collection.
3. Review totals and legality warnings in **Collection**.
4. Go to **New Game** to choose player count, optionally enable Advanced Solo for 1 player, then **Generate Setup**.
5. Use **Regenerate** as much as you want without changing persisted history or usage.
6. Use **Accept & Log** when you want the current setup to count toward usage tracking and game history.
7. Review accepted games and reset actions from **History**.

Important behavior:
- **Generate** and **Regenerate** are ephemeral; they do not change persisted state
- **Accept & Log** updates usage statistics and appends a history record
- if browser storage is unavailable, the app stays usable in-memory for the current session and shows a warning

---

## Persistence, reset behavior, and current limitations

Persisted data:
- the app stores one versioned root state object in browser storage under `legendary_state_v1`
- that state contains collection ownership, usage statistics, accepted game history, and preferences
- preferences now include the active theme so the theme switcher restores on reload without a visible restyle flash in normal browser conditions

Reset behavior:
- **Reset All Selections** in **Collection** clears owned sets only
- **Reset Heroes / Masterminds / Villain Groups / Henchman Groups / Schemes** in **History** clear only the selected usage bucket
- **Full Reset — Clear all data** clears collection, usage, history, and preferences only after confirmation

Current V1 limitations:
- no export/import workflow yet
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

Epic 1 through Epic 10 are implemented, documented, and covered by automated logic tests plus browser QC.

For future enhancements beyond the current release, see `documentation/_next-steps.md`.
