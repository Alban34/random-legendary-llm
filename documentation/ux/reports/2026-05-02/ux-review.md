# UX Review — Legendary: Marvel Randomizer
**Review date:** 2026-05-02  
**Reviewer:** UX Manager (synthesized from delegated expert reviews)  
**Prior review:** 2026-04-10 (`documentation/ux/review.md`)  
**This review covers:** New epics completed since April 10, 2026 (E69–E74) plus full app re-audit.

---

## 1. Executive summary

The app continues to mature. The structural UX problems identified in the April 2026 review have been partially or fully resolved: the Backup tab is now clearly separated into Portability / Maintenance / Danger Zone, the mobile header chrome is substantially compressed (81px vs the previous ~367px), theme switching correctly restores focus to the triggering button, and locale changes emit a toast confirmation from every tab.

However, two critical production defects were introduced by Epic 74 (Forced Hero Team): a raw locale key is displayed to users in the Forced Picks panel, and the locale selector's `aria-label` attribute has a pre-existing typo that renders a raw key string to all assistive-technology users in every locale. Both are must-fix defects.

The five new game-facing features added in Epics 70–74 (Preferred Expansion, Epic Mastermind, Active Expansions collapse, Solo Always-Leads suppression, Forced Hero Team) are functional and integrated, but the Forced Picks panel has grown dense enough that it now warrants structural reorganization. The app's README has not been updated to describe any of these features.

**Main strengths:** Compact and functional mobile shell; effective danger zone separation in Backup; clean History grouping with 6 modes; locale and theme switching work correctly for sighted users; light theme is polished and consistent.

**Main weaknesses:** Two live accessibility/usability defects in the localization layer; Forced Picks panel is the longest and most cognitively complex section in the app and will worsen with each additional forced-pick type; README is materially outdated.

**Biggest opportunities:** Fix the two locale key defects immediately; restructure the Forced Picks panel before adding further options; update README to accurately describe the current product.

**Desktop vs mobile:** Desktop has more space to absorb the Forced Picks panel density. Mobile feels the density more acutely because each control occupies a larger proportion of the visible viewport. The Epic Mastermind grouping overflow is the same on both but is more jarring on narrow viewports.

---

## 2. Desktop experience

Desktop is functional and coherent. The two-column New Game layout (controls left, result right) works well once a setup is generated. The Browse tab is organized with a clear welcome area, collapsible "Start here" disclosure, and a well-filtered set catalog. The Collection tab provides a clean Sets / Browse Cards toggle. The Backup tab's three-panel structure is a genuine improvement from the previous review.

**Main strengths:** Adequate column width for the forced-picks forms; readable heading hierarchy throughout; Backup is now the clearest tab in the app; locale and theme controls are compact and accessible (modulo the aria-label defect).

**Main weaknesses:** The Forced Picks panel stacks too many controls in a single accordion and will require 3+ scrolls to traverse at common desktop widths. The "Epic Mastermind" grouping pill in History wraps to a second row on all viewport widths below approximately 900px. Three separate status cards in New Game waste vertical space on secondary metadata.

---

## 3. Mobile experience

Mobile at 733px (the review width, below the 768px desktop breakpoint) showed the mobile bottom tab bar with five tabs, the compact 81px header, and the full product. All five tabs are functional and reachable.

The header chrome improvement since April 2026 is significant — 81px header plus 56px bottom nav leaves approximately 527px of content area, compared to the approximately 358px measured in the prior review. Mobile is no longer critically viewport-constrained.

**Main strengths:** Mobile header is now compact and task-focused; bottom navigation tab bar is clear; Backup restructuring benefits mobile most of all; locale and theme preferences remain accessible.

**Main weaknesses:** Forced Picks panel on mobile requires even more scroll than desktop to traverse because form elements are taller on touch devices. The four CTAs in the Browse welcome area feel competitive at phone widths. "Reset All Selections" in Collection is too prominent above the content it affects.

---

## 4. Must change

### Issue 1 — Forced Hero Team locale keys missing from runtime locale file

