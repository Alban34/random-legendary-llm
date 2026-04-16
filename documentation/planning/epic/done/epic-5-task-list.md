## Epic 5 — Browse Extensions Experience

### Story 5.1 — Render the set grid from normalized data
- [x] Render included sets from canonical/norm data
- [x] Show year and type badges
- [x] Show category counts per set
- [x] **Test:** verify every included set renders exactly once with expected metadata
- [x] **QC (Automated):** automate QC coverage to compare the rendered set list with `documentation/data/game-data-normalized.md`

### Story 5.2 — Display set metadata and counts consistently
- [x] Show heroes/masterminds/schemes counts
- [x] Show villain and henchman counts where applicable
- [x] Display ownership state visually
- [x] **Test:** verify displayed counts match normalized data for representative sets
- [x] **QC (Automated):** automate QC coverage for low-count edge cases like `Dimensions` and `S.H.I.E.L.D.`

### Story 5.3 — Expand a set card to show its detailed contents
- [x] Add card expand/collapse behavior
- [x] Render heroes list
- [x] Render masterminds list
- [x] Render villain and henchman lists
- [x] Render schemes list
- [x] **Test:** verify expand/collapse state and content rendering for representative sets
- [x] **QC (Automated):** automate QC coverage for details in at least one normal set and one edge-case set

### Story 5.4 — Filter sets by type and search term
- [x] Add search input
- [x] Add type filter controls
- [x] Filter rendered sets reactively
- [x] **Test:** verify search and type filters work independently and together
- [x] **QC (Automated):** automate QC coverage for partial names, no-match searches, and type combinations

### Story 5.5 — Toggle set ownership from the Browse tab
- [x] Add ownership toggle button
- [x] Sync toggle with persisted collection state
- [x] Re-render related UI on ownership change
- [x] **Test:** verify Browse ownership toggles update collection state and survive reload
- [x] **QC (Automated):** automate QC coverage to toggle several sets and confirm the UI feedback is clear

---
