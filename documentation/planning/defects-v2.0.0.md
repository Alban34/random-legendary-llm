# Defect Fix Log — v2.0.0

Tracks all confirmed defects identified for the v2.0.0 release, their root cause, and fix status.

---

## Defects

- [x] Always lead should not apply in solo mode
  - **Root cause:** `resolveForcedCollections` in `src/app/setup-generator.mjs` unconditionally forced the mastermind's lead group into the setup regardless of play mode.
  - **Fix:** Added `SOLO_PLAY_MODES` constant and guarded the `mastermind.lead` block so it is skipped when `template.playMode` is `'advanced-solo'`, `'two-handed-solo'`, or `'standard-solo-v2'`. Files changed: `src/app/setup-generator.mjs`. Verified: 359/359 tests pass.

- [x] Ant-Man and the Wasp is a small expansion
  - **Root cause:** The set's `type` field was set to `"large-expansion"` in `src/data/canonical-game-data.json`.
  - **Fix:** Changed `"type"` from `"large-expansion"` to `"small-expansion"`. Files changed: `src/data/canonical-game-data.json`. Verified: 359/359 tests pass.
