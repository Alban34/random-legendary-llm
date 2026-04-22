import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let indexHtml;
let rendererSource;
let browseTabSource;

before(async () => {
  [indexHtml, rendererSource, browseTabSource] = await Promise.all([
    fs.readFile(path.join(rootDir, 'src', 'components', 'App.svelte'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.ts'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'components', 'BrowseTab.svelte'), 'utf8')
  ]);
});

test('Epic 21 moves the onboarding shell above the tab panels and removes the low-value Ready Tabs metric', () => {
  assert.match(indexHtml, /id="diagnostics-shell"[\s\S]*<div class="tab-panel-shell">/);  
  assert.doesNotMatch(rendererSource, /Ready Tabs/);
  assert.match(browseTabSource, /data-browse-help-disclosure/);
  assert.match(browseTabSource, /data-browse-primary-cta/);
  assert.match(browseTabSource, /data-browse-sets-panel/);
  assert.match(browseTabSource, /browse-panel-full-width/);
});

