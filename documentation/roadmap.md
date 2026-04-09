# Legendary: Marvel Randomizer — Development Roadmap

STATUS: Approved

## Overview
A static-hosted single-page application (`index.html` + project-owned CSS, JS modules, and data assets) that lets users browse all Legendary: Marvel sets, manage their personal collection, generate fully-randomized game setups, and track used cards across sessions via `localStorage`.

---

## Milestone 1 — Data Compilation ✅ (Documentation Phase)
**Goal:** Produce an accurate, complete catalog of all Legendary: Marvel expansions.

**Deliverables:**
- `documentation/game-data.md` — complete expansion catalog with heroes, masterminds, villain groups, henchman groups, and schemes for each set
- `documentation/sources.md` — authoritative reference policy for the two BoardGameGeek sources
- project-owned seed data asset under `src/data/` populated from that catalog

**Acceptance Criteria:**
- Every set listed has at minimum: `id`, `name`, `year`, `type`, and a non-empty `heroes[]` array unless the approved external references explicitly indicate otherwise
- Every Mastermind lead reference resolves to an existing Villain Group or Henchman Group, depending on category
- The normalized inventory and rule notes are traceable back to the two BoardGameGeek reference pages

---

## Milestone 2 — Core Engine
**Goal:** Implement storage and randomization logic as pure, testable modules.

**Deliverables:**
- `normalizeGameData` module: transforms canonical set data into resolved runtime entities and indexes
- `StorageManager` module: load/save a versioned root state object (`legendary_state_v1`)
- `SetupGenerator` module: randomizes a full game setup from normalized indexes, prefers never-played items, and falls back to the least-played items when necessary

**Acceptance Criteria:**
- `generateSetup(1, false)` returns a valid record with 3 heroes, 1 villain group, 1 henchman group, 1 mastermind, 1 scheme
- Accepted setups update per-item usage stats (`plays`, `lastPlayedAt`) in the proper categories
- When never-played items are insufficient, the generator reuses the least-played items and shows an informational notification

---

## Milestone 3 — UI Shell
**Goal:** Build the HTML skeleton, CSS design system, and tab navigation.

**Deliverables:**
- Sticky header with logo + tab navigation
- Four `<section>` panels (Browse, Collection, New Game, History)
- Mobile-first responsive CSS with dark Marvel theme

**Acceptance Criteria:**
- Tabs switch without page reload
- Correct panel is shown/hidden per selected tab
- Renders correctly on 320px–1440px viewport widths
- No layout breakage on Chrome, Firefox, Safari, Edge

---

## Milestone 4 — Browse Extensions Tab
**Goal:** Allow users to explore all available sets and toggle them into their collection.

**Deliverables:**
- Set card grid rendered from normalized runtime data
- Expandable set detail (heroes, masterminds, villain groups, schemes)
- "Add to Collection" / "Remove from Collection" toggle per set

**Acceptance Criteria:**
- All sets from `GAME_DATA` render correctly
- Toggling a set updates `localStorage` immediately
- Visual distinction between owned and non-owned sets

---

## Milestone 5 — My Collection Tab
**Goal:** Provide an at-a-glance summary of the user's current collection.

**Deliverables:**
- Grouped checklist (Base / Large Expansion / Small Expansion / Standalone)
- Aggregate totals: X heroes, Y masterminds, Z villain groups
- Per-player-count feasibility indicator (e.g., "Enough for up to 4 players ✓")

**Acceptance Criteria:**
- Totals update live when sets are added/removed in the Browse tab
- Warning shown if collection is insufficient for any player count

---

## Milestone 6 — New Game Tab
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

## Milestone 7 — History & Reset Tab
**Goal:** Let users review past games and manage the used-card tracking.

**Deliverables:**
- Chronological list of logged game records (collapsible)
- Per-category reset buttons ("Reset Heroes", "Reset Masterminds", etc.)
- Full Reset button with confirmation dialog

**Acceptance Criteria:**
- History persists across page reloads
- Full Reset clears all `legendary_*` keys from `localStorage`
- Per-category reset only clears that category's used list

---

## Milestone 8 — Polish & Error Handling
**Goal:** Production-quality UX and robustness.

**Deliverables:**
- Toast notification system for: auto-reset events, collection-too-small errors, save confirmations
- Smooth CSS transitions on tab switches and card expansions
- Graceful degradation message if `localStorage` is unavailable
- Empty-state illustrations for empty collection and empty history

**Acceptance Criteria:**
- No unhandled JS exceptions during normal operation
- App shows a user-friendly error (not a crash) for all known edge cases
- Passes basic keyboard accessibility (tab-navigable, visible focus rings)

---

## Milestone 9 — Documentation Finalization
**Goal:** Complete all documentation files and user-facing README.

**Deliverables:**
- `README.md` (user guide)
- `documentation/architecture.md` (runtime architecture and normalization model)
- `documentation/data-model.md` (type definitions)
- `documentation/setup-rules.md` (game rules reference)
- `documentation/ui-design.md` (design system)
- `documentation/game-data.md` (expansion catalog)
- `documentation/game-data-normalized.md` (source-backed normalized inventory)
- `documentation/roadmap.md` (this file)

**Acceptance Criteria:**
- README is understandable by a non-technical user
- All ⚠️ placeholders in `game-data.md` resolved with accurate data

---

## Future Enhancements (Post-V1)
- Export game history as JSON or CSV
- Print-friendly setup summary
- Card-level tracking within hero decks
- PWA (offline install, service worker)
- Dark/light theme toggle

