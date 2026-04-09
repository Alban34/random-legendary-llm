# Legendary: Marvel Randomizer

STATUS: Approved

## Project state

The repository now contains the **Epic 1 foundation** for the Legendary: Marvel randomizer.

Implemented so far:
- canonical seed data under `src/data/`
- shared normalization and validation logic under `src/app/`
- a thin `index.html` shell for the browser app
- an Epic 1 terminal test harness under `tools/`

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

## Run Epic 1 checks

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm run check:epic1
```

Run the full npm test suite:

```sh
cd "/Users/afayard1/Projects/random-legendary-llm"
npm test
```

Optional human-readable summary reporter:

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

With Epic 1 stabilized under the new static-hosted structure, the next major implementation target is **Epic 2 — State Management and Persistence**.
