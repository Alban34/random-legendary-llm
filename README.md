# Legendary: Marvel Randomizer

STATUS: Approved

## Project state

The repository now contains the **Epic 1 + Epic 2 + Epic 3 implementation foundation** for the Legendary: Marvel randomizer.

Current status:
- Epic 1 implementation, tests, and QC are complete
- Epic 2 implementation and automated tests are in place
- Epic 2 manual QC checklist items should still be reflected in `documentation/task-list.md`
- Epic 3 implementation and automated tests are in place
- Epic 3 manual QC checklist items are still pending in `documentation/task-list.md`

Implemented so far:
- canonical seed data under `src/data/`
- shared normalization and validation logic under `src/app/`
- versioned browser-state persistence under `src/app/state-store.mjs`
- setup templates and generation logic under `src/app/setup-rules.mjs` and `src/app/setup-generator.mjs`
- a thin `index.html` shell for the browser app
- npm-based Epic 1 + Epic 2 + Epic 3 tests under `test/`
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
- `src/app/app-renderer.mjs` — browser rendering for the current foundation screen
- `src/data/canonical-game-data.json` — project-owned canonical game data asset

This keeps the app easy to host statically while making Epic 2+ work much easier to maintain and test.

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

---

## Next step

With Epic 1, Epic 2, and Epic 3 implemented in code, the next major implementation target is **Epic 4 — Application Shell and Navigation**.

Before closing Epic 3 completely, the remaining manual QC items in `documentation/task-list.md` should still be exercised in the browser.
