# UI Design Specification

STATUS: Approved

## Design Philosophy
Themeable Marvel-inspired UI. Functional first, visually bold second. No external fonts, no framework — pure CSS with semantic custom properties.

Canonical token definitions now live in `documentation/design-system/overview.md`. This document remains the screen-level UI specification and examples reference.

The current supported themes are:
- `dark` — the default high-contrast dark theme
- `light` — a warm light theme for bright environments

---

## Color Tokens

The styling layer separates semantic tokens from concrete palette values. Each built-in theme implements the same governed token families, and component selectors consume semantic variables instead of shipping duplicated per-theme rule blocks.

Use `documentation/design-system/overview.md` as the canonical source for the current color tables, semantic token names, and component-state rules.

Screen-level examples in this document may still show compatibility aliases such as `--bg`, `--panel`, `--text`, and `--accent`, but those aliases resolve from the governed semantic layer in `src/app/app-shell.css`.

Theme-specific token details and the current architecture decision live in `design-system/styling-architecture.md`.

---

## Typography

Typography roles are governed by `design-system/overview.md`.

- Headline surfaces use the approved heading stack through the shared `display-*` and `heading-*` roles.
- Body copy, helper text, and dense metadata use the shared `body-*` roles.
- Tabs, pills, badges, and compact status labels use the `label` role with controlled uppercase and tracking.
- App shell examples in this document should be interpreted through those governed roles rather than as standalone one-off font sizes.

---

## Layout

### Shell

```
┌─────────────────────────────────────────────────────┐
│  ⚡ LEGENDARY RANDOMIZER v1.0.1  [theme][locale][5 tabs]  │  ← sticky, compact header
├─────────────────────────────────────────────────────┤
│                                                     │
│   [Active Tab Panel]                                │  ← scrollable, --bg-app
│                                                     │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
│  [mobile bottom tabs]                               │  ← fixed bottom on mobile
```

### Desktop Navigation (≥ 768px)
- Inline tabs in the header, right-aligned
- Shared header preferences stay visible beside the tab row
- Primary destinations are Browse, Collection, New Game, History, and Backup
- Active tab: `primary` underline + stronger text weight
- Inactive tab: `text-secondary`, hover lifts toward `text-primary`

### Mobile Navigation (< 768px)
- Fixed bottom tab bar, 5 equal-width items with icon + label
- Theme and locale controls move behind a lighter header disclosure instead of staying permanently expanded
- Active item: primary-accent text, icon, and selection treatment that remains identifiable without color alone

### Shared Header Controls
- Theme and locale are part of the baseline shell, not optional polish
- The app title (`h1`) is rendered at 1.4rem to give the title appropriate visual weight relative to the header controls; the app version is displayed as a muted `.app-version` element inside `header-right`, below the icon strip; a GitHub repository icon link (`.github-link`) is rendered inside `header-icon-strip` within `header-right`, alongside the locale and theme controls, opening `https://github.com/Alban34/random-legendary-llm` in a new tab with `aria-label="View source on GitHub"` and `rel="noopener noreferrer"`; the icon is visible on all viewports
- Desktop: theme buttons and locale select remain visible in the shared header
- Mobile: a compact preferences toggle reveals theme and locale controls on demand
- Preference changes persist immediately and restore focus to the triggering control after rerender
- Theme changes are confirmed visually (the UI repaints immediately) without emitting a toast; locale and other higher-impact preference changes surface a concise toast from any active tab

> **Design rationale (Epic 25 / Epic 27):** The header was initially compacted — smaller `h1`, reduced padding, version display added — to reclaim vertical space on mobile and shift visual emphasis to the active task panel rather than persistent shell chrome. Epic 27 subsequently raised the `h1` font-size to 1.4rem and vertically centred the title with the language and theme controls to give the title appropriate visual weight. Theme and locale controls remain discoverable but are no longer the dominant visual element in the header.

### First-Run Onboarding and About
- The first-run walkthrough appears automatically until it is skipped or completed
- The walkthrough can be replayed from Browse at any time
- Step progression keeps keyboard focus inside the walkthrough and the current step heading is a valid focus target after each transition
- Completing or skipping the walkthrough does not automatically re-open it on later launches
- A full reset clears the onboarding-completed preference and restores the first-run walkthrough
- About remains hidden by default and is opened intentionally from Browse

---

