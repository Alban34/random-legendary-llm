import { test, beforeAll } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

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

test('index.html uses legacyThemeIdAliases and supportedThemeIds for theme initialization', () => {

  assert.match(indexHtmlDoc, /legacyThemeIdAliases/);
  assert.match(indexHtmlDoc, /supportedThemeIds = new Set\(\['dark', 'light'\]\)/);
});

// ── From design-system-rollout (app-shell.css typography assertions) ─────────

test('Ships governed typography roles and tokenized shell primitives', () => {

  for (const selector of ['.display-lg', '.display-md', '.heading-lg', '.heading-md', '.body-lg', '.body-md', '.body-sm', '.label']) {
    assert.match(shellCss, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(shellCss, /\.app-header h1\s*\{[\s\S]*font-family:\s*var\(--font-heading\);/);
  assert.match(shellCss, /\.panel\s*\{[\s\S]*border-radius:\s*var\(--radius-lg\);[\s\S]*box-shadow:\s*var\(--shadow-panel\);[\s\S]*padding:\s*var\(--space-5\);/);
  assert.match(shellCss, /\.summary-card\s*\{[\s\S]*border-radius:\s*var\(--radius-md\);[\s\S]*padding:\s*var\(--space-4\);/);
  assert.match(shellCss, /\.result-card\s*\{[\s\S]*border-radius:\s*var\(--radius-md\);[\s\S]*padding:\s*var\(--space-4\);/);
  assert.match(shellCss, /\.button\s*\{[\s\S]*min-height:\s*2\.75rem;[\s\S]*border-radius:\s*var\(--radius-pill\);/);
  assert.match(shellCss, /\.text-input\s*\{[\s\S]*border-radius:\s*var\(--radius-md\);[\s\S]*min-height:\s*2\.875rem;/);
});

test('Adds reduced-motion and focus-restoration guardrails in app-shell.css', () => {

  assert.match(shellCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(shellCss, /\.button:hover,[\s\S]*\.set-card:hover,[\s\S]*\.collection-row:hover\s*\{[\s\S]*transform:\s*none;/);
  assert.match(shellCss, /\.collection-row:focus-within,[\s\S]*\.history-item:has\(:focus-visible\),[\s\S]*\.history-group:has\(:focus-visible\)/);
});

// ── Epic 83 — Story 83.1 ──

test('Forced Picks pickers grid class is present in stylesheet', () => {
  assert.match(shellCss, /\.forced-picks-pickers-grid/);
});

test('Forced Picks CSS rules contain no hardcoded hex colour values', () => {
  const forcedPicksBlock = shellCss.match(/\.forced-pick[\s\S]*?(?=\.button\s*\{)/)?.[0] ?? '';
  assert.doesNotMatch(forcedPicksBlock, /#[0-9a-fA-F]{3,6}/);
});

test('Layout fix adds [data-forced-picks-panel] rule with min-width: 0 and no hardcoded values', () => {
  assert.match(shellCss, /\[data-forced-picks-panel\][\s\S]*?\{[\s\S]*?min-width:\s*0/);
  const panelRule = shellCss.match(/\[data-forced-picks-panel\]\s*\{[^}]*\}/)?.[0] ?? '';
  assert.doesNotMatch(panelRule, /#[0-9a-fA-F]{3,6}/);
});

// ── Epic 83 — Story 83.3 ──

test('Forced pick select rule contains token-based visual properties', () => {
  const selectRule = shellCss.match(/\.forced-pick-picker-row > select\s*\{[^}]*\}/)?.[0] ?? '';
  assert.ok(selectRule.length > 0, '.forced-pick-picker-row > select rule must exist');
  assert.match(selectRule, /var\(--[a-zA-Z-]+\)/);
});

test('Forced pick select rule contains no hardcoded hex colour', () => {
  const selectRule = shellCss.match(/\.forced-pick-picker-row > select\s*\{[^}]*\}/)?.[0] ?? '';
  assert.doesNotMatch(selectRule, /#[0-9a-fA-F]{3,6}/);
});

test('Forced pick select focus-visible rule references var(--border-focus)', () => {
  assert.match(shellCss, /\.forced-pick-picker-row > select:focus-visible[\s\S]*?var\(--border-focus\)/);
});
