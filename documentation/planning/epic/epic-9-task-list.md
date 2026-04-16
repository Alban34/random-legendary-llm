## Epic 9 — Notifications, Error Handling, and Accessibility

### Story 9.1 — Show success, info, warning, and error toast notifications
- [x] Implement toast container
- [x] Implement toast rendering and dismissal
- [x] Add success/info/warning/error variants
- [x] **Test:** verify each toast type renders and dismisses correctly
- [x] **QC (Automated):** automate QC coverage for stacking, timing, and readability

### Story 9.2 — Report collection insufficiency and invalid setup requests clearly
- [x] Show error when collection is illegal for selected setup
- [x] Show info when least-played fallback is used
- [x] Show validation errors without breaking the UI
- [x] **Test:** verify invalid requests produce clear messages and do not crash the page
- [x] **QC (Automated):** automate QC coverage for several invalid scenarios and message clarity

### Story 9.3 — Handle unavailable browser storage gracefully
- [x] Detect storage availability
- [x] Show compatibility warning if storage is unavailable
- [x] Keep the page functional in degraded mode where possible
- [x] **Test:** simulate unavailable storage and verify graceful degradation behavior
- [x] **QC (Automated):** automate QC coverage for degraded-mode messaging and usable fallbacks

### Story 9.4 — Implement keyboard-accessible interactions and focus behavior
- [x] Ensure all controls are tabbable
- [x] Add visible `:focus-visible` styling
- [x] Ensure modal keyboard controls work
- [x] **Test:** verify keyboard interaction works for tabs, buttons, and modal flows
- [x] **QC (Automated):** automate QC coverage for primary flows using keyboard only

### Story 9.5 — Verify color-independent state communication and semantic roles
- [x] Add supporting text/icon cues alongside color states
- [x] Apply ARIA roles to tabs and modal
- [x] Verify semantic structure of interactive regions
- [x] **Test:** verify state remains understandable without relying on color alone
- [x] **QC (Automated):** automate QC coverage for accessibility cues and semantic structure

---
