# Defect Fix Log — v1.0.4

Tracks all confirmed defects identified for the v1.0.4 release, their root cause, and fix status.

---

## Defects

- [x] **Advanced Solo setup counts were wrong**
  - **Symptom:** The generator used 4 heroes and 2 villain groups for Advanced Solo, matching a 2-player game.
  - **Root cause:** The original `SETUP_RULES` entry for `1-advanced` was assumed from the base game rules and never verified against the Dark City rulebook. Per the Dark City rulebook, Advanced Solo uses the same card counts as Standard Solo (3 heroes, 1 villain group) — only the Master Strike deck count differs, which the randomizer does not control.
  - **Files changed:** `src/app/setup-rules.mjs`, `documentation/architecture/setup-rules.md`, `README.md`, `test/epic3-setup-generator.test.mjs`, `test/epic11-play-modes.test.mjs`, `test/playwright/epic3-qc.spec.mjs`
  - **Fixed:** 2026-04-18
