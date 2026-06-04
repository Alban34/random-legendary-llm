import { createDefaultState } from './state-store.ts';
import type { Epic1Bundle } from './game-data-pipeline.ts';

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

export function createAllOwnedState(bundle: Epic1Bundle) {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

// ---------------------------------------------------------------------------
// createSampleSnapshot — builds a minimal setupSnapshot using bundle indexes
// at a given offset. Shared between history-utils and stats-utils tests.
// ---------------------------------------------------------------------------

export function createSampleSnapshot(bundle: Epic1Bundle, offset = 0) {
  const indexes = bundle.runtime.indexes;
  return {
    mastermindId: indexes.allMasterminds[offset].id,
    schemeId: indexes.allSchemes[offset].id,
    heroIds: indexes.allHeroes.slice(offset, offset + 3).map((entity) => entity.id),
    villainGroupIds: indexes.allVillainGroups.slice(offset, offset + 1).map((entity) => entity.id),
    henchmanGroupIds: indexes.allHenchmanGroups.slice(offset, offset + 1).map((entity) => entity.id)
  };
}
