# UX Alignment Epics and Stories

STATUS: Proposed

## Purpose

This document captures the implementation epics required to close the UX gaps identified in `documentation/ux-review.md`.

It is intended to:
- turn the UX review findings into a concrete delivery backlog,
- keep UX-alignment work grouped separately from the broader product roadmap,
- and provide story-level planning before detailed implementation tasks are created.

See also: `documentation/ux/review.md`, `documentation/ux/reports/`, `documentation/planning/epics.md`

---

## Epic UX1 — Documentation and UX Contract Alignment

**Objective**
Restore one trustworthy documentation baseline for the shipped product so design, implementation, QA, and future UX work all reference the same current experience.

**In scope**
- current shell information architecture
- five-tab navigation contract
- shared header controls and onboarding contract
- current New Game and History flow documentation
- archival framing for outdated planning references

**Stories**
1. **Align the primary shell documentation with the shipped five-tab product**
2. **Document the shared header theme and locale controls plus their responsive behavior**
3. **Document the current first-run onboarding, replay, and About-entry behavior**
4. **Rewrite the primary New Game and History UI specs to match the shipped flows**
5. **Mark outdated four-tab or pre-alignment planning language as historical and non-authoritative**

**Acceptance criteria**
- `README.md`, `documentation/ux/ui-design.md`, `documentation/planning/roadmap.md`, and related UX-facing references describe the same five-tab shell.
- The documentation explicitly covers onboarding, About access, theme switching, locale switching, play modes, forced picks, result entry, grouped history, and insights.
- Older planning references that remain in the repo are clearly framed as historical where they no longer describe the shipped UX.
- Documentation-based release-readiness checks can use the UX docs as the current source of truth without reverse-engineering behavior from tests.

---

## Epic UX2 — Global Interaction Continuity and Accessible Recovery

**Objective**
Make the app's highest-frequency and highest-value interactions feel anchored, accessible, and recoverable across desktop and mobile.

**In scope**
- focus continuity for shared header preferences
- same-surface confirmation for theme and locale changes
- onboarding step-to-step focus continuity
- result-entry focus management
- accessible validation, error recovery, and focus return

**Stories**
1. **Preserve focus when theme and locale preferences rerender the shell**
2. **Add dependable status confirmation for header preference changes on every tab**
3. **Keep onboarding progression keyboard-continuous across next, previous, replay, and completion transitions**
4. **Move focus into result entry when it opens from Accept & Log or History**
5. **Announce result-entry validation errors accessibly and return focus to a meaningful recovery target**

**Acceptance criteria**
- Theme and locale changes do not drop focus to the document body after rerender.
- Users receive a clear confirmation of successful theme or locale changes from any tab, not only Collection.
- Onboarding progression preserves a meaningful focus target on desktop and mobile.
- Opening result entry places focus inside the editor or on a clear editor heading.
- Invalid result saves expose field-level invalid state plus a semantically announced error message.
- Closing result entry after save, skip, or cancel returns focus to the originating action.

---

## Epic UX3 — Browse and First-Run Hierarchy Refinement

**Objective**
Reduce entry-surface clutter so users reach collection building and setup generation faster, with stronger hierarchy on both desktop and mobile.

**In scope**
- first-run Browse hierarchy
- returning-user Browse landing state
- orientation content density
- CTA prioritization
- mobile catalog placement
- supporting metrics and helper-copy weight

**Stories**
1. **Redesign the first-run Browse surface around one primary next action**
2. **Move secondary checklist content fully into onboarding or progressive disclosure**
3. **Simplify the returning-user Browse intro so the catalog starts much sooner**
4. **Reduce low-value summary metrics and repeated helper copy that compete with the working surface**
5. **Tune desktop and mobile Browse layouts so filters and set browsing become visible earlier in the scroll path**

**Acceptance criteria**
- Browse no longer opens with multiple equally weighted orientation layers competing above the catalog.
- Returning users can reach the set catalog and filters with substantially less scrolling than in the reviewed UX baseline.
- Mobile Browse brings the working catalog meaningfully closer to the top of the viewport.
- Supporting metrics and explanatory text no longer dominate the visual hierarchy over primary actions.
- Onboarding and Browse roles are clearly distinct: onboarding teaches, Browse helps users act.

