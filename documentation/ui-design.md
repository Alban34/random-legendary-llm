# UI Design Specification

STATUS: Approved

## Design Philosophy
Themeable Marvel-inspired UI. Functional first, visually bold second. No external fonts, no framework — pure CSS with semantic custom properties.

Canonical token definitions now live in `documentation/design-system.md`. This document remains the screen-level UI specification and examples reference.

The current supported themes are:
- `dark` — the default high-contrast dark theme
- `light` — a warm light theme for bright environments

---

## Color Tokens

The styling layer separates semantic tokens from concrete palette values. Each built-in theme implements the same governed token families, and component selectors consume semantic variables instead of shipping duplicated per-theme rule blocks.

Use `documentation/design-system.md` as the canonical source for the current color tables, semantic token names, and component-state rules.

Screen-level examples in this document may still show compatibility aliases such as `--bg`, `--panel`, `--text`, and `--accent`, but those aliases resolve from the governed semantic layer in `src/app/app-shell.css`.

Theme-specific token details and the current architecture decision live in `documentation/styling-architecture.md`.

---

## Typography

Typography roles are governed by `documentation/design-system.md`.

- Headline surfaces use the approved heading stack through the shared `display-*` and `heading-*` roles.
- Body copy, helper text, and dense metadata use the shared `body-*` roles.
- Tabs, pills, badges, and compact status labels use the `label` role with controlled uppercase and tracking.
- App shell examples in this document should be interpreted through those governed roles rather than as standalone one-off font sizes.

---

## Layout

### Shell

```
┌─────────────────────────────────────────────────────┐
│  ⚡ LEGENDARY RANDOMIZER       [nav tabs desktop]    │  ← sticky header, --bg-nav
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
- Active tab: `primary` underline + stronger text weight
- Inactive tab: `text-secondary`, hover lifts toward `text-primary`

### Mobile Navigation (< 768px)
- Fixed bottom tab bar, 4 equal-width items with icon + label
- Active item: primary-accent text, icon, and selection treatment that remains identifiable without color alone

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
[Search / filter bar]                [Type filter: All | Base | Large | Small | Standalone]

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
- Click card header → expand/collapse detail panel (accordion)
- "Add to Collection" → filled button style, label changes to "✓ In Collection", button changes to outlined "Remove"
- Type filter pills filter the grid
- Search bar filters by set name

---

## Tab 2 — My Collection

```
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
```

**Interactions:**
- Checkboxes mirror the "Add to Collection" toggle from Browse tab
- Capacity indicators show a ✓ or ⚠ per player count
- "Reset All Selections" clears the collection (with confirmation)

---

## Tab 3 — New Game

```
  ┌─────────────────────────────────────────────────┐
  │  Player Count                                   │
  │  [1]  [2]  [3]  [4]  [5]                       │
  │                                                 │
  │  [  ] Advanced Solo  (1-player only)            │
  │                                                 │
  │  Setup: 3 Heroes · 1 Villain Group ·            │
  │         1 Henchman Group · 25 Wounds            │
  │                                                 │
  │           [ ⚡ GENERATE SETUP ]                 │
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

  [ 🔄 Regenerate ]    [ ✅ Accept & Log Game ]
```

**Interactions:**
- Player count buttons are mutually exclusive (styled like toggle buttons)
- Advanced Solo checkbox only enabled when 1 player selected
- "Generate Setup" validates collection size before randomizing
- "Regenerate" re-runs the randomizer (does NOT log the previous result, does NOT mark cards as used until Accept)
- "Accept & Log Game" saves the result to history and marks all cards as used
- ★ marks the forced Mastermind villain group

---

## Tab 4 — History

```
  Group by: [Mastermind] [Players] [Play Mode] [Ungrouped]

  ── Game History ────────────────────────────────────

  ▼  Dr. Doom                           [2 games]
    ▼  Game #7 — Apr 9, 2026 · 2 Players
      Mastermind: Dr. Doom  ·  Scheme: Secret Invasion...
      Heroes: Iron Man, Wolverine, Thor, Captain America, Storm
    ▶  Game #2 — Apr 2, 2026 · 1 Player

  ▶  Magneto                            [1 game]
  ...
```

**Interactions:**
- Grouping defaults to Mastermind and can be switched without changing saved data
- Group headers can collapse or expand their records for faster scanning of long histories
- History items collapse/expand on click
- History is ordered newest-first

---

## Tab 5 — Backup & Data Management

```
  ── Backup and Restore ──────────────────────────────

  Export your collection, usage, history, results,
  and preferences as a versioned JSON backup.

  [Export Backup] [Import Backup]

  Imported backup preview...
  [Merge Backup] [Replace with Backup]

  ── Used Card Tracking ──────────────────────────────

  Heroes         Never played: 10/52        [Reset Hero Counts]
  Masterminds    Never played: 5/14         [Reset Mastermind Counts]
  Villain Groups Never played: 6/18         [Reset Villain Counts]
  Henchman GroupsNever played: 5/8          [Reset Henchman Counts]
  Schemes        Never played: 4/24         [Reset Scheme Counts]

  Lowest-play reuse activates automatically when a category runs out of never-played options.

  [🗑 FULL RESET — Clear all data]
```

**Interactions:**
- Progress indicators show never-played/total for each category
- Individual Reset buttons clear only that category's play counts (no confirmation needed)
- Full Reset shows a modal confirmation: "This will delete all game history and reset all card tracking. Are you sure?"
- Import preview stages the backup before any merge or replace action is applied

---

## Common Components

### Toast Notification
```
┌─────────────────────────────────────────┐
│ ℹ️  Not enough never-played Heroes.      │
│    Reusing the least-played options...   │
└─────────────────────────────────────────┘
```
- Appears top-center, auto-dismisses after 4 seconds
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
| Toast appear | Slide down + fade in (200ms) |
| Toast dismiss | Fade out (300ms) |
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

