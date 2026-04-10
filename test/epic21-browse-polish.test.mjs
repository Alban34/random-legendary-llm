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
let postV1Epics;
let postV1TaskList;
let nextSteps;

before(async () => {
  [indexHtml, rendererSource, postV1Epics, postV1TaskList, nextSteps] = await Promise.all([
    fs.readFile(path.join(rootDir, 'index.html'), 'utf8'),
    fs.readFile(path.join(rootDir, 'src', 'app', 'app-renderer.mjs'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'post-v1-epics.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', 'post-v1-task-list.md'), 'utf8'),
    fs.readFile(path.join(rootDir, 'documentation', '_next-steps.md'), 'utf8')
  ]);
});

test('Epic 21 moves the onboarding shell above the tab panels and removes the low-value Ready Tabs metric', () => {
  assert.match(indexHtml, /<section class="stack gap-md" id="diagnostics-shell"><\/section>[\s\S]*<div class="tab-panel-shell">/);
  assert.doesNotMatch(rendererSource, /Ready Tabs/);
  assert.match(rendererSource, /data-browse-help-disclosure/);
  assert.match(rendererSource, /data-browse-primary-cta/);
  assert.match(rendererSource, /data-browse-sets-panel/);
  assert.match(rendererSource, /browse-panel-full-width/);
});

test('Epic 21 is documented in the post-v1 backlog and clears the matching next-step items', () => {
  assert.match(postV1Epics, /## Epic 21 — Browse and Onboarding Detail Polish/);
  assert.match(postV1TaskList, /## Epic 21 — Browse and Onboarding Detail Polish/);
  assert.match(nextSteps, /- \[x\] Move the "Get comfortable with the app in under a minute" on top/);
  assert.match(nextSteps, /- \[x\] "Browse sets" should be full width/);
  assert.match(nextSteps, /- \[x\] "Ready Tabs" is not a relevant information, you should remove it/);
});
