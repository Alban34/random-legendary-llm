# Testing and Quality Control Strategy

STATUS: Approved

## Purpose

This document defines how implementation quality will be verified.

Its core rule is:

> **No story is considered done until its corresponding tests and QC checks are completed.**

This applies to:
- data normalization,
- state management,
- setup generation,
- UI behavior,
- persistence,
- accessibility,
- and documentation consistency.

The authoritative reference baseline for inventory and setup-rule verification is defined in `documentation/sources.md`.

---

## Quality policy

A story can move to **Done** only when all of the following are true:

1. the implementation task(s) for that story are complete,
2. the story's matching test task(s) are complete,
3. relevant automated QC coverage has been executed,
4. no blocking errors remain in edited files,
5. the behavior matches the approved specifications.

Additional workflow rules for implementation epics:

6. if the implemented story changed files under `/src`, run the story-specific automated checks needed to satisfy that story's documented **Test** and **QC** tasks,
7. if the completed epic changed files under `/src`, run the full regression suite before marking the epic complete,
8. documentation-only, planning-only, prompt-only, or agent-only changes that do not modify `/src` do not require the full regression suite.

---

## Test pyramid for this project

Because the project is a static-hosted client app with shared JavaScript modules, testing will rely on a practical mix of:

### 1. Data and logic verification
Used for:
- normalization
- cross-reference validation
- setup generation
- legality checks
- selection priority
- persistence helpers

Preferred form:
- `node:test`-based module tests run locally through npm
- deterministic sample inputs / expected outputs

### 2. UI behavior verification
Used for:
- tab switching
- collection toggling
- generated result rendering
- history rendering
- reset behavior
- notifications and modals

Preferred form:
- Playwright browser QC specs for stable user-visible flows
- targeted follow-up coverage only where automation is not yet practical

### 3. End-to-end scenario verification
Used for:
- full user flows from collection selection to accepted setup
- persistence across reloads
- reset flows
- legality errors
- least-played fallback

Preferred form:
- scripted Playwright walkthroughs with expected outcomes
- focused supplemental checks for any flows not yet automated

---

## Story-level Definition of Done

Every story must satisfy this Definition of Done:

- implementation tasks checked
- matching **Test** task checked
- matching **QC** task checked
- any discovered defect fixed or explicitly deferred
- task list updated accordingly

When a story changes files under `/src`, its **QC** task should be satisfied through targeted automated checks that are appropriate for that story's scope.

When the epic containing that story changes files under `/src`, the epic is not complete until the full regression suite also passes.

---

## Design System Epic DS1 — Design Token Foundation and Theme Contract

Required tests:
- the stylesheet defines governed semantic token families for color, typography, spacing, radius, shadow, and motion
- both supported themes implement the semantic token set
- compatibility aliases such as `--bg`, `--panel`, `--text`, and `--accent` resolve from the semantic token layer
- legacy theme IDs `midnight` and `newsprint` normalize safely to `dark` and `light`
- styling documentation references the same governed token contract as the stylesheet

QC checks:
- verify theme switching still applies before first paint on reload
- verify both supported themes remain legible across the primary shell on desktop and mobile

Automated coverage:
- `test/design-system-epic1-foundation.test.mjs` covers the governed token layer and design-system documentation contract
- `test/playwright/epic18-qc.spec.mjs` continues to cover browser theme switching, persistence, and cross-theme legibility

## Design System Epic DS2 — Typography, Layout, and Shell Rhythm

Required tests:
- shared typography roles exist for display, heading, body, and label usage
- the shell, panels, cards, and control groups consume governed spacing, radius, and elevation tokens
- responsive spacing remains stable across mobile and desktop widths
- major tabs share a consistent panel and section rhythm

QC checks:
- verify representative tabs preserve heading/body/metadata hierarchy on desktop and mobile
- verify shell density still fits translated copy and sticky navigation without wasted vertical chrome

Automated coverage:
- `test/design-system-rollout.test.mjs` covers typography utilities and tokenized shell primitives
- `test/playwright/epic18-qc.spec.mjs` covers representative heading, panel, and spacing checks across tabs and viewports

## Design System Epic DS3 — Shared Component Library and State Patterns

Required tests:
- navigation, segmented controls, buttons, cards, badges, inputs, alerts, and dialogs reuse shared state patterns
- selected and disabled states remain understandable without relying on color alone
- motion timing stays within the documented design-system contract
- reduced-motion fallbacks disable hover lift and transition-heavy feedback safely

