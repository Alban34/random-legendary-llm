# Legendary: Marvel Randomizer — Development Roadmap

STATUS: Approved

## Overview
A static-hosted single-page application (`index.html` + project-owned CSS, JS modules, and data assets) that lets users browse all Legendary: Marvel sets, manage their personal collection, generate legal randomized game setups, accept and log them into persistent history, review usage freshness, and reset stored state safely.

Historical note:
- This roadmap is a delivery record, not the authoritative current UX contract.
- Use `documentation/ux/alignment/task-list.md`, `documentation/ux/alignment/epics.md`, and `documentation/ux/ui-design.md` for the current shipped UX baseline.

---

## Milestone 1 — Data Compilation ✅ (Documentation Phase)
**Goal:** Produce an accurate, complete catalog of all Legendary: Marvel expansions.

**Deliverables:**
- `documentation/data/game-data.md` — complete expansion catalog with heroes, masterminds, villain groups, henchman groups, and schemes for each set
- `documentation/data/sources.md` — authoritative reference policy for the two BoardGameGeek sources
- project-owned seed data asset under `src/data/` populated from that catalog

**Acceptance Criteria:**
- Every set listed has at minimum: `id`, `name`, `year`, `type`, and a non-empty `heroes[]` array unless the approved external references explicitly indicate otherwise
- Every Mastermind lead reference resolves to an existing Villain Group or Henchman Group, depending on category
- The normalized inventory and rule notes are traceable back to the two BoardGameGeek reference pages

---

## Milestone 2 — Core Engine ✅
**Goal:** Implement storage and randomization logic as pure, testable modules.

**Deliverables:**
- `src/app/game-data-pipeline.mjs`: transforms canonical set data into resolved runtime entities and indexes
- a state/storage module under `src/app/`: load/save a versioned root state object (`legendary_state_v1`)
- a setup generator module under `src/app/`: randomizes a full game setup from normalized indexes, prefers never-played items, and falls back to the least-played items when necessary
- npm-driven module tests for core logic (`node:test`)

**Acceptance Criteria:**
- `generateSetup(1, false)` returns a valid record with 3 heroes, 1 villain group, 1 henchman group, 1 mastermind, 1 scheme
- Accepted setups update per-item usage stats (`plays`, `lastPlayedAt`) in the proper categories
- When never-played items are insufficient, the generator reuses the least-played items and shows an informational notification

---

## Milestone 3 — UI Shell ✅
**Goal:** Expand the existing HTML shell into the full application shell, design system, and tab navigation.

**Deliverables:**
- Sticky header with logo + tab navigation
- Five `<section>` panels (Browse, Collection, New Game, History, Backup) plus shared header theme/locale controls
- Mobile-first responsive CSS with dark Marvel theme

**Acceptance Criteria:**
- Tabs switch without page reload
- Correct panel is shown/hidden per selected tab
- Renders correctly on 320px–1440px viewport widths
- Responsive shell behavior is covered by automated browser QC on desktop and mobile viewport sizes

---

## Milestone 4 — Browse Extensions Tab ✅
**Goal:** Allow users to explore all available sets and toggle them into their collection.

**Deliverables:**
- Set card grid rendered from normalized runtime data
- Expandable set detail (heroes, masterminds, villain groups, schemes)
- "Add to Collection" / "Remove from Collection" toggle per set

**Acceptance Criteria:**
- All included sets from normalized runtime data render correctly
- Toggling a set updates `localStorage` immediately
- Visual distinction between owned and non-owned sets

---

## Milestone 5 — My Collection Tab ✅
**Goal:** Provide an at-a-glance summary of the user's current collection.

**Deliverables:**
- Grouped checklist (Base / Large Expansion / Small Expansion / Standalone)
- Aggregate totals: X heroes, Y masterminds, Z villain groups
- Per-player-count feasibility indicator (e.g., "Enough for up to 4 players ✓")

**Acceptance Criteria:**
- Totals update live when sets are added/removed in the Browse tab
- Warning shown if collection is insufficient for any player count

---

## Milestone 6 — New Game Tab ✅
**Goal:** Generate and display a complete randomized game setup.

**Deliverables:**
- Player count selector (1–5) and Advanced Solo toggle
- "Generate Setup" button
- Result panel showing: mastermind, scheme, heroes grid, villain groups, henchman groups, wound count
- "Regenerate" and "Accept & Log" actions

**Acceptance Criteria:**
- Mastermind's forced villain group always appears
- The generator prefers never-played cards first, then reuses the least-played cards when the fresh pool is insufficient
- Error toast shown if collection is too small for the selected player count

---

## Milestone 7 — History & Reset Tab ✅
**Goal:** Let users review past games and manage the used-card tracking.

