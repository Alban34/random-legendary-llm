import { createDefaultState } from './state-store.ts';

// ---------------------------------------------------------------------------
// createMemoryStorage — a lightweight in-memory storage adapter used across
// many unit tests in place of a real localStorage / sessionStorage.
// ---------------------------------------------------------------------------

export function createMemoryStorage(initialEntries: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initialEntries));
  return {
    getItem(key: string): string | null {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value));
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    dump(): Record<string, string> {
      return Object.fromEntries(store.entries());
    }
  };
}

// ---------------------------------------------------------------------------
// minimalIndexes — empty RuntimeIndexes-shaped object for tests that exercise
// state loading / hydration but do not require actual game data.
// ---------------------------------------------------------------------------

export const minimalIndexes = {
  setsById: {} as Record<string, never>,
  heroesById: {} as Record<string, never>,
  mastermindsById: {} as Record<string, never>,
  villainGroupsById: {} as Record<string, never>,
  henchmanGroupsById: {} as Record<string, never>,
  schemesById: {} as Record<string, never>,
  setsList: [] as never[]
};

// ---------------------------------------------------------------------------
// createAllOwnedState — creates a default app state with all sets from the
// bundle marked as owned. Parameterised so it can be shared across files that
// each load their own bundle in beforeAll.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAllOwnedState(bundle: any) {
  const state = createDefaultState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state.collection.ownedSetIds = bundle.runtime.sets.map((set: any) => set.id);
  return state;
}

// ---------------------------------------------------------------------------
// createSampleSnapshot — builds a minimal setupSnapshot using bundle indexes
// at a given offset. Shared between history-utils and stats-utils tests.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSampleSnapshot(bundle: any, offset = 0) {
  const indexes = bundle.runtime.indexes;
  return {
    mastermindId: indexes.allMasterminds[offset].id,
    schemeId: indexes.allSchemes[offset].id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    heroIds: indexes.allHeroes.slice(offset, offset + 3).map((entity: any) => entity.id),
    villainGroupIds: [indexes.allVillainGroups[offset].id],
    henchmanGroupIds: [indexes.allHenchmanGroups[offset].id]
  };
}