QC checks:
- compare reused button, card, badge, and structured-row treatments across at least three surfaces
- verify destructive dialogs and notices remain visually distinct in both themes

Automated coverage:
- `test/design-system-rollout.test.mjs` covers shared component-state hooks and reduced-motion CSS
- `test/playwright/epic18-qc.spec.mjs` covers component consistency, dialog hierarchy, and reduced-motion browser behavior

## Design System Epic DS4 — Accessibility and Cross-Theme Quality

Required tests:
- representative panels, buttons, and badges remain readable in both built-in themes
- focus rings stay visible across buttons, tabs, cards, rows, and dialog actions
- focus restoration remains predictable after tab changes, theme changes, locale changes, and dialog dismissal
- enlarged text up to 200 percent keeps key actions visible and usable

QC checks:
- verify the Browse, Collection, New Game, History, and Backup flows stay coherent on desktop and mobile in both themes
- verify reduced-motion mode and enlarged-text mode do not hide critical actions

Automated coverage:
- `test/design-system-rollout.test.mjs` covers focus-restoration hooks and rollout-plan documentation
- `test/playwright/epic18-qc.spec.mjs` covers cross-theme review, focus recovery, reduced motion, and enlarged-text checks

## Design System Epic DS5 — Documentation Adoption and Regression Guardrails

Required tests:
- the design-system and supporting docs describe the same token, typography, and component contract used in shipped CSS
- the screen-by-screen rollout sequence stays aligned with the design-system adoption plan
- automated guardrails explicitly protect focus visibility, theme coherence, and shared primitive reuse

QC checks:
- verify design-system documentation still identifies the canonical contract clearly after implementation changes
- verify supporting docs remain screen-level references rather than competing sources of truth

Automated coverage:
- `test/design-system-rollout.test.mjs` covers documentation alignment and rollout-plan presence
- `test/playwright/epic18-qc.spec.mjs` covers the highest-value browser-level design-system contracts

---

## Required test categories by epic

## Epic 1 — Data Foundation and Normalization

Required tests:
- IDs are unique across all included entities
- duplicate display names remain distinct by ID
- Mastermind leads resolve to valid entity IDs
- Scheme forced groups resolve to valid entity IDs
- all in-scope BGG-listed sets are present in normalized data

QC checks:
- included set counts and coverage match `documentation/game-data-normalized.md` and the BoardGameGeek references listed in `documentation/sources.md`
- normalization errors are understandable if thrown

---

## Epic 2 — State Management and Persistence

Required tests:
- default root state is valid
- load/save roundtrip preserves state correctly
- invalid stored set IDs are removed safely during hydration
- invalid or corrupted saved state falls back safely
- recovery notification behavior is triggered when corrupted state is recovered
- per-category resets clear only the intended usage data
- full reset clears collection, usage, history, and preferences

QC checks:
- reload page and confirm state persistence
- simulate missing storage support and verify graceful handling

Automated coverage:
- `test/playwright/epic2-qc.spec.mjs` covers persistence roundtrips, history rendering, reset behavior, and corrupted-state recovery

---

## Epic 3 — Setup Generation Engine

Required tests:
- each player-count template returns the correct slot counts
- Advanced Solo applies only to 1-player mode
- illegal collections are rejected with correct error reasons
- Mastermind leads consume the proper villain/henchman slot
- Scheme constraints and modifiers affect setup correctly
- never-played items are preferred first
- least-played fallback is used when fresh pool is insufficient
- `lastPlayedAt` resolves ties before random selection
- Generate/Regenerate do not mutate persisted usage/history
- Accept & Log updates usage and history

QC checks:
- walkthrough of at least one setup for each supported player count
- walkthrough of a fallback scenario where no fully fresh setup is possible
- manual comparison of representative special-rule setups against the BoardGameGeek card text reference

Automated coverage:
- `test/playwright/epic3-qc.spec.mjs` covers player-count requirements, thin-collection legality failures, scheme and mastermind edge cases, fallback messaging, ephemeral generate/regenerate behavior, and duplicate-name history rendering

---

## Epic 4 — Application Shell and Navigation

Required tests:
- tabs switch correctly
- active panel visibility is correct
- selected-tab persistence works if implemented

QC checks:
- desktop layout check
- mobile layout check
- keyboard navigation through tabs

Automated coverage:
- `test/playwright/epic4-qc.spec.mjs` covers responsive shell rendering, tab persistence, keyboard-only navigation, and visual primitive reuse checks

---

## Epic 5 — Browse Extensions Experience

Required tests:
- set cards render from data correctly
- expand/collapse detail works
- search filters correctly
- type filters correctly
- ownership toggles persist correctly

