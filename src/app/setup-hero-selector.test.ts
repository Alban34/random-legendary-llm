import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEpic1Bundle } from './game-data-pipeline.ts';
import { canSatisfyHeroRequirements, selectHeroes } from './setup-hero-selector.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;
beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
});

// ── canSatisfyHeroRequirements ────────────────────────────────────────────────

test('canSatisfyHeroRequirements returns false for empty heroes array', () => {
  const requirements = { heroCount: 3, heroNameRequirements: [], villainGroupCount: 1, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };
  assert.equal(canSatisfyHeroRequirements([], requirements), false);
});

test('canSatisfyHeroRequirements returns true when heroes meet count with no name requirements', () => {
  const heroes = bundle.runtime.indexes.allHeroes.slice(0, 5);
  const requirements = { heroCount: 3, heroNameRequirements: [], villainGroupCount: 1, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };
  assert.equal(canSatisfyHeroRequirements(heroes, requirements), true);
});

test('canSatisfyHeroRequirements returns false when hero count is insufficient', () => {
  const heroes = bundle.runtime.indexes.allHeroes.slice(0, 2);
  const requirements = { heroCount: 5, heroNameRequirements: [], villainGroupCount: 1, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };
  assert.equal(canSatisfyHeroRequirements(heroes, requirements), false);
});

test('canSatisfyHeroRequirements returns true for sufficient heroes with exact count', () => {
  const heroes = bundle.runtime.indexes.allHeroes.slice(0, 4);
  const requirements = { heroCount: 4, heroNameRequirements: [], villainGroupCount: 1, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };
  assert.equal(canSatisfyHeroRequirements(heroes, requirements), true);
});

test('canSatisfyHeroRequirements returns true when heroNameRequirements pattern is satisfied', () => {
  const allHeroes = bundle.runtime.indexes.allHeroes;
  const spiderHeroes = allHeroes.filter((h) => /Spider/i.test(h.name));
  const nonSpiderHeroes = allHeroes.filter((h) => !/Spider/i.test(h.name));
  const heroPool = [...spiderHeroes.slice(0, 2), ...nonSpiderHeroes.slice(0, 4)];
  const requirements = {
    heroCount: 5,
    heroNameRequirements: [{ pattern: 'Spider', value: 2 }],
    villainGroupCount: 1,
    henchmanGroupCount: 1,
    wounds: 0,
    bystanders: 0
  };
  assert.equal(canSatisfyHeroRequirements(heroPool, requirements), true);
});

test('canSatisfyHeroRequirements returns false when heroNameRequirements pattern cannot be met', () => {
  const nonSpiderHeroes = bundle.runtime.indexes.allHeroes.filter((h) => !/Spider/i.test(h.name)).slice(0, 5);
  const requirements = {
    heroCount: 3,
    heroNameRequirements: [{ pattern: 'Spider', value: 2 }],
    villainGroupCount: 1,
    henchmanGroupCount: 1,
    wounds: 0,
    bystanders: 0
  };
  assert.equal(canSatisfyHeroRequirements(nonSpiderHeroes, requirements), false);
});

// ── selectHeroes ──────────────────────────────────────────────────────────────

test('selectHeroes returns the requested hero count with no forced picks', () => {
  const heroes = bundle.runtime.indexes.allHeroes;
  const requirements = { heroCount: 5, heroNameRequirements: [], villainGroupCount: 2, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };
  const result = selectHeroes(heroes, requirements, undefined, () => 0);
  assert.equal(result.selected.length, 5);
  assert.equal(result.reason, null);
});

test('selectHeroes includes forcedHeroIds in the result', () => {
  const heroes = bundle.runtime.indexes.allHeroes;
  const forcedHero = heroes[0];
  const requirements = { heroCount: 5, heroNameRequirements: [], villainGroupCount: 2, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };
  const result = selectHeroes(heroes, requirements, undefined, () => 0, [forcedHero.id]);
  assert.equal(result.selected.length, 5);
  assert.ok(result.selected.some((h) => h.id === forcedHero.id), 'Forced hero should be in the result');
  assert.equal(result.reason, null);
});

test('selectHeroes returns reason when forcedHeroIds exceed heroCount', () => {
  const heroes = bundle.runtime.indexes.allHeroes.slice(0, 3);
  const forcedIds = heroes.map((h) => h.id);
  const requirements = { heroCount: 2, heroNameRequirements: [], villainGroupCount: 1, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };
  const result = selectHeroes(heroes, requirements, undefined, () => 0, forcedIds);
  assert.ok(result.reason !== null, 'Expected a reason when forced heroes exceed slot count');
  assert.equal(result.selected.length, 0);
});

test('selectHeroes with forcedTeam returns heroes from that team', () => {
  const heroes = bundle.runtime.indexes.allHeroes;
  const xmenHeroes = heroes.filter((h) => h.teams.includes('X-Men'));
  if (xmenHeroes.length < 5) return; // skip if not enough X-Men heroes
  const requirements = { heroCount: 5, heroNameRequirements: [], villainGroupCount: 2, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };
  const result = selectHeroes(heroes, requirements, undefined, () => 0, [], null, 'X-Men');
  assert.equal(result.selected.length, 5);
  assert.equal(result.reason, null);
  assert.ok(
    result.selected.every((h) => h.teams.includes('X-Men')),
    'All selected heroes should be X-Men when team pool is large enough'
  );
});
