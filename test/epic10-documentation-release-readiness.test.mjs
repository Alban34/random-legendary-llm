import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_TABS } from '../src/app/app-tabs.mjs';
import { STORAGE_KEY, USAGE_CATEGORIES, createDefaultState } from '../src/app/state-store.mjs';
import { SETUP_RULES, resolveSetupTemplate } from '../src/app/setup-rules.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePaths = {
  readme: path.join(rootDir, 'README.md'),
  packageJson: path.join(rootDir, 'package.json'),
  architecture: path.join(rootDir, 'documentation', 'architecture.md'),
  dataModel: path.join(rootDir, 'documentation', 'data-model.md'),
  setupRules: path.join(rootDir, 'documentation', 'setup-rules.md'),
  uiDesign: path.join(rootDir, 'documentation', 'ui-design.md'),
  taskList: path.join(rootDir, 'documentation', 'task-list.md'),
  testingStrategy: path.join(rootDir, 'documentation', 'testing-qc-strategy.md'),
  roadmap: path.join(rootDir, 'documentation', 'roadmap.md'),
  clarifications: path.join(rootDir, 'documentation', 'clarifications.md'),
  createProject: path.join(rootDir, 'documentation', 'create-project.md')
};

const docs = {};
let packageJson;

before(async () => {
  const [
    readme,
    packageJsonRaw,
    architecture,
    dataModel,
    setupRules,
    uiDesign,
    taskList,
    testingStrategy,
    roadmap,
    clarifications,
    createProject
  ] = await Promise.all([
    fs.readFile(filePaths.readme, 'utf8'),
    fs.readFile(filePaths.packageJson, 'utf8'),
    fs.readFile(filePaths.architecture, 'utf8'),
    fs.readFile(filePaths.dataModel, 'utf8'),
    fs.readFile(filePaths.setupRules, 'utf8'),
    fs.readFile(filePaths.uiDesign, 'utf8'),
    fs.readFile(filePaths.taskList, 'utf8'),
    fs.readFile(filePaths.testingStrategy, 'utf8'),
    fs.readFile(filePaths.roadmap, 'utf8'),
    fs.readFile(filePaths.clarifications, 'utf8'),
    fs.readFile(filePaths.createProject, 'utf8')
  ]);

  Object.assign(docs, {
    readme,
    architecture,
    dataModel,
    setupRules,
    uiDesign,
    taskList,
    testingStrategy,
    roadmap,
    clarifications,
    createProject
  });
  packageJson = JSON.parse(packageJsonRaw);
});

test('Epic 10 README release workflow matches the shipped scripts and no longer treats Epic 10 as future work', () => {
  assert.equal(typeof packageJson.scripts['check:epic10'], 'string');
  assert.equal(typeof packageJson.scripts['check:qc:epic10'], 'string');
  assert.equal(typeof packageJson.scripts['check:qc'], 'string');

  assert.match(docs.readme, /Epic 10 .*release readiness.*complete/i);
  assert.match(docs.readme, /npm run check:epic10/);
  assert.match(docs.readme, /npm run check:qc:epic10/);
  assert.match(docs.readme, /npm run check:qc/);
  assert.match(docs.readme, /legendary_state_v1/);
  assert.doesNotMatch(docs.readme, /next major implementation target is \*\*Epic 10/i);
});