QC checks:
- spot-check displayed counts and contents against approved data docs

Automated coverage:
- `test/epic5-browse-extensions.test.mjs` covers browse filtering, alias search behavior, type metadata, and representative set counts
- `test/playwright/epic5-qc.spec.mjs` covers browse-grid rendering, detail expansion, type/search filtering, empty states, and ownership persistence from the Browse tab

---

## Epic 6 — Collection Management Experience

Required tests:
- grouped set rendering is correct
- collection changes stay synchronized across tabs
- totals update when ownership changes
- feasibility indicators react to collection changes

QC checks:
- verify warnings for thin/uneven collections

Automated coverage:
- `test/epic6-collection-management.test.mjs` covers type grouping, owned totals, feasibility indicators, and collection-only reset behavior
- `test/playwright/epic6-qc.spec.mjs` covers grouped collection rendering, cross-tab ownership sync, totals/feasibility updates, and reset confirmation behavior

---

## Epic 7 — New Game Setup Experience

Required tests:
- player-count controls update setup requirements correctly
- result view renders every selected category correctly
- forced groups and notes are visibly marked
- Regenerate leaves usage/history unchanged
- Accept & Log persists accepted setup correctly

QC checks:
- verify result clarity for both normal and edge-case setups

Automated coverage:
- `test/epic7-new-game-experience.test.mjs` covers New Game control helpers, visible requirements, special-rule rendering inputs, and Accept & Log persistence behavior

---

## Epic 11 — Alternate Solo and Multiplayer Modes

Required tests:
- two-handed solo resolves to the documented setup counts
- play-mode controls update requirement messaging without breaking legacy Advanced Solo behavior
- accepted history records persist explicit play-mode metadata
- legacy history records without `playMode` still hydrate and render safely

QC checks:
- verify the New Game screen exposes clear mode selection for 1-player flows
- verify Two-Handed Solo shows the correct explanatory copy and setup counts
- verify accepted setups that differ only by play mode remain distinguishable in history

Automated coverage:
- `test/epic11-play-modes.test.mjs` covers the play-mode model, history compatibility, and helper behavior
- `test/playwright/epic11-qc.spec.mjs` covers mode selection, generated two-handed setups, and history rendering in the browser
- `test/playwright/epic7-qc.spec.mjs` covers player-count controls, displayed requirements, full result rendering, scheme/mastermind cues, regenerate ephemerality, and Accept & Log browser flows

---

## Epic 12 — Score Logging and Results History

Required tests:
- accepted setups start with a pending result state rather than mutating older history semantics
- valid completed results accept only supported outcomes, require scores for wins, and allow scoreless losses
- legacy history records without `result` hydrate safely as pending entries
- malformed stored result payloads recover to a safe pending state without dropping the setup record
- editing a result updates the existing record rather than duplicating it

QC checks:
- verify Accept & Log opens immediate result entry without making score entry mandatory
- verify validation messaging appears for missing outcome or score fields
- verify pending and completed history records remain readable on desktop and mobile layouts
- verify older saved records without result data can still be completed from History

Automated coverage:
- `test/epic12-score-history.test.mjs` covers pending/default result state, invalid combinations, legacy compatibility, corrected-result updates, and save/load roundtrips

---

## Epic 19 — Interface Localization

Required tests:
- locale preferences default safely and recover invalid stored locale IDs
- locale resources expose the supported public locales and incomplete-pack fallback metadata
- localized shell and panel copy update without mutating canonical game names or exported schema fields
- date and number formatting follow the active locale on the main localized surfaces

QC checks:
- verify the shared header locale selector updates the visible UI and persists across reloads
- verify a long-copy locale keeps the shared shell readable on desktop and mobile
- verify an incomplete locale pack shows visible fallback behavior instead of failing silently

Automated coverage:
- `test/epic19-localization.test.mjs` covers locale defaults, persistence, normalization, and fallback metadata
- `test/playwright/epic19-qc.spec.mjs` covers locale switching, reload persistence, long-copy shell readability, and incomplete-pack fallback behavior
- `test/playwright/epic12-qc.spec.mjs` covers immediate result entry, skip/cancel/edit flows, keyboard-driven score entry, mixed history layouts, and legacy upgrade behavior

---

## Epic 13 — Data Portability and Backup

Required tests:
- exported payloads use the documented backup schema envelope, stable filename format, and persistent-only data slices
- valid current backups and legacy-compatible backups sanitize successfully into importable state
- malformed, unsupported, and partial backup payloads fail safely without mutating saved data
- merge and replace restore paths update only the intended persistent slices and avoid duplicate shared history records