**Affects:** Both  
**Where it appears:** New Game tab → Forced picks panel (expanded), below the Henchman Group controls.  
**Evidence:** Live review confirmed `<p data-forced-team-unavailable>` renders the raw string `newGame.forcedPicks.forcedTeam.unavailable` instead of "No heroes in the active collection have a team affiliation". Root cause: the 5 `forcedTeam.*` keys added by Epic 74 to `en.mjs` were not added to `en.ts`. The runtime imports from `en.ts`; the lookup falls through to the key-string fallback for all 5 keys (`label`, `placeholder`, `active`, `clear`, `unavailable`). All other locale `.ts` files are missing the same keys.  
**Why it is critical:** Users see raw internal identifiers instead of human-readable text. Screen readers announce the raw key. The Forced Team feature — one of Epic 74's core user-facing additions — is functionally broken from a text rendering perspective in every language.  
**Recommended change:** Add all 5 `forcedTeam.*` keys to `src/app/locales/en.ts`. Ensure corresponding translations are added to all other `.ts` locale files (fr.ts, de.ts, ja.ts, ko.ts, es.ts). Reconcile the `.mjs`/`.ts` duplication so future locale additions flow to the runtime-used files.  
**Expected UX improvement:** The Forced Team feature will display its text correctly in every locale and render readable content to assistive technologies.

---

### Issue 2 — Locale selector `aria-label` shows a raw key string due to source code typo

**Affects:** Both  
**Where it appears:** Shared header — locale selector, visible on all tabs in every locale.  
**Evidence:** Live inspection confirmed `aria-label="header.locale!.groupLabel"` on the locale selector in every locale. Source code root cause in `src/components/App.svelte` line 1385: `aria-label={locale!.t('header.locale!.groupLabel')}` — the TypeScript non-null assertion `!` was accidentally placed inside the string literal, producing a malformed key that is never found in any message catalog. The correct key is `header.locale.groupLabel`.  
**Why it is critical:** Screen readers announce `"header.locale!.groupLabel"` to every assistive-technology user in every supported language. The locale selector is a globally visible, globally used control. This is a WCAG 4.1.2 (Name, Role, Value) failure.  
**Recommended change:** Fix the string literal in `src/components/App.svelte` line 1385 by removing the `!` from inside the key string: `aria-label={locale.t('header.locale.groupLabel')}`.  
**Expected UX improvement:** The locale selector will have the correct accessible name ("Choose language" / "Choisir la langue" / etc.) for all assistive-technology users in all locales.

---

### Issue 3 — README.md omits 5 new game-facing features

**Affects:** Both (documentation)  
**Where it appears:** `README.md` "Why you'll love it" and "All play modes covered" sections.  
**Evidence:** README.md was last updated for the product as it existed before Epics 70–74. The following shipped features are not mentioned: Preferred Expansion Priority (E70), Epic Mastermind mode (E71), Active Expansions filter (E72), Solo "Always Leads" suppression (E73), and Forced Hero Team (E74).  
**Why it is critical:** README.md is the product's primary discovery document for users and contributors. Missing features are invisible to anyone who reads README before trying the app, and contributors may incorrectly assume features do not exist.  
**Recommended change:** Add 2–3 new bullets to the "Why you'll love it" section covering (a) the expanded forced-picks capabilities (Preferred Expansion + Forced Team), (b) Epic Mastermind mode, and (c) Active Expansions filtering. Update the "All play modes covered" note to mention the solo "Always Leads" suppression.  
**Expected UX improvement:** README will accurately describe the shipped product, users will discover new features, and contributors will understand the current scope without reading all epic task lists.

---

## 5. Should change

### Issue 4 — Forced Picks panel cognitive overload with 8+ stacked controls

**Affects:** Both (worse on mobile)  
**Where it appears:** New Game tab → Forced picks accordion (expanded).  
**Evidence:** Live review confirmed 9 stacked content blocks in the expanded panel: heading + explanation, Scheme, Mastermind, Hero, Villain Group, Henchman Group, Preferred Expansion message, Forced Team message, Active Constraints. At 664px viewport height, traversing the panel from top to bottom requires approximately 3 full scrolls. The Scheme input layout (horizontal: label + dropdown + button) is inconsistent with all other inputs (vertical: label, dropdown, button stacked). The section heading "Forced picks" is duplicated (accordion toggle + H3 inside the panel).  
**Why it matters:** The panel has accumulated new items (Preferred Expansion, Forced Team) without structural reorganization. Each addition increases traversal cost. Users who want to set a specific forced pick must scroll past all types they are not using. The duplicate heading wastes space. Layout inconsistency reduces predictability.  
**Recommended change:** (1) Remove the duplicate H3 inside the accordion body. (2) Normalize button layout to a consistent pattern across all forced-pick types. (3) Group controls into "Card picks" (scheme/mastermind/hero/villain/henchman) and "Session settings" (preferred expansion, forced team, epic mastermind) with a visual sub-divider. (4) Move "Active constraints" summary to a persistent location above the Generate Setup button, outside the accordion.  
**Expected UX improvement:** The panel will scan faster, the layout will be predictable, and users will find their target control with less scrolling. Active constraints will always be visible without opening the panel.

