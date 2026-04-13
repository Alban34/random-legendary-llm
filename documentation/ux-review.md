## 1. Executive summary

The application already has strong product breadth, a coherent visual identity, and a capable core flow from collection management through setup generation, acceptance, history, and backup. Desktop is broadly usable and the New Game result presentation is especially clear once the user is inside the workflow. Theme switching, localization, grouped history, result logging, and backup portability all feel like real product features rather than placeholder scaffolding.

The weaknesses are structural rather than purely cosmetic. The documentation baseline no longer describes the shipped product cleanly, first-run and Browse surfaces still ask users to parse too much before acting, History gives too much prominence to analytics over record review, and Backup mixes safe maintenance with destructive actions too densely. The biggest immediate UX risks are accessibility and interaction continuity: preference changes in the shared header drop focus and provide weak confirmation, and result-entry validation does not guide recovery reliably.

The largest desktop opportunity is hierarchy: reduce landing-page competition, keep History acting like a logbook first, and isolate destructive maintenance. The largest mobile opportunity is space discipline: the phone experience spends too much viewport height on persistent chrome and supporting copy before the user reaches task content.

## 2. Desktop experience

Desktop is the stronger experience. The shared top navigation works, the Collection and New Game screens are readable, and the generated setup view has good scanability and enough space to communicate the result clearly. Advanced features such as play modes, forced picks, grouped history, results, theme switching, and localization all survive the larger layout without collapsing into obvious confusion.

The main desktop weakness is that too many surfaces try to explain, summarize, and analyze before helping the user act. Browse still behaves like a layered landing page instead of a direct working surface. History behaves too much like a dashboard. Backup remains understandable, but it is operationally dense and makes the user read too carefully around destructive actions.

Prioritized desktop findings:
- Browse opens with too many competing layers before the set catalog becomes the obvious next step.
- History places analytics ahead of the actual record list.
- Backup does not separate routine maintenance from the full-reset danger zone strongly enough.

## 3. Mobile experience

Mobile keeps the same functional breadth as desktop, which is valuable. The app still exposes the full product and the bottom tab bar keeps the primary destinations reachable. New Game remains workable, and the result cards themselves are legible once the user reaches them.

Mobile is materially weaker than desktop because the interface keeps too much persistent shell and explanatory content in a very short viewport. The large shared header, fixed bottom navigation, onboarding copy, Browse orientation content, History insights, and Backup maintenance stack combine into a scroll-heavy experience. The phone layout is not broken, but it is much less disciplined than it should be.

Prioritized mobile findings:
- Persistent shell chrome consumes too much viewport height before the user reaches active content.
- Browse delays the actual set catalog too far below the fold.
- History turns into a long analytics report too quickly.
- Backup becomes a long stack of similar maintenance and reset actions.

## 4. Must change

### Issue
Header preference changes drop focus and do not provide dependable same-surface confirmation.

### Where it appears
Shared header theme buttons and locale selector on desktop and mobile.

### Evidence
The runtime audit confirmed that both theme and locale changes succeed but leave keyboard focus on the page body after rerender. The visible `Latest action` confirmation is only rendered in Collection, so the same interaction has no dependable local confirmation channel from most tabs.

### Why it is critical
These are global, high-frequency controls. Losing focus after activation is disorienting for keyboard and assistive-technology users, and weak confirmation makes the interaction feel unreliable even when it worked.

### Recommended change
Restore focus to the triggering theme button or locale select after rerender, and surface a header-adjacent confirmation message or polite toast that is available from any tab.

**Partial resolution (Epic 24):** Theme switching is now silent — the UI repaints immediately and no toast is emitted. Focus restoration for theme and locale controls was also addressed. Locale-change confirmation via toast remains in scope for future review.

### Expected UX improvement
Theme and language changes will feel anchored, reversible, and trustworthy across the whole app.

### Issue
Result entry opens out of context and validation errors do not guide recovery accessibly.

### Where it appears
Immediate result entry after `Accept & Log` and later result editing from History on desktop and mobile.

### Evidence
The runtime audit confirmed that opening the result editor leaves focus on the page body instead of moving into the form. Invalid saves render warning text but do not announce the error semantically or connect it to the invalid field state.

### Why it is critical
This is the app’s most important follow-up workflow after generating and logging a game. Users who rely on keyboard or assistive technology are not placed into the newly opened task and are not guided cleanly when they make a recoverable mistake.

### Recommended change
Move focus into the result editor when it opens, move focus to the error summary or first invalid field on validation failure, and wire form errors with live announcement plus field-level invalid state.