QC checks:
- verify the dedicated Backup tab exposes clear export and import entry points alongside usage-reset and full-reset controls without crowding the screen
- verify exporting a backup triggers a JSON download with the current persistent data
- verify importing a valid backup shows a staged preview before any write happens
- verify Merge and Replace confirmations are explicit and leave the app in the expected restored state
- verify invalid imports surface actionable error messaging and preserve the existing saved state

Automated coverage:
- `test/epic13-backup-portability.test.mjs` covers schema structure, filename generation, valid and legacy-compatible payload parsing, safe rejection of malformed payloads, and merge semantics
- `test/playwright/epic13-qc.spec.mjs` covers export download validation, staged import preview with replace, merge behavior with overlapping history, and invalid-import recovery messaging

---

## Epic 14 — Insights and Statistics Dashboard

Required tests:
- derived outcome metrics stay stable for mixed completed, pending, scored, and scoreless-loss histories
- score aggregates avoid divide-by-zero behavior and only use scored results where appropriate
- ranking helpers stay deterministic for ties and preserve duplicate-name context with set labels
- collection-coverage percentages stay correct for the owned collection, the full catalog, and missing extensions
- sparse or empty states expose helpful insight copy without fabricating misleading metrics

QC checks:
- verify the History tab keeps game history first while exposing the insights section below it, without mixing in data-management controls
- verify summary cards update immediately after wins, losses, scoreless losses, and pending results are logged
- verify duplicate-name ranking entries remain distinguishable with set context
- verify owned-collection and full-catalog coverage percentages remain distinct when the user owns only part of the catalog
- verify the insights layout remains readable on desktop and mobile widths

Automated coverage:
- `test/epic14-stats-dashboard.test.mjs` covers derived metrics, duplicate-name ranking stability, sparse-data behavior, and collection-coverage percentages
- `test/playwright/epic14-qc.spec.mjs` covers empty-state insights, summary updates after logged results, duplicate-name ranking labels, collection-coverage percentages, and responsive History-tab layout

---

## Epic 15 — Guided Setup Constraints and Forced Picks

Required tests:
- forced picks can target the supported setup categories and still generate legal setups when possible
- unavailable or illegal forced picks fail with actionable legality reasons
- impossible collisions with scheme or mastermind requirements surface specific generator errors
- accepted game history remains free of stale forced-pick UI state

QC checks:
- verify the New Game screen clearly explains which categories can be forced
- verify active constraints can be reviewed, removed individually, and cleared in bulk
- verify successful and impossible constrained setups produce understandable feedback
- verify one-shot constraints clear after accept and after reload

Automated coverage:
- `test/epic15-forced-picks.test.mjs` covers constraint legality, supported-category generation, collision messaging, and history safety
- `test/playwright/epic15-qc.spec.mjs` covers forced-pick selection flows, legal constrained generation, impossible combinations, and one-shot lifecycle behavior

---

## Epic 18 — Theme Personalization and Styling Architecture

Required tests:
- theme utilities normalize only supported theme IDs and keep the default stable
- persisted state roundtrips keep the selected theme and recover invalid stored theme values safely
- the stylesheet exposes theme token sets for both supported themes without duplicating component rule blocks per theme
- documentation stays aligned with the selected styling architecture direction and the supported theme contract

QC checks:
- verify switching themes updates the shell immediately from the shared header controls
- verify the selected theme persists across reloads and applies on startup
- verify Browse, New Game, and History remain readable on both desktop and mobile viewports in each supported theme
- verify the shipped styling path still uses static local CSS without runtime third-party fetches

Automated coverage:
- `test/epic18-theme-personalization.test.mjs` covers theme utilities, persisted theme recovery, and styling-documentation alignment
- `test/playwright/epic18-qc.spec.mjs` covers theme switching, reload persistence, cross-theme readability assertions, and responsive shell behavior

---

## Epic 20 — History Grouping and Organization

Required tests:
- grouping helpers keep grouped sections deterministic for mastermind, player-count, play-mode, and ungrouped views
- duplicate mastermind names remain distinguishable inside grouped history labels
- grouping state stays presentation-only and does not mutate persisted history records or backup payloads
- result editing continues to target the correct record inside grouped sections

QC checks:
- verify History defaults to the documented grouping mode and keeps the newest group first
- verify switching grouping modes updates the rendered sections without breaking existing record interactions
- verify grouped history remains usable on desktop and mobile layouts
- verify reloads and backup restore reset History back to the default grouping rather than persisting UI-only grouping state

