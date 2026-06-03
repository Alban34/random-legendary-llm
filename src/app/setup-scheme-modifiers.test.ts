import { test } from 'vitest';
import assert from 'node:assert/strict';
import { applyModifier, applySchemeModifiersToTemplate } from './setup-scheme-modifiers.ts';
import { resolveSetupTemplate } from './setup-rules.ts';
import type { SchemeRequirements } from './setup-scheme-modifiers.ts';

test('applySchemeModifiersToTemplate covers conditional, require-hero-name-match-count, and default modifier types', () => {

  const template = resolveSetupTemplate(2, {});
  const craftedScheme = {
    id: 'coverage-scheme',
    setId: 'test',
    name: 'Coverage Scheme',
    aliases: [],
    constraints: { minimumPlayerCount: null },
    forcedGroups: [],
    notes: [],
    modifiers: [
      // conditional-add-villain-group: playerCounts includes playerCount (if true) + truthy amount
      { type: 'conditional-add-villain-group', playerCounts: [2], amount: 1 },
      // conditional-add-villain-group: playerCounts doesn't include playerCount (if false)
      { type: 'conditional-add-villain-group', playerCounts: [3], amount: 1 },
      // conditional-add-villain-group: no playerCounts property (|| [] falsy side)
      { type: 'conditional-add-villain-group' },
      // conditional-add-villain-group: if true, falsy amount (|| 0 falsy side)
      { type: 'conditional-add-villain-group', playerCounts: [2], amount: 0 },
      // conditional-set-min-heroes: playerCounts includes playerCount + truthy value
      { type: 'conditional-set-min-heroes', playerCounts: [2], value: 10 },
      // conditional-set-min-heroes: playerCounts doesn't include playerCount
      { type: 'conditional-set-min-heroes', playerCounts: [3], value: 10 },
      // conditional-set-min-heroes: no playerCounts (|| [] falsy side)
      { type: 'conditional-set-min-heroes' },
      // conditional-set-min-heroes: if true, falsy value (|| 0 falsy side)
      { type: 'conditional-set-min-heroes', playerCounts: [2], value: 0 },
      // require-hero-name-match-count (switch case 8)
      { type: 'require-hero-name-match-count', pattern: 'Spider', value: 2 },
      // unknown modifier type (default case)
      { type: 'no-op-unknown-type-for-coverage' },
      // add-hero with falsy amount (|| 0 branch)
      { type: 'add-hero', amount: 0 },
      // add-villain-group with falsy amount
      { type: 'add-villain-group', amount: 0 },
      // add-henchman-group with falsy amount
      { type: 'add-henchman-group', amount: 0 },
      // set-min-heroes with falsy value
      { type: 'set-min-heroes', value: 0 },
      // set-bystanders with no value (undefined ?? takes requirements.bystanders)
      { type: 'set-bystanders' }
    ]
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requirements = applySchemeModifiersToTemplate(template, craftedScheme as any);
  assert.ok(requirements.heroNameRequirements.some((r) => r.pattern === 'Spider'), 'heroNameRequirements should include Spider pattern');
  assert.ok(requirements.villainGroupCount >= template.villainGroupCount, 'villainGroupCount should be at least the template base');

  // Also covers the scheme.modifiers || [] falsy branch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nullModifiersResult = applySchemeModifiersToTemplate(template, { modifiers: null } as any);
  assert.equal(nullModifiersResult.heroCount, template.heroCount);
});

// ---------------------------------------------------------------------------
// Story 105.1 — conditional-add-hero
// ---------------------------------------------------------------------------

function makeRequirements(heroCount = 0): SchemeRequirements {
  return {
    heroCount,
    villainGroupCount: 0,
    henchmanGroupCount: 0,
    wounds: 0,
    bystanders: 30,
    heroNameRequirements: []
  };
}

test('conditional-add-hero increments heroCount when playerCount is in playerCounts', () => {
  const reqs = makeRequirements(3);
  applyModifier(reqs, { type: 'conditional-add-hero', playerCounts: [4, 5], amount: 1 }, 4);
  assert.equal(reqs.heroCount, 4);
});

test('conditional-add-hero does not increment heroCount when playerCount is not in playerCounts', () => {
  const reqs = makeRequirements(3);
  applyModifier(reqs, { type: 'conditional-add-hero', playerCounts: [4, 5], amount: 1 }, 3);
  assert.equal(reqs.heroCount, 3);
});

// ---------------------------------------------------------------------------
// Story 105.2 — Secret Invasion and Enslave Minds data-driven checks
// ---------------------------------------------------------------------------

test('Secret Invasion of the Skrull Shapeshifters: set-min-heroes 6 and add-hero 1 applied correctly', () => {
  const template = resolveSetupTemplate(2, {});
  const scheme = {
    modifiers: [
      { type: 'set-min-heroes', value: 6 },
      { type: 'add-hero', amount: 1 }
    ]
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = applySchemeModifiersToTemplate(template, scheme as any);
  // set-min-heroes 6: heroCount >= 6
  assert.ok(result.heroCount >= 6, 'heroCount should be at least 6 after set-min-heroes:6');
  // add-hero 1: heroCount is one more than what set-min-heroes alone would produce
  const baseAfterMinHeroes = Math.max(template.heroCount, 6);
  assert.equal(result.heroCount, baseAfterMinHeroes + 1, 'heroCount should be baseAfterMinHeroes + 1 from add-hero');
});

test('Enslave Minds with the Chitauri Scepter: set-min-heroes 6 and add-hero 1 applied correctly', () => {
  const template = resolveSetupTemplate(2, {});
  const scheme = {
    modifiers: [
      { type: 'set-min-heroes', value: 6 },
      { type: 'add-hero', amount: 1 }
    ]
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = applySchemeModifiersToTemplate(template, scheme as any);
  assert.ok(result.heroCount >= 6, 'heroCount should be at least 6 after set-min-heroes:6');
  const baseAfterMinHeroes = Math.max(template.heroCount, 6);
  assert.equal(result.heroCount, baseAfterMinHeroes + 1, 'heroCount should be baseAfterMinHeroes + 1 from add-hero');
});