## Responsive Breakpoints

| Breakpoint | Width | Grid columns |
|------------|-------|-------------|
| Mobile | < 600px | 1 column |
| Tablet | 600px – 900px | 2 columns |
| Desktop | 900px – 1200px | 3 columns |
| Wide | > 1200px | 4 columns |

---

## Tab 1 — Browse Extensions

```
[Hero with one dominant CTA]
[Optional "Start here" disclosure]
[Search / filter bar]                [Type filter: All | Base Game | Large | Small | Standalone]

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ SET NAME     │  │ SET NAME     │  │ SET NAME     │
│ Year · Type  │  │ Year · Type  │  │ Year · Type  │
│              │  │              │  │              │
│ 15 Heroes    │  │ 17 Heroes    │  │  5 Heroes    │
│  4 MM · 12 S │  │  6 MM · 12 S │  │  1 MM ·  4 S │
│              │  │              │  │              │
│ [+ COLLECTION] │  │ [✓ IN COLL.]│  │ [+ COLLECTION] │
└──────────────┘  └──────────────┘  └──────────────┘

   (click card to expand details ↓)

  ▼ SET NAME — Detail Panel
  ┌────────────────────────────────────────────────┐
  │ HEROES         MASTERMINDS                     │
  │ • Black Widow  • Dr. Doom → Masters of Evil    │
  │   (S.H.I.E.L.D.)  • Loki → Enemies of Asgard  │
  │ • Captain America                               │
  │ ...                                             │
  │ VILLAIN GROUPS     HENCHMAN GROUPS             │
  │ • Brotherhood      • HYDRA Soldiers            │
  │ • HYDRA            • Sentinels                 │
  │                                                 │
  │ SCHEMES                                         │
  │ • Secret Invasion...  • Midtown Bank Robbery   │
  └────────────────────────────────────────────────┘
```

**Interactions:**
- First-run Browse keeps one dominant next action and moves secondary orientation into a collapsed help disclosure
- Returning-user Browse keeps replay/About access but brings filters and the set catalog closer to the top of the page
- Click card header → expand/collapse detail panel (accordion)
- "Add to Collection" toggles ownership directly from Browse and stays synchronized with Collection
- Type filter pills filter the grid
- Search bar filters by set name or alias

---

## Tab 2 — My Collection

The Collection tab exposes two mutually exclusive views selected by a segmented view toggle immediately below the tab heading:

- **Sets view** (default) — the existing set-ownership checklist, totals, feasibility indicators, BGG import panel, and Reset button
- **Browse Cards view** — a card-browser panel listing every individual card from the user's owned expansions, with a grouping selector

```
  [Sets]  [Browse Cards]   ← view toggle, below h2

  ── Sets view (active when "Sets" is selected) ────

  ─── Import from BoardGameGeek ───────────────────
  BGG Username  [___________________] [Import from BGG]
                                      (aria-busy spinner while loading)
  ✕ Error: <inline error message if import fails>

  ── Import Summary (shown after successful import) ──
  Matched 2 expansions: Dark City, Fantastic Four
  Unmatched BGG titles: "Legendary Villains (2014)"
  [Dismiss]
  ─────────────────────────────────────────────────

  Total available: 42 Heroes · 12 Masterminds · 18 Villain Groups · 8 Henchman Groups · 24 Schemes

  Capacity:
  ✓ Standard Solo (1P)    ✓ Advanced Solo    ✓ 2 Players    ✓ 3 Players    ✓ 4 Players

  ─── Base ────────────────────────────────────────
  ☑ Legendary: A Marvel Deck Building Game (2012) — 15 heroes, 4 masterminds

  ─── Large Expansions ────────────────────────────
  ☑ Dark City (2013)            — 17 heroes, 6 masterminds
  ☐ Secret Wars Vol. 1 (2015)   — 17 heroes, 5 masterminds
  ☐ Civil War (2016)            — 17 heroes, 5 masterminds

  ─── Small Expansions ─────────────────────────────
  ☑ Fantastic Four (2014)       —  5 heroes, 1 mastermind
  ☐ Paint the Town Red (2014)   —  5 heroes, 1 mastermind
  ...

  [Reset All Selections]

  ── Browse Cards view (active when "Browse Cards" is selected) ──

  Group by: [By Category]  [By Expansion]   ← grouping selector

  ─── Heroes ────────────────────────── (By Category grouping)
  • Bishop
  • Black Widow
  • Captain America
  ...

  ─── Masterminds ─────────────────────
  • Dr. Doom
  • Magneto
  ...

  ─── Villain Groups ──────────────────
  ...

  ─── Henchman Groups ─────────────────
  ...

  ─── Schemes ─────────────────────────
  ...

  ─── Dark City (2013) ──────────────── (By Expansion grouping)
  • Bishop  • Blade  • Bullseye  ...

  ─── Fantastic Four (2014) ───────────
  • Human Torch  • Invisible Woman  ...
```

