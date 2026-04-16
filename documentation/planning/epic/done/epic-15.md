## Epic 15 — Guided Setup Constraints and Forced Picks

**Objective**
Give users more control over setup generation by allowing them to require specific cards or entities in the next generated setup when legal.

**In scope**
- forced card selection
- legality-aware generator constraints
- fallback messaging when constraints cannot be satisfied
- UX for choosing and clearing forced picks

**Stories**
1. **Define which entity categories can be forced into a generated setup**
2. **Add UI controls for selecting, reviewing, and clearing forced picks**
3. **Update generator logic to satisfy forced picks when a legal setup exists**
4. **Explain clearly when a forced pick makes the setup impossible for the current collection or player mode**
5. **Persist or intentionally scope forced-pick preferences based on the final UX decision**
