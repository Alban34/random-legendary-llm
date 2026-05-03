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
  assert.match(shellCss, /\.collection-row:focus-within,[\s\S]*\.history-item:focus-within,[\s\S]*\.history-group:focus-within/);
});