**Deliverables:**
- Chronological list of logged game records (collapsible)
- Per-category reset buttons ("Reset Heroes", "Reset Masterminds", etc.)
- Full Reset button with confirmation dialog

**Acceptance Criteria:**
- History persists across page reloads
- Full Reset clears collection, usage, history, and preferences stored in `legendary_state_v1` only after confirmation
- Per-category reset only clears the selected usage bucket and leaves other state intact

---

## Milestone 8 — Polish & Error Handling ✅
**Goal:** Production-quality UX and robustness.

**Deliverables:**
- Toast notification system for success, info, warning, and error states
- Keyboard-accessible confirmation modal behavior for destructive actions
- Graceful degradation messaging if `localStorage` is unavailable
- Semantic tab, toast, and dialog markup with visible focus treatment

**Acceptance Criteria:**
- No unhandled JS exceptions during normal operation
- App shows a user-friendly error (not a crash) for all known edge cases
- Passes basic keyboard accessibility (tab-navigable, visible focus rings)

---

## Milestone 9 — Documentation and Release Readiness ✅
**Goal:** Complete all documentation files, user-facing README guidance, and final release-readiness validation.

**Deliverables:**
- `README.md` (user guide)
- `documentation/architecture/overview.md` (runtime architecture and normalization model)
- `documentation/data/data-model.md` (type definitions)
- `documentation/architecture/setup-rules.md` (game rules reference)
- `documentation/ux/ui-design.md` (design system)
- `documentation/data/game-data.md` (expansion catalog)
- `documentation/data/game-data-normalized.md` (source-backed normalized inventory)
- `documentation/planning/roadmap.md` (this file)
- Epic 10 documentation-contract tests and release-smoke browser QC

**Acceptance Criteria:**
- README matches shipped behavior, commands, persistence model, reset flows, and current limitations
- Architecture, data-model, setup-rules, roadmap, task list, and testing strategy stay aligned with implementation
- Documentation and release-readiness validation run successfully through automated tests and browser QC

---

## Future Enhancements (Post-V1)
- Export game history as JSON or CSV
- Print-friendly setup summary
- Card-level tracking within hero decks
- PWA (offline install, service worker)

---

## Post-V1 Roadmap

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

- Milestone 1 should land before larger workflow additions so the app's baseline usability improves first.
- Milestone 2 should precede major history-schema expansion wherever possible because play-mode metadata affects downstream record design.
- Milestone 3 should precede final import/export work so portability targets the richer, more stable result-aware schema.
- Milestone 4 is intentionally last because theme architecture and backup formats are safer once the interaction and persistence models are more stable.

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

### 9. Epic 20 — History Grouping and Organization
**Why ninth**
This is a targeted presentation improvement on top of a now-stable history, result, insights, and backup model. It adds immediate value for repeat users with larger histories while keeping schema risk low because the grouping state can remain UI-only.

**Primary dependencies**
- stable history/result model from Epics 11 and 12
- stable insights expectations from Epic 14
- confirmed backup behavior from Epic 13 so grouped views do not leak into persisted state

**Expected outcome**
- easier scanning of larger play histories
- more flexible history navigation without rewriting stored records
- clearer boundaries between persisted game data and presentation-only grouping state

### 10. Epic 19 — Interface Localization
**Why tenth**
Localization is broader and more cross-cutting than history grouping. Deferring it until the major information architecture and history presentation surfaces have settled reduces churn in translation keys, layout QA, and accessibility copy across the full app.

**Primary dependencies**
- stable onboarding and shell structure from Epic 17
- stable theme and layout behavior from Epic 18
- settled History and Backup information architecture after Epic 20

**Expected outcome**
- multi-language UI support with clear fallback behavior
- locale-aware formatting and persistent language preference
- a more internationally usable app without destabilizing canonical game data or exported schemas

---

## Dependency Notes

- Epic 14 should not precede Epic 12 unless the statistics scope is intentionally limited to usage-only metrics.
- Epic 13 can be pulled earlier if backup becomes urgent, but doing so will likely require follow-up schema-version work.
- Epic 18 can be split if the dark-mode toggle is urgent but the CSS-library evaluation is not.
- Epic 15 can move ahead of Epic 11 only if forced-pick behavior is explicitly scoped to the current one-handed mode.
- Epic 20 should precede Epic 19 if grouping labels, controls, and empty states are expected to participate in localization, since that avoids translating UI that is about to be restructured.
- Epic 19 can move ahead of Epic 20 only if localization becomes a higher product priority than history organization and the team accepts likely follow-up translation churn.

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

### Wave 5 — History refinement and internationalization
- Epic 20
- Epic 19