Automated coverage:
- `test/epic20-history-grouping.test.mjs` covers grouped-history derivations, duplicate-name labels, and ungrouped fallback behavior
- `test/playwright/epic20-qc.spec.mjs` covers default grouping, grouping-mode switching, grouped result editing, and reset-to-default behavior after reload and backup restore

---

## Epic 21 — Browse and Onboarding Detail Polish

Required tests:
- the onboarding shell renders before the main tab-panel shell in the shipped page structure
- the Browse renderer no longer includes the removed Ready Tabs metric
- the Browse renderer exposes separate start-here and full-width set-browsing sections
- supported locale resources can localize the onboarding eyebrow without falling back to English
- planning docs and `_next-steps.md` stay aligned with the new polish epic

QC checks:
- verify the first-run walkthrough appears above the main tab content instead of below it
- verify the Browse sets section uses the full available width on desktop layouts
- verify the Start here panel remains readable while stacking above the Browse sets section
- verify the removed Ready Tabs metric is absent from the visible Browse UI
- verify the walkthrough eyebrow is translated in supported non-English locales

Automated coverage:
- `test/epic21-browse-polish.test.mjs` covers source-structure changes, removed metric copy, and doc alignment for Epic 21
- `test/playwright/epic21-qc.spec.mjs` covers first-run onboarding placement, full-width Browse sets layout, and the absence of the Ready Tabs metric

---

## Epic 8 — History, Usage, and Reset Experience

Required tests:
- history renders newest-first
- history items expand/collapse correctly
- usage indicators reflect actual usage stats
- per-category reset updates indicators immediately
- full reset clears the visible UI state correctly

QC checks:
- verify history labels remain clear with duplicate character names

Automated coverage:
- `test/epic8-history-usage-reset.test.mjs` covers usage indicators, readable history summaries, and reset preview/behavior logic
- `test/playwright/epic8-qc.spec.mjs` covers usage indicators, newest-first history rendering, expand/collapse behavior, per-category resets, and full reset confirmation flows

---

## Epic 9 — Notifications, Error Handling, and Accessibility

Required tests:
- toast variants render and dismiss correctly
- validation errors do not break the page
- storage warnings appear in degraded mode
- keyboard interaction works for modal and tabs
- visual state is understandable without color only

QC checks:
- focus visibility review
- semantic/ARIA spot check

Automated coverage:
- `test/epic9-notifications-accessibility.test.mjs` covers toast helper behavior, invalid-request/fallback messaging inputs, degraded storage recovery, and shipped semantic markup plus focus styling
- `test/playwright/epic9-qc.spec.mjs` covers stacked toasts, targeted error/info/warning notification readability, degraded-mode storage behavior, and keyboard-only tab/modal flows

---

## Epic 10 — Final Documentation and Release Readiness

Required tests:
- README reflects actual implemented behavior
- documentation terminology matches implementation
- task list and story completion states are aligned

QC checks:
- final documentation review pass before completion

Automated coverage:
- `test/epic10-documentation-release-readiness.test.mjs` verifies README commands, architecture/data-model/setup-rules alignment with runtime symbols, Epic 10 task completion, and archival framing for planning-only docs
- `test/playwright/epic10-qc.spec.mjs` smoke-tests the documented launch → generate → accept → persist → reset flow against the shipped browser app

---

## Traceability rule

Each story in `documentation/task-list.md` must contain:
- at least one **implementation** task,
- one **Test** task,
- and one **QC** task.

If a story does not yet have those three elements, it is **not ready to be marked done**.

---

## Minimum execution standard during implementation

For every file edited during implementation:
- run file-level diagnostics,
- run story-relevant test scenarios,
- verify no regressions in impacted flows.

For every completed epic:
- run a short regression pass on previously completed user flows.

---

## Release readiness checklist

Before implementation is considered complete:
- all stories in `documentation/task-list.md` have checked implementation, test, and QC items
- no approved-scope story is left partially verified
- root `README.md` matches the shipped behavior
- the app runs as a static-served single page without server-side dependencies
- local persistence works across reloads
- reset flows and least-played fallback are verified through automated and logic-level coverage
- representative inventory and rule behaviors have been cross-checked against `documentation/sources.md`

Current automated browser QC command for Epic 1–10:
- `npm run check:qc`

Targeted Epic 9 browser QC command:
- `npm run check:qc:epic9`

Targeted Epic 10 browser QC command:
- `npm run check:qc:epic10`