### Expected UX improvement
Result logging becomes a guided continuation of the New Game flow instead of a hidden side effect, and correcting mistakes becomes predictable and low-friction.

## 5. Should change

### Issue
The documentation baseline no longer gives one trustworthy description of the shipped product.

### Where it appears
`documentation/ui-design.md`, `documentation/roadmap.md`, `documentation/task-list.md`, and related documentation compared with `README.md`, `documentation/architecture.md`, `documentation/data-model.md`, `documentation/setup-rules.md`, and the shipped test/QC contracts.

### Evidence
The repository ships a five-tab product with Backup, onboarding, theme and locale controls, play-mode selection, forced picks, result entry, grouped history, and insights. The primary UI spec and some roadmap/task references still describe an older four-tab shell and omit major shipped New Game and History behavior.

### Why it matters
Future UX work has no single reliable contract for navigation, first-run behavior, or the core recurring workflows. That invites avoidable drift and makes it harder to judge whether the live product is aligned with intent.

### Recommended change
Update the documentation set so one canonical current-shell and current-flow contract exists across navigation, onboarding, New Game, History, Backup, theme, and locale behavior.

### Expected UX improvement
UX decisions, QA, and future refinement work will evaluate the same product instead of different historical snapshots.

### Issue
Browse still front-loads too much explanation before the user can browse sets.

### Where it appears
Browse on first run and returning-user default states, on both desktop and mobile.

### Evidence
Desktop shows onboarding, welcome content, CTA buttons, summary metrics, checklist content, and then the catalog. Mobile is worse: after onboarding is skipped, the set catalog does not begin until roughly `1216px` down the page on a `390x844` viewport.

### Why it matters
The product’s entry surface behaves like a stacked explainer instead of a working tool. That slows the first meaningful action and makes returning users re-pay orientation cost.

### Recommended change
Reduce Browse to one concise intro, one primary CTA, and immediate access to filters and the catalog. Move secondary checklist material fully into onboarding or collapse it behind optional disclosure.

### Expected UX improvement
The first useful action becomes obvious faster, and Browse feels more like an active collection tool than a landing page.

### Issue
History prioritizes analytics too early and weakens record review.

### Where it appears
History on desktop and mobile after accepted games exist.

### Evidence
Desktop spends much of the first viewport on KPIs and coverage summaries before the actual logbook becomes prominent. On mobile, the first grouped record is followed by a long analytics stack that dominates the rest of the tab.

### Why it matters
Users come to History mainly to review, scan, and edit played games. When analytics outrank records, the tab becomes less effective as a practical logbook.

### Recommended change
Keep grouped records primary, then reveal insights below them, behind a collapsible section, or in a secondary presentation mode.

**Partial resolution (Epic 23):** Per-category stats are now full-width collapsible panels appearing after grouped records. Insights stay secondary and mobile already collapses them behind a reveal button. Remaining hierarchy refinements (KPI prominence, record density) are deferred to future iterations.

### Expected UX improvement
History becomes faster to resume and more aligned with its core purpose while preserving the value of the insights layer.

### Issue
Backup mixes routine maintenance and destructive actions too densely.

### Where it appears
Backup on desktop and mobile, especially in the used-card reset and full-reset area.

### Evidence
The same screen stacks export/import, five per-category reset controls, reset explanation copy, reset preview, and `Full Reset - Clear all data`. On mobile, the screen becomes a long stack of structurally similar reset actions.

### Why it matters
Users have to read carefully to distinguish safe upkeep from destructive removal. That increases cognitive load and makes the screen feel riskier than necessary.

### Recommended change
Split Backup into clearer sections: export/import, routine freshness maintenance, and a distinct danger zone for full reset. On mobile, collapse routine reset controls behind an accordion or secondary maintenance area.

### Expected UX improvement
Backup becomes calmer to scan, routine upkeep feels safer, and destructive intent becomes much harder to miss.

**Resolved (Epic UX6):** The Backup tab was restructured into three clearly separated panels: a Portability panel (`data-backup-portability-panel`) containing export/import controls and backup preview; a Maintenance panel (`data-backup-maintenance-panel`) containing per-category usage-reset controls, rendered as a collapsible `<details>` accordion on mobile; and a Danger Zone panel (`data-backup-danger-zone`) with consequence copy and the full-reset button. New CSS classes (`.danger-zone`, `.maintenance-accordion`, `.maintenance-accordion-summary`, `.maintenance-accordion-body`) enforce the visual separation. New localization keys (`backup.portabilityDescription`, `backup.maintenanceTitle`, `backup.dangerZoneTitle`, `backup.dangerZoneConsequence`) provide section headers and consequence framing in both EN and FR locales.

