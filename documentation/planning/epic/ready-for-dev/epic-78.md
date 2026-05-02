## Epic 78 — UI Layout and Navigation Polish

**Objective**
Resolve four independent layout and navigation friction points surfaced in the 2026-05-02 UX review: the History grouping pill row wrapping to a second line at common viewport widths, excessive vertical space consumed by three separate New Game status cards, four near-equal-weight CTAs cluttering the Browse welcome area, and a destructive Collection action appearing before any content in its view.

**In scope**
- Converting the History tab grouping button row to a horizontally-scrollable single-line pill row using `overflow-x: auto` and removing flex-wrap, so all six buttons remain on one line at any viewport width — Finding S4
- Collapsing the three separate New Game status cards ("Selected mode", "Owned sets", "Last persisted mode") into a single compact summary element occupying significantly less vertical space; "Last persisted mode" information may move to a tooltip or secondary state — Finding N1
- Reducing the Browse welcome area to two visually differentiated action buttons ("Generate a Game" as primary, "Manage Collection" as secondary); relocating "Replay Walkthrough" into the existing "Start here" disclosure and "About this project" to the footer or a small header icon — Finding N2
- Moving the "Reset All Selections" button from immediately below the "My Collection" heading to the bottom of the Sets list; adding a short consequence reminder text adjacent to the button; preserving the existing confirmation dialog — Finding N3

**Out of scope**
- Reordering or renaming the six History grouping buttons themselves (only the row container layout changes)
- Removing any content from the "Selected mode", "Owned sets", or "Last persisted mode" data; all three values must remain accessible to the user
- Removing the "Replay Walkthrough" or "About this project" content permanently (they are relocated, not deleted)
- Modifying the confirmation dialog logic for "Reset All Selections"
- Changes to any tab other than History, New Game, Browse, and Collection

**Stories**
1. **Convert the History grouping button row to a horizontally-scrollable single-line pill row**
2. **Collapse the three New Game status cards into a single compact metadata summary**
3. **Reduce the Browse welcome area to two primary CTAs and relocate the utility links**
4. **Move the Collection "Reset All Selections" button to the bottom of the Sets list**

**Acceptance Criteria**
- Story 1: All six History grouping buttons (Mastermind, Scheme, Heroes, Villains, Player Mode, Epic Mastermind) appear on a single line at 320px, 390px, 733px, and 1280px viewport widths; none wraps to a second row; the row is horizontally scrollable when the buttons overflow the container; the selected/active button state is visually preserved; `npm run lint` passes.
- Story 2: The New Game tab displays a single summary element in place of the three separate cards; the combined element conveys the same "Selected mode", "Owned sets", and "Last persisted mode" information (the last may be in a tooltip or collapsed state); the combined element occupies no more than 80px of vertical height at a 664px viewport height; `npm run lint` passes.
- Story 3: The Browse welcome area contains exactly two action buttons with distinct visual treatment (primary and secondary); "Generate a Game" is the primary action; "Manage Collection" is the secondary action; "Replay Walkthrough" appears inside the existing "Start here" disclosure or equivalent collapsed region; "About this project" appears in the footer area or as a header icon link; no content is permanently removed; `npm run lint` passes.
- Story 4: The "Reset All Selections" button appears below all set entries in the Collection Sets view, not directly below the "My Collection" heading; a brief consequence reminder text ("This clears all owned set selections." or equivalent) is rendered in close proximity to the button; the existing confirmation dialog is still triggered before any selections are cleared; `npm run lint` passes.