test('Epic 10 architecture and data-model docs describe the shipped runtime layers, tabs, and persisted root state', () => {
  const defaultState = createDefaultState();

  assert.match(docs.architecture, /static HTTP server/i);
  assert.match(docs.architecture, new RegExp(STORAGE_KEY));
  assert.match(docs.architecture, /createEpic1Bundle/);
  assert.match(docs.architecture, /browser-entry\.mjs/);
  assert.match(docs.architecture, /app-renderer\.mjs/);

  assert.match(docs.dataModel, new RegExp(`"${STORAGE_KEY}"|${STORAGE_KEY}`));
  assert.match(docs.dataModel, /lastPlayerCount/);
  assert.match(docs.dataModel, /lastAdvancedSolo/);
  assert.match(docs.dataModel, /lastPlayMode/);
  assert.match(docs.dataModel, /selectedTab/);
  assert.match(docs.dataModel, /GameRecord/);
  assert.match(docs.dataModel, /Generate\/Regenerate remain ephemeral/i);

  assert.deepEqual(Object.keys(defaultState.usage), USAGE_CATEGORIES);
  APP_TABS.forEach((tab) => {
    assert.match(docs.architecture, new RegExp(tab.id));
  });

  assert.match(docs.uiDesign, /theme and locale/i);
  assert.match(docs.uiDesign, /5 equal-width items/i);
  assert.match(docs.uiDesign, /first-run walkthrough/i);
  assert.match(docs.uiDesign, /Accept & Log/i);
  assert.match(docs.uiDesign, /Forced Picks/i);
  assert.match(docs.uiDesign, /pending and completed results/i);
  assert.match(docs.uiDesign, /Desktop: visible below grouped records/i);
  assert.match(docs.uiDesign, /Mobile: collapsed behind a reveal button/i);
});

test('Epic 10 setup-rules documentation matches the runtime setup templates and acceptance behavior', () => {
  const expectedRows = [
    { playerCount: 1, advancedSolo: false },
    { playerCount: 1, advancedSolo: true },
    { playerCount: 1, playMode: 'two-handed-solo' },
    { playerCount: 2, advancedSolo: false },
    { playerCount: 3, advancedSolo: false },
    { playerCount: 4, advancedSolo: false },
    { playerCount: 5, advancedSolo: false }
  ].map(({ playerCount, advancedSolo, playMode }) => {
    const template = resolveSetupTemplate(playerCount, { advancedSolo, playMode });
    return `| ${template.playerCount} | ${template.modeLabel} | ${template.heroCount} | ${template.villainGroupCount} | ${template.henchmanGroupCount} | ${template.wounds} |`;
  });

  expectedRows.forEach((row) => {
    assert.ok(docs.setupRules.includes(row), `Missing setup-rules row: ${row}`);
  });

  assert.equal(Object.keys(SETUP_RULES).length, 7);
  assert.match(docs.setupRules, /Advanced Solo is only available in 1-player mode/);
  assert.match(docs.setupRules, /Two-Handed Solo uses the standard 2-player setup counts/);
  assert.match(docs.setupRules, /Generate \/ Regenerate/);
  assert.match(docs.setupRules, /Accept & Log/);
  assert.match(docs.setupRules, /updates usage stats/i);
  assert.match(docs.setupRules, /appends a `GameRecord` to history/);
});

test('Epic 10 final documentation files are marked complete and historical planning docs are framed as archival references', () => {
  const epic10Section = docs.taskList.split('## Epic 10 — Final Documentation and Release Readiness')[1];
  assert.ok(epic10Section, 'Epic 10 section is missing from task-list.md');
  assert.equal(/- \[ \]/.test(epic10Section), false, 'Epic 10 still contains unchecked tasks.');

  assert.match(docs.testingStrategy, /## Epic 10 — Final Documentation and Release Readiness/);
  assert.match(docs.testingStrategy, /test\/epic10-documentation-release-readiness\.test\.mjs/);
  assert.match(docs.testingStrategy, /test\/playwright\/epic10-qc\.spec\.mjs/);
  assert.match(docs.testingStrategy, /Current automated browser QC command for Epic 1–10/);
  assert.match(docs.testingStrategy, /npm run check:qc:epic10/);

  assert.match(docs.roadmap, /Documentation .*Release Readiness/i);
  assert.match(docs.roadmap, /README matches shipped behavior/i);
  assert.match(docs.roadmap, /future enhancements/i);
  assert.match(docs.roadmap, /Historical note/i);
  assert.match(docs.roadmap, /current shipped UX baseline/i);

  assert.match(docs.taskList, /Historical note/i);
  assert.match(docs.taskList, /current shipped UX contract/i);

  assert.match(docs.clarifications, /Historical note/i);
  assert.match(docs.createProject, /Historical note/i);
});

