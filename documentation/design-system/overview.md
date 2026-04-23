# Design System Specification

STATUS: Proposed

## Purpose

This document defines the shared visual and interaction system for the Legendary randomizer application.

It is intended to:
- translate the approved product direction into reusable UI rules,
- give developers a stable token and component contract,
- preserve a bold comic-adjacent identity without copying licensed artwork,
- and keep usability, accessibility, and theme support consistent across the application.

The visual direction is inspired by the mood of `cover.jpg`: high contrast, urban-night energy, incandescent highlights, dramatic framing, and confident action.

---

## Brand Direction

The interface should feel like a mission console built for planning a comic-book confrontation, not a marketing site or a toy dashboard. It should combine dark architectural surfaces, heated accent colors, and sharp information hierarchy so the user can move quickly through dense setup and history data. The system should feel energized, tactical, and cinematic while remaining calm enough for repeated use. The result should be memorable because of contrast, rhythm, and focus, not because of decorative noise.

Emotional tone:
- charged
- tactical
- high-contrast
- urban
- confident
- readable

Visual keywords:
- ember
- steel
- smoke
- signal
- spotlight
- panel
- trajectory

Product personality:
- decisive rather than playful
- bold rather than flashy
- premium rather than ornamental
- practical rather than nostalgic

---

## Core Design Principles

1. Put gameplay tasks ahead of decoration. Visual energy should support browsing, setup generation, and history review.
2. Use contrast to direct attention. Bright accents belong on actions, active states, and high-value information only.
3. Keep surfaces structured and legible. Dense information should sit in disciplined panels, not free-floating fragments.
4. Reward repetition with consistency. Similar actions and states should look and behave the same across tabs.
5. Make status obvious without relying on color alone. Pair color with text, iconography, structure, or emphasis.
6. Let themes change atmosphere, not interaction rules. Dark and Light should share the same semantic token contract.
7. Prefer clarity over spectacle. If a dramatic effect weakens scanning, keyboard use, or accessibility, remove it.

---

## Theme Model

The design system uses semantic tokens first, then maps those tokens to concrete theme values.

Supported built-in themes:
- `dark`: default dark, high-contrast, cinematic
- `light`: warm light, editorial, daylight-friendly

Theme contract rules:
- components consume semantic variables only
- theme switching updates `data-theme` on `document.documentElement`
- the saved `themeId` must be applied before first paint when possible
- any future theme must implement the full token set before it is considered supported

---

## Color System

### Visual cues extracted from the cover reference

- deep navy and charcoal backgrounds create the dramatic stage
- hot orange and gold highlights provide urgency and focal emphasis
- smoky mauve and concrete neutrals soften transitions between bright and dark areas
- saturated secondary colors are present, but they work best as contained accents rather than full-surface fills

### Semantic color tokens

| Token | Dark | Light | Usage |
|------|----------|-----------|-------|
| `primary` | `#F05A28` | `#C4471C` | Primary action fill, active indicators, key emphasis |
| `secondary` | `#355C7D` | `#4D6A80` | Supporting actions, selected chips, secondary emphasis |
| `accent` | `#F3B23C` | `#A96A12` | Highlight rules, badges, count emphasis, warm highlights |
| `background` | `#11131A` | `#F3EBDD` | Application canvas |
| `surface` | `#1B1F29` | `#FFF9F0` | Primary cards, panels, sheets |
| `surface-2` | `#242938` | `#EDE2D1` | Nested panels, secondary wells, control groups |
| `text-primary` | `#F6F2EA` | `#1E1A17` | Main content text |
| `text-secondary` | `#B6B2AA` | `#5C544B` | Supporting text, metadata, helper labels |
| `success` | `#5FB36A` | `#2F7A39` | Confirmations, valid states, positive badges |
| `warning` | `#E2A93B` | `#A96800` | Constraint warnings, caution states |
| `danger` | `#D64545` | `#B62828` | Destructive actions, invalid states, blocking errors |
| `focus` | `#7FD1FF` | `#005FCC` | Focus ring and keyboard emphasis |
| `border` | `#3A4153` | `#CDBDA7` | Standard outlines and separators |
| `shadow` | `rgba(0, 0, 0, 0.38)` | `rgba(54, 37, 17, 0.16)` | Panel and overlay shadow color |

