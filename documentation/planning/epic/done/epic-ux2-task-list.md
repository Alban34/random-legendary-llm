## Epic UX2 — Global Interaction Continuity and Accessible Recovery

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX2 work complete

### Story UX2.1 — Preserve focus when theme and locale preferences rerender the shell
- [x] Audit the rerender path for theme and locale changes and identify where focus is currently lost
- [x] Preserve or explicitly restore focus to the triggering theme button after theme changes
- [x] Preserve or explicitly restore focus to the locale select after language changes
- [x] Ensure the focus-restoration logic works after persistence writes and full-shell rerenders on both desktop and mobile
- [x] **Test:** verify theme and locale changes never leave focus on the document body after rerender
- [x] **QC (Automated):** add browser QC that changes theme and locale from the shared header and confirms correct post-action focus targets

### Story UX2.2 — Add dependable status confirmation for header preference changes on every tab
- [x] Decide on the shared confirmation channel for theme and locale changes, such as a header-adjacent status line or polite toast
- [x] Render the confirmation mechanism consistently from any active tab instead of only Collection
- [x] Ensure confirmation copy is concise, localizable, and semantically appropriate for user-initiated preference changes
- [x] Avoid adding redundant or noisy notifications when the change is already visually obvious
- [x] **Test:** verify preference changes surface the intended confirmation channel from every tab and locale
- [x] **QC (Automated):** add browser coverage for visible confirmation of theme and locale changes outside Collection

### Story UX2.3 — Keep onboarding progression keyboard-continuous across next, previous, replay, and completion transitions
- [x] Audit onboarding rerender transitions for focus loss across next, previous, replay, skip, and completion actions
- [x] Restore focus to the equivalent onboarding control when the same control remains relevant after a step change
- [x] Move focus to the new step heading when the step content changes materially and a direct control carryover is not ideal
- [x] Ensure replay and completion transitions also leave users on a meaningful focus target
- [x] **Test:** verify keyboard progression through the onboarding flow never drops focus to the document body on desktop or mobile
- [x] **QC (Automated):** add browser QC for onboarding step progression and replay with focus assertions

### Story UX2.4 — Move focus into result entry when it opens from Accept & Log or History
- [x] Audit the result-editor open path after Accept & Log and from History edit actions
- [x] Move focus into the result editor when it opens, preferably to the heading or first actionable field
- [x] Ensure the editor-open focus behavior works for pending-result and completed-result edit paths
- [x] Preserve the user's context when the editor is opened inside grouped history sections
- [x] **Test:** verify opening result entry always lands focus inside the active editor on desktop and mobile
- [x] **QC (Automated):** add browser QC for post-accept result entry and in-history editing with focus assertions

### Story UX2.5 — Announce result-entry validation errors accessibly and return focus to a meaningful recovery target
- [x] Add a semantically announced error mechanism for invalid result saves, such as `role="alert"` or an appropriate live region
- [x] Mark invalid result controls with `aria-invalid` and connect them to error copy
- [x] Move focus to the error summary or first invalid field after validation fails
- [x] Return focus to the originating trigger after save, skip, or cancel closes the editor
- [x] **Test:** verify invalid saves announce recoverable errors and valid closes return focus predictably
- [x] **QC (Automated):** add browser QC for invalid and corrected result-entry flows including focus-return checks

---
