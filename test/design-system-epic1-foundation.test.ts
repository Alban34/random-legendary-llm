import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_THEME_ID, THEME_OPTIONS, normalizeThemeId } from '../src/app/theme-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let shellCss;
let indexHtmlDoc;

beforeAll(async () => {
  const [css, indexHtml] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'index.html'), 'utf8')
  ]);

  shellCss = css;
  indexHtmlDoc = indexHtml;
});

test('Defines governed semantic token families in the stylesheet', () => {

  for (const token of [
    '--color-primary:',
    '--color-secondary:',
    '--color-accent:',
    '--color-background:',
    '--color-surface:',
    '--font-heading:',
    '--font-body:',
    '--font-mono:',
    '--space-4:',
    '--radius-md:',
    '--shadow-panel:',
    '--motion-base:'
  ]) {
    assert.match(shellCss, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(shellCss, /--bg:\s*var\(--color-background\);/);
  assert.match(shellCss, /--panel:\s*var\(--color-surface\);/);
  assert.match(shellCss, /--text:\s*var\(--color-text-primary\);/);
  assert.match(shellCss, /--accent:\s*var\(--color-primary\);/);
});

test('Keeps the canonical theme contract and legacy theme normalization aligned', () => {

  assert.equal(DEFAULT_THEME_ID, 'dark');
  assert.deepEqual(THEME_OPTIONS.map((theme) => theme.id), ['dark', 'light']);
  assert.equal(normalizeThemeId('midnight'), 'dark');
  assert.equal(normalizeThemeId('newsprint'), 'light');
  assert.match(indexHtmlDoc, /legacyThemeIdAliases/);
  assert.match(indexHtmlDoc, /supportedThemeIds = new Set\(\['dark', 'light'\]\)/);
});
