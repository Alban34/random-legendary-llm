import type { MastermindCard } from './types.ts';
import {
  buildCanonicalSourceData,
  normalizeGameData,
} from './game-data-normalizer.ts';
import type { SeedData, CanonicalSourceData, PipelineRuntime } from './game-data-normalizer.ts';
import { validateNormalizedData } from './game-data-indexes.ts';

// Re-export for backward compatibility
export { buildCanonicalSourceData, normalizeGameData, slugify } from './game-data-normalizer.ts';
export type { PipelineRuntime, SeedData, CanonicalSourceData } from './game-data-normalizer.ts';
export { buildIndexes, validateNormalizedData } from './game-data-indexes.ts';

// ---------------------------------------------------------------------------
// Local pipeline types
// ---------------------------------------------------------------------------

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  error?: string;
}

interface EntityCounts {
  sets: number;
  heroes: number;
  masterminds: number;
  villainGroups: number;
  henchmanGroups: number;
  schemes: number;
}

export interface Epic1Bundle {
  seed: SeedData;
  source: CanonicalSourceData;
  runtime: PipelineRuntime;
  tests: TestResult[];
  counts: EntityCounts;
}

// ---------------------------------------------------------------------------
// Epic 1 tests
// ---------------------------------------------------------------------------

function assert(condition: unknown, message: string, details?: string): void {
  if (!condition) {
    throw new Error(details ? `${message} — ${details}` : message);
  }
}

export function runEpic1Tests(seed: SeedData, source: CanonicalSourceData, runtime: PipelineRuntime): TestResult[] {
  const tests: TestResult[] = [];

  function run(name: string, fn: () => void): void {
    try {
      fn();
      tests.push({ name, status: 'pass' });
    } catch (error) {
      tests.push({ name, status: 'fail', error: (error as Error).message });
    }
  }

  run('Included set inventory is present and count-aligned', () => {
    assert(source.sets.length === seed.setCatalog.length, 'Set count mismatch', `${source.sets.length} !== ${seed.setCatalog.length}`);
    seed.setCatalog.forEach((setEntry) => {
      assert(source.sets.some((set) => set.name === setEntry.name), 'Missing set', setEntry.name);
    });
  });

  run('Stable IDs are unique across every entity category', () => {
    validateNormalizedData(runtime.sets, runtime.indexes);
  });

  run('Duplicate names remain distinct through set-scoped IDs', () => {
    const blackWidows = runtime.indexes.allHeroes.filter((hero) => hero.name === 'Black Widow');
    const lokis = runtime.indexes.allMasterminds.filter((mastermind) => mastermind.name === 'Loki');
    const thors = runtime.indexes.allHeroes.filter((hero) => hero.name === 'Thor');
    assert(blackWidows.length >= 2, 'Expected duplicate Black Widow heroes');
    assert(new Set(blackWidows.map((hero) => hero.id)).size === blackWidows.length, 'Black Widow IDs collided');
    assert(lokis.length >= 2, 'Expected duplicate Loki masterminds');
    assert(new Set(lokis.map((entity) => entity.id)).size === lokis.length, 'Loki IDs collided');
    assert(thors.length >= 2, 'Expected duplicate Thor heroes');
  });

  run('Mastermind lead references resolve correctly', () => {
    const redSkull = runtime.indexes.allMasterminds.find((entity) => entity.name === 'Red Skull' && entity.setId === 'core-set');
    const drDoom = runtime.indexes.allMasterminds.find((entity) => entity.name === 'Dr. Doom');
    assert(redSkull?.lead?.category === 'villains', 'Red Skull lead not resolved');
    assert(drDoom?.lead?.category === 'henchmen', 'Dr. Doom lead not resolved as henchmen');
  });

  run('Scheme forced groups and modifiers normalize correctly', () => {
    const secretInvasion = runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters');
    const negativeZone = runtime.indexes.allSchemes.find((entity) => entity.name === 'Negative Zone Prison Breakout');
    assert(secretInvasion && secretInvasion.forcedGroups.length > 0, 'Secret Invasion missing forced group');
    // @ts-expect-error — modifiers are typed as unknown[] but have runtime shape
    assert(secretInvasion.modifiers.some((modifier) => modifier.type === 'set-min-heroes' && modifier.value === 6), 'Secret Invasion modifier missing');
    // @ts-expect-error — modifiers are typed as unknown[] but have runtime shape
    assert(negativeZone?.modifiers.some((modifier) => modifier.type === 'add-henchman-group'), 'Negative Zone modifier missing');
  });

  run('Runtime indexes match canonical entity totals', () => {
    const canonicalHeroCount = source.sets.reduce((sum, set) => sum + set.heroes.length, 0);
    const canonicalMastermindCount = source.sets.reduce((sum, set) => sum + set.masterminds.length, 0);
    const canonicalVillainCount = source.sets.reduce((sum, set) => sum + set.villainGroups.length, 0);
    const canonicalHenchmanCount = source.sets.reduce((sum, set) => sum + set.henchmanGroups.length, 0);
    const canonicalSchemeCount = source.sets.reduce((sum, set) => sum + set.schemes.length, 0);
    assert(runtime.indexes.allHeroes.length === canonicalHeroCount, 'Hero index total mismatch');
    assert(runtime.indexes.allMasterminds.length === canonicalMastermindCount, 'Mastermind index total mismatch');
    assert(runtime.indexes.allVillainGroups.length === canonicalVillainCount, 'Villain index total mismatch');
    assert(runtime.indexes.allHenchmanGroups.length === canonicalHenchmanCount, 'Henchman index total mismatch');
    assert(runtime.indexes.allSchemes.length === canonicalSchemeCount, 'Scheme index total mismatch');
  });

  run('Validation rejects representative invalid lead references', () => {
    const brokenSource = structuredClone(source);
    const drDoom = brokenSource.sets
      .find((set) => set.id === 'core-set')!
      .masterminds.find((entity) => entity.name === 'Dr. Doom') as MastermindCard;
    drDoom.leadName = 'Definitely Missing Lead';
    let threw = false;
    try {
      normalizeGameData(brokenSource);
    } catch (error) {
      threw = /Missing henchmen reference|Missing villains reference|Missing/.test((error as Error).message);
    }
    assert(threw, 'Invalid lead reference did not trigger a validation failure');
  });

  return tests;
}

// ---------------------------------------------------------------------------
// createEpic1Bundle
// ---------------------------------------------------------------------------

export function createEpic1Bundle(seed: SeedData): Epic1Bundle {
  const source = buildCanonicalSourceData(seed);
  const runtime = normalizeGameData(source);
  const tests = runEpic1Tests(seed, source, runtime);
  const counts: EntityCounts = {
    sets: source.sets.length,
    heroes: runtime.indexes.allHeroes.length,
    masterminds: runtime.indexes.allMasterminds.length,
    villainGroups: runtime.indexes.allVillainGroups.length,
    henchmanGroups: runtime.indexes.allHenchmanGroups.length,
    schemes: runtime.indexes.allSchemes.length
  };

  return { seed, source, runtime, tests, counts };
}
