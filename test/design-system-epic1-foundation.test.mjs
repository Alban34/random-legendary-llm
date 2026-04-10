import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_THEME_ID, THEME_OPTIONS, normalizeThemeId } from '../src/app/theme-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let shellCss;
let stylingArchitectureDoc;
let uiDesignDoc;
let designSystemDoc;
let testingStrategyDoc;
let indexHtmlDoc;

before(async () => {
  const [css, stylingArchitecture, uiDesign, designSystem, testingStrategy, indexHtml] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'styling-architecture.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'ui-design.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'design-system.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'testing-qc-strategy.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'index.html'), 'utf8')
  ]);

  shellCss = css;
  stylingArchitectureDoc = stylingArchitecture;
  uiDesignDoc = uiDesign;
  designSystemDoc = designSystem;
  testingStrategyDoc = testingStrategy;
  indexHtmlDoc = indexHtml;
});

test('Design System Epic DS1 defines governed semantic token families in the stylesheet', () => {
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

test('Design System Epic DS1 keeps the canonical theme contract and legacy theme normalization aligned', () => {
  assert.equal(DEFAULT_THEME_ID, 'dark');
  assert.deepEqual(THEME_OPTIONS.map((theme) => theme.id), ['dark', 'light']);
  assert.equal(normalizeThemeId('midnight'), 'dark');
  assert.equal(normalizeThemeId('newsprint'), 'light');
  assert.match(indexHtmlDoc, /legacyThemeIdAliases/);
  assert.match(indexHtmlDoc, /supportedThemeIds = new Set\(\['dark', 'light'\]\)/);
});

test('Design System Epic DS1 documentation points contributors at the governed token contract', () => {
  assert.match(stylingArchitectureDoc, /## Governed token layer/);
  assert.match(stylingArchitectureDoc, /--color-\*/);
  assert.match(stylingArchitectureDoc, /documentation\/design-system\.md/);
  assert.match(uiDesignDoc, /Canonical token definitions now live in `documentation\/design-system\.md`/);
  assert.match(designSystemDoc, /Recommended CSS custom property groups:/);
  assert.match(designSystemDoc, /--color-\*/);
  assert.match(testingStrategyDoc, /## Design System Epic DS1 — Design Token Foundation and Theme Contract/);
  assert.match(testingStrategyDoc, /test\/design-system-epic1-foundation\.test\.mjs/);
  assert.match(testingStrategyDoc, /test\/playwright\/epic18-qc\.spec\.mjs/);
});