# Epic 83 Task List

## Epic 83 — Setup Tab: Forced Picks Layout Fix and Dropdown UX Improvement

**Objective**
Two UX problems in the Setup tab degrade the experience: expanding "Forced Picks" breaks the page
layout, and the dropdown component lacks visual polish. This epic fixes the layout regression and
improves the dropdown's appearance following a UX-expert consultation.

---

### Story 83.1 — Diagnose and fix the layout break caused by expanding the "Forced Picks" section

**Acceptance criteria:** Expanding "Forced Picks" no longer causes any visible layout overflow,
clipping, or misalignment in the Setup tab at any supported viewport width; the fix uses
design-system tokens and does not introduce hardcoded sizes or colours.

#### Diagnosis tasks

- [x] Open `src/components/NewGameTab.svelte` and locate the `<details>` element that wraps the
  Forced Picks panel (search for `data-forced-picks-panel`). Confirm the outer
  `<section class="two-col shell-two-col page-flow …">` structure and the inner
  `<section class="panel">` / `.stack.gap-md` hierarchy surrounding the `<details>`.

- [x] Open `src/app/app-shell.css` and audit the existing Forced Picks CSS rules:
  - `.forced-picks-pickers-grid` (line ~1038) — `display: grid; gap: var(--space-4);` and its
    two-column breakpoint at `480px` (line ~1044).
  - `.forced-pick-picker-row > select` (line ~1024) — `flex: 1 1 auto; min-width: 10rem;`.
  - `.forced-picks-section-divider` (line ~1032) — `border-top: 1px solid var(--border)`.
  - Check whether any `.two-col`, `.page-flow`, or `.panel` rule is missing `min-width: 0` or
    `overflow: hidden` that could allow the expanded grid to break out of its column.

- [x] Verify whether the `<section class="result-card" data-forced-picks-panel>` expands beyond
  the bounds of its parent `<section class="panel">` at narrow viewports (≤479 px) by inspecting
  computed widths: confirm the `.forced-picks-pickers-grid` children each get `min-width: 0` in
  the one-column stacked layout.

- [x] Check whether the `.forced-pick-picker-row` flex row (containing a `<select>` and a
  `<button>`) wraps correctly; the `<select>` carries `min-width: 10rem` — determine if this
  value forces horizontal overflow on viewports narrower than ~320 px.

#### Fix tasks

- [x] In `src/app/app-shell.css`, apply the minimum CSS changes required to prevent layout overflow
  when the Forced Picks `<details>` is opened:
  - Ensure the `<section class="result-card" data-forced-picks-panel>` (or its immediate
    container in the `.panel > .stack`) carries `min-width: 0` and `overflow: hidden` if needed,
    using only tokens (e.g. `var(--radius-md)` for any shape) and no hardcoded colours or sizes.
  - If `.forced-pick-picker-row > select`'s `min-width: 10rem` is confirmed to cause overflow at
    the smallest supported viewport, reduce it to a token-sized value (e.g. `min-width: 0`) and
    rely on `flex: 1 1 auto` to grow it appropriately.
  - Do not remove or rewrite any existing rules that are not part of the regression.

- [x] Confirm the fix holds for both the single-column layout (viewport `< 480px`) and the
  two-column `.forced-picks-pickers-grid` layout (viewport `≥ 480px`) by reviewing the CSS at
  the relevant `@media` breakpoints.

- [x] Do not touch `src/components/NewGameTab.svelte` HTML structure or JS logic for this story;
  the fix is CSS-only.

**Test:** Add a new test block `// ── Epic 83 — Story 83.1 ──` in
`src/app/app-shell.test.ts` that:
- Asserts `shellCss` matches `/.forced-picks-pickers-grid/` (the grid class is still present).
- Asserts `shellCss` does **not** match any hardcoded pixel colour or hex colour inside the
  Forced Picks rules (i.e. no string like `#[0-9a-fA-F]{3,6}` appearing inside a
  `.forced-pick` or `.forced-picks` selector block).
- Asserts that the layout fix rule references only CSS custom properties (i.e. `var(--…)`) for
  any newly introduced colour, spacing, or radius values.

---

### Story 83.2 — Consult a UX expert agent and document dropdown improvement recommendations

**Acceptance criteria:** A written UX recommendation note (inline in the epic file or a linked
document under `documentation/`) lists the proposed dropdown improvements, the rationale, and any
rejected alternatives before implementation begins.

