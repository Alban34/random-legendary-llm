import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCanonicalSourceData,
  createEpic1Bundle,
  normalizeGameData,
  validateNormalizedData
} from '../src/app/game-data-pipeline.ts';
import { deepClone } from '../src/app/object-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let seed;
let source;
let runtime;
let bundle;

before(async () => {
  seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  source = buildCanonicalSourceData(seed);
  runtime = normalizeGameData(source);
  bundle = createEpic1Bundle(seed);
});

test('Epic 1 canonical inventory is present and count-aligned', () => {
  assert.equal(source.sets.length, seed.setCatalog.length);

  for (const setEntry of seed.setCatalog) {
    assert.ok(source.sets.some((set) => set.name === setEntry.name), `Missing set: ${setEntry.name}`);
  }
});

test('Epic 1 stable IDs are unique across every entity category', () => {
  assert.doesNotThrow(() => validateNormalizedData(runtime.sets, runtime.indexes));
});

test('Epic 1 duplicate display names remain distinct through set-scoped IDs', () => {
  const blackWidows = runtime.indexes.allHeroes.filter((hero) => hero.name === 'Black Widow');
  const lokis = runtime.indexes.allMasterminds.filter((mastermind) => mastermind.name === 'Loki');
  const thors = runtime.indexes.allHeroes.filter((hero) => hero.name === 'Thor');

  assert.ok(blackWidows.length >= 2, 'Expected duplicate Black Widow heroes');
  assert.equal(new Set(blackWidows.map((hero) => hero.id)).size, blackWidows.length, 'Black Widow IDs collided');
  assert.ok(lokis.length >= 2, 'Expected duplicate Loki masterminds');
  assert.equal(new Set(lokis.map((entity) => entity.id)).size, lokis.length, 'Loki IDs collided');
  assert.ok(thors.length >= 2, 'Expected duplicate Thor heroes');
});

test('Epic 1 mastermind lead references resolve correctly', () => {
  const redSkull = runtime.indexes.allMasterminds.find((entity) => entity.name === 'Red Skull' && entity.setId === 'core-set');
  const drDoom = runtime.indexes.allMasterminds.find((entity) => entity.name === 'Dr. Doom');

  assert.ok(redSkull?.lead, 'Red Skull lead not resolved');
  assert.equal(redSkull.lead.category, 'villains');
  assert.ok(drDoom?.lead, 'Dr. Doom lead not resolved');
  assert.equal(drDoom.lead.category, 'henchmen');
});

test('Epic 1 scheme forced groups and modifiers normalize correctly', () => {
  const secretInvasion = runtime.indexes.allSchemes.find((entity) => entity.name === 'Secret Invasion of the Skrull Shapeshifters');
  const negativeZone = runtime.indexes.allSchemes.find((entity) => entity.name === 'Negative Zone Prison Breakout');

  assert.ok(secretInvasion, 'Secret Invasion scheme missing');
  assert.ok(secretInvasion.forcedGroups.length > 0, 'Secret Invasion missing forced group');
  assert.ok(
    secretInvasion.modifiers.some((modifier) => modifier.type === 'set-min-heroes' && modifier.value === 6),
    'Secret Invasion modifier missing'
  );
  assert.ok(negativeZone, 'Negative Zone scheme missing');
  assert.ok(
    negativeZone.modifiers.some((modifier) => modifier.type === 'add-henchman-group'),
    'Negative Zone modifier missing'
  );
});

test('Epic 1 runtime indexes match canonical entity totals', () => {
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

test('Epic 1 validation rejects representative invalid lead references', () => {
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

test('Epic 1 bundle summary remains internally green', () => {
  assert.deepEqual(bundle.counts, {
    sets: 39,
    heroes: 296,
    masterminds: 106,
    villainGroups: 126,
    henchmanGroups: 44,
    schemes: 186
  });
  assert.equal(bundle.tests.length, 7);
  assert.equal(bundle.tests.filter((entry) => entry.status === 'fail').length, 0);
});

