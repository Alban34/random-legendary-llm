# Epic 83 — Dropdown UX Recommendations

**Prepared for:** Story 83.2  
**Status:** Approved — implementation begins in Story 83.3

---

## Scope

These recommendations apply to the `<select>` elements inside the Forced Picks panel
(`.forced-pick-picker-row > select`, targeted via `[data-forced-pick-select]`). The
improvements are **scoped** to that selector rather than applied globally to all `<select>`
elements, to avoid unexpected regressions in other parts of the product that may rely on
browser-default styling or have separate overrides.

---

## Current state

The existing rule only sets flex-layout properties:

```css
.forced-pick-picker-row > select {
  flex: 1 1 auto;
  min-width: 10rem;
}
```

This leaves all visual appearance to the browser UA stylesheet. Across browsers and themes the
result is inconsistent: the select may appear with a non-matching background, border, and font
that clashes with the surrounding card surface (`var(--panel-2)`) and the design system's input
field language (`var(--input-bg)`).

---

## Proposed improvements

### 1. Background — `background: var(--input-bg)`

**Rationale:** Every other text input in the product uses `var(--input-bg)` as its background.
Dark mode maps this to `#161b25`; light mode to `#fffcf6`. Using the same token ensures the
select visually reads as an interactive input field rather than a button or a surface swatch.

**Rejected alternative:** `background: var(--panel-2)` — too close to the card surface, making
the control look inert.

---

### 2. Border — `border: 1px solid var(--border)`

**Rationale:** Mirrors the `border: 1px solid var(--border)` pattern used on `.text-input` and
`.panel`. Provides the 1-pixel boundary that separates the field from the card background and
signals interactivity.

**Rejected alternative:** `border: none` — removes the affordance entirely; users relying on
colour contrast would lose the field boundary.

---

### 3. Border-radius — `border-radius: var(--radius-md)`

**Rationale:** `var(--radius-md)` (`0.75rem`) is the radius used for `result-card` and
`text-input` elements. Aligning the select to `--radius-md` maintains visual consistency with
other interactive surfaces inside cards. The `.button` uses `--radius-pill` but it is a
call-to-action shape; the select is an input field.

**Rejected alternative:** `border-radius: var(--radius-sm)` — slightly too sharp relative to the
enclosing `result-card`.

---

### 4. Colour — `color: var(--text)`

**Rationale:** Uses the primary text token so the selected option label inherits the same colour
as surrounding content. Without an explicit `color`, browsers may render the select text in the
system default which can fail WCAG AA contrast in some themes.

---

### 5. Font — `font-family: var(--font-body)`, `font-size: var(--type-body-md-size)`

**Rationale:** Browsers do not inherit `font-family` or `font-size` into `<select>` by default.
Setting both tokens keeps the type ramp consistent with labels and button text in the same picker
row.

**Rejected alternative:** Omitting font overrides — inconsistent rendering across browsers
(Chrome, Firefox, Safari each apply different UA defaults).

---

### 6. Padding — `padding: var(--space-2) var(--space-3)`

**Rationale:** `--space-2` (`0.5rem`) vertical and `--space-3` (`0.75rem`) horizontal gives
comfortable tap/click targets without over-sizing the field. This aligns with the padding on
`.text-input`.

---

### 7. Focus ring — `outline: 2px solid var(--border-focus); outline-offset: 2px;`

**Rationale:** Follows the established pattern used by `.locale-select-compact:focus-visible` and
`.button:focus-visible` in the codebase. `var(--border-focus)` maps to `var(--color-focus)`:
`#7fd1ff` in dark mode, `#005fcc` in light mode — both pass WCAG AA contrast against their
respective backgrounds.

**Rejected alternative:** `box-shadow`-based focus ring — adds visual noise for users who only
rely on the focus indicator; the `outline` approach is more portable and respects
`prefers-reduced-motion` fallback patterns already in place.

---

### 8. Disabled state — `color: var(--text-muted); border-color: var(--border); cursor: not-allowed;`

**Rationale:** The `<select>` is `disabled` when `availableOptions.length === 0`. Reducing the
label colour to `var(--text-muted)` and keeping the border at `var(--border)` maintains the
field boundary while clearly signalling inertness. `cursor: not-allowed` provides the pointer
affordance.

**Rejected alternative:** `opacity: 0.4` — reduces contrast unpredictably across themes; the
explicit token approach is more readable and auditable.

---

## Theme compatibility

All tokens above are overridden in `:root[data-theme='light']`:

| Token | Dark value | Light value |
|---|---|---|
| `--input-bg` | `#161b25` | `#fffcf6` |
| `--border` | `#3a4153` | `#cdbda7` |
| `--border-focus` | `#7fd1ff` | `#005fcc` |
| `--text` | `#f6f2ea` | `#1e1a17` |
| `--text-muted` | `#6d6c76` | `#877c72` |
| `--radius-md` | `0.75rem` | `0.75rem` |

No hardcoded colour values are introduced; all changes automatically adapt to the active theme.

---

## Changes that are out of scope

- **Custom caret/chevron icon:** Requires a wrapper `<div>` and an `::after` pseudo-element or an
  SVG mask. The Forced Picks markup does not have a wrapper element for this pattern. The native
  browser arrow is acceptable given the current HTML constraints.
- **`appearance: none`:** Would remove the browser-native dropdown arrow on all platforms. Without
  a custom replacement icon (see above), removing the arrow would harm discoverability for
  first-time users.
- **Global `select` base rule:** Not recommended at this time. Other `<select>` elements in the
  product (e.g. the locale picker overlay) have bespoke positioning and opacity that would be
  broken by a global style reset.
