import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let source: string;

beforeAll(async () => {
  source = await fs.readFile(
    path.join(rootDir, 'src', 'components', 'CardBrowserByCategory.svelte'),
    'utf8'
  );
});

test('CardBrowserByCategory renders a .history-group details element for each non-empty category', () => {
  assert.match(
    source,
    /<details[^>]*class="history-group"[^>]*>/,
    'Template must contain <details class="history-group"> elements'
  );
  assert.doesNotMatch(
    source,
    /<section[^>]*data-category/,
    'Template must not use <section data-category> — should use <details> instead'
  );
});

test('CardBrowserByCategory category heading references a locale key from CARD_CATEGORIES', () => {
  assert.match(
    source,
    /locale\.t\(category\.labelKey\)/,
    'Summary must reference locale.t(category.labelKey) rather than a hardcoded string'
  );
});

test('CardBrowserByCategory first group renders with the open attribute', () => {
  assert.doesNotMatch(
    source,
    /open=\{categoryIndex/,
    'Template must not use the conditional open={categoryIndex === 0} binding'
  );
  assert.match(
    source,
    /open>/,
    '<details> element must carry a bare unconditional open attribute'
  );
});

test('CardBrowserByCategory all groups render with the open attribute', () => {
  assert.doesNotMatch(
    source,
    /open=\{categoryIndex/,
    'Template must not contain open={categoryIndex === 0} — all groups should be open unconditionally'
  );
  assert.match(
    source,
    /open>/,
    'Template must contain a bare unconditional open attribute on the <details> element'
  );
});

test('CardBrowserByCategory shows available hero teams after the name in smaller italic parentheses', () => {
  assert.match(
    source,
    /<li>\s*\{card\.name\}\s*\{#if category\.categoryId === 'heroes' && getAvailableTeams\(card\)\.length > 0\}\s*\{'\s*'\}\s*<span class="hero-teams">\(\{getAvailableTeams\(card\)\.join\(', '\)\}\)<\/span>/,
    'Hero team names must follow the card name in parentheses and render only for Heroes with available teams'
  );
  assert.match(
    source,
    /\.hero-teams\s*\{[^}]*font-size:\s*0\.85em;[^}]*font-style:\s*italic;/,
    'Hero team names must be italic and smaller than the main name'
  );
});

test('CardBrowserByCategory omits missing and empty hero team values', () => {
  assert.match(
    source,
    /return card\.teams\?\.filter\(\(team\) => team\.trim\(\)\.length > 0\)\.map\(\(team\) => team\.trim\(\)\) \?\? \[\];/,
    'Missing teams and empty team names must result in no displayed team value'
  );
});

test('CardBrowserByCategory keeps non-Hero card names unchanged and limits team display to Heroes', () => {
  assert.match(
    source,
    /\{#each category\.cards as card \(card\.id\)\}\s*<li>\s*\{card\.name\}\s*\{#if category\.categoryId === 'heroes'/,
    'Every category must retain the existing card-name list rendering, with team display guarded to Heroes only'
  );
});
