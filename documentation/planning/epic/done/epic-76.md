## Epic 76 — Forced Picks Panel Cognitive Load Reduction

**Objective**
Reduce the cognitive overhead and scrolling effort in the Forced Picks accordion panel by removing structural redundancies, introducing a clear visual grouping between card-type picks and session settings, relocating the "Active constraints" summary to a persistent position, and applying a two-column layout at medium viewports to halve the scroll depth on mobile devices.

**Background**
The Forced Picks panel now contains nine stacked content blocks following the additions in Epics 70–74 (preferred expansion, forced team). Desktop users face roughly three full scrolls; mobile users at 390×844 face even more. The panel contains a duplicate heading, inconsistent button orientations (Scheme uses a horizontal pair while all other controls use a vertical stack), no visual separation between "pick a specific card" controls and "configure this session" controls, and the Active Constraints summary is buried inside the accordion body even though it is useful context for the Generate Setup action. Findings S2 (desktop) and S3 (mobile) describe the same structural problems at different viewport scales; they are addressed together.

**In scope**
- Removing the duplicate "Forced picks" H3 from inside the accordion body (the accordion toggle label already serves as the visible heading) — Finding S2
- Normalizing the button layout across all five card-type picker controls (scheme, mastermind, hero, villain, henchman) to a single consistent pattern — Finding S2
- Adding a visual sub-divider (separator line or sub-heading) inside the accordion body that groups the five card-type pickers together and the two session-settings controls (preferred expansion, forced team) together — Findings S2 and S3
- Moving the "Active constraints" summary block out of the accordion body and into a persistent position above the Generate Setup button, visible whether the accordion is open or closed — Findings S2 and S3
- Applying a two-column grid layout for the card-type picker controls on viewports ≥480px wide to reduce the number of full-viewport scrolls required on phone-sized screens — Finding S3

**Out of scope**
- Reordering which card types appear at the top of the card-picks group (ordering within the group is unchanged)
- Changing the Generate Setup button position, style, or behavior
- Converting the accordion to a different disclosure pattern (the accordion toggle and expand/collapse behavior are unchanged)
- Adding, removing, or changing the Forced Picks data model or generator logic
- Responsive layout changes for viewports smaller than 390px or larger than 1024px

**Stories**
1. **Remove the duplicate "Forced picks" H3 heading from inside the accordion body**
2. **Normalize button layout across all five card-type picker controls to a single consistent pattern**
3. **Add a visual sub-divider separating card-type picks from session settings inside the accordion**
4. **Move the "Active constraints" summary to a persistent position above the Generate Setup button**
5. **Apply a two-column layout for card-type picker controls on viewports ≥480px**

**Acceptance Criteria**
- Story 1: The word "Forced picks" (or its locale equivalent) appears exactly once in the visible DOM when the accordion is open — as the accordion toggle label only; the H3 inside the accordion body is removed; accordion open/close behavior is unaffected; `npm run lint` passes.
- Story 2: All five card-type picker controls (scheme, mastermind, hero, villain, henchman) use the same button layout pattern; no mix of horizontal button pairs and vertical stacks exists within the card-picks group; the chosen pattern is applied consistently at all supported viewport widths; `npm run lint` passes.
- Story 3: A visual separator or sub-heading divides the card-picks group (scheme, mastermind, hero, villain, henchman) from the session-settings group (preferred expansion, forced team) inside the accordion body; the separation is perceivable at all supported viewport widths and in both light and dark themes; `npm run lint` passes.
- Story 4: The "Active constraints" summary renders outside and above the accordion, immediately above the Generate Setup button; the summary is visible whether the accordion is open or collapsed; activating the accordion toggle no longer shows or hides the constraints summary; `npm run lint` passes.
- Story 5: On viewports ≥480px wide, the five card-type picker controls are arranged in a two-column grid; on viewports <480px the single-column layout is preserved; the Forced Picks panel requires no more than two full viewport scrolls to traverse on a 390×844 device with all controls visible; `npm run lint` passes.