---

### Issue 5 — "Epic Mastermind" grouping button wraps to a second orphaned row

**Affects:** Both  
**Where it appears:** History tab → grouping button row (Mastermind, Scheme, Heroes, Villains, Player Mode, Epic Mastermind).  
**Evidence:** Live review confirmed that at 733px, the first 5 grouping buttons fill one row and "Epic Mastermind" appears alone on a second row. The visual result makes "Epic Mastermind" appear to be a different class of control rather than another grouping option in the same family.  
**Why it matters:** Users scanning the grouping options may miss "Epic Mastermind" or misinterpret its role. The visual separation reduces grouping control coherence.  
**Recommended change:** Use a horizontally scrollable pill row (overflow: auto, no wrapping) so all 6 grouping options always appear in a single visual row. Alternatively, use a compact `<select>` or chip group that avoids orphan pills at any viewport width.  
**Expected UX improvement:** All grouping options will be perceived as a coherent family at every viewport width.

---

### Issue 6 — `ui-design.md` "Always leads" indicator lacks solo-mode suppression caveat

**Affects:** Both (documentation)  
**Where it appears:** `documentation/ux/ui-design.md` Tab 3 — New Game result-view specification.  
**Evidence:** Epic 73 Story 2 confirmed that in solo modes, `leadEntity` is suppressed in the result view. The ui-design.md result-view interactions list states "★ marks the forced Mastermind villain group" without clarifying that this is only shown in multiplayer/Two-Handed Solo modes, and that it is suppressed in Standard Solo, Advanced Solo, and Standard Solo v2.  
**Why it matters:** QA and contributors reading the spec in isolation may not test solo-mode suppression and may not understand that the indicator has mode-dependent behavior. Future regressions are more likely.  
**Recommended change:** Expand the "★ marks the forced Mastermind villain group" line to add: "In Standard Solo, Advanced Solo, and Standard Solo v2 modes the mastermind lead is not forced — the label and ★ mark are suppressed."  
**Expected UX improvement:** The specification will unambiguously describe when the indicator appears, reducing regression risk.

---

### Issue 7 — No skip-navigation link to bypass header controls

**Affects:** Both  
**Where it appears:** All tabs — keyboard focus order starts at the locale selector.  
**Evidence:** Live keyboard testing confirmed the focus order: locale selector → Dark button → Light button → GitHub link → main content. There is no "Skip to main content" link before the header interactive elements.  
**Why it matters:** WCAG 2.4.1 (Bypass Blocks) recommends a mechanism to skip repeated navigation. While 4 header items is relatively low overhead, the absence of a skip link becomes more problematic with any future header expansion and degrades the experience for switch-access and screen-reader users.  
**Recommended change:** Add a visually hidden `<a href="#main-content">Skip to main content</a>` as the first focusable element in the document, visible on keyboard focus. Link it to the `<main>` element.  
**Expected UX improvement:** Keyboard users can reach the active tab panel immediately without tabbing through all header controls.

---

## 6. Nice to change

### Issue 8 — New Game status cards use three separate boxes for secondary metadata

**Affects:** Both  
**Where it appears:** New Game tab → setup control column, between Play Mode buttons and Setup Requirements.  
**Evidence:** Three individual cards ("Selected mode", "Owned sets", "Last persisted mode") each occupy a full-width rounded box, consuming approximately 280px of vertical space in the left column at 664px viewport height. "Last persisted mode" is especially secondary — it shows the state from the previous session, rarely needed during active setup.  
**Expected benefit:** Consolidating into a single compact summary line or one small card would reduce 150–200px of vertical space and bring the Generate Setup button and Forced Picks closer to the mode-selection controls.  
**Recommended change:** Replace the three cards with a single compact summary row. Consider removing "Last persisted mode" from primary visibility entirely or showing it in a tooltip.

---

### Issue 9 — Browse welcome area has four competing CTAs

**Affects:** Mobile (more pronounced on narrow viewports)  
**Where it appears:** Browse tab → welcome/hero area.  
**Evidence:** After onboarding is dismissed, four buttons are presented: "Generate a Game" (primary), "Manage Collection", "Replay Walkthrough", "About this project". The two utility actions (Replay Walkthrough, About this project) compete visually with the primary call-to-action on every Browse visit for returning users.  
**Expected benefit:** Reducing to two CTAs ("Generate a Game" primary, "Manage Collection" secondary) would make the welcome area more decisive and reduce visual weight.  
**Recommended change:** Move "Replay Walkthrough" into the "▶ Start here" disclosure. Move "About this project" to a footer or a small icon button in the header.

