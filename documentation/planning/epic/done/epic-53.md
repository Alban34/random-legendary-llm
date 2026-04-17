## Epic 53 — Solo Mode Scheme Eligibility Constraints

**Objective**
Enforce that certain schemes are ineligible when playing in "standard solo" mode — specifically "Super Hero Civil War" and "Negative Zone Prison Breakout" — so those schemes can never appear in a standard solo game, whether selected randomly or forced by the user.

**In scope**
- Define an eligibility rule that marks "Super Hero Civil War" and "Negative Zone Prison Breakout" as incompatible with the "standard solo" play mode
- Apply the rule in the randomizer logic so those schemes are excluded from the random pool when the active mode is "standard solo"
- Apply the rule in the forced-selection flow so the UI prevents the user from manually selecting either scheme when the active mode is "standard solo" (e.g. disable or hide the option, or show an explanatory inline message)
- Ensure the constraint is enforced consistently: neither random nor forced selection can produce an ineligible scheme in standard solo mode

**Out of scope**
- Adding eligibility constraints for any other scheme or mode combination beyond those named above
- Changes to the game data file format or schema beyond adding the incompatibility metadata
- Changes to other play modes (two-player, advanced solo, co-op, etc.)
- UI redesign of the scheme selection panel beyond what is needed to communicate ineligibility

**Stories**
1. **Model scheme–mode incompatibility in the data layer and randomizer logic**
2. **Enforce the constraint in the forced-selection UI for standard solo mode**

**Acceptance Criteria**
- Story 1: The randomizer never returns "Super Hero Civil War" or "Negative Zone Prison Breakout" when the active play mode is "standard solo", even across a large number of random draws; the underlying incompatibility is expressed in the data or logic layer in a way that can be extended to additional constraints in the future; `npm run lint` and `npm test` pass.
- Story 2: When the active play mode is "standard solo", the "Super Hero Civil War" and "Negative Zone Prison Breakout" scheme options in the forced-selection panel are visually and interactively unavailable (disabled or hidden with an explanatory label); selecting a different mode restores their availability; `npm run lint` passes.
