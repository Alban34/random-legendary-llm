import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let shellCss;
let rendererSource;
let appSvelteSource;
let uiDesignDoc;
let stylingArchitectureDoc;
let testingStrategyDoc;
let adoptionPlanDoc;

before(async () => {
  const [css, renderer, appSvelte, uiDesign, stylingArchitecture, testingStrategy, adoptionPlan] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-shell.css'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'ui-design.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'styling-architecture.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'testing-qc-strategy.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'design-system-adoption-plan.md'), 'utf8')
  ]);

  shellCss = css;
  rendererSource = renderer;
  appSvelteSource = appSvelte;
  uiDesignDoc = uiDesign;
  stylingArchitectureDoc = stylingArchitecture;
  testingStrategyDoc = testingStrategy;
  adoptionPlanDoc = adoptionPlan;
});

test('Design system rollout ships governed typography roles and tokenized shell primitives', () => {
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

test('Design system rollout adds reduced-motion and focus-restoration guardrails', () => {
  assert.match(shellCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(shellCss, /\.button:hover,[\s\S]*\.set-card:hover,[\s\S]*\.collection-row:hover\s*\{[\s\S]*transform:\s*none;/);
  assert.match(shellCss, /\.collection-row:focus-within,[\s\S]*\.history-item:focus-within,[\s\S]*\.history-group:focus-within/);
  assert.match(rendererSource, /role="alert"[\s\S]*data-result-form-error/);

  assert.match(appSvelteSource, /function focusSelector\(selector\)/);
  assert.match(appSvelteSource, /focusSelector\(`\[data-action="set-theme"\]\[data-theme-id="\$\{normalizedThemeId\}"\]`\);/);
  assert.match(appSvelteSource, /focusSelector\('#header-locale-select'\);/);
  assert.match(appSvelteSource, /focusSelector[\s\S]*?\[data-action="select-tab"\]\[data-tab-id="\$\{normalizeSelectedTab\(tabId\)\}"\]\[aria-selected="true"\]/);
});

test('Design system rollout keeps screen-level docs and planning aligned with the canonical contract', () => {
  assert.match(uiDesignDoc, /The current supported themes are:[\s\S]*`dark`[\s\S]*`light`/);
  assert.match(uiDesignDoc, /Use `documentation\/design-system\.md` as the canonical source/);
  assert.match(stylingArchitectureDoc, /documentation\/design-system-adoption-plan\.md/);
  assert.match(testingStrategyDoc, /## Design System Epic DS2 — Typography, Layout, and Shell Rhythm/);
  assert.match(testingStrategyDoc, /test\/design-system-rollout\.test\.mjs/);
  assert.match(testingStrategyDoc, /test\/playwright\/epic18-qc\.spec\.mjs/);

  for (const screen of ['Browse', 'Collection', 'New Game', 'History', 'Backup']) {
    assert.match(adoptionPlanDoc, new RegExp(`### ${screen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }

  assert.match(adoptionPlanDoc, /Shared shell and primitives first/);
  assert.match(adoptionPlanDoc, /Manual review still required/);
  assert.match(rendererSource, /class="page-flow stack gap-md"/);
  assert.match(rendererSource, /class="panel-copy"/);
});