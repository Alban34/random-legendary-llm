# Design System Implementation Task List

STATUS: Proposed

## Purpose

This file is the working checklist for implementing the design-system backlog.

Each story from `documentation/design-system-epics.md` is broken down into concrete tasks that can be checked off during delivery.

**Completion rule:** a story is only considered **Done** when its:
- implementation tasks,
- **Test** task,
- and **QC** task

are all checked.

For design-system implementation work that changes shipped code, completion also requires running the full automated regression suite and confirming it passes:
- `npm test`
- `npx playwright test`

See also: `documentation/design-system-epics.md`, `documentation/design-system.md`, `documentation/testing-qc-strategy.md`

---

## Epic DS1 — Design Token Foundation and Theme Contract

### Epic-wide validation gate
- [x] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic DS1 work complete

### Story DS1.1 — Define the shared semantic token set for the application
- [x] Audit the existing shell CSS and list every hard-coded visual value that should become a semantic token
- [x] Define the baseline token families for color, typography, spacing, radius, shadow, and motion
- [x] Replace ambiguous or screen-specific token names with reusable semantic names
- [x] Document token intent so component authors know when to use each token
- [x] **Test:** verify the token set covers the current shell and shared component needs without requiring ad hoc fallback values
- [x] **QC (Automated):** add or extend checks that fail when shared components reintroduce hard-coded values instead of governed tokens

### Story DS1.2 — Map the token set across Dark and Light themes
- [x] Define the concrete Dark theme values for the approved semantic tokens
- [x] Define the concrete Light theme values for the same semantic tokens
- [x] Verify both themes preserve the same interaction hierarchy and semantic meaning
- [x] Remove theme-specific component overrides that duplicate logic already handled by tokens
- [x] **Test:** verify both themes implement the full semantic token set and recover safely from invalid theme IDs
- [x] **QC (Automated):** add browser coverage that switches between Dark and Light and confirms the main shell remains readable and coherent

### Story DS1.3 — Align early theme application with the persisted theme contract
- [x] Audit the current startup path that applies `data-theme` before first paint
- [x] Ensure the theme bootstrap logic consumes the governed theme IDs only
- [x] Preserve fallback-to-dark behavior for invalid or missing stored values while normalizing legacy `midnight` and `newsprint` values
- [x] Confirm the first-paint path does not introduce a theme flash or mismatched shell state
- [x] **Test:** verify saved theme preference is applied correctly on initial load, legacy theme IDs normalize safely, and invalid stored values recover to Dark
- [x] **QC (Automated):** add browser QC for first-load theme application and fallback behavior across reloads

### Story DS1.4 — Document token usage rules and non-goals for future contributors
- [x] Document when to introduce a new semantic token versus reusing an existing one
- [x] Document prohibited styling patterns such as screen-specific token forks and direct use of copyrighted cover elements
- [x] Add guidance for how design tokens should be referenced from component CSS
- [x] Link the token rules from the relevant styling and UI documentation entry points
- [x] **Test:** verify the documentation describes the same token families and theme contract used in the implementation
- [x] **QC (Automated):** extend documentation-alignment checks to detect token-contract drift between docs and shipped CSS

---

## Epic DS2 — Typography, Layout, and Shell Rhythm

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic DS2 work complete

### Story DS2.1 — Implement the approved typography stacks and type scale
- [ ] Apply the approved heading, body, and monospace font stacks through shared typography tokens
- [ ] Implement the design-system type scale for app titles, section headings, card titles, metadata, and labels
- [ ] Normalize letter spacing, line height, and uppercase usage for navigation and badge text
- [ ] Remove one-off font-size decisions that conflict with the governed type scale
- [ ] **Test:** verify major shell surfaces use the intended typography roles consistently across tabs
- [ ] **QC (Automated):** add browser QC that spot-checks heading, body, and metadata hierarchy on representative screens

### Story DS2.2 — Apply shared spacing, radius, border, and elevation rules to the shell
- [ ] Replace inconsistent shell padding and gap values with governed spacing tokens
- [ ] Apply the approved radius and border treatments to major panels and control groups
- [ ] Standardize panel shadows and remove exaggerated elevation differences between similar surfaces
- [ ] Ensure sticky header and mobile navigation surfaces use the approved separation treatment from content
- [ ] **Test:** verify shell containers, panels, and control groups consume the approved spacing and elevation tokens
- [ ] **QC (Automated):** add browser QC for shell spacing and panel treatment on desktop and mobile viewports

