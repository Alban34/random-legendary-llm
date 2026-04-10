# Post-V1 Roadmap

STATUS: Proposed

## Overview

A structured post-V1 roadmap for the next development phase of the Legendary: Marvel Randomizer.

This roadmap translates the recommended implementation order from `documentation/post-v1-delivery-sequence.md` into milestone-style phases with explicit goals, deliverables, and acceptance criteria.

It is intended to:
- provide a roadmap view similar to the approved V1 roadmap,
- group the post-V1 backlog into implementation waves with clear outcomes,
- and define milestone-level completion targets before detailed delivery begins.

See also: `documentation/post-v1-epics.md`, `documentation/post-v1-task-list.md`, `documentation/post-v1-delivery-sequence.md`

---

## Milestone 1 — UX Feedback and First-Run Experience
**Goal:** Improve usability and clarity for both new and returning users by refining transient feedback and simplifying the initial experience.

**Included epics:**
- Epic 16 — Notification and Feedback Refinements
- Epic 17 — Onboarding and Information Architecture

**Deliverables:**
- refined toast behavior with automatic dismissal for non-critical notifications
- manual dismissal for transient toasts
- suppression of low-value or redundant notifications
- a first-run onboarding flow or guided tutorial
- a redesigned welcome area with improved hierarchy and spacing
- an About entry point that moves project-background details out of the default flow
- persisted onboarding-completion behavior

**Acceptance Criteria:**
- Non-critical toasts dismiss automatically and can also be dismissed explicitly by the user
- Critical error messaging remains visible long enough to be acknowledged and is visually distinct from transient feedback
- Regeneration and reuse scenarios no longer emit redundant informational toasts when equivalent information is already visible in the UI
- First-run users are shown onboarding at the intended moment, while returning users are not repeatedly interrupted
- The default welcome experience emphasizes primary product actions and no longer exposes developer or project-background details by default
- Onboarding, About access, and welcome layout remain usable on both desktop and mobile viewports

---

## Milestone 2 — Setup Generation Expansion
**Goal:** Expand the core generator to support more intentional play patterns and more flexible game setup control.

**Included epics:**
- Epic 11 — Alternate Solo and Multiplayer Modes
- Epic 15 — Guided Setup Constraints and Forced Picks

**Deliverables:**
- two-handed solo support with a documented rules contract
- play-mode-aware setup templates and validation behavior
- New Game controls for selecting play mode
- persisted play-mode metadata in accepted history records
- a forced-pick setup flow for supported entity categories
- legality-aware forced-pick generation and failure messaging
- defined lifecycle behavior for forced-pick selections

**Acceptance Criteria:**
- Two-handed solo can be selected, generated, validated, and logged without breaking existing solo or multiplayer flows
- Setup requirements and result messaging update correctly for each supported play mode
- Accepted game history records can represent both legacy entries and play-mode-aware entries safely
- Users can choose supported forced picks and generate a legal setup when one exists
- Impossible forced-pick combinations fail with specific, actionable feedback rather than generic errors
- Forced-pick behavior is consistent across repeated generation, acceptance, and reload flows according to the chosen persistence model

---

## Milestone 3 — Results and Insights
**Goal:** Capture meaningful play outcomes and turn them into useful gameplay insights.

**Included epics:**
- Epic 12 — Score Logging and Results History
- Epic 14 — Insights and Statistics Dashboard

**Deliverables:**
- a result model for score, outcome, and completion state
- post-game score and outcome entry flows
- persisted result-aware history records with backward compatibility
- editable logged results
- summary statistics for games played, wins, losses, and scores
- rankings for most-played and least-played entities
- a stats presentation in the History area or a dedicated insights view
- sparse-data empty states and guidance

**Acceptance Criteria:**
- Accepted games can store score and outcome data without breaking older saved history records
- Users can log, skip, and later correct results safely without duplicating records
- History clearly distinguishes pending, completed, and corrected results
- Statistics update correctly after new result entries or result edits
- Ranking views handle ties, duplicate display names, and light datasets correctly
- Users with little or no history still see understandable empty states instead of misleading metrics

---

## Milestone 4 — Presentation and Portability Hardening
**Goal:** Improve personalization and long-term maintainability while making user data portable across environments.

**Included epics:**
- Epic 18 — Theme Personalization and Styling Architecture
- Epic 13 — Data Portability and Backup

**Deliverables:**
- a persisted user-selectable theme toggle
- refactored design tokens that support multiple themes cleanly
- cross-theme verification of key screens and components
- a documented styling-architecture decision, including any CSS-library evaluation outcome
- a versioned JSON import/export schema
- export flow for downloading app data
- import flow with validation and recovery messaging
- merge and replace restore modes for imported data

**Acceptance Criteria:**
- Theme selection persists across reloads and applies consistently on startup
- Key screens remain legible, accessible, and semantically clear across supported themes
- The styling architecture decision is documented clearly enough to guide future UI work
- Exported JSON includes the intended persistent state and excludes transient UI-only data
- Valid imports can restore app state successfully, while invalid imports fail safely without mutating saved data
- Replace and merge restore flows behave predictably and communicate their effects clearly before applying changes

---

## Sequencing Notes

- Milestone 1 should land before larger workflow additions so the app’s baseline usability improves first.
- Milestone 2 should precede major history-schema expansion wherever possible because play-mode metadata affects downstream record design.
- Milestone 3 should precede final import/export work so portability targets the richer, more stable result-aware schema.
- Milestone 4 is intentionally last because theme architecture and backup formats are safer once the interaction and persistence models are more stable.
