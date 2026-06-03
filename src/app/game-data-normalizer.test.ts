import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCanonicalSourceData, normalizeGameData } from './game-data-normalizer.ts';

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

test('Canonical inventory is present and count-aligned', () => {

  assert.equal(source.sets.length, seed.setCatalog.length);

  for (const setEntry of seed.setCatalog) {
    assert.ok(source.sets.some((set) => set.name === setEntry.name), `Missing set: ${setEntry.name}`);
  }
});

test('Duplicate display names remain distinct through set-scoped IDs', () => {

  const blackWidows = runtime.indexes.allHeroes.filter((hero) => hero.name === 'Black Widow');
  const lokis = runtime.indexes.allMasterminds.filter((mastermind) => mastermind.name === 'Loki');
  const thors = runtime.indexes.allHeroes.filter((hero) => hero.name === 'Thor');

  assert.ok(blackWidows.length >= 2, 'Expected duplicate Black Widow heroes');
  assert.equal(new Set(blackWidows.map((hero) => hero.id)).size, blackWidows.length, 'Black Widow IDs collided');
  assert.ok(lokis.length >= 2, 'Expected duplicate Loki masterminds');
  assert.equal(new Set(lokis.map((entity) => entity.id)).size, lokis.length, 'Loki IDs collided');
  assert.ok(thors.length >= 2, 'Expected duplicate Thor heroes');
});

test('Scheme forced groups and modifiers normalize correctly', () => {

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

test('buildCanonicalSourceData falls back to [] and default numeric values when optional fields are absent', () => {

  const minimalSeed = {
    setCatalog: [{ name: 'Minimal Set', year: 2020, type: 'base' }],
    rawCardData: {
      heroes: [{ setName: 'Minimal Set', name: 'Hero Alpha' }],
      masterminds: [{ setName: 'Minimal Set', name: 'Villain Prime' }],
      villainGroups: [{ setName: 'Minimal Set', name: 'Bad Guys' }],
      henchmanGroups: [{ setName: 'Minimal Set', name: 'Henchmen' }],
      schemes: [{ setName: 'Minimal Set', name: 'Evil Plan' }]
    }
  };

  const result = buildCanonicalSourceData(minimalSeed as unknown as Parameters<typeof buildCanonicalSourceData>[0]);
  const set = result.sets[0];

  assert.deepEqual(set.aliases, [], 'Set aliases should default to []');
  assert.deepEqual(set.heroes[0].aliases, [], 'Hero aliases should default to []');
  assert.deepEqual(set.heroes[0].teams, [], 'Hero teams should default to []');
  assert.equal(set.heroes[0].cardCount, 14, 'Hero cardCount should default to 14');
  assert.deepEqual(set.masterminds[0].aliases, [], 'Mastermind aliases should default to []');
  assert.deepEqual(set.masterminds[0].notes, [], 'Mastermind notes should default to []');
  assert.deepEqual(set.villainGroups[0].aliases, [], 'Villain group aliases should default to []');
  assert.equal(set.villainGroups[0].cardCount, 8, 'Villain group cardCount should default to 8');
  assert.deepEqual(set.henchmanGroups[0].aliases, [], 'Henchman group aliases should default to []');
  assert.equal(set.henchmanGroups[0].cardCount, 10, 'Henchman group cardCount should default to 10');
  assert.deepEqual(set.schemes[0].aliases, [], 'Scheme aliases should default to []');
  assert.deepEqual(set.schemes[0].constraints, { minimumPlayerCount: null }, 'Scheme constraints should default');
  assert.deepEqual(set.schemes[0].forcedGroups, [], 'Scheme forcedGroups should default to []');
  assert.deepEqual(set.schemes[0].modifiers, [], 'Scheme modifiers should default to []');
  assert.deepEqual(set.schemes[0].notes, [], 'Scheme notes should default to []');
});

// ── From epic107-mastermind-lead-corrections ──────────────────────────────────

test('107.1 — Omega Red MastermindRuntime has lead === null', () => {
  const omegaRed = runtime.indexes.allMasterminds.find((m) => m.name === 'Omega Red');
  assert.ok(omegaRed, 'Omega Red mastermind not found in runtime indexes');
  assert.equal(omegaRed.lead, null, 'Omega Red lead should be null (Any Villain Group rule)');
});

test('107.2 — Sinister Six 2099 MastermindRuntime has lead === null and leadCandidates with at least 2 villain entries', () => {
  const sinisterSix = runtime.indexes.allMasterminds.find((m) => m.name === 'Sinister Six 2099');
  assert.ok(sinisterSix, 'Sinister Six 2099 mastermind not found in runtime indexes');
  assert.equal(sinisterSix.lead, null, 'Sinister Six 2099 lead should be null');
  assert.ok(Array.isArray(sinisterSix.leadCandidates), 'leadCandidates should be an array');
  assert.ok(
    sinisterSix.leadCandidates!.length >= 2,
    `Expected at least 2 lead candidates, got ${sinisterSix.leadCandidates!.length}`
  );
  assert.ok(
    sinisterSix.leadCandidates!.every((c) => c.category === 'villains'),
    'All leadCandidates should have category "villains"'
  );
});

test("107.3 — Emperor Vulcan of the Shi'Ar MastermindRuntime has lead.id resolving to Shi'Ar Imperial Elite", () => {
  const vulcan = runtime.indexes.allMasterminds.find((m) => m.name === "Emperor Vulcan of the Shi'Ar");
  assert.ok(vulcan, "Emperor Vulcan of the Shi'Ar mastermind not found in runtime indexes");
  assert.ok(vulcan.lead, "Emperor Vulcan of the Shi'Ar lead should be non-null");
  const shiArGroup = runtime.indexes.villainGroupsById[vulcan.lead!.id];
  assert.ok(shiArGroup, "Shi'Ar Imperial Elite villain group not found by resolved lead id");
  assert.equal(shiArGroup.name, "Shi'Ar Imperial Elite");
});