---

### Issue 10 — Collection tab "Reset All Selections" button precedes all content

**Affects:** Both  
**Where it appears:** Collection tab → first interactive element after the page heading.  
**Evidence:** "Reset All Selections" appears above the Sets/Browse Cards view toggle, above the set stats, and above the set list. On mobile, it is the first thing a user's thumb encounters after tapping Collection.  
**Expected benefit:** Moving it to the bottom of the Sets view would follow the convention of placing destructive actions near what they affect, and reduce accidental activation risk.  
**Recommended change:** Move "Reset All Selections" to below the expansion checklist with a brief consequence reminder.

---

## 7. Assumptions and gaps

- **Result entry flow** (after Accept & Log) was not validated — no history records exist in the test session. Prior "must change" finding about result editor focus placement remains unvalidated in this review cycle.
- **Onboarding step-by-step focus management** was not fully tested — only the "Skip for now" path was exercised.
- **Active Expansions collapsed section** (Epic 72) was not visible because the test collection has 0 owned sets. The toggle button and aria-expanded behavior could not be directly validated.
- **Epic Mastermind opt-in controls** (Epic 71) were not visible because no X-Men expansion is owned in the test session. The mode control UI and error state were not reviewed live.
- **Preferred Expansion selector** (Epic 70) could not be tested — requires at least 2 owned expansions. Only the "Own at least 2 expansions" disabled-state message was observed.
- **Forced Team selector** (Epic 74) could not be fully tested — when active, the raw locale key defect prevents evaluation of the selector behavior.
- **Desktop viewport tab navigation** was not directly visible — the browser tool viewport is capped at 733px, below the 768px desktop breakpoint. Desktop header tab layout was confirmed in DOM but not exercised visually.

---

## 8. Environment used

- **Command used:** `npm run dev -- --port 5173` (Vite dev server)
- **URL reviewed:** `http://127.0.0.1:5173/`
- **Desktop viewport:** 733×664px — the maximum available in the browser tool. This is below the 768px desktop breakpoint, so mobile bottom-tab navigation was active. Desktop header tabs were confirmed as DOM elements with `display: none`. All layout and interaction reviews were performed at this viewport.
- **Mobile viewport:** Same viewport (733×664px) used for mobile observations. A representative 390×844px viewport could not be set due to tool constraints. Header and bottom nav heights were measured programmatically.
- **Limitation:** The browser tool does not support arbitrary viewport resizing. All screenshots and DOM measurements reflect a 733×664px viewport. Observations about "desktop" behavior are based on source code inspection and DOM state, not direct visual review at a true desktop width. True desktop layouts (≥900px multi-column grid, header tab navigation) were not directly observed.
- **App state:** Fresh session, no owned sets, no history records. Many conditional UI elements (Preferred Expansion selector, Active Expansions filter, Epic Mastermind controls, Forced Team selector with teams) were not testable.

---

## 9. Final recommendation

The app's current UX is **acceptable to strong** for a fan-made companion tool, with genuine quality in the core New Game flow, the redesigned Backup tab, and the multi-language experience. The April 2026 structural improvements are visible and have materially improved the mobile experience.

However, two production defects must be addressed before the next public release: the broken `forcedTeam.*` locale keys and the `aria-label` typo on the locale selector. Both are easy to fix, high-impact, and currently degrading the experience for all users including those using assistive technology.

**The three changes that would most improve the product next:**

1. **Fix the locale key defects (Issues 1 and 2)** — Add the 5 missing `forcedTeam.*` keys to all `.ts` locale files and fix the `!` typo in the `aria-label` key string. Combined engineering effort: under 1 hour. Impact: restores correct text rendering and accessible naming for two globally visible elements.

2. **Restructure the Forced Picks panel (Issue 4)** — The panel has grown beyond the capacity of a single flat accordion. Grouping "Card picks" and "Session settings", removing the duplicate heading, normalizing button layout, and surfacing active constraints outside the accordion will make the New Game tab dramatically faster to use as the forced-pick feature set continues to grow.

3. **Update README.md (Issue 3)** — Add the 5 new features (Preferred Expansion, Epic Mastermind mode, Active Expansions, Solo Always-Leads change, Forced Hero Team) to the product description. This is a documentation-only change that takes the README from describing a 6-month-old product to the current one.
