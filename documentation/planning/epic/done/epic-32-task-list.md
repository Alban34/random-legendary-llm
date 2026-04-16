## Epic 32 — Feature Tab Components Migration

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 32 work complete

### Story 32.1 — Convert Browse tab to `BrowseTab.svelte`
- [x] Create `src/components/BrowseTab.svelte` with reactive search filtering and ownership toggle state
- [ ] Remove or archive Browse-specific rendering functions from `app-renderer.mjs`
- [ ] **Test:** verify set grid renders, filtering works, and ownership toggles persist after the migration
- [ ] **QC (Automated):** run Playwright Browse tab tests and confirm zero failures

### Story 32.2 — Convert Collection tab to `CollectionTab.svelte`
- [x] Create `src/components/CollectionTab.svelte` with reactive ownership state mirroring Browse
- [x] Preserve category totals, capacity indicators, and collection reset with confirmation
- [ ] **Test:** verify ownership state mirrors Browse and collection reset works as before
- [ ] **QC (Automated):** run Playwright collection tab tests and confirm zero failures

### Story 32.3 — Convert New Game tab to `NewGameTab.svelte`
- [x] Create `src/components/NewGameTab.svelte` with reactive setup generation, player-count controls, and Accept & Log
- [x] Preserve Regenerate (ephemeral) and Accept & Log (committed) behavior exactly
- [ ] **Test:** verify setup generation, player count selection, and game logging work correctly after migration
- [ ] **QC (Automated):** run Playwright New Game tab tests and confirm zero failures

### Story 32.4 — Convert History tab to `HistoryTab.svelte`
- [x] Create `src/components/HistoryTab.svelte` with reactive record expansion and result editing
- [x] Preserve newest-first ordering and grouping controls
- [ ] **Test:** verify history renders in newest-first order and record editing actions remain functional
- [ ] **QC (Automated):** run Playwright History tab tests and confirm zero failures

### Story 32.5 — Convert Backup tab to `BackupTab.svelte`
- [x] Create `src/components/BackupTab.svelte` with reactive usage panels and collapsible sections (note: actual tab id is `backup`, not `stats`)
- [x] Preserve all reset actions and panel collapse behavior
- [ ] **Test:** verify backup/stats panels display correctly and reset actions work as before
- [ ] **QC (Automated):** run Playwright Stats/Backup tab tests and confirm zero failures

### Story 32.6 — Full Playwright suite confirmation after all tabs migrated
- [ ] Run `npx playwright test` with all feature tab components in place
- [ ] Fix any remaining selector or behavior regressions introduced by the migration
- [ ] **Test:** verify `npx playwright test` exits with zero failures after all six components are complete
- [ ] **QC (Automated):** run `npm test` and `npx playwright test` and assert both pass cleanly at the Epic 32 boundary

---
