## Epic UX6 — Backup Safety, Maintenance Clarity, and Danger-Zone Separation

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX6 work complete

### Story UX6.1 — Split Backup into distinct sections for portability, maintenance, and destructive reset
- [x] Redesign the Backup information architecture into clearly separated portability, maintenance, and destructive areas
- [x] Keep export/import actions prominent and understandable without visual competition from reset controls
- [x] Move routine per-category resets into their own clearly labeled maintenance section
- [x] Preserve existing backup preview and restore semantics while improving page scanability
- [x] **Test:** verify the revised Backup layout preserves all current functionality while making section purposes clearer
- [x] **QC (Automated):** add browser QC for section ordering and section-label clarity on desktop and mobile

### Story UX6.2 — Create a dedicated danger-zone treatment for full reset with stronger consequence framing
- [x] Design a distinct danger-zone visual treatment for full reset that is clearly separated from routine actions
- [x] Add concise pre-action consequence copy directly adjacent to the full-reset control
- [x] Ensure the danger-zone treatment remains legible and clear across themes and locales
- [x] Preserve the existing confirmation modal while improving pre-confirmation clarity
- [x] **Test:** verify the full-reset path remains functionally unchanged while becoming more clearly destructive before confirmation
- [x] **QC (Automated):** add browser QC for danger-zone visibility and consequence-copy presence

### Story UX6.3 — Collapse or reorganize routine per-category resets on mobile to reduce repeated action stacks
- [x] Design a mobile-specific organization pattern for per-category resets, such as an accordion or grouped maintenance panel
- [x] Reduce the length of the mobile reset stack while keeping each category reset discoverable
- [x] Ensure the reorganization does not weaken clarity about what each reset does
- [x] Validate the reorganized reset controls across phone-sized viewports and supported locales
- [x] **Test:** verify mobile users can still access and execute each category reset without scanning a long repeated stack
- [x] **QC (Automated):** add mobile browser QC for the collapsed or reorganized maintenance-reset pattern

### Story UX6.4 — Reduce explanatory-copy density so maintenance controls are easier to scan
- [x] Audit Backup helper text for repetition, low-value explanation, and visual competition with actions
- [x] Shorten or relocate explanatory copy that can be safely deferred behind progressive disclosure
- [x] Keep essential backup, restore, and reset-risk cues visible where decisions are made
- [x] Recheck the screen across desktop and mobile to confirm the revised copy improves scanability
- [x] **Test:** verify reduced Backup copy still preserves comprehension for export, import, reset, merge, and replace flows
- [x] **QC (Automated):** add browser QC for streamlined Backup copy and stable comprehension cues

### Story UX6.5 — Verify that routine upkeep and destructive removal are visually and cognitively distinct across desktop and mobile
- [x] Audit the revised Backup screen end to end on desktop and mobile after the earlier changes land
- [x] Confirm routine maintenance controls no longer read as equivalent in severity to full reset
- [x] Tune spacing, section order, and action styling wherever the distinction remains weak
- [x] Capture before/after UX evidence to support the final alignment decision
- [x] **Test:** verify desktop and mobile Backup flows preserve clarity between safe upkeep, restore operations, and destructive full reset
- [x] **QC (Automated):** add cross-viewport browser QC for routine-versus-destructive distinction and stable destructive-flow access
