## Epic 25 — Header and New Game Action Density Refinement

**Status**
Approved

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic 25 work complete

### Story 25.1 — Define the revised header hierarchy including a compact version display
- [x] Audit the current header for permanently visible elements, duplicate labels, and avoidable vertical cost
- [x] Define where the app version should appear so it remains visible without becoming dominant
- [x] Decide how the version display should behave across desktop and mobile shells
- [x] Confirm the revised header contract still supports onboarding, About access, and shared preferences cleanly
- [x] Add any required documentation tasks for the revised header information hierarchy
- [x] **Test:** verify the planned header contract preserves required controls while reducing visual weight
- [x] **QC (Automated):** add planning coverage for the compact header and version-display rules

### Story 25.2 — Reduce header footprint while keeping theme and locale controls discoverable
- [x] Reassess the placement and density of theme and locale controls in the persistent header
- [x] Introduce a lighter header presentation that keeps preferences accessible without dominating the top of the screen
- [x] Preserve keyboard, touch, and screen-reader access to the shared preferences after the compaction
- [x] Verify the compact header remains stable across locales with longer labels and across supported themes
- [x] **Test:** verify the revised header uses less space while keeping preference changes discoverable and usable
- [x] **QC (Automated):** automate QC coverage for compact-header behavior on desktop and mobile viewports

### Story 25.3 — Consolidate Generate and Regenerate into one clearer action model
- [x] Define the single primary action contract for first generation and subsequent rerolls
- [x] Remove redundant button labeling that suggests two different behaviors when the workflow is effectively the same
- [x] Preserve any distinct secondary actions that still matter, such as accepting or clearing a pending setup
- [x] Update helper copy and state labels so the one-button model remains obvious after a setup is already visible
- [x] **Test:** verify the revised generation controls expose one clear reroll path without changing persistence behavior
- [x] **QC (Automated):** automate QC coverage for first-generation and subsequent reroll flows using the consolidated action model

### Story 25.4 — Move the primary setup action higher in the New Game flow
- [x] Audit which optional information blocks currently push the primary generate action too far down the screen
- [x] Reorder or condense the New Game layout so the primary action appears earlier without hiding important setup choices
- [x] Keep optional explanatory content accessible through secondary placement, disclosure, or more compact presentation
- [x] Verify the revised layout reduces scroll cost on desktop and mobile while preserving accessibility
- [x] **Test:** verify the primary setup action becomes reachable earlier in the scroll path without breaking setup clarity
- [x] **QC (Automated):** automate QC coverage for earlier primary-action visibility on desktop and mobile New Game layouts

### Story 25.5 — Update documentation and QA expectations for the revised shell and setup-action hierarchy
- [x] Update UX and planning docs that describe the header footprint, shared preferences placement, version display, or New Game control hierarchy
- [x] Align automated coverage with the compact shell and one-button generation model
- [x] Record any remaining follow-up decisions if the new header design affects onboarding or mobile-shell guidance
- [x] Ensure the documentation explains why the setup action and header hierarchy were simplified, not only what moved
- [x] **Test:** verify Epic 25 planning and UX docs describe the same revised shell and New Game action contract
- [x] **QC (Automated):** automate documentation-consistency checks for the compact header and setup-action hierarchy

---
