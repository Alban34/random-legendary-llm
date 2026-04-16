## Epic 38 — Data Completeness: Missing Legendary Sets

**Status: Approved**

**Objective**
Identify every Legendary: Marvel expansion that is currently absent from the app's canonical data, research and compile the correct card inventory for each missing set using the same approved reference sources (BoardGameGeek and cross-referenced against master-strike.com / legendaryleagues.com for gap identification), and add the missing sets so the app's hero and mastermind counts reach parity with the established databases.

**In scope**
- auditing the current 33-set inventory against external Legendary databases to produce an authoritative list of missing sets
- researching card inventory (heroes, masterminds, villain groups, henchman groups, schemes) for each missing set
- adding the missing sets to `src/data/canonical-game-data.json` with correct classification (base, large expansion, small expansion, standalone)
- validating cross-references (mastermind always-lead groups, scheme forced groups) for all new sets
- updating `documentation/data/game-data-normalized.md` to reflect the expanded inventory

**Out of scope**
- sets from non-Marvel Legendary games (Buffy, Big Trouble in Little China, etc.)
- sets that are announced but not yet released
- sets for which no reliable card inventory can be confirmed from approved references

**Stories**
1. **Audit and document all Legendary: Marvel sets missing from the current 33-set inventory**
2. **Compile card inventory for each missing set from approved reference sources**
3. **Add missing sets to the canonical data and validate all cross-references**
4. **Update normalized documentation to reflect the expanded inventory**

**Acceptance Criteria**
- Story 1: A complete gap list is produced enumerating every Legendary: Marvel expansion that appears in master-strike.com or legendaryleagues.com but is absent from the current 33-set inventory; each missing set is named, classified by type, and marked as researchable or excluded with justification.
- Story 2: Card inventory (heroes, masterminds, villain groups, henchman groups, schemes) for each researchable missing set is compiled and documented in `documentation/data/game-data-normalized.md` before any code changes are made.
- Story 3: All missing researchable sets are added to `src/data/canonical-game-data.json`; all mastermind always-lead references resolve to existing villain groups or henchman groups in the same or other sets; all scheme forced-group references resolve correctly; the runtime validation pass produces no cross-reference errors for the new sets.
- Story 4: `documentation/data/game-data-normalized.md` is updated to reflect the new total hero and mastermind counts; the inventory table lists all newly added sets with their correct card counts and classifications.

---
