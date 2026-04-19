import test from 'node:test';
import assert from 'node:assert/strict';

import { getSoloRulesItems, SOLO_RULES_PANEL_MODES } from '../src/app/solo-rules.mjs';
import { EN_MESSAGES } from '../src/app/locales/en.mjs';

// ── Story 1: Content model ────────────────────────────────────────────────────

test('Epic 57.1 getSoloRulesItems returns exactly 4 keys for standard mode', () => {
  const items = getSoloRulesItems('standard');
  assert.equal(Array.isArray(items), true);
  assert.equal(items.length, 4);
  assert.ok(items.every((key) => key.startsWith('newGame.soloRules.standard.')));
});

test('Epic 57.1 getSoloRulesItems returns exactly 5 keys for advanced-solo mode', () => {
  const items = getSoloRulesItems('advanced-solo');
  assert.equal(Array.isArray(items), true);
  assert.equal(items.length, 5);
  assert.ok(items.every((key) => key.startsWith('newGame.soloRules.advancedSolo.')));
});

test('Epic 57.1 getSoloRulesItems returns exactly 6 keys for standard-solo-v2 mode', () => {
  const items = getSoloRulesItems('standard-solo-v2');
  assert.equal(Array.isArray(items), true);
  assert.equal(items.length, 6);
  assert.ok(items.every((key) => key.startsWith('newGame.soloRules.standardV2.')));
});

test('Epic 57.1 getSoloRulesItems returns null for two-handed-solo', () => {
  assert.equal(getSoloRulesItems('two-handed-solo'), null);
});

test('Epic 57.1 getSoloRulesItems returns null for unknown modes', () => {
  assert.equal(getSoloRulesItems('standard-2p'), null);
  assert.equal(getSoloRulesItems(''), null);
  assert.equal(getSoloRulesItems(undefined), null);
});

test('Epic 57.1 SOLO_RULES_PANEL_MODES does not include two-handed-solo', () => {
  assert.equal(SOLO_RULES_PANEL_MODES.has('two-handed-solo'), false);
});

test('Epic 57.1 SOLO_RULES_PANEL_MODES includes standard', () => {
  assert.equal(SOLO_RULES_PANEL_MODES.has('standard'), true);
});

test('Epic 57.1 SOLO_RULES_PANEL_MODES includes standard-solo-v2', () => {
  assert.equal(SOLO_RULES_PANEL_MODES.has('standard-solo-v2'), true);
});

test('Epic 57.1 getSoloRulesItems key order matches specification for standard', () => {
  const items = getSoloRulesItems('standard');
  assert.equal(items[0], 'newGame.soloRules.standard.villainDeck');
  assert.equal(items[1], 'newGame.soloRules.standard.schemeTwist');
  assert.equal(items[2], 'newGame.soloRules.standard.eachOtherPlayer');
  assert.equal(items[3], 'newGame.soloRules.standard.alwaysLeads');
});

test('Epic 57.1 getSoloRulesItems key order matches specification for advanced-solo', () => {
  const items = getSoloRulesItems('advanced-solo');
  assert.equal(items[0], 'newGame.soloRules.advancedSolo.villainDeck');
  assert.equal(items[1], 'newGame.soloRules.advancedSolo.masterStrike');
  assert.equal(items[2], 'newGame.soloRules.advancedSolo.schemeTwist');
  assert.equal(items[3], 'newGame.soloRules.advancedSolo.eachOtherPlayer');
  assert.equal(items[4], 'newGame.soloRules.advancedSolo.alwaysLeads');
});

test('Epic 57.1 getSoloRulesItems key order matches specification for standard-solo-v2', () => {
  const items = getSoloRulesItems('standard-solo-v2');
  assert.equal(items[0], 'newGame.soloRules.standardV2.villainDeck');
  assert.equal(items[1], 'newGame.soloRules.standardV2.firstTurnHenchmen');
  assert.equal(items[2], 'newGame.soloRules.standardV2.schemeTwist');
  assert.equal(items[3], 'newGame.soloRules.standardV2.eachOtherPlayer');
  assert.equal(items[4], 'newGame.soloRules.standardV2.mastermindAbility');
  assert.equal(items[5], 'newGame.soloRules.standardV2.alwaysLeads');
});

// ── Story 2: Reactive panel logic (simulated $derived computation) ────────────

function computeSoloRulesItems(currentSetup, selectedPlayerCount, selectedPlayMode) {
  return currentSetup && selectedPlayerCount === 1 && SOLO_RULES_PANEL_MODES.has(selectedPlayMode)
    ? getSoloRulesItems(selectedPlayMode)
    : null;
}

test('Epic 57.2 soloRulesItems is null when currentSetup is null (panel absent before generate)', () => {
  const result = computeSoloRulesItems(null, 1, 'standard');
  assert.equal(result, null);
});

