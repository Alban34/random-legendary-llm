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

// ── Story 97.1 — additional uncovered branches ───────────────────────────────

// Helper for building lightweight stub heroes without real bundle data.
function makeHero(id: string, name: string, teams: string[] = [], setId = 'test-set') {
  return { id, name, setId, aliases: [] as string[], teams, cardCount: 5 };
}
const BASE_REQS = { villainGroupCount: 1, henchmanGroupCount: 1, wounds: 0, bystanders: 0 };

test('canSatisfyHeroRequirements returns false when non-matching heroes are too few for remaining slots', () => {
  // heroCount=5, requirement.value=2 means we need at least 3 non-matching heroes; only 1 available.
  const heroes = [makeHero('h1', 'Spider-Man'), makeHero('h2', 'Spider-Woman'), makeHero('h3', 'Hulk')];
  const requirements = { heroCount: 5, heroNameRequirements: [{ pattern: 'Spider', value: 2 }], ...BASE_REQS };
  assert.equal(canSatisfyHeroRequirements(heroes, requirements), false);
});

test('selectHeroes returns reason when a forced hero ID is not in the available pool', () => {
  const heroes = [makeHero('h1', 'Hulk'), makeHero('h2', 'Thor')];
  const requirements = { heroCount: 2, heroNameRequirements: [], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0, ['nonexistent-id']);
  assert.ok(result.reason !== null, 'Expected a reason when forced hero is not in pool');
  assert.ok(result.reason!.toLowerCase().includes('unavailable'));
  assert.equal(result.selected.length, 0);
});

test('selectHeroes with no name requirements returns reason when pool is too small for heroCount', () => {
  const heroes = [makeHero('h1', 'Hulk'), makeHero('h2', 'Thor')];
  const requirements = { heroCount: 4, heroNameRequirements: [], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0);
  assert.ok(result.reason !== null, 'Expected reason when pool is smaller than heroCount');
  assert.equal(result.selected.length, 0);
});

test('selectHeroes accepts a preferredExpansionId and returns the requested count', () => {
  const heroes = [
    makeHero('h1', 'Hulk', [], 'core-set'),
    makeHero('h2', 'Thor', [], 'core-set'),
    makeHero('h3', 'Iron Man', [], 'dark-city'),
    makeHero('h4', 'Captain America', [], 'dark-city'),
    makeHero('h5', 'Wolverine', [], 'dark-city')
  ];
  const requirements = { heroCount: 3, heroNameRequirements: [], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0, [], 'dark-city');
  assert.equal(result.reason, null);
  assert.equal(result.selected.length, 3);
  // preferred-expansion heroes should appear first in selection order
  assert.equal(result.selected[0].setId, 'dark-city');
});

test('selectHeroes with forcedTeam returns reason when general pool cannot fill remaining slots', () => {
  // 3 X-Men heroes + 1 non-X-Men; heroCount=5 → after picking all 3 X-Men need 2 more but only 1 available
  const heroes = [
    makeHero('h1', 'Cyclops', ['X-Men']),
    makeHero('h2', 'Wolverine', ['X-Men']),
    makeHero('h3', 'Storm', ['X-Men']),
    makeHero('h4', 'Iron Man', ['Avengers'])
  ];
  const requirements = { heroCount: 5, heroNameRequirements: [], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0, [], null, 'X-Men');
  assert.ok(result.reason !== null, 'Expected reason when general pool cannot fill leftover slots after team selection');
  assert.equal(result.selected.length, 0);
});

test('selectHeroes with forcedTeam fills leftover slots from the general pool', () => {
  // 1 X-Men hero + 3 Avengers; heroCount=3 → 1 from team + 2 from general pool
  const heroes = [
    makeHero('h1', 'Cyclops', ['X-Men']),
    makeHero('h2', 'Iron Man', ['Avengers']),
    makeHero('h3', 'Thor', ['Avengers']),
    makeHero('h4', 'Captain America', ['Avengers'])
  ];
  const requirements = { heroCount: 3, heroNameRequirements: [], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0, [], null, 'X-Men');
  assert.equal(result.reason, null);
  assert.equal(result.selected.length, 3);
  assert.ok(result.selected.some((h) => h.id === 'h1'), 'X-Men hero should be included');
});

test('selectHeroes satisfies heroNameRequirements and fills remaining slots from general pool', () => {
  const heroes = [
    makeHero('h1', 'Spider-Man'),
    makeHero('h2', 'Spider-Woman'),
    makeHero('h3', 'Hulk'),
    makeHero('h4', 'Thor'),
    makeHero('h5', 'Iron Man')
  ];
  const requirements = { heroCount: 4, heroNameRequirements: [{ pattern: 'Spider', value: 2 }], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0);
  assert.equal(result.reason, null);
  assert.equal(result.selected.length, 4);
  const spiderCount = result.selected.filter((h) => /Spider/i.test(h.name)).length;
  assert.equal(spiderCount, 2, 'Should select exactly 2 Spider heroes to satisfy the name requirement');
});

test('selectHeroes returns reason when forced picks leave insufficient slots for heroNameRequirements', () => {
  // heroCount=2, forced=h2(Hulk) fills slot 1, heroNameRequirements needs 2 Spiders → requiredAdditionalMatches(2) > remainingSlots(1)
  const heroes = [makeHero('h1', 'Spider-Man'), makeHero('h2', 'Hulk')];
  const requirements = { heroCount: 2, heroNameRequirements: [{ pattern: 'Spider', value: 2 }], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0, ['h2']);
  assert.ok(result.reason !== null, 'Expected reason when forced picks block name requirements');
  assert.equal(result.selected.length, 0);
});

test('selectHeroes returns reason when heroNameRequirements matching pool is too small', () => {
  // Only 1 Spider hero in pool but requirement.value=2
  const heroes = [makeHero('h1', 'Spider-Man'), makeHero('h2', 'Hulk'), makeHero('h3', 'Thor')];
  const requirements = { heroCount: 3, heroNameRequirements: [{ pattern: 'Spider', value: 2 }], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0);
  assert.ok(result.reason !== null, 'Expected reason when matching pool has fewer heroes than the requirement');
  assert.equal(result.selected.length, 0);
});

test('selectHeroes returns reason when general pool is too small after satisfying heroNameRequirements', () => {
  // 2 Spider heroes fill the name requirement; heroCount=4 but only 1 non-Spider hero available → 1 < 2 needed
  const heroes = [makeHero('h1', 'Spider-Man'), makeHero('h2', 'Spider-Woman'), makeHero('h3', 'Hulk')];
  const requirements = { heroCount: 4, heroNameRequirements: [{ pattern: 'Spider', value: 2 }], ...BASE_REQS };
  const result = selectHeroes(heroes, requirements, undefined, () => 0);
  assert.ok(result.reason !== null, 'Expected reason when general pool cannot fill remaining slots after name requirements');
  assert.equal(result.selected.length, 0);
});