---

## Epic UX4 — Mobile Shell Compression and Task-First Layout

**Objective**
Recover vertical space on phone-sized screens so the active task panel, not persistent chrome, becomes the dominant surface.

**In scope**
- shared mobile header footprint
- placement and density of theme and locale controls
- first-run shell copy density
- fixed bottom navigation footprint
- mobile presentation of supporting chrome across Browse, New Game, History, and Backup

**Stories**
1. **Reduce the mobile header footprint after first-run orientation is complete**
2. **Move theme and locale controls into a lighter mobile preferences pattern**
3. **Trim or collapse persistent descriptive copy that repeats across phone screens**
4. **Refine the fixed bottom navigation so it consumes less height without harming tap clarity**
5. **Verify that the compressed mobile shell improves task visibility across the major tabs**

**Acceptance criteria**
- Phone-sized screens devote materially more vertical space to the active panel than in the reviewed baseline.
- Theme and locale controls remain discoverable and usable on mobile without permanently occupying large header space.
- The mobile header no longer competes visually with New Game, Browse, or Backup task content.
- The bottom navigation remains clear and tappable while using less vertical space.
- The revised mobile shell remains readable and stable across supported themes and locales.

---

## Epic UX5 — History as Logbook First, Insights Second

**Objective**
Recenter History on reviewing, editing, and understanding played games before exposing deeper analytics.

**In scope**
- record-first hierarchy
- grouped history scanability
- result editing discoverability
- insight placement on desktop
- insight containment on mobile
- supporting copy and summary density

**Stories**
1. **Reorder the History page so grouped records appear before analytics on desktop**
2. **Design a mobile-specific History layout that keeps record review dominant**
3. **Move insights behind a collapsible, secondary, or companion presentation when appropriate**
4. **Clarify the relationship between grouping controls, record actions, and deeper statistics**
5. **Tune sparse-data and high-data states so History still feels like a practical logbook**

**Acceptance criteria**
- Users encounter grouped records and their actions before deep analytics on desktop and mobile.
- History still supports insights, but those insights no longer dominate the primary scan path.
- Result editing remains easy to find within the record list after the layout rebalance.
- Mobile History can show several recent records before analytics take over the screen.
- The History tab feels aligned with the README contract of reviewing accepted games first and inspecting insights afterward.

---

## Epic UX6 — Backup Safety, Maintenance Clarity, and Danger-Zone Separation

**Objective**
Make Backup calmer and safer by separating routine maintenance from destructive actions and reducing repeated reset density, especially on mobile.

**In scope**
- export/import prioritization
- per-category usage-reset organization
- full-reset danger-zone treatment
- mobile reset density
- destructive-action pacing and visual separation
- supporting copy around reuse and reset preview

**Stories**
1. **Split Backup into distinct sections for portability, maintenance, and destructive reset**
2. **Create a dedicated danger-zone treatment for full reset with stronger consequence framing**
3. **Collapse or reorganize routine per-category resets on mobile to reduce repeated action stacks**
4. **Reduce explanatory-copy density so maintenance controls are easier to scan**
5. **Verify that routine upkeep and destructive removal are visually and cognitively distinct across desktop and mobile**

**Acceptance criteria**
- Export/import remains easy to find without being visually entangled with reset actions.
- Full reset is presented in a dedicated danger zone rather than as another reset row in the same scan path.
- Mobile Backup no longer requires users to traverse a long stack of structurally similar reset actions before understanding the screen.
- Routine maintenance actions feel safer and easier to scan than in the reviewed baseline.
- The revised Backup flow preserves existing confirmation safeguards while improving pre-confirmation clarity.

---

## Recommended sequencing

1. **Epic UX2 first** because accessibility and interaction continuity are the most urgent user-facing risks and the fastest way to improve trust.
2. **Epic UX3 and Epic UX4 next** because they address the largest day-to-day friction in first-run and mobile use.
3. **Epic UX5 and Epic UX6 after that** because they refine two dense but already functional management surfaces.
4. **Epic UX1 in parallel where possible** so the documentation baseline stays aligned while the UX changes land instead of lagging behind them.
