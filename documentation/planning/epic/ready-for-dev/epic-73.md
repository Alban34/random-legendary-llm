## Epic 73 — Solo Mode "Always Leads" Rule Suppression

**Objective**
Ensure the app never applies the "Always Leads" mastermind rule during solo play — so that the villain group slot is always filled by normal random selection in solo mode and players do not receive a generated setup that contradicts the official solo rules.

**Background**
Some masterminds carry an `alwaysLeads` attribute that forces a specific villain group into the generated setup. The official rules for all three solo play modes (Standard Solo, Advanced Solo, Standard v2) explicitly instruct players to ignore this rule. The app currently applies the "Always Leads" constraint even in solo mode and compensates by displaying a text reminder in the solo rules panel ("Ignore the Mastermind's 'Always Leads' ability"). This epic removes the enforcement from the generator entirely and cleans up the now-redundant reminder entries from the solo rules and locale files.

**In scope**
- a generator rule in `src/app/setup-generator.ts` that skips the `alwaysLeads` villain group assignment when the active play mode is any solo mode (`standard-solo`, `advanced-solo`, `standard-solo-v2`)
- removal of the "Always Leads" label from the generated setup result display when a solo play mode is active (the villain group displayed is the one randomly selected, not pinned by the always-leads rule)
- removal of the three per-mode "Always Leads" reminder keys (`newGame.soloRules.standard.alwaysLeads`, `newGame.soloRules.advancedSolo.alwaysLeads`, `newGame.soloRules.standardV2.alwaysLeads`) from the solo rules definitions and all six locale files, since the rule is now handled automatically by the generator

**Out of scope**
- changes to the "Always Leads" behavior in non-solo play modes (the rule continues to apply for 2-player and multiplayer games)
- UI controls that let users opt back into the "Always Leads" rule in solo mode
- changes to how the `alwaysLeads` attribute is modeled in the mastermind data (the attribute is retained; only its application in solo mode is suppressed)
- adding a new explicit "rule suppressed" notice to the result display

**Stories**
1. **Suppress the "Always Leads" villain group assignment in the setup generator for all solo play modes**
2. **Remove the "Always Leads" label from the generated result view when a solo play mode is active**
3. **Remove the per-mode "Always Leads" reminder entries from the solo rules definitions and all six locale files**

**Acceptance Criteria**
- Story 1: When a solo play mode (`standard-solo`, `advanced-solo`, or `standard-solo-v2`) is active and the drawn mastermind has a non-null `alwaysLeads` attribute, the setup generator does not assign the always-leads villain group; the villain group slot is filled by normal random selection from the available pool; for non-solo play modes the `alwaysLeads` constraint continues to be applied unchanged; `npm run lint` and `npm test` pass.
- Story 2: The setup result view does not display an "Always leads: [name]" label for the villain group when the active play mode is any solo mode; for non-solo play modes the "Always leads" label continues to appear when the mastermind carries the attribute; `npm run lint` passes.
- Story 3: The keys `newGame.soloRules.standard.alwaysLeads`, `newGame.soloRules.advancedSolo.alwaysLeads`, and `newGame.soloRules.standardV2.alwaysLeads` are absent from the solo rules definitions file(s) and from all six locale files (en, fr, de, es, ja, ko); no remaining code reference causes a missing-key warning for those keys; `npm run lint` passes.
