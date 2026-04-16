## Epic 2 — State Management and Persistence

**Objective**
Implement the versioned root browser state and all storage operations required by the app.

**In scope**
- `legendary_state_v1`
- shared state/storage modules under `src/app/`
- collection persistence
- usage stats persistence
- history persistence
- preferences persistence
- reset behavior

**Stories**
1. **Create a storage manager for versioned root state**
2. **Persist and hydrate owned collection state**
3. **Persist and update usage statistics (`plays`, `lastPlayedAt`)**
4. **Persist and retrieve accepted game history**
5. **Support per-category and full reset operations**
6. **Handle corrupted or missing browser state gracefully**

---
