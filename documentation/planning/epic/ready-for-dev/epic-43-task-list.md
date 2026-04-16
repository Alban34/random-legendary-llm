# Epic 43 — Expansion Attribution in History: Task List

## Story 43.1 — Resolve and display each entity's source expansion name in history records

- [ ] In `src/app/history-utils.mjs`, extend `formatHistorySummary` to derive `schemeSetName` from `indexes.setsById[scheme.setId]?.name || scheme.setId`
- [ ] In `src/app/history-utils.mjs`, extend `formatHistorySummary` to derive `heroSetNames` as an array by mapping each hero ID to `indexes.setsById[indexes.heroesById[id].setId]?.name || indexes.heroesById[id].setId`
- [ ] In `src/app/history-utils.mjs`, extend `formatHistorySummary` to derive `villainGroupSetNames` as an array by mapping each villain group ID to `indexes.setsById[indexes.villainGroupsById[id].setId]?.name || indexes.villainGroupsById[id].setId`
- [ ] In `src/app/history-utils.mjs`, extend `formatHistorySummary` to derive `henchmanGroupSetNames` as an array by mapping each henchman group ID to `indexes.setsById[indexes.henchmanGroupsById[id].setId]?.name || indexes.henchmanGroupsById[id].setId`
- [ ] In `src/components/HistoryTab.svelte`, update the mastermind `<summary>` line to render `summary.mastermindSetName` as an expansion label inline after the mastermind name (the value already exists in the summary object but is currently only used for group disambiguation)
- [ ] In `src/components/HistoryTab.svelte`, update the `history-meta` row for `history.scheme` to render `summary.schemeSetName` as an expansion label after the scheme name
- [ ] In `src/components/HistoryTab.svelte`, replace the `locale.formatList(summary.heroNames)` flat list in the `history.heroes` row with a structured per-hero rendering that pairs each name with its corresponding entry from `summary.heroSetNames`
- [ ] In `src/components/HistoryTab.svelte`, replace the `locale.formatList(summary.villainGroupNames)` flat list in the `history.villainGroups` row with a structured per-group rendering that pairs each name with its entry from `summary.villainGroupSetNames`
- [ ] In `src/components/HistoryTab.svelte`, replace the `locale.formatList(summary.henchmanGroupNames)` flat list in the `history.henchmanGroups` row with a structured per-group rendering that pairs each name with its entry from `summary.henchmanGroupSetNames`
- [ ] Test: Manually open the History tab with at least one persisted record and confirm that every entity row (mastermind, scheme, heroes, villain groups, henchman groups) displays a non-empty expansion name; confirm the stored record object in localStorage is unchanged after viewing
- [ ] QC (Automated): Run `node --test test/epic43-expansion-attribution.test.mjs` (see Story 43.3 for that file) and confirm all assertions pass with zero failures

## Story 43.2 — Apply a visually subordinate typographic style to the expansion label

- [ ] In `src/app/app-shell.css`, add a `.expansion-label` rule using the existing design tokens: `color: var(--muted)` and `font-size: var(--type-label-size)` so the label is visually subordinate without introducing new token values
- [ ] In `src/components/HistoryTab.svelte`, wrap every expansion name string in a `<span class="expansion-label">` element — one span per entity name, not one per row — for mastermind, scheme, each hero, each villain group, and each henchman group
- [ ] Verify that no extra `margin`, `padding`, or `display` property on `.expansion-label` alters the vertical rhythm of adjacent `.history-meta` rows (the rule should remain inline-level)
- [ ] Test: Visually inspect the rendered History tab in both light and dark themes and confirm the expansion label is clearly subordinate to the card name, legible, and does not disrupt row spacing; check at a narrow (mobile) viewport as well
- [ ] QC (Automated): Run `npm run lint` and confirm no new CSS or Svelte linting errors are introduced by the `.expansion-label` class or its usage in `HistoryTab.svelte`

## Story 43.3 — Verify expansion attribution renders correctly for all entity types across all stored history records

- [ ] Create `test/epic43-expansion-attribution.test.mjs` following the same scaffolding pattern as `test/epic12-score-history.test.mjs`: import `createEpic1Bundle` from `src/app/game-data-pipeline.mjs`, `formatHistorySummary` from `src/app/history-utils.mjs`, and load `src/data/canonical-game-data.json` in a `before` hook
- [ ] Add a test that calls `formatHistorySummary` on a sample setup record and asserts that `summary.mastermindSetName` is a non-empty string and equals `bundle.runtime.indexes.setsById[mastermind.setId].name`
- [ ] Add a test that asserts `summary.schemeSetName` is a non-empty string and equals the set name looked up from the scheme's `setId` in `indexes.setsById`
- [ ] Add a test that asserts `summary.heroSetNames` is an array of the same length as `summary.heroNames` and every entry is a non-empty string with no element equal to `undefined`, `null`, or the literal string `"unknown"`
- [ ] Add a test that asserts `summary.villainGroupSetNames` is an array of the same length as `summary.villainGroupNames` and every entry is a non-empty, non-null, non-`"unknown"` string
- [ ] Add a test that asserts `summary.henchmanGroupSetNames` is an array of the same length as `summary.henchmanGroupNames` and every entry is a non-empty, non-null, non-`"unknown"` string
- [ ] Add a test that constructs three sample setups using different offsets (e.g., `createSampleSetup(0)`, `createSampleSetup(1)`, `createSampleSetup(2)`) and asserts that all five expansion name fields are populated and correct for each, covering variance across the catalog
- [ ] Test: Run the test file in isolation with `node --test test/epic43-expansion-attribution.test.mjs` and confirm all cases pass before handing off to QC
- [ ] QC (Automated): Run `node --test test/epic43-expansion-attribution.test.mjs` as the story-specific automated check; also run `node --test test/epic12-score-history.test.mjs` to confirm no regression in `formatHistorySummary` behaviour introduced by the new fields