### Story DS2.3 — Refine responsive layout density for desktop and mobile screens
- [ ] Audit each major tab for unnecessary top spacing or low-value chrome before core controls
- [ ] Tune mobile density so task controls appear earlier without creating cramped touch targets
- [ ] Tune desktop density so multi-column layouts improve scanning without fragmenting the workflow
- [ ] Validate that theme, locale, and longer-copy states still fit within the revised layout rhythm
- [ ] **Test:** verify the responsive layout remains stable across supported breakpoints, themes, and locales
- [ ] **QC (Automated):** add viewport-based QC that checks content ordering and spacing on desktop and mobile

### Story DS2.4 — Standardize page-section and panel rhythm across the main tabs
- [ ] Define a shared pattern for page-intro spacing, section headings, and panel stacking
- [ ] Apply that pattern consistently to Browse, Collection, New Game, History, and Backup
- [ ] Reduce screen-specific layout exceptions that create different visual grammar for similar sections
- [ ] Ensure empty, sparse-data, and dense-data states still follow the same panel rhythm rules
- [ ] **Test:** verify major tabs share a consistent section rhythm without obscuring tab-specific needs
- [ ] **QC (Automated):** add browser QC that compares representative tab layouts for structural consistency

---

## Epic DS3 — Shared Component Library and State Patterns

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic DS3 work complete

### Story DS3.1 — Standardize navigation, tab, and segmented-control states
- [ ] Define the approved default, hover, focus, selected, and disabled states for top navigation and bottom-tab navigation
- [ ] Apply the same state language to player-count selectors and other segmented controls where appropriate
- [ ] Ensure active-state cues remain clear without relying on color alone
- [ ] Verify current-tab clarity survives theme changes, localization, and narrow viewports
- [ ] **Test:** verify navigation and segmented controls expose the same state hierarchy across desktop and mobile
- [ ] **QC (Automated):** add keyboard and viewport QC for active, hover, focus, and selected navigation states

### Story DS3.2 — Standardize buttons, cards, panels, badges, and tags
- [ ] Define primary, secondary, tertiary, and danger button treatments using the governed token system
- [ ] Standardize card and panel framing for browse results, setup results, history entries, and backup sections
- [ ] Standardize badge and tag treatments for set types, statuses, warnings, and forced conditions
- [ ] Remove one-off styling that makes similar components look unrelated across tabs
- [ ] **Test:** verify shared component classes or patterns render consistently in every tab that uses them
- [ ] **QC (Automated):** add browser QC that compares reused buttons, cards, and badges across at least three surfaces

### Story DS3.3 — Standardize form controls, filters, and structured-list treatments
- [ ] Apply shared input, select, checkbox, toggle, and pill-filter styling rules across the app
- [ ] Standardize validation, help text, and selected-state presentation for filters and forms
- [ ] Standardize list-row and table-like treatments for history records, import previews, and data summaries
- [ ] Ensure dense informational rows remain scannable in both themes and at mobile widths
- [ ] **Test:** verify forms, filters, and structured lists use the same tokenized control rules across screens
- [ ] **QC (Automated):** add browser QC for filter bars, collection toggles, structured history rows, and import-preview styling

### Story DS3.4 — Standardize alerts, notifications, and confirmation-dialog treatments
- [ ] Define the visual contract for info, success, warning, and error notifications
- [ ] Standardize inline alerts, toast notifications, and destructive confirmations around a shared semantic pattern
- [ ] Ensure destructive dialogs restate consequences clearly and visibly differentiate the confirm action from cancel
- [ ] Remove notification styling that depends on color alone to communicate meaning
- [ ] **Test:** verify alert and dialog patterns remain understandable across themes and interaction states
- [ ] **QC (Automated):** add browser QC for toast appearance, inline errors, and destructive confirmation dialogs

### Story DS3.5 — Apply shared motion and feedback patterns to interactive components
- [ ] Implement governed motion tokens for hover, panel expansion, toast entry, and modal transitions
- [ ] Remove oversized translations or timing differences that make similar interactions feel unrelated
- [ ] Ensure hover and pressed states reinforce action affordance without delaying comprehension
- [ ] Provide reduced-motion fallbacks for each animated pattern
- [ ] **Test:** verify motion timing and reduced-motion behavior follow the documented design-system contract
- [ ] **QC (Automated):** add QC that runs key interaction flows with and without reduced-motion preferences

---

## Epic DS4 — Accessibility and Cross-Theme Quality

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic DS4 work complete

### Story DS4.1 — Enforce accessible contrast and semantic state communication across components
- [ ] Audit text, icon, chip, and button contrast across both built-in themes
- [ ] Fix any state that depends on color alone by adding text, icon, underline, border, or structural cues
- [ ] Validate warning and danger states against real component backgrounds instead of isolated swatches
- [ ] Ensure small labels and metadata remain readable in dense panels
- [ ] **Test:** verify representative components meet the documented contrast and non-color state requirements in both themes
- [ ] **QC (Automated):** add browser or documentation QC that flags low-contrast or color-only state regressions where practical

