# Post-V1 Recommended Delivery Sequence

STATUS: Approved

## Purpose

This document recommends a delivery order for the post-V1 backlog in `documentation/post-v1-epics.md`.

For a milestone-style phase view with goals, deliverables, and acceptance criteria, see `documentation/post-v1-roadmap.md`.

The sequencing favors:
- early user-visible improvements with low migration risk,
- stabilization of shared data models before portability work,
- and building analytics only after the app captures the right underlying data.

---

## Recommended Sequence

### 1. Epic 16 — Notification and Feedback Refinements
**Why first**
This is a contained UX improvement on top of systems that already exist. It reduces noise quickly, improves trust in the interface, and has minimal schema impact.

**Primary dependencies**
- existing toast and feedback infrastructure from V1

**Expected outcome**
- clearer feedback model
- less toast fatigue
- more polished transient messaging before larger feature work lands

### 2. Epic 17 — Onboarding and Information Architecture
**Why second**
Once notifications are less noisy, the next highest-value usability gap is first-run comprehension. Improving onboarding and the welcome area helps new users understand the app before new feature complexity is added.

**Primary dependencies**
- stable shell navigation and primary screens from V1
- refined feedback behavior from Epic 16

**Expected outcome**
- simpler first-run experience
- lower cognitive load on the home screen
- clearer separation between product use and project background information

### 3. Epic 11 — Alternate Solo and Multiplayer Modes
**Why third**
This extends the core setup domain and should land before downstream features start relying on game-record semantics. If play modes change the shape of history records, it is better to settle that model early.

**Primary dependencies**
- existing setup generator and game history model from V1

**Expected outcome**
- broader gameplay support
- stable play-mode model for later history, export, and analytics features

### 4. Epic 15 — Guided Setup Constraints and Forced Picks
**Why fourth**
This is another generator-focused feature that builds naturally after play-mode expansion. It adds control without requiring the score and analytics model to exist first.

**Primary dependencies**
- finalized play-mode behavior from Epic 11
- existing legality-first generation pipeline from V1

**Expected outcome**
- more flexible setup generation
- better support for intentional or themed play sessions

### 5. Epic 12 — Score Logging and Results History
**Why fifth**
Score and result tracking introduces a meaningful state-model expansion. It should happen after the game-setup model is stabilized but before analytics and export so those later features can target the richer data structure.

**Primary dependencies**
- accepted game-history model from V1
- compatible play-mode metadata from Epic 11

**Expected outcome**
- richer game records
- persistent win/loss and scoring data
- a better history experience for repeated play

### 6. Epic 14 — Insights and Statistics Dashboard
**Why sixth**
Analytics are only useful once the app is storing enough reliable data. Shipping stats after score logging avoids reworking derived metrics and reduces churn in the UI contract.

**Primary dependencies**
- score and outcome data from Epic 12
- usage-state integrity from V1

**Expected outcome**
- meaningful gameplay insights
- visible value from accumulated history
- a stronger retention loop for repeat users

### 7. Epic 18 — Theme Personalization and Styling Architecture
**Why seventh**
Theme support is valuable, but the styling-architecture evaluation introduces design-system churn. It is safer after the onboarding and primary workflow changes have settled.

**Primary dependencies**
- stable main-screen layouts after Epic 17
- existing preference persistence from V1

**Expected outcome**
- user-selectable themes
- clearer direction for long-term CSS maintenance
- reduced risk of redoing visual work across multiple iterations

### 8. Epic 13 — Data Portability and Backup
**Why eighth**
Import and export should target the most stable practical version of the persisted schema. Shipping this last minimizes migration risk and avoids forcing support for multiple intermediate backup formats too early.

**Primary dependencies**
- play-mode metadata from Epic 11
- score history from Epic 12
- theme and preference model from Epic 18

**Expected outcome**
- robust backup and restore flow
- fewer schema migrations for exported files
- better long-term portability guarantees

---

## Dependency Notes

- Epic 14 should not precede Epic 12 unless the statistics scope is intentionally limited to usage-only metrics.
- Epic 13 can be pulled earlier if backup becomes urgent, but doing so will likely require follow-up schema-version work.
- Epic 18 can be split if the dark-mode toggle is urgent but the CSS-library evaluation is not.
- Epic 15 can move ahead of Epic 11 only if forced-pick behavior is explicitly scoped to the current one-handed mode.

---

## Suggested Implementation Waves

### Wave 1 — UX polish and comprehension
- Epic 16
- Epic 17

### Wave 2 — Core setup expansion
- Epic 11
- Epic 15

### Wave 3 — Richer history and insights
- Epic 12
- Epic 14

### Wave 4 — Presentation and portability hardening
- Epic 18
- Epic 13
