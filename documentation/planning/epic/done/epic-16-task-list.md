## Epic 16 — Notification and Feedback Refinements

### Story 16.1 — Classify notifications by persistence and dismissal behavior
- [x] Define notification categories for transient, persistent, and critical messages
- [x] Map existing app events onto the new notification classes
- [x] Document which messages should never produce a toast
- [x] Preserve semantic roles and accessibility expectations for each class
- [x] **Test:** verify notification classification remains consistent for the main success, info, warning, and error paths
- [x] **QC (Automated):** automate QC coverage for representative events in each notification category

### Story 16.2 — Auto-dismiss non-critical toasts after an accessible timeout
- [x] Add timeout behavior for transient toasts
- [x] Pause or adjust dismissal timing as needed for accessibility-sensitive interactions
- [x] Ensure timers do not leak or remove the wrong toast when multiple are stacked
- [x] Keep critical errors exempt from auto-dismissal
- [x] **Test:** verify auto-dismiss timing works for single and stacked non-critical toasts
- [x] **QC (Automated):** automate QC coverage for stacked toasts that dismiss in the expected order

### Story 16.3 — Allow users to dismiss transient toasts directly
- [x] Add an explicit dismissal affordance or interaction to non-critical toasts
- [x] Keep the interaction keyboard-accessible
- [x] Ensure dismissal does not interfere with concurrent toast timers
- [x] Preserve focus behavior when a toast is dismissed manually
- [x] **Test:** verify manual dismissal works for mouse and keyboard interaction paths
- [x] **QC (Automated):** automate QC coverage for manual dismissal of a stacked toast set

### Story 16.4 — Suppress low-value notifications when equivalent information is already visible in the UI
- [x] Identify events that currently create redundant toasts
- [x] Remove or suppress redundant notifications without losing important feedback
- [x] Keep critical or exceptional fallback messaging intact
- [x] Confirm the remaining UI state is sufficient to explain reuse or freshness behavior
- [x] **Test:** verify redundant toasts are suppressed while required error messages still appear
- [x] **QC (Automated):** automate QC coverage for regeneration and reuse scenarios that should no longer emit informational toasts

### Story 16.5 — Preserve critical error messaging until the user has a reasonable chance to acknowledge it
- [x] Define which error conditions are considered critical
- [x] Keep critical toasts persistent or require explicit dismissal
- [x] Distinguish critical presentation visually and semantically from transient messages
- [x] Ensure critical messages remain non-blocking unless escalation is explicitly intended
- [x] **Test:** verify critical errors remain visible while non-critical messages continue to auto-dismiss
- [x] **QC (Automated):** automate QC coverage for one critical collection-insufficiency error and one recoverable transient message shown in sequence

---
