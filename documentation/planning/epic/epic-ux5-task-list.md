## Epic UX5 — History as Logbook First, Insights Second

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX5 work complete

### Story UX5.1 — Reorder the History page so grouped records appear before analytics on desktop
- [x] Redesign the desktop History layout so grouped records and their actions sit above insights
- [x] Preserve clear access to grouping controls and result-edit actions in the reordered layout
- [x] Ensure insights remain available without dominating the first viewport
- [x] Validate the revised layout with light and heavy history datasets
- [x] **Test:** verify desktop History shows record review above analytics while keeping all current actions usable
- [x] **QC (Automated):** add desktop browser QC that asserts record sections appear before the insights stack

### Story UX5.2 — Design a mobile-specific History layout that keeps record review dominant
- [x] Define a phone-first History hierarchy that prioritizes recent records and editability
- [x] Reduce the chance that a single record is immediately followed by an oversized analytics stack
- [x] Keep grouping controls understandable without pushing records too far down the screen
- [x] Validate the mobile History layout across sparse and dense history states
- [x] **Test:** verify mobile History exposes multiple recent records before deep analytics take over the page
- [x] **QC (Automated):** add mobile browser QC for record-first History ordering and scroll behavior

### Story UX5.3 — Move insights behind a collapsible, secondary, or companion presentation when appropriate
- [x] Decide the presentation model for insights after the rebalance: collapsed section, secondary tab, companion area, or explicit reveal
- [x] Implement the chosen reveal model without breaking current stats calculations
- [x] Preserve accessibility and discoverability for users who intentionally want insight analysis
- [x] Ensure the reveal model scales from empty states to heavy data states cleanly
- [x] **Test:** verify insights remain available and correct while no longer dominating the primary History scan path
- [x] **QC (Automated):** add browser QC for opening, closing, or navigating to the revised insights presentation

### Story UX5.4 — Clarify the relationship between grouping controls, record actions, and deeper statistics
- [x] Refine History labels and helper copy so grouping is clearly about presentation, not data mutation
- [x] Ensure record actions such as add result, edit result, and expand/collapse remain prominent after the layout change
- [x] Reduce or rewrite explanatory copy that currently competes with the record list
- [x] Confirm users can understand where to review records versus where to analyze trends
- [x] **Test:** verify grouping, record editing, and insights remain understandable after the hierarchy changes
- [x] **QC (Automated):** add browser QC for clear grouping-copy behavior and stable record-action discoverability

### Story UX5.5 — Tune sparse-data and high-data states so History still feels like a practical logbook
- [x] Define History behavior for zero-record, one-record, sparse, and dense-history states after the layout changes
- [x] Ensure sparse states still feel useful without overpromoting analytics
- [x] Ensure dense-history states stay scannable with grouping and record-first ordering intact
- [x] Validate that insights help when useful but never replace the logbook function
- [x] **Test:** verify History remains understandable and useful across empty, sparse, and dense data states
- [x] **QC (Automated):** add browser QC for representative empty, sparse, and dense-history scenarios after the redesign

---