Usage guidance:
- `primary` is reserved for the single strongest action in a local context.
- `accent` should highlight counts, active underlines, and important rules notes, not entire large surfaces.
- `secondary` supports filters, selected tabs, and medium-priority controls.
- `danger` should remain rare so reset and destructive moments keep their warning value.

Contrast expectations:
- body text on `background`, `surface`, or `surface-2` should target at least 4.5:1
- headings, button labels, and compact metadata should not drop below readable contrast in either theme
- focus indicators must remain visible regardless of surrounding accent colors

---

## Typography System

### Font directions

Headline stack:
`Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`

Use for:
- app title
- tab section titles
- stat callouts
- major panel headings

Why it fits:
- condensed local system faces create a poster-like, assertive silhouette without adding runtime dependencies

Body stack:
`"Segoe UI", "Helvetica Neue", Arial, sans-serif`

Use for:
- body copy
- labels
- buttons
- metadata
- helper text

Why it fits:
- highly available, clean, and compact enough for dense UI content

Monospace stack:
`"SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace`

Use for:
- IDs in diagnostics
- export/import previews
- token examples

Why it fits:
- readable across macOS, Windows, and Linux with no additional loading

### Type scale

| Role | Size | Line height | Weight | Usage |
|------|------|-------------|--------|-------|
| `display-lg` | `2.25rem` | `1.05` | `700` | Landing title, large hero heading |
| `display-md` | `1.75rem` | `1.1` | `700` | Primary page headings |
| `heading-lg` | `1.375rem` | `1.2` | `700` | Section headings, panel titles |
| `heading-md` | `1.125rem` | `1.25` | `700` | Card titles, dialog titles |
| `body-lg` | `1rem` | `1.5` | `400` | Default body text |
| `body-md` | `0.9375rem` | `1.45` | `400` | Dense labels, table rows |
| `body-sm` | `0.8125rem` | `1.4` | `500` | Metadata, helper text, badges |
| `label` | `0.75rem` | `1.2` | `700` | Tabs, pills, overlines |

Typography rules:
- use uppercase sparingly for tabs, overlines, and compact status labels only
- do not use the headline stack for long paragraphs
- maintain strong size contrast between panel titles and metadata to support scanning

---

## Spacing, Shape, and Layout

### Spacing tokens

| Token | Value | Usage |
|------|-------|-------|
| `space-1` | `0.25rem` | tight icon gaps, inline separators |
| `space-2` | `0.5rem` | small chip padding, compact row gaps |
| `space-3` | `0.75rem` | form stacks, metadata groups |
| `space-4` | `1rem` | standard component padding |
| `space-5` | `1.5rem` | panel interiors, section gaps |
| `space-6` | `2rem` | large layout gaps |
| `space-7` | `3rem` | page-section separation |

### Shape and elevation

Border radius tokens:
- `radius-sm: 0.375rem`
- `radius-md: 0.75rem`
- `radius-lg: 1rem`
- `radius-pill: 999px`

Border and shadow rules:
- standard stroke: `1px solid var(--color-border)`
- emphasized stroke: `1px solid color-mix(in srgb, var(--color-primary) 45%, var(--color-border))`
- panel shadow: `0 12px 28px var(--color-shadow)`
- overlay shadow: `0 18px 40px var(--color-shadow)`

Panel treatment:
- default panels use `surface`
- nested groups use `surface-2`
- high-importance cards may add a subtle top edge glow or warm inset highlight, but never a heavy gradient wall

### Layout density

Desktop:
- moderate density
- multi-column panels and grids are encouraged where scanning improves
- keep the working surface visible above the fold

Mobile:
- compact but not cramped
- prioritize single-column flow and persistent task visibility
- reduce decorative spacing before the user reaches core controls

### Breakpoints

