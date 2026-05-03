import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const dataPath = path.join(process.cwd(), 'src', 'data', 'canonical-game-data.json');

let gameDataSource;

beforeAll(async () => {
  gameDataSource = await fs.readFile(dataPath, 'utf8');
});

// From epic22 — Catalog ordering

test('Villains is classified as base in canonical-game-data.json', () => {

  assert.match(gameDataSource, /"Villains"[\s\S]{0,60}"type": "base"/);
});

test('Villains is NOT classified as standalone in canonical-game-data.json', () => {

  assert.doesNotMatch(gameDataSource, /"Villains"[\s\S]{0,60}"type": "standalone"/);
});

test('Revelations is now classified as small-expansion (standalone type retired)', () => {

  assert.match(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "standalone"/);
});

// From epic26 — Classification corrections

test('Core Set is classified as base in canonical-game-data.json', () => {

  assert.match(gameDataSource, /"Core Set"[\s\S]{0,60}"type": "base"/);
});

test('S.H.I.E.L.D. is reclassified as small-expansion', () => {

  assert.match(gameDataSource, /"S\.H\.I\.E\.L\.D\."[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"S\.H\.I\.E\.L\.D\."[\s\S]{0,60}"type": "large-expansion"/);
});

test('Venom is reclassified as small-expansion', () => {

  assert.match(gameDataSource, /"Venom"[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"Venom"[\s\S]{0,60}"type": "large-expansion"/);
});

test('Revelations is classified as small-expansion (not standalone)', () => {

  assert.match(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "small-expansion"/);
  assert.doesNotMatch(gameDataSource, /"Revelations"[\s\S]{0,60}"type": "standalone"/);
});

test('No set remains classified as standalone', () => {

  assert.doesNotMatch(gameDataSource, /"type": "standalone"/);
});