**Interactions:**
- A segmented view toggle ("Sets" / "Browse Cards") appears immediately below the Collection tab heading; switching views does not alter `ownedSetIds`; the Sets view is the default; each button carries `aria-pressed` reflecting the active view
- A BGG import panel appears at the top of the Sets view: a labeled text input for the BGG username and an "Import from BGG" submit button; the control is keyboard-accessible via a wrapping `<form>`; the button is disabled when the input is empty or trimmed-empty
- While a BGG import is in progress the button is disabled and shows an inline loading indicator (`aria-busy="true"`); the set-ownership checkboxes below remain unaffected
- A BGG API network error, HTTP error, or timeout surfaces an inline error message within the panel; the user can correct the username and retry
- After a successful import a summary panel replaces the inline error (if any) and displays the count and names of matched expansions plus any BGG titles that could not be matched; the user can dismiss the summary; dismissing does not remove any newly imported owned sets
- The BGG import merges matched expansions into the existing owned set without removing manually selected sets; the import is idempotent (running it twice produces the same result)
- Checkboxes mirror the "Add to Collection" toggle from Browse tab
- Capacity indicators show a ✓ or ⚠ per player count
- "Reset All Selections" clears the collection (with confirmation)
- When the Browse Cards view is active, a grouping selector ("By Category" / "By Expansion") appears at the top of the card-browser panel; switching grouping updates the list immediately without a page reload; the active grouping button carries `aria-pressed`; the selected grouping is retained for the browser session but not persisted across page reloads
- By Category grouping renders five sections in canonical order (Heroes, Masterminds, Villain Groups, Henchman Groups, Schemes); each section heading appears only when the owned-expansion pool contains at least one card of that category; cards are listed A–Z by name within each section
- By Expansion grouping renders one section per owned expansion sorted A–Z by expansion name; all cards from that expansion regardless of category are listed A–Z by card name within each section
- When no expansions are owned, the card-browser panel renders a single informational message in place of any section headings

---

## Tab 3 — New Game

```
  ┌─────────────────────────────────────────────────┐
  │  Player Count                                   │
  │  [1]  [2]  [3]  [4]  [5]                       │
  │                                                 │
  │  Play Mode                                      │
  │  [Standard Solo] [Advanced Solo] [Two-Handed]  │
  │                                                 │
  │  Setup: 3 Heroes · 1 Villain Group ·            │
  │         1 Henchman Group · 25 Wounds            │
  │                                                 │
  │   [ ⚡ Generate Setup ]  [ ✅ Accept & Log ]    │
  │                                                 │
  │  ▶ Forced Picks  (disclosure, collapsed)        │
  │                                                 │
  │  ── Active Expansions ─────────────────────────  │
  │  ☑ Dark City      ☑ Fantastic Four              │
  │  ☐ Secret Wars    ☑ Paint the Town Red          │
  │  ...                                            │
  │  [Use all expansions]  [Clear selection]        │
  │  Using 3 of 4 expansions                        │
  │                                                 │
  │  ⚠ Not enough cards for a legal setup           │
  │    (shown only when filter is infeasible)        │
  └─────────────────────────────────────────────────┘

  ── Result ──────────────────────────────────────────

  MASTERMIND
  ┌──────────────────────────────────┐
  │ 🔴 DR. DOOM                      │
  │    Always leads: Masters of Evil │
  └──────────────────────────────────┘

  SCHEME
  ┌──────────────────────────────────┐
  │ 📜 Secret Invasion of the...     │
  │    ⚠ Special: Add Skrulls to VD  │
  └──────────────────────────────────┘

  HEROES
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ IRON MAN │ │ WOLVERINE│ │ THOR     │
  │ Avengers │ │ X-Men    │ │ Avengers │
  └──────────┘ └──────────┘ └──────────┘

  VILLAIN GROUPS         HENCHMAN GROUPS
  • Masters of Evil  ★   • HYDRA Soldiers
  • Brotherhood

  Wound Stack: 25

  ── Result Entry (opened from Accept & Log) ───────
  Outcome: [Win/Loss]
  Score:   [number]
  Notes:   [optional]
  [Save Result] [Skip for now] [Cancel]
```

