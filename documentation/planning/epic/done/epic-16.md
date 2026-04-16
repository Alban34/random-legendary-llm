## Epic 16 — Notification and Feedback Refinements

**Objective**
Reduce noise in the app's feedback model while making transient notifications behave more naturally and accessibly.

**In scope**
- auto-dismissing toasts
- manual dismissal
- critical vs non-critical toast behavior
- duplicate or low-value notification suppression
- non-blocking toast layout

**Stories**
1. **Classify notifications by persistence and dismissal behavior**
2. **Auto-dismiss non-critical toasts after an accessible timeout**
3. **Allow users to dismiss transient toasts directly**
4. **Suppress low-value notifications when equivalent information is already visible in the UI**
5. **Preserve critical error messaging until the user has a reasonable chance to acknowledge it**