### Issue
The mobile shell uses too much persistent chrome before active content can breathe.

### Where it appears
Shared mobile shell across first-run Browse, New Game, Backup, and other phone-sized views.

### Evidence
At `390x844`, the shared header measured about `367px` tall and the fixed bottom navigation about `119px` tall, leaving roughly `358px` of unobstructed height for the active task area.

### Why it matters
Phone UX depends on ruthless vertical prioritization. The current shell consumes too much of the viewport with branding, preferences, and navigation before the user reaches the active panel.

### Recommended change
Compress the header, shorten or hide the descriptive app blurb after first run, and move language/theme controls into a lighter preferences pattern.

### Expected UX improvement
Mobile tabs will feel faster, less crowded, and more task-focused.

**Partial resolution (Epic 25):** The header `h1` font size was reduced to 1.1rem and header padding was tightened. The app version now appears as a compact muted inline element beside the title. The primary New Game action (Generate Setup / New Setup) was moved above the forced-picks disclosure so users reach the critical control earlier without scrolling. Theme and locale controls remain in their responsive positions but the overall header footprint is materially smaller.

### Issue
Onboarding progression breaks keyboard continuity.

### Where it appears
Next and previous step actions in the onboarding walkthrough on desktop and mobile.

### Evidence
The runtime audit confirmed that step progression rerenders the shell and leaves focus on the page body instead of preserving a meaningful onboarding focus target.

### Why it matters
The walkthrough is supposed to reduce first-run uncertainty. Losing focus after every step turns it into repeated reorientation work.

### Recommended change
Restore focus to the equivalent onboarding control after each step change or move focus to the new step heading when the step content changes substantially.

### Expected UX improvement
The walkthrough behaves like a continuous guided flow instead of a sequence of disconnected screen refreshes.

## 6. Nice to change

### Issue
Some supporting metrics and explanatory text are still carrying too much visual weight relative to action controls.

### Where it appears
Browse summaries, History insight cards, and Backup explanatory copy.

### Evidence
Across the reviewed screens, secondary explanatory content is usually well written but often presented with enough size and persistence that it competes with task controls instead of supporting them.

### Expected benefit
The app would feel more decisive, lighter, and more polished without sacrificing clarity.

### Recommended change
Trim repeated helper copy after first successful use, reduce the visual weight of secondary summaries, and use progressive disclosure more aggressively for low-frequency explanation.

**Partial resolution (Epic 23):** The grouping-notice technical disclaimer was removed from the history surface. Storage-health status is now suppressed during normal operation and only surfaces when the app requires user action. Remaining helper copy in Browse summaries and Backup is deferred to future iterations.

## 7. Assumptions and gaps

- The review assumed the repository’s built-in dev server is the intended local runtime because both `README.md` and the Playwright configuration point to that path.
- The integrated browser was available for opening the app but not for in-chat DOM inspection, so live validation relied on Playwright interaction, screenshots, and runtime measurements instead.
- The review validated representative desktop and mobile states, not every locale/theme combination exhaustively by hand, although repository QC coverage suggests those paths are broadly implemented.
- The review exercised at least one result-entry flow and one destructive flow, but it did not exhaustively test all import error variants or every forced-pick edge case manually because those areas already have strong automated coverage and were not the main UX risk observed.
- Documentation mismatches were treated as confirmed repository issues even when they do not directly block an end user in the running app, because they materially affect UX review and future product decisions.

## 8. Environment used

- Application command: `npm run dev`
- Local URL reviewed: `http://127.0.0.1:8000/`
- Desktop viewport: `1440x900`, chosen as a representative laptop-sized workspace that exposes the desktop header, multi-column content, and standard desktop navigation behavior.
- Mobile viewport: `390x844`, chosen as a representative modern phone size that exposes the fixed bottom navigation and stacked mobile layouts.
- Environment limitation: the app could be opened in the integrated browser, but the current chat session did not have direct agentic DOM-inspection tools enabled there, so the live review used Playwright interaction and screenshots instead.

## 9. Final recommendation

The current UX is acceptable, not yet strong. The product is functionally rich and often clear once users are inside a task, but it still needs targeted refinement before the overall experience feels consistently disciplined, accessible, and excellent across desktop and mobile.

If only a small amount of work can be done next, prioritize these three changes:
1. Fix focus restoration and status confirmation for header preferences and result-entry flows.
2. Simplify Browse and first-run hierarchy so users reach the real working surfaces faster, especially on mobile.
3. Rebalance History and Backup so records stay primary, analytics move out of the way, and destructive maintenance is more clearly separated.