## Epic UX4 — Mobile Shell Compression and Task-First Layout

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX4 work complete

### Story UX4.1 — Reduce the mobile header footprint after first-run orientation is complete
- [x] Audit which header elements must remain permanently visible on phone-sized screens
- [x] Compress or collapse non-essential branding and descriptive copy after onboarding is complete
- [x] Ensure the reduced mobile header still communicates app identity and current context clearly
- [x] Preserve a distinct first-run presentation without carrying the same height cost into routine use
- [x] **Test:** verify the post-onboarding mobile header uses materially less height while preserving clarity
- [x] **QC (Automated):** add browser QC that measures reduced mobile header footprint after onboarding completion

### Story UX4.2 — Move theme and locale controls into a lighter mobile preferences pattern
- [x] Design a mobile-specific preferences entry point that keeps theme and locale discoverable without occupying permanent header space
- [x] Implement the new mobile preference pattern while keeping desktop behavior intact where appropriate
- [x] Preserve keyboard and screen-reader accessibility for the relocated controls
- [x] Ensure the new preference pattern still exposes current selection state clearly
- [x] **Test:** verify mobile users can discover, change, and confirm theme and locale preferences through the lighter pattern
- [x] **QC (Automated):** add browser QC for the revised mobile preferences flow across supported locales and themes

### Story UX4.3 — Trim or collapse persistent descriptive copy that repeats across phone screens
- [x] Identify repeated descriptive text that appears on multiple mobile screens without adding new decision value
- [x] Collapse, shorten, or relocate repeated copy so task controls remain visually dominant
- [x] Preserve important orientation cues for first-run users while reducing repeated informational weight later
- [x] Recheck Browse, New Game, History, and Backup for unnecessary repetition after the copy changes
- [x] **Test:** verify trimmed copy does not remove required comprehension cues for first-use and returning-user states
- [x] **QC (Automated):** add browser QC for mobile screens confirming the reduced persistent-copy footprint

### Story UX4.4 — Refine the fixed bottom navigation so it consumes less height without harming tap clarity
- [x] Audit the current mobile tab bar for label length, spacing, and icon/text balance
- [x] Reduce vertical footprint while preserving clear tap targets and current-tab visibility
- [x] Ensure five-tab navigation remains legible across supported locales and themes
- [x] Confirm the compressed navigation does not obscure panel content or overlap essential controls
- [x] **Test:** verify the revised bottom navigation remains usable, tappable, and clear on mobile widths
- [x] **QC (Automated):** add browser QC for bottom-nav height, current-tab clarity, and overlap avoidance on mobile

### Story UX4.5 — Verify that the compressed mobile shell improves task visibility across the major tabs
- [x] Audit the revised mobile shell against Browse, New Game, History, and Backup after the preceding changes land
- [x] Confirm active panel content becomes visible earlier in the scroll path on each major tab
- [x] Tune per-tab spacing where the shell changes expose new opportunities or regressions
- [x] Capture before/after evidence so the improvement is measurable rather than anecdotal
- [x] **Test:** verify major mobile tabs retain stability and readability after shell compression changes
- [x] **QC (Automated):** add cross-tab mobile QC that asserts improved task visibility and no new overlap regressions

---
