## Epic 80 — Active Expansions Layout Alignment

**Objective**
The "Active Expansions" section on the New Game tab currently uses a bespoke panel layout placed above the Forced Picks section. This epic aligns its visual style with the Forced Picks collapsible pattern and repositions it below Forced Picks, giving the two sections a consistent look and logical order.

**In Scope**
- Story 80.1: Apply the same collapsible layout structure and CSS classes used by the Forced Picks section to the Active Expansions section.
- Story 80.2: Reorder the Active Expansions section in its parent component so it renders in DOM order below the Forced Picks section.

**Acceptance Criteria**
- Story 80.1: The Active Expansions section uses the same layout pattern and CSS classes as Forced Picks; no bespoke panel layout remains for this section.
- Story 80.2: In the rendered New Game tab, the Active Expansions section appears visually and in DOM order after the Forced Picks section.