**Interactions:**
- Player count buttons are mutually exclusive (styled like toggle buttons)
- 1-player mode exposes Standard Solo, Advanced Solo, and Two-Handed Solo
- A single primary button handles both first generation and all subsequent rerolls. Its label is context-sensitive: "Generate Setup" before any result is present, "New Setup" once a setup is already displayed
- The primary action button appears directly below the setup-requirements summary, before optional content, so users can act without scrolling past forced picks
- Forced picks are presented in a native `<details>` disclosure element below the primary action row; users who need forced picks can expand the disclosure without it adding visual weight for users who do not
- Forced picks are one-shot setup constraints that remain active across all rerolls, then clear after a successful Accept & Log or reload
- An "Active Expansions" panel appears below the Forced Picks disclosure on the New Game tab; it lists every owned expansion as a toggleable checkbox item; toggling an item adds or removes its ID from `activeSetIds`; "Use all expansions" sets `activeSetIds` to empty (restoring the all-owned fallback); "Clear selection" deselects every expansion; the panel shows a summary line reading "Using X of Y expansions" when a filter is active, or "All X expansions" when `activeSetIds` is empty
- Before the Generate button is enabled, `validateSetupLegality` is evaluated against the resolved active pool for the current player count and play mode; if the result is not `ok`, the Generate button is disabled and the legality reasons are displayed inline beneath the selector; re-evaluation happens whenever the active pool, player count, or play mode changes
- "Generate Setup" / "New Setup" validates collection size before randomizing
- "Accept & Log Game" saves the setup to history, opens immediate result entry in History, and marks the setup as used; it is disabled until a setup is present
- Result entry supports pending-result flows, later correction from History, focus moves into the editor on open, and invalid saves announce recoverable errors before returning focus to the correct field
- ★ marks the forced Mastermind villain group

> **Design rationale (Epic 25):** Generate and Regenerate were merged into one context-sensitive action because they produce identical outcomes — both randomize a new setup from the current constraints. A dedicated "Regenerate" label implied a behaviorally distinct path when none exists. Forced picks moved below the primary action so the button is reached without scrolling through optional configuration. Both changes reduce action-density confusion and bring the mandatory step earlier in the visual flow.

---

## Tab 4 — History

```
  Group by: [Mastermind] [Scheme] [Heroes] [Villains] [Player Mode]

  Filter: [All] [Won] [Lost] [Pending]
  3 games                                ← count line (hidden when All is active)

  ── Game History ────────────────────────────────────

  ▼  Dr. Doom                           [2 games]
    ▼  Accepted Apr 9, 2026 · 2 Players · Win · Score 77
      Mastermind: Dr. Doom  ·  Scheme: Secret Invasion...
      Heroes: Iron Man, Wolverine, Thor, Captain America, Storm
      [Edit result]
    ▶  Accepted Apr 2, 2026 · 1 Player · Pending result

  ▶  Magneto                            [1 game]

  ── Insights ───────────────────────────────────────
  Desktop: visible below grouped records
  Mobile: collapsed behind a reveal button until needed

  Per-category stats (heroes, masterminds, villain groups,
  henchman groups, schemes) are each a full-width collapsible
  panel rendered with native <details>/<summary> elements.
  Summary counts remain visible in the closed state so users
  can scan without opening every section.
```

**Interactions:**
- Grouping defaults to Mastermind and can be switched without changing saved data
- Group headers can collapse or expand their records for faster scanning of long histories
- History items collapse/expand on click
- History is ordered newest-first
- Accepted records stay primary; insights are secondary and appear after grouped records
- Pending and completed results are both supported, and completed results can be corrected later
- Opening result entry from History moves focus into the active editor, invalid saves announce errors with field-level invalid state, and save/skip/cancel return focus to the originating record action
- A row of outcome filter buttons — All, Won, Lost, Pending — appears above the game list whenever at least one history record exists; the active option is visually distinguished; selecting a filter immediately re-renders the list to show only matching records; a count line (e.g. "3 games") appears below the filter row when a non-All filter is active; when the filtered list is empty a contextual message is shown (e.g. "No won games yet") in place of the list; the filter is not persisted across page reloads

