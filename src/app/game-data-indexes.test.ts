import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateNormalizedData } from './game-data-indexes.ts';
import { buildCanonicalSourceData, normalizeGameData } from './game-data-normalizer.ts';
import { deepClone } from './object-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let seed;
let source;
let runtime;
beforeAll(async () => {
  seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  source = buildCanonicalSourceData(seed);
  runtime = normalizeGameData(source);
});

test('Stable IDs are unique across every entity category', () => {

  assert.doesNotThrow(() => validateNormalizedData(runtime.sets, runtime.indexes));
});

test('Mastermind lead references resolve correctly', () => {

  const redSkull = runtime.indexes.allMasterminds.find((entity) => entity.name === 'Red Skull' && entity.setId === 'core-set');
  const drDoom = runtime.indexes.allMasterminds.find((entity) => entity.name === 'Dr. Doom');

  assert.ok(redSkull?.lead, 'Red Skull lead not resolved');
  assert.equal(redSkull.lead.category, 'villains');
  assert.ok(drDoom?.lead, 'Dr. Doom lead not resolved');
  assert.equal(drDoom.lead.category, 'henchmen');
});

test('Runtime indexes match canonical entity totals', () => {

  const canonicalHeroCount = source.sets.reduce((sum, set) => sum + set.heroes.length, 0);
  const canonicalMastermindCount = source.sets.reduce((sum, set) => sum + set.masterminds.length, 0);
  const canonicalVillainCount = source.sets.reduce((sum, set) => sum + set.villainGroups.length, 0);
  const canonicalHenchmanCount = source.sets.reduce((sum, set) => sum + set.henchmanGroups.length, 0);
  const canonicalSchemeCount = source.sets.reduce((sum, set) => sum + set.schemes.length, 0);

  assert.equal(runtime.indexes.allHeroes.length, canonicalHeroCount, 'Hero index total mismatch');
  assert.equal(runtime.indexes.allMasterminds.length, canonicalMastermindCount, 'Mastermind index total mismatch');
  assert.equal(runtime.indexes.allVillainGroups.length, canonicalVillainCount, 'Villain index total mismatch');
  assert.equal(runtime.indexes.allHenchmanGroups.length, canonicalHenchmanCount, 'Henchman index total mismatch');
  assert.equal(runtime.indexes.allSchemes.length, canonicalSchemeCount, 'Scheme index total mismatch');
});

test('Validation rejects representative invalid lead references', () => {

  const brokenSource = deepClone(source);
  const drDoom = brokenSource.sets
    .find((set) => set.id === 'core-set')
    .masterminds.find((entity) => entity.name === 'Dr. Doom');

  drDoom.leadName = 'Definitely Missing Lead';

  assert.throws(
    () => normalizeGameData(brokenSource),
    /Missing henchmen reference|Missing villains reference|Missing/
  );
});
