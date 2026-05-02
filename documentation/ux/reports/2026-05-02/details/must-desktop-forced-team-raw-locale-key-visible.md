## Title
Forced Hero Team "unavailable" message shows raw locale key instead of translated text

## Severity
Must change

## Affects
Both

## Source
Senior Desktop UX Auditor (review on 2026-05-02)

## Where it appears
New Game tab → Forced picks panel (expanded), below "Henchman Group" controls and above "Active constraints".

## Evidence
Live review confirmed that `<p class="muted" data-forced-team-unavailable>` renders the literal string `newGame.forcedPicks.forcedTeam.unavailable` instead of the English text "No heroes in the active collection have a team affiliation".

Root cause confirmed by source inspection: `src/app/localization-utils.ts` imports `EN_MESSAGES` from `src/app/locales/en.ts`. The 5 `forcedTeam.*` keys added by Epic 74 were added to `en.mjs` but not to `en.ts`. Because the runtime imports from `en.ts`, all `forcedTeam.*` lookups fall through to the key-string fallback.

The same defect affects all 5 `forcedTeam.*` keys:
- `newGame.forcedPicks.forcedTeam.label` (forced team select label)
- `newGame.forcedPicks.forcedTeam.placeholder` (dropdown placeholder)
- `newGame.forcedPicks.forcedTeam.active` (active constraint chip text)
- `newGame.forcedPicks.forcedTeam.clear` (clear button label)
- `newGame.forcedPicks.forcedTeam.unavailable` (unavailable state paragraph — the one confirmed visible)

The 5 keys must also be added to the other locale `.ts` files (fr.ts, de.ts, ja.ts, ko.ts, es.ts) with appropriate translations, or the localization architecture must be reconciled so `.mjs` and `.ts` files stay in sync.

## Why it matters
Users see a raw internal identifier (`newGame.forcedPicks.forcedTeam.unavailable`) instead of a human-readable status message. This is a production defect that signals broken engineering to any user who notices. Screen readers will also announce the raw key, degrading accessibility.

## Recommended change
Add the 5 `forcedTeam.*` keys to `src/app/locales/en.ts` with the same English values as in `en.mjs`. Ensure the same keys are added to all other `.ts` locale files with appropriate translations. Reconcile the `.mjs`/`.ts` duplication in the localization architecture to prevent recurrence.

## Expected UX improvement
The Forced Team unavailable state message will render as intended ("No heroes in the active collection have a team affiliation"), the label, placeholder, active text, and clear button will display correctly, and screen readers will announce the correct human-readable text.