#### Tasks

- [x] Invoke the UX expert agent (or the project's designer-group prompt at
  `prompts/designer-group.md`) and provide it with:
  - The current `<select>` markup from `src/components/NewGameTab.svelte` for the
    `[data-forced-pick-select]` elements and the `[data-preferred-expansion-select]` /
    `[data-forced-team-select]` elements.
  - The current CSS rules for `select` elements in `src/app/app-shell.css` (search for
    `.forced-pick-picker-row > select` and the `.locale-select-compact` block starting at line
    ~433, which shows the existing minimal-override pattern).
  - The full design-system token list from `:root` in `src/app/app-shell.css` (lines 1–120) so
    the agent can propose token-referenced values.

- [x] Collect the UX expert's written recommendations. The document must cover at minimum:
  - Visual appearance changes proposed (border style, border-radius, background, focus ring,
    padding, font-size, caret indicator, etc.).
  - Rationale for each proposed change.
  - Any rejected alternatives and the reason for rejection.
  - Whether the recommendations apply globally to all `<select>` elements or only to specific
    selectors (`.forced-pick-picker-row > select`, `[data-preferred-expansion-select]`, etc.).

- [x] Create the recommendation note at
  `documentation/ux/reports/epic-83-dropdown-ux-recommendations.md` and include all of the
  above. The implementation story (83.3) must not begin until this document exists and has been
  reviewed.

- [x] Update this task list (or this section) with a link to the recommendation document once it
  is created.
  **Link:** [documentation/ux/reports/epic-83-dropdown-ux-recommendations.md](../../ux/reports/epic-83-dropdown-ux-recommendations.md)

**Test:** No automated test for this story. Completion is verified by the existence and content of
`documentation/ux/reports/epic-83-dropdown-ux-recommendations.md`.

---

### Story 83.3 — Implement the approved dropdown UX improvements with design-system tokens

**Acceptance criteria:** The dropdown matches the agreed UX design; all style values reference
design-system CSS tokens; no hardcoded colour, border, or spacing values are introduced.

#### Pre-implementation gate

- [x] Confirm that `documentation/ux/reports/epic-83-dropdown-ux-recommendations.md` exists and
  that Story 83.2 is marked complete before starting any implementation in this story.

#### CSS implementation tasks

- [x] In `src/app/app-shell.css`, add or update a `select` (or scoped `.forced-pick-picker-row >
  select`) rule block implementing all approved visual changes. Every property value must use a
  design-system CSS custom property from `:root`. Permitted token families:
  - Spacing: `var(--space-1)` … `var(--space-7)`
  - Radius: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-pill)`
  - Colour / surface: `var(--input-bg)`, `var(--border)`, `var(--border-focus)`, `var(--text)`,
    `var(--text-muted)`, `var(--panel-2)`, etc.
  - Typography: `var(--type-body-md-size)`, `var(--type-body-md-line)`, `var(--font-body)`
  - Motion: `var(--motion-fast)` for any `transition`
  - Shadow: `var(--shadow)` or token-based `box-shadow` if approved

- [x] If the recommendations call for a focus ring change, follow the existing pattern from
  `.locale-select-compact:focus-visible` (line ~447 in `src/app/app-shell.css`):
  `outline: 2px solid var(--border-focus); outline-offset: 2px;`.

- [x] If a caret/chevron indicator is approved, implement it without any background-image data
  URI containing hardcoded colours; use an `::after` pseudo-element on a wrapper `<div>` or an
  SVG `mask-image` referencing a `currentColor`-based icon, with colour set via
  `var(--text-muted)`. (Caret replacement not approved per UX recommendations — native arrow
  retained.)

- [x] Do not introduce any new JavaScript, Svelte reactivity, or changes to
  `src/components/NewGameTab.svelte` for this story; styling changes only.

- [x] Verify the updated dropdown renders correctly in both dark theme (`:root[data-theme='dark']`)
  and light theme (`:root[data-theme='light']`) by reviewing which tokens are overridden in the
  light-theme block of `src/app/app-shell.css` (starting at line ~170).

- [x] Verify the `disabled` state of `<select>` elements (used when `availableOptions.length === 0`
  in `NewGameTab.svelte`) is still visually distinguishable with the new styles, using
  `var(--text-muted)` or `var(--border)` for the disabled appearance.

**Test:** Add a new test block `// ── Epic 83 — Story 83.3 ──` in `src/app/app-shell.test.ts`
that:
- Asserts `shellCss` contains the new dropdown rule (e.g. matches a regex for
  `.forced-pick-picker-row > select` or the agreed selector with at least one token-based
  property).
