# Design System Adoption Plan

STATUS: Approved

## Purpose

This document records the implementation order for applying the governed design system across the shipped application.

It is the screen-level rollout companion to `documentation/design-system/overview.md` and should be updated whenever a new screen or shared primitive changes the adoption sequence.

## Migration order

1. **Shared shell and primitives first**
   - typography roles
   - spacing, radius, border, and elevation tokens
   - navigation, buttons, panels, badges, form controls
   - focus-ring and reduced-motion behavior
2. **Browse and Collection next**
   - highest component reuse
   - quickest signal for card, filter, and structured-row consistency
3. **New Game and History after primitives settle**
   - denser interaction states
   - result cards, grouped rows, and focus restoration paths depend on shared patterns
4. **Backup and destructive flows last**
   - fewer shared surfaces
   - most important confirmation and notification semantics rely on the final component contract

## Screen priorities

### Browse

Why early:
- contains the hero shell, search/filter controls, reusable cards, badges, and panel rhythm
- exposes theme and localization resilience quickly because headings, metadata, and dense card content all render together

Primary contracts:
- page-intro rhythm
- filter pill/button states
- card title, metadata, badge, and expand/collapse treatments

### Collection

Why early:
- validates structured-list rules, selected states, and summary card reuse
- surfaces mobile density and long-copy wrapping issues fast

Primary contracts:
- collection row selection without color-only cues
- feasibility badges and summary panels
- reset confirmation entry point

### New Game

Why third:
- depends on button, segmented-control, form, notice, and result-card primitives
- introduces the most important generate/regenerate/accept action hierarchy

Primary contracts:
- player-count and play-mode segmented controls
- setup requirement cards and result card stacks
- generator notices and forced-pick controls

### History

Why fourth:
- builds on grouped rows, pills, editors, and expandable details already exercised elsewhere
- focus restoration and keyboard behavior are most visible here after primitive hardening

Primary contracts:
- grouping controls
- history summary pills and structured metadata rows
- inline result editor and focus recovery after open/close cycles

### Backup

Why fifth:
- reuses panels, buttons, structured rows, notices, and destructive confirmation patterns
- best final validation point for danger semantics, import previews, and theme stability

Primary contracts:
- import preview card and summary grid
- per-category reset rows
- destructive confirmation modal hierarchy

## Highest-risk styling debt

- typography drift in labels, metadata, and card titles
- inconsistent panel padding and border-radius decisions
- selected or warning states that rely too heavily on color
- motion and hover behavior that feel different across tabs
- cross-theme readability for dense badges, pills, and button fills

## Dependency notes

- accessibility hardening must land before screen-specific polish if a polish change weakens focus visibility or semantic state clarity
- localization and text scaling must be rechecked after every shell rhythm change because several headings and helper labels are translated
- theme fixes should happen in the token layer or shared component classes first; avoid per-screen overrides unless a documented exception is unavoidable

## Regression guardrails

- `test/design-system-rollout.test.mjs` protects the CSS/documentation contract for typography roles, tokenized primitives, reduced motion, and rollout documentation
- `test/playwright/epic18-qc.spec.mjs` protects cross-theme legibility, focus recovery, component consistency, reduced motion, and enlarged-text resilience across the main tabs

## Manual review still required

- final visual judgment of density and rhythm at wide desktop widths
- translated copy checks for unusually long strings that still fit but feel cramped
- confirmation-dialog copy tone and severity for destructive flows