test('Epic 57.2 soloRulesItems is non-null after generating with 1P Standard Solo', () => {
  const fakeSetup = { template: { playMode: 'standard' } };
  const result = computeSoloRulesItems(fakeSetup, 1, 'standard');
  assert.notEqual(result, null);
  assert.equal(result.length, 4);
});

test('Epic 57.2 soloRulesItems is non-null after generating with 1P Advanced Solo', () => {
  const fakeSetup = { template: { playMode: 'advanced-solo' } };
  const result = computeSoloRulesItems(fakeSetup, 1, 'advanced-solo');
  assert.notEqual(result, null);
  assert.equal(result.length, 5);
});

test('Epic 57.2 soloRulesItems is non-null after generating with 1P Standard v2', () => {
  const fakeSetup = { template: { playMode: 'standard-solo-v2' } };
  const result = computeSoloRulesItems(fakeSetup, 1, 'standard-solo-v2');
  assert.notEqual(result, null);
  assert.equal(result.length, 6);
});

test('Epic 57.2 soloRulesItems is null for two-handed-solo (panel absent)', () => {
  const fakeSetup = { template: { playMode: 'two-handed-solo' } };
  const result = computeSoloRulesItems(fakeSetup, 1, 'two-handed-solo');
  assert.equal(result, null);
});

test('Epic 57.2 soloRulesItems is null for 2P standard (panel absent for multiplayer mode)', () => {
  const fakeSetup = { template: { playMode: 'standard' } };
  const result = computeSoloRulesItems(fakeSetup, 2, 'standard');
  assert.equal(result, null);
});

// ── Story 2: Locale content verification ─────────────────────────────────────

test('Epic 57.2 Standard Solo keys do not overlap with Advanced Solo or Standard v2 keys', () => {
  const standardKeys = new Set(getSoloRulesItems('standard'));
  const advancedKeys = getSoloRulesItems('advanced-solo');
  const v2Keys = getSoloRulesItems('standard-solo-v2');

  for (const key of advancedKeys) {
    assert.equal(standardKeys.has(key), false, `Advanced Solo key "${key}" must not appear in Standard keys`);
  }
  for (const key of v2Keys) {
    assert.equal(standardKeys.has(key), false, `Standard v2 key "${key}" must not appear in Standard keys`);
  }
});

test('Epic 57.2 Advanced Solo locale includes Master Strike cascade rule text', () => {
  const masterStrikeText = EN_MESSAGES['newGame.soloRules.advancedSolo.masterStrike'];
  assert.ok(typeof masterStrikeText === 'string' && masterStrikeText.length > 0);
  assert.match(masterStrikeText, /Master Strike/i);
  assert.match(masterStrikeText, /play another card/i);
});

// ── Story 3b: EN_MESSAGES locale key presence ────────────────────────────────

test('Epic 57.3 EN_MESSAGES contains all 17 solo rules locale keys', () => {
  const expectedKeys = [
    'newGame.soloRules.sectionTitle',
    'newGame.soloRules.standard.villainDeck',
    'newGame.soloRules.standard.schemeTwist',
    'newGame.soloRules.standard.eachOtherPlayer',
    'newGame.soloRules.standard.alwaysLeads',
    'newGame.soloRules.advancedSolo.villainDeck',
    'newGame.soloRules.advancedSolo.masterStrike',
    'newGame.soloRules.advancedSolo.schemeTwist',
    'newGame.soloRules.advancedSolo.eachOtherPlayer',
    'newGame.soloRules.advancedSolo.alwaysLeads',
    'newGame.soloRules.standardV2.villainDeck',
    'newGame.soloRules.standardV2.firstTurnHenchmen',
    'newGame.soloRules.standardV2.schemeTwist',
    'newGame.soloRules.standardV2.eachOtherPlayer',
    'newGame.soloRules.standardV2.mastermindAbility',
    'newGame.soloRules.standardV2.alwaysLeads'
  ];
  for (const key of expectedKeys) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(EN_MESSAGES, key),
      `Expected EN_MESSAGES to have key: ${key}`
    );
    assert.ok(
      typeof EN_MESSAGES[key] === 'string' && EN_MESSAGES[key].length > 0,
      `Expected EN_MESSAGES["${key}"] to be a non-empty string`
    );
  }
});

test('Epic 57.3 every getSoloRulesItems key for all three modes resolves in EN_MESSAGES', () => {
  for (const mode of ['standard', 'advanced-solo', 'standard-solo-v2']) {
    const keys = getSoloRulesItems(mode);
    for (const key of keys) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(EN_MESSAGES, key),
        `Mode "${mode}": key "${key}" is missing from EN_MESSAGES`
      );
    }
  }
});