---

## Tab 5 — Backup & Data Management

The Backup tab is divided into three clearly separated panels (Epic UX6):

```
  ── Portability ─────────────────────────────────────
  (data-backup-panel data-backup-portability-panel)

  Export your collection, usage, history, results,
  and preferences as a versioned JSON backup.

  [Export Backup] [Import Backup]

  Imported backup preview...
  [Merge Backup] [Replace with Backup]

  ── Maintenance ─────────────────────────────────────
  (data-backup-maintenance-panel)
  (mobile: collapsed behind a <details> accordion)

  Heroes         Never played: 10/52        [Reset Hero Counts]
  Masterminds    Never played: 5/14         [Reset Mastermind Counts]
  Villain Groups Never played: 6/18         [Reset Villain Counts]
  Henchman GroupsNever played: 5/8          [Reset Henchman Counts]
  Schemes        Never played: 4/24         [Reset Scheme Counts]

  Lowest-play reuse activates automatically when a category runs out of never-played options.

  ── Danger Zone ─────────────────────────────────────
  (data-backup-danger-zone)

  This will permanently delete all game history and
  reset all card tracking. This cannot be undone.

  [🗑 FULL RESET — Clear all data]
```

**Interactions:**
- Progress indicators show never-played/total for each category
- Individual Reset buttons clear only that category's play counts (no confirmation needed)
- The Maintenance panel is rendered as a collapsible `<details>` accordion on mobile to reduce scroll density; on desktop it is always visible
- Full Reset is presented in the dedicated Danger Zone panel with consequence copy; it shows a modal confirmation before any data is cleared
- Import preview stages the backup before any merge or replace action is applied
- Storage-health status is only surfaced when storage is unavailable or degraded; no indicator is shown during normal healthy operation

**CSS classes introduced by Epic UX6:** `.danger-zone`, `.maintenance-accordion`, `.maintenance-accordion-summary`, `.maintenance-accordion-body`

---

## Common Components

### Toast Notification
```
┌─────────────────────────────────────────┐
│ ℹ️  Not enough never-played Heroes.      │
│    Reusing the least-played options...   │
└─────────────────────────────────────────┘
```
- Appears bottom-anchored (fixed to the viewport bottom edge, outside the layout flow), auto-dismisses after 4 seconds
- Types: `info` (blue), `success` (green), `warning` (gold), `error` (red)
- Stacks vertically if multiple appear

### Confirmation Modal
```
┌──────────────────────────────┐
│  ⚠️  Are you sure?            │
│                              │
│  This will delete all game   │
│  history and reset all card  │
│  tracking. This cannot be    │
│  undone.                     │
│                              │
│  [Cancel]    [Yes, Reset All]│
└──────────────────────────────┘
```
- Backdrop dims the page
- Keyboard: Escape = Cancel, Enter = Confirm

### Badge
```css
.badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.badge-base     { background: var(--accent-red); }
.badge-large    { background: #7b2fbe; }
.badge-small    { background: var(--accent-blue); }
.badge-standalone { background: #1a7a4a; }
```

---

## Animations & Transitions

| Trigger | Animation |
|---------|-----------|
| Tab switch | Fade in (150ms ease) |
| Card expand | max-height slide (200ms ease) |
| Toast appear | Slide up from below viewport + fade in (200ms); fades in only when `prefers-reduced-motion` is set |
| Toast dismiss | Slide down out of viewport + fade out (300ms); fades out only when `prefers-reduced-motion` is set |
| Button hover | background lightens (100ms) |
| Generate Setup result | Fade + translate up (250ms) |
| Modal open | Scale from 0.9 + fade (200ms) |

---

## Accessibility Notes
- All interactive elements reachable by keyboard (Tab key)
- Visible focus ring on all focusable elements (`:focus-visible { outline: 2px solid var(--border-focus) }`)
- ARIA roles: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `role="dialog"` on modal
- Color is not the only means of conveying state (always accompanied by icon or text)
- Sufficient contrast ratios: primary text (#f0f0f0 on #0d0d0d = 18.5:1)
