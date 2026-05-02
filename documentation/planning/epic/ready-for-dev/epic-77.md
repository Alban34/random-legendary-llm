## Epic 77 — Documentation Refresh for Features Added in Epics 70–74

**Objective**
Bring the project's human-readable documentation into sync with the current product surface: update `README.md` to describe the five new game-facing features delivered in Epics 70–74, expand the `ui-design.md` result-view spec to make the solo-mode Always Leads suppression behavior explicit and verifiable, and document the `.ts`-only runtime locale authoring convention to prevent a recurrence of the locale key drift introduced by Epic 74.

**In scope**
- Adding 2–3 new bullets to `README.md` covering Preferred Expansion Priority (E70), Epic Mastermind mode (E71), Active Expansions filter (E72), Solo Always Leads suppression (E73), and Forced Hero Team (E74); updating the "All play modes covered" section to mention solo Always Leads suppression — Finding M3
- Expanding the result-view section of `documentation/ux/ui-design.md` to explicitly state the multiplayer-vs-solo branching behavior for the "Always Leads" villain-group marker (when ★ appears, and what renders in its place in solo mode) — Finding S5
- Adding a localization authoring-convention section to `documentation/architecture/overview.md` (or a new `localization.md` file if the overview is inappropriate) that states: `.ts` files are the sole runtime locale source; new keys must be added to `.ts` first; `.mjs` files must never diverge from `.ts` — derived from the recurrence risk identified in Finding M1

**Out of scope**
- Translating or updating non-English locale string values (content translation is out of scope for a documentation epic)
- Rewriting or restructuring the full README beyond the addition of the specified bullets and the "All play modes covered" update
- Adding documentation for any feature outside Epics 70–74
- Editing any source code files

**Stories**
1. **Update README.md to describe the five game-facing features added in Epics 70–74**
2. **Expand the ui-design.md result-view spec to document solo-mode Always Leads suppression**
3. **Document the `.ts`-only runtime locale authoring convention in the architecture documentation**

**Acceptance Criteria**
- Story 1: `README.md` contains 2–3 new bullets (within the "Why you'll love it" section or equivalent) that mention Preferred Expansion Priority, Forced Hero Team, Epic Mastermind mode, Active Expansions filtering, and Solo Always Leads suppression by name or clear description; the "All play modes covered" section (or equivalent) explicitly references solo play and the Always Leads rule suppression; no pre-existing README content is removed without replacement; the file renders correctly as GitHub-flavored Markdown.
- Story 2: The result-view section of `documentation/ux/ui-design.md` contains an explicit statement covering: (a) in multiplayer modes, the ★ marker and "Always leads" label appear on the villain-group row when the drawn mastermind carries the `alwaysLeads` attribute; (b) in solo modes (Standard Solo, Advanced Solo, Standard Solo v2), neither the ★ marker nor the "Always leads" label appears, and the villain group shown is the randomly selected one; this branching behavior appears in the spec table or interactions list, not only in a narrative paragraph.
- Story 3: The architecture documentation contains a section titled "Locale authoring convention" (or similar) that explicitly states: (a) `.ts` locale files are the sole source resolved at runtime; (b) new locale keys must be added to all relevant `.ts` files first; (c) `.mjs` locale files must never contain keys absent from the corresponding `.ts` files; the documentation is findable from the architecture `README.md` or `overview.md` index if one exists.