| Breakpoint | Width | Intended behavior |
|-----------|-------|-------------------|
| `sm` | `< 600px` | single-column, compact shell, stacked controls |
| `md` | `600px - 899px` | two-column cards where helpful, tighter shell chrome |
| `lg` | `900px - 1199px` | standard desktop layout |
| `xl` | `>= 1200px` | wider content rhythm, denser grids for browse/history |

---

## Component Style Guidance

### App shell

Default:
- background uses `background`
- header uses `surface-2` with a strong lower border
- page content sits in a centered max-width frame with generous top spacing

States:
- active area should be reinforced with accent underlines or warm highlights, not full-surface saturation
- sticky elements must maintain clear separation from scrolling content via shadow or border

### Top navigation and tab navigation

Default:
- tabs use compact uppercase labels in the `label` role
- inactive tabs use `text-secondary`
- active tab combines `text-primary` with a `primary` underline or filled pill depending on viewport

Hover:
- text brightens toward `text-primary`
- background shift is subtle; avoid large hover blocks on desktop tabs

Focus:
- use a visible `focus` ring plus a shape-preserving outline

Disabled:
- lower contrast and remove hover lift

Selected:
- must remain identifiable without color alone by underline, fill, or weight change

### Cards and content panels

Default:
- use `surface` with `radius-lg`, standard stroke, and shadow
- titles align to the upper left with metadata stacked beneath

Hover:
- lift by `2px` to `4px` max
- border can warm slightly toward `primary`

Focus:
- outline sits outside the panel boundary

Disabled:
- reduce contrast and remove shadow lift

Selected:
- use a stronger border and a restrained inset accent bar

### Buttons

Primary:
- filled with `primary`
- text should be very dark in Dark and light in Light only if contrast requires it

Secondary:
- `surface-2` fill with `text-primary` label and clear border

Tertiary:
- text-forward, minimal chrome, used for less disruptive actions

Danger:
- filled or outlined with `danger` depending on emphasis level

Hover:
- brighten or darken slightly, no more than one visual change at a time

Focus:
- `focus` ring is required even when button is already filled brightly

Disabled:
- muted text, reduced fill contrast, no pointer affordance

Pressed:
- brief downward translation or shadow reduction only

### Filters and form controls

Default:
- controls sit on `surface-2`
- labels and help text remain outside or above controls when space allows

Hover:
- border contrast increases

Focus:
- strong `focus` ring plus clear border shift

Disabled:
- muted label and background, preserved legibility

Selected:
- chips and toggles use `secondary` or `primary` with text/icon reinforcement

Validation:
- invalid state uses `danger` border plus message text; do not rely on border color alone

### Badges and tags

Default:
- small, high-contrast labels with concise uppercase copy
- category badges may use restrained semantic fills

Selected:
- add stronger border or icon treatment

Warning or forced-state badges:
- prefer `accent` or `warning` rather than bright red unless truly destructive

### Alerts and notifications

Default:
- toast and inline alerts share a semantic pattern: icon, title or summary line, supporting text when needed

**Refined toast contract (Epic 24, updated Epic 69):**
- Toasts are bottom-anchored, fixed to the viewport bottom edge and outside the layout flow
- Animations (spring-animated enter and exit, `prefers-reduced-motion` fallback to fade-only) are managed by `svelte-sonner`; the custom `@keyframes` and `.toast*` CSS rules have been removed from `app-shell.css`
- Theme switching is intentionally silent — it does not emit a toast; the immediate UI repaint is the confirmation
- Toasts are reserved for meaningful feedback events (errors, warnings, and non-obvious preference outcomes such as locale changes)

Info:
- secondary-toned border or fill

Success:
- success border and icon accent

Warning:
- warning accent with readable dark text in light surfaces

Error:
- danger treatment with clear corrective copy

Focus and dismissal:
- action buttons inside notifications must keep a visible focus ring

### Dialogs and confirmations

Default:
- dialogs use `surface` on top of a darkened scrim
- title uses `heading-lg`
- destructive dialogs restate the consequence in plain language