- Asserts the new rule does **not** contain a hardcoded hex colour value (regex
  `/#[0-9a-fA-F]{3,6}/` must not match inside the new block).
- Asserts the focus-visible rule references `var(--border-focus)`.

---

### Story 83.4 — Test: layout fix and dropdown styles

**Acceptance criteria:** `npm run lint` passes; existing unit and integration tests pass; at least
one new test verifies the Forced Picks layout is stable when expanded, and at least one test
checks the dropdown renders with the updated styles.

#### Unit / integration test tasks

- [x] Ensure the Story 83.1 test block added in `src/app/app-shell.test.ts` covers:
  - Presence of `.forced-picks-pickers-grid` rule.
  - Absence of hardcoded values inside Forced Picks CSS rules.
  - Layout fix rule uses only token-based values.

- [x] Ensure the Story 83.3 test block added in `src/app/app-shell.test.ts` covers:
  - Presence of the new or updated `select` styling rule with a token-based property.
  - Absence of hardcoded hex colours in the new rule.
  - Focus-visible rule references `var(--border-focus)`.

- [x] In `src/components/NewGameTab.test.ts`, add a test block
  `// ── Epic 83 — Story 83.1 — Forced Picks layout ──` that:
  - Asserts `newGameTabSource` still contains `data-forced-picks-panel` (the panel attribute
    must not be removed during the CSS fix).
  - Asserts the Forced Picks `<details>` element wraps a `<section class="result-card"
    data-forced-picks-panel>` (the inner `result-card` class must remain intact so the existing
    card styling applies and the layout context is preserved).
  - Asserts the `<select>` elements inside the Forced Picks panel carry
    `data-forced-pick-select` attributes (confirming the markup contract is intact).

#### Visual regression / Playwright task (optional but recommended)

- [ ] If the project has a Playwright visual-regression baseline workflow, add a test in
  `test/playwright/` named `epic83-forced-picks-layout.spec.ts` that:
  - Navigates to the Setup tab.
  - Opens the Forced Picks `<details>` panel by clicking `[data-forced-picks-panel] summary`
    (following the same pattern as `test/playwright/epic46-active-filter.spec.ts` and
    `test/playwright/epic49-clear-selection.spec.ts`).
  - Takes a screenshot or uses a `toBeVisible()` assertion on
    `[data-forced-picks-panel]` to confirm no overflow or clipping.
  - Optionally asserts computed CSS for the `[data-forced-pick-select]` element to confirm the
    border and background match the design-system token values.

**Test (self-referential):** This story's completion is verified by the presence and content of
the test blocks added in `src/app/app-shell.test.ts` and `src/components/NewGameTab.test.ts`.

---

### Story 83.5 — QC (Automated)

**Acceptance criteria:** Run `npm run lint` then `npm test`; all checks pass with no regressions.

**QC (Automated):**

- [ ] Run `npm run lint` — must exit 0 with no errors or warnings across all files changed in this
  epic (`src/app/app-shell.css`, `src/app/app-shell.test.ts`, `src/components/NewGameTab.test.ts`,
  and optionally `test/playwright/epic83-forced-picks-layout.spec.ts`).

- [ ] Run `npm test` — all pre-existing unit and integration tests must continue to pass; the new
  Story 83.1 and 83.3 test blocks in `src/app/app-shell.test.ts` must pass; the new Story 83.4
  block in `src/components/NewGameTab.test.ts` must pass.

- [ ] If `test/playwright/epic83-forced-picks-layout.spec.ts` was created, run
  `npx playwright test test/playwright/epic83-forced-picks-layout.spec.ts` and confirm all
  assertions pass.

- [ ] Confirm no regressions in related test files:
  - `src/components/NewGameTab.test.ts` (Epic 80, 25, 78, 72 blocks must still pass).
  - `src/app/app-shell.test.ts` (design-system token and typography blocks must still pass).

- [ ] Report pass/fail results and any regressions back to the dispatcher.
