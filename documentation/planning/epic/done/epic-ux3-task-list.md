## Epic UX3 — Browse and First-Run Hierarchy Refinement

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic UX3 work complete

### Story UX3.1 — Redesign the first-run Browse surface around one primary next action
- [x] Decide the single primary first-run action that should anchor the Browse landing state
- [x] Rework the first-run hierarchy so onboarding, welcome content, and the main CTA do not compete equally
- [x] Reduce simultaneous top-level cards and CTA clusters shown before the user acts
- [x] Keep the first-run surface understandable without duplicating the onboarding walkthrough content
- [x] **Test:** verify first-run Browse presents one clearly dominant action and does not hide access to the main workflow
- [x] **QC (Automated):** add browser QC for first-run Browse hierarchy on desktop and mobile viewports

### Story UX3.2 — Move secondary checklist content fully into onboarding or progressive disclosure
- [x] Identify checklist and helper-copy content that duplicates onboarding guidance
- [x] Move durable first-use guidance into the onboarding flow or an optional expandable help pattern
- [x] Keep only the minimum actionable helper text visible in the default Browse state
- [x] Ensure the revised content still supports replay and discoverability for hesitant users
- [x] **Test:** verify the default Browse state remains understandable after secondary checklist content is reduced or collapsed
- [x] **QC (Automated):** add browser QC confirming the reduced default help stack and accessible disclosure behavior

### Story UX3.3 — Simplify the returning-user Browse intro so the catalog starts much sooner
- [x] Define the minimal returning-user intro content needed after onboarding is complete
- [x] Reduce welcome copy, duplicated CTAs, and summary blocks that delay the set catalog
- [x] Keep collection-management actions visible without forcing users through an orientation stack
- [x] Confirm the revised layout still works for fresh, returning, and reset states
- [x] **Test:** verify returning users reach filters and the set catalog with substantially less scrolling than the current baseline
- [x] **QC (Automated):** add browser QC for returning-user Browse scroll position and content ordering on desktop and mobile

### Story UX3.4 — Reduce low-value summary metrics and repeated helper copy that compete with the working surface
- [x] Audit Browse metrics and helper text for action value versus display cost
- [x] Remove or demote metrics that do not materially help users decide what to do next
- [x] Reduce repeated explanation blocks once users have already completed onboarding
- [x] Ensure any remaining summary content supports collection management or setup generation directly
- [x] **Test:** verify the revised Browse summary layer still supports task understanding without reintroducing clutter
- [x] **QC (Automated):** add browser QC ensuring low-value metrics stay removed or demoted from the primary Browse scan path

### Story UX3.5 — Tune desktop and mobile Browse layouts so filters and set browsing become visible earlier in the scroll path
- [x] Rework Browse spacing and section order so filters and catalog content appear sooner on desktop
- [x] Rework the phone layout so the set catalog begins much closer to the top of the mobile panel
- [x] Preserve filter visibility, accessibility, and responsiveness while reducing the pre-catalog stack
- [x] Validate that the revised Browse layout remains stable across themes and supported locales
- [x] **Test:** verify desktop and mobile Browse layouts expose filters and set browsing earlier without breaking responsiveness
- [x] **QC (Automated):** add viewport-based QC that measures or asserts improved Browse content ordering on desktop and mobile

---
