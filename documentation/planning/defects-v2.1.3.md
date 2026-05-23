# Defect Fix Log — v2.1.3

Tracks all confirmed defects identified for the v2.1.3 release, their root cause, and fix status.

---

## Defects

- [x] Hank Pym, Yellowjacket mastermind displayed an incorrect forced villain group lead
  - **Root cause:** The `"leadName": "Black Order Guards"` and `"leadCategory": "villains"` fields were incorrectly present in the "Hank Pym, Yellowjacket" mastermind entry in `src/data/canonical-game-data.json`. Cross-referencing the *Marvel Studios' What If…?* expansion rulebook and the BGG canonical reference confirmed that this mastermind has no forced villain group lead.
  - **Fix:** Removed `"leadName"` and `"leadCategory"` from the "Hank Pym, Yellowjacket" entry in `src/data/canonical-game-data.json`. A regression test verifying the mastermind carries no forced lead was added in `src/app/setup-generator.test.ts`. Files changed: `src/data/canonical-game-data.json`, `src/app/setup-generator.test.ts`. Verified: all tests pass.