Hover and focus:
- buttons and close actions use standard control behavior

Disabled:
- avoid disabled confirm buttons without explanation; add reason text if unavailable

Selected:
- active choice in segmented confirmation flows uses the same selected style as other controls

### Tables and structured lists

Default:
- rows use subtle separators rather than boxed grids where possible
- numeric or status data aligns consistently to aid scanning

Hover:
- highlight the active row lightly

Focus:
- keyboard focus must be visible at row or cell action level

Selected:
- selected rows use a structured left rule or checkbox state in addition to color

---

## Interaction and Motion

Motion style:
- fast
- subtle
- purposeful
- never decorative for its own sake

Recommended durations:
- color and border transitions: `120ms`
- hover elevation: `160ms`
- panel expand or collapse: `180ms` to `220ms`
- modal or toast entrance: `180ms` to `240ms`

Easing:
- use standard ease-out for entrances
- use ease-in-out for panel state transitions

Interaction guidance:
- hover should reinforce affordance, not reveal critical information hidden from touch users
- success and warning feedback should appear quickly after user action
- generated result panels may fade and lift into place, but animation must not delay comprehension

Reduced motion:
- respect `prefers-reduced-motion`
- remove translation-heavy effects first
- preserve state changes through color, contrast, and structure when motion is reduced

---

## Accessibility Guidance

Contrast:
- normal text should target at least 4.5:1 against its background
- large headings and heavy labels should still remain comfortably readable in both themes
- chip, badge, and button labels must not rely on low-contrast accent-on-accent pairings

Focus treatment:
- every interactive element needs a visible `focus` ring using the `focus` token
- focus ring should sit outside filled controls where possible
- focus must remain stable after rerenders, theme changes, locale changes, modal open and close, and tab switches

State communication:
- pair color with icon, text, weight, underline, or border pattern
- use explicit labels for destructive actions and forced setup conditions

Motion risks to avoid:
- long entrance animations on frequently used controls
- large background motion behind dense content
- flashing or repeated pulsing highlights

Keyboard and low-vision support:
- keyboard order should match visual order
- mobile bottom navigation must preserve large tap targets and clear current-tab state
- text resizing up to 200 percent should not hide critical actions or collapse panel structure

---

## Implementation Handoff

### Developer token contract

Recommended CSS custom property groups:
- color tokens: `--color-*`
- typography tokens: `--font-*`, `--type-*`
- spacing tokens: `--space-*`
- radius tokens: `--radius-*`
- shadow tokens: `--shadow-*`
- motion tokens: `--motion-*`

Example token block:

```css
:root[data-theme="dark"] {
  --color-primary: #F05A28;
  --color-secondary: #355C7D;
  --color-accent: #F3B23C;
  --color-background: #11131A;
  --color-surface: #1B1F29;
  --color-surface-2: #242938;
  --color-text-primary: #F6F2EA;
  --color-text-secondary: #B6B2AA;
  --color-success: #5FB36A;
  --color-warning: #E2A93B;
  --color-danger: #D64545;
  --color-focus: #7FD1FF;
  --color-border: #3A4153;
  --color-shadow: rgba(0, 0, 0, 0.38);

  --font-heading: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  --font-body: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;

  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-pill: 999px;

  --shadow-panel: 0 12px 28px var(--color-shadow);
  --shadow-overlay: 0 18px 40px var(--color-shadow);

  --motion-fast: 120ms;
  --motion-base: 180ms;
  --motion-slow: 240ms;
}
```

Consistency rules for implementation:
- introduce or update tokens before changing component rules
- avoid hard-coded per-component colors when an existing semantic token applies
- keep interaction-state logic parallel across buttons, tabs, filters, and cards
- validate both Dark and Light during every substantial visual change
- add documentation notes when a new semantic token is introduced so the token set stays governed

---

## Non-Goals

- no direct reuse of copyrighted cover artwork, logos, or title treatments
- no external styling framework adoption as part of this design-system direction
- no decorative animation layer that obscures task flow
- no theme-specific component forks that bypass the shared semantic token contract
