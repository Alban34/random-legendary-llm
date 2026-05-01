## Epic 74 — Forced Hero Team

**Objective**
Let users designate one hero team (affiliation) as "forced" so that during setup generation heroes belonging to that team are always selected first — regardless of which expansions they come from or how recently they were played — while remaining slots still fill from the general hero pool.

**In scope**
- Deriving the distinct sorted list of team names present in the active hero pool
- UI dropdown in the forced-picks panel to select and clear a forced team, with locale strings for all six supported locales
- Generator logic to always select heroes whose `teams` array includes the forced team name first, overriding freshness ordering within the team pool
- `forcedTeam: string | null` added to `ForcedPicks`, `createEmptyForcedPicks`, `normalizeForcedPicks`, and `hasForcedPicks`
- Round-trip persistence through backup export / import
- Result view indicator showing the forced team that was active when the setup was generated

**Stories**
1. **Derive and expose the sorted list of active hero team names from the owned collection**
2. **Add a forced team selector to the forced-picks panel**
3. **Extend the hero selection step in the generator to always pick heroes from the forced team first**
4. **Persist the forced team within the ForcedPicks state and backup payload**
5. **Show the active forced team as a badge in the generated setup result view**

**Acceptance Criteria**
- Story 1: Given any set of active expansions, the team list contains only names that appear on at least one hero in the enabled collection; changing the active collection (enabling or disabling expansions) updates the list reactively; team names with no current members are absent.
- Story 2: A "Forced team" dropdown appears in the forced-picks section when the active hero pool contains at least one hero with a team affiliation; selecting a team writes `forcedPicks.forcedTeam`; a clear button resets it to `null`; the control is hidden or replaced by an "unavailable" notice when no heroes in the pool carry a team affiliation; all new UI strings are present and correctly translated in every supported locale file (`en.ts`, `fr.ts`, `de.ts`, `ja.ts`, `ko.ts`, `es.ts`); `npm run lint` passes.
- Story 3: When `forcedTeam` is set, heroes whose `teams` array includes the forced team name are always selected before any hero from other teams, without regard to freshness tiers or play counts; freshness ordering applies only within the forced-team pool itself (least-played forced-team heroes are drawn first) and within the general pool that fills any remaining slots; when the forced team pool is smaller than the required `heroCount` the remaining slots fill from the general hero pool (applying normal freshness ordering) without error or warning; forced individual hero picks (`heroIds`) are placed first and are not subject to the team forcing; the existing `preferredExpansionId` behaviour for villain groups, henchman groups, schemes, and masterminds is unaffected.
- Story 4: Exporting a backup with `forcedTeam` set to a non-empty string and re-importing it restores `forcedTeam` to the same value; `normalizeForcedPicks` coerces `undefined`, `null`, non-string, and empty-string values to `null`; `hasForcedPicks({ forcedTeam: "X-Men" })` returns `true`; `hasForcedPicks(createEmptyForcedPicks())` continues to return `false`.
- Story 5: A generated setup whose `forcedTeam` was non-null at generation time renders a visible forced-team badge on the heroes section of the result view; a setup generated without a forced team shows no such badge; no existing result-view snapshot or integration test regresses.
