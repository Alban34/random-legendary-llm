## Epic 3 — Setup Generation Engine

**Objective**
Generate legal game setups from the owned collection using legality-first validation and least-played fallback.

**In scope**
- player-count rules
- Advanced Solo rules
- legality validation
- forced group accounting
- never-played preference
- least-played fallback
- acceptance vs regeneration behavior

**Stories**
1. **Implement player-count setup templates**
2. **Validate owned collection legality before generation**
3. **Select a legal Scheme and apply its rule effects**
4. **Select a legal Mastermind and account for mandatory leads**
5. **Fill Villain Group and Henchman Group slots correctly**
6. **Select Heroes using freshness and least-played priority**
7. **Keep Generate/Regenerate ephemeral until Accept & Log**
8. **Produce history-ready setup snapshots using IDs only**

---