### Story DS4.2 — Implement consistent keyboard focus and focus-restoration patterns
- [ ] Apply the governed focus-ring treatment to every interactive component family
- [ ] Normalize focus visibility for filled buttons, tabs, pills, cards, and dialog actions
- [ ] Preserve or restore focus correctly after rerenders, dialogs, theme changes, locale changes, and tab switches
- [ ] Ensure focus indicators remain visible against both dark and light theme surfaces
- [ ] **Test:** verify keyboard-only navigation exposes visible focus and predictable focus recovery across the main flows
- [ ] **QC (Automated):** add browser QC for focus visibility and post-action focus restoration on representative interactions

### Story DS4.3 — Support reduced-motion and text-scaling resilience in the visual system
- [ ] Audit the shell and shared components for motion that should change under `prefers-reduced-motion`
- [ ] Provide reduced-motion fallbacks for panel transitions, toast entry, and modal appearance
- [ ] Audit layout resilience at increased text size up to 200 percent
- [ ] Fix clipping, overlap, or hidden-action issues caused by larger text and denser translations
- [ ] **Test:** verify key screens remain usable with reduced motion enabled and larger text sizes applied
- [ ] **QC (Automated):** add browser QC for reduced-motion mode and enlarged-text viewport checks where practical

### Story DS4.4 — Verify the design system across Dark and Light on desktop and mobile
- [ ] Build a representative cross-theme review matrix for Browse, Collection, New Game, History, and Backup
- [ ] Review desktop and mobile states for token consistency, readability, and state clarity
- [ ] Fix theme-specific regressions that expose missing semantic tokens or component assumptions
- [ ] Document any remaining theme exceptions explicitly instead of leaving them implicit
- [ ] **Test:** verify the primary user journeys remain visually and functionally coherent in both themes on desktop and mobile
- [ ] **QC (Automated):** add cross-theme browser QC for representative flows on desktop and mobile viewports

---

## Epic DS5 — Documentation Adoption and Regression Guardrails

### Epic-wide validation gate
- [ ] **Full regression gate:** run `npm test` and `npx playwright test`, and confirm all tests pass before marking Epic DS5 work complete

### Story DS5.1 — Publish the canonical design-system documentation and token reference
- [ ] Finalize the design-system specification as the authoritative token and component contract
- [ ] Publish the semantic token tables, typography guidance, spacing scale, and component-state rules
- [ ] Add implementation handoff examples that map cleanly to CSS custom properties
- [ ] Mark older visual guidance as supporting or historical where it should no longer be authoritative
- [ ] **Test:** verify the published design-system docs match the token names and component rules used in the codebase
- [ ] **QC (Automated):** extend documentation-contract checks so the design-system doc remains aligned with shipped styling decisions

### Story DS5.2 — Align existing UI and styling documentation with the new design-system contract
- [ ] Audit `documentation/ui-design.md`, `documentation/styling-architecture.md`, and related docs for outdated or conflicting visual rules
- [ ] Update those documents so they reference the same token contract, themes, and component patterns
- [ ] Remove ambiguity about which document is authoritative for token definitions versus screen-specific guidance
- [ ] Preserve historical context only where it helps explain a deliberate architecture decision
- [ ] **Test:** verify the visual documentation set describes one consistent styling contract after alignment
- [ ] **QC (Automated):** add documentation-readiness checks that fail when major theme or token descriptions diverge across docs

### Story DS5.3 — Plan screen-by-screen adoption of the design-system component patterns
- [ ] Break down the rollout sequence for applying the design-system changes across Browse, Collection, New Game, History, and Backup
- [ ] Identify screens or components with the highest styling debt or the largest visual inconsistency risk
- [ ] Define migration order that keeps shared primitives ahead of screen-specific polish
- [ ] Record any dependencies on accessibility fixes, localization edge cases, or theme-specific cleanup
- [ ] **Test:** verify the rollout sequence is implementable without requiring a full visual rewrite in a single step
- [ ] **QC (Automated):** add or update planning checks if the repository uses documentation coverage for delivery sequencing

### Story DS5.4 — Add regression checks that protect key design-system contracts
- [ ] Identify the highest-value contracts to protect automatically, such as theme switching, focus visibility, and shared component reuse
- [ ] Extend existing tests or browser QC to cover those contracts explicitly
- [ ] Add documentation alignment checks for design-system-specific tokens and component states where practical
- [ ] Document what remains manual visual review versus what is enforced automatically
- [ ] **Test:** verify the new regression checks fail when a representative design-system contract is intentionally broken in a local test scenario
- [ ] **QC (Automated):** run the updated automated checks and confirm they protect the intended design-system contracts without excessive brittleness