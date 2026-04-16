## Epic 24 — Toast Behavior and Feedback Channel Cleanup

**Status**
Approved

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 24 work complete

### Story 24.1 — Define which preference changes should avoid toast notifications entirely
- [x] Audit the events that currently emit toasts for preference or shell changes
- [x] Decide which preference changes should use silent visual feedback instead of a toast
- [x] Confirm that theme switching should not produce a toast in the default interaction path
- [x] Preserve explicit feedback rules for changes that still need confirmation because they are less obvious or higher impact
- [x] Add any required documentation follow-up for the refined notification rules
- [x] **Test:** verify the notification rules distinguish silent preference changes from meaningful toast-worthy events
- [x] **QC (Automated):** add planning coverage for the refined toast-emission contract

### Story 24.2 — Remove theme-switch toasts while preserving clear preference feedback where needed
- [x] Remove toast emission from theme-toggle actions
- [x] Keep any remaining confirmation channel concise, accessible, and non-disruptive if the UX still needs one
- [x] Verify theme changes remain understandable from every major tab without relying on transient toast feedback
- [x] Ensure the quieted behavior stays compatible with locale switching and other shared-header preferences
- [x] **Test:** verify theme changes no longer emit toasts while the selected theme still updates clearly and persistently
- [x] **QC (Automated):** automate QC coverage for quiet theme switching across desktop and mobile layouts

### Story 24.3 — Render bottom-anchored toasts that animate in and out from outside the window
- [x] Anchor the toast stack at the bottom of the viewport rather than inside the layout flow
- [x] Update enter motion so toasts rise in from beyond the visible window edge
- [x] Update exit motion so dismissed toasts leave the screen in the same direction
- [x] Preserve stacked-toast spacing, timing, and dismissal behavior during the motion changes
- [x] **Test:** verify toast placement and motion remain stable for single and stacked notifications
- [x] **QC (Automated):** automate QC coverage for bottom-edge toast entry and exit behavior across representative viewports

### Story 24.4 — Verify toast motion, stacking, and accessibility remain stable across viewports
- [x] Review motion timing and easing so the revised toast behavior feels intentional rather than distracting
- [x] Ensure the bottom toast stack does not cover essential controls or trap focus on small screens
- [x] Preserve semantic roles, reduced-motion compatibility, and manual dismissal affordances
- [x] Add any required follow-up documentation tasks if the refined toast behavior changes UX guidance or accessibility notes
- [x] **Test:** verify bottom-anchored toasts remain accessible and non-disruptive under reduced-motion and stacked-notification scenarios
- [x] **QC (Automated):** automate QC coverage for reduced-motion, stacking order, and mobile overlap behavior

### Story 24.5 — Update documentation and QA expectations for the refined toast contract
- [x] Update UX, accessibility, or planning docs that describe toast behavior or preference-change confirmations
- [x] Align automated coverage expectations with quiet theme switching and bottom-edge toast animation
- [x] Record any remaining open questions about which shared-header changes deserve visible confirmation
- [x] Ensure documentation makes the refined toast contract easy to preserve during future UX work
- [x] **Test:** verify Epic 24 planning and UX docs reference the same toast and feedback behavior
- [x] **QC (Automated):** automate documentation-consistency checks for the refined toast contract
