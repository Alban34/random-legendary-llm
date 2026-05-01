import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEpic1Bundle } from '../src/app/game-data-pipeline.ts';
import { createDefaultState } from '../src/app/state-store.ts';
import { generateSetup } from '../src/app/setup-generator.ts';
import { getSoloRulesItems } from '../src/app/solo-rules.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const seedPath = path.join(rootDir, 'src', 'data', 'canonical-game-data.json');

let bundle;
let leadMastermind;

function createAllOwnedState() {
  const state = createDefaultState();
  state.collection.ownedSetIds = bundle.runtime.sets.map((set) => set.id);
  return state;
}

beforeAll(async () => {
  const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
  bundle = createEpic1Bundle(seed);
  leadMastermind = bundle.runtime.indexes.allMasterminds.find((m) => m.lead != null);
  assert.ok(leadMastermind, 'Test prerequisite: at least one mastermind with a lead must exist in the data');
});

// ── Story 1: Generator suppression — lead entity NOT forced in solo modes ──

test('Story 1: standard solo (playerCount=1) does not force the mastermind lead', () => {
  const state = createAllOwnedState();
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  if (setup.mastermind.id !== leadMastermind.id) return; // mastermind not selected; skip assertion
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    !groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} NOT to be a forced group in standard solo`
  );
});

test('Story 1: advanced-solo does not force the mastermind lead', () => {
  const state = createAllOwnedState();
  // Force the lead mastermind to be selected by marking all others as recently used
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'advanced-solo', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  assert.equal(setup.mastermind.id, leadMastermind.id);
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    !groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} NOT to be a forced group in advanced-solo`
  );
});

test('Story 1: two-handed-solo does not force the mastermind lead', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'two-handed-solo', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  assert.equal(setup.mastermind.id, leadMastermind.id);
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    !groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} NOT to be a forced group in two-handed-solo`
  );
});

test('Story 1: standard-solo-v2 does not force the mastermind lead', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard-solo-v2', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  assert.equal(setup.mastermind.id, leadMastermind.id);
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    !groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} NOT to be a forced group in standard-solo-v2`
  );
});

test('Story 1 regression: non-solo (playerCount=2) DOES force the mastermind lead', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, playMode: 'standard', random: () => 0 });
  const leadId = leadMastermind.lead.id;
  const category = leadMastermind.lead.category;
  assert.equal(setup.mastermind.id, leadMastermind.id);
  const groups = category === 'villains' ? setup.villainGroups : setup.henchmanGroups;
  assert.ok(
    groups.some((g) => g.forced === true && g.id === leadId),
    `Expected lead ${leadId} to be a forced group in non-solo (2-player standard)`
  );
});

// ── Story 2: leadEntity suppression ──────────────────────────────────────────

test('Story 2: standard solo (playerCount=1) sets leadEntity to null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: advanced-solo sets leadEntity to null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'advanced-solo', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: two-handed-solo sets leadEntity to null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'two-handed-solo', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2: standard-solo-v2 sets leadEntity to null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 1, playMode: 'standard-solo-v2', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.equal(setup.mastermind.leadEntity, null);
});

test('Story 2 regression: non-solo (playerCount=2) leadEntity is non-null', () => {
  const state = createAllOwnedState();
  const allMasterminds = bundle.runtime.indexes.allMasterminds;
  allMasterminds.forEach((m, index) => {
    if (m.id !== leadMastermind.id) {
      state.usage.masterminds[m.id] = {
        plays: 1,
        lastPlayedAt: `2026-04-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`
      };
    }
  });
  const setup = generateSetup({ runtime: bundle.runtime, state, playerCount: 2, playMode: 'standard', random: () => 0 });
  assert.equal(setup.mastermind.id, leadMastermind.id);
  assert.notEqual(setup.mastermind.leadEntity, null);
});

// ── Story 3: Solo rules keys — alwaysLeads removed ───────────────────────────

test('Story 3: getSoloRulesItems("standard") does not include the alwaysLeads key', () => {
  const items = getSoloRulesItems('standard');
  assert.ok(Array.isArray(items));
  assert.ok(
    !items.includes('newGame.soloRules.standard.alwaysLeads'),
    'alwaysLeads key must not appear in standard solo rules'
  );
});

test('Story 3: getSoloRulesItems("advanced-solo") does not include the alwaysLeads key', () => {
  const items = getSoloRulesItems('advanced-solo');
  assert.ok(Array.isArray(items));
  assert.ok(
    !items.includes('newGame.soloRules.advancedSolo.alwaysLeads'),
    'alwaysLeads key must not appear in advanced-solo rules'
  );
});

test('Story 3: getSoloRulesItems("standard-solo-v2") does not include the alwaysLeads key', () => {
  const items = getSoloRulesItems('standard-solo-v2');
  assert.ok(Array.isArray(items));
  assert.ok(
    !items.includes('newGame.soloRules.standardV2.alwaysLeads'),
    'alwaysLeads key must not appear in standard-solo-v2 rules'
  );
});
